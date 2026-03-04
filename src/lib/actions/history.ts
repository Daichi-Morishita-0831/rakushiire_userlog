"use server";

export interface HistoryItem {
  id: number;
  sentAt: string;
  type: "auto" | "manual";
  channel: "line" | "email" | "sms";
  target: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  orderRate: number;
  orderAmount: number;
  subject: string;
  body: string;
  ruleName?: string;
}

const mockHistory: HistoryItem[] = [
  { id: 1, sentAt: "2026-03-03 09:00", type: "auto", channel: "line", target: "離反リスク顧客", sentCount: 47, openRate: 62.5, clickRate: 18.3, orderRate: 8.5, orderAmount: 245000, subject: "お久しぶりです！特別クーポンをお届け", body: "{{customer_name}}様\n\nいつもご利用ありがとうございます。\n最近お注文がないようですが、いかがでしょうか？\n\n今なら全品5%OFFクーポンをご利用いただけます。\n▶ 今すぐ注文する", ruleName: "離反予防（30日）" },
  { id: 2, sentAt: "2026-03-02 10:00", type: "manual", channel: "email", target: "全アクティブ顧客", sentCount: 342, openRate: 45.2, clickRate: 12.1, orderRate: 5.3, orderAmount: 1250000, subject: "【ラクシーレ】3月のおすすめ食材のご案内", body: "いつもラクシーレをご利用いただきありがとうございます。\n\n3月に入り、春野菜が本格的に出回り始めました。" },
  { id: 3, sentAt: "2026-03-01 08:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 23, openRate: 78.3, clickRate: 34.5, orderRate: 21.7, orderAmount: 189000, subject: "カートに商品が残っています", body: "{{customer_name}}様\n\nカートに商品が入ったままになっています。\n\n▶ カートを確認する", ruleName: "カゴ落ちフォロー" },
  { id: 4, sentAt: "2026-02-28 09:00", type: "manual", channel: "line", target: "新規顧客フォロー", sentCount: 12, openRate: 83.3, clickRate: 41.7, orderRate: 25.0, orderAmount: 156000, subject: "ご登録ありがとうございます！初回注文ガイド", body: "{{customer_name}}様\n\nラクシーレへようこそ！\n初めてのご注文をスムーズに行うためのガイドをお送りします。" },
  { id: 5, sentAt: "2026-02-27 10:00", type: "auto", channel: "email", target: "再訪促進（60日）", sentCount: 31, openRate: 38.7, clickRate: 9.7, orderRate: 3.2, orderAmount: 85000, subject: "お元気ですか？ラクシーレからのご案内", body: "{{customer_name}}様\n\nしばらくご利用がないようですが、お変わりないでしょうか？", ruleName: "再訪促進（60日）" },
  { id: 6, sentAt: "2026-02-26 08:00", type: "manual", channel: "line", target: "3月キャンペーン告知", sentCount: 150, openRate: 71.3, clickRate: 28.0, orderRate: 12.0, orderAmount: 890000, subject: "【3月限定】春の食材フェア開催中！", body: "3月限定「春の食材フェア」を開催します！\n\n■ 期間：3/1〜3/31\n■ 対象：春野菜・山菜カテゴリ全品\n■ 特典：5%OFF + 送料無料" },
  { id: 7, sentAt: "2026-02-25 09:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 18, openRate: 72.2, clickRate: 33.3, orderRate: 16.7, orderAmount: 95000, subject: "カートに商品が残っています", body: "{{customer_name}}様\n\nカートに商品が入ったままになっています。\n\n▶ カートを確認する", ruleName: "カゴ落ちフォロー" },
  { id: 8, sentAt: "2026-02-24 10:00", type: "manual", channel: "email", target: "高単価顧客ケア", sentCount: 68, openRate: 52.9, clickRate: 17.6, orderRate: 8.8, orderAmount: 520000, subject: "いつもありがとうございます。担当よりご挨拶", body: "{{customer_name}}様\n\nいつもラクシーレをご愛顧いただき、誠にありがとうございます。" },
];

export async function getDeliveryHistory(): Promise<HistoryItem[]> {
  return mockHistory;
}
