import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useGame } from "@/lib/gameContext";
import { useLocation } from "wouter";

export default function GameSetup() {
  const [categoryCount, setCategoryCount] = useState(4);
  const [team1Name, setTeam1Name] = useState("الفريق الأزرق");
  const [team2Name, setTeam2Name] = useState("الفريق الأحمر");
  const { createGame, startGame, loading } = useGame();
  const [, navigate] = useLocation();

  const handleStartGame = async () => {
    const game = await createGame(categoryCount, team1Name, team2Name);
    if (game) {
      await startGame();
    }
  };

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

        <div className="bg-background-light rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-background-dark">
            إعداد اللعبة
          </h2>

          <div className="mb-6">
            <label className="block text-background-dark text-lg font-medium mb-2">
              اختر عدد الفئات
            </label>
            <div className="flex flex-wrap gap-4 justify-center">
              {[4, 5, 6, 7, 8].map((count) => (
                <Button
                  key={count}
                  variant={categoryCount === count ? "default" : "outline"}
                  className={`py-2 px-6 rounded-full ${
                    categoryCount === count
                      ? "bg-primary text-background-light font-bold"
                      : "bg-background-dark text-background-light font-bold hover:opacity-90"
                  }`}
                  onClick={() => setCategoryCount(count)}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-background-dark text-lg font-medium mb-2">
              اسم الفريق الأول
            </label>
            <Input
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-6">
            <label className="block text-background-dark text-lg font-medium mb-2">
              اسم الفريق الثاني
            </label>
            <Input
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="text-center">
            <Button
              onClick={handleStartGame}
              disabled={loading || !team1Name || !team2Name}
              className="py-3 px-8 bg-secondary text-background-light text-xl font-bold rounded-lg hover:bg-secondary-dark transition"
            >
              {loading ? "جاري التحميل..." : "ابدأ اللعبة"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
