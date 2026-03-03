// Segment condition fields and operators (shared between client and server)

export interface SegmentCondition {
  id: string;
  field: string;
  operator: string;
  value: string | number;
}

export interface SegmentConditionGroup {
  id: string;
  logic: "AND" | "OR";
  conditions: SegmentCondition[];
}

export interface Segment {
  id: number;
  name: string;
  type: "dynamic" | "static";
  description?: string;
  conditionGroups: SegmentConditionGroup[];
  memberCount: number;
  lastUpdated: string;
  createdAt: string;
}

export const SEGMENT_FIELDS = [
  { value: "monthlyOrderAmount", label: "今月注文額", type: "number" as const },
  { value: "monthlyOrderCount", label: "今月注文回数", type: "number" as const },
  { value: "partnerCount", label: "利用パートナー数", type: "number" as const },
  { value: "crmStatus", label: "CRMステータス", type: "select" as const, options: ["active", "churn_risk", "churned", "new"] },
  { value: "lineConnected", label: "LINE連携", type: "boolean" as const },
  { value: "lastOrderDaysAgo", label: "最終注文からの日数", type: "number" as const },
  { value: "lastLoginDaysAgo", label: "最終ログインからの日数", type: "number" as const },
  { value: "shopCategory", label: "業態", type: "select" as const, options: ["イタリアン", "和食", "焼肉", "中華", "フレンチ", "居酒屋", "カフェ", "寿司", "ラーメン", "串焼き", "鉄板焼", "うどん", "ビストロ", "ダイニングバー", "天ぷら", "韓国料理", "焼鳥", "パスタ", "タイ料理", "スペイン料理"] },
  { value: "address1", label: "都道府県", type: "select" as const, options: ["東京都", "千葉県", "神奈川県", "埼玉県"] },
  { value: "startTradingDaysAgo", label: "取引開始からの日数", type: "number" as const },
];

export const OPERATORS = {
  number: [
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
    { value: "eq", label: "=" },
  ],
  select: [
    { value: "eq", label: "=" },
    { value: "neq", label: "≠" },
  ],
  boolean: [
    { value: "eq", label: "=" },
  ],
} as const;
