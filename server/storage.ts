import { randomUUID } from 'crypto';
import { 
  teams, Team, InsertTeam,
  games, GameRecord, InsertGame,
  categories, Category, InsertCategory,
  questions, Question, InsertQuestion,
  users, DbUser, InsertUser,
  Game, gameSchema, DifficultyLevel, UserLevel
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

export interface IStorage {
  // Game operations
  createGame(categoryCount: number, team1Name: string, team2Name: string): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  updateGameState(id: string, state: string): Promise<Game | undefined>;
  updateCurrentTeam(id: string, teamId: number): Promise<Game | undefined>;
  updateCurrentCategory(id: string, category: string): Promise<Game | undefined>;
  updateCurrentDifficulty(id: string, difficulty: string): Promise<Game | undefined>;
  
  // Team operations
  updateTeamScore(teamId: number, score: number): Promise<Team | undefined>;
  
  // Question operations
  markQuestionAnswered(questionId: number): Promise<Question | undefined>;
  getQuestionsByCategory(categoryId: number): Promise<Question[]>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoriesByGame(gameId: string): Promise<Category[]>;
  
  // User operations
  createUser(userData: InsertUser): Promise<DbUser>;
  getUserByUsername(username: string): Promise<DbUser | undefined>;
  getUserByEmail(email: string): Promise<DbUser | undefined>;
  getUser(id: number): Promise<DbUser | undefined>;
  updateUserPoints(id: number, points: number): Promise<DbUser | undefined>;
  updateUserLevel(id: number, level: string): Promise<DbUser | undefined>;
  
  // Session store for auth
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async createUser(userData: InsertUser): Promise<DbUser> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<DbUser | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<DbUser | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async getUser(id: number): Promise<DbUser | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async updateUserPoints(id: number, points: number): Promise<DbUser | undefined> {
    const [user] = await db
      .update(users)
      .set({ points })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLevel(id: number, level: string): Promise<DbUser | undefined> {
    const [user] = await db
      .update(users)
      .set({ level })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // TODO: Implement game operations
  // Game operations - stub implementations
  async createGame(categoryCount: number, team1Name: string, team2Name: string, answerTime: number = 30, gameName?: string): Promise<Game> {
    try {
      const gameId = randomUUID();
      
      // Create teams
      const [team1] = await db
        .insert(teams)
        .values({
          name: team1Name,
          score: 0,
          gameId
        })
        .returning();
      
      const [team2] = await db
        .insert(teams)
        .values({
          name: team2Name,
          score: 0,
          gameId
        })
        .returning();
      
      // Create game record
      const [gameRecord] = await db
        .insert(games)
        .values({
          id: gameId,
          team1Id: team1.id,
          team2Id: team2.id,
          currentTeamId: team1.id,
          state: "setup",
          categoryCount,
          currentCategory: null,
          currentDifficulty: null,
          created: new Date().toISOString(),
          answer_time: answerTime,
          name: gameName
        })
        .returning();
      
      // استرجاع التصنيفات والأسئلة للعبة
      const categories = await this.getCategoriesByGame(gameId);
      
      // تجهيز كائن اللعبة الكامل
      return {
        id: gameRecord.id,
        team1: {
          id: team1.id,
          name: team1.name,
          score: team1.score
        },
        team2: {
          id: team2.id,
          name: team2.name,
          score: team2.score
        },
        currentTeamId: team1.id,
        state: gameRecord.state,
        categoryCount: gameRecord.categoryCount,
        categories: categories,
        answerTime: answerTime,
        ...(gameName && { name: gameName })
      };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  async getGame(id: string): Promise<Game | undefined> {
    try {
      // استرجاع بيانات اللعبة من قاعدة البيانات
      const [gameRecord] = await db.select().from(games).where(eq(games.id, id));
      
      if (!gameRecord) {
        return undefined;
      }
      
      // استرجاع بيانات الفرق باستخدام معرفاتهم
      const team1Id = gameRecord.team1Id as number;
      const team2Id = gameRecord.team2Id as number;
      
      const [team1Record] = await db.select().from(teams).where(eq(teams.id, team1Id));
      const [team2Record] = await db.select().from(teams).where(eq(teams.id, team2Id));
      
      if (!team1Record || !team2Record) {
        console.error(`Missing team records for game ${id}`);
        return undefined;
      }
      
      // استرجاع بيانات التصنيفات والأسئلة
      const gameCategories = await this.getCategoriesByGame(id);
      
      // إنشاء كائن اللعبة
      const game: Game = {
        id: gameRecord.id,
        state: gameRecord.state,
        team1: {
          id: team1Record.id,
          name: team1Record.name,
          score: team1Record.score
        },
        team2: {
          id: team2Record.id,
          name: team2Record.name,
          score: team2Record.score
        },
        currentTeamId: gameRecord.currentTeamId,
        categoryCount: gameRecord.categoryCount,
        categories: gameCategories,
        answerTime: gameRecord.answerTime || 30
      };
      
      // إضافة البيانات الاختيارية إذا كانت موجودة
      if (gameRecord.name) {
        game.name = gameRecord.name;
      }
      
      if (gameRecord.currentCategory) {
        game.currentCategory = gameRecord.currentCategory;
      }
      
      if (gameRecord.currentDifficulty) {
        game.currentDifficulty = gameRecord.currentDifficulty;
      }
      
      return game;
    } catch (error) {
      console.error('Error retrieving game:', error);
      throw error;
    }
  }

  async updateGameState(id: string, state: string): Promise<Game | undefined> {
    try {
      // تحديث حالة اللعبة في قاعدة البيانات
      const [updatedGame] = await db
        .update(games)
        .set({ state })
        .where(eq(games.id, id))
        .returning();
      
      if (!updatedGame) {
        return undefined;
      }
      
      // استرجاع اللعبة المحدثة بالكامل
      return await this.getGame(id);
    } catch (error) {
      console.error('Error updating game state:', error);
      throw error;
    }
  }

  async updateCurrentTeam(id: string, teamId: number): Promise<Game | undefined> {
    try {
      // تحديث الفريق الحالي في اللعبة
      const [updatedGame] = await db
        .update(games)
        .set({ currentTeamId: teamId })
        .where(eq(games.id, id))
        .returning();
      
      if (!updatedGame) {
        return undefined;
      }
      
      // استرجاع اللعبة المحدثة بالكامل
      return await this.getGame(id);
    } catch (error) {
      console.error('Error updating current team:', error);
      throw error;
    }
  }

  async updateCurrentCategory(id: string, category: string): Promise<Game | undefined> {
    try {
      // تحديث التصنيف الحالي في اللعبة
      const [updatedGame] = await db
        .update(games)
        .set({ currentCategory: category })
        .where(eq(games.id, id))
        .returning();
      
      if (!updatedGame) {
        return undefined;
      }
      
      // استرجاع اللعبة المحدثة بالكامل
      return await this.getGame(id);
    } catch (error) {
      console.error('Error updating current category:', error);
      throw error;
    }
  }

  async updateCurrentDifficulty(id: string, difficulty: string): Promise<Game | undefined> {
    try {
      // تحديث مستوى الصعوبة الحالي في اللعبة
      const [updatedGame] = await db
        .update(games)
        .set({ currentDifficulty: difficulty })
        .where(eq(games.id, id))
        .returning();
      
      if (!updatedGame) {
        return undefined;
      }
      
      // استرجاع اللعبة المحدثة بالكامل
      return await this.getGame(id);
    } catch (error) {
      console.error('Error updating current difficulty:', error);
      throw error;
    }
  }

  // Team operations
  async updateTeamScore(teamId: number, score: number): Promise<Team | undefined> {
    try {
      // تحديث نقاط الفريق
      const [updatedTeam] = await db
        .update(teams)
        .set({ score })
        .where(eq(teams.id, teamId))
        .returning();
      
      if (!updatedTeam) {
        return undefined;
      }
      
      return updatedTeam;
    } catch (error) {
      console.error('Error updating team score:', error);
      throw error;
    }
  }

  // Question operations
  async markQuestionAnswered(questionId: number): Promise<Question | undefined> {
    try {
      // تحديث حالة السؤال في قاعدة البيانات
      const [updatedQuestion] = await db
        .update(questions)
        .set({ isAnswered: true })
        .where(eq(questions.id, questionId))
        .returning();
      
      if (!updatedQuestion) {
        return undefined;
      }
      
      return updatedQuestion;
    } catch (error) {
      console.error('Error marking question as answered:', error);
      throw error;
    }
  }

  // جلب الأسئلة لفئة محددة
  async getQuestionsByCategory(categoryId: number): Promise<Question[]> {
    try {
      // البحث عن الأسئلة الموجودة لهذه الفئة
      const categoryQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.categoryId, categoryId));
      
      if (categoryQuestions.length > 0) {
        return categoryQuestions;
      }
      
      // إذا لم تكن هناك أسئلة، نقوم بإنشاء أسئلة افتراضية
      // ملاحظة: عادة لا نقوم بإنشائها هنا ولكن من خلال وظيفة getCategoriesByGame
      return [];
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      throw error;
    }
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    try {
      // استرجاع التصنيفات من قاعدة البيانات
      const dbCategories = await db.select().from(categories).where(eq(categories.isActive, true));
      return dbCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoriesByGame(gameId: string): Promise<Category[]> {
    try {
      // أولاً نجلب كل التصنيفات النشطة
      const allCategories = await this.getAllCategories();
      
      // ثم نجلب التصنيفات المرتبطة باللعبة إذا وجدت أو نستخدم أول 8 تصنيفات
      let gameCategories: any[];
      
      // نبحث عن التصنيفات التي تم ربطها باللعبة بالفعل
      const linkedCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.gameId, gameId));
      
      if (linkedCategories.length > 0) {
        gameCategories = linkedCategories;
      } else {
        // إذا لم تكن هناك تصنيفات مرتبطة، نأخذ أول 8 تصنيفات
        gameCategories = allCategories.slice(0, 8);
      }
      
      // نبحث عن أسئلة موجودة بالفعل لهذه اللعبة
      const existingQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.gameId, gameId));
      
      // تنظيم الأسئلة حسب التصنيف
      const questionsByCategory = new Map<number, Question[]>();
      
      for (const question of existingQuestions) {
        if (question.categoryId) {
          if (!questionsByCategory.has(question.categoryId)) {
            questionsByCategory.set(question.categoryId, []);
          }
          questionsByCategory.get(question.categoryId)?.push(question);
        }
      }
      
      // بناء التصنيفات مع أسئلتها
      const categoriesWithQuestions: any[] = [];
      
      for (const category of gameCategories) {
        // نستخدم الأسئلة الموجودة أو ننشئ أسئلة جديدة
        let categoryQuestions: Question[];
        
        if (questionsByCategory.has(category.id) && questionsByCategory.get(category.id)!.length === 6) {
          // إذا كانت هناك بالفعل 6 أسئلة لهذا التصنيف، نستخدمها
          categoryQuestions = questionsByCategory.get(category.id)!;
        } else {
          // وإلا ننشئ أسئلة جديدة
          categoryQuestions = this.generateQuestionsForCategory(category.id, gameId);
          
          // ونضيفها إلى قاعدة البيانات
          for (const question of categoryQuestions) {
            const insertQuestion = {
              text: question.text,
              answer: question.answer,
              difficulty: question.difficulty,
              points: question.points,
              categoryId: category.id,
              gameId: gameId,
              teamId: question.teamId,
              isAnswered: question.isAnswered
            };
            
            try {
              await db.insert(questions).values(insertQuestion);
            } catch (error) {
              console.error('Error inserting question:', error);
            }
          }
        }
        
        // إنشاء كائن التصنيف مع أسئلته
        const categoryWithQuestions = {
          id: category.id,
          name: category.name,
          questions: categoryQuestions
        };
        
        categoriesWithQuestions.push(categoryWithQuestions);
      }
      
      return categoriesWithQuestions;
    } catch (error) {
      console.error('Error getting categories by game:', error);
      throw error;
    }
  }
  
  // وظيفة مساعدة لإنشاء أسئلة عشوائية لتصنيف معين
  private generateQuestionsForCategory(categoryId: number, gameId: string): Question[] {
    // أسئلة افتراضية للتجربة
    const questions: Question[] = [];
    
    // إنشاء 6 أسئلة: 3 للفريق الأول و3 للفريق الثاني
    // وبمستويات صعوبة مختلفة (سهل، متوسط، صعب)
    const difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD];
    const points = { [DifficultyLevel.EASY]: 10, [DifficultyLevel.MEDIUM]: 20, [DifficultyLevel.HARD]: 30 };
    
    // سنستخدم اسم التصنيف ورقم معرفه لإنشاء أسئلة مختلفة قليلاً
    const categoryTypes = ["عام", "تاريخي", "ثقافي", "رياضي", "فني", "علمي"];
    
    // إنشاء نموذج للسؤال ثم إضافة خصائص إضافية
    const createQuestionTemplate = (
      index: number, 
      teamId: number, 
      difficulty: string, 
      typeIndex: number
    ): Question => {
      const questionNumber = teamId === 1 ? index + 1 : index + 4;
      
      return {
        id: categoryId * 100 + questionNumber,
        text: `سؤال ${categoryTypes[typeIndex % categoryTypes.length]} في التصنيف رقم ${categoryId} (مستوى ${difficulty})`,
        answer: `إجابة السؤال ${questionNumber} للتصنيف ${categoryId}`,
        difficulty: difficulty,
        points: points[difficulty as keyof typeof points],
        teamId,
        categoryId,
        gameId,
        isAnswered: false
      };
    };
    
    // إنشاء 3 أسئلة للفريق الأول
    for (let i = 0; i < 3; i++) {
      questions.push(
        createQuestionTemplate(
          i,
          1, // الفريق الأول
          difficulties[i],
          i % categoryTypes.length
        )
      );
    }
    
    // إنشاء 3 أسئلة للفريق الثاني
    for (let i = 0; i < 3; i++) {
      questions.push(
        createQuestionTemplate(
          i,
          2, // الفريق الثاني
          difficulties[i],
          (i + 3) % categoryTypes.length
        )
      );
    }
    
    return questions;
  }
}

// Using Database Storage
export const storage = new DatabaseStorage();