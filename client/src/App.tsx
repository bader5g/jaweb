import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";
import Home from "./pages/Home";
import GameSetup from "./pages/GameSetup";
import GamePlay from "./pages/GamePlay";
import Questions from "./pages/Questions";
import { GameProvider } from "./lib/gameContext";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "./pages/AuthPage";
import AdminCategories from "./pages/AdminCategories";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Navbar from "./components/Navbar";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <ProtectedRoute path="/setup" component={GameSetup} />
          <ProtectedRoute path="/play" component={GamePlay} />
          <ProtectedRoute path="/questions" component={Questions} />
          <ProtectedRoute path="/admin" component={AdminDashboard} />
          <ProtectedRoute path="/admin/categories" component={AdminCategories} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <GameProvider>
            <Toaster />
            <Router />
          </GameProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
