"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Clock, Users, Power, PowerOff } from "lucide-react";

const mockRules = [
  { id: 1, name: "離反リスク通知", trigger: "30日間注文なし", channel: "LINE", delay: "即時", cooldown: 14, isActive: true, executionCount: 156 },
  { id: 2, name: "カゴ落ちリマインド", trigger: "カート放置24時間", channel: "LINE", delay: "24時間後", cooldown: 3, isActive: true, executionCount: 89 },
  { id: 3, name: "新規フォローアップ", trigger: "取引開始後3日", channel: "メール", delay: "3日後", cooldown: 30, isActive: true, executionCount: 42 },
  { id: 4, name: "高単価顧客ケア", trigger: "注文頻度30%低下", channel: "LINE+メール", delay: "即時", cooldown: 14, isActive: false, executionCount: 0 },
  { id: 5, name: "再訪促進", trigger: "60日間ログインなし", channel: "メール", delay: "即時", cooldown: 30, isActive: false, executionCount: 0 },
];

export default function AutomationPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">自動配信ルール</h1>
          <p className="text-sm text-muted-foreground">
            トリガー条件に基づく自動配信を設定
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> 新規ルール作成
        </Button>
      </div>

      <div className="space-y-3">
        {mockRules.map((rule) => (
          <Card key={rule.id} className={!rule.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${rule.isActive ? "bg-green-100" : "bg-gray-100"}`}>
                    <Zap className={`h-4 w-4 ${rule.isActive ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{rule.name}</h3>
                      <Badge variant={rule.isActive ? "default" : "secondary"} className="text-[10px]">
                        {rule.isActive ? "有効" : "無効"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {rule.trigger}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {rule.delay}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${rule.channel.includes("LINE") ? "border-green-300" : "border-blue-300"}`}>
                        {rule.channel}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{rule.executionCount}回</p>
                    <p className="text-xs text-muted-foreground">累計実行</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">クールダウン</p>
                    <p className="text-sm">{rule.cooldown}日</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {rule.isActive ? <Power className="h-4 w-4 text-green-500" /> : <PowerOff className="h-4 w-4 text-gray-400" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
