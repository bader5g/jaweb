import { Button } from "./ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { UserLevel } from "@shared/schema";

// مكون عرض معلومات المستخدم المسجل
const UserProfile = () => {
  const { user, isLoading, logoutMutation } = useAuth();

  // إذا كانت حالة المصادقة قيد التحميل
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">جاري التحميل...</span>
      </div>
    );
  }

  // إذا كان المستخدم مسجل الدخول
  if (user) {
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

    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div className="font-medium">
            {user.username}
          </div>
          <div>
            <span className="font-bold">{user.points}</span> نقطة
          </div>
          <div>المستوى: {getLevelInArabic(user.level)}</div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "تسجيل الخروج"
          )}
        </Button>
      </div>
    );
  }

  // إذا كان المستخدم غير مسجل الدخول
  return (
    <div className="flex items-center gap-2">
      <Link href="/auth">
        <Button variant="outline" size="sm">
          تسجيل الدخول
        </Button>
      </Link>
      <Link href="/auth?register=true">
        <Button variant="default" size="sm">
          تسجيل جديد
        </Button>
      </Link>
    </div>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-primary py-4 text-white">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="font-bold text-2xl cursor-pointer">جاوب</div>
          </Link>
        </div>

        {/* قائمة الهاتف المحمول */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* قائمة سطح المكتب */}
        <div className="hidden md:flex items-center gap-4">
          <UserProfile />
        </div>
      </div>

      {/* قائمة الهاتف المحمول المنسدلة */}
      {isMenuOpen && (
        <div className="md:hidden container mx-auto px-4 py-2">
          <div className="flex flex-col gap-2">
            <UserProfile />
          </div>
        </div>
      )}
    </nav>
  );
}