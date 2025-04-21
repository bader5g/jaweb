import { useGame } from "@/lib/gameContext";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { GameState } from "@/lib/types";
import ScoreBoard from "@/components/ScoreBoard";
import CategoryCard from "@/components/CategoryCard";
import DifficultySelector from "@/components/DifficultySelector";
import QuestionCard from "@/components/QuestionCard";
import GameEnd from "@/components/GameEnd";
import { Skeleton } from "@/components/ui/skeleton";

export default function GamePlay() {
  const { game, loading } = useGame();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!game && !loading) {
      navigate("/");
    }
  }, [game, loading, navigate]);

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-background-dark p-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-20 w-full mb-8" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-background-light mb-2">
            لعبة الأسئلة والأجوبة
          </h1>
          <p className="text-xl text-background-light opacity-80">
            تنافس مع فريقك واختبر معلوماتك
          </p>
        </header>

        {/* Show different screens based on game state */}
        {game.state === GameState.CATEGORY_SELECTION && (
          <div id="category-selection">
            <ScoreBoard />
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-background-light">
              اختر فئة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {game.categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        )}

        {game.state === GameState.DIFFICULTY_SELECTION && (
          <DifficultySelector />
        )}

        {game.state === GameState.QUESTION && (
          <div id="question-screen">
            <ScoreBoard />
            <QuestionCard />
          </div>
        )}

        {game.state === GameState.END && <GameEnd />}
      </div>
    </div>
  );
}
