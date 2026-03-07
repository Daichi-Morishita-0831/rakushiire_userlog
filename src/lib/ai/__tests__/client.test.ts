import { describe, it, expect, vi, beforeEach } from "vitest";

// callClaude のテスト（Anthropic SDKをモック）
describe("callClaude", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("ANTHROPIC_API_KEY未設定時にエラーを投げる", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");

    // globalの anthropic をクリア
    (globalThis as Record<string, unknown>).anthropic = undefined;

    const { callClaude } = await import("../client");

    await expect(
      callClaude<{ test: string }>("system prompt", "user message")
    ).rejects.toThrow("ANTHROPIC_API_KEY");
  });
});

// 型定義のテスト
describe("AI Types", () => {
  it("InquiryCategory型が正しく定義されている", async () => {
    const { INQUIRY_CATEGORY_LABELS } = await import("../types");

    expect(INQUIRY_CATEGORY_LABELS).toBeDefined();
    expect(INQUIRY_CATEGORY_LABELS.order_change).toBe("注文・変更");
    expect(INQUIRY_CATEGORY_LABELS.quality_complaint).toBe("品質クレーム");
    expect(INQUIRY_CATEGORY_LABELS.payment_billing).toBe("支払い・請求");
    expect(Object.keys(INQUIRY_CATEGORY_LABELS)).toHaveLength(8);
  });
});
