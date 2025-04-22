import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  LifeBuoy, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  Zap,
  Clock,
  Users,
  Percent,
  Vote,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

// نموذج وسيلة المساعدة
const helpOptionSchema = z.object({
  name: z.string().min(2, { message: 'يجب أن يكون الاسم على الأقل حرفين' }),
  nameAr: z.string().min(2, { message: 'يجب أن يكون الاسم العربي على الأقل حرفين' }),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  icon: z.string().min(1, { message: 'الرجاء اختيار أيقونة' }),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().min(1, { message: 'يجب أن يكون الحد الأدنى 1' }),
  effect: z.string().min(1, { message: 'الرجاء اختيار التأثير' }),
});

// قائمة بالتأثيرات المتاحة لوسائل المساعدة
const effects = [
  { value: "remove_two_options", label: "حذف إجابتين خاطئتين", icon: <Vote className="h-4 w-4 ml-2" /> },
  { value: "extend_time", label: "تمديد الوقت", icon: <Clock className="h-4 w-4 ml-2" /> },
  { value: "ask_audience", label: "سؤال الجمهور", icon: <Users className="h-4 w-4 ml-2" /> },
  { value: "hint", label: "عرض تلميح", icon: <Lightbulb className="h-4 w-4 ml-2" /> },
  { value: "skip_question", label: "تخطي السؤال", icon: <Zap className="h-4 w-4 ml-2" /> },
  { value: "probability_boost", label: "زيادة احتمالية الإجابة الصحيحة", icon: <Percent className="h-4 w-4 ml-2" /> },
];

// قائمة بالأيقونات المتاحة
const icons = [
  { value: "lifebuoy", label: "عوامة نجاة", icon: <LifeBuoy className="h-4 w-4 ml-2" /> },
  { value: "lightbulb", label: "مصباح", icon: <Lightbulb className="h-4 w-4 ml-2" /> },
  { value: "clock", label: "ساعة", icon: <Clock className="h-4 w-4 ml-2" /> },
  { value: "users", label: "مستخدمين", icon: <Users className="h-4 w-4 ml-2" /> },
  { value: "zap", label: "برق", icon: <Zap className="h-4 w-4 ml-2" /> },
  { value: "help-circle", label: "دائرة مساعدة", icon: <HelpCircle className="h-4 w-4 ml-2" /> },
];

export default function AdminHelp() {
  const { toast } = useToast();
  const [isAddHelpOpen, setIsAddHelpOpen] = useState(false);
  const [editingHelp, setEditingHelp] = useState<any | null>(null);

  // جلب وسائل المساعدة
  const { data: helpOptions = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/help-options'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/help-options');
        return await response.json();
      } catch (error) {
        // إرجاع مصفوفة فارغة في حالة عدم وجود البيانات (لأغراض التطوير فقط)
        console.error('Error fetching help options', error);
        return [];
      }
    }
  });

  // إعداد نموذج
  const form = useForm<z.infer<typeof helpOptionSchema>>({
    resolver: zodResolver(helpOptionSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      icon: '',
      isActive: true,
      usageLimit: 1,
      effect: '',
    }
  });

  // تحديث النموذج عند تعديل وسيلة مساعدة موجودة
  React.useEffect(() => {
    if (editingHelp) {
      form.reset({
        name: editingHelp.name,
        nameAr: editingHelp.nameAr,
        description: editingHelp.description || '',
        descriptionAr: editingHelp.descriptionAr || '',
        icon: editingHelp.icon,
        isActive: editingHelp.isActive,
        usageLimit: editingHelp.usageLimit,
        effect: editingHelp.effect,
      });
    } else {
      form.reset({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        icon: '',
        isActive: true,
        usageLimit: 1,
        effect: '',
      });
    }
  }, [editingHelp, form]);

  // تقديم النموذج
  const onSubmit = (values: z.infer<typeof helpOptionSchema>) => {
    toast({
      title: 'تنبيه',
      description: 'هذه الميزة قيد التطوير',
    });
    setIsAddHelpOpen(false);
  };

  // الحصول على أيقونة التأثير
  const getEffectIcon = (effect: string) => {
    const effectObj = effects.find(e => e.value === effect);
    return effectObj ? effectObj.icon : <HelpCircle className="h-4 w-4" />;
  };

  // الحصول على اسم التأثير
  const getEffectName = (effect: string) => {
    const effectObj = effects.find(e => e.value === effect);
    return effectObj ? effectObj.label : effect;
  };

  // في حالة وجود خطأ
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل وسائل المساعدة. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  // إعداد بيانات عرض مؤقتة (يمكن إزالتها عندما تكون الواجهة الخلفية جاهزة)
  const sampleHelpOptions = [
    {
      id: 1,
      name: "50/50",
      nameAr: "50/50",
      description: "Removes two wrong answers",
      descriptionAr: "يزيل إجابتين خاطئتين",
      icon: "vote",
      isActive: true,
      usageLimit: 1,
      effect: "remove_two_options",
    },
    {
      id: 2,
      name: "Extra Time",
      nameAr: "وقت إضافي",
      description: "Gives extra 30 seconds",
      descriptionAr: "يمنح 30 ثانية إضافية",
      icon: "clock",
      isActive: true,
      usageLimit: 1,
      effect: "extend_time",
    },
    {
      id: 3,
      name: "Ask the Audience",
      nameAr: "سؤال الجمهور",
      description: "Show audience votes",
      descriptionAr: "عرض تصويت الجمهور",
      icon: "users",
      isActive: true,
      usageLimit: 1,
      effect: "ask_audience",
    },
    {
      id: 4,
      name: "Hint",
      nameAr: "تلميح",
      description: "Get a hint for the question",
      descriptionAr: "الحصول على تلميح للسؤال",
      icon: "lightbulb",
      isActive: false,
      usageLimit: 2,
      effect: "hint",
    },
  ];

  // استخدام البيانات من الخادم أو البيانات المؤقتة
  const displayHelpOptions = helpOptions.length > 0 ? helpOptions : sampleHelpOptions;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsAddHelpOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة وسيلة مساعدة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LifeBuoy className="ml-2 h-5 w-5" />
            <span>وسائل المساعدة</span>
          </CardTitle>
          <CardDescription>
            إدارة وسائل المساعدة المتاحة للفرق أثناء اللعبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : displayHelpOptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لم يتم العثور على وسائل مساعدة
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="w-[100px]">التأثير</TableHead>
                    <TableHead className="w-[80px]">حد الاستخدام</TableHead>
                    <TableHead className="w-[80px]">الحالة</TableHead>
                    <TableHead className="text-left w-[100px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayHelpOptions.map((help: any) => (
                    <TableRow key={help.id}>
                      <TableCell className="font-medium">{help.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{help.nameAr}</span>
                          <span className="text-sm text-muted-foreground">{help.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{help.descriptionAr}</span>
                          <span className="text-sm text-muted-foreground">{help.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getEffectIcon(help.effect)}
                          <span className="mr-1 text-xs">
                            {getEffectName(help.effect)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{help.usageLimit}</TableCell>
                      <TableCell>
                        {help.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 ml-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <XCircle className="h-3 w-3 ml-1" />
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingHelp(help);
                              setIsAddHelpOpen(true);
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
      </Card>

      {/* نافذة إضافة/تعديل وسيلة مساعدة */}
      <Dialog open={isAddHelpOpen} onOpenChange={setIsAddHelpOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingHelp ? 'تعديل وسيلة مساعدة' : 'إضافة وسيلة مساعدة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingHelp ? 'قم بتعديل بيانات وسيلة المساعدة' : 'أدخل بيانات وسيلة المساعدة الجديدة'}
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
                      <FormLabel>الاسم (عربي)</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم وسيلة المساعدة بالعربية" {...field} />
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
                      <FormLabel>الاسم (إنجليزي)</FormLabel>
                      <FormControl>
                        <Input dir="ltr" placeholder="Enter help option name" {...field} />
                      </FormControl>
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
                        <Textarea placeholder="أدخل وصف وسيلة المساعدة بالعربية" {...field} />
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
                        <Textarea dir="ltr" placeholder="Enter help option description" {...field} />
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
                              <div className="flex items-center">
                                {icon.icon}
                                <span>{icon.label}</span>
                              </div>
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
                  name="effect"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التأثير</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر التأثير" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {effects.map((effect) => (
                            <SelectItem key={effect.value} value={effect.value}>
                              <div className="flex items-center">
                                {effect.icon}
                                <span>{effect.label}</span>
                              </div>
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
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حد الاستخدام</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="عدد مرات الاستخدام المسموح" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        عدد مرات استخدام وسيلة المساعدة في اللعبة الواحدة
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        هل وسيلة المساعدة نشطة ومتاحة للاستخدام؟
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingHelp(null);
                    setIsAddHelpOpen(false);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingHelp ? 'حفظ التغييرات' : 'إضافة وسيلة المساعدة'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}