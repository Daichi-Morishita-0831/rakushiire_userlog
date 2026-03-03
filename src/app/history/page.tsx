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
import { Download } from "lucide-react";
import { useState } from "react";

const mockHistory = [
  { id: 1, sentAt: "2026-03-03 09:00", type: "auto", channel: "line", target: "離反リスク顧客", sentCount: 47, openRate: 62.5, clickRate: 18.3, orderRate: 8.5, orderAmount: 245000 },
  { id: 2, sentAt: "2026-03-02 10:00", type: "manual", channel: "email", target: "全アクティブ顧客", sentCount: 342, openRate: 45.2, clickRate: 12.1, orderRate: 5.3, orderAmount: 1250000 },
  { id: 3, sentAt: "2026-03-01 08:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 23, openRate: 78.3, clickRate: 34.5, orderRate: 21.7, orderAmount: 189000 },
  { id: 4, sentAt: "2026-02-28 09:00", type: "manual", channel: "line", target: "新規顧客フォロー", sentCount: 12, openRate: 83.3, clickRate: 41.7, orderRate: 25.0, orderAmount: 156000 },
  { id: 5, sentAt: "2026-02-27 10:00", type: "auto", channel: "email", target: "再訪促進（60日）", sentCount: 31, openRate: 38.7, clickRate: 9.7, orderRate: 3.2, orderAmount: 85000 },
  { id: 6, sentAt: "2026-02-26 08:00", type: "manual", channel: "line", target: "3月キャンペーン告知", sentCount: 150, openRate: 71.3, clickRate: 28.0, orderRate: 12.0, orderAmount: 890000 },
  { id: 7, sentAt: "2026-02-25 09:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 18, openRate: 72.2, clickRate: 33.3, orderRate: 16.7, orderAmount: 95000 },
  { id: 8, sentAt: "2026-02-24 10:00", type: "manual", channel: "email", target: "高単価顧客ケア", sentCount: 68, openRate: 52.9, clickRate: 17.6, orderRate: 8.8, orderAmount: 520000 },
];

export default function HistoryPage() {
  const [channelFilter, setChannelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = mockHistory.filter((h) => {
    if (channelFilter !== "all" && h.channel !== channelFilter) return false;
    if (typeFilter !== "all" && h.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">配信履歴</h1>
          <p className="text-sm text-muted-foreground">
            全{filtered.length}件の配信
          </p>
        </div>
        <Button variant="outline" size="sm">
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
                <TableRow key={h.id} className="cursor-pointer hover:bg-muted/50">
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
    </div>
  );
}
