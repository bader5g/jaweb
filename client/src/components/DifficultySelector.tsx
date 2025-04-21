import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { DifficultyLevel } from "@/lib/types";

export default function DifficultySelector() {
  const { game, selectDifficulty } = useGame();
  
  if (!game || !game.currentCategory) return null;
  
  const handleDifficultyClick = (difficulty: string) => {
    selectDifficulty(difficulty);
  };
  
  // Check available difficulty levels for current team and category
  const getAvailableDifficulties = () => {
    const category = game.categories.find(c => c.name === game.currentCategory);
    if (!category) return [];
    
    return Object.values(DifficultyLevel).filter(difficulty => {
      return category.questions.some(
        q => q.difficulty === difficulty && 
             q.teamId === game.currentTeamId &&
             !q.isAnswered
      );
    });
  };
  
  const availableDifficulties = getAvailableDifficulties();
  
  const handleBackClick = () => {
    selectDifficulty('');  // This will go back to category selection
  };
  
  return (
    <div className="bg-background-light rounded-lg shadow-lg p-6">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-background-dark">
        اختر مستوى الصعوبة
      </h2>
      <h3 className="text-xl font-bold text-center mb-6 text-background-dark">
        الفئة: <span>{game.currentCategory}</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {Object.values(DifficultyLevel).map(difficulty => {
          const isAvailable = availableDifficulties.includes(difficulty);
          const difficultyLabel = getDifficultyLabel(difficulty);
          const points = getDifficultyPoints(difficulty);
          
          return (
            <Button
              key={difficulty}
              onClick={() => isAvailable && handleDifficultyClick(difficulty)}
              disabled={!isAvailable}
              className={`p-6 rounded-lg shadow-md hover:shadow-lg text-xl font-bold text-background-light transition
                        ${getDifficultyClass(difficulty)}
                        ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {difficultyLabel}
              <div className="text-sm mt-2">{points} نقطة</div>
            </Button>
          );
        })}
      </div>
      
      <div className="text-center">
        <Button
          onClick={handleBackClick}
          className="py-2 px-6 bg-background-dark text-background-light font-bold rounded-lg hover:opacity-90 transition"
        >
          العودة للفئات
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function getDifficultyClass(difficulty: string): string {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return 'difficulty-easy';
    case DifficultyLevel.MEDIUM:
      return 'difficulty-medium';
    case DifficultyLevel.HARD:
      return 'difficulty-hard';
    default:
      return 'difficulty-easy';
  }
}

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return 'سهل';
    case DifficultyLevel.MEDIUM:
      return 'متوسط';
    case DifficultyLevel.HARD:
      return 'صعب';
    default:
      return 'سهل';
  }
}

function getDifficultyPoints(difficulty: string): number {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return 1;
    case DifficultyLevel.MEDIUM:
      return 2;
    case DifficultyLevel.HARD:
      return 3;
    default:
      return 1;
  }
}
