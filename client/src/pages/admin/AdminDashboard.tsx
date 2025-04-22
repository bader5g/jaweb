import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutGrid, 
  Users, 
  FileQuestion, 
  FolderKanban, 
  Settings, 
  LifeBuoy, 
  LogOut, 
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// سنقوم باستيراد هذه المكونات لاحقًا
// استخدام مكونات مؤقتة للعرض
const TempComponent = ({ title }: { title: string }) => (
  <div className="p-6 border rounded-lg">
    <h3 className="text-lg font-medium mb-2">قسم {title}</h3>
    <p>هذا القسم قيد التطوير</p>
  </div>
)

const AdminCategories = () => <TempComponent title="إدارة الفئات" />;
const AdminQuestions = () => <TempComponent title="إدارة الأسئلة" />;
const AdminUsers = () => <TempComponent title="إدارة المستخدمين" />;
const AdminSettings = () => <TempComponent title="إعدادات النظام" />;
const AdminHelp = () => <TempComponent title="وسائل المساعدة" />;
const AdminDesign = () => <TempComponent title="تخصيص التصميم" />;

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('categories');
  
  // التحقق إذا كان المستخدم مسؤولًا 
  // سنقوم بتعطيل هذه الدالة مؤقتًا لتسهيل التطوير
  /*
  React.useEffect(() => {
    // إذا كان المستخدم غير مسجل دخول أو ليس مسؤولًا، قم بتوجيهه إلى صفحة الرئيسية
    if (!user || (user && user.role !== 'admin' && user.role !== 'super_admin')) {
      setLocation('/');
    }
  }, [user, setLocation]);
  */

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation('/');
  };

  /* سنقوم بتعطيل هذا الشرط مؤقتًا لتسهيل التطوير
  if (!user || (user && user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl">جاري التحميل...</p>
    </div>;
  }
  */

  return (
    <div className="flex min-h-screen flex-col md:flex-row rtl">
      {/* القائمة الجانبية */}
      <aside className="bg-card w-full md:w-64 p-4 border-l">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold mb-4 text-center text-primary">لوحة التحكم</h2>
          <div className="flex flex-col space-y-1">
            <Button 
              variant={activeSection === 'categories' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => setActiveSection('categories')}
            >
              <FolderKanban className="ml-2 h-5 w-5" />
              الفئات
            </Button>
            <Button 
              variant={activeSection === 'questions' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => setActiveSection('questions')}
            >
              <FileQuestion className="ml-2 h-5 w-5" />
              الأسئلة
            </Button>
            <Button 
              variant={activeSection === 'users' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => setActiveSection('users')}
            >
              <Users className="ml-2 h-5 w-5" />
              المستخدمين
            </Button>
            <Button 
              variant={activeSection === 'settings' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => setActiveSection('settings')}
            >
              <Settings className="ml-2 h-5 w-5" />
              الإعدادات
            </Button>
            <Button 
              variant={activeSection === 'help' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => setActiveSection('help')}
            >
              <LifeBuoy className="ml-2 h-5 w-5" />
              وسائل المساعدة
            </Button>
            <Button 
              variant={activeSection === 'design' ? 'default' : 'ghost'} 
              className="justify-start" 
              onClick={() => setActiveSection('design')}
            >
              <Palette className="ml-2 h-5 w-5" />
              تخصيص التصميم
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="pt-2">
          <Button 
            variant="destructive" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="ml-2 h-5 w-5" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">
            {activeSection === 'categories' && 'إدارة الفئات'}
            {activeSection === 'questions' && 'إدارة الأسئلة'}
            {activeSection === 'users' && 'إدارة المستخدمين'}
            {activeSection === 'settings' && 'إعدادات النظام'}
            {activeSection === 'help' && 'إدارة وسائل المساعدة'}
            {activeSection === 'design' && 'تخصيص التصميم'}
          </h1>
          <p className="text-muted-foreground">
            {activeSection === 'categories' && 'إضافة وتعديل وإدارة فئات الأسئلة والأقسام الفرعية'}
            {activeSection === 'questions' && 'إضافة وتعديل الأسئلة ودعم الوسائط المتعددة'}
            {activeSection === 'users' && 'إدارة المستخدمين والمشرفين والصلاحيات'}
            {activeSection === 'settings' && 'ضبط إعدادات النظام والألعاب'}
            {activeSection === 'help' && 'إعداد وسائل المساعدة المتاحة للاعبين'}
            {activeSection === 'design' && 'تخصيص ألوان وشكل التطبيق'}
          </p>
        </div>

        <div className="space-y-4">
          {activeSection === 'categories' && <AdminCategories />}
          {activeSection === 'questions' && <AdminQuestions />}
          {activeSection === 'users' && <AdminUsers />}
          {activeSection === 'settings' && <AdminSettings />}
          {activeSection === 'help' && <AdminHelp />}
          {activeSection === 'design' && <AdminDesign />}
        </div>
      </main>
    </div>
  );
}