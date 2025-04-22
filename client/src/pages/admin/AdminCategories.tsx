import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { CategoryUI } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { DifficultyLevel } from '@shared/schema';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FolderKanban,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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

const categorySchema = z.object({
  name: z.string().min(2, { message: 'يجب أن يكون الاسم على الأقل حرفين' }),
  nameAr: z.string().min(2, { message: 'يجب أن يكون الاسم العربي على الأقل حرفين' }),
  icon: z.string().min(1, { message: 'الرجاء اختيار أيقونة' }),
  color: z.string().min(1, { message: 'الرجاء اختيار لون' }),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  difficultyLevel: z.string().default(DifficultyLevel.MEDIUM),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(),
  parentId: z.number().nullable().optional(),
  order: z.number().default(0)
});

const colors = [
  { label: 'أزرق', value: 'blue-500' },
  { label: 'أخضر', value: 'green-500' },
  { label: 'أحمر', value: 'red-500' },
  { label: 'أصفر', value: 'yellow-500' },
  { label: 'أرجواني', value: 'purple-500' },
  { label: 'وردي', value: 'pink-500' },
  { label: 'برتقالي', value: 'orange-500' },
  { label: 'رمادي', value: 'gray-500' },
  { label: 'أزرق فاتح', value: 'blue-300' },
  { label: 'أخضر فاتح', value: 'green-300' },
];

const icons = [
  { label: 'مجلد', value: 'folder' },
  { label: 'رياضة', value: 'dumbbell' },
  { label: 'تاريخ', value: 'hourglass' },
  { label: 'علوم', value: 'flask' },
  { label: 'أدب', value: 'book' },
  { label: 'جغرافيا', value: 'globe' },
  { label: 'فن', value: 'palette' },
  { label: 'موسيقى', value: 'music' },
  { label: 'تكنولوجيا', value: 'laptop' },
  { label: 'طبيعة', value: 'leaf' },
  { label: 'طعام', value: 'utensils' },
  { label: 'سفر', value: 'plane' },
];

export default function AdminCategories() {
  const { toast } = useToast();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryUI | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // استعلام لجلب جميع الفئات
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/categories');
      const data = await response.json();
      return data as CategoryUI[];
    }
  });

  // تهيئة نموذج إضافة/تعديل الفئة
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      nameAr: '',
      icon: '',
      color: '',
      description: '',
      descriptionAr: '',
      difficultyLevel: DifficultyLevel.MEDIUM,
      isActive: true,
      parentId: null,
      order: 0
    }
  });

  // إعادة تعيين قيم النموذج عند التعديل
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name || '',
        nameAr: editingCategory.nameAr || '',
        icon: editingCategory.icon || '',
        color: editingCategory.color || '',
        description: editingCategory.description || '',
        descriptionAr: editingCategory.descriptionAr || '',
        difficultyLevel: editingCategory.difficultyLevel || DifficultyLevel.MEDIUM,
        isActive: editingCategory.isActive !== undefined ? editingCategory.isActive : true,
        imageUrl: editingCategory.imageUrl || '',
        parentId: editingCategory.parentId || null,
        order: editingCategory.order || 0
      });
    } else {
      form.reset({
        name: '',
        nameAr: '',
        icon: '',
        color: '',
        description: '',
        descriptionAr: '',
        difficultyLevel: DifficultyLevel.MEDIUM,
        isActive: true,
        parentId: null,
        order: 0
      });
    }
  }, [editingCategory, form]);

  // إضافة فئة جديدة
  const addCategoryMutation = useMutation({
    mutationFn: async (values: z.infer<typeof categorySchema>) => {
      const response = await apiRequest('POST', '/api/admin/categories', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: 'تمت الإضافة بنجاح',
        description: 'تم إضافة الفئة الجديدة بنجاح',
        variant: 'default',
      });
      setIsAddCategoryOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة الفئة',
        variant: 'destructive',
      });
    }
  });

  // تعديل فئة موجودة
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof categorySchema> }) => {
      const response = await apiRequest('PUT', `/api/admin/categories/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      toast({
        title: 'تم التعديل بنجاح',
        description: 'تم تحديث بيانات الفئة بنجاح',
        variant: 'default',
      });
      setEditingCategory(null);
      setIsAddCategoryOpen(false);
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

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, values });
    } else {
      addCategoryMutation.mutate(values);
    }
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prevExpanded => 
      prevExpanded.includes(categoryId)
        ? prevExpanded.filter(id => id !== categoryId)
        : [...prevExpanded, categoryId]
    );
  };

  // تصفية الفئات وفقًا للتبويب المحدد والبحث
  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.nameAr.includes(searchTerm);
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'active') return matchesSearch && category.isActive;
    if (selectedTab === 'inactive') return matchesSearch && !category.isActive;
    if (selectedTab === 'main') return matchesSearch && !category.parentId;
    if (selectedTab === 'sub') return matchesSearch && !!category.parentId;
    
    return matchesSearch;
  });

  // تنظيم الفئات بشكل هرمي
  const mainCategories = filteredCategories.filter(category => !category.parentId);
  const subCategories = filteredCategories.filter(category => !!category.parentId);

  // عرض الفئات بشكل شجري
  const renderCategory = (category: CategoryUI, isChild = false) => {
    const isExpanded = expandedCategories.includes(category.id);
    const children = subCategories.filter(sub => sub.parentId === category.id);
    const hasChildren = children.length > 0;

    return (
      <div key={category.id} className={isChild ? 'mr-6 border-r pr-3' : ''}>
        <div className={`flex items-center justify-between p-3 my-1 rounded-md ${category.isActive ? 'bg-card' : 'bg-muted opacity-70'}`}>
          <div className="flex items-center">
            {hasChildren && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 mr-1"
                onClick={() => toggleExpand(category.id)}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            )}
            <div 
              className={`w-4 h-4 rounded-full bg-${category.color} mr-2`}
            ></div>
            <div className="font-medium">
              {category.nameAr}
              <span className="text-muted-foreground text-xs mr-2">({category.name})</span>
              {!category.isActive && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded mr-2">
                  غير نشط
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1"
              onClick={() => {
                setEditingCategory(category);
                setIsAddCategoryOpen(true);
              }}
            >
              <Edit size={16} />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 text-red-500">
                  <Trash2 size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تأكيد حذف الفئة</DialogTitle>
                  <DialogDescription>
                    هل أنت متأكد من رغبتك في حذف فئة "{category.nameAr}"؟ هذا الإجراء لا يمكن التراجع عنه.
                    {hasChildren && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>تحذير!</AlertTitle>
                        <AlertDescription>
                          هذه الفئة تحتوي على {children.length} فئة فرعية. سيتم حذف جميع الفئات الفرعية أيضًا.
                        </AlertDescription>
                      </Alert>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>إلغاء</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteCategoryMutation.mutate(category.id)}
                  >
                    تأكيد الحذف
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {children.map(child => renderCategory(child, true))}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل الفئات. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Button 
            className="flex items-center"
            onClick={() => {
              setEditingCategory(null);
              setIsAddCategoryOpen(true);
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة فئة جديدة
          </Button>
        </div>
        <div className="flex-1 md:max-w-xs">
          <Input
            placeholder="بحث عن فئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="main">الفئات الرئيسية</TabsTrigger>
          <TabsTrigger value="sub">الفئات الفرعية</TabsTrigger>
          <TabsTrigger value="active">نشطة</TabsTrigger>
          <TabsTrigger value="inactive">غير نشطة</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderTree className="ml-2 h-5 w-5" />
                <span>الفئات ({filteredCategories.length})</span>
              </CardTitle>
              <CardDescription>
                عرض كافة الفئات بترتيب هرمي
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">جاري تحميل الفئات...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لم يتم العثور على فئات</div>
              ) : (
                <div>
                  {mainCategories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="main" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderKanban className="ml-2 h-5 w-5" />
                <span>الفئات الرئيسية ({mainCategories.length})</span>
              </CardTitle>
              <CardDescription>
                الفئات الرئيسية فقط
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">جاري تحميل الفئات...</div>
              ) : mainCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لم يتم العثور على فئات رئيسية</div>
              ) : (
                <div>
                  {mainCategories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sub" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderTree className="ml-2 h-5 w-5" />
                <span>الفئات الفرعية ({subCategories.length})</span>
              </CardTitle>
              <CardDescription>
                الفئات الفرعية فقط
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">جاري تحميل الفئات...</div>
              ) : subCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لم يتم العثور على فئات فرعية</div>
              ) : (
                <div>
                  {subCategories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="ml-2 h-5 w-5" />
                <span>الفئات النشطة ({filteredCategories.length})</span>
              </CardTitle>
              <CardDescription>
                الفئات النشطة فقط
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">جاري تحميل الفئات...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لم يتم العثور على فئات نشطة</div>
              ) : (
                <div>
                  {filteredCategories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <X className="ml-2 h-5 w-5" />
                <span>الفئات غير النشطة ({filteredCategories.length})</span>
              </CardTitle>
              <CardDescription>
                الفئات غير النشطة فقط
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">جاري تحميل الفئات...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لم يتم العثور على فئات غير نشطة</div>
              ) : (
                <div>
                  {filteredCategories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* نافذة إضافة/تعديل فئة */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'تعديل فئة' : 'إضافة فئة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'قم بتعديل بيانات الفئة' : 'أدخل بيانات الفئة الجديدة'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الفئة (عربي)</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم الفئة بالعربية" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الفئة (إنجليزي)</FormLabel>
                      <FormControl>
                        <Input dir="ltr" placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الأيقونة</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر أيقونة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {icons.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر لون" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full bg-${color.value} ml-2`}></div>
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
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
                  name="difficultyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مستوى الصعوبة</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مستوى الصعوبة" />
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
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة الأب</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        defaultValue={field.value?.toString() || ""}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="فئة رئيسية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">فئة رئيسية</SelectItem>
                          {categories
                            .filter(c => !c.parentId && (!editingCategory || c.id !== editingCategory.id))
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.nameAr}
                              </SelectItem>
                            ))}
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
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف (عربي)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="أدخل وصف الفئة بالعربية" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف (إنجليزي)</FormLabel>
                      <FormControl>
                        <Textarea dir="ltr" placeholder="Enter category description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>صورة الفئة</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="رابط صورة الفئة" {...field} />
                          <Button type="button" variant="outline" size="icon">
                            <Image className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        أدخل رابط صورة أو اضغط على زر الصورة لرفع ملف
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
                        <FormLabel className="text-base">
                          الحالة
                        </FormLabel>
                        <FormDescription>
                          هل الفئة نشطة ومتاحة للاستخدام؟
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
                    setEditingCategory(null);
                    setIsAddCategoryOpen(false);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCategory ? 'حفظ التغييرات' : 'إضافة الفئة'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}