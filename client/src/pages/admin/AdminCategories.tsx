import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CategoryUI } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  RefreshCw,
  Save,
  X,
  AlertCircle,
  Check,
  PlusCircle,
  Edit,
  CheckCircle,
  XCircle,
  BarChart,
  Filter,
  Search,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// نموذج بيانات الفئة
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }),
  nameAr: z.string().min(2, { message: 'الاسم بالعربية يجب أن يكون حرفين على الأقل' }),
  icon: z.string().default('📚'),
  color: z.string().default('#3b82f6'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  difficultyLevel: z.string().default('medium'),
  isActive: z.boolean().default(true),
  questionCount: z.number().default(6),
  imageUrl: z.string().optional(),
  parentId: z.number().nullish(),
  order: z.number().default(0),
});

export default function AdminCategories() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryUI | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // تحديث قيمة المستوى المحدد
  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value === 'all' ? null : value);
  };

  // جلب الفئات
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/categories');
      return response.json() as Promise<CategoryUI[]>;
    }
  });

  // نموذج إضافة/تعديل فئة
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      icon: '📚',
      color: '#3b82f6',
      description: '',
      descriptionAr: '',
      difficultyLevel: 'medium',
      isActive: true,
      questionCount: 6,
      imageUrl: '',
      parentId: null,
      order: 0,
    },
  });

  // إعادة تعيين النموذج عند فتح مربع الحوار
  useEffect(() => {
    if (isCategoryDialogOpen) {
      if (editingCategory) {
        form.reset({
          name: editingCategory.name,
          nameAr: editingCategory.nameAr,
          icon: editingCategory.icon || '📚',
          color: editingCategory.color || '#3b82f6',
          description: editingCategory.description || '',
          descriptionAr: editingCategory.descriptionAr || '',
          difficultyLevel: editingCategory.difficultyLevel || 'medium',
          isActive: typeof editingCategory.isActive === 'boolean' ? editingCategory.isActive : true,
          questionCount: editingCategory.questionCount || 6,
          imageUrl: editingCategory.imageUrl || '',
          parentId: editingCategory.parentId || null,
          order: editingCategory.order || 0,
        });
      } else {
        form.reset({
          name: '',
          nameAr: '',
          icon: '📚',
          color: '#3b82f6',
          description: '',
          descriptionAr: '',
          difficultyLevel: 'medium',
          isActive: true,
          questionCount: 6,
          imageUrl: '',
          parentId: null,
          order: 0,
        });
      }
    }
  }, [isCategoryDialogOpen, editingCategory, form]);

  // إضافة فئة جديدة
  const createCategoryMutation = useMutation({
    mutationFn: async (values: z.infer<typeof categoryFormSchema>) => {
      const response = await apiRequest('POST', '/api/admin/categories', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: 'تمت الإضافة بنجاح',
        description: 'تم إضافة الفئة بنجاح',
        variant: 'default',
      });
      setIsCategoryDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة الفئة',
        variant: 'destructive',
      });
    }
  });

  // تعديل فئة
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof categoryFormSchema> }) => {
      const response = await apiRequest('PUT', `/api/admin/categories/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: 'تم التعديل بنجاح',
        description: 'تم تعديل الفئة بنجاح',
        variant: 'default',
      });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء تعديل الفئة',
        variant: 'destructive',
      });
    }
  });

  // حذف فئة
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف الفئة بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء حذف الفئة',
        variant: 'destructive',
      });
    }
  });

  // التعامل مع تقديم النموذج
  const onSubmit = (values: z.infer<typeof categoryFormSchema>) => {
    if (editingCategory) {
      // تعديل فئة موجودة
      updateCategoryMutation.mutate({ id: editingCategory.id, values });
    } else {
      // إضافة فئة جديدة
      createCategoryMutation.mutate(values);
    }
  };

  // تصفية الفئات
  const filteredCategories = categories.filter(category => {
    return (
      (searchTerm === '' || 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.nameAr.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDifficulty === null || category.difficultyLevel === selectedDifficulty)
    );
  });

  // تصنيف الفئات حسب المستوى
  const parentCategories = filteredCategories.filter(cat => !cat.parentId);
  const childCategories = filteredCategories.filter(cat => cat.parentId);

  // الحصول على بادج المستوى
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

  // في حالة وجود خطأ
  if (categoriesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل بيانات الفئات. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryDialogOpen(true);
              }}
            >
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'تعديل فئة' : 'إضافة فئة جديدة'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'قم بتعديل بيانات الفئة ثم اضغط على حفظ' : 'أدخل بيانات الفئة الجديدة هنا'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم بالإنجليزية</FormLabel>
                        <FormControl>
                          <Input placeholder="Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم بالعربية</FormLabel>
                        <FormControl>
                          <Input placeholder="العلوم" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرمز</FormLabel>
                        <FormControl>
                          <Input placeholder="📚" {...field} />
                        </FormControl>
                        <FormDescription>
                          يمكنك استخدام رمز إيموجي أو اسم أيقونة
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اللون</FormLabel>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="difficultyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مستوى الصعوبة</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المستوى" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">سهل</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="hard">صعب</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف بالإنجليزية</FormLabel>
                        <FormControl>
                          <Input placeholder="Science category description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف بالعربية</FormLabel>
                        <FormControl>
                          <Input placeholder="وصف فئة العلوم" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد الأسئلة</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 6)}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفئة الأم</FormLabel>
                        <Select 
                          value={field.value?.toString() || ""} 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفئة الأم (اختياري)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">بدون فئة أم</SelectItem>
                            {parentCategories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.nameAr || category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          اختيارية - اترك فارغًا للفئات الرئيسية
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الترتيب</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          يستخدم لترتيب الفئات في العرض
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.png" {...field} />
                      </FormControl>
                      <FormDescription>
                        اختياري - رابط صورة للفئة
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>الحالة</FormLabel>
                        <FormDescription>
                          تحديد ما إذا كانت الفئة متاحة للاستخدام
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

                <DialogFooter>
                  <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                    {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                      <>
                        <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        حفظ
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="بحث في الفئات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
          
          <Select 
            value={selectedDifficulty || 'all'} 
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              <SelectItem value="easy">سهل</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="hard">صعب</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoadingCategories ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {filteredCategories.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>لا توجد فئات</AlertTitle>
              <AlertDescription>
                لم يتم العثور على أي فئات تطابق معايير البحث. قم بإضافة فئة جديدة.
              </AlertDescription>
            </Alert>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onEdit={() => {
                    setEditingCategory(category);
                    setIsCategoryDialogOpen(true);
                  }}
                  onDelete={() => {
                    if (window.confirm(`هل أنت متأكد من حذف فئة "${category.nameAr || category.name}"؟`)) {
                      deleteCategoryMutation.mutate(category.id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الفئة الأم</TableHead>
                    <TableHead>المستوى</TableHead>
                    <TableHead>عدد الأسئلة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category, index) => {
                    const parentCategory = category.parentId 
                      ? categories.find(cat => cat.id === category.parentId) 
                      : null;
                    
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <span
                                className="flex items-center justify-center w-8 h-8 rounded-full text-white"
                                style={{ backgroundColor: category.color || '#3b82f6' }}
                              >
                                {category.icon || '📚'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{category.nameAr}</div>
                              <div className="text-xs text-muted-foreground">{category.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {parentCategory ? (
                            <div className="flex items-center gap-1">
                              <span
                                className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs"
                                style={{ backgroundColor: parentCategory.color || '#3b82f6' }}
                              >
                                {parentCategory.icon || '📚'}
                              </span>
                              <span className="text-sm">{parentCategory.nameAr || parentCategory.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getDifficultyBadge(category.difficultyLevel)}</TableCell>
                        <TableCell>{category.questionCount || 6}</TableCell>
                        <TableCell>
                          {category.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              مفعّلة
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 ml-1" />
                              معطلة
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCategory(category);
                                setIsCategoryDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف فئة "${category.nameAr || category.name}"؟`)) {
                                  deleteCategoryMutation.mutate(category.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// مكون بطاقة الفئة
function CategoryCard({ 
  category, 
  onEdit, 
  onDelete 
}: { 
  category: CategoryUI; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-2" 
        style={{ backgroundColor: category.color || '#3b82f6' }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full text-white"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            >
              {category.icon || '📚'}
            </div>
            <div>
              <CardTitle className="text-lg">{category.nameAr}</CardTitle>
              <CardDescription>{category.name}</CardDescription>
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
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 ml-2" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          {category.difficultyLevel && getDifficultyBadge(category.difficultyLevel)}
          
          {category.isActive !== undefined && (
            category.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مفعّلة</Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">معطلة</Badge>
            )
          )}
          
          {category.questionCount && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <BarChart className="h-3 w-3 ml-1" />
              {category.questionCount} أسئلة
            </Badge>
          )}
        </div>
        
        {(category.descriptionAr || category.description) && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.descriptionAr || category.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 ml-2" />
            تعديل
          </Button>
          <Button variant="outline" size="sm" className="text-red-500" onClick={onDelete}>
            <Trash2 className="h-4 w-4 ml-2" />
            حذف
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// دالة مساعدة لعرض بادج المستوى
function getDifficultyBadge(difficulty: string) {
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
}