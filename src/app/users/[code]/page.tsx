"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { SimpleChart } from "@/components/charts";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  User,
  ShoppingCart,
  LogIn,
  Search,
  Eye,
  MousePointer,
  Send,
  MailOpen,
  ExternalLink,
} from "lucide-react";
import {
  mockCustomers,
  mockOrders,
  CRM_STATUS_LABELS,
  CRM_STATUS_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  type CustomerStatus,
} from "@/lib/mock-data";
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

// 月別注文サマリ（モック）
const monthlyOrderSummary = [
  { month: "2025-10", count: 10, amount: 215000 },
  { month: "2025-11", count: 12, amount: 268000 },
  { month: "2025-12", count: 14, amount: 312000 },
  { month: "2026-01", count: 11, amount: 245000 },
  { month: "2026-02", count: 13, amount: 298000 },
  { month: "2026-03", count: 4, amount: 84500 },
];

// 行動履歴モックデータ
const mockBehaviorLogs = [
  { id: 1, timestamp: "2026-03-03 10:30", type: "login", detail: "ECサイトにログイン", icon: LogIn },
  { id: 2, timestamp: "2026-03-03 10:32", type: "search", detail: "「鶏もも肉」を検索", icon: Search },
  { id: 3, timestamp: "2026-03-03 10:35", type: "view", detail: "商品ページ閲覧: 国産鶏もも肉 2kg", icon: Eye },
  { id: 4, timestamp: "2026-03-03 10:36", type: "cart", detail: "カートに追加: 国産鶏もも肉 2kg", icon: ShoppingCart },
  { id: 5, timestamp: "2026-03-03 10:38", type: "view", detail: "商品ページ閲覧: 天然サーモン 1kg", icon: Eye },
  { id: 6, timestamp: "2026-03-02 09:15", type: "login", detail: "ECサイトにログイン", icon: LogIn },
  { id: 7, timestamp: "2026-03-02 09:18", type: "order", detail: "注文確定: 20260302-001（¥8,000）", icon: ShoppingCart },
  { id: 8, timestamp: "2026-03-01 08:00", type: "login", detail: "ECサイトにログイン", icon: LogIn },
  { id: 9, timestamp: "2026-03-01 08:05", type: "search", detail: "「モッツァレラ」を検索", icon: Search },
  { id: 10, timestamp: "2026-03-01 08:10", type: "order", detail: "注文確定: 20260301-001（¥12,400）", icon: ShoppingCart },
  { id: 11, timestamp: "2026-02-28 14:20", type: "click", detail: "LINEメッセージ内リンクをクリック", icon: MousePointer },
  { id: 12, timestamp: "2026-02-28 11:00", type: "login", detail: "ECサイトにログイン", icon: LogIn },
];

// コミュニケーション履歴モックデータ
const mockCommLogs = [
  { id: 1, sentAt: "2026-03-03 09:00", channel: "line", type: "auto", subject: "離反リスク通知", status: "opened", openedAt: "2026-03-03 09:15", clicked: true },
  { id: 2, sentAt: "2026-03-01 10:00", channel: "email", type: "manual", subject: "3月キャンペーン告知", status: "opened", openedAt: "2026-03-01 12:30", clicked: false },
  { id: 3, sentAt: "2026-02-25 08:00", channel: "line", type: "auto", subject: "新商品入荷のお知らせ", status: "opened", openedAt: "2026-02-25 08:45", clicked: true },
  { id: 4, sentAt: "2026-02-20 09:00", channel: "email", type: "manual", subject: "2月特売チラシ", status: "delivered", openedAt: null, clicked: false },
  { id: 5, sentAt: "2026-02-15 10:00", channel: "line", type: "auto", subject: "カゴ落ちリマインド", status: "opened", openedAt: "2026-02-15 10:20", clicked: true },
  { id: 6, sentAt: "2026-02-10 08:00", channel: "email", type: "auto", subject: "再訪促進メール", status: "delivered", openedAt: null, clicked: false },
];

const BEHAVIOR_COLORS: Record<string, string> = {
  login: "text-blue-500",
  search: "text-purple-500",
  view: "text-gray-500",
  cart: "text-orange-500",
  order: "text-green-500",
  click: "text-blue-600",
};

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const customer = mockCustomers.find((c) => c.customerCode === code);
  const orders = mockOrders.filter((o) => o.customerCode === code);

  if (!customer) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">顧客が見つかりません</h1>
        <Link href="/users" className="text-primary hover:underline mt-2 inline-block">
          ユーザー一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{customer.customerName1}</h1>
              <Badge
                variant="secondary"
                className={CRM_STATUS_COLORS[customer.crmStatus]}
              >
                {CRM_STATUS_LABELS[customer.crmStatus]}
              </Badge>
              <Badge
                variant="outline"
                className={STATUS_COLORS[customer.status as CustomerStatus]}
              >
                {STATUS_LABELS[customer.status as CustomerStatus]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {customer.customerCode} / {customer.shopCategory}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" /> LINE送信
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1" /> メール送信
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-1" /> SMS送信
          </Button>
        </div>
      </div>

      {/* 基本情報カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">最終ログイン</p>
            <p className="text-lg font-bold mt-1">{daysSince(customer.lastLoginAt)}</p>
            <p className="text-xs text-muted-foreground">
              {customer.lastLoginAt
                ? new Date(customer.lastLoginAt).toLocaleString("ja-JP")
                : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">最終注文</p>
            <p className="text-lg font-bold mt-1">{daysSince(customer.lastOrderDate)}</p>
            <p className="text-xs text-muted-foreground">{customer.lastOrderDate || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">今月注文額</p>
            <p className="text-lg font-bold mt-1">
              ¥{customer.monthlyOrderAmount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{customer.monthlyOrderCount}回</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">利用パートナー</p>
            <p className="text-lg font-bold mt-1">{customer.partnerCount}社</p>
            <p className="text-xs text-muted-foreground">
              LINE: {customer.lineConnected ? "連携済み" : "未連携"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">顧客情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">{customer.address1} {customer.address2}</p>
                <p className="text-xs text-muted-foreground">〒---</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{customer.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{customer.cellphone}</p>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">営業担当: {customer.salesPersonName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">取引開始: {customer.startTradingDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">業態: {customer.shopCategory}</p>
            </div>
          </CardContent>
        </Card>

        {/* タブコンテンツ */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="orders">注文履歴</TabsTrigger>
                <TabsTrigger value="behavior">行動履歴</TabsTrigger>
                <TabsTrigger value="communication">コミュニケーション</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">
              {/* 注文履歴タブ */}
              <TabsContent value="orders" className="mt-0 space-y-4">
                <SimpleChart
                  data={monthlyOrderSummary}
                  xKey="month"
                  yKey="amount"
                  color="#2563eb"
                  type="bar"
                  formatY={(v) => `¥${(v / 1000).toFixed(0)}k`}
                  height={180}
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>注文番号</TableHead>
                      <TableHead>配送日</TableHead>
                      <TableHead>パートナー</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>種別</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? (
                      orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                          <TableCell className="text-sm">{o.deliveryDate}</TableCell>
                          <TableCell className="text-sm">{o.partnerName}</TableCell>
                          <TableCell className="text-sm">{o.productName}</TableCell>
                          <TableCell className="text-right font-medium">
                            ¥{o.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{o.orderType}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          注文履歴がありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* 行動履歴タブ */}
              <TabsContent value="behavior" className="mt-0">
                <div className="space-y-1">
                  {mockBehaviorLogs.map((log, idx) => {
                    const Icon = log.icon;
                    const prevLog = mockBehaviorLogs[idx - 1];
                    const showDate = idx === 0 || log.timestamp.split(" ")[0] !== prevLog?.timestamp.split(" ")[0];

                    return (
                      <div key={log.id}>
                        {showDate && (
                          <div className="flex items-center gap-2 pt-3 pb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {log.timestamp.split(" ")[0]}
                            </span>
                            <Separator className="flex-1" />
                          </div>
                        )}
                        <div className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors">
                          <span className="text-xs text-muted-foreground w-[45px] shrink-0">
                            {log.timestamp.split(" ")[1]}
                          </span>
                          <Icon className={`h-4 w-4 shrink-0 ${BEHAVIOR_COLORS[log.type] || "text-gray-400"}`} />
                          <span className="text-sm">{log.detail}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  EC MySQL接続後にリアルデータに切り替わります
                </p>
              </TabsContent>

              {/* コミュニケーション履歴タブ */}
              <TabsContent value="communication" className="mt-0">
                <div className="space-y-2">
                  {mockCommLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 rounded-md p-3 border hover:bg-muted/50 transition-colors"
                    >
                      <div className="shrink-0">
                        {log.channel === "line" ? (
                          <div className="rounded-full bg-green-100 p-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-blue-100 p-1.5">
                            <Mail className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{log.subject}</span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {log.type === "auto" ? "自動" : "手動"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{log.sentAt}</span>
                          {log.status === "opened" ? (
                            <span className="text-xs flex items-center gap-1 text-green-600">
                              <MailOpen className="h-3 w-3" /> 開封済
                              {log.openedAt && (
                                <span className="text-muted-foreground">（{log.openedAt.split(" ")[1]}）</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-xs flex items-center gap-1 text-muted-foreground">
                              <Send className="h-3 w-3" /> 配信済
                            </span>
                          )}
                          {log.clicked && (
                            <span className="text-xs flex items-center gap-1 text-blue-600">
                              <ExternalLink className="h-3 w-3" /> クリック
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  配信機能連携後にリアルデータに切り替わります
                </p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
