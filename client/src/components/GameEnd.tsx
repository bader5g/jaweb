import { useGame } from "@/lib/gameContext";
import { Button } from "@/components/ui/button";

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
  
  return (
    <div className="bg-background-light rounded-lg shadow-lg p-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-background-dark">نهاية اللعبة!</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="team-one p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-center text-background-light mb-4">{game.team1.name}</h3>
          <p className="text-5xl font-bold text-center text-background-light">{game.team1.score} نقطة</p>
        </div>
        
        <div className="team-two p-6 rounded-lg">
          <h3 className="text-2xl font-bold text-center text-background-light mb-4">{game.team2.name}</h3>
          <p className="text-5xl font-bold text-center text-background-light">{game.team2.score} نقطة</p>
        </div>
      </div>
      
      {winner ? (
        <div className="p-6 bg-primary rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-bold text-center text-background-light mb-4">الفائز</h3>
          <p className="text-4xl md:text-5xl font-bold text-center text-background-light">{winner.name}</p>
        </div>
      ) : (
        <div className="p-6 bg-primary rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-bold text-center text-background-light mb-4">النتيجة</h3>
          <p className="text-4xl md:text-5xl font-bold text-center text-background-light">تعادل</p>
        </div>
      )}
      
      <div className="text-center">
        <Button
          onClick={startNewGame}
          className="py-3 px-8 bg-secondary text-background-light text-xl font-bold rounded-lg hover:bg-secondary-dark transition"
        >
          لعبة جديدة
        </Button>
      </div>
    </div>
  );
}
