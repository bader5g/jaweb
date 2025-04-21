import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";
import { GameState } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Setup WebSocket server with specific path to avoid conflicts with Vite HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by game ID
  const connections: Record<string, WebSocket[]> = {};
  
  wss.on('connection', (ws) => {
    let gameId = '';
    
    // Handle messages
    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        
        // Handle join game request
        if (data.type === 'join' && data.gameId) {
          gameId = data.gameId;
          
          // Add this connection to the game
          if (!connections[gameId]) {
            connections[gameId] = [];
          }
          connections[gameId].push(ws);
          
          // Send current game state
          const game = await storage.getGame(gameId);
          if (game) {
            ws.send(JSON.stringify({ type: 'game_state', game }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle disconnect
    ws.addEventListener('close', () => {
      if (gameId && connections[gameId]) {
        connections[gameId] = connections[gameId].filter(conn => conn !== ws);
      }
    });
  });
  
  // Helper function to broadcast game updates
  const broadcastGame = (gameId: string, game: any) => {
    if (connections[gameId]) {
      const message = JSON.stringify({ type: 'game_state', game });
      connections[gameId].forEach(conn => {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(message);
        }
      });
    }
  };
  
  // API Routes
  // الحصول على جميع التصنيفات المتاحة
  app.get('/api/categories', async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء البحث عن التصنيفات" });
    }
  });

  app.post('/api/games', async (req, res) => {
    try {
      const schema = z.object({
        categoryCount: z.number().min(4).max(8),
        team1Name: z.string().min(1),
        team2Name: z.string().min(1)
      });
      
      const { categoryCount, team1Name, team2Name } = schema.parse(req.body);
      const game = await storage.createGame(categoryCount, team1Name, team2Name);
      
      res.status(201).json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.get('/api/games/:id', async (req, res) => {
    try {
      const gameId = req.params.id;
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/games/:id/state', async (req, res) => {
    try {
      const gameId = req.params.id;
      const schema = z.object({
        state: z.string()
      });
      
      const { state } = schema.parse(req.body);
      const game = await storage.updateGameState(gameId, state);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      broadcastGame(gameId, game);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/games/:id/current-team', async (req, res) => {
    try {
      const gameId = req.params.id;
      const schema = z.object({
        teamId: z.number()
      });
      
      const { teamId } = schema.parse(req.body);
      const game = await storage.updateCurrentTeam(gameId, teamId);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      broadcastGame(gameId, game);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/games/:id/current-category', async (req, res) => {
    try {
      const gameId = req.params.id;
      const schema = z.object({
        category: z.string()
      });
      
      const { category } = schema.parse(req.body);
      const game = await storage.updateCurrentCategory(gameId, category);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      broadcastGame(gameId, game);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/games/:id/current-difficulty', async (req, res) => {
    try {
      const gameId = req.params.id;
      const schema = z.object({
        difficulty: z.string()
      });
      
      const { difficulty } = schema.parse(req.body);
      const game = await storage.updateCurrentDifficulty(gameId, difficulty);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      broadcastGame(gameId, game);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/teams/:id/score', async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const schema = z.object({
        points: z.number(),
        gameId: z.string() // Need gameId to broadcast updates
      });
      
      const { points, gameId } = schema.parse(req.body);
      const team = await storage.updateTeamScore(teamId, points);
      
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      // Get updated game to broadcast
      const game = await storage.getGame(gameId);
      if (game) {
        broadcastGame(gameId, game);
      }
      
      res.json(team);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/questions/:id/answered', async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const schema = z.object({
        gameId: z.string() // Need gameId to broadcast updates
      });
      
      const { gameId } = schema.parse(req.body);
      const question = await storage.markQuestionAnswered(questionId);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      // Get updated game to broadcast
      const game = await storage.getGame(gameId);
      if (game) {
        broadcastGame(gameId, game);
      }
      
      res.json(question);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.post('/api/games/:id/start', async (req, res) => {
    try {
      const gameId = req.params.id;
      const game = await storage.updateGameState(gameId, GameState.CATEGORY_SELECTION);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      broadcastGame(gameId, game);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.post('/api/games/:id/end', async (req, res) => {
    try {
      const gameId = req.params.id;
      const game = await storage.updateGameState(gameId, GameState.END);
      
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      broadcastGame(gameId, game);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return httpServer;
}
