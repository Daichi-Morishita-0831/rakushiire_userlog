/**
 * エスカレーション処理モジュール
 *
 * AI応答で needsHumanSupport=true と判定された場合に実行:
 * 1. Liny タグ「要対応」+ カテゴリ別タグを自動付与
 * 2. 外部Webhook通知（vegekul-support連携用、設定時のみ）
 * 3. システムメッセージをチャットスレッドに追加
 */

import { sendLinyRequest } from "@/lib/liny";
import { saveChatMessage, updateSessionStatus } from "@/lib/actions/chat";
import { sendSlackEscalationNotify } from "./slack-notify";
import type {
  ChatSession,
  AiChatResponse,
  InquiryCategory,
  EscalationReason,
} from "./types";
import { INQUIRY_CATEGORY_LABELS } from "./types";

// ============================================================
// エスカレーション理由の日本語ラベル
// ============================================================

const ESCALATION_REASON_LABELS: Record<EscalationReason, string> = {
  quality_complaint: "品質クレーム",
  payment_issue: "支払い・請求の問題",
  angry_customer: "お客様の不満",
  complex_request: "複雑なリクエスト",
  cannot_resolve: "AI解決不可",
  explicit_human_request: "人間対応希望",
};

// ============================================================
// カテゴリ → Linyタグ名マッピング
// ============================================================

const CATEGORY_TAG_MAP: Partial<Record<InquiryCategory, string>> = {
  quality_complaint: "AI_品質クレーム",
  payment_billing: "AI_請求確認",
  order_change: "AI_注文変更",
  delivery_shipping: "AI_配送問題",
  account_system: "AI_アカウント",
  registration: "AI_新規登録",
  product_price: "AI_商品問合せ",
  other: "AI_その他",
};

// ============================================================
// エスカレーション結果
// ============================================================

export interface EscalationResult {
  /** エスカレーション処理が実行されたか */
  escalated: boolean;
  /** Linyタグ付与結果 */
  linyTagResult: {
    success: boolean;
    tagsAdded: string[];
    error?: string;
  };
  /** 外部Webhook通知結果 */
  webhookResult: {
    sent: boolean;
    success?: boolean;
    error?: string;
  };
  /** Slack通知結果 */
  slackResult: {
    sent: boolean;
    success?: boolean;
    error?: string;
  };
  /** チャットスレッドに追加されたシステムメッセージ */
  systemMessageId: string | null;
}

// ============================================================
// メイン処理
// ============================================================

/**
 * エスカレーション処理を実行
 *
 * @param session - 現在のチャットセッション
 * @param aiResponse - AI応答結果
 * @param lineUid - LINE UID（Linyタグ付与用）
 * @param customerMessage - 顧客の元メッセージ（Slack通知に含める）
 */
export async function handleEscalation(
  session: ChatSession,
  aiResponse: AiChatResponse,
  lineUid: string,
  customerMessage?: string
): Promise<EscalationResult> {
  if (!aiResponse.needsHumanSupport) {
    return {
      escalated: false,
      linyTagResult: { success: true, tagsAdded: [] },
      webhookResult: { sent: false },
      slackResult: { sent: false },
      systemMessageId: null,
    };
  }

  console.log(
    `[Escalation] セッション ${session.id}: category=${aiResponse.category}, reason=${aiResponse.escalationReason}`
  );

  // 並行実行: Linyタグ付与 + 外部Webhook + Slack通知
  const [linyTagResult, webhookResult, slackResult] = await Promise.all([
    addEscalationTags(lineUid, aiResponse.category),
    sendEscalationWebhook(session, aiResponse),
    sendSlackEscalationNotify(session, aiResponse, customerMessage),
  ]);

  // セッションステータス更新
  await updateSessionStatus(session.id, "escalated", {
    inquiryCategory: aiResponse.category,
    escalationReason: aiResponse.escalationReason ?? null,
  });

  // システムメッセージ追加
  const reasonLabel = aiResponse.escalationReason
    ? ESCALATION_REASON_LABELS[aiResponse.escalationReason]
    : "要対応";
  const categoryLabel = INQUIRY_CATEGORY_LABELS[aiResponse.category];

  const systemMessage = await saveChatMessage({
    sessionId: session.id,
    role: "system",
    content: `⚠️ エスカレーション: ${categoryLabel} — ${reasonLabel}。担当者への引き継ぎが必要です。`,
    category: aiResponse.category,
    needsHumanSupport: true,
  });

  console.log(
    `[Escalation] 完了: linyTags=${linyTagResult.success}, webhook=${webhookResult.sent ? webhookResult.success : "skip"}, slack=${slackResult.sent ? slackResult.success : "skip"}`
  );

  return {
    escalated: true,
    linyTagResult,
    webhookResult,
    slackResult,
    systemMessageId: systemMessage.id,
  };
}

// ============================================================
// Liny タグ付与
// ============================================================

/**
 * エスカレーション時にLinyタグを自動付与
 * - 共通タグ: 「AI_要対応」
 * - カテゴリタグ: 「AI_品質クレーム」等
 */
async function addEscalationTags(
  lineUid: string,
  category: InquiryCategory
): Promise<EscalationResult["linyTagResult"]> {
  const tags: string[] = ["AI_要対応"];

  const categoryTag = CATEGORY_TAG_MAP[category];
  if (categoryTag) {
    tags.push(categoryTag);
  }

  // 各タグを付与（Liny API はタグ1つずつ送信）
  const errors: string[] = [];
  const addedTags: string[] = [];

  for (const tag of tags) {
    const result = await sendLinyRequest({
      uid: lineUid,
      action_type: "tag_add",
      tag_name: tag,
    });

    if (result.success) {
      addedTags.push(tag);
    } else {
      errors.push(`${tag}: ${result.error}`);
      console.warn(`[Escalation] Linyタグ付与失敗 (${tag}):`, result.error);
    }
  }

  return {
    success: errors.length === 0,
    tagsAdded: addedTags,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

// ============================================================
// 外部Webhook通知（vegekul-support連携用）
// ============================================================

/**
 * エスカレーション情報を外部Webhookに通知
 *
 * 環境変数 ESCALATION_WEBHOOK_URL が設定されている場合のみ送信。
 * vegekul-support や Slack 等の外部サービスに連携可能。
 */
async function sendEscalationWebhook(
  session: ChatSession,
  aiResponse: AiChatResponse
): Promise<EscalationResult["webhookResult"]> {
  const webhookUrl = process.env.ESCALATION_WEBHOOK_URL;

  if (!webhookUrl) {
    return { sent: false };
  }

  const payload = {
    event: "chat_escalation",
    timestamp: new Date().toISOString(),
    session: {
      id: session.id,
      lineUid: session.lineUid,
      customerCode: session.customerCode,
      customerName: session.customerName,
      channel: session.channel,
    },
    escalation: {
      category: aiResponse.category,
      categoryLabel: INQUIRY_CATEGORY_LABELS[aiResponse.category],
      reason: aiResponse.escalationReason,
      reasonLabel: aiResponse.escalationReason
        ? ESCALATION_REASON_LABELS[aiResponse.escalationReason]
        : null,
      confidence: aiResponse.confidence,
      aiReply: aiResponse.reply,
    },
    meta: {
      source: "rakushiire-crm",
      webhookVersion: "1.0",
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Source": "rakushiire-crm",
        "X-Event-Type": "chat_escalation",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // 5秒タイムアウト
    });

    if (response.ok) {
      console.log(`[Escalation] Webhook通知成功: ${webhookUrl}`);
      return { sent: true, success: true };
    }

    const errorText = await response.text().catch(() => "");
    console.error(
      `[Escalation] Webhook通知失敗 (${response.status}): ${errorText}`
    );
    return {
      sent: true,
      success: false,
      error: `HTTP ${response.status}: ${errorText}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Escalation] Webhook通知エラー:`, message);
    return { sent: true, success: false, error: message };
  }
}
