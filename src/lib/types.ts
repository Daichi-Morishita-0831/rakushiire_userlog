// ============================================================
// Shared type definitions for rakushiire-crm
// Types, constants, and labels used across the application.
// Separated from mock-data.ts for reuse in both mock and DB implementations.
// ============================================================

// --- Customer Status (EC-backend準拠) ---

export type CustomerStatus =
  | "ec_temporary_register"
  | "manual_register"
  | "waiting_for_register"
  | "pre_transaction"
  | "in_transaction"
  | "delivery_stop"
  | "stop";

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  ec_temporary_register: "EC仮登録",
  manual_register: "手動登録",
  waiting_for_register: "登録待ち",
  pre_transaction: "取引前",
  in_transaction: "取引中",
  delivery_stop: "配送停止",
  stop: "停止",
};

export const STATUS_COLORS: Record<CustomerStatus, string> = {
  ec_temporary_register: "bg-gray-100 text-gray-700",
  manual_register: "bg-gray-100 text-gray-700",
  waiting_for_register: "bg-yellow-100 text-yellow-700",
  pre_transaction: "bg-blue-100 text-blue-700",
  in_transaction: "bg-green-100 text-green-700",
  delivery_stop: "bg-orange-100 text-orange-700",
  stop: "bg-red-100 text-red-700",
};

// --- CRM Status (離反分析用・CRM独自) ---

export type CrmStatus = "active" | "churn_risk" | "churned" | "new";

export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  active: "アクティブ",
  churn_risk: "離反リスク",
  churned: "離反",
  new: "新規",
};

export const CRM_STATUS_COLORS: Record<CrmStatus, string> = {
  active: "bg-green-100 text-green-700",
  churn_risk: "bg-orange-100 text-orange-700",
  churned: "bg-red-100 text-red-700",
  new: "bg-blue-100 text-blue-700",
};

// --- Data Interfaces ---

export interface CrmCustomer {
  id: number;
  customerCode: string;
  customerName1: string;
  address1: string;
  address2: string;
  status: CustomerStatus;
  crmStatus: CrmStatus;
  lineConnected: boolean;
  lastLoginAt: string | null;
  lastOrderDate: string | null;
  monthlyOrderAmount: number;
  monthlyOrderCount: number;
  partnerCount: number;
  salesPersonName: string;
  shopCategory: string;
  startTradingDate: string;
  email: string;
  cellphone: string;
}

export interface CrmOrder {
  id: number;
  orderNumber: string;
  customerCode: string;
  deliveryDate: string;
  partnerName: string;
  productName: string;
  amount: number;
  totalAmount: number;
  status: string;
  orderType: string;
}

export interface CrmPartner {
  id: number;
  code: string;
  name: string;
  type: "parent" | "children";
}

// --- Dashboard Types ---

export interface KpiItem {
  value: number;
  prevValue: number;
  change: number;
}

export interface DashboardKpi {
  activeUsers: KpiItem;
  churnRiskUsers: KpiItem;
  newUsers: KpiItem;
  avgOrderAmount: KpiItem;
  avgPartnerCount: KpiItem;
  newPartnerUsage: KpiItem;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
  amount?: number;
}

export interface ChurnRatePoint {
  month: string;
  rate: number;
}

export interface ActionItem {
  id: number;
  type: "churn_risk" | "cart_abandon";
  customer: CrmCustomer;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface DeliverySummary {
  id: number;
  sentAt: string;
  type: string;
  channel: string;
  target: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
}

// --- Churn Analysis Types ---

export interface ChurnCustomer {
  customerCode: string;
  name: string;
  prevAmount: number;
  currAmount: number;
  changeRate: number;
  lastOrderDate: string;
}

export interface NewCustomer {
  customerCode: string;
  name: string;
  prevAmount: number;
  currAmount: number;
  startDate: string;
}

export interface PartnerChurn {
  customerCode: string;
  customerName: string;
  partnerName: string;
  prevAmount: number;
  currAmount: number;
  changeRate: number;
}

export interface ProductChurn {
  customerCode: string;
  customerName: string;
  partnerName: string;
  productName: string;
  prevAmount: number;
  currAmount: number;
  changeRate: number;
}

export interface NewPartnerUsage {
  customerCode: string;
  customerName: string;
  partnerName: string;
  startDate: string;
  currAmount: number;
}

export interface ChurnSummary {
  churnCount: number;
  revenueLoss: number;
  newCustomerCount: number;
  newPartnerUsageCount: number;
}
