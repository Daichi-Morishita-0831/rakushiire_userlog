"use server";

import { mockCustomers, mockOrders, type MockCustomer, type MockOrder, type CrmStatus } from "@/lib/mock-data";

export interface CustomerFilters {
  search?: string;
  crmStatus?: CrmStatus | "all";
  lineConnected?: "all" | "connected" | "not_connected";
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export async function getCustomers(filters: CustomerFilters = {}): Promise<MockCustomer[]> {
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

export async function getCustomerByCode(code: string): Promise<MockCustomer | null> {
  return mockCustomers.find((c) => c.customerCode === code) ?? null;
}

export async function getOrdersByCustomerCode(code: string): Promise<MockOrder[]> {
  return mockOrders.filter((o) => o.customerCode === code);
}

export async function getCustomerCount(): Promise<number> {
  return mockCustomers.length;
}
