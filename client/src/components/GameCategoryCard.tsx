import React from 'react';
import { useGame } from "@/lib/gameContext";
import { Category, Question, DifficultyLevel } from "@/lib/types";
import { motion } from 'framer-motion';
import { 
  BookOpen, Atom, Globe, BookText, Trophy, Palette, 
  Cpu, Film, Music, Utensils, Calculator, CheckCircle,
  Check, X, HelpCircle, Star
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GameCategoryCardProps {
  category: Category;
}

export default function GameCategoryCard({ category }: GameCategoryCardProps) {
  const { game, selectCategory, selectDifficulty } = useGame();
  const { toast } = useToast();

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

  // معالجة اختيار المستوى
  const handleSelectDifficulty = async (difficultyLevel: string) => {
    try {
      if (!isCompleted) {
        console.log("سيتم اختيار الفئة:", category.name);
        toast({
          title: "جاري تحميل السؤال",
          description: `من فئة ${category.name}`,
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

  // التحقق مما إذا كان السؤال متاحاً للفريق الحالي
  const isQuestionAvailableForCurrentTeam = (difficulty: string, teamNumber: number): boolean => {
    if (!game) return false;

    const currentTeamId = game.currentTeamId;
    const teamKey = teamNumber === 1 ? 'team1' : 'team2';
    const isCurrentTeam = (teamNumber === 1 && currentTeamId === game.team1.id) || 
                          (teamNumber === 2 && currentTeamId === game.team2.id);
    
    if (!isCurrentTeam) return false;

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
  const getQuestionStatusIcon = (difficulty: string, teamNumber: number) => {
    const teamKey = teamNumber === 1 ? 'team1' : 'team2';
    
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

  // إنشاء مصفوفة من الأزرار لعرضها
  const renderButtons = () => {
    const buttons = [];
    const difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD];
    const teams = [1, 2];

    for (const team of teams) {
      for (const difficulty of difficulties) {
        // تحديد رقم الزر (من 1 إلى 6)
        let buttonNumber;
        if (team === 1) {
          if (difficulty === DifficultyLevel.EASY) buttonNumber = 1;
          else if (difficulty === DifficultyLevel.MEDIUM) buttonNumber = 3;
          else buttonNumber = 5;
        } else {
          if (difficulty === DifficultyLevel.EASY) buttonNumber = 2;
          else if (difficulty === DifficultyLevel.MEDIUM) buttonNumber = 4;
          else buttonNumber = 6;
        }

        const isAvailable = isQuestionAvailableForCurrentTeam(difficulty, team);
        
        buttons.push(
          <button 
            key={`${team}-${difficulty}`}
            className={`py-3 px-0 rounded-xl text-white font-bold text-lg ${
              isAvailable
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            } transition-all flex items-center justify-center`}
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) {
                handleSelectDifficulty(difficulty);
              }
            }}
            disabled={!isAvailable}
          >
            {getQuestionStatusIcon(difficulty, team)}
            {buttonNumber}
          </button>
        );
      }
    }

    return buttons;
  };

  return (
    <motion.div
      className={`category-card rounded-2xl shadow-md overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
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

            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-gray-200' : `bg-${color}-100`}`}>
              {isCompleted ? 
                <CheckCircle className="h-7 w-7 text-gray-500" /> : 
                getIcon(iconName)
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

          {/* عرض الأزرار الستة (الأرقام 1-6) */}
          <div className="grid grid-cols-3 gap-3 my-3">
            {renderButtons()}
          </div>

          {/* معلومات إضافية عن الفئة */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>الأسئلة المتبقية: {remaining.total}/6</span>
              {isCompleted && <span className="text-green-500 font-bold">مكتملة ✓</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}