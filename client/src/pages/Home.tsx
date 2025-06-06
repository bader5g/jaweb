import { Button } from "../components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useGame } from "../lib/gameContext";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import CategoryGrid from "../components/CategoryGrid";
import SelectedCategoriesFloater from "../components/SelectedCategoriesFloater";
import { Shield, BrainCircuit, Timer } from "lucide-react";

export default function Home() {
  const { startNewGame, createGame, loading } = useGame();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [gameName, setGameName] = useState("");
  const [team1Name, setTeam1Name] = useState("الفريق الأزرق");
  const [team2Name, setTeam2Name] = useState("الفريق الأحمر");
  const [answerTime, setAnswerTime] = useState("60");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  
  useEffect(() => {
    // إعادة تعيين حالة اللعبة في الصفحة الرئيسية
    startNewGame();
  }, [startNewGame]);
  
  const handleCategorySelect = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      if (selectedCategories.length < 8) {
        setSelectedCategories([...selectedCategories, categoryId]);
      }
    }
  };
  
  const handleStartGame = async () => {
    if (isCreatingGame) return;
    
    setIsCreatingGame(true);
    
    try {
      // سنقوم بتنفيذ منطق بدء اللعبة الجديدة مباشرة
      console.log({
        gameName,
        team1Name,
        team2Name,
        answerTime: parseInt(answerTime),
        selectedCategories
      });
      
      // إنشاء اللعبة مباشرة بدلاً من الانتقال إلى صفحة الإعداد مع إرسال الفئات المختارة
      await createGame(
        selectedCategories.length, 
        team1Name, 
        team2Name, 
        parseInt(answerTime),
        gameName,
        selectedCategories
      );
      
      // لا داعي للانتقال لأن وظيفة createGame ستقوم بذلك تلقائياً
    } catch (error) {
      console.error("حدث خطأ أثناء إنشاء اللعبة:", error);
    } finally {
      setIsCreatingGame(false);
    }
  };
  
  const isStartGameDisabled = selectedCategories.length < 4;
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* قسم الترحيب */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          جاوب - لعبة الأسئلة والأجوبة
        </h1>
        <p className="text-xl opacity-80 max-w-2xl mx-auto">
          تنافس مع فريقك واختبر معلوماتك في آلاف الفئات المختلفة
        </p>
      </div>
      
      {/* قسم العمل الرئيسي */}
      <div className="flex flex-col-reverse md:flex-row gap-8 mb-12 items-center">
        <div className="w-full md:w-1/2">
          <div className="bg-card rounded-lg shadow-lg p-8 w-full">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-center">اختر طريقة اللعب</h2>
              
              <Dialog open={showNewGameDialog} onOpenChange={setShowNewGameDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full py-6 text-xl" disabled={isStartGameDisabled}>
                    {isStartGameDisabled 
                      ? `حدد ${4 - selectedCategories.length} فئات على الأقل` 
                      : "ابدأ لعبة جديدة"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إعداد لعبة جديدة</DialogTitle>
                    <DialogDescription>
                      قم بتعبئة المعلومات التالية لبدء لعبة جديدة.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gameName">اسم اللعبة</Label>
                      <Input 
                        id="gameName" 
                        value={gameName} 
                        onChange={(e) => setGameName(e.target.value)} 
                        placeholder="اسم اللعبة (اختياري)" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="team1Name">اسم الفريق الأول</Label>
                      <Input 
                        id="team1Name" 
                        value={team1Name} 
                        onChange={(e) => setTeam1Name(e.target.value)} 
                        placeholder="الفريق الأول" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="team2Name">اسم الفريق الثاني</Label>
                      <Input 
                        id="team2Name" 
                        value={team2Name} 
                        onChange={(e) => setTeam2Name(e.target.value)} 
                        placeholder="الفريق الثاني" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>وقت الإجابة</Label>
                      <RadioGroup value={answerTime} onValueChange={setAnswerTime}>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="30" id="time30" />
                          <Label htmlFor="time30">30 ثانية</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="90" id="time90" />
                          <Label htmlFor="time90">90 ثانية</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={handleStartGame}>بدء اللعبة</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="text-center text-sm">
                حدد بين 4-8 فئات من القائمة أدناه للعب
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold mb-4">
            لعبة أسئلة وأجوبة تفاعلية
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>أكثر من 1000 فئة من الأسئلة المختلفة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>مستويات متنوعة من الصعوبة</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>لعب تنافسي بين فريقين</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>اكسب نقاط وارتقِ في المستويات</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>مناسب للعائلة والأصدقاء والمناسبات التعليمية</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* قسم اختيار الفئات */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            اختر الفئات ({selectedCategories.length}/8)
          </h2>
        </div>
        
        {/* عرض شبكة التصنيفات */}
        <CategoryGrid 
          maxSelections={8} 
          selectedCategories={selectedCategories}
          onSelectCategory={handleCategorySelect}
        />
      </div>
      
      {/* قسم المعلومات السفلي */}
      <div className="text-center text-muted-foreground">
        <p>
          العب مع صديق أو فريق وتنافسوا في فئات متنوعة من الأسئلة
        </p>
      </div>

      {/* قائمة الفئات المختارة العائمة */}
      <SelectedCategoriesFloater 
        selectedCategories={selectedCategories}
        onRemoveCategory={(id) => handleCategorySelect(id)}
        maxSelectedCategories={8}
      />
    </div>
  );
}
