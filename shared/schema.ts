import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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
  team1Id: integer("team1_id").references(() => teams.id),
  team2Id: integer("team2_id").references(() => teams.id),
  currentTeamId: integer("current_team_id").references(() => teams.id),
  state: text("state").notNull().default(GameState.SETUP),
  categoryCount: integer("category_count").notNull().default(4),
  currentCategory: text("current_category"),
  currentDifficulty: text("current_difficulty"),
  created: text("created").notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gameId: text("game_id").notNull(),
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

// Game schema
export const gameSchema = z.object({
  id: z.string(),
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

// Insert schemas
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });

// Types for insert operations
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

// Types for select operations
export type Team = typeof teams.$inferSelect;
export type GameRecord = typeof games.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Question = typeof questions.$inferSelect;
