import type { Metadata } from "next";
import ChurnClient from "./churn-client";

export const metadata: Metadata = { title: "離反/新規分析" };
import {
  getChurnCustomers,
  getNewCustomers,
  getPartnerChurnData,
  getProductChurnData,
  getNewPartnerData,
  getChurnSummary,
} from "@/lib/actions/churn";

export default async function ChurnAnalysisPage() {
  const [customers, newCustomers, partnerChurn, productChurn, newPartnerUsage, summary] =
    await Promise.all([
      getChurnCustomers(),
      getNewCustomers(),
      getPartnerChurnData(),
      getProductChurnData(),
      getNewPartnerData(),
      getChurnSummary(),
    ]);

  return (
    <ChurnClient
      data={{ customers, newCustomers, partnerChurn, productChurn, newPartnerUsage, summary }}
    />
  );
}
