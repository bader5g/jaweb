import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { DifficultyLevel } from "@/lib/types";
import { ArrowLeft, Award, BarChart2, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function DifficultySelector() {
  const { game, selectDifficulty } = useGame();
  
  if (!game || !game.currentCategory) return null;
  
  const handleDifficultyClick = (difficulty: string) => {
    selectDifficulty(difficulty);
  };
  
  // تحقق من مستويات الصعوبة المتاحة للفريق الحالي والفئة
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
    // العودة إلى اختيار الفئة
    selectDifficulty('');
  };
  
  // الحصول على اسم الفريق الحالي
  const currentTeam = game.currentTeamId === game.team1.id ? game.team1 : game.team2;
  const teamColor = game.currentTeamId === game.team1.id ? 'text-blue-500' : 'text-red-500';
  
  return (
    <div className="bg-background-light rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-background-dark">
          اختر مستوى الصعوبة
        </h2>
        <p className="text-gray-600 mb-2">
          فريق: <span className={`font-bold ${teamColor}`}>{currentTeam.name}</span>
        </p>
        <h3 className="text-xl font-bold text-center mb-2 text-background-dark">
          الفئة: <span className="text-primary">{game.currentCategory}</span>
        </h3>
        <p className="text-gray-500 text-sm">كلما زاد مستوى الصعوبة، زادت النقاط التي يمكن الحصول عليها</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {Object.values(DifficultyLevel).map(difficulty => {
          const isAvailable = availableDifficulties.includes(difficulty);
          const difficultyLabel = getDifficultyLabel(difficulty);
          const points = getDifficultyPoints(difficulty);
          const { icon, bgColor, textColor, borderColor } = getDifficultyStyles(difficulty);
          
          return (
            <motion.div
              key={difficulty}
              whileHover={{ scale: isAvailable ? 1.05 : 1 }}
              whileTap={{ scale: isAvailable ? 0.98 : 1 }}
            >
              <Button
                onClick={() => isAvailable && handleDifficultyClick(difficulty)}
                disabled={!isAvailable}
                className={`w-full h-40 ${bgColor} ${textColor} ${borderColor} 
                  border-2 rounded-xl shadow-lg text-xl font-bold transition-all
                  ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  {icon}
                  <div className="text-xl font-bold">{difficultyLabel}</div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" fill="currentColor" />
                    <span className="text-sm">{points} نقطة</span>
                  </div>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
      
      <div className="text-center">
        <Button
          onClick={handleBackClick}
          className="py-2 px-6 bg-gray-100 text-gray-800 border border-gray-300 font-medium rounded-lg hover:bg-gray-200 transition-all"
        >
          <ArrowLeft className="h-5 w-5 ml-2" /> العودة للفئات
        </Button>
      </div>
    </div>
  );
}

// دالات مساعدة
function getDifficultyStyles(difficulty: string): {
  icon: JSX.Element;
  bgColor: string;
  textColor: string;
  borderColor: string;
} {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return {
        icon: <Award className="h-8 w-8" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300'
      };
    case DifficultyLevel.MEDIUM:
      return {
        icon: <BarChart2 className="h-8 w-8" />,
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300'
      };
    case DifficultyLevel.HARD:
      return {
        icon: <Star className="h-8 w-8" />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300'
      };
    default:
      return {
        icon: <Award className="h-8 w-8" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300'
      };
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
