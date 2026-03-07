/**
 * LINE AIチャット — メインオーケストレータ
 *
 * Webhookから呼び出される中心的な処理:
 * 1. LINE UID → 顧客コンテキスト解決
 * 2. 動的システムプロンプト生成
 * 3. Claude AI 呼び出し
 * 4. レスポンスのバリデーション & フォールバック
 */

import { callClaude } from "./client";
import type { ConversationMessage } from "./client";
import { buildSystemPrompt } from "./system-prompt";
import { getCustomerByLineUid, getChatMessages } from "@/lib/actions/chat";
import type {
  AiChatResponse,
  InquiryCategory,
  EscalationReason,
  ClaudeRawResponse,
} from "./types";

/** マルチターン会話で渡す最大メッセージ数（customer + assistant ペア） */
const MAX_CONVERSATION_HISTORY = 10;

/** 有効なカテゴリ一覧 */
const VALID_CATEGORIES: InquiryCategory[] = [
  "order_change",
  "product_price",
  "delivery_shipping",
  "quality_complaint",
  "account_system",
  "payment_billing",
  "registration",
  "other",
];

/** 有効なエスカレーション理由 */
const VALID_ESCALATION_REASONS: EscalationReason[] = [
  "quality_complaint",
  "payment_issue",
  "angry_customer",
  "complex_request",
  "cannot_resolve",
  "explicit_human_request",
];

/**
 * AIレスポンスをバリデーションし、安全な型に変換
 */
function validateAiResponse(raw: ClaudeRawResponse): {
  category: InquiryCategory;
  needsHumanSupport: boolean;
  escalationReason?: EscalationReason;
  confidence: number;
} {
  const category = VALID_CATEGORIES.includes(raw.category as InquiryCategory)
    ? (raw.category as InquiryCategory)
    : "other";

  const escalationReason =
    raw.escalationReason &&
    VALID_ESCALATION_REASONS.includes(raw.escalationReason as EscalationReason)
      ? (raw.escalationReason as EscalationReason)
      : undefined;

  // 品質クレーム・支払い系は強制エスカレーション
  const forceEscalate =
    category === "quality_complaint" || category === "payment_billing";

  const needsHumanSupport = forceEscalate || Boolean(raw.needsHumanSupport);

  const confidence = Math.max(0, Math.min(1, Number(raw.confidence) || 0));

  return {
    category,
    needsHumanSupport,
    escalationReason: needsHumanSupport ? escalationReason : undefined,
    confidence,
  };
}

/**
 * AIエラー時のフォールバック応答
 */
function createFallbackResponse(error: unknown): AiChatResponse {
  console.error("[AI Chat] Claude API error:", error);
  return {
    reply:
      "申し訳ございません。ただいまシステムに問題が発生しております。担当者より改めてご連絡いたします。少々お待ちくださいませ。",
    category: "other",
    needsHumanSupport: true,
    escalationReason: "cannot_resolve",
    confidence: 0,
    tokensUsed: { input: 0, output: 0 },
  };
}

/**
 * セッション内の過去メッセージから会話履歴を構築
 * customer → "user", assistant → "assistant" にマッピング
 * systemメッセージはスキップ（Claudeの会話形式に含めない）
 */
async function buildConversationHistory(
  sessionId: string
): Promise<ConversationMessage[]> {
  const messages = await getChatMessages(sessionId);

  // system メッセージを除外し、最新メッセージ（今回の customer メッセージ）も除外
  // ※ 今回のメッセージは callClaude の userMessage として別途渡すため
  const relevantMessages = messages
    .filter((m) => m.role === "customer" || m.role === "assistant")
    .slice(-(MAX_CONVERSATION_HISTORY + 1)) // +1 は今回のメッセージ分
    .slice(0, -1); // 最後（最新の customer メッセージ）を除去

  return relevantMessages.map((m) => ({
    role: m.role === "customer" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));
}

/**
 * インバウンドメッセージを処理し、AI応答を生成
 *
 * @param lineUid - LINE UID（SocialiteProvider.provider_id）
 * @param messageText - お客様のメッセージ
 * @param sessionId - セッションID（マルチターン会話用、省略時は単発応答）
 * @returns AI応答（返信テキスト、カテゴリ、エスカレーション判定、トークン使用量）
 */
export async function handleInboundMessage(
  lineUid: string,
  messageText: string,
  sessionId?: string
): Promise<AiChatResponse> {
  try {
    // Step 1: 顧客コンテキスト解決
    const customer = await getCustomerByLineUid(lineUid);

    // Step 2: 動的システムプロンプト生成
    const systemPrompt = buildSystemPrompt(customer);

    // Step 3: 会話履歴を構築（セッションIDが渡された場合）
    const conversationHistory = sessionId
      ? await buildConversationHistory(sessionId)
      : undefined;

    // Step 4: Claude AI 呼び出し（会話履歴 + 最新メッセージ）
    const { data, inputTokens, outputTokens } =
      await callClaude<ClaudeRawResponse>(
        systemPrompt,
        messageText,
        undefined,
        conversationHistory
      );

    // Step 5: レスポンスバリデーション
    const validated = validateAiResponse(data);

    return {
      reply: data.reply || "申し訳ございません。もう一度お伺いしてもよろしいでしょうか？",
      category: validated.category,
      needsHumanSupport: validated.needsHumanSupport,
      escalationReason: validated.escalationReason,
      confidence: validated.confidence,
      tokensUsed: { input: inputTokens, output: outputTokens },
    };
  } catch (error) {
    return createFallbackResponse(error);
  }
}
