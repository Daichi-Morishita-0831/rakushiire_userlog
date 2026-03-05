import { describe, it, expect } from "vitest";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CRM_STATUS_LABELS,
  CRM_STATUS_COLORS,
} from "../types";

describe("types constants", () => {
  it("STATUS_LABELSに全ステータスが定義されている", () => {
    const expectedStatuses = [
      "ec_temporary_register",
      "manual_register",
      "waiting_for_register",
      "pre_transaction",
      "in_transaction",
      "delivery_stop",
      "stop",
    ];
    for (const status of expectedStatuses) {
      expect(STATUS_LABELS[status as keyof typeof STATUS_LABELS]).toBeDefined();
      expect(STATUS_COLORS[status as keyof typeof STATUS_COLORS]).toBeDefined();
    }
  });

  it("CRM_STATUS_LABELSに全ステータスが定義されている", () => {
    const expectedStatuses = ["active", "churn_risk", "churned", "new"];
    for (const status of expectedStatuses) {
      expect(CRM_STATUS_LABELS[status as keyof typeof CRM_STATUS_LABELS]).toBeDefined();
      expect(CRM_STATUS_COLORS[status as keyof typeof CRM_STATUS_COLORS]).toBeDefined();
    }
  });

  it("STATUS_LABELSの値が日本語文字列", () => {
    expect(STATUS_LABELS.in_transaction).toBe("取引中");
    expect(STATUS_LABELS.stop).toBe("停止");
  });
});
