"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleChart } from "@/components/charts";
import {
  Users,
  AlertTriangle,
  UserPlus,
  DollarSign,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  ExternalLink,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CRM_STATUS_LABELS, CRM_STATUS_COLORS } from "@/lib/types";
import type {
  DashboardKpi,
  TimeSeriesPoint,
  ChurnRatePoint,
  ActionItem,
  DeliverySummary,
} from "@/lib/types";
import Link from "next/link";

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  format = "number",
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  format?: "number" | "currency" | "decimal";
}) {
  const isPositive = change >= 0;
  const isChurnRisk = title === "離反予備軍";
  const changeColor = isChurnRisk
    ? isPositive ? "text-red-500" : "text-green-500"
    : isPositive ? "text-green-500" : "text-red-500";

  const formatValue = () => {
    switch (format) {
      case "currency":
        return `¥${value.toLocaleString()}`;
      case "decimal":
        return value.toFixed(1);
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{formatValue()}</p>
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <ArrowUpRight className={`h-3 w-3 ${changeColor}`} />
              ) : (
                <ArrowDownRight className={`h-3 w-3 ${changeColor}`} />
              )}
              <span className={`text-xs font-medium ${changeColor}`}>
                {isPositive ? "+" : ""}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">先月比</span>
            </div>
          </div>
          <div className="rounded-full bg-muted p-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const PERIODS = [
  { value: "week", label: "今週" },
  { value: "month", label: "今月" },
  { value: "quarter", label: "四半期" },
] as const;

export interface DashboardData {
  kpi: DashboardKpi;
  dailyActiveUsers: TimeSeriesPoint[];
  dailyOrders: TimeSeriesPoint[];
  monthlyChurnRate: ChurnRatePoint[];
  actionItems: ActionItem[];
  recentDeliveries: DeliverySummary[];
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<string>("month");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const periodLabel = PERIODS.find((p) => p.value === period)?.label || "今月";
  const dateStr = lastRefresh.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  const { kpi, dailyActiveUsers, dailyOrders, monthlyChurnRate, actionItems, recentDeliveries } = data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground">{dateStr} 時点（{periodLabel}）</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              setLastRefresh(new Date());
              toast.success("データを更新しました");
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> 更新
          </Button>
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="アクティブユーザー" value={kpi.activeUsers.value} change={kpi.activeUsers.change} icon={Users} />
        <KpiCard title="離反予備軍" value={kpi.churnRiskUsers.value} change={kpi.churnRiskUsers.change} icon={AlertTriangle} />
        <KpiCard title="新規顧客" value={kpi.newUsers.value} change={kpi.newUsers.change} icon={UserPlus} />
        <KpiCard title="平均客単価" value={kpi.avgOrderAmount.value} change={kpi.avgOrderAmount.change} icon={DollarSign} format="currency" />
        <KpiCard title="平均利用パートナー数" value={kpi.avgPartnerCount.value} change={kpi.avgPartnerCount.change} icon={Building2} format="decimal" />
        <KpiCard title="新規パートナー利用" value={kpi.newPartnerUsage.value} change={kpi.newPartnerUsage.change} icon={TrendingUp} />
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー推移（日別）</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={dailyActiveUsers} xKey="date" yKey="count" color="#2563eb" formatY={(v) => `${v}人`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">注文件数推移（日別）</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={dailyOrders} xKey="date" yKey="count" color="#2563eb" type="bar" formatY={(v) => `${v}件`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">離反率推移（月別）</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart data={monthlyChurnRate} xKey="month" yKey="rate" color="#ef4444" formatY={(v) => `${v}%`} />
          </CardContent>
        </Card>
      </div>

      {/* アクションリスト & 配信結果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">要対応ユーザー</CardTitle>
              <Link href="/users?filter=action_required" className="text-xs text-primary hover:underline flex items-center gap-1">
                すべて見る <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionItems.map((item) => (
              <Link key={item.id} href={`/users/${item.customer.customerCode}`} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted transition-colors">
                <div className="mt-0.5">
                  {item.type === "churn_risk" ? <AlertTriangle className="h-4 w-4 text-orange-500" /> : <ShoppingCart className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{item.customer.customerName1}</span>
                    <Badge variant="secondary" className={`text-[10px] ${CRM_STATUS_COLORS[item.customer.crmStatus]}`}>
                      {CRM_STATUS_LABELS[item.customer.crmStatus]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${item.priority === "high" ? "border-red-300 text-red-600" : item.priority === "medium" ? "border-orange-300 text-orange-600" : "border-gray-300 text-gray-600"}`}>
                  {item.priority === "high" ? "高" : item.priority === "medium" ? "中" : "低"}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">直近の配信結果</CardTitle>
              <Link href="/history" className="text-xs text-primary hover:underline flex items-center gap-1">
                すべて見る <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDeliveries.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-[10px] ${d.channel === "line" ? "bg-green-100 text-green-700" : d.channel === "email" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {d.channel.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{d.type === "auto" ? "自動" : "手動"}</Badge>
                    <span className="text-sm truncate">{d.target}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{new Date(d.sentAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}</span>
                    <span className="text-xs text-muted-foreground">{d.sentCount}人</span>
                    <span className="text-xs">開封 <span className="font-medium">{d.openRate}%</span></span>
                    <span className="text-xs">クリック <span className="font-medium">{d.clickRate}%</span></span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
