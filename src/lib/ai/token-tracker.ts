/**
 * トークン使用量トラッカー
 *
 * Claude API のトークン消費を追跡し、月次予算に対するアラートを提供。
 * インメモリ実装（DB接続時は crm_token_usage テーブルに置き換え）
 *
 * 機能:
 * - リクエスト毎のトークン記録
 * - 日次・月次の集計
 * - 月次予算に対するアラート（80% / 100% 超過）
 */

import type { InquiryCategory } from "./types";

// ============================================================
// 型定義
// ============================================================

interface TokenRecord {
  timestamp: Date;
  sessionId: string;
  inputTokens: number;
  outputTokens: number;
  category: InquiryCategory | null;
}

export interface TokenUsageStats {
  /** 今日の使用量 */
  today: {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  /** 今月の使用量 */
  month: {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  /** 予算情報 */
  budget: {
    monthlyLimit: number;
    usedPercentage: number;
    remaining: number;
    alert: "none" | "warning" | "exceeded";
  };
  /** カテゴリ別の今月使用量 */
  categoryBreakdown: Array<{
    category: InquiryCategory;
    requests: number;
    totalTokens: number;
  }>;
}

// ============================================================
// インメモリストレージ
// ============================================================

const tokenRecords: TokenRecord[] = [];

/** デフォルト月次予算: 50万トークン */
const DEFAULT_MONTHLY_BUDGET = 500_000;

// ============================================================
// 記録・集計関数
// ============================================================

/**
 * トークン使用量を記録
 */
export function trackTokenUsage(params: {
  sessionId: string;
  inputTokens: number;
  outputTokens: number;
  category: InquiryCategory | null;
}): void {
  tokenRecords.push({
    timestamp: new Date(),
    sessionId: params.sessionId,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    category: params.category,
  });

  // 予算チェック（ログ出力）
  const monthlyBudget = getMonthlyBudget();
  const monthlyUsage = getMonthlyTokens();

  if (monthlyUsage > monthlyBudget) {
    console.error(
      `[TokenTracker] ⚠️ 月次予算超過: ${monthlyUsage.toLocaleString()} / ${monthlyBudget.toLocaleString()} トークン`
    );
  } else if (monthlyUsage > monthlyBudget * 0.8) {
    console.warn(
      `[TokenTracker] ⚠ 月次予算80%超過: ${monthlyUsage.toLocaleString()} / ${monthlyBudget.toLocaleString()} トークン`
    );
  }
}

/**
 * 月次予算を取得（環境変数または既定値）
 */
function getMonthlyBudget(): number {
  const envBudget = process.env.AI_MONTHLY_TOKEN_BUDGET;
  if (envBudget) {
    const parsed = parseInt(envBudget, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_MONTHLY_BUDGET;
}

/**
 * 今月のトークン合計を取得
 */
function getMonthlyTokens(): number {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return tokenRecords
    .filter((r) => r.timestamp >= monthStart)
    .reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
}

/**
 * トークン使用統計を取得（管理画面表示用）
 */
export function getTokenUsageStats(): TokenUsageStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayRecords = tokenRecords.filter((r) => r.timestamp >= todayStart);
  const monthRecords = tokenRecords.filter((r) => r.timestamp >= monthStart);

  const todayTotal = todayRecords.reduce(
    (sum, r) => sum + r.inputTokens + r.outputTokens,
    0
  );
  const monthTotal = monthRecords.reduce(
    (sum, r) => sum + r.inputTokens + r.outputTokens,
    0
  );

  const monthlyBudget = getMonthlyBudget();
  const usedPercentage =
    monthlyBudget > 0 ? (monthTotal / monthlyBudget) * 100 : 0;

  // カテゴリ別集計
  const categoryMap = new Map<
    InquiryCategory,
    { requests: number; totalTokens: number }
  >();
  for (const record of monthRecords) {
    if (record.category) {
      const existing = categoryMap.get(record.category) ?? {
        requests: 0,
        totalTokens: 0,
      };
      existing.requests++;
      existing.totalTokens += record.inputTokens + record.outputTokens;
      categoryMap.set(record.category, existing);
    }
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.totalTokens - a.totalTokens);

  return {
    today: {
      requests: todayRecords.length,
      inputTokens: todayRecords.reduce((sum, r) => sum + r.inputTokens, 0),
      outputTokens: todayRecords.reduce((sum, r) => sum + r.outputTokens, 0),
      totalTokens: todayTotal,
    },
    month: {
      requests: monthRecords.length,
      inputTokens: monthRecords.reduce((sum, r) => sum + r.inputTokens, 0),
      outputTokens: monthRecords.reduce((sum, r) => sum + r.outputTokens, 0),
      totalTokens: monthTotal,
    },
    budget: {
      monthlyLimit: monthlyBudget,
      usedPercentage: Math.round(usedPercentage * 10) / 10,
      remaining: Math.max(0, monthlyBudget - monthTotal),
      alert:
        usedPercentage >= 100
          ? "exceeded"
          : usedPercentage >= 80
            ? "warning"
            : "none",
    },
    categoryBreakdown,
  };
}
