import { useState, useEffect } from "react";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import AnswerTimer from "@/components/AnswerTimer";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function QuestionCard() {
  const { game, getCurrentQuestion, answerQuestion, updateTeamScore } = useGame();
  const [showAnswerOptions, setShowAnswerOptions] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const { toast } = useToast();

  console.log("تحميل مكون QuestionCard، حالة اللعبة:", game?.state);

  useEffect(() => {
    console.log("وصلنا إلى مكون عرض السؤال، حالة اللعبة:", game?.state);
    
    // تحقق من أن اللعبة في وضع السؤال
    if (game && game.state !== "question") {
      console.log("حالة اللعبة ليست 'question'، الحالة الحالية:", game.state);
    }
  }, [game?.state]);

  // التحقق من وجود بيانات اللعبة
  if (!game) {
    console.log("لا توجد بيانات لعبة!");
    return null;
  }

  // الحصول على السؤال الحالي
  const question = getCurrentQuestion();
  console.log("السؤال الحالي:", question);
  
  if (!question) {
    console.log("لا يوجد سؤال متاح لهذه الفئة والمستوى والفريق الحالي!");
    
    toast({
      title: "لا يوجد سؤال",
      description: "لا يوجد سؤال متاح لهذه الفئة والمستوى والفريق الحالي",
      variant: "destructive"
    });
    
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-red-600 mb-4">لا يوجد سؤال متاح!</h2>
        <p className="text-gray-600 mb-6">لا يوجد سؤال متاح لـ {game.currentCategory} بمستوى {game.currentDifficulty}</p>
      </div>
    );
  }

  const handleShowAnswer = () => {
    setShowAnswerOptions(true);
    setTimerRunning(false);
  };

  const handleTeamAnswer = (teamId: number | null) => {
    if (teamId) {
      console.log("إجابة صحيحة للفريق:", teamId);
      answerQuestion(question.id, true);
      updateTeamScore(teamId, question.points);
    } else {
      console.log("إجابة خاطئة - لا أحد حصل على نقاط");
      answerQuestion(question.id, false);
    }
  };

  const handleTimeEnd = () => {
    console.log("انتهى الوقت!");
    setShowAnswerOptions(true);
  };

  // إعادة ضبط حالة المكون عند تغير السؤال
  useEffect(() => {
    console.log("تغير السؤال:", question?.id);
    setTimerRunning(true);
    setShowAnswerOptions(false);
  }, [question?.id]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="bg-primary/10 px-4 py-2 rounded-lg">
            <span className="font-bold text-primary">التصنيف: </span>
            <span className="text-gray-700">{game.currentCategory}</span>
          </div>
          
          <div className="bg-primary/10 px-4 py-2 rounded-lg">
            <span className="font-bold text-primary">المستوى: </span>
            <span className="text-gray-700">
              {game.currentDifficulty === 'easy' ? '1' : 
               game.currentDifficulty === 'medium' ? '2' : 
               game.currentDifficulty === 'hard' ? '3' : 
               game.currentDifficulty}
            </span>
          </div>
          
          <div className="bg-primary/10 px-4 py-2 rounded-lg">
            <span className="font-bold text-primary">النقاط: </span>
            <span className="text-gray-700">{question.points}</span>
          </div>
        </div>

        <AnswerTimer 
          duration={game.answerTime} 
          onTimeEnd={handleTimeEnd} 
          isRunning={timerRunning} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h2 className="text-3xl text-center font-bold text-gray-800 dark:text-gray-100">
            {question.text}
          </h2>
        </div>

        {!showAnswerOptions ? (
          <div className="flex justify-center">
            <Button
              onClick={handleShowAnswer}
              className="py-3 px-8 bg-primary text-white text-xl font-bold rounded-xl hover:bg-primary/90 transition"
            >
              إظهار الإجابة
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl text-center font-bold text-gray-600 mb-4">
              الإجابة الصحيحة: {question.answer}
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => handleTeamAnswer(game.team1.id)}
                className="py-6 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded-xl"
              >
                {game.team1.name}
              </Button>

              <Button
                onClick={() => handleTeamAnswer(game.team2.id)}
                className="py-6 bg-red-500 hover:bg-red-600 text-white text-lg font-bold rounded-xl"
              >
                {game.team2.name}
              </Button>

              <Button
                onClick={() => handleTeamAnswer(null)}
                className="py-6 bg-gray-500 hover:bg-gray-600 text-white text-lg font-bold rounded-xl"
              >
                لا أحد
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}