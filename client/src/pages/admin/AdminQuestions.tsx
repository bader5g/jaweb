import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Question, 
  DifficultyLevel,
  MediaType, 
  Category as CategoryType,
  CategoryUI
} from '@shared/schema';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  CheckCircle,
  XCircle,
  Filter,
  Info,
  AlertCircle,
  Play,
  ArrowUpDown,
  MoreHorizontal,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// نموذج للتحقق من صحة بيانات السؤال
const questionSchema = z.object({
  text: z.string().min(3, { message: 'يجب أن يكون السؤال على الأقل 3 أحرف' }),
  answer: z.string().min(1, { message: 'يجب إدخال الإجابة' }),
  difficulty: z.string().min(1, { message: 'يجب اختيار مستوى الصعوبة' }),
  points: z.number().int().positive({ message: 'يجب أن تكون النقاط عددًا موجبًا' }),
  categoryId: z.number().int().positive({ message: 'يجب اختيار الفئة' }),
  mediaType: z.string().default(MediaType.NONE),
  mediaUrl: z.string().optional(),
  explanation: z.string().optional(),
  hintText: z.string().optional(),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().default(true),
});

export default function AdminQuestions() {
  const { toast } = useToast();
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string | null>(null);
  const [approvedFilter, setApprovedFilter] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');

  // جلب الأسئلة
  const { data: questions = [], isLoading: isLoadingQuestions, error: questionsError } = useQuery({
    queryKey: ['/api/admin/questions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/questions');
      return response.json() as Promise<Question[]>;
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

  // إعداد النموذج
  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      answer: '',
      difficulty: DifficultyLevel.MEDIUM,
      points: 2, // قيمة افتراضية
      categoryId: 0,
      mediaType: MediaType.NONE,
      mediaUrl: '',
      explanation: '',
      hintText: '',
      isActive: true,
      isApproved: true
    }
  });

  // تحديث النموذج عند تعديل سؤال موجود
  useEffect(() => {
    if (editingQuestion) {
      form.reset({
        text: editingQuestion.text,
        answer: editingQuestion.answer,
        difficulty: editingQuestion.difficulty,
        points: editingQuestion.points,
        categoryId: editingQuestion.categoryId || 0,
        mediaType: editingQuestion.mediaType || MediaType.NONE,
        mediaUrl: editingQuestion.mediaUrl || '',
        explanation: editingQuestion.explanation || '',
        hintText: editingQuestion.hintText || '',
        isActive: editingQuestion.isActive !== undefined ? editingQuestion.isActive : true,
        isApproved: editingQuestion.isApproved !== undefined ? editingQuestion.isApproved : true
      });
    } else {
      form.reset({
        text: '',
        answer: '',
        difficulty: DifficultyLevel.MEDIUM,
        points: 2,
        categoryId: 0,
        mediaType: MediaType.NONE,
        mediaUrl: '',
        explanation: '',
        hintText: '',
        isActive: true,
        isApproved: true
      });
    }
  }, [editingQuestion, form]);

  // إنشاء سؤال جديد
  const addQuestionMutation = useMutation({
    mutationFn: async (values: z.infer<typeof questionSchema>) => {
      const response = await apiRequest('POST', '/api/admin/questions', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: 'تمت الإضافة بنجاح',
        description: 'تم إضافة السؤال الجديد بنجاح',
        variant: 'default',
      });
      setIsAddQuestionOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة السؤال',
        variant: 'destructive',
      });
    }
  });

  // تعديل سؤال موجود
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof questionSchema> }) => {
      const response = await apiRequest('PUT', `/api/admin/questions/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: 'تم التعديل بنجاح',
        description: 'تم تحديث بيانات السؤال بنجاح',
        variant: 'default',
      });
      setEditingQuestion(null);
      setIsAddQuestionOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء تعديل السؤال',
        variant: 'destructive',
      });
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

  // الموافقة على سؤال
  const approveQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PUT', `/api/admin/questions/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      toast({
        title: 'تمت الموافقة',
        description: 'تمت الموافقة على السؤال بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء الموافقة على السؤال',
        variant: 'destructive',
      });
    }
  });

  // تقديم النموذج
  const onSubmit = (values: z.infer<typeof questionSchema>) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, values });
    } else {
      addQuestionMutation.mutate(values);
    }
  };

  // تطبيق الفلاتر على الأسئلة
  const filteredQuestions = questions.filter(question => {
    // فلتر البحث
    const matchesSearch = !searchTerm || 
      question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    // فلتر الفئة
    const matchesCategory = !categoryFilter || question.categoryId === categoryFilter;
    
    // فلتر الصعوبة
    const matchesDifficulty = !difficultyFilter || question.difficulty === difficultyFilter;
    
    // فلتر نوع الوسائط
    const matchesMediaType = !mediaTypeFilter || question.mediaType === mediaTypeFilter;
    
    // فلتر الموافقة
    const matchesApproved = approvedFilter === null || question.isApproved === approvedFilter;
    
    // فلتر التبويب المحدد
    let matchesTab = true;
    if (selectedTab === 'pending') {
      matchesTab = !question.isApproved;
    } else if (selectedTab === 'approved') {
      matchesTab = question.isApproved === true;
    } else if (selectedTab === 'media') {
      matchesTab = question.mediaType !== MediaType.NONE;
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMediaType && matchesApproved && matchesTab;
  });

  // تحديد نوع الوسائط المناسب للعرض
  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case MediaType.IMAGE:
        return <Image className="h-4 w-4" />;
      case MediaType.VIDEO:
        return <Video className="h-4 w-4" />;
      case MediaType.AUDIO:
        return <Music className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // تحديد لون وبادج مستوى الصعوبة
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">سهل</Badge>;
      case DifficultyLevel.MEDIUM:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">متوسط</Badge>;
      case DifficultyLevel.HARD:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">صعب</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  // الحصول على اسم الفئة بناءً على المعرف
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nameAr : 'غير محدد';
  };

  // إعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setDifficultyFilter(null);
    setMediaTypeFilter(null);
    setApprovedFilter(null);
  };

  // في حالة وجود خطأ
  if (questionsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل الأسئلة. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Button
          onClick={() => {
            setEditingQuestion(null);
            setIsAddQuestionOpen(true);
          }}
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة سؤال جديد
        </Button>
        
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="بحث في الأسئلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>تصفية الأسئلة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">الفئة:</p>
                <Select 
                  value={categoryFilter?.toString() || ''}
                  onValueChange={(val) => setCategoryFilter(val ? parseInt(val) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">الصعوبة:</p>
                <Select 
                  value={difficultyFilter || ''}
                  onValueChange={(val) => setDifficultyFilter(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المستويات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المستويات</SelectItem>
                    <SelectItem value={DifficultyLevel.EASY}>سهل</SelectItem>
                    <SelectItem value={DifficultyLevel.MEDIUM}>متوسط</SelectItem>
                    <SelectItem value={DifficultyLevel.HARD}>صعب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">نوع الوسائط:</p>
                <Select 
                  value={mediaTypeFilter || ''}
                  onValueChange={(val) => setMediaTypeFilter(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأنواع</SelectItem>
                    <SelectItem value={MediaType.NONE}>نص فقط</SelectItem>
                    <SelectItem value={MediaType.IMAGE}>صورة</SelectItem>
                    <SelectItem value={MediaType.VIDEO}>فيديو</SelectItem>
                    <SelectItem value={MediaType.AUDIO}>صوت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">الحالة:</p>
                <Select 
                  value={approvedFilter === null ? '' : approvedFilter ? 'approved' : 'pending'}
                  onValueChange={(val) => {
                    if (val === '') setApprovedFilter(null);
                    else if (val === 'approved') setApprovedFilter(true);
                    else setApprovedFilter(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="approved">موافق عليها</SelectItem>
                    <SelectItem value="pending">بانتظار الموافقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="outline" className="w-full" onClick={resetFilters}>
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">جميع الأسئلة</TabsTrigger>
          <TabsTrigger value="approved">الموافق عليها</TabsTrigger>
          <TabsTrigger value="pending">بانتظار الموافقة</TabsTrigger>
          <TabsTrigger value="media">الوسائط المتعددة</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="ml-2 h-5 w-5" />
                قائمة الأسئلة ({filteredQuestions.length})
              </div>
              {filteredQuestions.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredQuestions.length} / {questions.length} سؤال
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {selectedTab === 'all' && 'عرض كافة الأسئلة المتاحة في النظام'}
              {selectedTab === 'approved' && 'الأسئلة التي تمت الموافقة عليها'}
              {selectedTab === 'pending' && 'الأسئلة التي تنتظر الموافقة عليها'}
              {selectedTab === 'media' && 'الأسئلة التي تحتوي على وسائط متعددة (صور، فيديو، صوت)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingQuestions ? (
              <div className="text-center py-8">جاري تحميل الأسئلة...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لم يتم العثور على أسئلة</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>السؤال</TableHead>
                      <TableHead className="w-[100px]">الفئة</TableHead>
                      <TableHead className="w-[80px]">الصعوبة</TableHead>
                      <TableHead className="w-[80px]">النقاط</TableHead>
                      <TableHead className="w-[80px]">نوع الوسائط</TableHead>
                      <TableHead className="w-[80px]">الحالة</TableHead>
                      <TableHead className="w-[100px] text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-base">{question.text}</span>
                            <span className="text-sm text-muted-foreground">
                              الإجابة: {question.answer}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryName(question.categoryId)}</TableCell>
                        <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                        <TableCell>{question.points}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getMediaIcon(question.mediaType || MediaType.NONE)}
                            <span className="mr-1 text-xs">
                              {question.mediaType === MediaType.IMAGE && 'صورة'}
                              {question.mediaType === MediaType.VIDEO && 'فيديو'}
                              {question.mediaType === MediaType.AUDIO && 'صوت'}
                              {(!question.mediaType || question.mediaType === MediaType.NONE) && 'نص فقط'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {question.isApproved ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              معتمد
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <AlertCircle className="h-3 w-3 ml-1" />
                              بانتظار الموافقة
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingQuestion(question);
                                setIsAddQuestionOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تأكيد حذف السؤال</DialogTitle>
                                  <DialogDescription>
                                    هل أنت متأكد من رغبتك في حذف هذا السؤال؟ هذا الإجراء لا يمكن التراجع عنه.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="p-4 border rounded-md bg-muted">
                                  <p className="font-medium">{question.text}</p>
                                  <p className="text-sm text-muted-foreground mt-1">الإجابة: {question.answer}</p>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => {}}>إلغاء</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => deleteQuestionMutation.mutate(question.id)}
                                  >
                                    تأكيد الحذف
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {!question.isApproved && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-500"
                                onClick={() => approveQuestionMutation.mutate(question.id)}
                                title="الموافقة على السؤال"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* نافذة إضافة/تعديل سؤال */}
      <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'تعديل سؤال' : 'إضافة سؤال جديد'}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'قم بتعديل بيانات السؤال' : 'أدخل بيانات السؤال الجديد'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص السؤال</FormLabel>
                    <FormControl>
                      <Textarea placeholder="أدخل نص السؤال" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الإجابة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الإجابة الصحيحة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <SelectItem value="0">جاري التحميل...</SelectItem>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.nameAr}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مستوى الصعوبة</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المستوى" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DifficultyLevel.EASY}>سهل</SelectItem>
                          <SelectItem value={DifficultyLevel.MEDIUM}>متوسط</SelectItem>
                          <SelectItem value={DifficultyLevel.HARD}>صعب</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>النقاط</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="عدد النقاط" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mediaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الوسائط</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الوسائط" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MediaType.NONE}>نص فقط</SelectItem>
                        <SelectItem value={MediaType.IMAGE}>صورة</SelectItem>
                        <SelectItem value={MediaType.VIDEO}>فيديو</SelectItem>
                        <SelectItem value={MediaType.AUDIO}>صوت</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('mediaType') !== MediaType.NONE && (
                <FormField
                  control={form.control}
                  name="mediaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الوسائط</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder={
                              form.watch('mediaType') === MediaType.IMAGE ? "رابط الصورة" :
                              form.watch('mediaType') === MediaType.VIDEO ? "رابط الفيديو" :
                              "رابط الملف الصوتي"
                            } 
                            {...field} 
                          />
                          <Button type="button" variant="outline" size="icon">
                            {form.watch('mediaType') === MediaType.IMAGE && <Image className="h-4 w-4" />}
                            {form.watch('mediaType') === MediaType.VIDEO && <Video className="h-4 w-4" />}
                            {form.watch('mediaType') === MediaType.AUDIO && <Music className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        أدخل رابط {
                          form.watch('mediaType') === MediaType.IMAGE ? "الصورة" :
                          form.watch('mediaType') === MediaType.VIDEO ? "الفيديو" :
                          "الملف الصوتي"
                        } أو اضغط على زر الرفع لإضافة ملف
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شرح الإجابة (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="أدخل شرحًا للإجابة (سيظهر بعد الإجابة على السؤال)" {...field} />
                    </FormControl>
                    <FormDescription>
                      يمكنك إضافة شرح توضيحي للإجابة ليظهر للاعبين بعد الإجابة على السؤال
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hintText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تلميح (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل تلميحًا للسؤال" {...field} />
                    </FormControl>
                    <FormDescription>
                      يمكن استخدام هذا التلميح عندما يستخدم اللاعب وسيلة مساعدة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          الحالة
                        </FormLabel>
                        <FormDescription>
                          هل السؤال نشط ومتاح للاستخدام في اللعبة؟
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isApproved"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          الموافقة
                        </FormLabel>
                        <FormDescription>
                          هل تمت الموافقة على هذا السؤال؟
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingQuestion(null);
                    setIsAddQuestionOpen(false);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingQuestion ? 'حفظ التغييرات' : 'إضافة السؤال'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}