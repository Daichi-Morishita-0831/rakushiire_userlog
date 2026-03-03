"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MessageSquare, Download } from "lucide-react";
import {
  mockCustomers,
  CRM_STATUS_LABELS,
  CRM_STATUS_COLORS,
  type CrmStatus,
} from "@/lib/mock-data";
import { downloadCsv } from "@/lib/csv-export";
import Link from "next/link";

function daysSince(dateStr: string | null): string {
  if (!dateStr) return "-";
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "今日";
  if (days === 1) return "昨日";
  return `${days}日前`;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lineFilter, setLineFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("monthlyOrderAmount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...mockCustomers];

    // 検索
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerCode.toLowerCase().includes(q) ||
          c.customerName1.toLowerCase().includes(q) ||
          c.address2.toLowerCase().includes(q)
      );
    }

    // ステータスフィルタ
    if (statusFilter !== "all") {
      result = result.filter((c) => c.crmStatus === statusFilter);
    }

    // LINE連携フィルタ
    if (lineFilter !== "all") {
      result = result.filter((c) =>
        lineFilter === "connected" ? c.lineConnected : !c.lineConnected
      );
    }

    // ソート
    result.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] ?? 0;
      const bVal = b[sortBy as keyof typeof b] ?? 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });

    return result;
  }, [search, statusFilter, lineFilter, sortBy, sortDir]);

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  const sortIndicator = (key: string) => {
    if (sortBy !== key) return "";
    return sortDir === "desc" ? " ↓" : " ↑";
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ユーザー一覧</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length}件 / 全{mockCustomers.length}件
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              downloadCsv(
                `users_${new Date().toISOString().split("T")[0]}.csv`,
                ["顧客コード", "店舗名", "都道府県", "住所", "ステータス", "LINE連携", "今月注文額", "注文回数", "パートナー数", "最終ログイン", "最終注文", "業態", "営業担当", "メール", "電話"],
                filtered.map((c) => [
                  c.customerCode,
                  c.customerName1,
                  c.address1,
                  c.address2,
                  CRM_STATUS_LABELS[c.crmStatus],
                  c.lineConnected ? "連携済み" : "未連携",
                  c.monthlyOrderAmount,
                  c.monthlyOrderCount,
                  c.partnerCount,
                  c.lastLoginAt || "",
                  c.lastOrderDate || "",
                  c.shopCategory,
                  c.salesPersonName,
                  c.email,
                  c.cellphone,
                ])
              );
            }}
          >
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm">
            <MessageSquare className="h-4 w-4 mr-1" /> 一括配信
          </Button>
        </div>
      </div>

      {/* フィルタ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="顧客コード / 店舗名 / 住所で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                {(Object.entries(CRM_STATUS_LABELS) as [CrmStatus, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select value={lineFilter} onValueChange={setLineFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="LINE連携" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="connected">連携済み</SelectItem>
                <SelectItem value="not_connected">未連携</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* テーブル */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">コード</TableHead>
                <TableHead>店舗名</TableHead>
                <TableHead>住所</TableHead>
                <TableHead className="text-center">ステータス</TableHead>
                <TableHead className="text-center">LINE</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("monthlyOrderAmount")}
                >
                  今月注文額{sortIndicator("monthlyOrderAmount")}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("monthlyOrderCount")}
                >
                  注文回数{sortIndicator("monthlyOrderCount")}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort("partnerCount")}
                >
                  パートナー{sortIndicator("partnerCount")}
                </TableHead>
                <TableHead>最終ログイン</TableHead>
                <TableHead>最終注文</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    <Link href={`/users/${c.customerCode}`} className="hover:underline text-primary">
                      {c.customerCode}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/users/${c.customerCode}`} className="hover:underline">
                      {c.customerName1}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.address1} {c.address2}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className={`text-[10px] ${CRM_STATUS_COLORS[c.crmStatus]}`}>
                      {CRM_STATUS_LABELS[c.crmStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {c.lineConnected ? (
                      <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                        連携済
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {c.monthlyOrderAmount > 0
                      ? `¥${c.monthlyOrderAmount.toLocaleString()}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">{c.monthlyOrderCount || "-"}</TableCell>
                  <TableCell className="text-right">{c.partnerCount || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {daysSince(c.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {daysSince(c.lastOrderDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
