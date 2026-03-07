"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  Loader2,
  Zap,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { INQUIRY_CATEGORY_LABELS } from "@/lib/ai/types";
import {
  getChatSession,
  getChatMessages,
  resolveSession,
  closeSession,
  reopenSession,
} from "@/lib/actions/chat";
import type { ChatSession, ChatMessage } from "@/lib/ai/types";
import { toast } from "sonner";

// --- ステータスバッジ ---

function StatusBadge({ status }: { status: ChatSession["status"] }) {
  const config = {
    active: {
      label: "対応中",
      className: "bg-blue-100 text-blue-700",
      icon: Clock,
    },
    escalated: {
      label: "要エスカレーション",
      className: "bg-red-100 text-red-700",
      icon: AlertTriangle,
    },
    resolved: {
      label: "解決済み",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    closed: {
      label: "クローズ",
      className: "bg-gray-100 text-gray-700",
      icon: CheckCircle,
    },
  };
  const c = config[status];
  return (
    <Badge variant="secondary" className={`text-xs ${c.className}`}>
      <c.icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  );
}

// --- メッセージバブル ---

function MessageBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.role === "customer";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-1.5 max-w-[80%]">
          <Info className="h-3.5 w-3.5 shrink-0" />
          {message.content}
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex gap-2 ${isCustomer ? "justify-start" : "justify-end"}`}
    >
      {/* アバター（顧客側） */}
      {isCustomer && (
        <div className="rounded-full bg-muted p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* メッセージ本体 */}
      <div className={`max-w-[75%] ${isCustomer ? "" : "order-first"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isCustomer
              ? "bg-muted text-foreground rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          }`}
        >
          {message.content}
        </div>

        {/* AI メタデータ */}
        {message.role === "assistant" && (
          <div className="flex items-center gap-2 mt-1 justify-end">
            {message.category && (
              <Badge variant="outline" className="text-[9px] h-4">
                {INQUIRY_CATEGORY_LABELS[message.category]}
              </Badge>
            )}
            {message.confidence !== null && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Zap className="h-2.5 w-2.5" />
                {(message.confidence * 100).toFixed(0)}%
              </span>
            )}
            {message.inputTokens !== null && message.outputTokens !== null && (
              <span className="text-[10px] text-muted-foreground">
                {message.inputTokens + message.outputTokens}tk
              </span>
            )}
            {message.needsHumanSupport && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
          </div>
        )}

        {/* タイムスタンプ */}
        <p
          className={`text-[10px] text-muted-foreground mt-0.5 ${
            isCustomer ? "text-left" : "text-right"
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>

      {/* アバター（AI側） */}
      {!isCustomer && (
        <div className="rounded-full bg-primary/10 p-2 h-8 w-8 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}

// --- メインページ ---

export default function ChatDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    const [sessionData, messagesData] = await Promise.all([
      getChatSession(sessionId),
      getChatMessages(sessionId),
    ]);

    if (!sessionData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setSession(sessionData);
    setMessages(messagesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleStatusChange = async (
    action: "resolve" | "close" | "reopen"
  ) => {
    setUpdating(true);
    const actionMap = { resolve: resolveSession, close: closeSession, reopen: reopenSession };
    const labelMap = { resolve: "解決済み", close: "クローズ", reopen: "対応中" };
    const result = await actionMap[action](sessionId);
    if (result.success) {
      toast.success(`ステータスを「${labelMap[action]}」に変更しました`);
      await fetchData();
    } else {
      toast.error("ステータス変更に失敗しました");
    }
    setUpdating(false);
  };

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

  if (notFound || !session) {
    return (
      <div className="p-6 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          一覧に戻る
        </Button>
        <div className="text-center py-12">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold">セッションが見つかりません</h2>
          <p className="text-sm text-muted-foreground mt-1">
            指定されたセッションID &quot;{sessionId}&quot; は存在しないか削除されています。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              {session.customerName ?? "未特定の顧客"}
            </h1>
            <StatusBadge status={session.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {session.customerCode ?? session.lineUid.substring(0, 12) + "..."} ·
            開始: {formatDate(session.startedAt)}
          </p>
        </div>
        {/* ステータス変更ボタン */}
        <div className="flex gap-2">
          {(session.status === "active" || session.status === "escalated") && (
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => handleStatusChange("resolve")}
              className="text-green-700 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              解決済み
            </Button>
          )}
          {session.status === "escalated" && (
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => handleStatusChange("reopen")}
              className="text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              対応中に戻す
            </Button>
          )}
          {session.status === "resolved" && (
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => handleStatusChange("close")}
              className="text-gray-700 border-gray-200 hover:bg-gray-50"
            >
              クローズ
            </Button>
          )}
        </div>
      </div>

      {/* セッション情報 */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">カテゴリ</p>
              <p className="font-medium">
                {session.inquiryCategory
                  ? INQUIRY_CATEGORY_LABELS[session.inquiryCategory]
                  : "未分類"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">エスカレーション</p>
              <p className="font-medium flex items-center gap-1">
                {session.needsHumanSupport ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    必要
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    不要
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">メッセージ数</p>
              <p className="font-medium">{messages.length}件</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">LINE UID</p>
              <p className="font-medium font-mono text-xs">
                {session.lineUid.substring(0, 16)}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* エスカレーション警告 */}
      {session.needsHumanSupport && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              人間による対応が必要です
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {session.escalationReason === "quality_complaint" && "品質に関するクレームのため、担当者の直接対応が必要です。"}
              {session.escalationReason === "payment_issue" && "支払い・請求に関する問題のため、経理担当の確認が必要です。"}
              {session.escalationReason === "angry_customer" && "お客様が不満を感じておられます。早急な対応をお願いします。"}
              {session.escalationReason === "complex_request" && "AIでは対応が困難な複雑なリクエストです。"}
              {session.escalationReason === "cannot_resolve" && "AIが解決できなかった問題です。"}
              {session.escalationReason === "explicit_human_request" && "お客様から人間のスタッフとの会話を希望されています。"}
              {!session.escalationReason && "担当者が確認してください。"}
            </p>
          </div>
        </div>
      )}

      {/* メッセージスレッド */}
      <Card>
        <CardContent className="p-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              メッセージがありません
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
