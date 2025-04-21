import { useState } from "react";
import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";

export default function ScoreBoard() {
  const { game, getCurrentTeam, updateTeamScore } = useGame();
  const [isEditingTeam1, setIsEditingTeam1] = useState(false);
  const [isEditingTeam2, setIsEditingTeam2] = useState(false);
  
  if (!game) return null;
  
  const currentTeam = getCurrentTeam();
  
  // يتم تعريف وظيفة للتعامل مع تغيير النقاط
  const handleScoreChange = (teamId: number, amount: number) => {
    updateTeamScore(teamId, amount);
  };
  
  return (
    <div className="flex flex-wrap justify-between items-center mb-8">
      {/* الفريق الأول */}
      <div className="team-one bg-blue-600 px-6 py-3 rounded-lg shadow-md mb-4 sm:mb-0 relative">
        <h3 className="text-xl font-bold text-background-light text-center">{game.team1.name}</h3>
        <p className="text-2xl font-bold text-background-light text-center">{game.team1.score} نقطة</p>
        
        {/* أزرار التحكم بالنقاط */}
        <div className="flex justify-center mt-2 gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white"
            onClick={() => handleScoreChange(game.team1.id, 1)}
          >
            <PlusCircle className="h-5 w-5 text-blue-600" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white"
            onClick={() => handleScoreChange(game.team1.id, -1)}
          >
            <MinusCircle className="h-5 w-5 text-blue-600" />
          </Button>
        </div>
      </div>
      
      {/* لوحة دور الفريق */}
      <div className="bg-primary px-8 py-4 rounded-lg shadow-md mb-4 sm:mb-0">
        <h3 className="text-xl font-bold text-background-light text-center">دور الفريق</h3>
        <p className="text-2xl font-bold text-background-light text-center">
          {currentTeam?.name}
        </p>
      </div>
      
      {/* الفريق الثاني */}
      <div className="team-two bg-red-600 px-6 py-3 rounded-lg shadow-md mb-4 sm:mb-0 relative">
        <h3 className="text-xl font-bold text-background-light text-center">{game.team2.name}</h3>
        <p className="text-2xl font-bold text-background-light text-center">{game.team2.score} نقطة</p>
        
        {/* أزرار التحكم بالنقاط */}
        <div className="flex justify-center mt-2 gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white"
            onClick={() => handleScoreChange(game.team2.id, 1)}
          >
            <PlusCircle className="h-5 w-5 text-red-600" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white"
            onClick={() => handleScoreChange(game.team2.id, -1)}
          >
            <MinusCircle className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
