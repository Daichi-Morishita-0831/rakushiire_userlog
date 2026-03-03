"use server";

import {
  mockKpi,
  mockDailyActiveUsers,
  mockDailyOrders,
  mockMonthlyChurnRate,
  mockActionItems,
  mockDeliveries,
} from "@/lib/mock-data";

export async function getDashboardKpi() {
  return mockKpi;
}

export async function getDailyActiveUsers() {
  return mockDailyActiveUsers;
}

export async function getDailyOrders() {
  return mockDailyOrders;
}

export async function getMonthlyChurnRate() {
  return mockMonthlyChurnRate;
}

export async function getActionItems() {
  return mockActionItems;
}

export async function getRecentDeliveries() {
  return mockDeliveries;
}
