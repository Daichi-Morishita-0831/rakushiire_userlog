import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UserDetailClient from "./user-detail-client";
import { getCustomerByCode, getOrdersByCustomerCode } from "@/lib/actions/customers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const customer = await getCustomerByCode(code);
  return { title: customer ? `${customer.customerName1} (${code})` : code };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [customer, orders] = await Promise.all([
    getCustomerByCode(code),
    getOrdersByCustomerCode(code),
  ]);

  if (!customer) {
    notFound();
  }

  return <UserDetailClient customer={customer} orders={orders} />;
}
