import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import { Game, GameState, Question } from "./types";
import { useLocation } from "wouter";

interface GameContextType {
  game: Game | null;
  loading: boolean;
  error: string | null;
  createGame: (categoryCount: number, team1Name: string, team2Name: string, answerTime: number, gameName?: string) => Promise<Game | null>;
  joinGame: (gameId: string) => void;
  startGame: () => Promise<void>;
  selectCategory: (categoryName: string) => Promise<void>;
  selectDifficulty: (difficulty: string) => Promise<void>;
  answerQuestion: (questionId: number, isCorrect: boolean) => Promise<void>;
  updateTeamScore: (teamId: number, changeAmount: number) => Promise<void>;
  endGame: () => Promise<void>;
  startNewGame: () => void;
  getCurrentQuestion: () => Question | null;
  getCurrentTeam: () => { id: number; name: string; score: number } | null;
  isGameCompleted: () => boolean;
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

  const createGame = async (categoryCount: number, team1Name: string, team2Name: string, answerTime: number, gameName?: string): Promise<Game | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await apiRequest('POST', '/api/games', {
        categoryCount,
        team1Name,
        team2Name,
        answerTime,
        name: gameName
      });
      
      const newGame = await res.json();
      setGame(newGame);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء اختيار الفئة';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const selectDifficulty = async (difficulty: string) => {
    if (!game) return;
    
    try {
      await apiRequest('PUT', `/api/games/${game.id}/current-difficulty`, { difficulty });
      await apiRequest('PUT', `/api/games/${game.id}/state`, { state: GameState.QUESTION });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء اختيار المستوى';
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
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
        isGameCompleted
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
