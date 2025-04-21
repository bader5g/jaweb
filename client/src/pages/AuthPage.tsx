import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import logoSvg from "../assets/logo-text-white.svg";
import authBgSvg from "../assets/auth-bg.svg";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Loader2, Star, Trophy, Users, BrainCog } from "lucide-react";

// نوع بيانات نموذج تسجيل الدخول
const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

// نوع بيانات نموذج التسجيل
const registerSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  // استخدام wouter للتحكم في المسارات
  const [, navigate] = useLocation();
  const [, params] = useRoute("/auth");
  const searchParams = new URLSearchParams(window.location.search);
  const showRegister = searchParams.get("register") === "true";
  
  // استخدام سياق المصادقة
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  // التبويب النشط (تسجيل الدخول أو التسجيل)
  const [activeTab, setActiveTab] = useState<string>(showRegister ? "register" : "login");

  // إذا كان المستخدم مسجل الدخول بالفعل، نقوم بتوجيهه إلى الصفحة الرئيسية
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // إعداد نموذج تسجيل الدخول
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // إعداد نموذج التسجيل
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // معالجة تسجيل الدخول
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  // معالجة التسجيل
  const onRegisterSubmit = (values: RegisterFormValues) => {
    // نرسل نموذج التسجيل بالكامل بما في ذلك حقل تأكيد كلمة المرور
    registerMutation.mutate(values);
  };
  
  // عرض مؤشر التحميل أثناء التحقق من حالة المصادقة
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-slow">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // تحديث العنوان عند تغيير التبويب
  useEffect(() => {
    const newSearch = activeTab === "register" ? "?register=true" : "";
    window.history.replaceState(null, "", `/auth${newSearch}`);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-hero-pattern overflow-hidden">
      {/* خلفية الصفحة */}
      <img 
        src={authBgSvg} 
        className="fixed top-0 left-0 w-full h-full object-cover -z-10" 
        alt="خلفية" 
      />
      
      <div className="container mx-auto pt-10 px-4">
        {/* شعار التطبيق */}
        <div className="flex justify-center mb-8">
          <div className="animate-float">
            <img src={logoSvg} alt="جاوب" className="h-28" />
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* قسم النموذج */}
          <div className="w-full lg:w-5/12">
            <Card className="w-full max-w-md mx-auto border-0 shadow-2xl bg-glass">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl text-center bg-gradient-to-r from-sky-500 to-primary bg-clip-text text-transparent">
                  {activeTab === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                </CardTitle>
                <CardDescription className="text-center text-lg">
                  {activeTab === "login"
                    ? "قم بتسجيل الدخول للوصول إلى حسابك"
                    : "أنشئ حساباً جديداً للمشاركة في اللعبة"}
                </CardDescription>
              </CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 mx-4">
                  <TabsTrigger value="login" className="text-lg py-2">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="register" className="text-lg py-2">التسجيل</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                      <CardContent className="space-y-5">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">اسم المستخدم</FormLabel>
                              <FormControl>
                                <Input placeholder="ادخل اسم المستخدم" {...field} className="text-lg py-6" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">كلمة المرور</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="ادخل كلمة المرور" 
                                  {...field} 
                                  className="text-lg py-6"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="pb-6">
                        <Button 
                          type="submit" 
                          className="w-full text-lg py-6 bg-primary-gradient btn-hover-effect"
                          disabled={loginMutation.isPending || loginForm.formState.isSubmitting}
                        >
                          {loginMutation.isPending || loginForm.formState.isSubmitting ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> جاري التحميل...</>
                          ) : (
                            "تسجيل الدخول"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                      <CardContent className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">اسم المستخدم</FormLabel>
                              <FormControl>
                                <Input placeholder="ادخل اسم المستخدم" {...field} className="text-lg py-6" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">البريد الإلكتروني</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="ادخل البريد الإلكتروني" 
                                  {...field} 
                                  className="text-lg py-6"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">كلمة المرور</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="ادخل كلمة المرور" 
                                  {...field} 
                                  className="text-lg py-6"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg">تأكيد كلمة المرور</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="أعد إدخال كلمة المرور" 
                                  {...field} 
                                  className="text-lg py-6"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="pb-6">
                        <Button 
                          type="submit" 
                          className="w-full text-lg py-6 bg-primary-gradient btn-hover-effect"
                          disabled={registerMutation.isPending || registerForm.formState.isSubmitting}
                        >
                          {registerMutation.isPending || registerForm.formState.isSubmitting ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> جاري التحميل...</>
                          ) : (
                            "إنشاء حساب"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* قسم الترحيب */}
          <div className="w-full lg:w-7/12 text-center lg:text-right">
            <div className="lg:ml-0 lg:mr-auto max-w-xl bg-glass backdrop-blur-sm p-10 rounded-3xl shadow-xl">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-sky-500 to-primary bg-clip-text text-transparent">
                مرحباً بك في موقع جاوب!
              </h1>
              <p className="text-xl mb-8 leading-relaxed">
                استمتع بتجربة لعب فريدة مع آلاف الأسئلة في مختلف المجالات والفئات.
                تحدى أصدقاءك واختبر معلوماتك في بيئة تنافسية ممتعة.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <BrainCog className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">تحدي المعرفة</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    استكشف مجموعة متنوعة من الفئات من التاريخ إلى العلوم والرياضة والفن والكثير غيرها
                  </p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">لعب تنافسي</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    شكل فريقك وتنافس في مسابقة ممتعة لاختبار معلوماتكم ضد الفرق الأخرى
                  </p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">مستويات متدرجة</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    اختر مستوى الصعوبة المناسب لك واستمتع بتحديات متنوعة تناسب جميع المستويات
                  </p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">نظام مكافآت</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    اكسب النقاط وارتقِ بمستواك من البرونزي إلى الفضي والذهبي والبلاتيني
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}