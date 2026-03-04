import type { Metadata } from "next";
import DashboardClient from "./dashboard-client";

export const metadata: Metadata = { title: "ダッシュボード" };
import {
  getDashboardKpi,
  getDailyActiveUsers,
  getDailyOrders,
  getMonthlyChurnRate,
  getActionItems,
  getRecentDeliveries,
} from "@/lib/actions/dashboard";

export default async function DashboardPage() {
  const [kpi, dailyActiveUsers, dailyOrders, monthlyChurnRate, actionItems, recentDeliveries] =
    await Promise.all([
      getDashboardKpi(),
      getDailyActiveUsers(),
      getDailyOrders(),
      getMonthlyChurnRate(),
      getActionItems(),
      getRecentDeliveries(),
    ]);

  return (
    <DashboardClient
      data={{ kpi, dailyActiveUsers, dailyOrders, monthlyChurnRate, actionItems, recentDeliveries }}
    />
  );
}
