import { useState, useEffect } from "react";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { DifficultyLevel } from "@/lib/types";
import AnswerTimer from "@/components/AnswerTimer";
import { motion } from "framer-motion";
import { Clock, Brain, Zap, Award } from "lucide-react";

export default function QuestionCard() {
  const { game, getCurrentQuestion, answerQuestion, updateTeamScore } = useGame();
  const [showAnswerOptions, setShowAnswerOptions] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);

  if (!game) return null;

  const question = getCurrentQuestion();
  if (!question) return null;

  const handleShowAnswer = () => {
    setShowAnswerOptions(true);
    setTimerRunning(false);
  };

  const handleTeamAnswer = (teamId: number | null) => {
    if (teamId) {
      answerQuestion(question.id, true);
      updateTeamScore(teamId, question.points);
    } else {
      answerQuestion(question.id, false);
    }
  };

  const handleTimeEnd = () => {
    setShowAnswerOptions(true);
  };

  useEffect(() => {
    setTimerRunning(true);
    setShowAnswerOptions(false);
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
        <AnswerTimer 
          duration={game.answerTime} 
          onTimeEnd={handleTimeEnd} 
          isRunning={timerRunning} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
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

        <div className="mb-8">
          {question.type === 'text' && (
            <h2 className="text-3xl text-center font-bold text-gray-800 dark:text-gray-100">
              {question.text}
            </h2>
          )}
          {question.type === 'image' && (
            <img src={question.content} alt="سؤال" className="max-w-full mx-auto rounded-lg" />
          )}
          {question.type === 'video' && (
            <video controls className="max-w-full mx-auto rounded-lg">
              <source src={question.content} type="video/mp4" />
            </video>
          )}
          {question.type === 'audio' && (
            <audio controls className="w-full">
              <source src={question.content} type="audio/mpeg" />
            </audio>
          )}
          {question.type === 'qr' && (
            <img src={question.content} alt="باركود" className="max-w-xs mx-auto" />
          )}
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