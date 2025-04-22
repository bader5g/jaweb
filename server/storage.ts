import { randomUUID } from 'crypto';
import { 
  teams, Team, InsertTeam,
  games, GameRecord, InsertGame,
  categories, Category, InsertCategory,
  questions, Question, InsertQuestion,
  users, DbUser, InsertUser,
  gameLogs, GameLog, InsertGameLog,
  Game, gameSchema, DifficultyLevel, UserLevel
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

export interface IStorage {
  // Game operations
  createGame(categoryCount: number, team1Name: string, team2Name: string, answerTime?: number, gameName?: string, selectedCategoryIds?: number[]): Promise<Game>;
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
  
  // Game logs operations
  createGameLog(log: InsertGameLog): Promise<GameLog>;
  getGameLogs(gameId: string): Promise<GameLog[]>;
  
  // Session store for auth
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;
  
  async createGameLog(log: InsertGameLog): Promise<GameLog> {
    try {
      const [gameLog] = await db
        .insert(gameLogs)
        .values(log)
        .returning();
      return gameLog;
    } catch (error) {
      console.error('Error creating game log:', error);
      throw error;
    }
  }
  
  async getGameLogs(gameId: string): Promise<GameLog[]> {
    try {
      const logs = await db
        .select()
        .from(gameLogs)
        .where(eq(gameLogs.gameId, gameId))
        .orderBy(gameLogs.timestamp);
      return logs;
    } catch (error) {
      console.error('Error fetching game logs:', error);
      throw error;
    }
  }

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
  async createGame(categoryCount: number, team1Name: string, team2Name: string, answerTime: number = 30, gameName?: string, selectedCategoryIds?: number[]): Promise<Game> {
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
          state: "category_selection", // تغيير من setup إلى category_selection
          categoryCount,
          currentCategory: null,
          currentDifficulty: null,
          created: new Date().toISOString(),
          answer_time: answerTime,
          name: gameName
        })
        .returning();
      
      // إذا تم تحديد فئات محددة، قم بإضافة معرف اللعبة إليها
      if (selectedCategoryIds && selectedCategoryIds.length > 0) {
        console.log(`Linking ${selectedCategoryIds.length} categories to game ${gameId}`);
        
        // تحديث كل فئة مختارة بإضافة معرف اللعبة إليها
        for (const categoryId of selectedCategoryIds) {
          await db
            .update(categories)
            .set({ gameId })
            .where(eq(categories.id, categoryId));
        }
      }
      
      // استرجاع التصنيفات والأسئلة للعبة بعد تحديثها
      const gameCategories = await this.getCategoriesByGame(gameId);
      
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
        categories: gameCategories,
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
      console.log(`[STORAGE] تحديث مستوى الصعوبة للعبة ${id} إلى ${difficulty}`);
      
      // تحديث مستوى الصعوبة الحالي في اللعبة
      const [updatedGame] = await db
        .update(games)
        .set({ currentDifficulty: difficulty })
        .where(eq(games.id, id))
        .returning();
      
      if (!updatedGame) {
        console.log(`[STORAGE] لم يتم العثور على اللعبة ${id}`);
        return undefined;
      }
      
      console.log(`[STORAGE] تم التحديث بنجاح، جاري استرجاع اللعبة...`);
      
      // استرجاع اللعبة المحدثة بالكامل
      const fullGame = await this.getGame(id);
      
      if (fullGame) {
        console.log(`[STORAGE] تم استرجاع اللعبة، الحالة: ${fullGame.state}, المستوى الحالي: ${fullGame.currentDifficulty}`);
      } else {
        console.log(`[STORAGE] فشل استرجاع اللعبة المحدثة!`);
      }
      
      return fullGame;
    } catch (error) {
      console.error('[STORAGE] خطأ في تحديث مستوى الصعوبة:', error);
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
      
      // نبحث عن اللعبة لمعرفة عدد الفئات المطلوبة
      const [gameInfo] = await db.select().from(games).where(eq(games.id, gameId));
      const categoryCount = gameInfo?.categoryCount || 8;
      
      console.log(`Fetching ${categoryCount} categories for game ${gameId}`);
      
      // ثم نجلب التصنيفات المرتبطة باللعبة إذا وجدت أو نستخدم أول عدد محدد من التصنيفات
      let gameCategories: any[];
      
      // نبحث عن التصنيفات التي تم ربطها باللعبة بالفعل
      const linkedCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.gameId, gameId));
      
      console.log(`Found ${linkedCategories.length} linked categories for game ${gameId}`);
      
      if (linkedCategories.length > 0) {
        gameCategories = linkedCategories;
      } else {
        // إذا لم تكن هناك تصنيفات مرتبطة، نأخذ أول عدد محدد من التصنيفات
        gameCategories = allCategories.slice(0, categoryCount);
        
        // حفظ هذه الفئات مع رقم معرف اللعبة
        for (const category of gameCategories) {
          await db
            .update(categories)
            .set({ gameId: gameId })
            .where(eq(categories.id, category.id));
        }
        
        console.log(`Assigned ${categoryCount} categories to game ${gameId}`);
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
    const questions: Question[] = [];
    const difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD];
    const points = { [DifficultyLevel.EASY]: 10, [DifficultyLevel.MEDIUM]: 20, [DifficultyLevel.HARD]: 30 };

    // قائمة من الأسئلة العشوائية لكل فئة
    const questionBank = {
      1: { // الرياضيات
        easy: [
          { q: "كم يساوي 5 × 7؟", a: "35" },
          { q: "ما هو ناتج جمع 15 و 28؟", a: "43" },
          { q: "كم يساوي 12 ÷ 3؟", a: "4" },
          { q: "ما هو ناتج طرح 17 من 32؟", a: "15" },
          { q: "كم يساوي 6 × 9؟", a: "54" }
        ],
        medium: [
          { q: "ما هو الجذر التربيعي لـ 144؟", a: "12" },
          { q: "كم يساوي 3 مرفوع للقوة 4؟", a: "81" },
          { q: "كم عدد أضلاع المثمن؟", a: "8" },
          { q: "ما هي قيمة ط (π) مقربة لأول رقمين عشريين؟", a: "3.14" },
          { q: "ما هو مجموع زوايا المثلث؟", a: "180 درجة" }
        ],
        hard: [
          { q: "احسب مساحة دائرة نصف قطرها 7 سم", a: "153.94 سم مربع" },
          { q: "ما هو ناتج 15% من 480؟", a: "72" },
          { q: "ما هي النسبة الذهبية تقريباً؟", a: "1.618" },
          { q: "احسب جذر المعادلة التربيعية: س² - 5س + 6 = 0", a: "2 و 3" },
          { q: "كم قطر مربع طول ضلعه 10 سم؟", a: "14.14 سم" }
        ]
      },
      2: { // العلوم
        easy: [
          { q: "ما هو أكبر كوكب في النظام الشمسي؟", a: "المشتري" },
          { q: "ما هي المادة التي تتكون منها معظم الخلايا الحية؟", a: "الماء" },
          { q: "ما هو الغاز الذي تتنفسه النباتات ليلاً؟", a: "الأكسجين" },
          { q: "ما هو أقرب كوكب إلى الشمس؟", a: "عطارد" },
          { q: "ما المعدن الذي يوجد في الدم ويعطيه اللون الأحمر؟", a: "الحديد" }
        ],
        medium: [
          { q: "ما هو العنصر الكيميائي الأكثر وفرة في القشرة الأرضية؟", a: "الأكسجين" },
          { q: "كم عدد العظام في جسم الإنسان البالغ؟", a: "206" },
          { q: "ما هو الجهاز المسؤول عن إنتاج الهرمونات في جسم الإنسان؟", a: "الجهاز الغدي" },
          { q: "ما هو العنصر الأكثر شيوعاً في الكون؟", a: "الهيدروجين" },
          { q: "كم عدد الجينات في الجينوم البشري تقريباً؟", a: "حوالي 20000 جين" }
        ],
        hard: [
          { q: "ما هو قانون نيوتن الثاني للحركة؟", a: "القوة تساوي الكتلة مضروبة في التسارع" },
          { q: "ما هو الفرق بين الخلية النباتية والخلية الحيوانية؟", a: "الخلية النباتية تحتوي على جدار خلوي وبلاستيدات خضراء" },
          { q: "ما هي المادة العضوية الموجودة في الخلايا والمسؤولة عن حمل الصفات الوراثية؟", a: "الحمض النووي (DNA)" },
          { q: "ما هو قانون أوم في الكهرباء؟", a: "التيار يساوي فرق الجهد مقسوماً على المقاومة" },
          { q: "ما هي نظرية الكم في الفيزياء؟", a: "نظرية تصف سلوك الطاقة والمادة على المستوى الذري والجزيئي" }
        ]
      },
      3: { // الجغرافيا
        easy: [
          { q: "ما هي أكبر قارة في العالم؟", a: "آسيا" },
          { q: "ما هي عاصمة المملكة العربية السعودية؟", a: "الرياض" },
          { q: "ما هي أكبر دولة عربية من حيث المساحة؟", a: "الجزائر" },
          { q: "في أي قارة تقع مصر؟", a: "أفريقيا وآسيا (سيناء)" },
          { q: "ما هي أطول سلسلة جبال في العالم؟", a: "جبال الأنديز" }
        ],
        medium: [
          { q: "ما هو أعمق محيط في العالم؟", a: "المحيط الهادئ" },
          { q: "كم عدد القارات في العالم؟", a: "7" },
          { q: "في أي دولة يقع نهر الدانوب؟", a: "يمر عبر 10 دول أوروبية" },
          { q: "ما هي أكبر جزيرة في العالم؟", a: "جرينلاند" },
          { q: "ما اسم الخط الوهمي الذي يقسم الكرة الأرضية إلى نصفين شمالي وجنوبي؟", a: "خط الاستواء" }
        ],
        hard: [
          { q: "ما هو أطول نهر في العالم؟", a: "نهر النيل" },
          { q: "ما هي أكبر صحراء في العالم؟", a: "الصحراء الكبرى" },
          { q: "ما هي النقطة الأكثر عمقاً في المحيطات؟", a: "خندق ماريانا" },
          { q: "ما هي الظاهرة الجيولوجية المسببة للزلازل والبراكين على حدود الصفائح التكتونية؟", a: "حركة الصفائح التكتونية" },
          { q: "في أي دولة يقع 'سور الصين العظيم'؟", a: "الصين" }
        ]
      },
      4: { // التاريخ
        easy: [
          { q: "متى تأسست المملكة العربية السعودية الحديثة؟", a: "1932" },
          { q: "من هو الخليفة الأول في الإسلام؟", a: "أبو بكر الصديق" },
          { q: "متى بدأت الحرب العالمية الثانية؟", a: "1939" },
          { q: "من هو مكتشف أمريكا؟", a: "كريستوفر كولومبوس" },
          { q: "ما هي أقدم حضارة في التاريخ؟", a: "الحضارة السومرية" }
        ],
        medium: [
          { q: "من هو القائد الذي وحد المملكة العربية السعودية؟", a: "الملك عبد العزيز آل سعود" },
          { q: "متى كانت معركة بدر الكبرى؟", a: "السنة الثانية للهجرة" },
          { q: "متى سقطت الخلافة العثمانية؟", a: "1924" },
          { q: "من هو الفاتح المسلم للأندلس؟", a: "طارق بن زياد" },
          { q: "متى تم توحيد ألمانيا؟", a: "1871" }
        ],
        hard: [
          { q: "ما هي معاهدة فرساي؟", a: "معاهدة السلام التي أنهت الحرب العالمية الأولى" },
          { q: "ما هي سياسة الباب المفتوح التي اتبعتها الصين؟", a: "سياسة اقتصادية سمحت للدول الأجنبية بالتجارة في الصين" },
          { q: "من هو القائد الذي هزم المغول في معركة عين جالوت؟", a: "سيف الدين قطز" },
          { q: "متى تأسست الأمم المتحدة؟", a: "1945" },
          { q: "ما هي الثورة الصناعية؟", a: "تحول في أساليب الإنتاج من اليدوي إلى الآلي في القرن 18 و19" }
        ]
      },
      5: { // اللغة العربية والأدب
        easy: [
          { q: "ما هو جمع كلمة 'كتاب'؟", a: "كتب" },
          { q: "من هو مؤلف كتاب 'كليلة ودمنة'؟", a: "ابن المقفع" },
          { q: "ما هو مفرد كلمة 'أقلام'؟", a: "قلم" },
          { q: "كم عدد أحرف اللغة العربية؟", a: "28 حرفاً" },
          { q: "ما هي أنواع الكلمة في اللغة العربية؟", a: "اسم وفعل وحرف" }
        ],
        medium: [
          { q: "من هو شاعر المعلقة التي تبدأ بـ 'قفا نبك من ذكرى حبيب ومنزل'؟", a: "امرؤ القيس" },
          { q: "ما هو الجناس في البلاغة العربية؟", a: "تشابه لفظين في النطق واختلافهما في المعنى" },
          { q: "من هو أبو الطيب المتنبي؟", a: "شاعر عباسي مشهور" },
          { q: "ما معنى كلمة 'السجع' في البلاغة؟", a: "توافق الفواصل في النثر على حرف واحد" },
          { q: "ما هي علامات الإعراب الأصلية في اللغة العربية؟", a: "الضمة والفتحة والكسرة والسكون" }
        ],
        hard: [
          { q: "من قائل: 'أنا أفكر إذاً أنا موجود'؟", a: "ديكارت" },
          { q: "ما هي العروض في الشعر العربي؟", a: "علم يبحث في موسيقى الشعر وأوزانه" },
          { q: "من مؤلف كتاب 'مقدمة ابن خلدون'؟", a: "عبد الرحمن بن خلدون" },
          { q: "ما هو الفرق بين الضاد والظاء في النطق؟", a: "الضاد تخرج من إحدى حافتي اللسان والظاء تخرج من طرف اللسان" },
          { q: "ما معنى مصطلح 'الاستعارة' في البلاغة؟", a: "تشبيه حذف أحد طرفيه" }
        ]
      },
      10: { // الثقافة العامة
        easy: [
          { q: "ما هو لون علم المملكة العربية السعودية؟", a: "أخضر" },
          { q: "من هو نادي كرة القدم الذي فاز بأكبر عدد من بطولات دوري أبطال أوروبا؟", a: "ريال مدريد" },
          { q: "كم يوماً في السنة الميلادية العادية؟", a: "365 يوم" },
          { q: "ما هو اسم صوت الأسد؟", a: "زئير" },
          { q: "ما هي عملة اليابان؟", a: "الين" }
        ],
        medium: [
          { q: "من هو مخترع المصباح الكهربائي؟", a: "توماس أديسون" },
          { q: "من هو مؤسس شركة مايكروسوفت؟", a: "بيل جيتس" },
          { q: "ما هي أشهر جائزة علمية في العالم؟", a: "جائزة نوبل" },
          { q: "ما هو اسم صغير الأسد؟", a: "شبل" },
          { q: "كم عدد لاعبي كرة القدم في الملعب لكل فريق؟", a: "11 لاعب" }
        ],
        hard: [
          { q: "كم عدد أحرف الشدة في لغة البرمجة بايثون؟", a: "33" },
          { q: "من هو الفائز بكأس العالم لكرة القدم 2022؟", a: "الأرجنتين" },
          { q: "ما هو اسم أول رائد فضاء زار القمر؟", a: "نيل أرمسترونج" },
          { q: "ما اسم أقدم جامعة مستمرة في العالم؟", a: "جامعة القرويين" },
          { q: "كم عدد الكواكب المعروفة في نظامنا الشمسي بعد إلغاء بلوتو؟", a: "8 كواكب" }
        ]
      },
      11: { // تكنولوجيا المعلومات
        easy: [
          { q: "ما معنى اختصار CPU؟", a: "وحدة المعالجة المركزية" },
          { q: "ما هو متصفح الإنترنت الأكثر استخداماً في العالم؟", a: "جوجل كروم" },
          { q: "ما معنى كلمة Internet؟", a: "شبكة دولية" },
          { q: "ما هو نظام التشغيل الأكثر استخداماً في الهواتف الذكية؟", a: "أندرويد" },
          { q: "ما معنى كلمة Hardware؟", a: "الأجزاء المادية للحاسوب" }
        ],
        medium: [
          { q: "ما معنى اختصار HTML؟", a: "لغة ترميز النص التشعبي" },
          { q: "ما هي وحدة قياس سرعة المعالج؟", a: "الهرتز" },
          { q: "ما هو البلوك تشين؟", a: "تقنية دفتر الحسابات الموزع" },
          { q: "ما هي لغة البرمجة الأكثر استخداماً حاليًا؟", a: "جافاسكريبت" },
          { q: "ما هو الفرق بين RAM و ROM؟", a: "RAM ذاكرة وصول عشوائي مؤقتة، ROM ذاكرة للقراءة فقط دائمة" }
        ],
        hard: [
          { q: "ما هو الفرق بين HTTP و HTTPS؟", a: "HTTPS يضيف طبقة أمان مشفرة لحماية البيانات المتبادلة" },
          { q: "ما هي خوارزمية الترتيب الأسرع بين Quick Sort و Bubble Sort؟", a: "Quick Sort" },
          { q: "ما هي تقنية SSH؟", a: "بروتوكول آمن للاتصال عن بعد بالخوادم" },
          { q: "ماذا يعني مفهوم 'الذكاء الاصطناعي العام' (AGI)؟", a: "ذكاء اصطناعي قادر على فهم وتعلم وتنفيذ أي مهمة فكرية بشرية" },
          { q: "ما هو مبدأ عمل تقنية الواقع الافتراضي (VR)؟", a: "محاكاة بيئة ثلاثية الأبعاد يمكن التفاعل معها عبر أجهزة استشعار خاصة" }
        ]
      }
    };

    // توزيع الأسئلة بالتساوي بين الفريقين - 3 أسئلة لكل فريق
    [1, 2].forEach(teamId => {
      // للتأكد من عدم تكرار نفس السؤال
      let usedQuestionsIndices: { [key: string]: number[] } = {};
      
      difficulties.forEach(difficulty => {
        const bank = questionBank[categoryId as keyof typeof questionBank]?.[difficulty] || [
          { q: `سؤال ${difficulty} للفئة ${categoryId}`, a: `إجابة السؤال` }
        ];
        
        // تجهيز مصفوفة للأسئلة المستخدمة لهذا المستوى
        if (!usedQuestionsIndices[difficulty]) {
          usedQuestionsIndices[difficulty] = [];
        }
        
        // اختيار سؤال عشوائي غير مستخدم
        let randomIndex;
        let attempts = 0;
        
        do {
          randomIndex = Math.floor(Math.random() * bank.length);
          attempts++;
          // إذا حاولنا أكثر من 10 مرات ولم نجد سؤالاً غير مستخدم، نستخدم السؤال الحالي
          if (attempts > 10) break;
        } while (usedQuestionsIndices[difficulty].includes(randomIndex) && bank.length > usedQuestionsIndices[difficulty].length);
        
        // تسجيل السؤال كمستخدم
        usedQuestionsIndices[difficulty].push(randomIndex);
        
        const randomQ = bank[randomIndex];
        
        const currentQuestion = {
          id: questions.length + 1,
          text: randomQ.q,
          answer: randomQ.a,
          difficulty,
          points: points[difficulty],
          categoryId,
          gameId,
          teamId,
          isAnswered: false
        };
        questions.push(currentQuestion);
      });
    });

    return questions;
  }
}

// Using Database Storage
export const storage = new DatabaseStorage();