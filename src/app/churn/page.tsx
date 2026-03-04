import ChurnClient from "./churn-client";
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
