"use server";

import { mockChurnAnalysis } from "@/lib/mock-data";

// Partner level churn data
const partnerChurnData = [
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "丸山精肉店", prevAmount: 180000, currAmount: 45000, changeRate: -75.0 },
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "鮮魚マルイチ", prevAmount: 65000, currAmount: 40000, changeRate: -38.5 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "酒類ワタナベ", prevAmount: 85000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "鮮魚マルイチ", prevAmount: 55000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10016", customerName: "ダイニングバー MOON", partnerName: "冷凍食品サトウ", prevAmount: 65000, currAmount: 20000, changeRate: -69.2 },
  { customerCode: "C-10016", customerName: "ダイニングバー MOON", partnerName: "調味料ナカムラ", prevAmount: 45000, currAmount: 25000, changeRate: -44.4 },
];

const productChurnData = [
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "丸山精肉店", productName: "黒毛和牛ロース 1kg", prevAmount: 96000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10003", customerName: "焼肉 炎", partnerName: "丸山精肉店", productName: "国産鶏もも肉 2kg", prevAmount: 48000, currAmount: 25600, changeRate: -46.7 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "酒類ワタナベ", productName: "生ビール樽 20L", prevAmount: 45000, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10006", customerName: "居酒屋 まるよし", partnerName: "鮮魚マルイチ", productName: "天然サーモン 1kg", prevAmount: 28800, currAmount: 0, changeRate: -100 },
  { customerCode: "C-10016", customerName: "ダイニングバー MOON", partnerName: "冷凍食品サトウ", productName: "冷凍枝豆 500g×10袋", prevAmount: 36000, currAmount: 9000, changeRate: -75.0 },
];

const newPartnerData = [
  { customerCode: "C-10001", customerName: "イタリアンバル ROSSO", partnerName: "製麺カトウ", startDate: "2026-02-15", currAmount: 32000 },
  { customerCode: "C-10005", customerName: "フレンチビストロ Le Ciel", partnerName: "酒類ワタナベ", startDate: "2026-02-20", currAmount: 85000 },
  { customerCode: "C-10011", customerName: "ラーメン 麺屋武蔵", partnerName: "冷凍食品サトウ", startDate: "2026-03-01", currAmount: 18000 },
];

export async function getChurnCustomers() {
  return mockChurnAnalysis.customers;
}

export async function getNewCustomers() {
  return mockChurnAnalysis.newCustomers;
}

export async function getPartnerChurnData() {
  return partnerChurnData;
}

export async function getProductChurnData() {
  return productChurnData;
}

export async function getNewPartnerData() {
  return newPartnerData;
}

export async function getChurnSummary() {
  return {
    churnCount: mockChurnAnalysis.customers.length,
    revenueLoss: mockChurnAnalysis.customers.reduce((sum, c) => sum + (c.prevAmount - c.currAmount), 0),
    newCustomerCount: mockChurnAnalysis.newCustomers.length,
    newPartnerUsageCount: newPartnerData.length,
  };
}
