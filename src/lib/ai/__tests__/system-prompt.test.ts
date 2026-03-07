import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "../system-prompt";
import type { CustomerContext } from "../types";

describe("buildSystemPrompt", () => {
  it("顧客情報なしの場合、汎用プロンプトを返す", () => {
    const prompt = buildSystemPrompt(null);

    expect(prompt).toContain("ラクシーレ");
    expect(prompt).toContain("AIカスタマーサポート");
    expect(prompt).toContain("顧客情報が見つかりませんでした");
    expect(prompt).toContain("order_change");
    expect(prompt).toContain("quality_complaint");
    expect(prompt).toContain("payment_billing");
  });

  it("顧客情報ありの場合、コンテキストを注入する", () => {
    const customer: CustomerContext = {
      customerCode: "C-10001",
      customerName: "イタリアンバル ROSSO",
      shopCategory: "イタリアン",
      status: "in_transaction",
      crmStatus: "active",
      salesPersonName: "田中太郎",
      lastOrderDate: "2026-03-01",
      monthlyOrderAmount: 284500,
      monthlyOrderCount: 12,
      recentOrders: [
        {
          orderNumber: "20260301-001",
          deliveryDate: "2026-03-01",
          partnerName: "丸山精肉店",
          productName: "国産鶏もも肉 2kg",
          amount: 3200,
          status: "delivered",
        },
      ],
    };

    const prompt = buildSystemPrompt(customer);

    expect(prompt).toContain("イタリアンバル ROSSO");
    expect(prompt).toContain("C-10001");
    expect(prompt).toContain("田中太郎");
    expect(prompt).toContain("イタリアン");
    expect(prompt).toContain("¥284,500");
    expect(prompt).toContain("12回");
    expect(prompt).toContain("丸山精肉店");
    expect(prompt).toContain("国産鶏もも肉 2kg");
    expect(prompt).not.toContain("顧客情報が見つかりませんでした");
  });

  it("離反リスク顧客には注意メッセージが含まれる", () => {
    const customer: CustomerContext = {
      customerCode: "C-10003",
      customerName: "焼肉 炎",
      shopCategory: "焼肉",
      status: "in_transaction",
      crmStatus: "churn_risk",
      salesPersonName: "鈴木花子",
      lastOrderDate: "2026-02-10",
      monthlyOrderAmount: 85000,
      monthlyOrderCount: 3,
      recentOrders: [],
    };

    const prompt = buildSystemPrompt(customer);

    expect(prompt).toContain("離反リスク");
    expect(prompt).toContain("丁寧な対応");
  });

  it("新規顧客には新規向けメッセージが含まれる", () => {
    const customer: CustomerContext = {
      customerCode: "C-10010",
      customerName: "スペインバル EL SOL",
      shopCategory: "スペイン料理",
      status: "pre_transaction",
      crmStatus: "new",
      salesPersonName: "佐藤次郎",
      lastOrderDate: null,
      monthlyOrderAmount: 0,
      monthlyOrderCount: 0,
      recentOrders: [],
    };

    const prompt = buildSystemPrompt(customer);

    expect(prompt).toContain("新規");
    expect(prompt).toContain("注文履歴なし");
  });

  it("離反顧客には復帰促進メッセージが含まれる", () => {
    const customer: CustomerContext = {
      customerCode: "C-10006",
      customerName: "居酒屋 まるよし",
      shopCategory: "居酒屋",
      status: "in_transaction",
      crmStatus: "churned",
      salesPersonName: "鈴木花子",
      lastOrderDate: "2026-01-15",
      monthlyOrderAmount: 0,
      monthlyOrderCount: 0,
      recentOrders: [],
    };

    const prompt = buildSystemPrompt(customer);

    expect(prompt).toContain("離反状態");
    expect(prompt).toContain("新商品");
  });

  it("7つの問い合わせカテゴリがすべて含まれる", () => {
    const prompt = buildSystemPrompt(null);

    const categories = [
      "order_change",
      "product_price",
      "delivery_shipping",
      "quality_complaint",
      "account_system",
      "payment_billing",
      "registration",
    ];

    for (const category of categories) {
      expect(prompt).toContain(category);
    }
  });

  it("エスカレーション基準が含まれる", () => {
    const prompt = buildSystemPrompt(null);

    expect(prompt).toContain("エスカレーション");
    expect(prompt).toContain("全件エスカレーション");
    expect(prompt).toContain("基本エスカレーション");
    expect(prompt).toContain("needsHumanSupport");
  });

  it("JSON回答フォーマットが含まれる", () => {
    const prompt = buildSystemPrompt(null);

    expect(prompt).toContain('"reply"');
    expect(prompt).toContain('"category"');
    expect(prompt).toContain('"needsHumanSupport"');
    expect(prompt).toContain('"escalationReason"');
    expect(prompt).toContain('"confidence"');
  });
});
