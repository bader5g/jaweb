import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DbUser, UserLevel, UserRole } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  User,
  Mail,
  Award,
  Key,
  Lock,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// نموذج المستخدم
const userFormSchema = z.object({
  username: z.string().min(3, { message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  points: z.number().default(0),
  level: z.string().default(UserLevel.BRONZE),
  role: z.string().default(UserRole.USER),
  isActive: z.boolean().default(true),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: 'كلمتي المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // جلب المستخدمين
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response.json() as Promise<DbUser[]>;
    }
  });

  // نموذج إضافة/تعديل مستخدم
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      points: 0,
      level: UserLevel.BRONZE,
      role: UserRole.USER,
      isActive: true,
      password: undefined,
      confirmPassword: undefined,
    },
  });

  // إعادة تعيين النموذج عند فتح مربع الحوار
  React.useEffect(() => {
    if (isUserDialogOpen) {
      if (editingUser) {
        form.reset({
          username: editingUser.username,
          email: editingUser.email,
          points: editingUser.points,
          level: editingUser.level,
          role: editingUser.role,
          isActive: editingUser.isActive,
          password: undefined, // لا نعرض كلمة المرور الحالية
          confirmPassword: undefined,
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
    }
  }, [isUserDialogOpen, editingUser, form]);

  // إضافة مستخدم جديد
  const createUserMutation = useMutation({
    mutationFn: async (values: z.infer<typeof userFormSchema>) => {
      const response = await apiRequest('POST', '/api/admin/users', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تمت الإضافة بنجاح',
        description: 'تم إضافة المستخدم بنجاح',
        variant: 'default',
      });
      setIsUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'حدث خطأ',
        description: error.message || 'حدث خطأ أثناء إضافة المستخدم',
        variant: 'destructive',
      });
    }
  });

  // تعديل مستخدم
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof userFormSchema> }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تم التعديل بنجاح',
        description: 'تم تعديل بيانات المستخدم بنجاح',
        variant: 'default',
      });
      setIsUserDialogOpen(false);
      setEditingUser(null);
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
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تم تحديث الحالة',
        description: 'تم تغيير حالة المستخدم بنجاح',
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

  // التعامل مع تقديم النموذج
  const onSubmit = (values: z.infer<typeof userFormSchema>) => {
    if (editingUser) {
      // تعديل مستخدم موجود
      updateUserMutation.mutate({ id: editingUser.id, values });
    } else {
      // إضافة مستخدم جديد
      createUserMutation.mutate(values);
    }
  };

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter(null);
    setLevelFilter(null);
  };

  // تصفية المستخدمين
  const filteredUsers = users.filter(user => {
    return (
      (searchTerm === '' || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === null || user.role === roleFilter) &&
      (levelFilter === null || user.level === levelFilter)
    );
  });

  // الحصول على بادج الدور
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">مدير</Badge>;
      case UserRole.SUPER_ADMIN:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">مدير عام</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">مستخدم</Badge>;
    }
  };

  // الحصول على بادج المستوى
  const getLevelBadge = (level: string) => {
    switch (level) {
      case UserLevel.BRONZE:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">برونزي</Badge>;
      case UserLevel.SILVER:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">فضي</Badge>;
      case UserLevel.GOLD:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">ذهبي</Badge>;
      case UserLevel.PLATINUM:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">بلاتيني</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  // في حالة وجود خطأ
  if (usersError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل بيانات المستخدمين. الرجاء المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingUser(null);
                setIsUserDialogOpen(true);
              }}
            >
              <UserPlus className="ml-2 h-4 w-4" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'قم بتعديل بيانات المستخدم ثم اضغط على حفظ' : 'أدخل بيانات المستخدم الجديد هنا'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="اسم المستخدم" className="pr-8" {...field} />
                        </div>
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
                        <div className="relative">
                          <Mail className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="example@domain.com" className="pr-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>النقاط</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value}
                          />
                        </FormControl>
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
                          value={field.value} 
                          onValueChange={field.onChange}
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
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدور</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>حالة الحساب</FormLabel>
                        <FormDescription>
                          هل الحساب نشط ويمكن استخدامه؟
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

                {(!editingUser || (editingUser && form.getValues('password'))) && (
                  <>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Key className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder={editingUser ? "اترك فارغًا للاحتفاظ بكلمة المرور الحالية" : "كلمة المرور"} 
                                className="pr-8" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute left-1 top-1"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="تأكيد كلمة المرور"
                                className="pr-8"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <DialogFooter>
                  <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                    {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                      <>
                        <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="بحث في المستخدمين..."
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
              <DropdownMenuLabel>فلترة المستخدمين</DropdownMenuLabel>
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
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetFilters}>
                إعادة تعيين الفلاتر
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoadingUsers ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <Card className="p-8 text-center">
              <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">لا يوجد مستخدمين</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                لم يتم العثور على أي مستخدمين تطابق معايير البحث.
              </p>
            </Card>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>المستوى</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.points}</TableCell>
                      <TableCell>{getLevelBadge(user.level)}</TableCell>
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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingUser(user);
                              setIsUserDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleUserStatusMutation.mutate({ 
                              id: user.id, 
                              isActive: !user.isActive 
                            })}
                          >
                            {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
                                <DialogDescription>
                                  هل أنت متأكد من رغبتك في حذف المستخدم "{user.username}"؟ هذا الإجراء لا يمكن التراجع عنه.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    // لا شيء - إغلاق مربع الحوار
                                  }}
                                >
                                  إلغاء
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  disabled={deleteUserMutation.isPending}
                                >
                                  {deleteUserMutation.isPending ? (
                                    <>
                                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                                      جاري الحذف...
                                    </>
                                  ) : (
                                    'حذف'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}