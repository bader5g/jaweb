import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { Trophy, HomeIcon, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import confetti from 'canvas-confetti';
import { useEffect } from "react";

export default function GameEnd() {
  const { game, startNewGame } = useGame();
  
  if (!game) return null;
  
  const getWinner = () => {
    if (game.team1.score > game.team2.score) {
      return game.team1;
    } else if (game.team2.score > game.team1.score) {
      return game.team2;
    }
    return null; // Tie
  };
  
  const winner = getWinner();
  const isTie = !winner;

  // تشغيل الاحتفال بالمفرقعات عند عرض الشاشة
  useEffect(() => {
    // إطلاق المفرقعات إذا كان هناك فائز
    if (winner) {
      const colors = winner.id === game.team1.id ? ['#4d7cfe', '#275df1'] : ['#ff5b5b', '#ff3838'];
      
      const end = Date.now() + 3000;

      const shootConfetti = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(shootConfetti);
        }
      };
      
      shootConfetti();
    }
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">نهاية اللعبة!</h2>
          <p className="text-gray-600">شكراً للجميع على المشاركة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <motion.div 
            className={`p-8 rounded-xl shadow-lg ${winner?.id === game.team1.id ? 'bg-blue-50 ring-4 ring-blue-400' : 'bg-gray-50'}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-blue-600 mb-3 text-center">{game.team1.name}</h3>
            <div className="flex justify-center items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-blue-500" fill="currentColor" />
              <span className="text-5xl font-bold text-blue-700">{game.team1.score}</span>
              <span className="text-lg text-blue-500">نقطة</span>
            </div>
            {winner?.id === game.team1.id && (
              <div className="mt-4 bg-blue-600 text-white py-1 px-3 rounded-full text-center text-sm">
                الفائز! 🎉
              </div>
            )}
          </motion.div>
          
          <motion.div
            className={`p-8 rounded-xl shadow-lg ${winner?.id === game.team2.id ? 'bg-red-50 ring-4 ring-red-400' : 'bg-gray-50'}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-red-600 mb-3 text-center">{game.team2.name}</h3>
            <div className="flex justify-center items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-red-500" fill="currentColor" />
              <span className="text-5xl font-bold text-red-700">{game.team2.score}</span>
              <span className="text-lg text-red-500">نقطة</span>
            </div>
            {winner?.id === game.team2.id && (
              <div className="mt-4 bg-red-600 text-white py-1 px-3 rounded-full text-center text-sm">
                الفائز! 🎉
              </div>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className={`p-6 rounded-xl shadow-lg mb-8 ${isTie ? 'bg-purple-50' : (winner?.id === game.team1.id ? 'bg-blue-100' : 'bg-red-100')}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">النتيجة النهائية</h3>
          {isTie ? (
            <p className="text-2xl font-bold text-center text-purple-700">تعادل الفريقان!</p>
          ) : (
            <p className="text-2xl font-bold text-center" style={{ color: winner?.id === game.team1.id ? '#1e40af' : '#b91c1c' }}>
              فاز {winner?.name} بفارق {Math.abs(game.team1.score - game.team2.score)} نقطة
            </p>
          )}
        </motion.div>
        
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={startNewGame}
            className="py-3 px-8 bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 text-white text-xl font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <HomeIcon className="h-5 w-5 ml-2" /> العودة للرئيسية
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
