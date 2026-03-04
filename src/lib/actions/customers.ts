"use server";

import { mockCustomers, mockOrders } from "@/lib/mock-data";
import type { CrmCustomer, CrmOrder, CrmStatus } from "@/lib/types";
// import { prisma, isDbConnected } from "@/lib/prisma";

export interface CustomerFilters {
  search?: string;
  crmStatus?: CrmStatus | "all";
  lineConnected?: "all" | "connected" | "not_connected";
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export async function getCustomers(filters: CustomerFilters = {}): Promise<CrmCustomer[]> {
  // TODO: DB接続時は以下のPrismaクエリに切り替え
  // if (isDbConnected) {
  //   const where: any = { deletedAt: null };
  //   if (filters.search) {
  //     where.OR = [
  //       { customerCode: { contains: filters.search } },
  //       { customerName1: { contains: filters.search } },
  //       { address2: { contains: filters.search } },
  //     ];
  //   }
  //   const customers = await prisma.customer.findMany({
  //     where,
  //     include: { partner: true, accountCustomers: { include: { account: { include: { socialiteProviders: true } } } } },
  //     orderBy: { [filters.sortBy || "createdAt"]: filters.sortDir || "desc" },
  //   });
  //   return customers.map(transformCustomer);
  // }

  let result = [...mockCustomers];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.customerCode.toLowerCase().includes(q) ||
        c.customerName1.toLowerCase().includes(q) ||
        c.address2.toLowerCase().includes(q)
    );
  }

  if (filters.crmStatus && filters.crmStatus !== "all") {
    result = result.filter((c) => c.crmStatus === filters.crmStatus);
  }

  if (filters.lineConnected && filters.lineConnected !== "all") {
    result = result.filter((c) =>
      filters.lineConnected === "connected" ? c.lineConnected : !c.lineConnected
    );
  }

  const sortBy = filters.sortBy || "monthlyOrderAmount";
  const sortDir = filters.sortDir || "desc";
  result.sort((a, b) => {
    const aVal = a[sortBy as keyof typeof a] ?? 0;
    const bVal = b[sortBy as keyof typeof b] ?? 0;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    }
    return 0;
  });

  return result;
}

export async function getCustomerByCode(code: string): Promise<CrmCustomer | null> {
  // TODO: DB接続時
  // if (isDbConnected) {
  //   const customer = await prisma.customer.findUnique({
  //     where: { customerCode: code, deletedAt: null },
  //     include: { partner: true, accountCustomers: { include: { account: { include: { socialiteProviders: true } } } } },
  //   });
  //   return customer ? transformCustomer(customer) : null;
  // }

  return mockCustomers.find((c) => c.customerCode === code) ?? null;
}

export async function getOrdersByCustomerCode(code: string): Promise<CrmOrder[]> {
  // TODO: DB接続時
  // if (isDbConnected) {
  //   const orders = await prisma.smileOrder.findMany({
  //     where: { customerCode: code, deletedAt: null },
  //     include: { businessPartner: true, orderItems: { include: { product: true } } },
  //     orderBy: { deliveryDate: "desc" },
  //   });
  //   return orders.map(transformOrder);
  // }

  return mockOrders.filter((o) => o.customerCode === code);
}

export async function getCustomerCount(): Promise<number> {
  // TODO: DB接続時
  // if (isDbConnected) {
  //   return prisma.customer.count({ where: { deletedAt: null, status: "in_transaction" } });
  // }

  return mockCustomers.length;
}

// ============================================================
// Transform functions (Prisma → CrmCustomer/CrmOrder)
// DB接続時にアンコメントして使用
// ============================================================

// function transformCustomer(c: any): CrmCustomer {
//   const lineProvider = c.accountCustomers
//     ?.flatMap((ac: any) => ac.account?.socialiteProviders ?? [])
//     ?.find((sp: any) => sp.provider === "line" && sp.isFriend);
//
//   // CRMステータスの算出ロジック
//   const lastOrder = await prisma.smileOrder.findFirst({
//     where: { customerCode: c.customerCode },
//     orderBy: { deliveryDate: "desc" },
//   });
//   const daysSinceLastOrder = lastOrder
//     ? Math.floor((Date.now() - lastOrder.deliveryDate.getTime()) / (1000 * 60 * 60 * 24))
//     : Infinity;
//
//   let crmStatus: CrmStatus = "active";
//   if (c.status === "pre_transaction" || c.status === "ec_temporary_register") crmStatus = "new";
//   else if (daysSinceLastOrder > 60) crmStatus = "churned";
//   else if (daysSinceLastOrder > 30) crmStatus = "churn_risk";
//
//   return {
//     id: c.id,
//     customerCode: c.customerCode,
//     customerName1: c.customerName1,
//     address1: c.address1 ?? "",
//     address2: c.address2 ?? "",
//     status: c.status,
//     crmStatus,
//     lineConnected: !!lineProvider,
//     lastLoginAt: null, // TODO: ECログイン日時（PDM確認後）
//     lastOrderDate: lastOrder?.deliveryDate?.toISOString().split("T")[0] ?? null,
//     monthlyOrderAmount: 0, // TODO: 集計クエリ
//     monthlyOrderCount: 0,
//     partnerCount: 0, // TODO: 集計クエリ
//     salesPersonName: c.salesPersonName ?? "",
//     shopCategory: c.shopCategory ?? "",
//     startTradingDate: c.startTradingDate?.toISOString().split("T")[0] ?? "",
//     email: c.email ?? "",
//     cellphone: c.cellphone ?? "",
//   };
// }

// function transformOrder(o: any): CrmOrder {
//   return {
//     id: o.id,
//     orderNumber: o.orderNumber,
//     customerCode: o.customerCode,
//     deliveryDate: o.deliveryDate.toISOString().split("T")[0],
//     partnerName: o.businessPartner?.name ?? "",
//     productName: o.orderItems?.[0]?.product?.productName ?? "",
//     amount: o.amount ?? 0,
//     totalAmount: o.totalAmount ?? 0,
//     status: o.status,
//     orderType: o.orderType ?? "",
//   };
// }
