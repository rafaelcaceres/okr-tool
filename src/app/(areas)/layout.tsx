"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { PenLine, TrendingUp, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/planejamento", label: "Planejamento", icon: PenLine },
  { href: "/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

const planejamentoSubNav = [
  { href: "/planejamento", label: "Objetivos", exact: true },
  { href: "/planejamento/ciclos", label: "Ciclos" },
  { href: "/planejamento/franquias", label: "Franquias" },
  { href: "/planejamento/membros", label: "Membros" },
];

export default function AreasLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPlanejamento = pathname.startsWith("/planejamento");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <Link href="/planejamento" className="text-xl font-bold text-gray-900 dark:text-foreground">
              OKR Tool
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                      isActive
                        ? "bg-gray-100 dark:bg-muted text-gray-900 dark:text-foreground"
                        : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <ModeToggle />
        </div>
        {isPlanejamento && (
          <div className="border-t border-gray-100 dark:border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-2 h-11">
                {planejamentoSubNav.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href || pathname.startsWith("/planejamento/objetivos")
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
