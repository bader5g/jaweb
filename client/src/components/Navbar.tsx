import { Button } from "./ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { Loader2, Award, Star, MenuIcon, XIcon, LogOut, User, Home, Trophy } from "lucide-react";
import { UserLevel } from "@shared/schema";
import logoSvg from "../assets/logo-white.svg";

// مكون عرض معلومات المستخدم المسجل
const UserProfile = () => {
  const { user, isLoading, logoutMutation } = useAuth();

  // إذا كانت حالة المصادقة قيد التحميل
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
        <span className="text-sm">جاري التحميل...</span>
      </div>
    );
  }

  // وظيفة لتحويل مستوى المستخدم إلى اللغة العربية
  const getLevelInArabic = (level: string) => {
    switch (level) {
      case UserLevel.BRONZE:
        return "برونزي";
      case UserLevel.SILVER:
        return "فضي";
      case UserLevel.GOLD:
        return "ذهبي";
      case UserLevel.PLATINUM:
        return "بلاتيني";
      default:
        return "برونزي";
    }
  };

  // وظيفة للحصول على لون وأيقونة المستوى
  const getLevelProps = (level: string) => {
    switch (level) {
      case UserLevel.BRONZE:
        return { color: "bg-amber-700", icon: <Award className="h-4 w-4" /> };
      case UserLevel.SILVER:
        return { color: "bg-gray-400", icon: <Award className="h-4 w-4" /> };
      case UserLevel.GOLD:
        return { color: "bg-yellow-500", icon: <Trophy className="h-4 w-4" /> };
      case UserLevel.PLATINUM:
        return { color: "bg-purple-500", icon: <Star className="h-4 w-4" /> };
      default:
        return { color: "bg-amber-700", icon: <Award className="h-4 w-4" /> };
    }
  };

  // إذا كان المستخدم مسجل الدخول
  if (user) {
    const { color, icon } = getLevelProps(user.level);
    
    return (
      <div className="flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">
                {user.username}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="font-bold">{user.points}</span>
                </div>
                <div className={`flex items-center gap-1 ${color} text-white px-2 py-0.5 rounded-full text-xs`}>
                  {icon} {getLevelInArabic(user.level)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-white hover:bg-white/20 rounded-full"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </Button>
      </div>
    );
  }

  // إذا كان المستخدم غير مسجل الدخول
  return (
    <div className="flex items-center gap-3">
      <Link href="/auth">
        <Button variant="ghost" className="text-white hover:bg-white/20">
          تسجيل الدخول
        </Button>
      </Link>
      <Link href="/auth?register=true">
        <Button className="bg-white text-primary hover:bg-white/90 transition-all duration-300">
          تسجيل جديد
        </Button>
      </Link>
    </div>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // تأثير للتحقق من التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-primary/90 backdrop-blur-md shadow-md py-2' 
          : 'bg-gradient-to-br from-sky-400 to-primary py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2 group">
            <img src={logoSvg} alt="جاوب" className="h-10 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </Link>

        {/* قائمة الروابط (المنتصف) */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-1 text-white/90 hover:text-white transition-colors duration-200">
              <Home className="h-4 w-4" />
              <span>الرئيسية</span>
            </div>
          </Link>
          <Link href="/leaderboard">
            <div className="flex items-center gap-1 text-white/90 hover:text-white transition-colors duration-200">
              <Trophy className="h-4 w-4" />
              <span>المتصدرون</span>
            </div>
          </Link>
        </div>

        {/* قائمة الهاتف المحمول */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:bg-white/20"
          >
            {isMenuOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* قائمة سطح المكتب */}
        <div className="hidden md:flex items-center">
          <UserProfile />
        </div>
      </div>

      {/* قائمة الهاتف المحمول المنسدلة */}
      {isMenuOpen && (
        <div className="md:hidden container mx-auto px-4 py-4 border-t border-white/10 mt-2 bg-primary/95 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-2 text-white py-2">
                <Home className="h-5 w-5" />
                <span className="text-lg">الرئيسية</span>
              </div>
            </Link>
            <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)}>
              <div className="flex items-center gap-2 text-white py-2">
                <Trophy className="h-5 w-5" />
                <span className="text-lg">المتصدرون</span>
              </div>
            </Link>
            <div className="border-t border-white/10 pt-4 mt-2">
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}