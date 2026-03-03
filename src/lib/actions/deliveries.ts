"use server";

export interface Delivery {
  id: number;
  sentAt: string;
  type: "auto" | "manual";
  channel: "line" | "email" | "sms";
  target: string;
  segmentId?: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  orderRate: number;
  orderAmount: number;
  subject?: string;
  body?: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledAt?: string;
}

let mockDeliveryHistory: Delivery[] = [
  { id: 1, sentAt: "2026-03-03 09:00", type: "auto", channel: "line", target: "離反リスク顧客", sentCount: 47, openRate: 62.5, clickRate: 18.3, orderRate: 8.5, orderAmount: 245000, status: "sent" },
  { id: 2, sentAt: "2026-03-02 10:00", type: "manual", channel: "email", target: "全アクティブ顧客", sentCount: 342, openRate: 45.2, clickRate: 12.1, orderRate: 5.3, orderAmount: 1250000, status: "sent" },
  { id: 3, sentAt: "2026-03-01 08:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 23, openRate: 78.3, clickRate: 34.5, orderRate: 21.7, orderAmount: 189000, status: "sent" },
  { id: 4, sentAt: "2026-02-28 09:00", type: "manual", channel: "line", target: "新規顧客フォロー", sentCount: 12, openRate: 83.3, clickRate: 41.7, orderRate: 25.0, orderAmount: 156000, status: "sent" },
  { id: 5, sentAt: "2026-02-27 10:00", type: "auto", channel: "email", target: "再訪促進（60日）", sentCount: 31, openRate: 38.7, clickRate: 9.7, orderRate: 3.2, orderAmount: 85000, status: "sent" },
  { id: 6, sentAt: "2026-02-26 08:00", type: "manual", channel: "line", target: "3月キャンペーン告知", sentCount: 150, openRate: 71.3, clickRate: 28.0, orderRate: 12.0, orderAmount: 890000, status: "sent" },
  { id: 7, sentAt: "2026-02-25 09:00", type: "auto", channel: "line", target: "カゴ落ちユーザー", sentCount: 18, openRate: 72.2, clickRate: 33.3, orderRate: 16.7, orderAmount: 95000, status: "sent" },
  { id: 8, sentAt: "2026-02-24 10:00", type: "manual", channel: "email", target: "高単価顧客ケア", sentCount: 68, openRate: 52.9, clickRate: 17.6, orderRate: 8.8, orderAmount: 520000, status: "sent" },
];

export interface DeliveryFilters {
  channel?: "all" | "line" | "email" | "sms";
  type?: "all" | "auto" | "manual";
}

export async function getDeliveries(filters: DeliveryFilters = {}): Promise<Delivery[]> {
  let result = [...mockDeliveryHistory];
  if (filters.channel && filters.channel !== "all") {
    result = result.filter((d) => d.channel === filters.channel);
  }
  if (filters.type && filters.type !== "all") {
    result = result.filter((d) => d.type === filters.type);
  }
  return result;
}

export async function createDelivery(data: {
  channel: "line" | "email" | "sms";
  target: string;
  segmentId?: number;
  subject?: string;
  body: string;
  scheduledAt?: string;
}): Promise<Delivery> {
  const newDelivery: Delivery = {
    id: Math.max(...mockDeliveryHistory.map((d) => d.id)) + 1,
    sentAt: data.scheduledAt || new Date().toISOString().replace("T", " ").substring(0, 16),
    type: "manual",
    channel: data.channel,
    target: data.target,
    segmentId: data.segmentId,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    orderRate: 0,
    orderAmount: 0,
    subject: data.subject,
    body: data.body,
    status: data.scheduledAt ? "scheduled" : "draft",
    scheduledAt: data.scheduledAt,
  };
  mockDeliveryHistory = [newDelivery, ...mockDeliveryHistory];
  return newDelivery;
}
