import React from 'react';
import { useGame } from "@/lib/gameContext";
import { Category, Question } from "@/lib/types";
import { motion } from 'framer-motion';
import { 
  BookOpen, Atom, Globe, BookText, Trophy, Palette, 
  Cpu, Film, Music, Utensils, Calculator, FolderOpen, CheckCircle
} from 'lucide-react';

interface GameCategoryCardProps {
  category: Category;
}

export default function GameCategoryCard({ category }: GameCategoryCardProps) {
  const { game, selectCategory } = useGame();
  
  // تحديد الأيقونة المناسبة بناءً على اسم الفئة
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

  // تحديد الأيقونة بناءً على اسم الفئة
  const getCategoryIcon = () => {
    const name = category.name.toLowerCase();
    if (name.includes('history') || name.includes('تاريخ')) return 'BookOpen';
    if (name.includes('science') || name.includes('علوم')) return 'Atom';
    if (name.includes('geography') || name.includes('جغرافيا')) return 'Globe';
    if (name.includes('literature') || name.includes('أدب')) return 'BookText';
    if (name.includes('sports') || name.includes('رياضة')) return 'Trophy';
    if (name.includes('arts') || name.includes('فنون')) return 'Palette';
    if (name.includes('technology') || name.includes('تكنولوجيا')) return 'Cpu';
    if (name.includes('movies') || name.includes('أفلام')) return 'Film';
    if (name.includes('music') || name.includes('موسيقى')) return 'Music';
    if (name.includes('food') || name.includes('طعام')) return 'Utensils';
    if (name.includes('math') || name.includes('رياضيات')) return 'Calculator';
    return 'BookOpen';
  };
  
  // تحديد لون الفئة بناءً على اسمها
  const getCategoryColor = () => {
    const name = category.name.toLowerCase();
    if (name.includes('history') || name.includes('تاريخ')) return 'amber';
    if (name.includes('science') || name.includes('علوم')) return 'blue';
    if (name.includes('geography') || name.includes('جغرافيا')) return 'green';
    if (name.includes('literature') || name.includes('أدب')) return 'purple';
    if (name.includes('sports') || name.includes('رياضة')) return 'red';
    if (name.includes('arts') || name.includes('فنون')) return 'pink';
    if (name.includes('technology') || name.includes('تكنولوجيا')) return 'gray';
    if (name.includes('movies') || name.includes('أفلام')) return 'yellow';
    if (name.includes('music') || name.includes('موسيقى')) return 'indigo';
    if (name.includes('food') || name.includes('طعام')) return 'emerald';
    if (name.includes('math') || name.includes('رياضيات')) return 'cyan';
    return 'violet';
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
  
  // معالجة النقر على البطاقة
  const handleClick = () => {
    if (!isCompleted && selectCategory) {
      selectCategory(category.name);
    }
  };

  // الحصول على نسبة الأسئلة المجابة
  const completionPercentage = Math.round(
    ((6 - remaining.total) / 6) * 100
  );
  
  const color = getCategoryColor();
  const iconName = getCategoryIcon();
  
  return (
    <motion.div
      className={`category-card ${isCompleted ? 'opacity-75' : ''}`}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <div className={`p-6 h-full rounded-2xl relative overflow-hidden ${isCompleted ? 'bg-gray-100' : 'bg-white'}`}>
        {/* خلفية مموجة للبطاقة */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-${color}-100 opacity-50`}></div>
        <div className={`absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-${color}-50 opacity-50`}></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-2xl font-bold text-gray-800 ${isCompleted ? '' : `text-${color}-700`}`}>
              {category.name}
            </h3>
            
            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-gray-200' : `bg-${color}-100`}`}>
              {isCompleted ? 
                <CheckCircle className="h-7 w-7 text-gray-500" /> : 
                getIcon(iconName)
              }
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">إكتمال الفئة</span>
              <span className="text-sm font-medium text-gray-800">{completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div className={`progress-value ${isCompleted ? 'bg-gray-400' : `bg-${color}-500`}`} style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">
                  {game?.team1.name}: <span className="font-bold">{remaining.team1}</span>
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-red-600 mr-2"></div>
                <span className="text-sm text-gray-600">
                  {game?.team2.name}: <span className="font-bold">{remaining.team2}</span>
                </span>
              </div>
            </div>
          </div>
          
          {isCompleted && (
            <div className="absolute top-4 left-4 bg-gray-200 text-gray-600 rounded-full px-3 py-1 text-xs font-medium">
              تم الإكمال
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}