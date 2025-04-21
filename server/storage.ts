import { randomUUID } from 'crypto';
import { 
  teams, Team, InsertTeam,
  games, GameRecord, InsertGame,
  categories, Category, InsertCategory,
  questions, Question, InsertQuestion,
  users, DbUser, InsertUser,
  Game, gameSchema, DifficultyLevel, UserLevel
} from "@shared/schema";

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
  getCategoriesByGame(gameId: string): Promise<Category[]>;
}

export class MemStorage implements IStorage {
  private gamesMap: Map<string, GameRecord>;
  private teamsMap: Map<number, Team>;
  private categoriesMap: Map<number, Category>;
  private questionsMap: Map<number, Question>;
  
  private teamIdCounter: number;
  private categoryIdCounter: number;
  private questionIdCounter: number;
  
  // Sample category names
  private categoryNames = [
    "ثقافة عامة", "تاريخ", "رياضة", "علوم", "جغرافيا", 
    "سينما وتلفزيون", "موسيقى", "أدب"
  ];
  
  // Sample questions by category and difficulty
  private questionData = {
    "ثقافة عامة": {
      [DifficultyLevel.EASY]: [
        { text: "ما هي عاصمة المملكة العربية السعودية؟", answer: "الرياض" },
        { text: "ما هو الكوكب الأقرب إلى الشمس؟", answer: "عطارد" },
        { text: "ما هي أكبر قارة في العالم؟", answer: "آسيا" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "في أي عام تأسست منظمة الأمم المتحدة؟", answer: "1945" },
        { text: "ما هي أطول سلسلة جبال في العالم؟", answer: "جبال الأنديز" },
        { text: "من هو مخترع المصباح الكهربائي؟", answer: "توماس إديسون" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "ما هي أصغر دولة في العالم من حيث المساحة؟", answer: "الفاتيكان" },
        { text: "ما هي أعمق نقطة في المحيطات؟", answer: "خندق ماريانا" },
        { text: "ما هو العنصر الكيميائي رقم 1 في الجدول الدوري؟", answer: "الهيدروجين" }
      ]
    },
    "تاريخ": {
      [DifficultyLevel.EASY]: [
        { text: "متى بدأت الحرب العالمية الثانية؟", answer: "1939" },
        { text: "من هو أول رئيس للولايات المتحدة الأمريكية؟", answer: "جورج واشنطن" },
        { text: "متى سقطت الخلافة العثمانية؟", answer: "1924" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "في أي عام اكتشف كريستوفر كولومبوس أمريكا؟", answer: "1492" },
        { text: "من هو القائد الذي عبر جبال الألب بالفيلة؟", answer: "هانيبال" },
        { text: "ما اسم المعاهدة التي أنهت الحرب العالمية الأولى؟", answer: "معاهدة فرساي" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "من هو مؤسس الدولة الأموية؟", answer: "معاوية بن أبي سفيان" },
        { text: "متى بدأت الثورة الصناعية في أوروبا؟", answer: "القرن الثامن عشر" },
        { text: "ما هي أقدم حضارة معروفة في التاريخ؟", answer: "حضارة سومر" }
      ]
    },
    "رياضة": {
      [DifficultyLevel.EASY]: [
        { text: "ما هي الدولة التي فازت بكأس العالم لكرة القدم 2022؟", answer: "الأرجنتين" },
        { text: "كم عدد اللاعبين في فريق كرة القدم؟", answer: "11" },
        { text: "في أي رياضة اشتهر محمد علي كلاي؟", answer: "الملاكمة" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "ما هو النادي الذي يلعب له ليونيل ميسي حاليًا؟", answer: "انتر ميامي" },
        { text: "كم مرة فاز المنتخب البرازيلي بكأس العالم؟", answer: "5" },
        { text: "من هو أكثر لاعب سجل أهدافًا في تاريخ كأس العالم؟", answer: "ميروسلاف كلوزه" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "في أي عام أقيمت أول دورة للألعاب الأولمبية الحديثة؟", answer: "1896" },
        { text: "من هو الرياضي الوحيد الذي فاز بـ 8 ميداليات ذهبية في دورة أولمبية واحدة؟", answer: "مايكل فيلبس" },
        { text: "ما هي الرياضة التي تلعب في رولان غاروس؟", answer: "التنس" }
      ]
    },
    "علوم": {
      [DifficultyLevel.EASY]: [
        { text: "ما هو العنصر الأكثر وفرة في الغلاف الجوي للأرض؟", answer: "النيتروجين" },
        { text: "ما هي أقرب نجمة إلى الأرض؟", answer: "الشمس" },
        { text: "كم عدد الكواكب في المجموعة الشمسية؟", answer: "8" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "ما هو اسم العالم الذي اكتشف الجاذبية؟", answer: "إسحاق نيوتن" },
        { text: "ما هي النظرية التي طورها ألبرت أينشتاين في عام 1915؟", answer: "النسبية العامة" },
        { text: "ما هو العنصر الكيميائي الذي رمزه Fe؟", answer: "الحديد" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "ما هو اسم أول قمر صناعي في العالم؟", answer: "سبوتنيك 1" },
        { text: "ما هي وحدة قياس التيار الكهربائي؟", answer: "الأمبير" },
        { text: "ما هو اسم القانون الذي ينص على أن الطاقة لا تفنى ولا تستحدث من العدم؟", answer: "قانون حفظ الطاقة" }
      ]
    },
    "جغرافيا": {
      [DifficultyLevel.EASY]: [
        { text: "ما هي أكبر دولة في العالم من حيث المساحة؟", answer: "روسيا" },
        { text: "ما هو أطول نهر في العالم؟", answer: "نهر النيل" },
        { text: "ما هي عاصمة فرنسا؟", answer: "باريس" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "ما هي أعلى قمة جبلية في العالم؟", answer: "جبل إيفرست" },
        { text: "على أي قارة تقع دولة المغرب؟", answer: "أفريقيا" },
        { text: "ما هي أكبر صحراء في العالم؟", answer: "الصحراء الكبرى" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "ما هي أكبر بحيرة في العالم من حيث المساحة؟", answer: "بحر قزوين" },
        { text: "ما هي الدولة التي تقع على أكبر عدد من خطوط الطول؟", answer: "فرنسا" },
        { text: "ما هي الدولة الوحيدة التي تقع في أربع مناطق زمنية؟", answer: "كيريباتي" }
      ]
    },
    "سينما وتلفزيون": {
      [DifficultyLevel.EASY]: [
        { text: "من هو مخرج فيلم تيتانيك؟", answer: "جيمس كاميرون" },
        { text: "ما اسم الممثل الذي لعب دور هاري بوتر؟", answer: "دانيال رادكليف" },
        { text: "من هي بطلة فيلم الجميلة والوحش؟", answer: "إيما واتسون" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "ما هو أول فيلم متحرك من إنتاج ديزني؟", answer: "سنو وايت والأقزام السبعة" },
        { text: "من هو مخرج فيلم العراب؟", answer: "فرانسيس فورد كوبولا" },
        { text: "من الممثل الذي فاز بجائزة الأوسكار عن دوره في فيلم الملك خطاب؟", answer: "كولن فيرث" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "في أي عام تم إطلاق أول فيلم من سلسلة أفلام حرب النجوم؟", answer: "1977" },
        { text: "من هو مؤلف كتاب عراب الذي اقتبس منه الفيلم؟", answer: "ماريو بوزو" },
        { text: "ما هو الفيلم الحائز على أكبر عدد من جوائز الأوسكار؟", answer: "بن هور، تيتانيك، عودة الملك (11 جائزة لكل منهم)" }
      ]
    },
    "موسيقى": {
      [DifficultyLevel.EASY]: [
        { text: "من هو ملك البوب؟", answer: "مايكل جاكسون" },
        { text: "من غنى أغنية \"بلا بلا بلا\"؟", answer: "فيروز" },
        { text: "ما هي الآلة الموسيقية التي اشتهر بها عمر خيرت؟", answer: "البيانو" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "من هو مؤلف سيمفونية القدر؟", answer: "بيتهوفن" },
        { text: "في أي عام توفي الفنان محمد عبد الوهاب؟", answer: "1991" },
        { text: "ما هي فرقة الروك البريطانية التي اشتهرت بأغنية \"بوهيميان رابسودي\"؟", answer: "كوين" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "من هو الموسيقار الإيطالي الذي ألف أوبرا عايدة؟", answer: "جوزيبي فيردي" },
        { text: "كم عدد الأوتار في آلة القانون التقليدية؟", answer: "72" },
        { text: "من هو مؤلف كتاب الأغاني الشهير في الموسيقى العربية؟", answer: "أبو الفرج الأصفهاني" }
      ]
    },
    "أدب": {
      [DifficultyLevel.EASY]: [
        { text: "من هو مؤلف رواية البؤساء؟", answer: "فيكتور هوجو" },
        { text: "من هو مؤلف مسرحية روميو وجولييت؟", answer: "وليام شكسبير" },
        { text: "من هو مؤلف كتاب ألف ليلة وليلة؟", answer: "مجهول (مجموعة مؤلفين)" }
      ],
      [DifficultyLevel.MEDIUM]: [
        { text: "من هو الشاعر الملقب بأمير الشعراء؟", answer: "أحمد شوقي" },
        { text: "من هو مؤلف رواية الشيخ والبحر؟", answer: "إرنست همنغواي" },
        { text: "ما هي الرواية الأشهر لنجيب محفوظ التي تتحدث عن حي شعبي في القاهرة؟", answer: "زقاق المدق" }
      ],
      [DifficultyLevel.HARD]: [
        { text: "من هو الأديب العربي الذي حصل على جائزة نوبل للآداب عام 1988؟", answer: "نجيب محفوظ" },
        { text: "من هو مؤلف معلقة \"قفا نبك من ذكرى حبيب ومنزل\"؟", answer: "امرؤ القيس" },
        { text: "ما هو الاسم الحقيقي للشاعر أبو الطيب المتنبي؟", answer: "أحمد بن الحسين الجعفي" }
      ]
    }
  };

  constructor() {
    this.gamesMap = new Map();
    this.teamsMap = new Map();
    this.categoriesMap = new Map();
    this.questionsMap = new Map();
    
    this.teamIdCounter = 1;
    this.categoryIdCounter = 1;
    this.questionIdCounter = 1;
  }

  async createGame(categoryCount: number, team1Name: string, team2Name: string): Promise<Game> {
    const gameId = randomUUID();
    const currentDate = new Date().toISOString();
    
    // Create teams
    const team1: Team = {
      id: this.teamIdCounter++,
      name: team1Name,
      score: 0,
      gameId
    };
    
    const team2: Team = {
      id: this.teamIdCounter++,
      name: team2Name,
      score: 0,
      gameId
    };
    
    this.teamsMap.set(team1.id, team1);
    this.teamsMap.set(team2.id, team2);
    
    // Create game
    const gameRecord: GameRecord = {
      id: gameId,
      team1Id: team1.id,
      team2Id: team2.id,
      currentTeamId: team1.id, // First team starts
      state: "setup",
      categoryCount,
      currentCategory: undefined,
      currentDifficulty: undefined,
      created: currentDate
    };
    
    this.gamesMap.set(gameId, gameRecord);
    
    // Create categories (select the first N categories)
    const selectedCategories = this.categoryNames.slice(0, categoryCount);
    const gameCategories: Category[] = [];
    
    for (const categoryName of selectedCategories) {
      const category: Category = {
        id: this.categoryIdCounter++,
        name: categoryName,
        gameId
      };
      
      this.categoriesMap.set(category.id, category);
      gameCategories.push(category);
      
      // Create questions for this category
      this.createQuestionsForCategory(category, gameId, team1.id, team2.id);
    }
    
    // Return complete game object
    return this.buildGameObject(gameRecord);
  }
  
  private createQuestionsForCategory(category: Category, gameId: string, team1Id: number, team2Id: number): void {
    const categoryData = this.questionData[category.name as keyof typeof this.questionData];
    
    if (!categoryData) {
      console.error(`No question data found for category: ${category.name}`);
      return;
    }
    
    // Team 1 questions
    this.createTeamQuestionsForCategory(category, gameId, team1Id, categoryData);
    
    // Team 2 questions
    this.createTeamQuestionsForCategory(category, gameId, team2Id, categoryData);
  }
  
  private createTeamQuestionsForCategory(
    category: Category, 
    gameId: string, 
    teamId: number, 
    categoryData: any
  ): void {
    // Add easy question
    const easyQ = this.getRandomQuestion(categoryData[DifficultyLevel.EASY]);
    this.createQuestion(easyQ.text, easyQ.answer, DifficultyLevel.EASY, 1, category.id, gameId, teamId);
    
    // Add medium question
    const mediumQ = this.getRandomQuestion(categoryData[DifficultyLevel.MEDIUM]);
    this.createQuestion(mediumQ.text, mediumQ.answer, DifficultyLevel.MEDIUM, 2, category.id, gameId, teamId);
    
    // Add hard question
    const hardQ = this.getRandomQuestion(categoryData[DifficultyLevel.HARD]);
    this.createQuestion(hardQ.text, hardQ.answer, DifficultyLevel.HARD, 3, category.id, gameId, teamId);
  }
  
  private getRandomQuestion(questions: any[]): any {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }
  
  private createQuestion(
    text: string, 
    answer: string, 
    difficulty: string, 
    points: number, 
    categoryId: number, 
    gameId: string, 
    teamId: number
  ): Question {
    const question: Question = {
      id: this.questionIdCounter++,
      text,
      answer,
      difficulty,
      points,
      categoryId,
      gameId,
      teamId,
      isAnswered: false
    };
    
    this.questionsMap.set(question.id, question);
    return question;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const game = this.gamesMap.get(id);
    if (!game) return undefined;
    return this.buildGameObject(game);
  }

  async updateGameState(id: string, state: string): Promise<Game | undefined> {
    const game = this.gamesMap.get(id);
    if (!game) return undefined;
    
    game.state = state;
    this.gamesMap.set(id, game);
    
    return this.buildGameObject(game);
  }

  async updateCurrentTeam(id: string, teamId: number): Promise<Game | undefined> {
    const game = this.gamesMap.get(id);
    if (!game) return undefined;
    
    game.currentTeamId = teamId;
    this.gamesMap.set(id, game);
    
    return this.buildGameObject(game);
  }

  async updateCurrentCategory(id: string, category: string): Promise<Game | undefined> {
    const game = this.gamesMap.get(id);
    if (!game) return undefined;
    
    game.currentCategory = category;
    this.gamesMap.set(id, game);
    
    return this.buildGameObject(game);
  }

  async updateCurrentDifficulty(id: string, difficulty: string): Promise<Game | undefined> {
    const game = this.gamesMap.get(id);
    if (!game) return undefined;
    
    game.currentDifficulty = difficulty;
    this.gamesMap.set(id, game);
    
    return this.buildGameObject(game);
  }

  async updateTeamScore(teamId: number, score: number): Promise<Team | undefined> {
    const team = this.teamsMap.get(teamId);
    if (!team) return undefined;
    
    team.score += score;
    this.teamsMap.set(teamId, team);
    
    return team;
  }

  async markQuestionAnswered(questionId: number): Promise<Question | undefined> {
    const question = this.questionsMap.get(questionId);
    if (!question) return undefined;
    
    question.isAnswered = true;
    this.questionsMap.set(questionId, question);
    
    return question;
  }

  async getQuestionsByCategory(categoryId: number): Promise<Question[]> {
    const questions: Question[] = [];
    
    for (const [_, question] of this.questionsMap.entries()) {
      if (question.categoryId === categoryId) {
        questions.push(question);
      }
    }
    
    return questions;
  }

  async getCategoriesByGame(gameId: string): Promise<Category[]> {
    const categories: Category[] = [];
    
    for (const [_, category] of this.categoriesMap.entries()) {
      if (category.gameId === gameId) {
        categories.push(category);
      }
    }
    
    return categories;
  }
  
  private buildGameObject(gameRecord: GameRecord): Game {
    const team1 = this.teamsMap.get(gameRecord.team1Id!);
    const team2 = this.teamsMap.get(gameRecord.team2Id!);
    
    if (!team1 || !team2) {
      throw new Error("Teams not found for game");
    }
    
    // Get categories for this game
    const gameCategories: any[] = [];
    for (const [_, category] of this.categoriesMap.entries()) {
      if (category.gameId === gameRecord.id) {
        // Get questions for this category
        const categoryQuestions: any[] = [];
        for (const [_, question] of this.questionsMap.entries()) {
          if (question.categoryId === category.id) {
            categoryQuestions.push({
              id: question.id,
              text: question.text,
              answer: question.answer,
              difficulty: question.difficulty,
              points: question.points,
              teamId: question.teamId,
              isAnswered: question.isAnswered
            });
          }
        }
        
        gameCategories.push({
          id: category.id,
          name: category.name,
          questions: categoryQuestions
        });
      }
    }
    
    const game = {
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
      currentTeamId: gameRecord.currentTeamId!,
      state: gameRecord.state,
      categoryCount: gameRecord.categoryCount,
      currentCategory: gameRecord.currentCategory,
      currentDifficulty: gameRecord.currentDifficulty,
      categories: gameCategories
    };
    
    return gameSchema.parse(game);
  }
}

export const storage = new MemStorage();
