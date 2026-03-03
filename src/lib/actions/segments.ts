"use server";

import type { Segment, SegmentConditionGroup } from "@/lib/segment-fields";

// Re-export types for convenience
export type { Segment, SegmentCondition, SegmentConditionGroup } from "@/lib/segment-fields";

// Mock segments with condition data
const mockSegmentsWithConditions: Segment[] = [
  {
    id: 1, name: "離反リスク（30日未注文）", type: "dynamic", memberCount: 47, lastUpdated: "2026-03-03", createdAt: "2026-01-15",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "lastOrderDaysAgo", operator: "gte", value: 30 }, { id: "c2", field: "crmStatus", operator: "eq", value: "churn_risk" }] }],
  },
  {
    id: 2, name: "高単価顧客（月20万以上）", type: "dynamic", memberCount: 68, lastUpdated: "2026-03-03", createdAt: "2026-01-15",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "monthlyOrderAmount", operator: "gte", value: 200000 }] }],
  },
  {
    id: 3, name: "新規顧客（30日以内）", type: "dynamic", memberCount: 18, lastUpdated: "2026-03-03", createdAt: "2026-02-01",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "startTradingDaysAgo", operator: "lte", value: 30 }] }],
  },
  {
    id: 4, name: "LINE未連携", type: "dynamic", memberCount: 89, lastUpdated: "2026-03-03", createdAt: "2026-02-01",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "lineConnected", operator: "eq", value: "false" }] }],
  },
  {
    id: 5, name: "3月キャンペーン対象", type: "static", memberCount: 150, lastUpdated: "2026-03-01", createdAt: "2026-03-01",
    conditionGroups: [],
  },
  {
    id: 6, name: "カゴ落ちユーザー", type: "dynamic", memberCount: 23, lastUpdated: "2026-03-03", createdAt: "2026-02-15",
    conditionGroups: [{ id: "g1", logic: "AND", conditions: [{ id: "c1", field: "crmStatus", operator: "eq", value: "active" }] }],
  },
];

let segments = [...mockSegmentsWithConditions];

export async function getSegments(): Promise<Segment[]> {
  return segments;
}

export async function getSegmentById(id: number): Promise<Segment | null> {
  return segments.find((s) => s.id === id) ?? null;
}

export async function createSegment(data: {
  name: string;
  type: "dynamic" | "static";
  description?: string;
  conditionGroups: SegmentConditionGroup[];
}): Promise<Segment> {
  const newSegment: Segment = {
    id: Math.max(...segments.map((s) => s.id)) + 1,
    name: data.name,
    type: data.type,
    description: data.description,
    conditionGroups: data.conditionGroups,
    memberCount: Math.floor(Math.random() * 100) + 10,
    lastUpdated: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString().split("T")[0],
  };
  segments = [...segments, newSegment];
  return newSegment;
}

export async function deleteSegment(id: number): Promise<boolean> {
  const prev = segments.length;
  segments = segments.filter((s) => s.id !== id);
  return segments.length < prev;
}
