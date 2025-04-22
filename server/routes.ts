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
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Make the websocket more permissive with connections
    perMessageDeflate: false,
    clientTracking: true
  });
  
  console.log('WebSocket server initialized on path /ws');
  
  // Store active connections by game ID
  const connections: Record<string, WebSocket[]> = {};
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.socket.remoteAddress);
    let gameId = '';
    
    // Handle messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle join game request
        if (data.type === 'join' && data.gameId) {
          gameId = data.gameId;
          console.log(`Client joined game: ${gameId}`);
          
          // Add this connection to the game
          if (!connections[gameId]) {
            connections[gameId] = [];
          }
          connections[gameId].push(ws);
          
          // Send current game state
          const game = await storage.getGame(gameId);
          if (game) {
            ws.send(JSON.stringify({ type: 'game_state', game }));
            console.log(`Sent initial game state for game: ${gameId}`);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle disconnect
    ws.on('close', (code, reason) => {
      console.log(`WebSocket closed with code ${code}, reason: ${reason}`);
      if (gameId && connections[gameId]) {
        connections[gameId] = connections[gameId].filter(conn => conn !== ws);
        console.log(`Client left game: ${gameId}, remaining clients: ${connections[gameId].length}`);
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Helper function to broadcast game updates
  const broadcastGame = (gameId: string, game: any) => {
    if (connections[gameId] && connections[gameId].length > 0) {
      const message = JSON.stringify({ type: 'game_state', game });
      
      console.log(`Broadcasting game update to ${connections[gameId].length} clients for game ${gameId}`);
      
      // تصفية الاتصالات المفتوحة
      const activeConnections = connections[gameId].filter(conn => conn.readyState === WebSocket.OPEN);
      
      // إذا كانت هناك اتصالات مفتوحة، قم بإرسال التحديث إليها
      if (activeConnections.length > 0) {
        activeConnections.forEach(conn => {
          try {
            conn.send(message);
          } catch (error) {
            console.error('Error sending message to client:', error);
          }
        });
        console.log(`Successfully sent update to ${activeConnections.length} clients`);
      } else {
        console.log('No active connections to broadcast to');
      }
      
      // تحديث قائمة الاتصالات لإزالة الاتصالات المغلقة
      connections[gameId] = activeConnections;
    } else {
      console.log(`No connections found for game ${gameId}`);
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
  
  // Admin API Routes
  
  // الحصول على التصنيفات للوحة التحكم
  app.get('/api/admin/categories', async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء البحث عن التصنيفات" });
    }
  });
  
  // الحصول على الأسئلة للوحة التحكم
  app.get('/api/admin/questions', async (_req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء البحث عن الأسئلة" });
    }
  });
  
  // إنشاء سؤال جديد
  app.post('/api/admin/questions', async (req, res) => {
    try {
      const newQuestion = req.body;
      const question = await storage.createQuestion(newQuestion);
      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء السؤال" });
    }
  });
  
  // تحديث سؤال
  app.put('/api/admin/questions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedData = req.body;
      const question = await storage.updateQuestion(id, updatedData);
      
      if (!question) {
        return res.status(404).json({ error: "السؤال غير موجود" });
      }
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء تحديث السؤال" });
    }
  });
  
  // حذف سؤال
  app.delete('/api/admin/questions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuestion(id);
      
      if (!success) {
        return res.status(404).json({ error: "السؤال غير موجود" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء حذف السؤال" });
    }
  });
  
  // الحصول على سؤال بواسطة المعرف
  app.get('/api/questions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestionById(id);
      
      if (!question) {
        return res.status(404).json({ error: "السؤال غير موجود" });
      }
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء البحث عن السؤال" });
    }
  });
  
  // الحصول على المستخدمين للوحة التحكم
  app.get('/api/admin/users', async (_req, res) => {
    try {
      // نستخدم مؤقتًا مصفوفة فارغة حتى يتم تنفيذ الدالة الفعلية
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء البحث عن المستخدمين" });
    }
  });

  app.post('/api/games', async (req, res) => {
    try {
      const schema = z.object({
        categoryCount: z.number().min(4).max(8),
        team1Name: z.string().min(1),
        team2Name: z.string().min(1),
        answerTime: z.number().default(30),
        name: z.string().optional(),
        selectedCategories: z.array(z.number()).optional()
      });
      
      const { categoryCount, team1Name, team2Name, answerTime, name, selectedCategories } = schema.parse(req.body);
      const game = await storage.createGame(
        categoryCount, 
        team1Name, 
        team2Name, 
        answerTime, 
        name, 
        selectedCategories
      );
      
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
      console.log(`[DEBUG] تحديث مستوى الصعوبة للعبة ${gameId}`);
      
      const schema = z.object({
        difficulty: z.string()
      });
      
      const { difficulty } = schema.parse(req.body);
      console.log(`[DEBUG] المستوى المطلوب: ${difficulty}`);
      
      // أولاً: تحديث مستوى الصعوبة
      let game = await storage.updateCurrentDifficulty(gameId, difficulty);
      
      if (!game) {
        console.log(`[ERROR] اللعبة غير موجودة: ${gameId}`);
        return res.status(404).json({ error: 'Game not found' });
      }
      
      console.log(`[DEBUG] تم تحديث مستوى الصعوبة إلى: ${game.currentDifficulty}`);
      
      // ثانياً: تحديث حالة اللعبة مباشرة إلى وضع السؤال بعد اختيار المستوى
      if (difficulty && difficulty !== '') {
        console.log(`[DEBUG] تغيير حالة اللعبة إلى question`);
        
        game = await storage.updateGameState(gameId, 'question');
        
        if (game) {
          console.log(`[DEBUG] تم تحديث حالة اللعبة بنجاح إلى: ${game.state}`);
        } else {
          console.log(`[ERROR] فشل تحديث حالة اللعبة`);
        }
      }
      
      // بث التحديثات للعملاء المتصلين
      if (game) {
        broadcastGame(gameId, game);
        res.json(game);
        console.log(`[DEBUG] تم إرسال استجابة ناجحة لتحديث المستوى والحالة`);
      } else {
        res.status(500).json({ error: 'حدث خطأ أثناء تحديث حالة اللعبة' });
      }
    } catch (error) {
      console.error(`[ERROR] خطأ في تحديث مستوى الصعوبة:`, error);
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
  
  // Game Log API Routes
  app.post('/api/games/:id/logs', async (req, res) => {
    try {
      const gameId = req.params.id;
      const schema = z.object({
        action: z.string(),
        teamId: z.number().optional(),
        questionId: z.number().optional(),
        categoryId: z.number().optional(),
        details: z.record(z.unknown()).optional()
      });
      
      const logData = schema.parse(req.body);
      const gameLog = await storage.createGameLog({
        gameId,
        action: logData.action,
        teamId: logData.teamId,
        questionId: logData.questionId,
        categoryId: logData.categoryId,
        details: logData.details
      });
      
      res.status(201).json(gameLog);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.get('/api/games/:id/logs', async (req, res) => {
    try {
      const gameId = req.params.id;
      const logs = await storage.getGameLogs(gameId);
      res.json(logs);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return httpServer;
}
