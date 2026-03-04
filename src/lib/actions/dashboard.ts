"use server";

import {
  mockKpi,
  mockDailyActiveUsers,
  mockDailyOrders,
  mockMonthlyChurnRate,
  mockActionItems,
  mockDeliveries,
} from "@/lib/mock-data";
import type {
  DashboardKpi,
  TimeSeriesPoint,
  ChurnRatePoint,
  ActionItem,
  DeliverySummary,
} from "@/lib/types";
// import { prisma, isDbConnected } from "@/lib/prisma";

export async function getDashboardKpi(): Promise<DashboardKpi> {
  // TODO: DB接続時
  // if (isDbConnected) {
  //   const now = new Date();
  //   const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //   const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  //   const activeUsers = await prisma.customer.count({
  //     where: { status: "in_transaction", deletedAt: null, smileOrders: { some: { deliveryDate: { gte: thisMonth } } } },
  //   });
  //   // ... similar for other KPIs
  // }
  return mockKpi;
}

export async function getDailyActiveUsers(): Promise<TimeSeriesPoint[]> {
  return mockDailyActiveUsers;
}

export async function getDailyOrders(): Promise<TimeSeriesPoint[]> {
  return mockDailyOrders;
}

export async function getMonthlyChurnRate(): Promise<ChurnRatePoint[]> {
  return mockMonthlyChurnRate;
}

export async function getActionItems(): Promise<ActionItem[]> {
  return mockActionItems;
}

export async function getRecentDeliveries(): Promise<DeliverySummary[]> {
  return mockDeliveries;
}
