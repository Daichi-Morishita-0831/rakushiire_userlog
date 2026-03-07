/**
 * LINE AIチャット — 型定義
 *
 * Slack分析結果（7カテゴリ）に基づく問い合わせ分類と
 * AI応答・チャットセッション・メッセージの型を定義。
 */

// --- 問い合わせカテゴリ（Slack分析結果に基づく7分類） ---

export type InquiryCategory =
  | "order_change"       // A: 注文・キャンセル・変更
  | "product_price"      // B: 商品・価格問い合わせ
  | "delivery_shipping"  // C: 配送・出荷
  | "quality_complaint"  // D: 品質クレーム → 全件エスカレーション
  | "account_system"     // E: アカウント・システム
  | "payment_billing"    // F: 支払い・請求 → 基本エスカレーション
  | "registration"       // G: 新規登録・オンボーディング
  | "other";             // その他

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
  order_change: "注文・変更",
  product_price: "商品・価格",
  delivery_shipping: "配送・出荷",
  quality_complaint: "品質クレーム",
  account_system: "アカウント",
  payment_billing: "支払い・請求",
  registration: "新規登録",
  other: "その他",
};

// --- エスカレーション理由 ---

export type EscalationReason =
  | "quality_complaint"
  | "payment_issue"
  | "angry_customer"
  | "complex_request"
  | "cannot_resolve"
  | "explicit_human_request";

// --- AI応答 ---

export interface AiChatResponse {
  /** お客様への返信テキスト */
  reply: string;
  /** 問い合わせカテゴリ */
  category: InquiryCategory;
  /** 人間対応が必要か */
  needsHumanSupport: boolean;
  /** エスカレーション理由 */
  escalationReason?: EscalationReason;
  /** AIの確信度 (0.0 - 1.0) */
  confidence: number;
  /** トークン使用量 */
  tokensUsed: {
    input: number;
    output: number;
  };
}

// --- 顧客コンテキスト（AIに渡す情報） ---

export interface CustomerContext {
  customerCode: string;
  customerName: string;
  shopCategory: string;
  status: string;
  crmStatus: string;
  salesPersonName: string;
  lastOrderDate: string | null;
  monthlyOrderAmount: number;
  monthlyOrderCount: number;
  recentOrders: Array<{
    orderNumber: string;
    deliveryDate: string;
    partnerName: string;
    productName: string;
    amount: number;
    status: string;
  }>;
}

// --- チャットセッション ---

export type ChatSessionStatus = "active" | "escalated" | "resolved" | "closed";

export interface ChatSession {
  id: string;
  lineUid: string;
  customerCode: string | null;
  customerName: string | null;
  channel: "line";
  status: ChatSessionStatus;
  inquiryCategory: InquiryCategory | null;
  needsHumanSupport: boolean;
  escalationReason: EscalationReason | null;
  startedAt: Date;
  endedAt: Date | null;
  messageCount: number;
}

// --- チャットメッセージ ---

export type ChatMessageRole = "customer" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  category: InquiryCategory | null;
  needsHumanSupport: boolean;
  confidence: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: Date;
}

// --- Claude API呼び出しオプション ---

export interface ClaudeOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// --- Claude API レスポンス（JSON抽出結果） ---

export interface ClaudeRawResponse {
  reply: string;
  category: string;
  needsHumanSupport: boolean;
  escalationReason: string | null;
  confidence: number;
}
