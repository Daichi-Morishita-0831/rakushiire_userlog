"use server";

export interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  trigger: string;
  triggerType: "no_order" | "cart_abandon" | "order_decline" | "no_login" | "new_customer";
  triggerDays: number;
  channel: string;
  channels: string[];
  delay: string;
  delayMinutes: number;
  cooldown: number;
  isActive: boolean;
  executionCount: number;
  messageTemplate?: string;
  segmentId?: number;
  createdAt: string;
}

let mockRules: AutomationRule[] = [
  { id: 1, name: "離反リスク通知", trigger: "30日間注文なし", triggerType: "no_order", triggerDays: 30, channel: "LINE", channels: ["line"], delay: "即時", delayMinutes: 0, cooldown: 14, isActive: true, executionCount: 156, createdAt: "2026-01-15", messageTemplate: "最近ご注文がないようですが、いかがでしょうか？\n期間限定の特別価格をご用意しております。" },
  { id: 2, name: "カゴ落ちリマインド", trigger: "カート放置24時間", triggerType: "cart_abandon", triggerDays: 1, channel: "LINE", channels: ["line"], delay: "24時間後", delayMinutes: 1440, cooldown: 3, isActive: true, executionCount: 89, createdAt: "2026-01-20", messageTemplate: "カートに商品が残っています。\nご注文をお忘れではありませんか？" },
  { id: 3, name: "新規フォローアップ", trigger: "取引開始後3日", triggerType: "new_customer", triggerDays: 3, channel: "メール", channels: ["email"], delay: "3日後", delayMinutes: 4320, cooldown: 30, isActive: true, executionCount: 42, createdAt: "2026-02-01", messageTemplate: "ご利用ありがとうございます。\n何かご不明点がございましたらお気軽にお問い合わせください。" },
  { id: 4, name: "高単価顧客ケア", trigger: "注文頻度30%低下", triggerType: "order_decline", triggerDays: 0, channel: "LINE+メール", channels: ["line", "email"], delay: "即時", delayMinutes: 0, cooldown: 14, isActive: false, executionCount: 0, createdAt: "2026-02-15" },
  { id: 5, name: "再訪促進", trigger: "60日間ログインなし", triggerType: "no_login", triggerDays: 60, channel: "メール", channels: ["email"], delay: "即時", delayMinutes: 0, cooldown: 30, isActive: false, executionCount: 0, createdAt: "2026-02-20" },
];

export async function getAutomationRules(): Promise<AutomationRule[]> {
  return mockRules;
}

export async function getAutomationRuleById(id: number): Promise<AutomationRule | null> {
  return mockRules.find((r) => r.id === id) ?? null;
}

export async function createAutomationRule(data: Omit<AutomationRule, "id" | "executionCount" | "createdAt">): Promise<AutomationRule> {
  const newRule: AutomationRule = {
    ...data,
    id: Math.max(...mockRules.map((r) => r.id)) + 1,
    executionCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockRules = [...mockRules, newRule];
  return newRule;
}

export async function toggleAutomationRule(id: number): Promise<AutomationRule | null> {
  const rule = mockRules.find((r) => r.id === id);
  if (!rule) return null;
  rule.isActive = !rule.isActive;
  return rule;
}

export async function deleteAutomationRule(id: number): Promise<boolean> {
  const prev = mockRules.length;
  mockRules = mockRules.filter((r) => r.id !== id);
  return mockRules.length < prev;
}
