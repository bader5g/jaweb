import { useAuth } from "../hooks/use-auth";
import { Redirect, Route, RouteComponentProps } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.FC<RouteComponentProps>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        // إذا كانت حالة المصادقة قيد التحميل، نعرض مؤشر تحميل
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // إذا لم يتم تسجيل دخول المستخدم، نعيد توجيهه إلى صفحة المصادقة
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // إذا كان المستخدم مسجل الدخول، نعرض المكون المطلوب
        return <Component {...params} />;
      }}
    </Route>
  );
}