import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// نموذج الإعدادات
const settingSchema = z.object({
  key: z.string().min(1, { message: 'المفتاح مطلوب' }),
  value: z.string().min(1, { message: 'القيمة مطلوبة' }),
  description: z.string().optional(),
  group: z.string().min(1, { message: 'المجموعة مطلوبة' }),
  dataType: z.string().min(1, { message: 'نوع البيانات مطلوب' }),
  isPublic: z.boolean().default(true)
});

export default function AdminSettings() {
  const { toast } = useToast();
  const [isAddSettingOpen, setIsAddSettingOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any | null>(null);
  const [selectedTab, setSelectedTab] = useState('game');

  // جلب الإعدادات
  const { data: settings = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/settings');
      return response.json();
    }
  });

  // إعداد نموذج
  const form = useForm<z.infer<typeof settingSchema>>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      key: '',
      value: '',
      description: '',
      group: 'game',
      dataType: 'string',
      isPublic: true
    }
  });

  // تحديث النموذج عند تعديل إعداد موجود
  React.useEffect(() => {
    if (editingSetting) {
      form.reset({
        key: editingSetting.key,
        value: editingSetting.value,
        description: editingSetting.description || '',
        group: editingSetting.group,
        dataType: editingSetting.dataType,
        isPublic: editingSetting.isPublic
      });
    } else {
      form.reset({
        key: '',
        value: '',
        description: '',
        group: 'game',
        dataType: 'string',
        isPublic: true
      });
    }
  }, [editingSetting, form]);

  // تقديم النموذج
  const onSubmit = (values: z.infer<typeof settingSchema>) => {
    toast({
      title: 'تنبيه',
      description: 'هذه الميزة قيد التطوير',
    });
    setIsAddSettingOpen(false);
  };

  // تصفية الإعدادات حسب المجموعة
  const filteredSettings = settings.filter((setting: any) => setting.group === selectedTab);

  // فحص نوع البيانات وإظهار القيمة بالشكل المناسب
  const renderValue = (setting: any) => {
    switch (setting.dataType) {
      case 'boolean':
        return setting.value === 'true' ? 'نعم' : 'لا';
      case 'number':
        return setting.value;
      case 'json':
        try {
          const jsonObj = JSON.parse(setting.value);
          return <code>{JSON.stringify(jsonObj, null, 2)}</code>;
        } catch {
          return setting.value;
        }
      default:
        return setting.value;
    }
  };

  // في حالة وجود خطأ
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل الإعدادات. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsAddSettingOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة إعداد جديد
        </Button>
      </div>

      <Tabs defaultValue="game" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="game">إعدادات اللعبة</TabsTrigger>
          <TabsTrigger value="theme">إعدادات المظهر</TabsTrigger>
          <TabsTrigger value="help_options">وسائل المساعدة</TabsTrigger>
          <TabsTrigger value="system">إعدادات النظام</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="ml-2 h-5 w-5" />
              <span>
                {selectedTab === 'game' && 'إعدادات اللعبة'}
                {selectedTab === 'theme' && 'إعدادات المظهر'}
                {selectedTab === 'help_options' && 'إعدادات وسائل المساعدة'}
                {selectedTab === 'system' && 'إعدادات النظام'}
              </span>
            </CardTitle>
            <CardDescription>
              {selectedTab === 'game' && 'تخصيص إعدادات اللعبة مثل وقت الإجابة وعدد الفئات'}
              {selectedTab === 'theme' && 'تخصيص مظهر التطبيق بما في ذلك الألوان والخطوط'}
              {selectedTab === 'help_options' && 'تكوين وسائل المساعدة المتاحة للفرق أثناء اللعب'}
              {selectedTab === 'system' && 'إعدادات متقدمة للنظام'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : filteredSettings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لم يتم العثور على إعدادات في هذه المجموعة
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المفتاح</TableHead>
                      <TableHead>القيمة</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>نوع البيانات</TableHead>
                      <TableHead>عام</TableHead>
                      <TableHead className="text-left w-[100px]">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSettings.map((setting: any) => (
                      <TableRow key={setting.id}>
                        <TableCell className="font-medium">{setting.key}</TableCell>
                        <TableCell>{renderValue(setting)}</TableCell>
                        <TableCell>{setting.description}</TableCell>
                        <TableCell>{setting.dataType}</TableCell>
                        <TableCell>{setting.isPublic ? 'نعم' : 'لا'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingSetting(setting);
                                setIsAddSettingOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => {
                                toast({
                                  title: 'تنبيه',
                                  description: 'هذه الميزة قيد التطوير',
                                });
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              يتم تطبيق الإعدادات فورًا بعد الحفظ
            </p>
            <Button
              variant="outline" 
              onClick={() => {
                toast({
                  title: 'تنبيه',
                  description: 'هذه الميزة قيد التطوير',
                });
              }}
            >
              <Save className="ml-2 h-4 w-4" />
              استعادة الإعدادات الافتراضية
            </Button>
          </CardFooter>
        </Card>
      </Tabs>

      {/* نافذة إضافة/تعديل إعداد */}
      <Dialog open={isAddSettingOpen} onOpenChange={setIsAddSettingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSetting ? 'تعديل إعداد' : 'إضافة إعداد جديد'}</DialogTitle>
            <DialogDescription>
              {editingSetting ? 'قم بتعديل بيانات الإعداد' : 'أدخل بيانات الإعداد الجديد'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المفتاح</FormLabel>
                      <FormControl>
                        <Input placeholder="مفتاح الإعداد" {...field} />
                      </FormControl>
                      <FormDescription>
                        مفتاح فريد للإعداد (مثال: default_answer_time)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>القيمة</FormLabel>
                      <FormControl>
                        <Input placeholder="قيمة الإعداد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea placeholder="وصف الإعداد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المجموعة</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المجموعة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="game">إعدادات اللعبة</SelectItem>
                          <SelectItem value="theme">إعدادات المظهر</SelectItem>
                          <SelectItem value="help_options">وسائل المساعدة</SelectItem>
                          <SelectItem value="system">إعدادات النظام</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع البيانات</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع البيانات" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="string">نص</SelectItem>
                          <SelectItem value="number">رقم</SelectItem>
                          <SelectItem value="boolean">منطقي (نعم/لا)</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          عام
                        </FormLabel>
                        <FormDescription>
                          هل هذا الإعداد متاح للعرض العام؟
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
                    setEditingSetting(null);
                    setIsAddSettingOpen(false);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingSetting ? 'حفظ التغييرات' : 'إضافة الإعداد'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}