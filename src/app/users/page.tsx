import type { Metadata } from "next";
import UsersClient from "./users-client";

export const metadata: Metadata = { title: "ユーザー一覧" };
import { getCustomers, getCustomerCount } from "@/lib/actions/customers";

export default async function UsersPage() {
  const [customers, totalCount] = await Promise.all([
    getCustomers(),
    getCustomerCount(),
  ]);

  return <UsersClient customers={customers} totalCount={totalCount} />;
}
