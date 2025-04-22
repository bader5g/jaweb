import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Upload, 
  PlusCircle, 
  FileSpreadsheet, 
  RefreshCw, 
  Search, 
  Filter,
  Pencil,
  Trash2,
  Image,
  Music,
  Video,
  File,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MediaType, Question as QuestionType, CategoryUI } from '@shared/schema';
import QuestionDialog from '@/components/dialogs/QuestionDialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminQuestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingQuestion, setEditingQuestion] = useState<QuestionType | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  // جلب الأسئلة
  const { data: questions = [], isLoading: isLoadingQuestions, error: questionsError } = useQuery({
    queryKey: ['/api/admin/questions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/questions');
      return response.json() as Promise<QuestionType[]>;
    }
  });

  // جلب الفئات
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/categories');
      return response.json() as Promise<CategoryUI[]>;
    }
  });

  // حذف سؤال
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف السؤال بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء حذف السؤال',
        variant: 'destructive',
      });
    }
  });

  // تصفية الأسئلة
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = 
      searchTerm === '' || 
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === null || 
      (question.categoryId !== null && question.categoryId.toString() === selectedCategory);
      
    const matchesDifficulty = 
      selectedDifficulty === null || 
      question.difficulty === selectedDifficulty;
      
    const matchesMediaType = 
      activeTab === 'all' || 
      (activeTab === 'text' && (!question.mediaType || question.mediaType === '')) ||
      (activeTab === 'image' && question.mediaType === MediaType.IMAGE) ||
      (activeTab === 'audio' && question.mediaType === MediaType.AUDIO) ||
      (activeTab === 'video' && question.mediaType === MediaType.VIDEO);
      
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMediaType;
  });

  // الحصول على اسم الفئة من خلال المعرف
  const getCategoryName = (categoryId: number | null): string => {
    if (categoryId === null) return 'غير معروف';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? (category.nameAr || category.name) : 'غير معروف';
  };

  // الحصول على شارة مستوى الصعوبة
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">سهل</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">متوسط</Badge>;
      case 'hard':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">صعب</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  // معالجة تغيير نوع الوسائط المختار
  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value === 'all' ? null : value);
  };

  // معالجة تغيير الفئة المختارة
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? null : value);
  };

  // الحصول على أيقونة نوع الوسائط
  const getMediaTypeIcon = (mediaType?: string) => {
    if (!mediaType) return <File className="h-4 w-4" />;
    switch (mediaType) {
      case MediaType.IMAGE:
        return <Image className="h-4 w-4" />;
      case MediaType.AUDIO:
        return <Music className="h-4 w-4" />;
      case MediaType.VIDEO:
        return <Video className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // الحصول على اسم نوع الوسائط
  const getMediaTypeName = (mediaType?: string) => {
    if (!mediaType) return 'نص';
    switch (mediaType) {
      case MediaType.IMAGE:
        return 'صورة';
      case MediaType.AUDIO:
        return 'صوت';
      case MediaType.VIDEO:
        return 'فيديو';
      default:
        return 'نص';
    }
  };

  // في حالة وجود خطأ
  if (questionsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل بيانات الأسئلة. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => {
            setEditingQuestion(null);
            setIsQuestionDialogOpen(true);
          }}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة سؤال جديد
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="ml-2 h-4 w-4" />
            استيراد من ملف Excel
          </Button>
          <Button variant="outline">
            <Upload className="ml-2 h-4 w-4" />
            تصدير الأسئلة
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="بحث في الأسئلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
          
          <Select 
            value={selectedDifficulty || 'all'} 
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              <SelectItem value="easy">سهل</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="hard">صعب</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedCategory || 'all'} 
            onValueChange={handleCategoryChange}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.nameAr || category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">جميع الأسئلة</TabsTrigger>
          <TabsTrigger value="text">أسئلة نصية</TabsTrigger>
          <TabsTrigger value="image">أسئلة مع صور</TabsTrigger>
          <TabsTrigger value="audio">أسئلة مع صوتيات</TabsTrigger>
          <TabsTrigger value="video">أسئلة مع فيديو</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoadingQuestions ? (
            <div className="flex justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredQuestions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>لا توجد أسئلة</CardTitle>
                <CardDescription>
                  لم يتم العثور على أسئلة تطابق معايير البحث. يمكنك إضافة أسئلة جديدة.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <AlertCircle className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-muted-foreground">
                  قم بإضافة أسئلة جديدة لاستخدامها في الألعاب المختلفة. <br />
                  يمكنك إضافة أسئلة نصية أو أسئلة مع وسائط متعددة مثل الصور والصوت والفيديو.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionDialogOpen(true);
                }}>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة سؤال جديد
                </Button>
              </CardFooter>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="overflow-hidden">
                  <div 
                    className="h-2" 
                    style={{ 
                      backgroundColor: 
                        question.difficulty === 'easy' ? '#10b981' : 
                        question.difficulty === 'medium' ? '#3b82f6' : 
                        '#f97316' 
                    }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="flex items-center justify-center h-8 w-8 rounded-full text-white"
                          style={{ 
                            backgroundColor: 
                              question.difficulty === 'easy' ? '#10b981' : 
                              question.difficulty === 'medium' ? '#3b82f6' : 
                              '#f97316' 
                          }}
                        >
                          {getMediaTypeIcon(question.mediaType)}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {getCategoryName(question.categoryId)}
                          </CardTitle>
                          <CardDescription>
                            {getDifficultyBadge(question.difficulty)}
                            {' '}
                            <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200">
                              {question.points} نقطة
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>خيارات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setShowDetails(question.id)}>
                            <Info className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingQuestion(question);
                            setIsQuestionDialogOpen(true);
                          }}>
                            <Pencil className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف سؤال "${question.text}"؟`)) {
                                deleteQuestionMutation.mutate(question.id);
                              }
                            }}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm line-clamp-3 min-h-[80px]">
                      {question.text}
                    </div>
                    
                    {question.mediaType && question.mediaUrl && (
                      <div className="mt-2 flex justify-center">
                        {question.mediaType === MediaType.IMAGE ? (
                          <img 
                            src={question.mediaUrl} 
                            alt="صورة السؤال" 
                            className="max-h-[120px] object-contain rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=خطأ+في+الصورة';
                            }}
                          />
                        ) : question.mediaType === MediaType.AUDIO ? (
                          <audio 
                            controls 
                            src={question.mediaUrl}
                            className="w-full"
                          >
                            متصفحك لا يدعم تشغيل الصوت
                          </audio>
                        ) : (
                          <video 
                            controls 
                            src={question.mediaUrl}
                            className="max-h-[120px] rounded-md"
                          >
                            متصفحك لا يدعم تشغيل الفيديو
                          </video>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 border-t flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-gray-100">
                        {getMediaTypeName(question.mediaType)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">الإجابة: <span className="font-normal">{question.answer}</span></p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-1/3">السؤال</TableHead>
                    <TableHead>الإجابة</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>المستوى</TableHead>
                    <TableHead>نوع الوسائط</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="line-clamp-2">
                          {question.text}
                        </div>
                      </TableCell>
                      <TableCell>{question.answer}</TableCell>
                      <TableCell>{getCategoryName(question.categoryId)}</TableCell>
                      <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMediaTypeIcon(question.mediaType)}
                          <span>{getMediaTypeName(question.mediaType)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDetails(question.id)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingQuestion(question);
                              setIsQuestionDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف سؤال "${question.text}"؟`)) {
                                deleteQuestionMutation.mutate(question.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* مربع حوار إضافة/تعديل سؤال */}
      <QuestionDialog 
        isOpen={isQuestionDialogOpen}
        onClose={() => {
          setIsQuestionDialogOpen(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        isEdit={!!editingQuestion}
      />

      {/* مربع حوار تفاصيل السؤال */}
      {showDetails !== null && (
        <Dialog open={showDetails !== null} onOpenChange={() => setShowDetails(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل السؤال</DialogTitle>
              <DialogDescription>
                عرض كامل تفاصيل السؤال
              </DialogDescription>
            </DialogHeader>
            
            {(() => {
              const question = questions.find(q => q.id === showDetails);
              if (!question) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">السؤال:</h3>
                      <p className="text-sm p-2 border rounded-md bg-gray-50">{question.text}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">الإجابة:</h3>
                      <p className="text-sm p-2 border rounded-md bg-gray-50">{question.answer}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold mb-1">الفئة:</h3>
                      <p className="text-sm">{getCategoryName(question.categoryId)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">المستوى:</h3>
                      <p>{getDifficultyBadge(question.difficulty)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">النقاط:</h3>
                      <p className="text-sm">{question.points} نقطة</p>
                    </div>
                  </div>
                  
                  {question.mediaType && question.mediaUrl && (
                    <div>
                      <h3 className="font-semibold mb-2">الوسائط المرفقة:</h3>
                      <div className="border rounded-md p-4 flex justify-center">
                        {question.mediaType === MediaType.IMAGE ? (
                          <img 
                            src={question.mediaUrl} 
                            alt="صورة السؤال" 
                            className="max-h-[300px] object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=خطأ+في+الصورة';
                            }}
                          />
                        ) : question.mediaType === MediaType.AUDIO ? (
                          <audio 
                            controls 
                            src={question.mediaUrl}
                            className="w-full"
                          >
                            متصفحك لا يدعم تشغيل الصوت
                          </audio>
                        ) : question.mediaType === MediaType.VIDEO ? (
                          <video 
                            controls 
                            src={question.mediaUrl}
                            className="max-h-[300px]"
                          >
                            متصفحك لا يدعم تشغيل الفيديو
                          </video>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowDetails(null)}>
                      إغلاق
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setEditingQuestion(question);
                        setIsQuestionDialogOpen(true);
                        setShowDetails(null);
                      }}>
                        <Pencil className="h-4 w-4 ml-2" />
                        تعديل
                      </Button>
                      <Button variant="destructive" onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف سؤال "${question.text}"؟`)) {
                          deleteQuestionMutation.mutate(question.id);
                          setShowDetails(null);
                        }
                      }}>
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </DialogFooter>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}