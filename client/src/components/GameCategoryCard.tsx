import React from 'react';
import { useGame } from "@/lib/gameContext";
import { Category, Question } from "@/lib/types";
import { motion } from 'framer-motion';
import { 
  BookOpen, Atom, Globe, BookText, Trophy, Palette, 
  Cpu, Film, Music, Utensils, Calculator
} from 'lucide-react';

interface GameCategoryCardProps {
  category: Category;
}

export default function GameCategoryCard({ category }: GameCategoryCardProps) {
  const { game, selectCategory } = useGame();
  
  // تحديد الأيقونة المناسبة
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="h-6 w-6" />;
      case 'Atom': return <Atom className="h-6 w-6" />;
      case 'Globe': return <Globe className="h-6 w-6" />;
      case 'BookText': return <BookText className="h-6 w-6" />;
      case 'Trophy': return <Trophy className="h-6 w-6" />;
      case 'Palette': return <Palette className="h-6 w-6" />;
      case 'Cpu': return <Cpu className="h-6 w-6" />;
      case 'Film': return <Film className="h-6 w-6" />;
      case 'Music': return <Music className="h-6 w-6" />;
      case 'Utensils': return <Utensils className="h-6 w-6" />;
      case 'Calculator': return <Calculator className="h-6 w-6" />;
      default: return <BookOpen className="h-6 w-6" />;
    }
  };
  
  // حساب عدد الأسئلة المتبقية
  const remainingQuestions = () => {
    const team1Questions = category.questions.filter(q => q.teamId === game?.team1.id && !q.isAnswered);
    const team2Questions = category.questions.filter(q => q.teamId === game?.team2.id && !q.isAnswered);
    
    return {
      team1: team1Questions.length,
      team2: team2Questions.length,
      total: team1Questions.length + team2Questions.length
    };
  };
  
  const remaining = remainingQuestions();
  
  // تحديد إذا كانت الفئة مكتملة
  const isCompleted = remaining.total === 0;
  
  // تحديد لون الفئة بناءً على حالة الاكتمال
  const getCardColor = () => {
    if (isCompleted) return 'bg-gray-500/10 border-gray-400/40';
    return 'bg-primary/10 border-primary/40';
  };
  
  const handleClick = () => {
    if (!isCompleted && selectCategory) {
      selectCategory(category.name);
    }
  };
  
  return (
    <motion.div
      className={`p-4 border ${getCardColor()} rounded-lg shadow-md cursor-pointer
        ${isCompleted ? 'opacity-60' : 'hover:shadow-lg hover:border-primary'}
      `}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold">{category.name}</h3>
        <div className="p-2 rounded-full bg-primary/20">
          {getIcon('BookOpen')}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-lg">الأسئلة المتبقية: <strong>{remaining.total}</strong></p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-blue-600">
          <p>الفريق الأول: {remaining.team1}</p>
        </div>
        <div className="text-red-600">
          <p>الفريق الثاني: {remaining.team2}</p>
        </div>
      </div>
      
      {/* مؤشر حالة الإكمال */}
      {isCompleted && (
        <div className="mt-3 py-1 px-2 bg-gray-200 text-gray-600 rounded text-center">
          تم إكمال الفئة
        </div>
      )}
    </motion.div>
  );
}