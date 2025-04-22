import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CategoryUI } from '@shared/schema';
import { Switch } from '@/components/ui/switch';
import { Save, RefreshCw, ImagePlus, Music, Video, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MediaType } from '@shared/schema';

// نموذج بيانات السؤال
const questionFormSchema = z.object({
  text: z.string().min(5, { message: 'نص السؤال يجب أن يكون 5 أحرف على الأقل' }),
  answer: z.string().min(1, { message: 'الإجابة مطلوبة' }),
  difficulty: z.string().default('medium'),
  categoryId: z.string().min(1, { message: 'الرجاء اختيار فئة' }),
  isActive: z.boolean().default(true),
  mediaType: z.string().optional(),
  mediaUrl: z.string().optional(),
  points: z.number().int().positive().default(1),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  defaultValues?: Partial<QuestionFormValues>;
  onSubmit: (values: QuestionFormValues) => void;
  isSubmitting: boolean;
}

export default function QuestionForm({ defaultValues, onSubmit, isSubmitting }: QuestionFormProps) {
  // جلب الفئات
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/categories');
      return response.json() as Promise<CategoryUI[]>;
    }
  });

  // نموذج إضافة/تعديل سؤال
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: '',
      answer: '',
      difficulty: 'medium',
      categoryId: '',
      isActive: true,
      mediaType: '',
      mediaUrl: '',
      points: 1,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  // استمع للتغييرات في نوع الوسائط
  const mediaType = form.watch('mediaType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نص السؤال</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل نص السؤال هنا..."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
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
                        max={10}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      نقاط هذا السؤال (1-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر فئة السؤال" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.nameAr || category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="mediaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الوسائط</FormLabel>
                  <Select 
                    value={field.value || ""} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="بدون وسائط" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">بدون وسائط</SelectItem>
                      <SelectItem value={MediaType.IMAGE}>صورة</SelectItem>
                      <SelectItem value={MediaType.AUDIO}>صوت</SelectItem>
                      <SelectItem value={MediaType.VIDEO}>فيديو</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    اختر نوع الوسائط إذا كان السؤال يتضمن صورة أو صوت أو فيديو
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mediaType && (
              <FormField
                control={form.control}
                name="mediaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط {mediaType === MediaType.IMAGE ? 'الصورة' : mediaType === MediaType.AUDIO ? 'الصوت' : 'الفيديو'}</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder={`أدخل رابط ${mediaType === MediaType.IMAGE ? 'الصورة' : mediaType === MediaType.AUDIO ? 'الصوت' : 'الفيديو'}`} 
                          {...field} 
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            field.onChange("");
                            form.setValue("mediaType", "");
                          }}
                          size="icon"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {mediaType && form.watch('mediaUrl') && (
              <Card className="border-dashed border-2">
                <CardContent className="p-4 flex justify-center items-center min-h-[200px]">
                  {mediaType === MediaType.IMAGE ? (
                    form.watch('mediaUrl') ? (
                      <img 
                        src={form.watch('mediaUrl')} 
                        alt="معاينة الصورة" 
                        className="max-h-[200px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=خطأ+في+الصورة';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImagePlus className="h-12 w-12 mb-2" />
                        <p>معاينة الصورة</p>
                      </div>
                    )
                  ) : mediaType === MediaType.AUDIO ? (
                    form.watch('mediaUrl') ? (
                      <audio 
                        controls 
                        src={form.watch('mediaUrl')}
                        className="w-full"
                      >
                        متصفحك لا يدعم تشغيل الصوت
                      </audio>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Music className="h-12 w-12 mb-2" />
                        <p>معاينة الصوت</p>
                      </div>
                    )
                  ) : mediaType === MediaType.VIDEO ? (
                    form.watch('mediaUrl') ? (
                      <video 
                        controls 
                        src={form.watch('mediaUrl')}
                        className="max-h-[200px]"
                      >
                        متصفحك لا يدعم تشغيل الفيديو
                      </video>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Video className="h-12 w-12 mb-2" />
                        <p>معاينة الفيديو</p>
                      </div>
                    )
                  ) : null}
                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>الحالة</FormLabel>
                    <FormDescription>
                      تحديد ما إذا كان السؤال متاح للاستخدام
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                حفظ السؤال
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}