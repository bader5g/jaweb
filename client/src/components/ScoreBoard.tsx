import { useState } from "react";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Trophy, Clock, ArrowLeft, ArrowRight, Star, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TeamHelpOptions from "./TeamHelpOptions";
import GameLogModal from "./GameLogModal";
import { apiRequest } from "@/lib/queryClient";

export default function ScoreBoard() {
  const { game, getCurrentTeam, updateTeamScore, createGameLog } = useGame();
  const [animateTeam1, setAnimateTeam1] = useState(false);
  const [animateTeam2, setAnimateTeam2] = useState(false);
  const [showGameLog, setShowGameLog] = useState(false);
  
  if (!game) return null;
  
  const currentTeam = getCurrentTeam();
  const isTeam1Turn = currentTeam?.id === game.team1.id;
  const isTeam2Turn = currentTeam?.id === game.team2.id;
  
  // يتم تعريف وظيفة للتعامل مع تغيير النقاط
  const handleScoreChange = (teamId: number, amount: number) => {
    // تفعيل الحركة لإظهار تأثير تغيير النقاط
    if (teamId === game.team1.id) {
      setAnimateTeam1(true);
      setTimeout(() => setAnimateTeam1(false), 700);
    } else {
      setAnimateTeam2(true);
      setTimeout(() => setAnimateTeam2(false), 700);
    }
    
    updateTeamScore(teamId, amount);
  };
  
  const handleScoreChangeWithLog = async (teamId: number, amount: number) => {
    // تفعيل الحركة والتحديث كما كان من قبل
    handleScoreChange(teamId, amount);
    
    // الحصول على اسم الفريق والنقاط الجديدة
    const teamName = teamId === game.team1.id ? game.team1.name : game.team2.name;
    const newScore = teamId === game.team1.id 
      ? Math.max(0, game.team1.score + amount) 
      : Math.max(0, game.team2.score + amount);
    
    // إضافة سجل للتغيير باستخدام createGameLog
    try {
      await createGameLog('update_score', {
        changeAmount: amount,
        teamName: teamName,
        newScore: newScore,
        manualUpdate: true
      }, teamId);
    } catch (error) {
      console.error('Error logging score change:', error);
    }
  };
  
  return (
    <div className="mb-10">
      <div className="flex flex-wrap justify-between items-stretch gap-4">
        {/* الفريق الأول */}
        <motion.div 
          className={`team-one flex-1 px-6 py-5 rounded-2xl shadow-lg mb-4 sm:mb-0 relative overflow-hidden border-2 ${isTeam1Turn ? 'border-white' : 'border-transparent'}`}
          animate={{ scale: animateTeam1 ? 1.03 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {isTeam1Turn && (
            <motion.div 
              className="absolute inset-0 bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2
              }}
            />
          )}
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-white">{game.team1.name}</h3>
              {isTeam1Turn && <Star className="h-5 w-5 text-yellow-300 animate-pulse-slow" />}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <p className="text-3xl font-bold text-white">{game.team1.score}</p>
              </div>
              
              {/* أزرار التحكم بالنقاط */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => handleScoreChangeWithLog(game.team1.id, 1)}
                >
                  <PlusCircle className="h-6 w-6 text-blue-600" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => handleScoreChangeWithLog(game.team1.id, -1)}
                >
                  <MinusCircle className="h-6 w-6 text-blue-600" />
                </Button>
              </div>
            </div>
            
            {/* وسائل المساعدة للفريق الأول */}
            <TeamHelpOptions teamId={game.team1.id} gameId={game.id} />
          </div>
        </motion.div>
        
        {/* لوحة دور الفريق */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-md px-8 py-4 rounded-2xl shadow-lg mb-4 sm:mb-0 min-w-[200px] border border-white/50">
          <div className="flex items-center justify-center gap-2 mb-1">
            {isTeam1Turn && <ArrowRight className="h-6 w-6 text-blue-500" />}
            <Star className="h-7 w-7 text-yellow-400 animate-pulse-slow" /> 
            {isTeam2Turn && <ArrowLeft className="h-6 w-6 text-red-500" />}
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              {currentTeam?.name}
            </p>
          </div>
          
          {/* زر عرض سجل اللعبة */}
          <Button
            variant="outline"
            size="sm"
            className="mt-3 text-xs gap-1 bg-white/90 text-gray-700"
            onClick={() => setShowGameLog(true)}
          >
            <FileText className="h-3.5 w-3.5" />
            سجل اللعبة
          </Button>
        </div>
        
        {/* الفريق الثاني */}
        <motion.div 
          className={`team-two flex-1 px-6 py-5 rounded-2xl shadow-lg mb-4 sm:mb-0 relative overflow-hidden border-2 ${isTeam2Turn ? 'border-white' : 'border-transparent'}`}
          animate={{ scale: animateTeam2 ? 1.03 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {isTeam2Turn && (
            <motion.div 
              className="absolute inset-0 bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2
              }}
            />
          )}
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-white">{game.team2.name}</h3>
              {isTeam2Turn && <Star className="h-5 w-5 text-yellow-300 animate-pulse-slow" />}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <p className="text-3xl font-bold text-white">{game.team2.score}</p>
              </div>
              
              {/* أزرار التحكم بالنقاط */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => handleScoreChangeWithLog(game.team2.id, 1)}
                >
                  <PlusCircle className="h-6 w-6 text-red-600" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                  onClick={() => handleScoreChangeWithLog(game.team2.id, -1)}
                >
                  <MinusCircle className="h-6 w-6 text-red-600" />
                </Button>
              </div>
            </div>
            
            {/* وسائل المساعدة للفريق الثاني */}
            <TeamHelpOptions teamId={game.team2.id} gameId={game.id} />
          </div>
        </motion.div>
      </div>
      
      {/* خط فاصل مع معلومات */}
      <div className="flex justify-center items-center mt-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
        <div className="px-4 text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
          <Trophy className="h-3 w-3" /> 
          {game.team1.score > game.team2.score ? game.team1.name : game.team1.score < game.team2.score ? game.team2.name : "تعادل"} 
          {game.team1.score !== game.team2.score ? "متقدم" : ""}
        </div>
        <div className="h-px bg-gradient-to-r from-gray-300 via-gray-300 to-transparent w-full"></div>
      </div>
      
      {/* مودال سجل اللعبة */}
      {showGameLog && (
        <GameLogModal 
          isOpen={showGameLog} 
          onClose={() => setShowGameLog(false)} 
          gameId={game.id} 
        />
      )}
    </div>
  );
}
