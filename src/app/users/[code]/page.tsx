import { notFound } from "next/navigation";
import UserDetailClient from "./user-detail-client";
import { getCustomerByCode, getOrdersByCustomerCode } from "@/lib/actions/customers";

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
