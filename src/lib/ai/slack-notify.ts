/**
 * Slack通知モジュール
 *
 * エスカレーション発生時にSlack Incoming Webhookで通知を送信する。
 * Block Kit形式でリッチなメッセージを構築。
 *
 * 環境変数:
 * - SLACK_ESCALATION_WEBHOOK_URL: Slack Incoming Webhook URL
 *   （未設定の場合は ESCALATION_WEBHOOK_URL にフォールバック）
 */

import type {
  ChatSession,
  AiChatResponse,
  InquiryCategory,
  EscalationReason,
} from "./types";
import { INQUIRY_CATEGORY_LABELS } from "./types";

// ============================================================
// Slack通知結果
// ============================================================

export interface SlackNotifyResult {
  sent: boolean;
  success?: boolean;
  error?: string;
}

// ============================================================
// カテゴリ別絵文字マッピング
// ============================================================

const CATEGORY_EMOJI: Record<InquiryCategory, string> = {
  quality_complaint: "🔴",
  payment_billing: "🟠",
  order_change: "🟡",
  delivery_shipping: "🚚",
  account_system: "🔧",
  registration: "📝",
  product_price: "💰",
  other: "📋",
};

// ============================================================
// エスカレーション理由ラベル
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
// 緊急度判定
// ============================================================

type UrgencyLevel = "critical" | "high" | "normal";

function getUrgencyLevel(
  category: InquiryCategory,
  reason?: EscalationReason
): UrgencyLevel {
  // 品質クレーム + 怒っている顧客 → critical
  if (category === "quality_complaint" && reason === "angry_customer") {
    return "critical";
  }
  // 品質クレーム or 怒っている顧客 → high
  if (category === "quality_complaint" || reason === "angry_customer") {
    return "high";
  }
  // 支払い関連 → high
  if (category === "payment_billing") {
    return "high";
  }
  return "normal";
}

const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  critical: "🚨 緊急",
  high: "⚠️ 要対応",
  normal: "📋 確認",
};

// ============================================================
// Slack Block Kit メッセージ構築
// ============================================================

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: Array<{
    type: string;
    text: string;
  }>;
}

function buildSlackBlocks(
  session: ChatSession,
  aiResponse: AiChatResponse,
  customerMessage?: string
): SlackBlock[] {
  const emoji = CATEGORY_EMOJI[aiResponse.category];
  const categoryLabel = INQUIRY_CATEGORY_LABELS[aiResponse.category];
  const reasonLabel = aiResponse.escalationReason
    ? ESCALATION_REASON_LABELS[aiResponse.escalationReason]
    : "要対応";
  const urgency = getUrgencyLevel(
    aiResponse.category,
    aiResponse.escalationReason
  );
  const urgencyLabel = URGENCY_LABELS[urgency];

  const blocks: SlackBlock[] = [
    // ヘッダー
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${urgencyLabel} LINE AI エスカレーション`,
        emoji: true,
      },
    },
    // 区切り線
    { type: "divider" },
    // 顧客情報 + カテゴリ
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*顧客:*\n${session.customerName ?? "不明"}${session.customerCode ? ` (${session.customerCode})` : ""}`,
        },
        {
          type: "mrkdwn",
          text: `*カテゴリ:*\n${emoji} ${categoryLabel}`,
        },
        {
          type: "mrkdwn",
          text: `*理由:*\n${reasonLabel}`,
        },
        {
          type: "mrkdwn",
          text: `*AI確信度:*\n${Math.round(aiResponse.confidence * 100)}%`,
        },
      ],
    },
  ];

  // 顧客メッセージ（あれば）
  if (customerMessage) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*顧客メッセージ:*\n> ${customerMessage.substring(0, 300)}${customerMessage.length > 300 ? "..." : ""}`,
      },
    });
  }

  // AI回答
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*AI回答:*\n> ${aiResponse.reply.substring(0, 300)}${aiResponse.reply.length > 300 ? "..." : ""}`,
    },
  });

  // フッター
  blocks.push(
    { type: "divider" },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📅 ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} | セッション: ${session.id} | rakushiire-crm AIチャット`,
        },
      ],
    }
  );

  return blocks;
}

// ============================================================
// Slack通知送信
// ============================================================

/**
 * エスカレーション情報をSlackに通知
 *
 * 優先順位:
 * 1. SLACK_ESCALATION_WEBHOOK_URL（Slack専用）
 * 2. ESCALATION_WEBHOOK_URL（汎用 → Slack Block Kit形式で送信）
 *
 * @param session - チャットセッション
 * @param aiResponse - AI応答結果
 * @param customerMessage - 顧客の元メッセージ（任意）
 */
export async function sendSlackEscalationNotify(
  session: ChatSession,
  aiResponse: AiChatResponse,
  customerMessage?: string
): Promise<SlackNotifyResult> {
  const webhookUrl =
    process.env.SLACK_ESCALATION_WEBHOOK_URL ??
    process.env.ESCALATION_WEBHOOK_URL;

  if (!webhookUrl) {
    return { sent: false };
  }

  const blocks = buildSlackBlocks(session, aiResponse, customerMessage);

  // フォールバックテキスト（通知プレビュー用）
  const categoryLabel = INQUIRY_CATEGORY_LABELS[aiResponse.category];
  const fallbackText = `⚠️ エスカレーション: ${session.customerName ?? "不明"} — ${categoryLabel}`;

  const payload = {
    text: fallbackText,
    blocks,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      console.log(`[Slack] エスカレーション通知送信成功`);
      return { sent: true, success: true };
    }

    const errorText = await response.text().catch(() => "");
    console.error(
      `[Slack] 通知送信失敗 (${response.status}): ${errorText}`
    );
    return {
      sent: true,
      success: false,
      error: `HTTP ${response.status}: ${errorText}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Slack] 通知送信エラー:`, message);
    return { sent: true, success: false, error: message };
  }
}
