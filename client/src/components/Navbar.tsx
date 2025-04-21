import { Button } from "./ui/button";
import { Link } from "wouter";
import { useState } from "react";

// سنقوم بتنفيذ مكون المستخدم المسجل لاحقاً عندما نضيف نظام المصادقة
const UserProfile = () => {
  const isLoggedIn = false; // هذا سيتغير عندما نضيف المصادقة

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <div>
            <span className="font-bold">100</span> نقطة
          </div>
          <div>المستوى: برونزي</div>
        </div>
        <Button variant="outline" size="sm">
          تسجيل الخروج
        </Button>
      </div>
    );
  }

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