"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Mail, Phone } from "lucide-react";

export default function DeliveryPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">手動配信</h1>
        <p className="text-sm text-muted-foreground">
          LINE / メール / SMS の手動送信
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium mt-3">LINE配信</h3>
            <p className="text-xs text-muted-foreground mt-1">
              LINE連携済みユーザーに送信
            </p>
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
              配信可能: 342人
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mt-3">メール配信</h3>
            <p className="text-xs text-muted-foreground mt-1">
              メールアドレス登録済みユーザーに送信
            </p>
            <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">
              配信可能: 498人
            </Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mx-auto">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium mt-3">SMS配信</h3>
            <p className="text-xs text-muted-foreground mt-1">
              電話番号登録済みユーザーに送信
            </p>
            <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-500">
              SMS未導入（PDM確認中）
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">配信フロー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="font-medium">1</span> 対象を選ぶ
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="font-medium">2</span> チャネルを選ぶ
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="font-medium">3</span> メッセージ作成
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="font-medium">4</span> 確認
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2">
              <Send className="h-4 w-4" /> 送信
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            配信機能はPDM回答後（Liny API連携可否・SMS導入）に本実装予定
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
