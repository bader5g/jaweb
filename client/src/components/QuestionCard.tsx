import { useState, useEffect } from "react";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { DifficultyLevel } from "@/lib/types";
import AnswerTimer from "@/components/AnswerTimer";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Eye, EyeOff, Award, Clock, Brain, Zap } from "lucide-react";

export default function QuestionCard() {
  const { game, getCurrentQuestion, answerQuestion } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  
  if (!game) return null;
  
  const question = getCurrentQuestion();
  if (!question) return null;
  
  const handleFlipCard = () => {
    setFlipped(!flipped);
    // إيقاف المؤقت عند إظهار الإجابة
    if (!flipped) {
      setTimerRunning(false);
    }
  };
  
  const handleCorrectAnswer = () => {
    answerQuestion(question.id, true);
    setFlipped(false);
    setTimerRunning(false);
  };
  
  const handleWrongAnswer = () => {
    answerQuestion(question.id, false);
    setFlipped(false);
    setTimerRunning(false);
  };
  
  const handleTimeEnd = () => {
    // عند انتهاء الوقت، يتم قلب البطاقة تلقائيًا
    setFlipped(true);
  };
  
  // إعادة تشغيل المؤقت عند تغيير السؤال
  useEffect(() => {
    setTimerRunning(true);
    setFlipped(false);
    setShowAnimation(true);
    
    // إخفاء الرسوم المتحركة بعد 2 ثانية
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [question?.id]);
  
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
  
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'bg-gradient-to-r from-green-400 to-green-600';
      case DifficultyLevel.MEDIUM:
        return 'bg-gradient-to-r from-yellow-400 to-amber-600';
      case DifficultyLevel.HARD:
        return 'bg-gradient-to-r from-red-400 to-red-600';
      default:
        return 'bg-gradient-to-r from-green-400 to-green-600';
    }
  };
  
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return <Zap className="h-5 w-5" />;
      case DifficultyLevel.MEDIUM:
        return <Brain className="h-5 w-5" />;
      case DifficultyLevel.HARD:
        return <Award className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <AnimatePresence>
          {showAnimation && (
            <motion.div 
              className="text-center mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">سؤال جديد من فئة</p>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                {game.currentCategory}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnswerTimer 
          duration={game.answerTime} 
          onTimeEnd={handleTimeEnd} 
          isRunning={timerRunning} 
        />
      </div>
      
      <motion.div 
        className={`perspective-1000 h-[450px] w-full ${flipped ? 'rotate-y-180' : ''}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-full h-full preserve-3d transition-transform duration-700 ease-in-out">
          {/* واجهة البطاقة - السؤال */}
          <div className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden backface-hidden ${flipped ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative p-8 h-full">
              {/* خلفية مموجة للبطاقة */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-50 dark:bg-blue-900/20 opacity-50"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-indigo-50 dark:bg-indigo-900/20 opacity-50"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-2 rounded-full text-white flex items-center gap-2 ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyIcon(question.difficulty)}
                      <span className="font-medium">{getDifficultyLabel(question.difficulty)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{game.answerTime} ثانية</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    <Award className="h-5 w-5" />
                    <span className="font-bold">{question.points} نقطة</span>
                  </div>
                </div>
                
                <div className="flex-grow flex items-center justify-center">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mx-4 leading-relaxed"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {question.text}
                  </motion.h2>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleFlipCard}
                    className="py-3 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold rounded-xl hover:shadow-lg transition flex items-center gap-2"
                  >
                    <Eye className="h-5 w-5" />
                    إظهار الإجابة
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* خلف البطاقة - الإجابة */}
          <div className={`absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden backface-hidden rotate-y-180 ${flipped ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative p-8 h-full">
              {/* خلفية مموجة */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-green-50 dark:bg-green-900/20 opacity-50"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-50 dark:bg-blue-900/20 opacity-50"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`px-4 py-2 rounded-full text-white flex items-center gap-2 ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyIcon(question.difficulty)}
                      <span className="font-medium">{getDifficultyLabel(question.difficulty)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                    <Award className="h-5 w-5" />
                    <span className="font-bold">{question.points} نقطة</span>
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col items-center justify-center">
                  <h3 className="text-xl font-bold mb-4 text-gray-600 dark:text-gray-300">الإجابة الصحيحة:</h3>
                  <motion.h2 
                    className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {question.answer}
                  </motion.h2>
                </div>
                
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                  <Button
                    onClick={handleFlipCard}
                    className="py-3 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition flex items-center gap-2"
                  >
                    <EyeOff className="h-5 w-5" />
                    إخفاء الإجابة
                  </Button>
                  
                  <Button
                    onClick={handleCorrectAnswer}
                    className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2"
                  >
                    <Check className="h-5 w-5" />
                    إجابة صحيحة
                  </Button>
                  
                  <Button
                    onClick={handleWrongAnswer}
                    className="py-3 px-6 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2"
                  >
                    <X className="h-5 w-5" />
                    إجابة خاطئة
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
