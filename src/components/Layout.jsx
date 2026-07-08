import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LayoutDashboard, Building2, Users, Kanban, Briefcase, TrendingUp, Receipt, CalendarClock, Moon, Sun, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "İdarəetmə paneli", path: "/", icon: LayoutDashboard },
  { label: "Şirkətlər", path: "/sirketler", icon: Building2 },
  { label: "Müştərilər", path: "/musteriler", icon: Users },
  { label: "CRM Pipeline", path: "/pipeline", icon: Kanban },
  { label: "Xidmətlər", path: "/xidmetler", icon: Briefcase },
  { label: "Satış paneli", path: "/satislar", icon: TrendingUp },
  { label: "Xərclər", path: "/xercler", icon: Receipt },
  { label: "Geri dönüşlər", path: "/geri-donusler", icon: CalendarClock },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("bizcrm-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("bizcrm-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm">B</div>
        <span className="font-extrabold text-lg tracking-tight">BizCRM</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ label, path, icon: Icon }) => {
          const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} title="Tema">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" className="flex-1 justify-start gap-2 text-muted-foreground" onClick={() => base44.auth.logout("/login")}>
          <LogOut className="w-4 h-4" /> Çıxış
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex-col z-30">{sidebar}</aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card border-r border-border">{sidebar}</aside>
        </div>
      )}
      <header className="lg:hidden sticky top-0 z-20 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <span className="font-extrabold tracking-tight">BizCRM</span>
      </header>
      <main className="lg:pl-64">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}