/**
 * escalation モジュール ユニットテスト
 *
 * テスト対象:
 * - needsHumanSupport=false 時は何もしない
 * - needsHumanSupport=true 時にLinyタグ付与 + システムメッセージ作成
 * - 外部Webhook通知の条件分岐（設定あり/なし）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ChatSession, AiChatResponse } from "../types";

// Liny APIをモック
vi.mock("@/lib/liny", () => ({
  sendLinyRequest: vi.fn().mockResolvedValue({ success: true }),
}));

// Server Actionsをモック
vi.mock("@/lib/actions/chat", () => ({
  saveChatMessage: vi.fn().mockResolvedValue({ id: "sys_msg_1" }),
  updateSessionStatus: vi.fn().mockResolvedValue(undefined),
}));

// Slack通知をモック
vi.mock("../slack-notify", () => ({
  sendSlackEscalationNotify: vi.fn().mockResolvedValue({ sent: false }),
}));

import { handleEscalation } from "../escalation";
import { sendLinyRequest } from "@/lib/liny";
import { saveChatMessage, updateSessionStatus } from "@/lib/actions/chat";

const mockSendLiny = vi.mocked(sendLinyRequest);
const mockSaveMessage = vi.mocked(saveChatMessage);
const mockUpdateStatus = vi.mocked(updateSessionStatus);

const baseSession: ChatSession = {
  id: "test_session_1",
  lineUid: "U_test_123",
  customerCode: "C-10001",
  customerName: "テスト店舗",
  channel: "line",
  status: "active",
  inquiryCategory: null,
  needsHumanSupport: false,
  escalationReason: null,
  startedAt: new Date(),
  endedAt: null,
  messageCount: 2,
};

describe("handleEscalation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ESCALATION_WEBHOOK_URL;
  });

  it("needsHumanSupport=false の場合、何もしない", async () => {
    const aiResponse: AiChatResponse = {
      reply: "問題ありません",
      category: "product_price",
      needsHumanSupport: false,
      confidence: 0.9,
      tokensUsed: { input: 100, output: 50 },
    };

    const result = await handleEscalation(baseSession, aiResponse, "U_test_123");

    expect(result.escalated).toBe(false);
    expect(result.linyTagResult.tagsAdded).toHaveLength(0);
    expect(result.webhookResult.sent).toBe(false);
    expect(result.systemMessageId).toBeNull();

    // Liny API, saveChatMessage, updateSessionStatus は呼ばれない
    expect(mockSendLiny).not.toHaveBeenCalled();
    expect(mockSaveMessage).not.toHaveBeenCalled();
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it("needsHumanSupport=true の場合、Linyタグが付与される", async () => {
    const aiResponse: AiChatResponse = {
      reply: "担当者に引き継ぎます",
      category: "quality_complaint",
      needsHumanSupport: true,
      escalationReason: "quality_complaint",
      confidence: 0.95,
      tokensUsed: { input: 100, output: 50 },
    };

    const result = await handleEscalation(baseSession, aiResponse, "U_test_123");

    expect(result.escalated).toBe(true);
    // 「AI_要対応」+ 「AI_品質クレーム」の2タグ
    expect(mockSendLiny).toHaveBeenCalledTimes(2);
    expect(mockSendLiny).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "U_test_123",
        action_type: "tag_add",
        tag_name: "AI_要対応",
      })
    );
    expect(mockSendLiny).toHaveBeenCalledWith(
      expect.objectContaining({
        tag_name: "AI_品質クレーム",
      })
    );
    expect(result.linyTagResult.tagsAdded).toContain("AI_要対応");
    expect(result.linyTagResult.tagsAdded).toContain("AI_品質クレーム");
  });

  it("セッションステータスがescalatedに更新される", async () => {
    const aiResponse: AiChatResponse = {
      reply: "確認します",
      category: "payment_billing",
      needsHumanSupport: true,
      escalationReason: "payment_issue",
      confidence: 0.85,
      tokensUsed: { input: 100, output: 50 },
    };

    await handleEscalation(baseSession, aiResponse, "U_test_123");

    expect(mockUpdateStatus).toHaveBeenCalledWith(
      "test_session_1",
      "escalated",
      {
        inquiryCategory: "payment_billing",
        escalationReason: "payment_issue",
      }
    );
  });

  it("システムメッセージがチャットスレッドに追加される", async () => {
    const aiResponse: AiChatResponse = {
      reply: "担当者に引き継ぎます",
      category: "quality_complaint",
      needsHumanSupport: true,
      escalationReason: "quality_complaint",
      confidence: 0.95,
      tokensUsed: { input: 100, output: 50 },
    };

    const result = await handleEscalation(baseSession, aiResponse, "U_test_123");

    expect(mockSaveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "test_session_1",
        role: "system",
        category: "quality_complaint",
        needsHumanSupport: true,
      })
    );
    // システムメッセージ内容にカテゴリ名とエスカレーション理由が含まれる
    const messageCall = mockSaveMessage.mock.calls[0][0];
    expect(messageCall.content).toContain("品質クレーム");
    expect(messageCall.content).toContain("エスカレーション");
    expect(result.systemMessageId).toBe("sys_msg_1");
  });

  it("ESCALATION_WEBHOOK_URL未設定時はWebhook通知をスキップ", async () => {
    const aiResponse: AiChatResponse = {
      reply: "引き継ぎます",
      category: "quality_complaint",
      needsHumanSupport: true,
      escalationReason: "quality_complaint",
      confidence: 0.9,
      tokensUsed: { input: 100, output: 50 },
    };

    const result = await handleEscalation(baseSession, aiResponse, "U_test_123");

    expect(result.webhookResult.sent).toBe(false);
  });

  it("ESCALATION_WEBHOOK_URL設定時はWebhook通知を送信する", async () => {
    process.env.ESCALATION_WEBHOOK_URL = "https://example.com/webhook";

    // fetchをモック
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("OK"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const aiResponse: AiChatResponse = {
      reply: "引き継ぎます",
      category: "quality_complaint",
      needsHumanSupport: true,
      escalationReason: "quality_complaint",
      confidence: 0.9,
      tokensUsed: { input: 100, output: 50 },
    };

    const result = await handleEscalation(baseSession, aiResponse, "U_test_123");

    expect(result.webhookResult.sent).toBe(true);
    expect(result.webhookResult.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com/webhook",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Event-Type": "chat_escalation",
        }),
      })
    );

    vi.unstubAllGlobals();
  });

  it("Linyタグ付与失敗時もエスカレーション自体は完了する", async () => {
    mockSendLiny.mockResolvedValue({ success: false, error: "Liny API error" });

    const aiResponse: AiChatResponse = {
      reply: "引き継ぎます",
      category: "quality_complaint",
      needsHumanSupport: true,
      escalationReason: "quality_complaint",
      confidence: 0.9,
      tokensUsed: { input: 100, output: 50 },
    };

    const result = await handleEscalation(baseSession, aiResponse, "U_test_123");

    expect(result.escalated).toBe(true);
    expect(result.linyTagResult.success).toBe(false);
    expect(result.linyTagResult.tagsAdded).toHaveLength(0);
    // セッション更新とシステムメッセージはそれでも実行される
    expect(mockUpdateStatus).toHaveBeenCalled();
    expect(mockSaveMessage).toHaveBeenCalled();
  });
});
