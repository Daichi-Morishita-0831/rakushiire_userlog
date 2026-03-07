/**
 * chat-responder ユニットテスト
 *
 * テスト対象:
 * - AIレスポンスのバリデーション（カテゴリ正規化、強制エスカレーション、confidence clamp）
 * - フォールバック応答の生成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// callClaudeをモック
vi.mock("../client", () => ({
  callClaude: vi.fn(),
}));

// getCustomerByLineUidをモック
vi.mock("@/lib/actions/chat", () => ({
  getCustomerByLineUid: vi.fn().mockResolvedValue(null),
  getChatMessages: vi.fn().mockResolvedValue([]),
}));

import { handleInboundMessage } from "../chat-responder";
import { callClaude } from "../client";

const mockCallClaude = vi.mocked(callClaude);

describe("handleInboundMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常なAI応答を正しく返す", async () => {
    mockCallClaude.mockResolvedValueOnce({
      data: {
        reply: "テスト応答です",
        category: "product_price",
        needsHumanSupport: false,
        escalationReason: null,
        confidence: 0.85,
      },
      inputTokens: 100,
      outputTokens: 50,
    });

    const result = await handleInboundMessage("U123", "トマトの在庫ありますか？");

    expect(result.reply).toBe("テスト応答です");
    expect(result.category).toBe("product_price");
    expect(result.needsHumanSupport).toBe(false);
    expect(result.confidence).toBe(0.85);
    expect(result.tokensUsed).toEqual({ input: 100, output: 50 });
  });

  it("品質クレームは強制エスカレーションされる", async () => {
    mockCallClaude.mockResolvedValueOnce({
      data: {
        reply: "申し訳ございません",
        category: "quality_complaint",
        needsHumanSupport: false, // AIがfalseを返しても
        escalationReason: null,
        confidence: 0.9,
      },
      inputTokens: 100,
      outputTokens: 50,
    });

    const result = await handleInboundMessage("U123", "届いた野菜が腐っていた");

    expect(result.category).toBe("quality_complaint");
    expect(result.needsHumanSupport).toBe(true); // 強制的にtrue
  });

  it("支払い・請求は強制エスカレーションされる", async () => {
    mockCallClaude.mockResolvedValueOnce({
      data: {
        reply: "確認いたします",
        category: "payment_billing",
        needsHumanSupport: false,
        escalationReason: null,
        confidence: 0.8,
      },
      inputTokens: 100,
      outputTokens: 50,
    });

    const result = await handleInboundMessage("U123", "請求書の金額が違います");

    expect(result.needsHumanSupport).toBe(true);
  });

  it("不明なカテゴリは 'other' に正規化される", async () => {
    mockCallClaude.mockResolvedValueOnce({
      data: {
        reply: "テスト",
        category: "unknown_category",
        needsHumanSupport: false,
        escalationReason: null,
        confidence: 0.5,
      },
      inputTokens: 100,
      outputTokens: 50,
    });

    const result = await handleInboundMessage("U123", "テスト");

    expect(result.category).toBe("other");
  });

  it("confidenceは0〜1にクランプされる", async () => {
    mockCallClaude.mockResolvedValueOnce({
      data: {
        reply: "テスト",
        category: "product_price",
        needsHumanSupport: false,
        escalationReason: null,
        confidence: 1.5, // 範囲外
      },
      inputTokens: 100,
      outputTokens: 50,
    });

    const result = await handleInboundMessage("U123", "テスト");

    expect(result.confidence).toBe(1);
  });

  it("API例外時にフォールバック応答を返す", async () => {
    mockCallClaude.mockRejectedValueOnce(new Error("API timeout"));

    const result = await handleInboundMessage("U123", "テスト");

    expect(result.needsHumanSupport).toBe(true);
    expect(result.escalationReason).toBe("cannot_resolve");
    expect(result.confidence).toBe(0);
    expect(result.reply).toContain("システムに問題が発生");
  });

  it("空のreplyにはデフォルトメッセージが設定される", async () => {
    mockCallClaude.mockResolvedValueOnce({
      data: {
        reply: "",
        category: "other",
        needsHumanSupport: false,
        escalationReason: null,
        confidence: 0.5,
      },
      inputTokens: 100,
      outputTokens: 50,
    });

    const result = await handleInboundMessage("U123", "テスト");

    expect(result.reply).toContain("もう一度お伺い");
  });
});
