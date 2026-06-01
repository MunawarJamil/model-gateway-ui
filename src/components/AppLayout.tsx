import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Key,
  BriefcaseBusiness,
  Webhook,
  LogOut,
  Zap,
} from "lucide-react";

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/api-keys", label: "API Keys", icon: Key },
  { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/webhooks", label: "Webhooks", icon: Webhook },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* ─── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="flex w-60 flex-col border-r bg-card">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-4">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">Model Gateway</span>
        </div>

        <Separator />

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        {/* User + logout */}
        <div className="p-3 space-y-2">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
