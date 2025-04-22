import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, 
  Check, 
  Save, 
  Undo2,
  Sun,
  Moon,
  Monitor,
  CircleUser,
  Smartphone,
  MousePointer2,
  PanelRight,
  Layers,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// نموذج إعدادات السمة
const themeSchema = z.object({
  primary: z.string().min(4, { message: 'يرجى اختيار لون' }),
  variant: z.enum(['professional', 'tint', 'vibrant']),
  appearance: z.enum(['light', 'dark', 'system']),
  radius: z.number().min(0).max(1),
});

// ألوان أساسية للاختيار من بينها
const primaryColors = [
  { name: 'أزرق فاتح', value: '#0ea5e9', class: 'bg-sky-500' },
  { name: 'أزرق', value: '#2563eb', class: 'bg-blue-600' },
  { name: 'أرجواني', value: '#8b5cf6', class: 'bg-violet-500' },
  { name: 'وردي', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'أحمر', value: '#ef4444', class: 'bg-red-500' },
  { name: 'برتقالي', value: '#f97316', class: 'bg-orange-500' },
  { name: 'أصفر', value: '#eab308', class: 'bg-yellow-500' },
  { name: 'أخضر', value: '#22c55e', class: 'bg-green-500' },
  { name: 'تركواز', value: '#06b6d4', class: 'bg-cyan-500' },
  { name: 'رمادي', value: '#64748b', class: 'bg-slate-500' },
];

export default function AdminDesign() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('theme');
  const [previewPrimary, setPreviewPrimary] = useState<string>('#2563eb');

  // إعداد نموذج
  const form = useForm<z.infer<typeof themeSchema>>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      primary: '#2563eb',
      variant: 'tint',
      appearance: 'system',
      radius: 0.5,
    }
  });

  // تحديث النموذج (يمكن جلب القيم الفعلية من الخادم)
  React.useEffect(() => {
    // هنا يمكن جلب إعدادات التصميم الحالية من الخادم
    // حاليًا نستخدم قيمًا افتراضية
    form.reset({
      primary: '#2563eb',
      variant: 'tint',
      appearance: 'system',
      radius: 0.5,
    });
  }, [form]);

  // تقديم النموذج
  const onSubmit = (values: z.infer<typeof themeSchema>) => {
    toast({
      title: 'تم حفظ التصميم',
      description: 'تم حفظ إعدادات التصميم بنجاح',
      variant: 'default',
    });
    console.log('Theme settings:', values);
  };

  // معاينة اللون الأساسي
  const handleColorClick = (color: string) => {
    setPreviewPrimary(color);
    form.setValue('primary', color);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="theme" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="theme">السمة الأساسية</TabsTrigger>
          <TabsTrigger value="typography">الخطوط</TabsTrigger>
          <TabsTrigger value="layout">التخطيط</TabsTrigger>
          <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="ml-2 h-5 w-5" />
                    <span>إعدادات السمة</span>
                  </CardTitle>
                  <CardDescription>
                    تخصيص مظهر التطبيق وفقًا لتفضيلاتك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">اللون الأساسي</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {primaryColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center border-2 ${
                            previewPrimary === color.value ? 'border-black dark:border-white' : 'border-transparent'
                          }`}
                          onClick={() => handleColorClick(color.value)}
                          title={color.name}
                        >
                          {previewPrimary === color.value && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                    <FormField
                      control={form.control}
                      name="primary"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="#hex"
                                {...field}
                                className="w-24 text-center dir-ltr"
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  setPreviewPrimary(e.target.value);
                                }}
                              />
                            </FormControl>
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: field.value }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="variant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نمط الألوان</FormLabel>
                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div 
                            className={`flex flex-col items-center gap-2 border rounded-lg p-4 cursor-pointer ${
                              field.value === 'professional' ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => field.onChange('professional')}
                          >
                            <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center">
                              {field.value === 'professional' && <Check className="text-white h-4 w-4" />}
                            </div>
                            <div className="text-center">
                              <p className="font-medium">مهني</p>
                              <p className="text-xs text-muted-foreground">ألوان أكثر حيادية</p>
                            </div>
                          </div>
                          <div 
                            className={`flex flex-col items-center gap-2 border rounded-lg p-4 cursor-pointer ${
                              field.value === 'tint' ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => field.onChange('tint')}
                          >
                            <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center">
                              {field.value === 'tint' && <Check className="text-white h-4 w-4" />}
                            </div>
                            <div className="text-center">
                              <p className="font-medium">صبغة</p>
                              <p className="text-xs text-muted-foreground">ألوان متوازنة</p>
                            </div>
                          </div>
                          <div 
                            className={`flex flex-col items-center gap-2 border rounded-lg p-4 cursor-pointer ${
                              field.value === 'vibrant' ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => field.onChange('vibrant')}
                          >
                            <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center">
                              {field.value === 'vibrant' && <Check className="text-white h-4 w-4" />}
                            </div>
                            <div className="text-center">
                              <p className="font-medium">نابض</p>
                              <p className="text-xs text-muted-foreground">ألوان أكثر حيوية</p>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appearance"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>المظهر</FormLabel>
                        <FormDescription>
                          اختر المظهر الافتراضي للتطبيق
                        </FormDescription>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-4 pt-2"
                          >
                            <FormItem className="flex flex-col items-center space-y-2 space-x-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="light"
                                  id="appearance-light"
                                  className="sr-only"
                                />
                              </FormControl>
                              <label
                                htmlFor="appearance-light"
                                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                                  field.value === 'light' ? 'border-primary' : ''
                                }`}
                              >
                                <Sun className="mb-2 h-6 w-6" />
                                <span className="text-center font-medium">فاتح</span>
                              </label>
                            </FormItem>
                            <FormItem className="flex flex-col items-center space-y-2 space-x-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="dark"
                                  id="appearance-dark"
                                  className="sr-only"
                                />
                              </FormControl>
                              <label
                                htmlFor="appearance-dark"
                                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                                  field.value === 'dark' ? 'border-primary' : ''
                                }`}
                              >
                                <Moon className="mb-2 h-6 w-6" />
                                <span className="text-center font-medium">داكن</span>
                              </label>
                            </FormItem>
                            <FormItem className="flex flex-col items-center space-y-2 space-x-0">
                              <FormControl>
                                <RadioGroupItem
                                  value="system"
                                  id="appearance-system"
                                  className="sr-only"
                                />
                              </FormControl>
                              <label
                                htmlFor="appearance-system"
                                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                                  field.value === 'system' ? 'border-primary' : ''
                                }`}
                              >
                                <Monitor className="mb-2 h-6 w-6" />
                                <span className="text-center font-medium">النظام</span>
                              </label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="radius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شكل الزوايا</FormLabel>
                        <FormDescription>
                          اضبط حدة زوايا العناصر في التطبيق
                        </FormDescription>
                        <div className="grid grid-cols-3 gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            className={`rounded-none h-12 ${field.value === 0 ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => field.onChange(0)}
                          >
                            حادة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={`rounded-md h-12 ${field.value === 0.5 ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => field.onChange(0.5)}
                          >
                            متوسطة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={`rounded-full h-12 ${field.value === 1 ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => field.onChange(1)}
                          >
                            دائرية
                          </Button>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="mt-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" type="button">
                    <Undo2 className="ml-2 h-4 w-4" />
                    استعادة الإعدادات الافتراضية
                  </Button>
                  <Button type="submit">
                    <Save className="ml-2 h-4 w-4" />
                    حفظ التغييرات
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="ml-2 h-5 w-5" />
                <span>إعدادات الخطوط</span>
              </CardTitle>
              <CardDescription>
                تخصيص خطوط النصوص في التطبيق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-lg font-medium">الخط الأساسي</label>
                <Select defaultValue="tajawal">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الخط الأساسي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tajawal">الطجوال</SelectItem>
                    <SelectItem value="cairo">القاهرة</SelectItem>
                    <SelectItem value="almarai">المراعي</SelectItem>
                    <SelectItem value="readex">ريدكس برو</SelectItem>
                    <SelectItem value="ibm">IBM بلكس سانس عربي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium">حجم الخط</label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حجم الخط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">صغير</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="large">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 border rounded-md bg-muted">
                <h3 className="font-bold text-lg mb-1">عنوان تجريبي</h3>
                <p className="text-sm text-muted-foreground mb-3">هذا عنوان فرعي تجريبي</p>
                <p className="mb-2">هذا مثال على النص الأساسي في التطبيق. يمكنك من خلاله معاينة شكل الخط المختار وحجمه.</p>
                <p>يتميز التطبيق بواجهة سهلة الاستخدام تتيح للمستخدمين التنقل بين الأقسام المختلفة بسهولة.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" type="button">
                <Undo2 className="ml-2 h-4 w-4" />
                استعادة الإعدادات الافتراضية
              </Button>
              <Button type="button" onClick={() => {
                toast({
                  title: 'تنبيه',
                  description: 'هذه الميزة قيد التطوير',
                });
              }}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="ml-2 h-5 w-5" />
                <span>إعدادات التخطيط</span>
              </CardTitle>
              <CardDescription>
                تخصيص تخطيط وعرض العناصر في التطبيق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-lg font-medium">نمط القائمة</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 flex items-center space-x-4 space-x-reverse cursor-pointer hover:bg-muted">
                    <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center text-white">
                      <PanelRight className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">قائمة جانبية</p>
                      <p className="text-sm text-muted-foreground">عرض القائمة على الجانب</p>
                    </div>
                  </div>
                  <div className="border rounded-md p-4 flex items-center space-x-4 space-x-reverse cursor-pointer hover:bg-muted">
                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                      <CircleUser className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">قائمة علوية</p>
                      <p className="text-sm text-muted-foreground">عرض القائمة في الأعلى</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium">كثافة العناصر</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted py-6">
                    <p className="font-medium">متباعدة</p>
                    <p className="text-sm text-muted-foreground">مساحات أكبر</p>
                  </div>
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted py-4 bg-muted">
                    <p className="font-medium">متوسطة</p>
                    <p className="text-sm text-muted-foreground">توازن مثالي</p>
                  </div>
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted py-2">
                    <p className="font-medium">متقاربة</p>
                    <p className="text-sm text-muted-foreground">عناصر أكثر</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium">تخطيط متجاوب</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 flex items-center space-x-4 space-x-reverse cursor-pointer hover:bg-muted">
                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">موبايل أولاً</p>
                      <p className="text-sm text-muted-foreground">تحسين للشاشات الصغيرة</p>
                    </div>
                  </div>
                  <div className="border rounded-md p-4 flex items-center space-x-4 space-x-reverse cursor-pointer hover:bg-muted bg-muted">
                    <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center text-white">
                      <MousePointer2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">ديسكتوب أولاً</p>
                      <p className="text-sm text-muted-foreground">تحسين للشاشات الكبيرة</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" type="button">
                <Undo2 className="ml-2 h-4 w-4" />
                استعادة الإعدادات الافتراضية
              </Button>
              <Button type="button" onClick={() => {
                toast({
                  title: 'تنبيه',
                  description: 'هذه الميزة قيد التطوير',
                });
              }}>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="ml-2 h-5 w-5" />
                <span>إعدادات متقدمة</span>
              </CardTitle>
              <CardDescription>
                إعدادات متقدمة للتحكم في سلوك ومظهر التطبيق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 border rounded-md flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium mb-2">هذه الإعدادات قيد التطوير</h3>
                <p className="text-center text-muted-foreground mb-4">
                  سيتم إضافة إعدادات متقدمة إضافية في تحديثات قادمة للتطبيق.
                </p>
                <Button variant="outline" onClick={() => {
                  toast({
                    title: 'تنبيه',
                    description: 'هذه الميزة قيد التطوير',
                  });
                }}>
                  التحقق من التحديثات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}