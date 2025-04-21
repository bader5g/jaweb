import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// تعريف مخططات التحقق من البيانات
const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

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
  const [, navigate] = useLocation();
  const [, params] = useRoute("/auth");
  const searchParams = new URLSearchParams(window.location.search);
  const showRegister = searchParams.get("register") === "true";
  const [activeTab, setActiveTab] = useState<string>(showRegister ? "register" : "login");

  // نموذج تسجيل الدخول
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // نموذج التسجيل
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
    console.log("Login values:", values);
    // سيتم تنفيذ هنا طلب API للمصادقة
    // بعد نجاح تسجيل الدخول، سيتم التوجيه إلى الصفحة الرئيسية
    navigate("/");
  };

  // معالجة التسجيل
  const onRegisterSubmit = (values: RegisterFormValues) => {
    console.log("Register values:", values);
    // سيتم تنفيذ هنا طلب API للتسجيل
    // بعد نجاح التسجيل، سيتم التوجيه إلى الصفحة الرئيسية
    navigate("/");
  };

  // تحديث العنوان عند تغيير التبويب
  useEffect(() => {
    const newSearch = activeTab === "register" ? "?register=true" : "";
    window.history.replaceState(null, "", `/auth${newSearch}`);
  }, [activeTab]);

  return (
    <div className="container mx-auto flex flex-col lg:flex-row py-8 px-4 gap-8 items-center">
      {/* قسم النموذج */}
      <div className="w-full lg:w-1/2">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {activeTab === "login" ? "تسجيل الدخول" : "التسجيل"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login"
                ? "قم بتسجيل الدخول للوصول إلى حسابك"
                : "أنشئ حساباً جديداً للمشاركة في اللعبة"}
            </CardDescription>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 mx-4">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">التسجيل</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input placeholder="ادخل اسم المستخدم" {...field} />
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
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="ادخل كلمة المرور" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginForm.formState.isSubmitting}
                    >
                      {loginForm.formState.isSubmitting ? "جاري التحميل..." : "تسجيل الدخول"}
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
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input placeholder="ادخل اسم المستخدم" {...field} />
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
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="ادخل البريد الإلكتروني" 
                              {...field} 
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
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="ادخل كلمة المرور" 
                              {...field} 
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
                          <FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="أعد إدخال كلمة المرور" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerForm.formState.isSubmitting}
                    >
                      {registerForm.formState.isSubmitting ? "جاري التحميل..." : "التسجيل"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* قسم الترحيب */}
      <div className="w-full lg:w-1/2 text-center lg:text-right">
        <div className="max-w-lg mx-auto lg:ml-0 lg:mr-auto">
          <h1 className="text-4xl font-bold mb-4">مرحباً بك في موقع جاوب!</h1>
          <p className="text-xl mb-6">
            استمتع بتجربة لعب فريدة مع آلاف الأسئلة في مختلف المجالات والفئات
          </p>
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">أكثر من 1000 فئة</h3>
              <p>استكشف مجموعة متنوعة من الفئات من التاريخ إلى العلوم والرياضة والفن</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">لعب تنافسي</h3>
              <p>تنافس مع فريقك في مسابقة ممتعة لاختبار معلوماتكم</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">اكسب نقاط وارتقِ بمستواك</h3>
              <p>كلما لعبت أكثر، كلما كسبت المزيد من النقاط وارتقيت إلى مستويات أعلى</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}