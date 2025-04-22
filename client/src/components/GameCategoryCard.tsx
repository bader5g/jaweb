import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useGame } from "@/lib/gameContext";
import { Category, Question, DifficultyLevel } from "@/lib/types";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Atom, Globe, BookText, Trophy, Palette, 
  Cpu, Film, Music, Utensils, Calculator, CheckCircle,
  ChevronDown, ChevronUp, Check, X, HelpCircle, Star
} from 'lucide-react';

interface GameCategoryCardProps {
  category: Category;
}

export default function GameCategoryCard({ category }: GameCategoryCardProps) {
  const { game, selectCategory, selectDifficulty, answerQuestion } = useGame();
  const [, navigate] = useLocation();

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
    // ولكن معرفات الفرق الفعلية قد تكون مختلفة، لذلك نستخدم المؤشر (الأول أو الثاني)
    category.questions.forEach(q => {
      // جميع الأسئلة ذات teamId=1 تخص الفريق الأول، وجميع الأسئلة ذات teamId=2 تخص الفريق الثاني
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

  // تحقق من المستويات المتبقية للفريق الحالي
  const getRemainingLevelsForCurrentTeam = () => {
    if (!game) return [];

    const currentTeamId = game.currentTeamId;
    const teamKey = currentTeamId === game.team1.id ? 'team1' : 'team2';

    const levels = [];

    // نتحقق من وجود أسئلة غير مجابة في كل مستوى للفريق الحالي
    if (questionsByDifficulty.easy[teamKey].some(q => !q.isAnswered)) {
      levels.push(DifficultyLevel.EASY);
    }

    if (questionsByDifficulty.medium[teamKey].some(q => !q.isAnswered)) {
      levels.push(DifficultyLevel.MEDIUM);
    }

    if (questionsByDifficulty.hard[teamKey].some(q => !q.isAnswered)) {
      levels.push(DifficultyLevel.HARD);
    }

    return levels;
  };

  // حساب عدد الأسئلة المتبقية
  const remainingQuestions = () => {
    // استخدام القيم الثابتة 1 و 2 للفرق بدلاً من معرفات الفرق الحالية
    const team1Questions = category.questions.filter(q => q.teamId === 1 && !q.isAnswered);
    const team2Questions = category.questions.filter(q => q.teamId === 2 && !q.isAnswered);

    return {
      team1: team1Questions.length,
      team2: team2Questions.length,
      total: team1Questions.length + team2Questions.length
    };
  };

  const remaining = remainingQuestions();

  // تحديد إذا كانت الفئة مكتملة
  const isCompleted = remaining.total === 0;

  // الحصول على نسبة الأسئلة المجابة
  const completionPercentage = Math.round(
    ((6 - remaining.total) / 6) * 100
  );

  // معالجة النقر على البطاقة - لم تعد مطلوبة
  const handleCardClick = () => {
    // فارغة لأن الأزرار ستكون ظاهرة دائماً
  };

  // معالجة اختيار المستوى
  const handleSelectDifficulty = async (difficulty: string) => {
    if (!isCompleted) {
      // أولاً: اختيار الفئة
      const categorySuccess = await selectCategory(category.name);
      if (categorySuccess) {
        // ثانياً: اختيار مستوى الصعوبة
        const difficultySuccess = await selectDifficulty(difficulty);
        if (difficultySuccess) {
          // توجيه المستخدم إلى صفحة السؤال
          navigate('/question');
        }
      }
    }
  };

  // تحويل المستوى إلى عنوان بالعربية
  const getDifficultyLabel = (difficulty: string): string => {
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
  };

  // تحديد لون المستوى
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700';
      case DifficultyLevel.MEDIUM:
        return 'bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700';
      case DifficultyLevel.HARD:
        return 'bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700';
      default:
        return 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700';
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
  const getQuestionStatusIcon = (difficulty: string, teamIndex: number) => {
    // استخدام رقم تسلسلي للفريق بدلاً من معرف الفريق
    // teamIndex = 1 للفريق الأول و teamIndex = 2 للفريق الثاني
    const teamKey = teamIndex === 1 ? 'team1' : 'team2';
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
      return <HelpCircle className="h-4 w-4 text-blue-500" />;
    }

    return <Check className="h-4 w-4 text-green-500" />;
  };

  const currentTeamId = game?.currentTeamId;
  const currentTeamName = currentTeamId === game?.team1.id ? game?.team1.name : game?.team2.name;

  // Placeholder for points -  Replace with actual point calculation logic
  const points = {
    [DifficultyLevel.EASY]: remaining.team1,
    [DifficultyLevel.MEDIUM]: 0, // Placeholder
    [DifficultyLevel.HARD]: remaining.team2
  };


  return (
    <motion.div
      className={`category-card ${isCompleted ? 'opacity-75' : ''}`}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      layout
    >
      <div className={`p-6 rounded-2xl relative overflow-hidden ${isCompleted ? 'bg-gray-100' : 'bg-white'}`}>
        {/* خلفية مموجة للبطاقة */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-${color}-100 opacity-50`}></div>
        <div className={`absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-${color}-50 opacity-50`}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-2xl font-bold text-gray-800 ${isCompleted ? '' : `text-${color}-700`}`}>
              {category.name}
            </h3>

            <div className="flex items-center gap-2">
              <div className={`p-3 rounded-xl ${isCompleted ? 'bg-gray-200' : `bg-${color}-100`}`}>
                {isCompleted ? 
                  <CheckCircle className="h-7 w-7 text-gray-500" /> : 
                  getIcon(iconName)
                }
              </div>
            </div>
          </div>



          {/* عرض أسئلة الفئة - دائماً ظاهرة */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getIcon(iconName)}
                <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
              </div>
            </div>
            
            {/* عرض دور الفريق الحالي - في الأعلى */}
            <div className="p-3 bg-primary-50 rounded-xl mb-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-primary animate-pulse" />
                <p className="font-bold text-gray-800">
                  دور الفريق: <span className="text-primary">{currentTeamName}</span>
                </p>
                <Star className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              {/* أيقونات المستوى 1 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => {
                    if (isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)) {
                      handleSelectDifficulty(DifficultyLevel.EASY);
                    }
                  }}
                  disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)}
                  className={`py-3 px-4 rounded-xl text-white font-medium ${
                    isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors flex items-center justify-center`}
                >
                  {getQuestionStatusIcon(DifficultyLevel.EASY, 1)}
                  <span className="text-lg font-bold mr-2">1</span>
                </button>

                <button
                  onClick={() => {
                    if (isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)) {
                      handleSelectDifficulty(DifficultyLevel.EASY);
                    }
                  }}
                  disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)}
                  className={`py-3 px-4 rounded-xl text-white font-medium ${
                    isQuestionAvailableForCurrentTeam(DifficultyLevel.EASY)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors flex items-center justify-center`}
                >
                  {getQuestionStatusIcon(DifficultyLevel.EASY, 2)}
                  <span className="text-lg font-bold mr-2">1</span>
                </button>
              </div>

              {/* أيقونات المستوى 2 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => {
                    if (isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)) {
                      handleSelectDifficulty(DifficultyLevel.MEDIUM);
                    }
                  }}
                  disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)}
                  className={`py-3 px-4 rounded-xl text-white font-medium ${
                    isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors flex items-center justify-center`}
                >
                  {getQuestionStatusIcon(DifficultyLevel.MEDIUM, 1)}
                  <span className="text-lg font-bold mr-2">2</span>
                </button>

                <button
                  onClick={() => {
                    if (isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)) {
                      handleSelectDifficulty(DifficultyLevel.MEDIUM);
                    }
                  }}
                  disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)}
                  className={`py-3 px-4 rounded-xl text-white font-medium ${
                    isQuestionAvailableForCurrentTeam(DifficultyLevel.MEDIUM)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors flex items-center justify-center`}
                >
                  {getQuestionStatusIcon(DifficultyLevel.MEDIUM, 2)}
                  <span className="text-lg font-bold mr-2">2</span>
                </button>
              </div>

              {/* أيقونات المستوى 3 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)) {
                      handleSelectDifficulty(DifficultyLevel.HARD);
                    }
                  }}
                  disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)}
                  className={`py-3 px-4 rounded-xl text-white font-medium ${
                    isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors flex items-center justify-center`}
                >
                  {getQuestionStatusIcon(DifficultyLevel.HARD, 1)}
                  <span className="text-lg font-bold mr-2">3</span>
                </button>

                <button
                  onClick={() => {
                    if (isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)) {
                      handleSelectDifficulty(DifficultyLevel.HARD);
                    }
                  }}
                  disabled={!isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)}
                  className={`py-3 px-4 rounded-xl text-white font-medium ${
                    isQuestionAvailableForCurrentTeam(DifficultyLevel.HARD)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                      : 'bg-gray-300 cursor-not-allowed'
                  } transition-colors flex items-center justify-center`}
                >
                  {getQuestionStatusIcon(DifficultyLevel.HARD, 2)}
                  <span className="text-lg font-bold mr-2">3</span>
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </motion.div>
  );
}