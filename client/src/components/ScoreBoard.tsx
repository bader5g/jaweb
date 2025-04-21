import { useGame } from "@/lib/gameContext";

export default function ScoreBoard() {
  const { game, getCurrentTeam } = useGame();
  
  if (!game) return null;
  
  const currentTeam = getCurrentTeam();
  
  return (
    <div className="flex flex-wrap justify-between items-center mb-8">
      <div className="team-one px-6 py-3 rounded-lg shadow-md mb-4 sm:mb-0">
        <h3 className="text-xl font-bold text-background-light">{game.team1.name}</h3>
        <p className="text-2xl font-bold text-background-light">{game.team1.score} نقطة</p>
      </div>
      
      <div className="bg-primary px-8 py-4 rounded-lg shadow-md mb-4 sm:mb-0">
        <h3 className="text-xl font-bold text-background-light text-center">دور الفريق</h3>
        <p className="text-2xl font-bold text-background-light text-center">
          {currentTeam?.name}
        </p>
      </div>
      
      <div className="team-two px-6 py-3 rounded-lg shadow-md mb-4 sm:mb-0">
        <h3 className="text-xl font-bold text-background-light">{game.team2.name}</h3>
        <p className="text-2xl font-bold text-background-light">{game.team2.score} نقطة</p>
      </div>
    </div>
  );
}
