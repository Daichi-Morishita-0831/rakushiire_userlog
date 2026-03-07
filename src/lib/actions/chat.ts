"use server";

/**
 * チャット Server Actions — セッション/メッセージのCRUD
 *
 * 既存の Server Actions パターン（customers.ts等）に準拠:
 * - "use server" ディレクティブ
 * - モック実装（Map ベースのインメモリストレージ）
 * - DB接続時は Prisma クエリにスワップ（TODO コメント付き）
 */

import { mockCustomers, mockOrders } from "@/lib/mock-data";
// import { prisma, isDbConnected } from "@/lib/prisma";
import type {
  CustomerContext,
  ChatSession,
  ChatSessionStatus,
  ChatMessage,
  InquiryCategory,
  EscalationReason,
} from "@/lib/ai/types";

// ============================================================
// インメモリモックストレージ（DB接続後は Prisma に置き換え）
// ============================================================

const mockSessions: Map<string, ChatSession> = new Map();
const mockMessages: Map<string, ChatMessage[]> = new Map();
let sessionIdCounter = 100;
let messageIdCounter = 100;
let seedInitialized = false;

/**
 * デモ用シードデータの初期化（遅延実行）
 * Webhook経由の実データが追加される前に、管理画面表示用のサンプルを投入
 */
function ensureSeedData() {
  if (seedInitialized) return;
  seedInitialized = true;

  const now = new Date();
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60 * 1000);

  // セッション1: 商品・価格の問い合わせ（対応中）
  const s1: ChatSession = {
    id: "seed_session_1",
    lineUid: "U1a2b3c4d5e",
    customerCode: "C-10001",
    customerName: "イタリアンバル ROSSO",
    channel: "line",
    status: "active",
    inquiryCategory: "product_price",
    needsHumanSupport: false,
    escalationReason: null,
    startedAt: ago(45),
    endedAt: null,
    messageCount: 4,
  };
  mockSessions.set(s1.id, s1);
  mockMessages.set(s1.id, [
    {
      id: "seed_msg_1", sessionId: s1.id, role: "customer",
      content: "こんにちは。トマトの在庫ありますか？",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(45),
    },
    {
      id: "seed_msg_2", sessionId: s1.id, role: "assistant",
      content: "イタリアンバル ROSSO様、こんにちは！お問い合わせありがとうございます。\n\nトマトは複数の取引先から取り扱いがございます。具体的な在庫状況はリアルタイムで変動するため、ECサイト（rakushiire.com）でご確認いただくのが最も正確です。\n\nご不明な点があればお気軽にお問い合わせください。",
      category: "product_price", needsHumanSupport: false, confidence: 0.85,
      inputTokens: 1250, outputTokens: 180, createdAt: ago(44),
    },
    {
      id: "seed_msg_3", sessionId: s1.id, role: "customer",
      content: "丸山精肉店さんの鶏もも肉の価格はいくらですか？",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(42),
    },
    {
      id: "seed_msg_4", sessionId: s1.id, role: "assistant",
      content: "ROSSO様、直近のご注文では丸山精肉店の「国産鶏もも肉 2kg」を¥3,200でご購入いただいております。\n\n最新の価格はECサイトでご確認いただけます。価格は仕入状況により変動する場合がございますので、ご了承ください。\n\n他にご質問はございますか？",
      category: "product_price", needsHumanSupport: false, confidence: 0.92,
      inputTokens: 1380, outputTokens: 165, createdAt: ago(41),
    },
  ]);

  // セッション2: 品質クレーム（エスカレーション済み）
  const s2: ChatSession = {
    id: "seed_session_2",
    lineUid: "U6f7g8h9i0",
    customerCode: "C-10002",
    customerName: "和食処 さくら",
    channel: "line",
    status: "escalated",
    inquiryCategory: "quality_complaint",
    needsHumanSupport: true,
    escalationReason: "quality_complaint",
    startedAt: ago(120),
    endedAt: null,
    messageCount: 3,
  };
  mockSessions.set(s2.id, s2);
  mockMessages.set(s2.id, [
    {
      id: "seed_msg_5", sessionId: s2.id, role: "customer",
      content: "届いたキャベツが傷んでいました。返品対応をお願いします。",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(120),
    },
    {
      id: "seed_msg_6", sessionId: s2.id, role: "assistant",
      content: "和食処 さくら様、ご不便をおかけして大変申し訳ございません。\n\n商品の品質に関する問題は、担当スタッフが直接対応させていただきます。すぐに担当者へ引き継ぎますので、少々お待ちください。\n\n改めて担当者よりご連絡差し上げます。",
      category: "quality_complaint", needsHumanSupport: true, confidence: 0.95,
      inputTokens: 1450, outputTokens: 150, createdAt: ago(119),
    },
    {
      id: "seed_msg_7", sessionId: s2.id, role: "system",
      content: "⚠️ エスカレーション: 品質クレーム — 担当者への引き継ぎが必要です",
      category: "quality_complaint", needsHumanSupport: true, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(119),
    },
  ]);

  // セッション3: 配送確認（解決済み）
  const s3: ChatSession = {
    id: "seed_session_3",
    lineUid: "U0j1k2l3m4",
    customerCode: "C-10003",
    customerName: "焼肉 炎",
    channel: "line",
    status: "resolved",
    inquiryCategory: "delivery_shipping",
    needsHumanSupport: false,
    escalationReason: null,
    startedAt: ago(1440),
    endedAt: ago(1410),
    messageCount: 6,
  };
  mockSessions.set(s3.id, s3);
  mockMessages.set(s3.id, [
    {
      id: "seed_msg_8", sessionId: s3.id, role: "customer",
      content: "明日の配送時間を確認したいです",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(1440),
    },
    {
      id: "seed_msg_9", sessionId: s3.id, role: "assistant",
      content: "焼肉 炎様、お問い合わせありがとうございます。\n\n配送時間は取引先によって異なります。ECサイトのご注文履歴から配送予定時間をご確認いただけます。\n\n具体的なご注文番号をお教えいただければ、より詳しくお調べいたします。",
      category: "delivery_shipping", needsHumanSupport: false, confidence: 0.78,
      inputTokens: 1200, outputTokens: 140, createdAt: ago(1439),
    },
    {
      id: "seed_msg_10", sessionId: s3.id, role: "customer",
      content: "注文番号は ORD-2026-0312 です",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(1435),
    },
    {
      id: "seed_msg_11", sessionId: s3.id, role: "assistant",
      content: "ありがとうございます。ORD-2026-0312の配送は明日（3月6日）午前中の予定です。\n\n配送状況に変更がある場合は、改めてご連絡いたします。他にご不明な点はございますか？",
      category: "delivery_shipping", needsHumanSupport: false, confidence: 0.88,
      inputTokens: 1350, outputTokens: 120, createdAt: ago(1434),
    },
    {
      id: "seed_msg_12", sessionId: s3.id, role: "customer",
      content: "大丈夫です。ありがとうございました！",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(1430),
    },
    {
      id: "seed_msg_13", sessionId: s3.id, role: "assistant",
      content: "焼肉 炎様、こちらこそありがとうございます！\n\n何かございましたらいつでもお気軽にお問い合わせください。今後ともラクシーレをよろしくお願いいたします。",
      category: "delivery_shipping", needsHumanSupport: false, confidence: 0.90,
      inputTokens: 1100, outputTokens: 95, createdAt: ago(1429),
    },
  ]);

  // セッション4: 請求確認（エスカレーション済み）
  const s4: ChatSession = {
    id: "seed_session_4",
    lineUid: "U5n6o7p8q9",
    customerCode: "C-10007",
    customerName: "カフェ GREEN LEAF",
    channel: "line",
    status: "escalated",
    inquiryCategory: "payment_billing",
    needsHumanSupport: true,
    escalationReason: "payment_issue",
    startedAt: ago(180),
    endedAt: null,
    messageCount: 2,
  };
  mockSessions.set(s4.id, s4);
  mockMessages.set(s4.id, [
    {
      id: "seed_msg_14", sessionId: s4.id, role: "customer",
      content: "先月の請求書について確認したいです。金額が合わないのですが。",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(180),
    },
    {
      id: "seed_msg_15", sessionId: s4.id, role: "assistant",
      content: "カフェ GREEN LEAF様、お問い合わせありがとうございます。\n\n請求金額に関するお問い合わせは、正確な確認のため担当スタッフが対応させていただきます。担当者に引き継ぎますので、少々お待ちください。\n\n営業担当の田中より改めてご連絡差し上げます。",
      category: "payment_billing", needsHumanSupport: true, confidence: 0.91,
      inputTokens: 1300, outputTokens: 155, createdAt: ago(179),
    },
  ]);

  // セッション5: 新規登録問い合わせ（対応中、未特定顧客）
  const s5: ChatSession = {
    id: "seed_session_5",
    lineUid: "Ur0s1t2u3v",
    customerCode: null,
    customerName: null,
    channel: "line",
    status: "active",
    inquiryCategory: "registration",
    needsHumanSupport: false,
    escalationReason: null,
    startedAt: ago(30),
    endedAt: null,
    messageCount: 3,
  };
  mockSessions.set(s5.id, s5);
  mockMessages.set(s5.id, [
    {
      id: "seed_msg_16", sessionId: s5.id, role: "customer",
      content: "新規で取引を始めたいのですが、どうすればいいですか？",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(30),
    },
    {
      id: "seed_msg_17", sessionId: s5.id, role: "assistant",
      content: "お問い合わせありがとうございます！ラクシーレでのお取引開始を検討いただき嬉しく思います。\n\n新規取引の流れは以下の通りです：\n\n1. ECサイト（rakushiire.com）で仮登録\n2. 弊社営業担当が審査・ご連絡\n3. 本登録完了後、すぐにご注文可能\n\n仮登録はECサイトから簡単にお手続きいただけます。ご不明な点があればお気軽にお声がけください！",
      category: "registration", needsHumanSupport: false, confidence: 0.88,
      inputTokens: 1150, outputTokens: 200, createdAt: ago(29),
    },
    {
      id: "seed_msg_18", sessionId: s5.id, role: "customer",
      content: "ありがとうございます。サイトから登録してみます。",
      category: null, needsHumanSupport: false, confidence: null,
      inputTokens: null, outputTokens: null, createdAt: ago(25),
    },
  ]);
}

// ============================================================
// 顧客データ解決
// ============================================================

/**
 * LINE UIDから顧客コンテキストを解決
 *
 * DB接続時:
 *   SocialiteProvider (provider="line", providerId=lineUid)
 *   → Account → AccountCustomer (isMainCustomer desc)
 *   → Customer + SmileOrder (直近5件)
 *
 * モック時:
 *   lineConnected=true の顧客から最初の1件を返す
 */
export async function getCustomerByLineUid(
  _lineUid: string
): Promise<CustomerContext | null> {
  // TODO: DB接続時は以下に切り替え（_lineUid → lineUid に変更）
  // if (isDbConnected) {
  //   const sp = await prisma.socialiteProvider.findFirst({
  //     where: { provider: "line", providerId: lineUid, deletedAt: null, isFriend: true },
  //     include: {
  //       account: {
  //         include: {
  //           accountCustomers: {
  //             where: { customer: { deletedAt: null } },
  //             include: { customer: true },
  //             orderBy: { isMainCustomer: "desc" },
  //           },
  //         },
  //       },
  //     },
  //   });
  //   if (!sp?.account?.accountCustomers?.[0]?.customer) return null;
  //   const c = sp.account.accountCustomers[0].customer;
  //   const orders = await prisma.smileOrder.findMany({
  //     where: { customerCode: c.customerCode, deletedAt: null },
  //     include: { businessPartner: true, orderItems: { include: { product: true } } },
  //     orderBy: { deliveryDate: "desc" },
  //     take: 5,
  //   });
  //   return {
  //     customerCode: c.customerCode,
  //     customerName: c.customerName1,
  //     shopCategory: c.shopCategory ?? "",
  //     status: c.status,
  //     crmStatus: calculateCrmStatus(c),
  //     salesPersonName: c.salesPersonName ?? "",
  //     lastOrderDate: orders[0]?.deliveryDate?.toISOString().split("T")[0] ?? null,
  //     monthlyOrderAmount: calculateMonthlyAmount(orders),
  //     monthlyOrderCount: calculateMonthlyCount(orders),
  //     recentOrders: orders.map(o => ({
  //       orderNumber: o.orderNumber,
  //       deliveryDate: o.deliveryDate.toISOString().split("T")[0],
  //       partnerName: o.businessPartner.name,
  //       productName: o.orderItems[0]?.productName ?? "",
  //       amount: o.amount ?? 0,
  //       status: o.status,
  //     })),
  //   };
  // }

  // モック: lineConnected=true の顧客から最初の1件
  const customer = mockCustomers.find((c) => c.lineConnected);
  if (!customer) return null;

  const orders = mockOrders
    .filter((o) => o.customerCode === customer.customerCode)
    .slice(0, 5);

  return {
    customerCode: customer.customerCode,
    customerName: customer.customerName1,
    shopCategory: customer.shopCategory,
    status: customer.status,
    crmStatus: customer.crmStatus,
    salesPersonName: customer.salesPersonName,
    lastOrderDate: customer.lastOrderDate,
    monthlyOrderAmount: customer.monthlyOrderAmount,
    monthlyOrderCount: customer.monthlyOrderCount,
    recentOrders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      deliveryDate: o.deliveryDate,
      partnerName: o.partnerName,
      productName: o.productName,
      amount: o.amount,
      status: o.status,
    })),
  };
}

// ============================================================
// セッション管理
// ============================================================

/** セッションウィンドウ: 30分 */
const SESSION_WINDOW_MS = 30 * 60 * 1000;

/**
 * チャットセッションを取得または作成
 * 同一UIDの直近アクティブセッション（30分以内）があればそれを返す
 */
export async function createOrGetChatSession(
  lineUid: string
): Promise<ChatSession> {
  // TODO: DB接続時
  // if (isDbConnected) {
  //   const existing = await prisma.chatSession.findFirst({
  //     where: {
  //       lineUid,
  //       status: "active",
  //       startedAt: { gte: new Date(Date.now() - SESSION_WINDOW_MS) },
  //     },
  //     orderBy: { startedAt: "desc" },
  //   });
  //   if (existing) return mapPrismaSession(existing);
  //   const customer = await getCustomerByLineUid(lineUid);
  //   const newSession = await prisma.chatSession.create({
  //     data: { lineUid, customerCode: customer?.customerCode, customerName: customer?.customerName },
  //   });
  //   return mapPrismaSession(newSession);
  // }

  const cutoff = new Date(Date.now() - SESSION_WINDOW_MS);

  // 既存のアクティブセッションを検索
  for (const session of mockSessions.values()) {
    if (
      session.lineUid === lineUid &&
      session.status === "active" &&
      session.startedAt > cutoff
    ) {
      return session;
    }
  }

  // 新規セッション作成
  const customer = await getCustomerByLineUid(lineUid);
  const id = `session_${sessionIdCounter++}`;
  const session: ChatSession = {
    id,
    lineUid,
    customerCode: customer?.customerCode ?? null,
    customerName: customer?.customerName ?? null,
    channel: "line",
    status: "active",
    inquiryCategory: null,
    needsHumanSupport: false,
    escalationReason: null,
    startedAt: new Date(),
    endedAt: null,
    messageCount: 0,
  };

  mockSessions.set(id, session);
  mockMessages.set(id, []);
  return session;
}

// ============================================================
// メッセージ管理
// ============================================================

/**
 * チャットメッセージを保存
 */
export async function saveChatMessage(params: {
  sessionId: string;
  role: "customer" | "assistant" | "system";
  content: string;
  category?: InquiryCategory | null;
  needsHumanSupport?: boolean;
  confidence?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}): Promise<ChatMessage> {
  // TODO: DB接続時
  // if (isDbConnected) {
  //   return prisma.chatMessage.create({ data: { ... } });
  // }

  const message: ChatMessage = {
    id: `msg_${messageIdCounter++}`,
    sessionId: params.sessionId,
    role: params.role,
    content: params.content,
    category: params.category ?? null,
    needsHumanSupport: params.needsHumanSupport ?? false,
    confidence: params.confidence ?? null,
    inputTokens: params.inputTokens ?? null,
    outputTokens: params.outputTokens ?? null,
    createdAt: new Date(),
  };

  const messages = mockMessages.get(params.sessionId) ?? [];
  messages.push(message);
  mockMessages.set(params.sessionId, messages);

  // セッションのメッセージ数を更新
  const session = mockSessions.get(params.sessionId);
  if (session) {
    session.messageCount = messages.length;
  }

  return message;
}

// ============================================================
// セッションステータス更新
// ============================================================

/**
 * セッションステータスを更新
 */
export async function updateSessionStatus(
  sessionId: string,
  status: ChatSessionStatus,
  extra?: {
    inquiryCategory?: InquiryCategory | null;
    escalationReason?: EscalationReason | null;
  }
): Promise<void> {
  // TODO: DB接続時
  // if (isDbConnected) {
  //   await prisma.chatSession.update({ where: { id: sessionId }, data: { status, ...extra } });
  //   return;
  // }

  const session = mockSessions.get(sessionId);
  if (!session) return;

  session.status = status;
  if (extra?.inquiryCategory) session.inquiryCategory = extra.inquiryCategory;
  if (extra?.escalationReason) session.escalationReason = extra.escalationReason;

  if (status === "resolved" || status === "closed") {
    session.endedAt = new Date();
  }
  if (status === "escalated") {
    session.needsHumanSupport = true;
  }
}

// ============================================================
// 管理画面用のクエリ
// ============================================================

/**
 * セッションIDで単一セッションを取得
 */
export async function getChatSession(
  sessionId: string
): Promise<ChatSession | null> {
  ensureSeedData();
  return mockSessions.get(sessionId) ?? null;
}

/**
 * チャットセッション一覧を取得
 */
export async function getChatSessions(filters?: {
  status?: ChatSessionStatus | "all";
  needsHumanSupport?: boolean;
}): Promise<ChatSession[]> {
  ensureSeedData();
  let sessions = Array.from(mockSessions.values());

  if (filters?.status && filters.status !== "all") {
    sessions = sessions.filter((s) => s.status === filters.status);
  }
  if (filters?.needsHumanSupport !== undefined) {
    sessions = sessions.filter(
      (s) => s.needsHumanSupport === filters.needsHumanSupport
    );
  }

  return sessions.sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
  );
}

/**
 * セッションのメッセージ一覧を取得
 */
export async function getChatMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  ensureSeedData();
  return mockMessages.get(sessionId) ?? [];
}

/**
 * チャットKPI取得
 */
export async function getChatKpi(): Promise<{
  totalSessions: number;
  activeSessions: number;
  escalatedSessions: number;
  avgConfidence: number;
  totalTokensUsed: number;
}> {
  ensureSeedData();
  const sessions = Array.from(mockSessions.values());
  const allMessages = Array.from(mockMessages.values()).flat();
  const aiMessages = allMessages.filter((m) => m.role === "assistant");

  return {
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => s.status === "active").length,
    escalatedSessions: sessions.filter((s) => s.needsHumanSupport).length,
    avgConfidence:
      aiMessages.length > 0
        ? aiMessages.reduce((sum, m) => sum + (m.confidence ?? 0), 0) /
          aiMessages.length
        : 0,
    totalTokensUsed: aiMessages.reduce(
      (sum, m) => sum + (m.inputTokens ?? 0) + (m.outputTokens ?? 0),
      0
    ),
  };
}

// ============================================================
// AIチャット設定ステータス
// ============================================================

/**
 * AIチャット機能の設定状態を返す
 */
export async function getAiChatStatus(): Promise<{
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
}> {
  const budgetEnv = process.env.AI_MONTHLY_TOKEN_BUDGET;
  const monthlyBudget = budgetEnv ? parseInt(budgetEnv, 10) || 500000 : 500000;

  return {
    configured: !!process.env.ANTHROPIC_API_KEY,
    anthropicKeySet: !!process.env.ANTHROPIC_API_KEY,
    webhookSecretSet: !!process.env.LINY_WEBHOOK_SECRET,
    escalationWebhookSet: !!process.env.ESCALATION_WEBHOOK_URL,
    escalationWebhookUrl: process.env.ESCALATION_WEBHOOK_URL ?? null,
    webhookUrl: "/api/webhooks/liny/inbound",
    model: "claude-sonnet-4-20250514",
    temperature: 0.3,
    maxTokens: 2048,
    monthlyTokenBudget: monthlyBudget,
    categories: [
      "注文・キャンセル・変更",
      "商品・価格",
      "配送・出荷",
      "品質クレーム（全件エスカレ）",
      "アカウント・システム",
      "支払い・請求（基本エスカレ）",
      "新規登録",
    ],
  };
}

/**
 * トークン使用統計を取得（管理画面用）
 */
export async function getTokenUsageStatsAction() {
  const { getTokenUsageStats } = await import("@/lib/ai/token-tracker");
  return getTokenUsageStats();
}

// ============================================================
// 管理画面からのステータス変更操作
// ============================================================

/**
 * セッションを「解決済み」に変更
 */
export async function resolveSession(
  sessionId: string
): Promise<{ success: boolean }> {
  const session = mockSessions.get(sessionId);
  if (!session) return { success: false };

  session.status = "resolved";
  session.endedAt = new Date();
  return { success: true };
}

/**
 * セッションを「クローズ」に変更
 */
export async function closeSession(
  sessionId: string
): Promise<{ success: boolean }> {
  const session = mockSessions.get(sessionId);
  if (!session) return { success: false };

  session.status = "closed";
  session.endedAt = new Date();
  return { success: true };
}

/**
 * エスカレーション済みセッションを「対応中」に戻す
 */
export async function reopenSession(
  sessionId: string
): Promise<{ success: boolean }> {
  const session = mockSessions.get(sessionId);
  if (!session) return { success: false };

  session.status = "active";
  session.needsHumanSupport = false;
  session.escalationReason = null;
  session.endedAt = null;
  return { success: true };
}
