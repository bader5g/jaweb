import { pgTable, text, serial, integer, boolean, jsonb, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define question difficulty enum
export const DifficultyLevel = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type Difficulty = typeof DifficultyLevel[keyof typeof DifficultyLevel];

// Define game state enum
export const GameState = {
  SETUP: "setup",
  CATEGORY_SELECTION: "category_selection",
  DIFFICULTY_SELECTION: "difficulty_selection",
  QUESTION: "question",
  END: "end",
} as const;

export type GameStateType = typeof GameState[keyof typeof GameState];

// Define user levels
export const UserLevel = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
} as const;

export type UserLevelType = typeof UserLevel[keyof typeof UserLevel];

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull().default(0),
  gameId: text("game_id").notNull(),
});

// Games table
export const games = pgTable("games", {
  id: text("id").primaryKey(),
  name: text("name"), // اسم اللعبة
  team1Id: integer("team1_id").references(() => teams.id),
  team2Id: integer("team2_id").references(() => teams.id),
  currentTeamId: integer("current_team_id").references(() => teams.id),
  state: text("state").notNull().default(GameState.SETUP),
  categoryCount: integer("category_count").notNull().default(4),
  currentCategory: text("current_category"),
  currentDifficulty: text("current_difficulty"),
  created: text("created").notNull(),
  answerTime: integer("answer_time").default(30).notNull(), // وقت الإجابة بالثواني
  userId: integer("user_id").references(() => users.id), // معرف المستخدم الذي أنشأ اللعبة
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  icon: text("icon").notNull(), // اسم الأيقونة من مكتبة Lucide
  color: text("color").notNull(), // لون البطاقة (مثل: primary, sky-500, amber-400)
  description: text("description"),
  descriptionAr: text("description_ar"),
  difficultyLevel: text("difficulty_level").default(DifficultyLevel.MEDIUM), // مستوى صعوبة الأسئلة في التصنيف
  isActive: boolean("is_active").default(true).notNull(),
  gameId: text("game_id"),
  imageUrl: text("image_url"), // رابط صورة التصنيف المخصصة
  parentId: integer("parent_id"), // معرف التصنيف الأب (null للتصنيفات الرئيسية)
  order: integer("order").default(0), // ترتيب التصنيف ضمن المستوى نفسه
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  points: integer("points").notNull().default(0),
  level: text("level").notNull().default(UserLevel.BRONZE),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  created: timestamp("created").notNull().defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  answer: text("answer").notNull(),
  difficulty: text("difficulty").notNull(),
  points: integer("points").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  gameId: text("game_id").notNull(),
  teamId: integer("team_id").references(() => teams.id),
  isAnswered: boolean("is_answered").notNull().default(false),
});

// Game Logs table to track game activity
export const gameLogs = pgTable("game_logs", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  action: text("action").notNull(), // نوع الإجراء: select_category, select_difficulty, answer_question, etc.
  teamId: integer("team_id").references(() => teams.id), // معرف الفريق الذي قام بالإجراء
  questionId: integer("question_id").references(() => questions.id), // معرف السؤال (اختياري)
  categoryId: integer("category_id").references(() => categories.id), // معرف الفئة (اختياري)
  details: json("details"), // تفاصيل إضافية عن الإجراء
});

// Type definition for category schema children
type CategorySchemaType = {
  id: number;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  description?: string;
  descriptionAr?: string;
  difficultyLevel: string;
  isActive: boolean;
  questionCount?: number;
  imageUrl?: string;
  parentId?: number | null;
  order?: number;
  children?: Array<CategorySchemaType>;
}

// Category schema for UI
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  nameAr: z.string(),
  icon: z.string(), 
  color: z.string(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  difficultyLevel: z.string(),
  isActive: z.boolean(),
  questionCount: z.number().optional(),
  imageUrl: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional().default(0),
  children: z.array(z.lazy(() => categorySchema)).optional(),
});

export type CategoryUI = z.infer<typeof categorySchema>;

// Game schema
export const gameSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  team1: z.object({
    id: z.number(),
    name: z.string(),
    score: z.number(),
  }),
  team2: z.object({
    id: z.number(),
    name: z.string(),
    score: z.number(),
  }),
  currentTeamId: z.number(),
  state: z.string(),
  categoryCount: z.number(),
  currentCategory: z.string().optional(),
  currentDifficulty: z.string().optional(),
  answerTime: z.number().default(30),
  categories: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      questions: z.array(
        z.object({
          id: z.number(),
          text: z.string(),
          answer: z.string(),
          difficulty: z.string(),
          points: z.number(),
          teamId: z.number(),
          isAnswered: z.boolean(),
        })
      ),
    })
  ),
});

export type Game = z.infer<typeof gameSchema>;

// User schema for API responses
export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  points: z.number(),
  level: z.string(),
  gamesPlayed: z.number(),
  gamesWon: z.number(),
  created: z.date().or(z.string()),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

// Insert schemas
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  points: true, 
  level: true,
  gamesPlayed: true,
  gamesWon: true,
  created: true
});

// Extend user registration schema with password confirmation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Types for insert operations
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;

// Login schema
export const loginUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

// Types for select operations
export type Team = typeof teams.$inferSelect;
export type GameRecord = typeof games.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type DbUser = typeof users.$inferSelect;
export type GameLog = typeof gameLogs.$inferSelect;

// Game log schema
export const gameLogSchema = z.object({
  id: z.number(),
  gameId: z.string(),
  timestamp: z.date().or(z.string()),
  action: z.string(),
  teamId: z.number().optional(),
  questionId: z.number().optional(),
  categoryId: z.number().optional(),
  details: z.record(z.unknown()).optional(),
});

export type GameLogType = z.infer<typeof gameLogSchema>;

// Insert schema for game logs
export const insertGameLogSchema = createInsertSchema(gameLogs).omit({ id: true, timestamp: true });
export type InsertGameLog = z.infer<typeof insertGameLogSchema>;
