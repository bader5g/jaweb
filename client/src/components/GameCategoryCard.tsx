import React, { useState } from 'react';
import { useGame } from "@/lib/gameContext";
import { Category, Question, DifficultyLevel } from "@/lib/types";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Atom, Globe, BookText, Trophy, Palette, 
  Cpu, Film, Music, Utensils, Calculator, CheckCircle,
  ChevronDown, ChevronUp, Check, X, HelpCircle, Star
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GameCategoryCardProps {
  category: Category;
}

export default function GameCategoryCard({ category }: GameCategoryCardProps) {
  const { game, selectCategory, selectDifficulty } = useGame();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

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
    const nameLower = category.name.toLowerCase();
    if (nameLower.includes('history') || nameLower.includes('تاريخ')) return 'BookOpen';
    if (nameLower.includes('science') || nameLower.includes('علوم')) return 'Atom';
    if (nameLower.includes('geography') || nameLower.includes('جغرافيا')) return 'Globe';
    if (nameLower.includes('literature') || nameLower.includes('أدب')) return 'BookText';
    if (nameLower.includes('sports') || nameLower.includes('رياضة')) return 'Trophy';
    if (nameLower.includes('arts') || nameLower.includes('فنون')) return 'Palette';
    if (nameLower.includes('technology') || nameLower.includes('تكنولوجيا')) return 'Cpu';
    if (nameLower.includes('movies') || nameLower.includes('أفلام')) return 'Film';
    if (nameLower.includes('music') || nameLower.includes('موسيقى')) return 'Music';
    if (nameLower.includes('food') || nameLower.includes('طعام')) return 'Utensils';
    if (nameLower.includes('math') || nameLower.includes('رياضيات')) return 'Calculator';
    return 'BookOpen';
  };

  // تحديد لون الفئة بناءً على اسمها
  const getCategoryColor = () => {
    const nameLower = category.name.toLowerCase();
    if (nameLower.includes('history') || nameLower.includes('تاريخ')) return 'amber';
    if (nameLower.includes('science') || nameLower.includes('علوم')) return 'blue';
    if (nameLower.includes('geography') || nameLower.includes('جغرافيا')) return 'green';
    if (nameLower.includes('literature') || nameLower.includes('أدب')) return 'purple';
    if (nameLower.includes('sports') || nameLower.includes('رياضة')) return 'red';
    if (nameLower.includes('arts') || nameLower.includes('فنون')) return 'pink';
    if (nameLower.includes('technology') || nameLower.includes('تكنولوجيا')) return 'gray';
    if (nameLower.includes('movies') || nameLower.includes('أفلام')) return 'yellow';
    if (nameLower.includes('music') || nameLower.includes('موسيقى')) return 'indigo';
    if (nameLower.includes('food') || nameLower.includes('طعام')) return 'emerald';
    if (nameLower.includes('math') || nameLower.includes('رياضيات')) return 'cyan';
    return 'violet';
  };

  const color = getCategoryColor();
  const iconName = getCategoryIcon();

  // تجميع الأسئلة حسب الصعوبة والفريق
  const getQuestionsByDifficulty = () => {
    const result = {
      easy: {
        team1: [] as Question[],
        team2: [] as Question[]
      },
      medium: {
        team1: [] as Question[],
        team2: [] as Question[]
      },
      hard: {
        team1: [] as Question[],
        team2: [] as Question[]
      }
    };

    // ملاحظة: في قاعدة البيانات، الأسئلة تم تخزينها بمعرفات 1 و 2 للفرق
    // ولكن معرفات الفرق الفعلية قد تكون مختلفة
    category.questions.forEach(q => {
      const team = q.teamId === 1 ? 'team1' : 'team2';
      if (q.difficulty === DifficultyLevel.EASY) {
        result.easy[team].push(q);
      } else if (q.difficulty === DifficultyLevel.MEDIUM) {
        result.medium[team].push(q);
      } else if (q.difficulty === DifficultyLevel.HARD) {
        result.hard[team].push(q);
      }
    });

    return result;
  };

  const questionsByDifficulty = getQuestionsByDifficulty();

  // حساب عدد الأسئلة المتبقية
  const remainingQuestions = () => {
    const team1Questions = category.questions.filter(q => q.teamId === 1 && !q.isAnswered);
    const team2Questions = category.questions.filter(q => q.teamId === 2 && !q.isAnswered);

    return {
      team1: team1Questions.length,
      team2: team2Questions.length,
      total: team1Questions.length + team2Questions.length
    };
  };

  const remaining = remainingQuestions();
  const isCompleted = remaining.total === 0;

  // معالجة النقر على البطاقة - توسيع/تضييق البطاقة
  const handleCardClick = () => {
    if (!isCompleted) {
      setIsExpanded(!isExpanded);
    }
  };

  // معالجة اختيار المستوى
  const handleSelectDifficulty = async (difficultyLevel: string) => {
    try {
      if (!isCompleted) {
        console.log("سيتم اختيار الفئة:", category.name);
        toast({
          title: "جاري تحميل السؤال",
          description: `من فئة ${category.name} بمستوى ${getDifficultyLabel(difficultyLevel)}`,
        });

        // أولاً: اختيار الفئة
        const categorySuccess = await selectCategory(category.name);
        console.log("نتيجة اختيار الفئة:", categorySuccess);
        
        if (categorySuccess) {
          console.log("سيتم اختيار المستوى:", difficultyLevel);
          // ثانياً: اختيار مستوى الصعوبة
          const difficultySuccess = await selectDifficulty(difficultyLevel);
          console.log("نتيجة اختيار المستوى:", difficultySuccess);
          
          if (!difficultySuccess) {
            toast({
              title: "تعذر اختيار المستوى",
              description: "حدث خطأ أثناء محاولة اختيار مستوى الصعوبة. يرجى المحاولة مرة أخرى.",
              variant: "destructive"
            });
          }
          // عند نجاح اختيار المستوى، سيتغير state تلقائياً وسيظهر السؤال
        } else {
          toast({
            title: "تعذر اختيار الفئة",
            description: "حدث خطأ أثناء محاولة اختيار الفئة. يرجى المحاولة مرة أخرى.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("خطأ في العملية:", error);
      toast({
        title: "خطأ في العملية",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  // تحويل المستوى إلى عنوان بالعربية
  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY: return 'سهل';
      case DifficultyLevel.MEDIUM: return 'متوسط';
      case DifficultyLevel.HARD: return 'صعب';
      default: return 'غير محدد';
    }
  };

  // تحديد لون خلفية زر المستوى
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'bg-green-600 hover:bg-green-700';
      case DifficultyLevel.MEDIUM:
        return 'bg-yellow-600 hover:bg-yellow-700';
      case DifficultyLevel.HARD:
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-primary hover:bg-primary-dark';
    }
  };

  // التحقق مما إذا كان السؤال متاحاً للفريق الحالي
  const isQuestionAvailableForCurrentTeam = (difficulty: string): boolean => {
    if (!game) return false;

    const currentTeamId = game.currentTeamId;
    const teamKey = currentTeamId === game.team1.id ? 'team1' : 'team2';

    let questions;
    if (difficulty === DifficultyLevel.EASY) {
      questions = questionsByDifficulty.easy[teamKey];
    } else if (difficulty === DifficultyLevel.MEDIUM) {
      questions = questionsByDifficulty.medium[teamKey];
    } else if (difficulty === DifficultyLevel.HARD) {
      questions = questionsByDifficulty.hard[teamKey];
    } else {
      return false;
    }

    return questions.some(q => !q.isAnswered);
  };

  // الحصول على أيقونة حالة السؤال
  const getQuestionStatusIcon = (difficulty: string) => {
    if (!game) return <HelpCircle className="h-4 w-4 text-gray-400" />;

    const currentTeamId = game.currentTeamId;
    const teamKey = currentTeamId === game.team1.id ? 'team1' : 'team2';
    
    let questions;
    if (difficulty === DifficultyLevel.EASY) {
      questions = questionsByDifficulty.easy[teamKey];
    } else if (difficulty === DifficultyLevel.MEDIUM) {
      questions = questionsByDifficulty.medium[teamKey];
    } else if (difficulty === DifficultyLevel.HARD) {
      questions = questionsByDifficulty.hard[teamKey];
    } else {
      return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }

    if (!questions || questions.length === 0) {
      return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }

    const question = questions[0];
    if (!question.isAnswered) {
      return null; // لا حاجة لأيقونة
    }

    return <Check className="h-4 w-4 text-white mr-1" />;
  };

  const currentTeamName = game?.currentTeamId === game?.team1.id ? game?.team1.name : game?.team2.name;

  return (
    <motion.div
      className={`category-card rounded-2xl shadow-md overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={!isExpanded ? handleCardClick : undefined}
      layout="position"
    >
      <div 
        className={`p-6 relative overflow-hidden ${isCompleted ? 'bg-gray-100' : 'bg-white'}`}
      >
        {/* خلفية مموجة للبطاقة */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-${color}-100 opacity-50`}></div>
        <div className={`absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-${color}-50 opacity-50`}></div>

        <div className="relative z-10">
          {/* عنوان الفئة وأيقونتها */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-2xl font-bold ${isCompleted ? 'text-gray-500' : `text-${color}-700`}`}>
              {category.name}
            </h3>

            <div 
              className={`p-3 rounded-xl ${isCompleted ? 'bg-gray-200' : `bg-${color}-100`}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isCompleted) setIsExpanded(!isExpanded);
              }}
            >
              {isCompleted ? 
                <CheckCircle className="h-7 w-7 text-gray-500" /> : 
                isExpanded ? <ChevronUp className="h-7 w-7" /> : <ChevronDown className="h-7 w-7" />
              }
            </div>
          </div>

          {/* عرض دور الفريق الحالي */}
          <div className="p-3 bg-primary-50 rounded-xl mb-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-primary animate-pulse" />
              <p className="font-bold text-gray-800">
                دور الفريق: <span className="text-primary">{currentTeamName}</span>
              </p>
              <Star className="h-5 w-5 text-primary animate-pulse" />
            </div>
          </div>

          {/* عرض مستويات الصعوبة اعتماداً على حالة التوسعة */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-3"
              >
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-700">اختر مستوى الصعوبة:</h4>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    className={`py-3 px-4 rounded-xl text-white font-bold text-lg ${
                      isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)
                        ? getDifficultyColor(DifficultyLevel.EASY)
                        : 'bg-gray-300 cursor-not-allowed'
                    } transition-all flex items-center justify-center`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)) {
                        handleSelectDifficulty(DifficultyLevel.EASY);
                      }
                    }}
                    disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)}
                  >
                    {getQuestionStatusIcon(DifficultyLevel.EASY)}
                    1
                  </button>

                  <button 
                    className={`py-3 px-4 rounded-xl text-white font-bold text-lg ${
                      isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)
                        ? getDifficultyColor(DifficultyLevel.MEDIUM)
                        : 'bg-gray-300 cursor-not-allowed'
                    } transition-all flex items-center justify-center`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)) {
                        handleSelectDifficulty(DifficultyLevel.MEDIUM);
                      }
                    }}
                    disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)}
                  >
                    {getQuestionStatusIcon(DifficultyLevel.MEDIUM)}
                    2
                  </button>

                  <button 
                    className={`py-3 px-4 rounded-xl text-white font-bold text-lg ${
                      isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)
                        ? getDifficultyColor(DifficultyLevel.HARD)
                        : 'bg-gray-300 cursor-not-allowed'
                    } transition-all flex items-center justify-center`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)) {
                        handleSelectDifficulty(DifficultyLevel.HARD);
                      }
                    }}
                    disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)}
                  >
                    {getQuestionStatusIcon(DifficultyLevel.HARD)}
                    3
                  </button>
                </div>

                {/* معلومات إضافية عن الفئة */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>الأسئلة المتبقية: {remaining.total}/6</span>
                    {isCompleted && <span className="text-green-500 font-bold">مكتملة ✓</span>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}