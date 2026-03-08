/**
 * slack-notify モジュール ユニットテスト
 *
 * テスト対象:
 * - Webhook URL未設定時はスキップ
 * - SLACK_ESCALATION_WEBHOOK_URL が優先される
 * - ESCALATION_WEBHOOK_URL にフォールバック
 * - Slack Block Kit形式のペイロード構築
 * - 顧客メッセージの含有
 * - 送信エラー時のハンドリング
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ChatSession, AiChatResponse } from "../types";

const mockFetch = vi.fn();

const baseSession: ChatSession = {
  id: "test_session_1",
  lineUid: "U_test_123",
  customerCode: "C-10001",
  customerName: "テスト居酒屋",
  channel: "line",
  status: "active",
  inquiryCategory: null,
  needsHumanSupport: false,
  escalationReason: null,
  startedAt: new Date(),
  endedAt: null,
  messageCount: 2,
};

const baseAiResponse: AiChatResponse = {
  reply: "担当者より早急にご連絡いたします。",
  category: "quality_complaint",
  needsHumanSupport: true,
  escalationReason: "quality_complaint",
  confidence: 0.95,
  tokensUsed: { input: 100, output: 50 },
};

describe("sendSlackEscalationNotify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockFetch);
    delete process.env.SLACK_ESCALATION_WEBHOOK_URL;
    delete process.env.ESCALATION_WEBHOOK_URL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Webhook URL未設定時はスキップする", async () => {
    const { sendSlackEscalationNotify } = await import("../slack-notify");
    const result = await sendSlackEscalationNotify(baseSession, baseAiResponse);

    expect(result.sent).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("SLACK_ESCALATION_WEBHOOK_URL が優先される", async () => {
    process.env.SLACK_ESCALATION_WEBHOOK_URL =
      "https://hooks.slack.com/services/SLACK";
    process.env.ESCALATION_WEBHOOK_URL = "https://other.com/webhook";
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve("ok") });

    const { sendSlackEscalationNotify } = await import("../slack-notify");
    const result = await sendSlackEscalationNotify(baseSession, baseAiResponse);

    expect(result.sent).toBe(true);
    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://hooks.slack.com/services/SLACK",
      expect.anything()
    );
  });

  it("ESCALATION_WEBHOOK_URL にフォールバックする", async () => {
    process.env.ESCALATION_WEBHOOK_URL = "https://hooks.slack.com/services/FALLBACK";
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve("ok") });

    const { sendSlackEscalationNotify } = await import("../slack-notify");
    const result = await sendSlackEscalationNotify(baseSession, baseAiResponse);

    expect(result.sent).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://hooks.slack.com/services/FALLBACK",
      expect.anything()
    );
  });

  it("Block Kit形式のペイロードを送信する", async () => {
    process.env.SLACK_ESCALATION_WEBHOOK_URL =
      "https://hooks.slack.com/services/TEST";
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve("ok") });

    const { sendSlackEscalationNotify } = await import("../slack-notify");
    await sendSlackEscalationNotify(baseSession, baseAiResponse);

    const call = mockFetch.mock.calls[0];
    const body = JSON.parse(call[1].body);

    // フォールバックテキストが含まれる
    expect(body.text).toContain("テスト居酒屋");
    expect(body.text).toContain("品質クレーム");

    // Block Kit blocks が含まれる
    expect(body.blocks).toBeDefined();
    expect(Array.isArray(body.blocks)).toBe(true);
    expect(body.blocks.length).toBeGreaterThanOrEqual(4);

    // ヘッダーブロックが存在
    const header = body.blocks.find(
      (b: { type: string }) => b.type === "header"
    );
    expect(header).toBeDefined();
    expect(header.text.text).toContain("エスカレーション");
  });

  it("顧客メッセージを含める", async () => {
    process.env.SLACK_ESCALATION_WEBHOOK_URL =
      "https://hooks.slack.com/services/TEST";
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve("ok") });

    const { sendSlackEscalationNotify } = await import("../slack-notify");
    await sendSlackEscalationNotify(
      baseSession,
      baseAiResponse,
      "届いた野菜が腐っていました"
    );

    const call = mockFetch.mock.calls[0];
    const body = JSON.parse(call[1].body);

    // ブロック内に顧客メッセージが含まれる
    const bodyStr = JSON.stringify(body.blocks);
    expect(bodyStr).toContain("届いた野菜が腐っていました");
  });

  it("送信エラー時はエラー情報を返す", async () => {
    process.env.SLACK_ESCALATION_WEBHOOK_URL =
      "https://hooks.slack.com/services/TEST";
    mockFetch.mockRejectedValue(new Error("Network timeout"));

    const { sendSlackEscalationNotify } = await import("../slack-notify");
    const result = await sendSlackEscalationNotify(baseSession, baseAiResponse);

    expect(result.sent).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Network timeout");
  });

  it("HTTPエラー時はステータスを含む", async () => {
    process.env.SLACK_ESCALATION_WEBHOOK_URL =
      "https://hooks.slack.com/services/TEST";
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve("Forbidden"),
    });

    const { sendSlackEscalationNotify } = await import("../slack-notify");
    const result = await sendSlackEscalationNotify(baseSession, baseAiResponse);

    expect(result.sent).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("403");
  });
});
