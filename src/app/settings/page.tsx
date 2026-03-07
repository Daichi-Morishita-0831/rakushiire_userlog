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
  Bot,
  Shield,
  Zap,
  AlertTriangle,
  Bell,
  BarChart3,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { getLinyConnectionStatus, testLinyConnectionAction } from "@/lib/actions/liny";
import { getAiChatStatus, getTokenUsageStatsAction } from "@/lib/actions/chat";

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

type AiChatStatusType = {
  configured: boolean;
  anthropicKeySet: boolean;
  webhookSecretSet: boolean;
  escalationWebhookSet: boolean;
  escalationWebhookUrl: string | null;
  webhookUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  monthlyTokenBudget: number;
  categories: string[];
};

export default function SettingsPage() {
  const [linyStatus, setLinyStatus] = useState<ConnectionStatus | null>(null);
  const [aiChatStatus, setAiChatStatus] = useState<AiChatStatusType | null>(null);
  const [tokenStats, setTokenStats] = useState<{
    today: { requests: number; totalTokens: number };
    month: { requests: number; totalTokens: number };
    budget: { monthlyLimit: number; usedPercentage: number; remaining: number; alert: "none" | "warning" | "exceeded" };
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  useEffect(() => {
    getLinyConnectionStatus().then(setLinyStatus);
    getAiChatStatus().then(setAiChatStatus);
    getTokenUsageStatsAction().then(setTokenStats);
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

      {/* AIチャット設定 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Bot className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-base">LINE AIチャット</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  LINE顧客メッセージへのAI自動応答機能
                </p>
              </div>
            </div>
            {aiChatStatus && (
              <Badge
                variant="outline"
                className={
                  aiChatStatus.configured
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }
              >
                {aiChatStatus.configured ? "有効" : "APIキー未設定"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiChatStatus === null ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              読み込み中...
            </div>
          ) : (
            <>
              {/* 環境変数ステータス */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">ANTHROPIC_API_KEY</span>
                  </div>
                  {aiChatStatus.anthropicKeySet ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs">設定済み</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-xs">未設定</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">LINY_WEBHOOK_SECRET</span>
                  </div>
                  {aiChatStatus.webhookSecretSet ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs">設定済み</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">未設定（dev時は署名検証スキップ）</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">ESCALATION_WEBHOOK_URL</span>
                  </div>
                  {aiChatStatus.escalationWebhookSet ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs">設定済み</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">未設定（エスカレーション通知なし）</span>
                    </div>
                  )}
                </div>
              </div>

              {/* モデル設定 */}
              <div>
                <p className="text-sm font-medium mb-2">モデル設定</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">モデル</p>
                    <p className="text-sm font-mono font-medium mt-0.5">{aiChatStatus.model}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="text-sm font-medium mt-0.5">{aiChatStatus.temperature}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Max Tokens</p>
                    <p className="text-sm font-medium mt-0.5">{aiChatStatus.maxTokens.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">月次トークン予算</p>
                    <p className="text-sm font-medium mt-0.5">{aiChatStatus.monthlyTokenBudget.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Webhookエンドポイント */}
              <div>
                <p className="text-sm font-medium mb-2">Webhookエンドポイント</p>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-mono">POST {aiChatStatus.webhookUrl}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Linyの「顧客メッセージ受信」Webhook先としてこのURLを設定してください
                  </p>
                </div>
              </div>

              {/* 対応カテゴリ */}
              <div>
                <p className="text-sm font-medium mb-2">対応カテゴリ（7分類）</p>
                <div className="flex flex-wrap gap-1.5">
                  {aiChatStatus.categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className={`text-xs ${
                        cat.includes("エスカレ")
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* エスカレーション設定 */}
              <div>
                <p className="text-sm font-medium mb-2">エスカレーション設定</p>
                <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">自動エスカレーション</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-start gap-2 p-2 rounded border bg-card">
                      <Tag className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Linyタグ自動付与</p>
                        <p className="text-xs text-muted-foreground">「AI_要対応」+ カテゴリ別タグ</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded border bg-card">
                      <Send className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">外部Webhook通知</p>
                        <p className="text-xs text-muted-foreground">
                          {aiChatStatus.escalationWebhookSet
                            ? "設定済み（通知先に送信）"
                            : "未設定（ログのみ）"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* トークン使用量 */}
              <div>
                <p className="text-sm font-medium mb-2">トークン使用量</p>
                {tokenStats ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">今日</p>
                        </div>
                        <p className="text-lg font-bold">{tokenStats.today.totalTokens.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{tokenStats.today.requests}リクエスト</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">今月</p>
                        </div>
                        <p className="text-lg font-bold">{tokenStats.month.totalTokens.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{tokenStats.month.requests}リクエスト</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">予算消化率</p>
                        </div>
                        <p className={`text-lg font-bold ${
                          tokenStats.budget.alert === "exceeded"
                            ? "text-red-600"
                            : tokenStats.budget.alert === "warning"
                            ? "text-amber-600"
                            : ""
                        }`}>
                          {tokenStats.budget.usedPercentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          残り {tokenStats.budget.remaining.toLocaleString()} トークン
                        </p>
                      </div>
                    </div>
                    {/* 予算プログレスバー */}
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">月次予算</span>
                        <span className="text-xs font-mono">
                          {tokenStats.month.totalTokens.toLocaleString()} / {tokenStats.budget.monthlyLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            tokenStats.budget.alert === "exceeded"
                              ? "bg-red-500"
                              : tokenStats.budget.alert === "warning"
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, tokenStats.budget.usedPercentage)}%` }}
                        />
                      </div>
                      {tokenStats.budget.alert !== "none" && (
                        <div className={`flex items-center gap-1 mt-1.5 ${
                          tokenStats.budget.alert === "exceeded" ? "text-red-600" : "text-amber-600"
                        }`}>
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {tokenStats.budget.alert === "exceeded"
                              ? "月次予算を超過しています"
                              : "月次予算の80%を超えています"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    読み込み中...
                  </div>
                )}
              </div>

              {/* 不足環境変数の案内 */}
              {!aiChatStatus.configured && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    AIチャットを有効にするには、環境変数{" "}
                    <code className="bg-amber-100 px-1 rounded text-xs">ANTHROPIC_API_KEY</code>{" "}
                    を設定してください。
                  </p>
                </div>
              )}
            </>
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
