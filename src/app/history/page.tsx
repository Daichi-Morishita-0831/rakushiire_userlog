"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Eye, MousePointerClick, ShoppingCart, MessageSquare, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { downloadCsv } from "@/lib/csv-export";
import { toast } from "sonner";

type HistoryItem = {
  id: number;
  sentAt: string;
  type: "auto" | "manual";
  channel: "line" | "email" | "sms";
  target: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  orderRate: number;
  orderAmount: number;
  subject: string;
  body: string;
  ruleName?: string;
};

const mockHistory: HistoryItem[] = [
  { id: 1, sentAt: "2026-03-03 09:00", type: "auto", channel: "line", target: "離反リスク顧客", sentCount: 47, openRate: 62.5, clickRate: 18.3, orderRate: 8.5, orderAmount: 245000, subject: "お久しぶりです！特別クーポンをお届け", body: "{{customer_name}}様\n\nいつもご利用ありがとうございます。\n最近お注文がないようですが、いかがでしょうか？\n\n今なら全品5%OFFクーポンをご利用いただけます。\n▶ 今すぐ注文する", ruleName: "離反予防（30日）" },
  { id: 2, sentAt: "2026-03-02 10:00", type: "manual", channel: "email", target: "全アクティブ顧客", sentCount: 342, openRate: 45.2, clickRate: 12.1, orderRate: 5.3, orderAmount: 1250000, subject: "【ラクシーレ】3月のおすすめ食材のご案内", body: "いつもラクシーレをご利用いただきありがとうございます。\n\n3月に入り、春野菜が本格的に出回り始めました。\n今月のおすすめ食材をご紹介します。\n\n■ 新玉ねぎ（愛知県産）\n■ 春キャベツ（千葉県産）\n■ アスパラガス（佐賀県産）" },
  { id: 3, sentAt: "2026-03-01 08:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 23, openRate: 78.3, clickRate: 34.5, orderRate: 21.7, orderAmount: 189000, subject: "カートに商品が残っています", body: "{{customer_name}}様\n\nカートに商品が入ったままになっています。\nお忘れではないですか？\n\n▶ カートを確認する", ruleName: "カゴ落ちフォロー" },
  { id: 4, sentAt: "2026-02-28 09:00", type: "manual", channel: "line", target: "新規顧客フォロー", sentCount: 12, openRate: 83.3, clickRate: 41.7, orderRate: 25.0, orderAmount: 156000, subject: "ご登録ありがとうございます！初回注文ガイド", body: "{{customer_name}}様\n\nラクシーレへようこそ！\n初めてのご注文をスムーズに行うためのガイドをお送りします。\n\n1. 商品を検索・カートに追加\n2. 配送日時を選択\n3. 注文を確定\n\n何かご不明点があればお気軽にお問い合わせください。" },
  { id: 5, sentAt: "2026-02-27 10:00", type: "auto", channel: "email", target: "再訪促進（60日）", sentCount: 31, openRate: 38.7, clickRate: 9.7, orderRate: 3.2, orderAmount: 85000, subject: "お元気ですか？ラクシーレからのご案内", body: "{{customer_name}}様\n\nしばらくご利用がないようですが、お変わりないでしょうか？\n\nラクシーレでは新しい取引先も増え、品揃えが充実しております。\nぜひ一度サイトをご覧ください。", ruleName: "再訪促進（60日）" },
  { id: 6, sentAt: "2026-02-26 08:00", type: "manual", channel: "line", target: "3月キャンペーン告知", sentCount: 150, openRate: 71.3, clickRate: 28.0, orderRate: 12.0, orderAmount: 890000, subject: "【3月限定】春の食材フェア開催中！", body: "ラクシーレをご利用の皆様へ\n\n3月限定「春の食材フェア」を開催します！\n\n■ 期間：3/1〜3/31\n■ 対象：春野菜・山菜カテゴリ全品\n■ 特典：5%OFF + 送料無料\n\n▶ フェア商品を見る" },
  { id: 7, sentAt: "2026-02-25 09:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 18, openRate: 72.2, clickRate: 33.3, orderRate: 16.7, orderAmount: 95000, subject: "カートに商品が残っています", body: "{{customer_name}}様\n\nカートに商品が入ったままになっています。\n\n▶ カートを確認する", ruleName: "カゴ落ちフォロー" },
  { id: 8, sentAt: "2026-02-24 10:00", type: "manual", channel: "email", target: "高単価顧客ケア", sentCount: 68, openRate: 52.9, clickRate: 17.6, orderRate: 8.8, orderAmount: 520000, subject: "いつもありがとうございます。担当よりご挨拶", body: "{{customer_name}}様\n\nいつもラクシーレをご愛顧いただき、誠にありがとうございます。\n\n担当の{{sales_person}}です。\n何かお困りのことや、お探しの食材がございましたら\nお気軽にご連絡ください。\n\n引き続きよろしくお願いいたします。" },
];

function MetricBar({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={`rounded-full p-2 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [channelFilter, setChannelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  const filtered = mockHistory.filter((h) => {
    if (channelFilter !== "all" && h.channel !== channelFilter) return false;
    if (typeFilter !== "all" && h.type !== typeFilter) return false;
    return true;
  });

  const handleCsvExport = () => {
    downloadCsv(
      `delivery_history_${new Date().toISOString().split("T")[0]}.csv`,
      ["配信日時", "種別", "チャネル", "対象", "送信数", "開封率", "クリック率", "注文率", "注文金額"],
      filtered.map((h) => [
        h.sentAt,
        h.type === "auto" ? "自動" : "手動",
        h.channel.toUpperCase(),
        h.target,
        h.sentCount,
        h.openRate,
        h.clickRate,
        h.orderRate,
        h.orderAmount,
      ])
    );
    toast.success(`${filtered.length}件の配信履歴をCSV出力しました`);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">配信履歴</h1>
          <p className="text-sm text-muted-foreground">
            全{filtered.length}件の配信
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCsvExport}>
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="チャネル" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全チャネル</SelectItem>
                <SelectItem value="line">LINE</SelectItem>
                <SelectItem value="email">メール</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全種別</SelectItem>
                <SelectItem value="manual">手動</SelectItem>
                <SelectItem value="auto">自動</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>配信日時</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>チャネル</TableHead>
                <TableHead>対象</TableHead>
                <TableHead className="text-right">送信数</TableHead>
                <TableHead className="text-right">開封率</TableHead>
                <TableHead className="text-right">クリック率</TableHead>
                <TableHead className="text-right">注文率</TableHead>
                <TableHead className="text-right">注文金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h) => (
                <TableRow
                  key={h.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(h)}
                >
                  <TableCell className="text-sm">{h.sentAt}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {h.type === "auto" ? "自動" : "手動"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        h.channel === "line"
                          ? "bg-green-100 text-green-700"
                          : h.channel === "email"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {h.channel.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{h.target}</TableCell>
                  <TableCell className="text-right">{h.sentCount}人</TableCell>
                  <TableCell className="text-right font-medium">{h.openRate}%</TableCell>
                  <TableCell className="text-right">{h.clickRate}%</TableCell>
                  <TableCell className="text-right">{h.orderRate}%</TableCell>
                  <TableCell className="text-right font-medium">
                    ¥{h.orderAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 配信詳細ダイアログ */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              配信詳細
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* メタ情報 */}
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    selected.channel === "line"
                      ? "bg-green-100 text-green-700"
                      : selected.channel === "email"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {selected.channel.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selected.type === "auto" ? "自動" : "手動"}
                </Badge>
                {selected.ruleName && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    ルール: {selected.ruleName}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">{selected.sentAt}</span>
              </div>

              {/* 効果指標 */}
              <div className="grid grid-cols-2 gap-2">
                <MetricBar label="送信数" value={`${selected.sentCount}人`} icon={Users} color="bg-slate-100 text-slate-600" />
                <MetricBar label="開封率" value={`${selected.openRate}%`} icon={Eye} color="bg-blue-100 text-blue-600" />
                <MetricBar label="クリック率" value={`${selected.clickRate}%`} icon={MousePointerClick} color="bg-green-100 text-green-600" />
                <MetricBar label="注文率" value={`${selected.orderRate}%`} icon={ShoppingCart} color="bg-orange-100 text-orange-600" />
              </div>

              {/* 注文金額 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">発生注文金額</p>
                  <p className="text-xl font-bold">¥{selected.orderAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* メッセージ内容 */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">件名</p>
                <p className="text-sm font-medium">{selected.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">本文</p>
                <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selected.body}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
