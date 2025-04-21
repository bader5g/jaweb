import { useGame } from "@/lib/gameContext";
import { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { game, selectCategory } = useGame();
  
  if (!game) return null;
  
  // Count answered questions for each team
  const team1Questions = category.questions.filter(q => q.teamId === game.team1.id);
  const team2Questions = category.questions.filter(q => q.teamId === game.team2.id);
  
  // Check if this category has available questions for current team
  const hasAvailableQuestions = category.questions.some(
    q => q.teamId === game.currentTeamId && !q.isAnswered
  );
  
  const handleCategoryClick = () => {
    if (!hasAvailableQuestions) return;
    selectCategory(category.name);
  };
  
  return (
    <div 
      className={`category-card bg-background-light rounded-lg shadow-lg overflow-hidden 
                ${hasAvailableQuestions ? 'cursor-pointer hover:shadow-xl' : 'opacity-60 cursor-not-allowed'}
                transition-all duration-200`} 
      onClick={handleCategoryClick}
    >
      <div className="bg-primary-light p-4">
        <h3 className="text-xl font-bold text-center text-background-light">{category.name}</h3>
      </div>
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{game.team1.name}</span>
          <span className="text-sm font-medium text-gray-600">{game.team2.name}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            {team1Questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`${getDifficultyClass(question.difficulty)} rounded p-2 w-full h-8 
                           ${question.isAnswered ? 'opacity-30' : 'opacity-100'}`}
              ></div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {team2Questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`${getDifficultyClass(question.difficulty)} rounded p-2 w-full h-8 
                           ${question.isAnswered ? 'opacity-30' : 'opacity-100'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get the difficulty class
function getDifficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'difficulty-easy';
    case 'medium':
      return 'difficulty-medium';
    case 'hard':
      return 'difficulty-hard';
    default:
      return 'difficulty-easy';
  }
}
