import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutGrid,
  UtensilsCrossed,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import CategoriesPanel from "./CategoriesPanel";
import DishesPanel from "./DishesPanel";
import SubcategoriesPanel from "./SubcategoriesPanel";
import BusinessLunchPanel from "./BusinessLunchPanel";

type AdminTab = "categories" | "subcategories" | "dishes" | "business-lunch";

const NAV_ITEMS = [
  { id: "categories" as AdminTab, labelRu: "Категории", icon: LayoutGrid },
  { id: "subcategories" as AdminTab, labelRu: "Подкатегории", icon: LayoutGrid },
  { id: "dishes" as AdminTab, labelRu: "Блюда", icon: UtensilsCrossed },
  { id: "business-lunch" as AdminTab, labelRu: "Бизнес-ланч", icon: CalendarDays },
];

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      setError("Введите логин и пароль");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Неверный логин или пароль");
        return;
      }

      onSuccess();
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl font-semibold text-gold mb-2">Jusan Admin</p>
          <p className="font-body text-sm text-muted-foreground">
            Войдите, чтобы управлять меню
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm text-muted-foreground">Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="admin"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm text-muted-foreground">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 pr-10 font-body text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-gold/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="font-body text-sm text-destructive text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl gold-gradient text-background font-body font-semibold btn-press hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
  mobile,
  onClose,
}: {
  activeTab: AdminTab;
  onTabChange: (t: AdminTab) => void;
  onLogout: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const [, navigate] = useLocation();

  return (
    <div className={`flex flex-col h-full bg-card border-r border-border ${mobile ? "w-72" : "w-64"}`}>
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <p className="font-display text-xl font-semibold text-gold">Jusan</p>
          <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
            Admin Panel
          </p>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="btn-press">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, labelRu, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onTabChange(id); onClose?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-all btn-press ${
              activeTab === id
                ? "bg-gold/10 text-gold border border-gold/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {labelRu}
            {activeTab === id && <ChevronRight className="w-3 h-3 ml-auto text-gold" />}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all btn-press"
        >
          <Home className="w-4 h-4" />
          На сайт
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all btn-press"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, loading, refresh } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("categories");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="font-body text-muted-foreground text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSuccess={() => refresh()} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="font-display text-2xl text-destructive">Доступ запрещён</p>
        <p className="font-body text-muted-foreground text-center">
          У вас нет прав для доступа к панели администратора.
        </p>
        <a href="/" className="font-body text-gold underline">Вернуться на сайт</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={() => logout.mutate()}
        />
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 animate-slide-in-right">
            <AdminSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={() => logout.mutate()}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="btn-press">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <p className="font-display text-lg text-gold">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.labelRu}
          </p>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === "categories" && <CategoriesPanel />}
          {activeTab === "subcategories" && <SubcategoriesPanel />}
          {activeTab === "dishes" && <DishesPanel />}
          {activeTab === "business-lunch" && <BusinessLunchPanel />}
        </div>
      </div>
    </div>
  );
}
