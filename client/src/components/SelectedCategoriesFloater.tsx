import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { useQuery } from '@tanstack/react-query';
import { CategoryUI } from '@shared/schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface SelectedCategoriesFloaterProps {
  selectedCategories: number[];
  onRemoveCategory: (id: number) => void;
  maxSelectedCategories?: number;
}

const SelectedCategoriesFloater = ({
  selectedCategories,
  onRemoveCategory,
  maxSelectedCategories = 8
}: SelectedCategoriesFloaterProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showGameDialog, setShowGameDialog] = useState(false);
  const [gameName, setGameName] = useState("");
  const [team1Name, setTeam1Name] = useState("الفريق الأزرق");
  const [team2Name, setTeam2Name] = useState("الفريق الأحمر");
  const [answerTime, setAnswerTime] = useState("30");
  
  // احضار بيانات التصنيفات
  const { data: categories } = useQuery<CategoryUI[]>({
    queryKey: ['/api/categories']
  });
  
  // تصفية التصنيفات المختارة فقط
  const selectedCategoryData = categories?.filter(category => 
    selectedCategories.includes(category.id)
  ) || [];
  
  // معالجة بدء اللعبة
  const handleStartGame = () => {
    console.log({
      gameName,
      team1Name,
      team2Name,
      answerTime,
      selectedCategories
    });
    setShowGameDialog(false);
    window.location.href = "/setup";
  };

  // عند عدم وجود فئات مختارة، نخفي العنصر
  if (selectedCategories.length === 0) {
    return null;
  }

  return (
    <>
      <div 
        className={`fixed left-0 top-1/3 transform transition-all duration-300 shadow-lg bg-white dark:bg-gray-800 rounded-l-none rounded-r-lg max-w-xs ${
          isCollapsed ? '-translate-x-[calc(100%-2rem)]' : 'translate-x-0'
        } z-50 border-2 border-primary`}
        style={{ maxHeight: 'calc(60vh)', overflowY: 'auto' }}
      >
        {/* زر الطي والبسط */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-14 bg-primary text-white rounded-l-none rounded-r-md flex items-center justify-center"
          aria-label={isCollapsed ? "عرض الفئات المحددة" : "إخفاء الفئات المحددة"}
        >
          {isCollapsed ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        <div className="p-3">
          <div className="flex justify-between items-center mb-4 bg-primary/10 p-2 rounded-lg">
            <h3 className="font-bold text-primary text-lg">الفئات المحددة</h3>
            <span className="px-3 py-1 bg-primary/20 rounded-full font-bold text-primary">
              {selectedCategories.length}/{maxSelectedCategories}
            </span>
          </div>
          
          <div className="space-y-2">
            {selectedCategoryData.map((category) => (
              <div 
                key={category.id}
                className="flex items-center justify-between gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  >
                    {category.nameAr[0]}
                  </div>
                  <span className="text-sm font-bold truncate text-blue-800 dark:text-blue-200">
                    {category.nameAr}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-full flex-shrink-0 hover:bg-red-600"
                  onClick={() => onRemoveCategory(category.id)}
                >
                  <X size={14} className="text-white" />
                </Button>
              </div>
            ))}
          </div>
          
          {selectedCategories.length >= 4 && (
            <div className="mt-4 space-y-2">
              <div className="text-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                يمكنك بدء اللعب الآن
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-2 shadow-md hover:shadow-lg transition-all duration-200 font-bold"
                onClick={() => setShowGameDialog(true)}
              >
                ابدأ اللعب
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* مودال إعداد اللعبة */}
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-xl font-bold mb-2">إعداد لعبة جديدة</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعبئة المعلومات التالية لبدء لعبة جديدة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 text-right">
            <div className="grid gap-2">
              <Label htmlFor="gameName" className="text-right">اسم اللعبة</Label>
              <Input 
                id="gameName" 
                value={gameName} 
                onChange={(e) => setGameName(e.target.value)} 
                placeholder="اسم اللعبة (اختياري)" 
                className="text-right"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="team1Name" className="text-right">اسم الفريق الأول</Label>
              <Input 
                id="team1Name" 
                value={team1Name} 
                onChange={(e) => setTeam1Name(e.target.value)} 
                placeholder="الفريق الأول" 
                className="text-right"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="team2Name" className="text-right">اسم الفريق الثاني</Label>
              <Input 
                id="team2Name" 
                value={team2Name} 
                onChange={(e) => setTeam2Name(e.target.value)} 
                placeholder="الفريق الثاني" 
                className="text-right"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-right mb-2 flex items-center justify-end gap-2">
                <span>وقت الإجابة</span>
                <Timer className="h-4 w-4 text-primary" />
              </Label>
              <RadioGroup 
                value={answerTime} 
                onValueChange={setAnswerTime}
                className="flex justify-between flex-wrap gap-y-2"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="15" id="time15" />
                  <Label htmlFor="time15">15 ثانية</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="30" id="time30" />
                  <Label htmlFor="time30">30 ثانية</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="60" id="time60" />
                  <Label htmlFor="time60">60 ثانية</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="90" id="time90" />
                  <Label htmlFor="time90">90 ثانية</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              type="submit" 
              onClick={handleStartGame}
              className="bg-primary w-full md:w-auto"
              disabled={!team1Name || !team2Name}
            >
              بدء اللعبة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectedCategoriesFloater;