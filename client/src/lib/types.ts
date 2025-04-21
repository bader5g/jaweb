export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard"
}

export enum GameState {
  SETUP = "setup",
  CATEGORY_SELECTION = "category_selection",
  DIFFICULTY_SELECTION = "difficulty_selection",
  QUESTION = "question",
  END = "end"
}

export interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: string;
  points: number;
  teamId: number;
  isAnswered: boolean;
}

export interface Category {
  id: number;
  name: string;
  questions: Question[];
}

export interface Team {
  id: number;
  name: string;
  score: number;
}

export interface Game {
  id: string;
  team1: Team;
  team2: Team;
  currentTeamId: number;
  state: string;
  categoryCount: number;
  currentCategory?: string;
  currentDifficulty?: string;
  categories: Category[];
  answerTime: number; // وقت الإجابة بالثواني
  name?: string; // اسم اللعبة (اختياري)
}
