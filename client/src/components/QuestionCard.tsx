import { useState, useEffect } from "react";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { DifficultyLevel } from "@/lib/types";
import AnswerTimer from "@/components/AnswerTimer";

export default function QuestionCard() {
  const { game, getCurrentQuestion, answerQuestion } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  
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
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <AnswerTimer 
          duration={game.answerTime} 
          onTimeEnd={handleTimeEnd} 
          isRunning={timerRunning} 
        />
      </div>
      
      <div className={`question-card relative bg-background-light rounded-lg shadow-xl p-6 mb-8 h-96 ${flipped ? 'card-flip' : ''}`}>
        <div className="card-front">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-primary text-background-light px-4 py-1 rounded-full text-lg font-medium">
              <span>{game.currentCategory}</span> - 
              <span>{getDifficultyLabel(question.difficulty)}</span>
            </span>
            <span className="bg-primary-dark text-background-light px-4 py-1 rounded-full text-lg font-medium">
              <span>{question.points}</span> نقطة
            </span>
          </div>
          
          <div className="flex items-center justify-center h-64">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-background-dark">
              {question.text}
            </h2>
          </div>
        </div>
        
        <div className="card-back">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-primary text-background-light px-4 py-1 rounded-full text-lg font-medium">
              <span>{game.currentCategory}</span> - 
              <span>{getDifficultyLabel(question.difficulty)}</span>
            </span>
            <span className="bg-primary-dark text-background-light px-4 py-1 rounded-full text-lg font-medium">
              <span>{question.points}</span> نقطة
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center h-64">
            <h3 className="text-xl font-bold mb-4 text-background-dark">الإجابة الصحيحة:</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-background-dark mb-6">
              {question.answer}
            </h2>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 flex flex-wrap justify-center gap-4">
          <Button
            onClick={handleFlipCard}
            className="py-3 px-8 bg-primary text-background-light text-xl font-bold rounded-lg hover:bg-primary-dark transition"
          >
            {flipped ? 'إخفاء الإجابة' : 'إظهار الإجابة'}
          </Button>
          
          <Button
            onClick={handleCorrectAnswer}
            disabled={!flipped}
            className="py-3 px-8 bg-secondary text-background-light text-xl font-bold rounded-lg hover:bg-secondary-dark transition"
          >
            إجابة صحيحة
          </Button>
          
          <Button
            onClick={handleWrongAnswer}
            disabled={!flipped}
            className="py-3 px-8 bg-accent text-background-light text-xl font-bold rounded-lg hover:bg-accent-dark transition"
          >
            إجابة خاطئة
          </Button>
        </div>
      </div>
    </div>
  );
}
