import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/SidebarNav";
import { Menu, Zap } from "lucide-react";

export function AppLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* ─── Sidebar (permanent at lg+) ───────────────────────────────── */}
      <aside className="hidden w-60 flex-col border-r bg-card lg:flex">
        <SidebarNav onLogout={handleLogout} />
      </aside>

      {/* ─── Main column ──────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile/tablet topbar (below lg) */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open navigation menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <SheetContent side="left" className="w-60 p-0" showCloseButton>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav
                onLogout={handleLogout}
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">Model Gateway</span>
          </div>
        </header>

        {/* ─── Content ────────────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
