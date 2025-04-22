import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DifficultyLevel, MediaType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

// مخطط نموذج السؤال
const questionFormSchema = z.object({
  text: z.string().min(3, { message: 'يجب أن يكون نص السؤال 3 أحرف على الأقل' }),
  answer: z.string().min(1, { message: 'الإجابة مطلوبة' }),
  difficulty: z.string().refine(val => ['easy', 'medium', 'hard'].includes(val), {
    message: 'يرجى اختيار مستوى صعوبة صحيح'
  }),
  categoryId: z.string().min(1, { message: 'يرجى اختيار الفئة' }),
  isActive: z.boolean().default(true),
  mediaType: z.string().optional(),
  mediaUrl: z.string().optional().nullable(),
  points: z.number().int().min(1, { message: 'يجب أن تكون النقاط 1 على الأقل' }).default(1),
});

// نوع قيم نموذج السؤال
export type QuestionFormValues = z.infer<typeof questionFormSchema>;

// خصائص مكون نموذج السؤال
interface QuestionFormProps {
  defaultValues?: Partial<QuestionFormValues>;
  onSubmit: (values: QuestionFormValues) => void;
  isSubmitting: boolean;
}

export default function QuestionForm({ defaultValues, onSubmit, isSubmitting }: QuestionFormProps) {
  // استدعاء API للحصول على قائمة الفئات
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/categories');
      return response.json();
    }
  });

  // إعداد نموذج React Hook Form مع التحقق من صحة Zod
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: '',
      answer: '',
      difficulty: 'easy',
      categoryId: '',
      isActive: true,
      mediaType: '',
      mediaUrl: '',
      points: 1,
      ...defaultValues,
    }
  });

  // استخراج قيمة نوع الوسائط الحالية
  const mediaType = form.watch('mediaType');

  // معالجة تقديم النموذج
  const handleSubmit = (values: QuestionFormValues) => {
    onSubmit(values);
  };

  // الحصول على ترجمة مستوى الصعوبة
  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return difficulty;
    }
  };

  // الحصول على ترجمة نوع الوسائط
  const getMediaTypeLabel = (type: string): string => {
    switch (type) {
      case MediaType.IMAGE: return 'صورة';
      case MediaType.AUDIO: return 'ملف صوتي';
      case MediaType.VIDEO: return 'فيديو';
      default: return 'بدون وسائط';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* نص السؤال */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص السؤال *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل نص السؤال هنا"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الإجابة */}
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الإجابة *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل الإجابة الصحيحة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الفئة */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة *</FormLabel>
                  <Select
                    disabled={isLoadingCategories}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          {category.nameAr || category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    اختر الفئة التي ينتمي إليها هذا السؤال
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* مستوى الصعوبة */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مستوى الصعوبة *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مستوى الصعوبة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DifficultyLevel).map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {getDifficultyLabel(difficulty)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    حدد مستوى صعوبة السؤال
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            {/* نوع الوسائط */}
            <FormField
              control={form.control}
              name="mediaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الوسائط</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الوسائط" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">بدون وسائط</SelectItem>
                      <SelectItem value={MediaType.IMAGE}>صورة</SelectItem>
                      <SelectItem value={MediaType.AUDIO}>ملف صوتي</SelectItem>
                      <SelectItem value={MediaType.VIDEO}>فيديو</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    اختر نوع الوسائط المرفقة بالسؤال (اختياري)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* رابط الوسائط */}
            {mediaType && mediaType !== '' && (
              <FormField
                control={form.control}
                name="mediaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الوسائط</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={`أدخل رابط ${getMediaTypeLabel(mediaType)}`} 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      أدخل رابط مباشر للوسائط المرفقة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* النقاط */}
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>النقاط</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      placeholder="عدد النقاط" 
                      {...field}
                      onChange={event => field.onChange(
                        event.target.value === '' ? 0 : parseInt(event.target.value, 10)
                      )}
                    />
                  </FormControl>
                  <FormDescription>
                    عدد النقاط التي يحصل عليها اللاعب عند الإجابة الصحيحة
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* نشط/غير نشط */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>حالة السؤال</FormLabel>
                    <FormDescription>
                      هل السؤال نشط ويمكن استخدامه في الألعاب؟
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
        </div>

        {/* أزرار التحكم */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {defaultValues ? 'حفظ التغييرات' : 'إضافة السؤال'}
          </Button>
        </div>
      </form>
    </Form>
  );
}