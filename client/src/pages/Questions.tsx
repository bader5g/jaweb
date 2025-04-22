import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DifficultyLevel } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Plus, ChevronLeft } from "lucide-react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";

// مكون واجهة بطاقة السؤال
const QuestionItem = ({ question }: { question: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className={`pb-3 ${getDifficultyColor(question.difficulty)}`}>
          <CardTitle className="flex justify-between">
            <span>{question.text}</span>
            <span className="text-sm bg-white bg-opacity-30 px-2 py-1 rounded">
              {getDifficultyLabel(question.difficulty)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className={`${isExpanded ? 'block' : 'hidden'}`}>
            <p className="mb-3"><strong>الإجابة:</strong> {question.answer}</p>
            <p className="text-xs text-gray-500">التصنيف: {question.categoryName}</p>
          </div>
          <Button 
            variant="outline" 
            className="mt-2 w-full" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "إخفاء الإجابة" : "إظهار الإجابة"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// الصفحة الرئيسية للأسئلة
export default function Questions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDifficulty, setCurrentDifficulty] = useState("all");
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // تعريف نوع البيانات
  type QuestionType = {
    id: number;
    text: string;
    answer: string;
    categoryId: number;
    categoryName: string;
    difficulty: string;
  };

  type CategoryType = {
    id: number;
    name: string;
  };

  // استعلام للحصول على قائمة التصنيفات
  const categoriesQuery = useQuery({
    queryKey: ['/api/categories']
  });
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];

  // استعلام للحصول على قائمة الأسئلة
  const questionsQuery = useQuery({
    queryKey: ['/api/questions']
  });
  const questions = Array.isArray(questionsQuery.data) ? questionsQuery.data : [];
  const isLoading = questionsQuery.isLoading;

  // تصفية الأسئلة حسب البحث والتصنيف والصعوبة
  const filteredQuestions = questions.filter((question: any) => {
    const matchesSearch = searchTerm === "" || 
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = currentDifficulty === "all" || 
      question.difficulty === currentDifficulty;
    
    const matchesCategory = currentCategory === null || 
      question.categoryId === currentCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // تحميل الأسئلة الافتراضية
  const mockQuestions = [
    { 
      id: 1, 
      text: "ما هي عاصمة فرنسا؟", 
      answer: "باريس", 
      categoryId: 3, 
      categoryName: "الجغرافيا", 
      difficulty: "easy" 
    },
    { 
      id: 2, 
      text: "ما هو العنصر الكيميائي الأكثر وفرة في القشرة الأرضية؟", 
      answer: "الأكسجين", 
      categoryId: 2, 
      categoryName: "العلوم", 
      difficulty: "medium" 
    },
    { 
      id: 3, 
      text: "متى وقعت معركة بدر الكبرى؟", 
      answer: "17 رمضان من السنة الثانية للهجرة", 
      categoryId: 4, 
      categoryName: "التاريخ", 
      difficulty: "hard" 
    },
    { 
      id: 4, 
      text: "كم عدد لاعبي فريق كرة القدم؟", 
      answer: "11 لاعب", 
      categoryId: 6, 
      categoryName: "الرياضة", 
      difficulty: "easy" 
    },
    { 
      id: 5, 
      text: "ما هي الدولة التي تحتوي على أطول جدار في العالم؟", 
      answer: "الصين", 
      categoryId: 3, 
      categoryName: "الجغرافيا", 
      difficulty: "medium" 
    },
  ];

  // استخدام الأسئلة الافتراضية إذا لم تكن هناك أسئلة من الخادم
  const displayQuestions = questions.length > 0 ? filteredQuestions : mockQuestions;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">بنك الأسئلة</h1>
        </div>
        <Button className="bg-primary">
          <Plus className="h-4 w-4 ml-2" /> إضافة سؤال جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* شريط البحث والتصفية */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">البحث والتصفية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن سؤال..."
                  className="pr-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">الصعوبة</h3>
                <Tabs
                  defaultValue="all"
                  className="w-full"
                  value={currentDifficulty}
                  onValueChange={setCurrentDifficulty}
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">الكل</TabsTrigger>
                    <TabsTrigger value="easy" className="flex-1">سهل</TabsTrigger>
                    <TabsTrigger value="medium" className="flex-1">متوسط</TabsTrigger>
                    <TabsTrigger value="hard" className="flex-1">صعب</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">التصنيف</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div 
                    className={`cursor-pointer p-2 rounded ${currentCategory === null ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setCurrentCategory(null)}
                  >
                    الكل
                  </div>
                  {categories.map((category: any) => (
                    <div 
                      key={category.id}
                      className={`cursor-pointer p-2 rounded ${currentCategory === category.id ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                      onClick={() => setCurrentCategory(category.id)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الأسئلة */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="text-center p-10">
              <p className="text-gray-500">جاري تحميل الأسئلة...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">الأسئلة ({displayQuestions.length})</h2>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 ml-2" /> ترتيب حسب
                </Button>
              </div>
              
              <div className="space-y-4">
                {displayQuestions.length === 0 ? (
                  <div className="text-center p-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">لا توجد أسئلة تطابق معايير البحث</p>
                  </div>
                ) : (
                  displayQuestions.map((question: any) => (
                    <QuestionItem key={question.id} question={question} />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// وظائف مساعدة
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return 'bg-green-100 text-green-700';
    case DifficultyLevel.MEDIUM:
      return 'bg-orange-100 text-orange-700';
    case DifficultyLevel.HARD:
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return 'سهل';
    case DifficultyLevel.MEDIUM:
      return 'متوسط';
    case DifficultyLevel.HARD:
      return 'صعب';
    default:
      return 'غير محدد';
  }
}