"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Filter,
  Send,
  Zap,
  History,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/users", label: "ユーザー一覧", icon: Users },
  { href: "/churn", label: "離反/新規分析", icon: TrendingDown },
  { href: "/segments", label: "セグメント", icon: Filter },
  { href: "/delivery", label: "手動配信", icon: Send },
  { href: "/automation", label: "自動配信", icon: Zap },
  { href: "/history", label: "配信履歴", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* ロゴ */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">
            ラクシーレ<span className="text-sm font-normal text-muted-foreground ml-1">CRM</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto rounded-md p-1 hover:bg-muted",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報 & ログアウト */}
      <div className="border-t p-3">
        {session?.user && (
          <div className={cn("flex items-center gap-2 mb-2", collapsed && "justify-center")}>
            <div className="rounded-full bg-primary/10 p-1.5 shrink-0">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{session.user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>ログアウト</span>}
        </button>
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            v0.1.0 (開発中) · PDM回答待ち: 4件
          </p>
        )}
      </div>
    </aside>
  );
}
