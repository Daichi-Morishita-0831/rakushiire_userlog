"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Tag,
  Send,
  BookOpen,
  UserCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { getLinyConnectionStatus, testLinyConnectionAction } from "@/lib/actions/liny";

type ConnectionStatus = {
  configured: boolean;
  endpointUrl?: string;
  tokenPreview?: string;
};

function LinyActionCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="rounded-full bg-green-100 p-2 shrink-0">
        <Icon className="h-4 w-4 text-green-700" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [linyStatus, setLinyStatus] = useState<ConnectionStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  useEffect(() => {
    getLinyConnectionStatus().then(setLinyStatus);
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testLinyConnectionAction();
    setTestResult(result);
    setTesting(false);
    if (result.success) {
      toast.success("Liny APIへの接続設定が正常です");
    } else {
      toast.error(`接続テスト失敗: ${result.error}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-sm text-muted-foreground">
          外部サービス連携の設定・管理
        </p>
      </div>

      {/* Liny API連携 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#00B900]/10 p-2">
                <MessageSquare className="h-5 w-5 text-[#00B900]" />
              </div>
              <div>
                <CardTitle className="text-base">Liny API連携</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  LINE配信ツール Liny との連携設定
                </p>
              </div>
            </div>
            {linyStatus && (
              <Badge
                variant="outline"
                className={
                  linyStatus.configured
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {linyStatus.configured ? "設定済み" : "未設定"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {linyStatus === null ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              読み込み中...
            </div>
          ) : linyStatus.configured ? (
            <>
              {/* 接続情報 */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">エンドポイントURL</p>
                  <p className="text-sm font-mono mt-1 break-all">{linyStatus.endpointUrl}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">アクセストークン</p>
                  <p className="text-sm font-mono mt-1">{linyStatus.tokenPreview}</p>
                </div>
              </div>

              {/* 接続テスト */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  接続テスト
                </Button>
                {testResult && (
                  <div className="flex items-center gap-1.5">
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">正常</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">{testResult.error}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 利用可能アクション */}
              <div>
                <p className="text-sm font-medium mb-2">利用可能なアクション</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <LinyActionCard
                    icon={Tag}
                    title="タグの付与・削除"
                    description="CRMセグメント情報をLinyタグに反映"
                  />
                  <LinyActionCard
                    icon={Send}
                    title="メッセージ送信"
                    description="CRM配信ルール発火時にLINEメッセージを送信"
                  />
                  <LinyActionCard
                    icon={BookOpen}
                    title="シナリオ起動"
                    description="離反検知時などにLinyシナリオを自動起動"
                  />
                  <LinyActionCard
                    icon={UserCircle}
                    title="友だち情報欄更新"
                    description="CRMの顧客属性をLinyの友だち情報に同期"
                  />
                </div>
              </div>

              {/* Liny管理画面リンク */}
              <div className="pt-2 border-t">
                <a
                  href="https://manager.liny.jp/line/open-api/services/general_hszWdxQkOv9N/endpoints"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Liny管理画面でエンドポイント設定を確認
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Liny API未設定</p>
              <p className="text-xs text-muted-foreground mt-1">
                環境変数 <code className="bg-muted px-1 rounded">LINY_ENDPOINT_URL</code> と{" "}
                <code className="bg-muted px-1 rounded">LINY_API_TOKEN</code> を設定してください
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* その他の連携（将来用） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="opacity-60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">メール配信（AWS SES）</p>
                <Badge variant="outline" className="text-[10px] mt-1">PDM確認中</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">SMS配信</p>
                <Badge variant="outline" className="text-[10px] mt-1">ベンダー未選定</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
