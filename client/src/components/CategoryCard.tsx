import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Atom, Globe, BookText, Trophy, Palette, 
  Cpu, Film, Music, Utensils, Calculator, 
  ArrowRight, CheckCircle, Star
} from 'lucide-react';
import { Badge } from "./ui/badge";
import { CategoryUI, DifficultyLevel } from "@shared/schema";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    nameAr: string;
    icon: string;
    color: string;
    description?: string;
    descriptionAr?: string;
    difficultyLevel: string;
    questionCount?: number;
    isActive?: boolean;
    imageUrl?: string;
    parentId?: number | null;
    order?: number;
    children?: Array<any>;
  };
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

export default function CategoryCard({ 
  category, 
  isSelected = false, 
  onSelect 
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // تحديد الأيقونة المناسبة بناءً على اسم الأيقونة المخزن في البيانات
  const getIcon = () => {
    switch (category.icon) {
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

  // الحصول على لون خلفية الفئة
  const getBgColor = () => {
    // استخدم مخطط الألوان المثبت لإرجاع فئة CSS المناسبة
    return colorMap[category.color] || 'bg-gray-500'; // استخدم رمادي كلون افتراضي
  };
  
  // مخطط الألوان المثبت
  const colorMap: Record<string, string> = {
    'amber-600': 'bg-amber-600',
    'blue-500': 'bg-blue-500',
    'green-500': 'bg-green-500',
    'purple-600': 'bg-purple-600',
    'red-500': 'bg-red-500',
    'pink-500': 'bg-pink-500',
    'gray-700': 'bg-gray-700',
    'yellow-600': 'bg-yellow-600',
    'indigo-500': 'bg-indigo-500',
    'green-600': 'bg-green-600',
    'blue-600': 'bg-blue-600',
    'teal-600': 'bg-teal-600',
  };

  // الحصول على شريحة صعوبة الفئة
  const getDifficultyBadge = () => {
    switch(category.difficultyLevel) {
      case DifficultyLevel.EASY:
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">سهل</Badge>;
      case DifficultyLevel.MEDIUM:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">متوسط</Badge>;
      case DifficultyLevel.HARD:
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">صعب</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">سهل</Badge>;
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl shadow-lg transition-all cursor-pointer
        ${isSelected ? 'ring-4 ring-primary' : 'hover:shadow-xl'}
        ${isHovered ? 'scale-105' : 'scale-100'}
      `}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      onClick={() => onSelect && onSelect(category.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* خلفية البطاقة مع تدرج */}
      <div className={`absolute inset-0 opacity-20 ${getBgColor()}`}></div>
      
      {/* علامة التحديد (إذا كانت محددة) */}
      {isSelected && (
        <div className="absolute top-2 right-2 text-primary">
          <CheckCircle className="h-6 w-6 animate-pulse" />
        </div>
      )}
      
      <div className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full flex flex-col">
        {/* رأس البطاقة مع الأيقونة أو الصورة المخصصة */}
        <div className="flex items-center gap-4 mb-3">
          {category.imageUrl ? (
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={category.imageUrl} 
                alt={category.nameAr} 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className={`p-3 rounded-full ${getBgColor()} text-white`}>
              {getIcon()}
            </div>
          )}
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{category.nameAr}</h3>
              
              {/* إذا كان التصنيف له تصنيفات فرعية أو له أب */}
              {(category.children?.length || category.parentId) && (
                <div className="flex items-center">
                  {category.parentId && (
                    <Badge variant="outline" className="mr-2">تصنيف فرعي</Badge>
                  )}
                  {category.children?.length ? (
                    <Badge variant="secondary" className="bg-primary/10 text-primary flex items-center gap-1">
                      {category.children.length} فرعي
                    </Badge>
                  ) : null}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {category.questionCount && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />{category.questionCount} سؤال
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* وصف الفئة */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
          {category.descriptionAr}
        </p>

        {/* زر الاختيار (يظهر عند التحويم) */}
        {(isHovered || isSelected) && onSelect && (
          <motion.div 
            className="text-primary flex items-center font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSelected ? 'تم الاختيار' : 'اختر هذه الفئة'} 
            <ArrowRight className="h-4 w-4 mr-1" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}