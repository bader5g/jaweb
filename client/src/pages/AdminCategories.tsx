import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryUI, DifficultyLevel, insertCategorySchema } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, PenSquare, Trash2, ImagePlus, X, Check, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

// مخطط إنشاء تصنيف جديد
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: 'يجب أن يكون الاسم أطول من حرفين' }),
  nameAr: z.string().min(2, { message: 'يجب أن يكون الاسم العربي أطول من حرفين' }),
  icon: z.string().min(1, { message: 'الرجاء اختيار أيقونة' }),
  color: z.string().min(1, { message: 'الرجاء اختيار لون' }),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  difficultyLevel: z.string().default(DifficultyLevel.MEDIUM),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

export default function AdminCategories() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryUI | null>(null);
  const [filter, setFilter] = useState('');

  // استعلام التصنيفات
  const { data: categories, isLoading, error } = useQuery<CategoryUI[]>({
    queryKey: ['/api/categories'],
    staleTime: 1000 * 60 * 5,
  });

  // إظهار نموذج إنشاء تصنيف جديد
  const createForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      icon: 'BookOpen',
      color: 'blue-500',
      description: '',
      descriptionAr: '',
      difficultyLevel: DifficultyLevel.MEDIUM,
      isActive: true,
      imageUrl: '',
    },
  });

  // إظهار نموذج تعديل تصنيف
  const editForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      icon: '',
      color: '',
      description: '',
      descriptionAr: '',
      difficultyLevel: DifficultyLevel.MEDIUM,
      isActive: true,
      imageUrl: '',
    },
  });

  // التصنيفات المصفاة
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(filter.toLowerCase()) || 
    category.nameAr.includes(filter) ||
    (category.description?.toLowerCase().includes(filter.toLowerCase()) || false) ||
    (category.descriptionAr?.includes(filter) || false)
  );

  // مصفوفة الأيقونات المتاحة
  const availableIcons = [
    { value: 'BookOpen', label: 'كتاب مفتوح' },
    { value: 'Atom', label: 'ذرة' },
    { value: 'Globe', label: 'كرة أرضية' },
    { value: 'BookText', label: 'كتاب نصي' },
    { value: 'Trophy', label: 'كأس' },
    { value: 'Palette', label: 'لوحة ألوان' },
    { value: 'Cpu', label: 'معالج' },
    { value: 'Film', label: 'فيلم' },
    { value: 'Music', label: 'موسيقى' },
    { value: 'Utensils', label: 'أدوات طعام' },
    { value: 'Calculator', label: 'آلة حاسبة' },
  ];

  // مصفوفة الألوان المتاحة
  const availableColors = [
    { value: 'amber-600', label: 'كهرماني' },
    { value: 'blue-500', label: 'أزرق' },
    { value: 'green-500', label: 'أخضر' },
    { value: 'purple-600', label: 'أرجواني' },
    { value: 'red-500', label: 'أحمر' },
    { value: 'pink-500', label: 'وردي' },
    { value: 'gray-700', label: 'رمادي' },
    { value: 'yellow-600', label: 'أصفر' },
    { value: 'indigo-500', label: 'نيلي' },
    { value: 'green-600', label: 'أخضر داكن' },
    { value: 'blue-600', label: 'أزرق داكن' },
    { value: 'teal-600', label: 'أزرق مخضر' },
  ];

  // mutation لإنشاء تصنيف جديد
  const createCategoryMutation = useMutation({
    mutationFn: async (newCategory: z.infer<typeof categoryFormSchema>) => {
      const res = await apiRequest('POST', '/api/categories', newCategory);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في إنشاء التصنيف');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'تم إنشاء التصنيف بنجاح',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل في إنشاء التصنيف',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // mutation لتحديث تصنيف
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof categoryFormSchema> }) => {
      const res = await apiRequest('PUT', `/api/categories/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في تحديث التصنيف');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'تم تحديث التصنيف بنجاح',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل في تحديث التصنيف',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // mutation لحذف تصنيف
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/categories/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في حذف التصنيف');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'تم حذف التصنيف بنجاح',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل في حذف التصنيف',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // إعداد نموذج التعديل بقيم التصنيف المحدد
  const handleEditCategory = (category: CategoryUI) => {
    setSelectedCategory(category);
    editForm.reset({
      name: category.name,
      nameAr: category.nameAr,
      icon: category.icon,
      color: category.color,
      description: category.description || '',
      descriptionAr: category.descriptionAr || '',
      difficultyLevel: category.difficultyLevel,
      isActive: category.isActive,
      imageUrl: category.imageUrl || '',
    });
    setIsEditDialogOpen(true);
  };

  // إعداد حوار الحذف
  const handleDeleteCategory = (category: CategoryUI) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // تقديم نموذج إنشاء تصنيف جديد
  const onCreateSubmit = (data: z.infer<typeof categoryFormSchema>) => {
    createCategoryMutation.mutate(data);
  };

  // تقديم نموذج تعديل تصنيف
  const onEditSubmit = (data: z.infer<typeof categoryFormSchema>) => {
    if (selectedCategory) {
      updateCategoryMutation.mutate({ id: selectedCategory.id, data });
    }
  };

  // تأكيد حذف تصنيف
  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  // مكون عرض بطاقة التصنيف
  const CategoryCard = ({ category }: { category: CategoryUI }) => (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{category.nameAr}</span>
          <div className={`h-3 w-3 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </CardTitle>
        <CardDescription>{category.name}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
          {category.descriptionAr || 'لا يوجد وصف'}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
          <PenSquare className="h-4 w-4 mr-1" /> تعديل
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category)}>
          <Trash2 className="h-4 w-4 mr-1" /> حذف
        </Button>
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">حدث خطأ أثناء جلب البيانات</div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/categories'] })}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">إدارة التصنيفات</h1>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة تصنيف جديد
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="بحث عن تصنيف..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories?.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {!filteredCategories?.length && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">لا توجد تصنيفات مطابقة</div>
          {filter && (
            <Button variant="outline" onClick={() => setFilter('')}>
              مسح البحث
            </Button>
          )}
        </div>
      )}

      {/* حوار إنشاء تصنيف جديد */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل التصنيف الجديد الذي ترغب في إضافته
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={createForm.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالعربية</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم بالعربية" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالإنجليزية</FormLabel>
                      <FormControl>
                        <Input dir="ltr" placeholder="English Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف بالعربية</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="وصف قصير للتصنيف بالعربية" 
                          className="resize-none h-20" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف بالإنجليزية</FormLabel>
                      <FormControl>
                        <Textarea 
                          dir="ltr" 
                          placeholder="Description in English" 
                          className="resize-none h-20" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الأيقونة</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الأيقونة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableIcons.map(icon => (
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
                  control={createForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللون</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر اللون" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableColors.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة (اختياري)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        أدخل رابط لصورة التصنيف (سيتم استخدامه بدلًا من الأيقونة)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">تفعيل التصنيف</FormLabel>
                        <FormDescription>
                          التصنيفات المفعلة فقط ستظهر للمستخدمين
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
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending && (
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  إنشاء التصنيف
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* حوار تعديل تصنيف */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل التصنيف</DialogTitle>
            <DialogDescription>
              قم بتعديل تفاصيل التصنيف
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={editForm.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالعربية</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم بالعربية" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالإنجليزية</FormLabel>
                      <FormControl>
                        <Input dir="ltr" placeholder="English Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف بالعربية</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="وصف قصير للتصنيف بالعربية" 
                          className="resize-none h-20" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف بالإنجليزية</FormLabel>
                      <FormControl>
                        <Textarea 
                          dir="ltr" 
                          placeholder="Description in English" 
                          className="resize-none h-20" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الأيقونة</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الأيقونة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableIcons.map(icon => (
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
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللون</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر اللون" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableColors.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة (اختياري)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        أدخل رابط لصورة التصنيف (سيتم استخدامه بدلًا من الأيقونة)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">تفعيل التصنيف</FormLabel>
                        <FormDescription>
                          التصنيفات المفعلة فقط ستظهر للمستخدمين
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
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateCategoryMutation.isPending}
                >
                  {updateCategoryMutation.isPending && (
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  )}
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* حوار تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف التصنيف</DialogTitle>
            <DialogDescription>
              {selectedCategory && (
                <span>
                  هل أنت متأكد من حذف تصنيف "{selectedCategory.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending && (
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}