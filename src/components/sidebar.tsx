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
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: string[]; // 未指定=全ロールに表示
};

const navItems: NavItem[] = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/users", label: "ユーザー一覧", icon: Users },
  { href: "/churn", label: "離反/新規分析", icon: TrendingDown },
  { href: "/segments", label: "セグメント", icon: Filter, roles: ["admin"] },
  { href: "/delivery", label: "手動配信", icon: Send },
  { href: "/automation", label: "自動配信", icon: Zap, roles: ["admin"] },
  { href: "/history", label: "配信履歴", icon: History },
  { href: "/settings", label: "設定", icon: Settings, roles: ["admin"] },
];

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "sales";

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const sidebarContent = (
    <>
      {/* ロゴ */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">
            ラクシーレ
            <span className="text-sm font-normal text-muted-foreground ml-1">
              CRM
            </span>
          </span>
        )}
        {/* デスクトップ: 折りたたみボタン / モバイル: 閉じるボタン */}
        <button
          onClick={() => {
            if (onMobileClose) {
              onMobileClose();
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className={cn(
            "ml-auto rounded-md p-1 hover:bg-muted",
            collapsed && !onMobileClose && "mx-auto"
          )}
        >
          {onMobileClose ? (
            <X className="h-4 w-4" />
          ) : collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {filteredItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {(!collapsed || onMobileClose) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報 & ログアウト */}
      <div className="border-t p-3">
        {session?.user && (
          <div
            className={cn(
              "flex items-center gap-2 mb-2",
              collapsed && !onMobileClose && "justify-center"
            )}
          >
            <div className="rounded-full bg-primary/10 p-1.5 shrink-0">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
            {(!collapsed || onMobileClose) && (
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">
                  {session.user.name}
                  {userRole === "admin" && (
                    <span className="ml-1 text-[9px] bg-primary/10 text-primary px-1 rounded">
                      管理者
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-1",
              collapsed && !onMobileClose && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!collapsed || onMobileClose) && <span>ログアウト</span>}
          </button>
          {(!collapsed || onMobileClose) && <ThemeToggle />}
        </div>
        {(!collapsed || onMobileClose) && (
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            v0.1.0 (開発中) · PDM回答待ち: 4件
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* デスクトップサイドバー */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* モバイルオーバーレイ */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
