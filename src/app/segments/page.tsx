"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, Zap } from "lucide-react";

const mockSegments = [
  { id: 1, name: "離反リスク（30日未注文）", type: "dynamic", memberCount: 47, lastUpdated: "2026-03-03" },
  { id: 2, name: "高単価顧客（月20万以上）", type: "dynamic", memberCount: 68, lastUpdated: "2026-03-03" },
  { id: 3, name: "新規顧客（30日以内）", type: "dynamic", memberCount: 18, lastUpdated: "2026-03-03" },
  { id: 4, name: "LINE未連携", type: "dynamic", memberCount: 89, lastUpdated: "2026-03-03" },
  { id: 5, name: "3月キャンペーン対象", type: "static", memberCount: 150, lastUpdated: "2026-03-01" },
  { id: 6, name: "カゴ落ちユーザー", type: "dynamic", memberCount: 23, lastUpdated: "2026-03-03" },
];

export default function SegmentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">セグメント</h1>
          <p className="text-sm text-muted-foreground">
            属性 + 行動条件でターゲットグループを作成
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> 新規作成
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSegments.map((seg) => (
          <Card key={seg.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{seg.name}</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {seg.type === "dynamic" ? "動的" : "静的"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold">{seg.memberCount}</span>
                  <span className="text-xs text-muted-foreground">人</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    <Zap className="h-3 w-3 mr-1" /> 配信
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                最終更新: {seg.lastUpdated}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
