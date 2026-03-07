/**
 * token-tracker ユニットテスト
 *
 * テスト対象:
 * - トークン使用量の記録と集計
 * - 日次・月次の統計
 * - 月次予算アラート
 * - カテゴリ別集計
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// token-tracker はモジュールレベルの state を持つため、
// 各テストでモジュールを再読み込みする
let trackTokenUsage: typeof import("../token-tracker").trackTokenUsage;
let getTokenUsageStats: typeof import("../token-tracker").getTokenUsageStats;

describe("TokenTracker", () => {
  beforeEach(async () => {
    // 環境変数をリセット
    delete process.env.AI_MONTHLY_TOKEN_BUDGET;

    // モジュールキャッシュをクリアして再読み込み
    vi.resetModules();
    const mod = await import("../token-tracker");
    trackTokenUsage = mod.trackTokenUsage;
    getTokenUsageStats = mod.getTokenUsageStats;
  });

  it("初期状態のstatsは全て0", () => {
    const stats = getTokenUsageStats();

    expect(stats.today.requests).toBe(0);
    expect(stats.today.totalTokens).toBe(0);
    expect(stats.month.requests).toBe(0);
    expect(stats.month.totalTokens).toBe(0);
    expect(stats.budget.usedPercentage).toBe(0);
    expect(stats.budget.alert).toBe("none");
  });

  it("トークン使用量を記録し、statsに反映される", () => {
    trackTokenUsage({
      sessionId: "s1",
      inputTokens: 1000,
      outputTokens: 500,
      category: "product_price",
    });

    const stats = getTokenUsageStats();

    expect(stats.today.requests).toBe(1);
    expect(stats.today.inputTokens).toBe(1000);
    expect(stats.today.outputTokens).toBe(500);
    expect(stats.today.totalTokens).toBe(1500);
    expect(stats.month.totalTokens).toBe(1500);
  });

  it("複数のリクエストが正しく集計される", () => {
    trackTokenUsage({
      sessionId: "s1",
      inputTokens: 1000,
      outputTokens: 500,
      category: "product_price",
    });
    trackTokenUsage({
      sessionId: "s2",
      inputTokens: 800,
      outputTokens: 300,
      category: "delivery_shipping",
    });

    const stats = getTokenUsageStats();

    expect(stats.today.requests).toBe(2);
    expect(stats.today.totalTokens).toBe(2600);
    expect(stats.month.requests).toBe(2);
  });

  it("デフォルト予算は500,000トークン", () => {
    const stats = getTokenUsageStats();

    expect(stats.budget.monthlyLimit).toBe(500000);
    expect(stats.budget.remaining).toBe(500000);
  });

  it("環境変数で月次予算を変更できる", async () => {
    process.env.AI_MONTHLY_TOKEN_BUDGET = "100000";

    vi.resetModules();
    const mod = await import("../token-tracker");

    const stats = mod.getTokenUsageStats();
    expect(stats.budget.monthlyLimit).toBe(100000);
  });

  it("カテゴリ別の集計が正しい", () => {
    trackTokenUsage({
      sessionId: "s1",
      inputTokens: 1000,
      outputTokens: 500,
      category: "product_price",
    });
    trackTokenUsage({
      sessionId: "s2",
      inputTokens: 800,
      outputTokens: 400,
      category: "product_price",
    });
    trackTokenUsage({
      sessionId: "s3",
      inputTokens: 600,
      outputTokens: 300,
      category: "quality_complaint",
    });

    const stats = getTokenUsageStats();

    expect(stats.categoryBreakdown).toHaveLength(2);
    // product_price が最大（2700トークン）
    expect(stats.categoryBreakdown[0].category).toBe("product_price");
    expect(stats.categoryBreakdown[0].requests).toBe(2);
    expect(stats.categoryBreakdown[0].totalTokens).toBe(2700);
    // quality_complaint（900トークン）
    expect(stats.categoryBreakdown[1].category).toBe("quality_complaint");
    expect(stats.categoryBreakdown[1].requests).toBe(1);
  });

  it("予算消化率が正しく計算される", async () => {
    process.env.AI_MONTHLY_TOKEN_BUDGET = "10000";

    vi.resetModules();
    const mod = await import("../token-tracker");

    mod.trackTokenUsage({
      sessionId: "s1",
      inputTokens: 3000,
      outputTokens: 2000,
      category: "other",
    });

    const stats = mod.getTokenUsageStats();
    expect(stats.budget.usedPercentage).toBe(50);
    expect(stats.budget.remaining).toBe(5000);
    expect(stats.budget.alert).toBe("none");
  });

  it("80%超過でwarningアラート", async () => {
    process.env.AI_MONTHLY_TOKEN_BUDGET = "10000";

    vi.resetModules();
    const mod = await import("../token-tracker");

    mod.trackTokenUsage({
      sessionId: "s1",
      inputTokens: 5000,
      outputTokens: 3500,
      category: "other",
    });

    const stats = mod.getTokenUsageStats();
    expect(stats.budget.usedPercentage).toBe(85);
    expect(stats.budget.alert).toBe("warning");
  });

  it("100%超過でexceededアラート", async () => {
    process.env.AI_MONTHLY_TOKEN_BUDGET = "1000";

    vi.resetModules();
    const mod = await import("../token-tracker");

    mod.trackTokenUsage({
      sessionId: "s1",
      inputTokens: 800,
      outputTokens: 500,
      category: "other",
    });

    const stats = mod.getTokenUsageStats();
    expect(stats.budget.alert).toBe("exceeded");
    expect(stats.budget.remaining).toBe(0);
  });

  it("categoryがnullのリクエストはカテゴリ集計に含まれない", () => {
    trackTokenUsage({
      sessionId: "s1",
      inputTokens: 1000,
      outputTokens: 500,
      category: null,
    });

    const stats = getTokenUsageStats();
    expect(stats.categoryBreakdown).toHaveLength(0);
    expect(stats.today.totalTokens).toBe(1500); // 全体集計には含まれる
  });
});
