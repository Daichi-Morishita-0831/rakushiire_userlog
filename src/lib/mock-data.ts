// モックデータ（EC MySQL接続前の開発用）
// DB接続時はこのファイルを削除し、Server Actions内でPrismaクエリに置き換える

import type { CrmCustomer, CrmOrder, CrmPartner } from "@/lib/types";

// Re-export types and constants from types.ts for backward compatibility
export {
  type CustomerStatus,
  type CrmStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  CRM_STATUS_LABELS,
  CRM_STATUS_COLORS,
} from "@/lib/types";

// Type aliases for backward compatibility (mock-data specific names)
export type MockCustomer = CrmCustomer;
export type MockOrder = CrmOrder;
export type MockPartner = CrmPartner;

// パートナーデータ
export const mockPartners: MockPartner[] = [
  { id: 1, code: "BP001", name: "丸山精肉店", type: "children" },
  { id: 2, code: "BP002", name: "鮮魚マルイチ", type: "children" },
  { id: 3, code: "BP003", name: "調味料ナカムラ", type: "children" },
  { id: 4, code: "BP004", name: "乳製品ヨシダ", type: "children" },
  { id: 5, code: "BP005", name: "冷凍食品サトウ", type: "children" },
  { id: 6, code: "BP006", name: "米穀タナカ", type: "children" },
  { id: 7, code: "BP007", name: "酒類ワタナベ", type: "children" },
  { id: 8, code: "BP008", name: "製麺カトウ", type: "children" },
];

// 顧客データ（50件）
export const mockCustomers: MockCustomer[] = [
  {
    id: 1, customerCode: "C-10001", customerName1: "イタリアンバル ROSSO", address1: "東京都", address2: "渋谷区神南1-2-3",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-02T10:30:00", lastOrderDate: "2026-03-01",
    monthlyOrderAmount: 284500, monthlyOrderCount: 12, partnerCount: 4, salesPersonName: "田中太郎", shopCategory: "イタリアン", startTradingDate: "2024-06-15", email: "rosso@example.com", cellphone: "090-1234-5678",
  },
  {
    id: 2, customerCode: "C-10002", customerName1: "和食処 さくら", address1: "東京都", address2: "新宿区歌舞伎町2-5-1",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-03T08:15:00", lastOrderDate: "2026-03-03",
    monthlyOrderAmount: 456000, monthlyOrderCount: 18, partnerCount: 5, salesPersonName: "田中太郎", shopCategory: "和食", startTradingDate: "2023-11-01", email: "sakura@example.com", cellphone: "090-2345-6789",
  },
  {
    id: 3, customerCode: "C-10003", customerName1: "焼肉 炎", address1: "東京都", address2: "港区六本木3-8-2",
    status: "in_transaction", crmStatus: "churn_risk", lineConnected: true, lastLoginAt: "2026-02-15T14:20:00", lastOrderDate: "2026-02-10",
    monthlyOrderAmount: 85000, monthlyOrderCount: 3, partnerCount: 2, salesPersonName: "鈴木花子", shopCategory: "焼肉", startTradingDate: "2024-01-20", email: "yakiniku-en@example.com", cellphone: "090-3456-7890",
  },
  {
    id: 4, customerCode: "C-10004", customerName1: "中華料理 龍鳳", address1: "東京都", address2: "豊島区池袋1-10-5",
    status: "in_transaction", crmStatus: "active", lineConnected: false, lastLoginAt: "2026-03-01T11:00:00", lastOrderDate: "2026-02-28",
    monthlyOrderAmount: 325000, monthlyOrderCount: 14, partnerCount: 6, salesPersonName: "佐藤次郎", shopCategory: "中華", startTradingDate: "2023-04-10", email: "ryuhou@example.com", cellphone: "090-4567-8901",
  },
  {
    id: 5, customerCode: "C-10005", customerName1: "フレンチビストロ Le Ciel", address1: "東京都", address2: "目黒区中目黒2-4-8",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-02T16:45:00", lastOrderDate: "2026-03-02",
    monthlyOrderAmount: 520000, monthlyOrderCount: 20, partnerCount: 7, salesPersonName: "田中太郎", shopCategory: "フレンチ", startTradingDate: "2022-09-01", email: "leciel@example.com", cellphone: "090-5678-9012",
  },
  {
    id: 6, customerCode: "C-10006", customerName1: "居酒屋 まるよし", address1: "東京都", address2: "台東区上野4-7-2",
    status: "in_transaction", crmStatus: "churned", lineConnected: true, lastLoginAt: "2026-01-20T09:30:00", lastOrderDate: "2026-01-15",
    monthlyOrderAmount: 0, monthlyOrderCount: 0, partnerCount: 3, salesPersonName: "鈴木花子", shopCategory: "居酒屋", startTradingDate: "2024-03-01", email: "maruyoshi@example.com", cellphone: "090-6789-0123",
  },
  {
    id: 7, customerCode: "C-10007", customerName1: "カフェ GREEN LEAF", address1: "東京都", address2: "世田谷区三軒茶屋1-3-6",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-03T07:00:00", lastOrderDate: "2026-03-03",
    monthlyOrderAmount: 145000, monthlyOrderCount: 8, partnerCount: 3, salesPersonName: "佐藤次郎", shopCategory: "カフェ", startTradingDate: "2025-01-15", email: "greenleaf@example.com", cellphone: "090-7890-1234",
  },
  {
    id: 8, customerCode: "C-10008", customerName1: "寿司 匠", address1: "東京都", address2: "中央区銀座5-12-1",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-02T12:00:00", lastOrderDate: "2026-03-01",
    monthlyOrderAmount: 680000, monthlyOrderCount: 22, partnerCount: 5, salesPersonName: "田中太郎", shopCategory: "寿司", startTradingDate: "2022-05-20", email: "sushi-takumi@example.com", cellphone: "090-8901-2345",
  },
  {
    id: 9, customerCode: "C-10009", customerName1: "タイ料理 バーンタイ", address1: "東京都", address2: "新宿区大久保1-8-3",
    status: "in_transaction", crmStatus: "churn_risk", lineConnected: false, lastLoginAt: "2026-02-20T10:00:00", lastOrderDate: "2026-02-18",
    monthlyOrderAmount: 62000, monthlyOrderCount: 2, partnerCount: 2, salesPersonName: "鈴木花子", shopCategory: "タイ料理", startTradingDate: "2025-06-01", email: "baanthai@example.com", cellphone: "090-9012-3456",
  },
  {
    id: 10, customerCode: "C-10010", customerName1: "スペインバル EL SOL", address1: "東京都", address2: "渋谷区恵比寿南3-2-7",
    status: "pre_transaction", crmStatus: "new", lineConnected: true, lastLoginAt: "2026-03-01T15:30:00", lastOrderDate: null,
    monthlyOrderAmount: 0, monthlyOrderCount: 0, partnerCount: 0, salesPersonName: "佐藤次郎", shopCategory: "スペイン料理", startTradingDate: "2026-02-28", email: "elsol@example.com", cellphone: "090-0123-4567",
  },
  {
    id: 11, customerCode: "C-10011", customerName1: "ラーメン 麺屋武蔵", address1: "東京都", address2: "千代田区神田神保町1-5-9",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-03T06:30:00", lastOrderDate: "2026-03-02",
    monthlyOrderAmount: 198000, monthlyOrderCount: 10, partnerCount: 3, salesPersonName: "田中太郎", shopCategory: "ラーメン", startTradingDate: "2024-08-01", email: "menya@example.com", cellphone: "090-1111-2222",
  },
  {
    id: 12, customerCode: "C-10012", customerName1: "串焼き 鶴亀", address1: "東京都", address2: "墨田区押上2-6-4",
    status: "in_transaction", crmStatus: "active", lineConnected: false, lastLoginAt: "2026-02-28T18:00:00", lastOrderDate: "2026-02-27",
    monthlyOrderAmount: 175000, monthlyOrderCount: 7, partnerCount: 4, salesPersonName: "鈴木花子", shopCategory: "串焼き", startTradingDate: "2024-11-15", email: "tsurukame@example.com", cellphone: "090-2222-3333",
  },
  {
    id: 13, customerCode: "C-10013", customerName1: "鉄板焼 紅", address1: "千葉県", address2: "千葉市中央区富士見2-1-8",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-02T09:00:00", lastOrderDate: "2026-03-01",
    monthlyOrderAmount: 390000, monthlyOrderCount: 15, partnerCount: 5, salesPersonName: "佐藤次郎", shopCategory: "鉄板焼", startTradingDate: "2023-07-01", email: "kurenai@example.com", cellphone: "090-3333-4444",
  },
  {
    id: 14, customerCode: "C-10014", customerName1: "うどん処 讃岐", address1: "神奈川県", address2: "横浜市中区元町3-5-2",
    status: "delivery_stop", crmStatus: "churned", lineConnected: true, lastLoginAt: "2026-01-05T11:30:00", lastOrderDate: "2025-12-28",
    monthlyOrderAmount: 0, monthlyOrderCount: 0, partnerCount: 2, salesPersonName: "田中太郎", shopCategory: "うどん", startTradingDate: "2024-05-01", email: "sanuki@example.com", cellphone: "090-4444-5555",
  },
  {
    id: 15, customerCode: "C-10015", customerName1: "ビストロ Joie", address1: "東京都", address2: "文京区本郷3-8-1",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-03T11:00:00", lastOrderDate: "2026-03-03",
    monthlyOrderAmount: 412000, monthlyOrderCount: 16, partnerCount: 6, salesPersonName: "鈴木花子", shopCategory: "ビストロ", startTradingDate: "2023-02-15", email: "joie@example.com", cellphone: "090-5555-6666",
  },
  {
    id: 16, customerCode: "C-10016", customerName1: "ダイニングバー MOON", address1: "東京都", address2: "品川区大井1-2-9",
    status: "in_transaction", crmStatus: "churn_risk", lineConnected: false, lastLoginAt: "2026-02-10T20:00:00", lastOrderDate: "2026-02-05",
    monthlyOrderAmount: 45000, monthlyOrderCount: 1, partnerCount: 2, salesPersonName: "佐藤次郎", shopCategory: "ダイニングバー", startTradingDate: "2025-09-01", email: "moon@example.com", cellphone: "090-6666-7777",
  },
  {
    id: 17, customerCode: "C-10017", customerName1: "天ぷら 天清", address1: "東京都", address2: "中央区日本橋2-4-6",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-02T08:00:00", lastOrderDate: "2026-03-01",
    monthlyOrderAmount: 295000, monthlyOrderCount: 11, partnerCount: 4, salesPersonName: "田中太郎", shopCategory: "天ぷら", startTradingDate: "2023-10-01", email: "tensei@example.com", cellphone: "090-7777-8888",
  },
  {
    id: 18, customerCode: "C-10018", customerName1: "韓国料理 ソウル亭", address1: "東京都", address2: "新宿区大久保2-3-7",
    status: "ec_temporary_register", crmStatus: "new", lineConnected: false, lastLoginAt: null, lastOrderDate: null,
    monthlyOrderAmount: 0, monthlyOrderCount: 0, partnerCount: 0, salesPersonName: "鈴木花子", shopCategory: "韓国料理", startTradingDate: "2026-03-02", email: "seoul@example.com", cellphone: "090-8888-9999",
  },
  {
    id: 19, customerCode: "C-10019", customerName1: "炭火焼 備長", address1: "埼玉県", address2: "さいたま市大宮区桜木町1-9-3",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-01T13:00:00", lastOrderDate: "2026-02-28",
    monthlyOrderAmount: 230000, monthlyOrderCount: 9, partnerCount: 4, salesPersonName: "佐藤次郎", shopCategory: "焼鳥", startTradingDate: "2024-04-01", email: "bincho@example.com", cellphone: "090-9999-0000",
  },
  {
    id: 20, customerCode: "C-10020", customerName1: "パスタ工房 BELLA", address1: "東京都", address2: "杉並区高円寺南4-6-2",
    status: "in_transaction", crmStatus: "active", lineConnected: true, lastLoginAt: "2026-03-03T09:30:00", lastOrderDate: "2026-03-02",
    monthlyOrderAmount: 187000, monthlyOrderCount: 8, partnerCount: 3, salesPersonName: "田中太郎", shopCategory: "パスタ", startTradingDate: "2025-03-01", email: "bella@example.com", cellphone: "080-1111-0000",
  },
];

// 注文データ（顧客C-10001の直近注文）
export const mockOrders: MockOrder[] = [
  { id: 1, orderNumber: "20260301-001", customerCode: "C-10001", deliveryDate: "2026-03-01", partnerName: "丸山精肉店", productName: "国産鶏もも肉 2kg", amount: 3200, totalAmount: 3200, status: "delivered", orderType: "EC" },
  { id: 2, orderNumber: "20260301-002", customerCode: "C-10001", deliveryDate: "2026-03-01", partnerName: "鮮魚マルイチ", productName: "天然サーモン 1kg", amount: 4800, totalAmount: 4800, status: "delivered", orderType: "EC" },
  { id: 3, orderNumber: "20260228-001", customerCode: "C-10001", deliveryDate: "2026-02-28", partnerName: "調味料ナカムラ", productName: "特製だし醤油 1L×6本", amount: 5400, totalAmount: 5400, status: "delivered", orderType: "EC" },
  { id: 4, orderNumber: "20260228-002", customerCode: "C-10001", deliveryDate: "2026-02-28", partnerName: "丸山精肉店", productName: "豚バラブロック 3kg", amount: 6900, totalAmount: 6900, status: "delivered", orderType: "EC" },
  { id: 5, orderNumber: "20260225-001", customerCode: "C-10001", deliveryDate: "2026-02-25", partnerName: "乳製品ヨシダ", productName: "モッツァレラチーズ 1kg", amount: 3800, totalAmount: 3800, status: "delivered", orderType: "EC" },
  { id: 6, orderNumber: "20260225-002", customerCode: "C-10001", deliveryDate: "2026-02-25", partnerName: "鮮魚マルイチ", productName: "活ホタテ 2kg", amount: 7200, totalAmount: 7200, status: "delivered", orderType: "EC" },
  { id: 7, orderNumber: "20260222-001", customerCode: "C-10001", deliveryDate: "2026-02-22", partnerName: "丸山精肉店", productName: "黒毛和牛ロース 1kg", amount: 12000, totalAmount: 12000, status: "delivered", orderType: "EC" },
  { id: 8, orderNumber: "20260220-001", customerCode: "C-10001", deliveryDate: "2026-02-20", partnerName: "冷凍食品サトウ", productName: "冷凍枝豆 500g×10袋", amount: 4500, totalAmount: 4500, status: "delivered", orderType: "EC" },
];

// ダッシュボード用 KPI
export const mockKpi = {
  activeUsers: { value: 342, prevValue: 328, change: 4.3 },
  churnRiskUsers: { value: 47, prevValue: 39, change: 20.5 },
  newUsers: { value: 18, prevValue: 12, change: 50.0 },
  avgOrderAmount: { value: 245000, prevValue: 232000, change: 5.6 },
  avgPartnerCount: { value: 3.8, prevValue: 3.5, change: 8.6 },
  newPartnerUsage: { value: 24, prevValue: 19, change: 26.3 },
};

// 日別アクティブユーザー（過去30日）
export const mockDailyActiveUsers = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 2 + i); // Feb 2 to Mar 3
  return {
    date: date.toISOString().split("T")[0],
    count: Math.floor(180 + Math.random() * 80 + (i > 20 ? 30 : 0)),
  };
});

// 日別注文件数（過去30日）
export const mockDailyOrders = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 2 + i);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  return {
    date: date.toISOString().split("T")[0],
    count: Math.floor((isWeekend ? 60 : 120) + Math.random() * 40),
    amount: Math.floor(((isWeekend ? 800000 : 1500000) + Math.random() * 500000)),
  };
});

// 月別離反率（過去12ヶ月）
export const mockMonthlyChurnRate = [
  { month: "2025-04", rate: 5.2 },
  { month: "2025-05", rate: 4.8 },
  { month: "2025-06", rate: 5.5 },
  { month: "2025-07", rate: 6.1 },
  { month: "2025-08", rate: 5.9 },
  { month: "2025-09", rate: 5.3 },
  { month: "2025-10", rate: 4.7 },
  { month: "2025-11", rate: 4.2 },
  { month: "2025-12", rate: 5.8 },
  { month: "2026-01", rate: 6.5 },
  { month: "2026-02", rate: 5.1 },
  { month: "2026-03", rate: 4.9 },
];

// 離反分析：顧客レベル
export const mockChurnAnalysis = {
  customers: [
    { customerCode: "C-10006", name: "居酒屋 まるよし", prevAmount: 185000, currAmount: 0, changeRate: -100, lastOrderDate: "2026-01-15" },
    { customerCode: "C-10014", name: "うどん処 讃岐", prevAmount: 120000, currAmount: 0, changeRate: -100, lastOrderDate: "2025-12-28" },
    { customerCode: "C-10003", name: "焼肉 炎", prevAmount: 245000, currAmount: 85000, changeRate: -65.3, lastOrderDate: "2026-02-10" },
    { customerCode: "C-10016", name: "ダイニングバー MOON", prevAmount: 130000, currAmount: 45000, changeRate: -65.4, lastOrderDate: "2026-02-05" },
    { customerCode: "C-10009", name: "タイ料理 バーンタイ", prevAmount: 155000, currAmount: 62000, changeRate: -60.0, lastOrderDate: "2026-02-18" },
  ],
  newCustomers: [
    { customerCode: "C-10010", name: "スペインバル EL SOL", prevAmount: 0, currAmount: 0, startDate: "2026-02-28" },
    { customerCode: "C-10018", name: "韓国料理 ソウル亭", prevAmount: 0, currAmount: 0, startDate: "2026-03-02" },
  ],
};

// 要対応ユーザー
export const mockActionItems = [
  { id: 1, type: "churn_risk" as const, customer: mockCustomers[2], reason: "先月比65%減。2週間以上ログインなし", priority: "high" as const },
  { id: 2, type: "churn_risk" as const, customer: mockCustomers[15], reason: "先月比65%減。25日以上ログインなし", priority: "high" as const },
  { id: 3, type: "churn_risk" as const, customer: mockCustomers[8], reason: "先月比60%減。注文頻度低下", priority: "medium" as const },
  { id: 4, type: "cart_abandon" as const, customer: mockCustomers[3], reason: "カート内に3商品（¥15,200）未注文", priority: "medium" as const },
  { id: 5, type: "cart_abandon" as const, customer: mockCustomers[6], reason: "カート内に2商品（¥8,400）未注文", priority: "low" as const },
];

// 配信履歴
export const mockDeliveries = [
  { id: 1, sentAt: "2026-03-03T09:00:00", type: "auto", channel: "line", target: "離反リスク顧客", sentCount: 47, openRate: 62.5, clickRate: 18.3 },
  { id: 2, sentAt: "2026-03-02T10:00:00", type: "manual", channel: "email", target: "全アクティブ顧客", sentCount: 342, openRate: 45.2, clickRate: 12.1 },
  { id: 3, sentAt: "2026-03-01T08:00:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 23, openRate: 78.3, clickRate: 34.5 },
  { id: 4, sentAt: "2026-02-28T09:00:00", type: "manual", channel: "line", target: "新規顧客フォロー", sentCount: 12, openRate: 83.3, clickRate: 41.7 },
];
