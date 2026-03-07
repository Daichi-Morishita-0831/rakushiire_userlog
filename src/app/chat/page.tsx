"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  MessageCircle,
  AlertTriangle,
  Bot,
  Clock,
  Loader2,
  Zap,
  Coins,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { INQUIRY_CATEGORY_LABELS } from "@/lib/ai/types";
import { getChatSessions, getChatKpi } from "@/lib/actions/chat";
import type { ChatSession, ChatSessionStatus } from "@/lib/ai/types";

// --- ステータスバッジ ---

function StatusBadge({ status }: { status: ChatSession["status"] }) {
  const config = {
    active: { label: "対応中", className: "bg-blue-100 text-blue-700" },
    escalated: { label: "要エスカレ", className: "bg-red-100 text-red-700" },
    resolved: { label: "解決済み", className: "bg-green-100 text-green-700" },
    closed: { label: "クローズ", className: "bg-gray-100 text-gray-700" },
  };
  const c = config[status];
  return (
    <Badge variant="secondary" className={`text-[10px] ${c.className}`}>
      {c.label}
    </Badge>
  );
}

// --- KPIカード ---

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-full p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// --- メインページ ---

type KpiData = {
  totalSessions: number;
  activeSessions: number;
  escalatedSessions: number;
  avgConfidence: number;
  totalTokensUsed: number;
};

export default function ChatPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [escalationFilter, setEscalationFilter] = useState<string>("all");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const [sessionsData, kpiData] = await Promise.all([
      getChatSessions(),
      getChatKpi(),
    ]);
    setSessions(sessionsData);
    setKpi(kpiData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // クライアント側フィルタリング
  const filtered = sessions.filter((s) => {
    if (statusFilter !== "all" && s.status !== (statusFilter as ChatSessionStatus))
      return false;
    if (escalationFilter === "escalated" && !s.needsHumanSupport) return false;
    if (escalationFilter === "ai_only" && s.needsHumanSupport) return false;
    return true;
  });

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold">AIチャット</h1>
        <p className="text-sm text-muted-foreground">
          LINE AIチャット対応のセッション管理・応答ログ
        </p>
      </div>

      {/* KPI */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard
            label="総セッション"
            value={String(kpi.totalSessions)}
            icon={MessageCircle}
            color="bg-blue-100 text-blue-600"
          />
          <KpiCard
            label="対応中"
            value={String(kpi.activeSessions)}
            icon={Clock}
            color="bg-amber-100 text-amber-600"
          />
          <KpiCard
            label="要エスカレーション"
            value={String(kpi.escalatedSessions)}
            icon={AlertTriangle}
            color="bg-red-100 text-red-600"
          />
          <KpiCard
            label="AI確信度（平均）"
            value={`${(kpi.avgConfidence * 100).toFixed(0)}%`}
            icon={Bot}
            color="bg-green-100 text-green-600"
          />
          <KpiCard
            label="トークン使用量"
            value={kpi.totalTokensUsed.toLocaleString()}
            icon={Coins}
            color="bg-purple-100 text-purple-600"
          />
        </div>
      )}

      {/* フィルター */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ステータス</SelectItem>
                <SelectItem value="active">対応中</SelectItem>
                <SelectItem value="escalated">要エスカレーション</SelectItem>
                <SelectItem value="resolved">解決済み</SelectItem>
                <SelectItem value="closed">クローズ</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={escalationFilter}
              onValueChange={setEscalationFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="対応種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全対応</SelectItem>
                <SelectItem value="escalated">人間対応必要</SelectItem>
                <SelectItem value="ai_only">AI完結</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* セッション一覧 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>開始日時</TableHead>
                <TableHead>顧客</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">メッセージ数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    セッションがありません
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/chat/${s.id}`)}
                  >
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(s.startedAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {s.customerName ?? "未特定"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.customerCode ?? s.lineUid.substring(0, 10) + "..."}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.inquiryCategory && (
                        <Badge variant="outline" className="text-[10px]">
                          {INQUIRY_CATEGORY_LABELS[s.inquiryCategory]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={s.status} />
                        {s.needsHumanSupport && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{s.messageCount}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
