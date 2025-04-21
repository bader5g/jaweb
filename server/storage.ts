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
  async createGame(categoryCount: number, team1Name: string, team2Name: string): Promise<Game> {
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
        created: new Date().toISOString()
      })
      .returning();
    
    // For now, we'll return a minimal Game object
    // Later we'll implement category and question creation
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
      categories: []
    };
  }

  async getGame(id: string): Promise<Game | undefined> {
    // Placeholder implementation
    throw new Error("Game operations not implemented yet");
  }

  async updateGameState(id: string, state: string): Promise<Game | undefined> {
    // Placeholder implementation
    throw new Error("Game operations not implemented yet");
  }

  async updateCurrentTeam(id: string, teamId: number): Promise<Game | undefined> {
    // Placeholder implementation
    throw new Error("Game operations not implemented yet");
  }

  async updateCurrentCategory(id: string, category: string): Promise<Game | undefined> {
    // Placeholder implementation
    throw new Error("Game operations not implemented yet");
  }

  async updateCurrentDifficulty(id: string, difficulty: string): Promise<Game | undefined> {
    // Placeholder implementation
    throw new Error("Game operations not implemented yet");
  }

  // Team operations - stub implementations
  async updateTeamScore(teamId: number, score: number): Promise<Team | undefined> {
    // Placeholder implementation
    throw new Error("Team operations not implemented yet");
  }

  // Question operations - stub implementations
  async markQuestionAnswered(questionId: number): Promise<Question | undefined> {
    // Placeholder implementation
    throw new Error("Question operations not implemented yet");
  }

  async getQuestionsByCategory(categoryId: number): Promise<Question[]> {
    // Placeholder implementation
    throw new Error("Question operations not implemented yet");
  }

  // Category operations - stub implementations
  async getCategoriesByGame(gameId: string): Promise<Category[]> {
    // Placeholder implementation
    throw new Error("Category operations not implemented yet");
  }
}

// Using Database Storage
export const storage = new DatabaseStorage();