import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import { Game, GameState, Question } from "./types";
import { useLocation } from "wouter";

interface GameContextType {
  game: Game | null;
  loading: boolean;
  error: string | null;
  createGame: (categoryCount: number, team1Name: string, team2Name: string, answerTime: number, gameName?: string, selectedCategories?: number[]) => Promise<Game | null>;
  joinGame: (gameId: string) => void;
  startGame: () => Promise<void>;
  selectCategory: (categoryName: string) => Promise<boolean | undefined>;
  selectDifficulty: (difficulty: string) => Promise<boolean | undefined>;
  answerQuestion: (questionId: number, isCorrect: boolean) => Promise<void>;
  updateTeamScore: (teamId: number, changeAmount: number) => Promise<void>;
  endGame: () => Promise<void>;
  startNewGame: () => void;
  getCurrentQuestion: () => Question | null;
  getCurrentTeam: () => { id: number; name: string; score: number } | null;
  isGameCompleted: () => boolean;
  createGameLog: (action: string, details?: Record<string, any>, teamId?: number, questionId?: number, categoryId?: number) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // الإعداد ومحاولة إعادة الاتصال بـ WebSocket
  useEffect(() => {
    // تتبع محاولات الاتصال ومؤقت إعادة المحاولة
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimer: NodeJS.Timeout | null = null;
    
    const connectWebSocket = () => {
      try {
        // تحديد بروتوكول الاتصال بناء على الموقع
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        console.log('Connecting to WebSocket at:', wsUrl);
        
        const ws = new WebSocket(wsUrl);
        
        // معالجة فتح الاتصال
        ws.onopen = () => {
          console.log('WebSocket connection established');
          reconnectAttempts = 0; // إعادة تعيين محاولات الاتصال عند النجاح
          
          // إذا كانت هناك لعبة مُعرّفة، أرسل طلب الانضمام
          if (game?.id) {
            ws.send(JSON.stringify({ type: 'join', gameId: game.id }));
          }
        };
        
        // معالجة الرسائل الواردة
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'game_state') {
              setGame(data.game);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        // معالجة أخطاء الاتصال
        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
        };
        
        // معالجة إغلاق الاتصال
        ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          setSocket(null);
          
          // محاولة إعادة الاتصال إذا كانت هناك محاولات متبقية
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = 2000; // ثابت 2 ثانية
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
            
            reconnectTimer = setTimeout(() => {
              connectWebSocket();
            }, delay);
          } else {
            toast({
              title: "فشل الاتصال",
              description: "تعذر الاتصال بالخادم بعد عدة محاولات",
              variant: "destructive"
            });
          }
        };
        
        setSocket(ws);
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        toast({
          title: "خطأ في الاتصال",
          description: "تعذر الاتصال بالخادم",
          variant: "destructive"
        });
      }
    };
    
    // إنشاء الاتصال فقط إذا لم يكن موجوداً بالفعل
    if (!socket) {
      connectWebSocket();
    }
    
    // تنظيف عند تفكيك المكون
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      if (socket) {
        console.log('Closing WebSocket connection');
        socket.close();
      }
    };
  }, [toast, navigate]);

  const createGame = async (categoryCount: number, team1Name: string, team2Name: string, answerTime: number, gameName?: string, selectedCategories?: number[]): Promise<Game | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await apiRequest('POST', '/api/games', {
        categoryCount,
        team1Name,
        team2Name,
        answerTime,
        name: gameName,
        selectedCategories
      });
      
      const newGame = await res.json();
      setGame(newGame);
      
      // إرسال معلومات اللعبة إلى WebSocket
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'join', gameId: newGame.id }));
      }
      
      // تحويل المستخدم إلى صفحة اللعب مباشرة
      navigate('/play');
      
      // عرض رسالة نجاح
      toast({
        title: "تم إنشاء اللعبة",
        description: `تم إنشاء اللعبة "${gameName || 'لعبة جديدة'}" بنجاح!`,
        variant: "default"
      });
      
      return newGame;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء اللعبة';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinGame = (gameId: string) => {
    setLoading(true);
    
    apiRequest('GET', `/api/games/${gameId}`)
      .then(res => res.json())
      .then(gameData => {
        setGame(gameData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to join game');
        setLoading(false);
        toast({
          title: "خطأ",
          description: "فشل في الانضمام إلى اللعبة",
          variant: "destructive"
        });
      });
  };

  const startGame = async () => {
    if (!game) return;
    
    setLoading(true);
    
    try {
      await apiRequest('POST', `/api/games/${game.id}/start`);
      
      // إنشاء سجل لبدء اللعبة
      await createGameLog('start_game', {
        gameName: game.name || 'لعبة جديدة',
        team1: game.team1.name,
        team2: game.team2.name,
        categoryCount: game.categoryCount,
        answerTime: game.answerTime
      });
      
      // تحويل المستخدم إلى صفحة اللعبة
      navigate('/play');
      
      // عرض رسالة ترحيبية في حالة نجاح بدء اللعبة
      toast({
        title: "تم بدء اللعبة",
        description: `اللعبة جاهزة! جاري تحميل اللعبة "${game.name || 'لعبة جديدة'}"`,
        variant: "default"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء بدء اللعبة';
      setError(errorMessage);
      toast({
        title: "خطأ في بدء اللعبة",
        description: errorMessage,
        variant: "destructive"
      });
      
      // في حالة الفشل، نمنح المستخدم فرصة أخرى للمحاولة
      setTimeout(() => {
        toast({
          title: "إعادة المحاولة",
          description: "يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية",
          variant: "default",
          action: (
            <button 
              onClick={() => navigate('/')}
              className="bg-primary text-white px-4 py-2 rounded-md text-xs"
            >
              العودة للرئيسية
            </button>
          )
        });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = async (categoryName: string) => {
    if (!game) return;
    
    try {
      await apiRequest('PUT', `/api/games/${game.id}/current-category`, { category: categoryName });
      await apiRequest('PUT', `/api/games/${game.id}/state`, { state: GameState.DIFFICULTY_SELECTION });
      
      // تسجيل اختيار الفئة
      const category = game.categories.find(c => c.name === categoryName);
      await createGameLog('select_category', {
        categoryName,
        categoryId: category?.id,
        teamName: getCurrentTeam()?.name
      }, game.currentTeamId, undefined, category?.id);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء اختيار الفئة';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const selectDifficulty = async (difficulty: string) => {
    if (!game) return;
    
    try {
      await apiRequest('PUT', `/api/games/${game.id}/current-difficulty`, { difficulty });
      await apiRequest('PUT', `/api/games/${game.id}/state`, { state: GameState.QUESTION });
      
      // تسجيل اختيار مستوى الصعوبة
      const category = game.categories.find(c => c.name === game.currentCategory);
      await createGameLog('select_difficulty', {
        difficulty,
        categoryName: game.currentCategory,
        teamName: getCurrentTeam()?.name
      }, game.currentTeamId, undefined, category?.id);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء اختيار المستوى';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const updateTeamScore = async (teamId: number, changeAmount: number) => {
    if (!game) return;
    
    try {
      // تحديد الفريق
      const team = teamId === game.team1.id ? game.team1 : game.team2;
      
      // حساب النقاط الجديدة
      const newScore = team.score + changeAmount;
      
      // لا نسمح بالنقاط السلبية
      const finalScore = Math.max(0, newScore);
      
      // استدعاء API لتحديث النقاط
      await apiRequest('PUT', `/api/teams/${teamId}/score`, { 
        points: finalScore, 
        gameId: game.id,
        direct: true // علامة تشير إلى أن هذا تحديث مباشر للنقاط
      });
      
      // تحديث الحالة المحلية (سيتم استبدالها بالتحديث من الخادم لاحقًا)
      if (game.team1.id === teamId) {
        setGame({
          ...game,
          team1: {
            ...game.team1,
            score: finalScore
          }
        });
      } else {
        setGame({
          ...game,
          team2: {
            ...game.team2,
            score: finalScore
          }
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث النقاط';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const answerQuestion = async (questionId: number, isCorrect: boolean) => {
    if (!game) return;
    
    try {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) return;
      
      // Mark question as answered
      await apiRequest('PUT', `/api/questions/${questionId}/answered`, { gameId: game.id });
      
      // تسجيل الإجابة على السؤال
      const category = game.categories.find(c => c.name === game.currentCategory);
      await createGameLog('answer_question', {
        isCorrect,
        questionText: currentQuestion.text,
        difficulty: currentQuestion.difficulty,
        categoryName: game.currentCategory,
        teamName: getCurrentTeam()?.name,
        points: isCorrect ? currentQuestion.points : 0
      }, game.currentTeamId, questionId, category?.id);
      
      // Update score if correct
      if (isCorrect) {
        const points = currentQuestion.points;
        await apiRequest('PUT', `/api/teams/${game.currentTeamId}/score`, { 
          points, 
          gameId: game.id 
        });
      }
      
      // Switch teams
      const nextTeamId = game.currentTeamId === game.team1.id ? game.team2.id : game.team1.id;
      await apiRequest('PUT', `/api/games/${game.id}/current-team`, { teamId: nextTeamId });
      
      // Go back to category selection
      await apiRequest('PUT', `/api/games/${game.id}/state`, { state: GameState.CATEGORY_SELECTION });
      
      // Check if game is complete
      setTimeout(() => {
        if (game && isGameCompleted()) {
          endGame();
        }
      }, 300);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء الإجابة';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const endGame = async () => {
    if (!game) return;
    
    try {
      await apiRequest('POST', `/api/games/${game.id}/end`);
      
      // تسجيل انتهاء اللعبة
      await createGameLog('end_game', {
        team1Score: game.team1.score,
        team2Score: game.team2.score,
        winner: game.team1.score > game.team2.score ? game.team1.name : 
                game.team1.score < game.team2.score ? game.team2.name : 'تعادل',
        gameDuration: new Date().getTime() - new Date().getTime() // لا نستطيع حساب المدة بدقة هنا
      });
      
      toast({
        title: "انتهت اللعبة",
        description: `انتهت اللعبة بنتيجة: ${game.team1.name} (${game.team1.score}) - ${game.team2.name} (${game.team2.score})`,
        variant: "default"
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء إنهاء اللعبة';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const startNewGame = () => {
    setGame(null);
    navigate('/');
  };

  const getCurrentQuestion = (): Question | null => {
    if (!game || !game.currentCategory || !game.currentDifficulty) return null;
    
    const category = game.categories.find(c => c.name === game.currentCategory);
    if (!category) return null;
    
    return category.questions.find(
      q => q.difficulty === game.currentDifficulty && 
           q.teamId === game.currentTeamId && 
           !q.isAnswered
    ) || null;
  };

  const getCurrentTeam = () => {
    if (!game) return null;
    return game.currentTeamId === game.team1.id ? game.team1 : game.team2;
  };

  const isGameCompleted = (): boolean => {
    if (!game) return false;
    
    // Check if all questions are answered
    for (const category of game.categories) {
      for (const question of category.questions) {
        if (!question.isAnswered) {
          return false;
        }
      }
    }
    
    return true;
  };

  // وظيفة إنشاء سجل للعبة
  const createGameLog = async (
    action: string,
    details?: Record<string, any>,
    teamId?: number,
    questionId?: number,
    categoryId?: number
  ) => {
    if (!game) return;
    
    try {
      await apiRequest('POST', `/api/games/${game.id}/logs`, {
        action,
        teamId,
        questionId,
        categoryId,
        details
      });
    } catch (error) {
      console.error('Error creating game log:', error);
    }
  };

  return (
    <GameContext.Provider
      value={{
        game,
        loading,
        error,
        createGame,
        joinGame,
        startGame,
        selectCategory,
        selectDifficulty,
        answerQuestion,
        updateTeamScore,
        endGame,
        startNewGame,
        getCurrentQuestion,
        getCurrentTeam,
        isGameCompleted,
        createGameLog
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
