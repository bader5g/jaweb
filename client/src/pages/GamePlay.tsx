import { useGame } from "@/lib/gameContext";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { GameState } from "@/lib/types";
import ScoreBoard from "@/components/ScoreBoard";
import GameCategoryCard from "@/components/GameCategoryCard";
import DifficultySelector from "@/components/DifficultySelector";
import QuestionCard from "@/components/QuestionCard";
import GameEnd from "@/components/GameEnd";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GamePlay() {
  const { game, loading, startNewGame } = useGame();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!game && !loading) {
      navigate("/");
    }
  }, [game, loading, navigate]);

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-hero-pattern p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <Skeleton className="h-20 w-full mb-8 rounded-xl" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-4 rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-pattern">
      <div className="max-w-7xl mx-auto px-4 py-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (window.confirm("هل أنت متأكد من العودة للصفحة الرئيسية؟ سيتم فقدان تقدم اللعبة الحالية.")) {
                startNewGame();
              }
            }}
            className="flex items-center gap-2 hover:bg-white/20 text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>العودة للرئيسية</span>
          </Button>

          <div className="flex items-center">
            <span className="bg-white/80 text-primary px-4 py-1 rounded-full text-sm font-medium shadow">
              معرف اللعبة: {game.id.substring(0, 8)}
            </span>
          </div>
        </div>

        <header className="text-center mb-8 bg-glass py-8 rounded-xl shadow-lg border border-white/30 animate-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-purple-500/20"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold text-emerald-600 dark:text-emerald-400 drop-shadow-lg">
              {game.name || "لعبة الأسئلة والأجوبة"}
            </h1>
          </div>
        </header>

        <div className="bg-glass rounded-2xl p-6 shadow-lg border border-white/30 relative overflow-hidden mb-8">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-400/10 blur-3xl rounded-full"></div>

          <div className="relative z-10">
            {/* عرض شاشات مختلفة بناءً على حالة اللعبة */}
            {(game.state === GameState.CATEGORY_SELECTION || game.state === GameState.DIFFICULTY_SELECTION) && (
              <div id="category-selection" className="staggered-animation">
                <ScoreBoard />
                <div className="mt-8 mb-4 flex justify-between items-center">
                  <Link to="/questions">
                    <Button className="flex items-center space-x-2 bg-primary/80 hover:bg-primary">
                      <span className="ml-2">بنك الأسئلة</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {game.categories.map((category) => (
                    <div className="animate-slide-up" key={category.id}>
                      <GameCategoryCard category={category} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {game.state === GameState.QUESTION && (
              <div id="question-screen" className="animate-slide-up">
                <ScoreBoard />
                <QuestionCard />
              </div>
            )}

            {game.state === GameState.END && (
              <div className="animate-slide-up">
                <ScoreBoard />
                <GameEnd />
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}