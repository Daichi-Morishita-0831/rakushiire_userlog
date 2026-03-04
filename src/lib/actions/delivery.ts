"use server";

export interface DeliverySegment {
  id: number;
  name: string;
  memberCount: number;
}

const mockSegments: DeliverySegment[] = [
  { id: 1, name: "離反リスク（30日未注文）", memberCount: 47 },
  { id: 2, name: "高単価顧客（月20万以上）", memberCount: 68 },
  { id: 3, name: "新規顧客（30日以内）", memberCount: 18 },
  { id: 4, name: "LINE未連携", memberCount: 89 },
  { id: 5, name: "3月キャンペーン対象", memberCount: 150 },
  { id: 6, name: "カゴ落ちユーザー", memberCount: 23 },
];

export async function getDeliverySegments(): Promise<DeliverySegment[]> {
  return mockSegments;
}
