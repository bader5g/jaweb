import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DbUser, UserLevel, UserRole } from '@shared/schema';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  MoreHorizontal,
  Shield,
  UserCog,
  Coins,
  Award,
  Clock,
  AlertCircle,
  Mail,
  BadgeInfo
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// تعريف نموذج لتعديل المستخدم
const userSchema = z.object({
  username: z.string().min(3, { message: 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'يرجى إدخال بريد إلكتروني صحيح' }),
  points: z.number().int().nonnegative({ message: 'يجب أن تكون النقاط عددًا موجبًا' }),
  level: z.string().min(1, { message: 'يرجى اختيار مستوى' }),
  role: z.string().min(1, { message: 'يرجى اختيار دور' }),
  isActive: z.boolean().default(true),
  password: z.string().min(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' }).optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const isRequiredForCreate = (schema: z.ZodTypeAny, message: string = "هذا الحقل مطلوب") => 
  z.union([schema, z.undefined()]).superRefine((data, ctx) => {
    if (data === undefined || data === null || data === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
      });
    }
    return z.NEVER;
  });

// تعريف نموذج لإنشاء مستخدم جديد
const createUserSchema = userSchema.extend({
  password: isRequiredForCreate(z.string().min(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' }), "كلمة المرور مطلوبة"),
  confirmPassword: isRequiredForCreate(z.string(), "تأكيد كلمة المرور مطلوب"),
});

export default function AdminUsers() {
  const { toast } = useToast();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isEditPointsOpen, setIsEditPointsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);

  // جلب المستخدمين
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response.json() as Promise<DbUser[]>;
    }
  });

  // إعداد نموذج تعديل/إضافة المستخدم
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(editingUser ? userSchema : createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      points: 0,
      level: UserLevel.BRONZE,
      role: UserRole.USER,
      isActive: true,
      password: '',
      confirmPassword: '',
    }
  });

  // تحديث النموذج عند تعديل مستخدم موجود
  React.useEffect(() => {
    if (editingUser) {
      form.reset({
        username: editingUser.username,
        email: editingUser.email,
        points: editingUser.points || 0,
        level: editingUser.level || UserLevel.BRONZE,
        role: editingUser.role || UserRole.USER,
        isActive: editingUser.isActive !== undefined ? editingUser.isActive : true,
        password: '',
        confirmPassword: '',
      });
    } else {
      form.reset({
        username: '',
        email: '',
        points: 0,
        level: UserLevel.BRONZE,
        role: UserRole.USER,
        isActive: true,
        password: '',
        confirmPassword: '',
      });
    }
  }, [editingUser, form]);

  // إضافة مستخدم جديد
  const addUserMutation = useMutation({
    mutationFn: async (values: z.infer<typeof userSchema>) => {
      const response = await apiRequest('POST', '/api/admin/users', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تمت الإضافة بنجاح',
        description: 'تم إضافة المستخدم الجديد بنجاح',
        variant: 'default',
      });
      setIsAddUserOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة المستخدم',
        variant: 'destructive',
      });
    }
  });

  // تعديل مستخدم موجود
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof userSchema> }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تم التعديل بنجاح',
        description: 'تم تحديث بيانات المستخدم بنجاح',
        variant: 'default',
      });
      setEditingUser(null);
      setIsAddUserOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء تعديل المستخدم',
        variant: 'destructive',
      });
    }
  });

  // حذف مستخدم
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف المستخدم بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء حذف المستخدم',
        variant: 'destructive',
      });
    }
  });

  // تغيير حالة المستخدم (نشط/غير نشط)
  const toggleUserActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تم تغيير الحالة بنجاح',
        description: 'تم تحديث حالة المستخدم بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء تغيير حالة المستخدم',
        variant: 'destructive',
      });
    }
  });

  // إضافة/خصم نقاط للمستخدم
  const updateUserPointsMutation = useMutation({
    mutationFn: async ({ id, points }: { id: number, points: number }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${id}/points`, { points });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تم تحديث النقاط بنجاح',
        description: 'تم تحديث نقاط المستخدم بنجاح',
        variant: 'default',
      });
      setSelectedUser(null);
      setIsEditPointsOpen(false);
      setPointsToAdd(0);
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء تحديث نقاط المستخدم',
        variant: 'destructive',
      });
    }
  });

  // تقديم نموذج إضافة/تعديل المستخدم
  const onSubmit = (values: z.infer<typeof userSchema>) => {
    if (editingUser) {
      // إذا كانت كلمة المرور فارغة، نحذفها من البيانات المرسلة
      const formValues = { ...values };
      if (!formValues.password) {
        delete formValues.password;
        delete formValues.confirmPassword;
      }
      updateUserMutation.mutate({ id: editingUser.id, values: formValues });
    } else {
      addUserMutation.mutate(values);
    }
  };

  // تطبيق الفلاتر على المستخدمين
  const filteredUsers = users.filter(user => {
    // فلتر البحث
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // فلتر الدور
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    // فلتر المستوى
    const matchesLevel = !levelFilter || user.level === levelFilter;
    
    // فلتر الحالة
    const matchesActive = activeFilter === null || user.isActive === activeFilter;
    
    // فلتر التبويب المحدد
    let matchesTab = true;
    if (selectedTab === 'admin') {
      matchesTab = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    } else if (selectedTab === 'regular') {
      matchesTab = user.role === UserRole.USER;
    } else if (selectedTab === 'inactive') {
      matchesTab = !user.isActive;
    }
    
    return matchesSearch && matchesRole && matchesLevel && matchesActive && matchesTab;
  });

  // الحصول على اسم مستوى المستخدم باللغة العربية
  const getLevelName = (level: string) => {
    switch (level) {
      case UserLevel.BRONZE: return 'برونزي';
      case UserLevel.SILVER: return 'فضي';
      case UserLevel.GOLD: return 'ذهبي';
      case UserLevel.PLATINUM: return 'بلاتيني';
      default: return level;
    }
  };

  // الحصول على اسم دور المستخدم باللغة العربية
  const getRoleName = (role: string) => {
    switch (role) {
      case UserRole.USER: return 'مستخدم';
      case UserRole.ADMIN: return 'مدير';
      case UserRole.SUPER_ADMIN: return 'مدير عام';
      default: return role;
    }
  };

  // الحصول على لون بادج مستوى المستخدم
  const getLevelBadge = (level: string) => {
    switch (level) {
      case UserLevel.BRONZE:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">برونزي</Badge>;
      case UserLevel.SILVER:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">فضي</Badge>;
      case UserLevel.GOLD:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">ذهبي</Badge>;
      case UserLevel.PLATINUM:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">بلاتيني</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  // الحصول على لون بادج دور المستخدم
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.USER:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">مستخدم</Badge>;
      case UserRole.ADMIN:
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">مدير</Badge>;
      case UserRole.SUPER_ADMIN:
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">مدير عام</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // إعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter(null);
    setLevelFilter(null);
    setActiveFilter(null);
  };

  // في حالة وجود خطأ
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل المستخدمين. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsAddUserOpen(true);
          }}
        >
          <UserPlus className="ml-2 h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
        
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="بحث عن مستخدم..."
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
              <DropdownMenuLabel>تصفية المستخدمين</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">الدور:</p>
                <Select 
                  value={roleFilter || ''}
                  onValueChange={(val) => setRoleFilter(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الأدوار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأدوار</SelectItem>
                    <SelectItem value={UserRole.USER}>مستخدم</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>مدير</SelectItem>
                    <SelectItem value={UserRole.SUPER_ADMIN}>مدير عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">المستوى:</p>
                <Select 
                  value={levelFilter || ''}
                  onValueChange={(val) => setLevelFilter(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المستويات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المستويات</SelectItem>
                    <SelectItem value={UserLevel.BRONZE}>برونزي</SelectItem>
                    <SelectItem value={UserLevel.SILVER}>فضي</SelectItem>
                    <SelectItem value={UserLevel.GOLD}>ذهبي</SelectItem>
                    <SelectItem value={UserLevel.PLATINUM}>بلاتيني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">الحالة:</p>
                <Select 
                  value={activeFilter === null ? '' : activeFilter ? 'active' : 'inactive'}
                  onValueChange={(val) => {
                    if (val === '') setActiveFilter(null);
                    else if (val === 'active') setActiveFilter(true);
                    else setActiveFilter(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
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
          <TabsTrigger value="all">جميع المستخدمين</TabsTrigger>
          <TabsTrigger value="admin">المديرون</TabsTrigger>
          <TabsTrigger value="regular">المستخدمون العاديون</TabsTrigger>
          <TabsTrigger value="inactive">غير النشطين</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="ml-2 h-5 w-5" />
                قائمة المستخدمين ({filteredUsers.length})
              </div>
              {filteredUsers.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredUsers.length} / {users.length} مستخدم
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {selectedTab === 'all' && 'عرض كافة المستخدمين المسجلين في النظام'}
              {selectedTab === 'admin' && 'عرض المديرين فقط'}
              {selectedTab === 'regular' && 'عرض المستخدمين العاديين فقط'}
              {selectedTab === 'inactive' && 'عرض المستخدمين غير النشطين فقط'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري تحميل المستخدمين...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لم يتم العثور على مستخدمين</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>المستخدم</TableHead>
                      <TableHead className="w-[100px]">المستوى</TableHead>
                      <TableHead className="w-[80px]">النقاط</TableHead>
                      <TableHead className="w-[80px]">الألعاب</TableHead>
                      <TableHead className="w-[80px]">الدور</TableHead>
                      <TableHead className="w-[80px]">الحالة</TableHead>
                      <TableHead className="w-[120px] text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Avatar>
                              <AvatarImage 
                                src={user.avatarUrl || ''} 
                                alt={user.username}
                              />
                              <AvatarFallback>
                                {user.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getLevelBadge(user.level)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Coins className="h-4 w-4 ml-1 text-yellow-600" />
                            {user.points}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{user.gamesPlayed || 0}</div>
                            <div className="text-xs text-muted-foreground">
                              {user.gamesWon || 0} فوز
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.isActive ? (
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>إجراءات المستخدم</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsAddUserOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditPointsOpen(true);
                                }}
                              >
                                <Coins className="h-4 w-4 ml-2" />
                                تعديل النقاط
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleUserActiveMutation.mutate({ 
                                  id: user.id, 
                                  isActive: !user.isActive 
                                })}
                              >
                                {user.isActive ? (
                                  <>
                                    <XCircle className="h-4 w-4 ml-2" />
                                    إيقاف
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                    تنشيط
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف المستخدم "${user.username}"؟`)) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* نافذة إضافة/تعديل مستخدم */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? `تعديل المستخدم: ${editingUser.username}` : 'إضافة مستخدم جديد'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'قم بتعديل بيانات المستخدم' : 'أدخل بيانات المستخدم الجديد'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المستخدم" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input 
                          dir="ltr" 
                          type="email" 
                          placeholder="email@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور {editingUser ? '(اختياري)' : ''}</FormLabel>
                      <FormControl>
                        <Input 
                          dir="ltr" 
                          type="password" 
                          placeholder={editingUser ? "اتركها فارغة للإبقاء على كلمة المرور الحالية" : "كلمة المرور"} 
                          {...field} 
                        />
                      </FormControl>
                      {editingUser && (
                        <FormDescription>
                          اتركها فارغة للإبقاء على كلمة المرور الحالية
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور {editingUser ? '(اختياري)' : ''}</FormLabel>
                      <FormControl>
                        <Input 
                          dir="ltr" 
                          type="password" 
                          placeholder="تأكيد كلمة المرور" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدور</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الدور" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.USER}>مستخدم</SelectItem>
                          <SelectItem value={UserRole.ADMIN}>مدير</SelectItem>
                          <SelectItem value={UserRole.SUPER_ADMIN}>مدير عام</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المستوى</FormLabel>
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
                          <SelectItem value={UserLevel.BRONZE}>برونزي</SelectItem>
                          <SelectItem value={UserLevel.SILVER}>فضي</SelectItem>
                          <SelectItem value={UserLevel.GOLD}>ذهبي</SelectItem>
                          <SelectItem value={UserLevel.PLATINUM}>بلاتيني</SelectItem>
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          value={field.value}
                        />
                      </FormControl>
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
                        حالة الحساب
                      </FormLabel>
                      <FormDescription>
                        هل حساب المستخدم نشط ويمكنه تسجيل الدخول؟
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
                    setEditingUser(null);
                    setIsAddUserOpen(false);
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل النقاط */}
      <Dialog open={isEditPointsOpen} onOpenChange={setIsEditPointsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل نقاط المستخدم</DialogTitle>
            <DialogDescription>
              أضف أو اخصم نقاط من حساب المستخدم {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar>
                    <AvatarImage 
                      src={selectedUser.avatarUrl || ''} 
                      alt={selectedUser.username}
                    />
                    <AvatarFallback>
                      {selectedUser.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedUser.username}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center font-medium text-lg">
                    <Coins className="h-5 w-5 ml-1 text-yellow-600" />
                    {selectedUser.points}
                  </div>
                  <div className="text-sm text-muted-foreground">النقاط الحالية</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  القيمة المراد إضافتها/خصمها
                </label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPointsToAdd(prev => prev - 10)}
                  >
                    -10
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPointsToAdd(prev => prev - 1)}
                  >
                    -1
                  </Button>
                  <Input
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPointsToAdd(prev => prev + 1)}
                  >
                    +1
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPointsToAdd(prev => prev + 10)}
                  >
                    +10
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  استخدم قيمة موجبة للإضافة وقيمة سالبة للخصم
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <span className="font-medium">النقاط الجديدة: </span>
                <span className="font-bold">{selectedUser.points + pointsToAdd}</span>
                {pointsToAdd > 0 && (
                  <span className="text-green-600"> (+{pointsToAdd})</span>
                )}
                {pointsToAdd < 0 && (
                  <span className="text-red-600"> ({pointsToAdd})</span>
                )}
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedUser(null);
                    setIsEditPointsOpen(false);
                    setPointsToAdd(0);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => {
                    if (selectedUser) {
                      updateUserPointsMutation.mutate({
                        id: selectedUser.id,
                        points: pointsToAdd
                      });
                    }
                  }}
                  disabled={pointsToAdd === 0}
                >
                  تأكيد
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}