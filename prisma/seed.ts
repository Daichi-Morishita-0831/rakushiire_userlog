/**
 * Prisma Seed Script
 * DB接続後にテストデータを投入するスクリプト
 *
 * 実行方法:
 *   npx tsx prisma/seed.ts
 *
 * package.jsonに以下を追加:
 *   "prisma": { "seed": "npx tsx prisma/seed.ts" }
 *
 * その後:
 *   npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Business Partners ---
  const partners = [
    { code: "BP001", name: "丸山精肉店", type: "children" },
    { code: "BP002", name: "鮮魚マルイチ", type: "children" },
    { code: "BP003", name: "調味料ナカムラ", type: "children" },
    { code: "BP004", name: "乳製品ヨシダ", type: "children" },
    { code: "BP005", name: "冷凍食品サトウ", type: "children" },
    { code: "BP006", name: "米穀タナカ", type: "children" },
    { code: "BP007", name: "酒類ワタナベ", type: "children" },
    { code: "BP008", name: "製麺カトウ", type: "children" },
  ];

  for (const p of partners) {
    await prisma.businessPartner.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  console.log(`  ✅ ${partners.length} business partners`);

  // --- Products (MorikiProduct) ---
  const products = [
    { productName: "国産鶏もも肉 2kg", partnerCode: "BP001", retailUnitPrice: 3200 },
    { productName: "豚バラブロック 3kg", partnerCode: "BP001", retailUnitPrice: 6900 },
    { productName: "黒毛和牛ロース 1kg", partnerCode: "BP001", retailUnitPrice: 12000 },
    { productName: "天然サーモン 1kg", partnerCode: "BP002", retailUnitPrice: 4800 },
    { productName: "活ホタテ 2kg", partnerCode: "BP002", retailUnitPrice: 7200 },
    { productName: "特製だし醤油 1L×6本", partnerCode: "BP003", retailUnitPrice: 5400 },
    { productName: "モッツァレラチーズ 1kg", partnerCode: "BP004", retailUnitPrice: 3800 },
    { productName: "冷凍枝豆 500g×10袋", partnerCode: "BP005", retailUnitPrice: 4500 },
    { productName: "こしひかり 10kg", partnerCode: "BP006", retailUnitPrice: 5000 },
    { productName: "生ビール樽 20L", partnerCode: "BP007", retailUnitPrice: 15000 },
    { productName: "生パスタ（フェットチーネ）1kg", partnerCode: "BP008", retailUnitPrice: 1800 },
  ];

  for (const p of products) {
    await prisma.morikiProduct.upsert({
      where: { id: products.indexOf(p) + 1 },
      update: {},
      create: p,
    });
  }
  console.log(`  ✅ ${products.length} products`);

  // --- Customers ---
  const customers = [
    { customerCode: "C-10001", customerName1: "イタリアンバル ROSSO", address1: "東京都", address2: "渋谷区神南1-2-3", status: "in_transaction", partnerCode: "BP001", salesPersonName: "田中太郎", shopCategory: "イタリアン", startTradingDate: new Date("2024-06-15"), email: "rosso@example.com", cellphone: "090-1234-5678" },
    { customerCode: "C-10002", customerName1: "和食処 さくら", address1: "東京都", address2: "新宿区歌舞伎町2-5-1", status: "in_transaction", partnerCode: "BP002", salesPersonName: "田中太郎", shopCategory: "和食", startTradingDate: new Date("2023-11-01"), email: "sakura@example.com", cellphone: "090-2345-6789" },
    { customerCode: "C-10003", customerName1: "焼肉 炎", address1: "東京都", address2: "港区六本木3-8-2", status: "in_transaction", partnerCode: "BP001", salesPersonName: "鈴木花子", shopCategory: "焼肉", startTradingDate: new Date("2024-01-20"), email: "yakiniku-en@example.com", cellphone: "090-3456-7890" },
    { customerCode: "C-10004", customerName1: "中華料理 龍鳳", address1: "東京都", address2: "豊島区池袋1-10-5", status: "in_transaction", partnerCode: "BP003", salesPersonName: "佐藤次郎", shopCategory: "中華", startTradingDate: new Date("2023-04-10"), email: "ryuhou@example.com", cellphone: "090-4567-8901" },
    { customerCode: "C-10005", customerName1: "フレンチビストロ Le Ciel", address1: "東京都", address2: "目黒区中目黒2-4-8", status: "in_transaction", partnerCode: "BP002", salesPersonName: "田中太郎", shopCategory: "フレンチ", startTradingDate: new Date("2022-09-01"), email: "leciel@example.com", cellphone: "090-5678-9012" },
    { customerCode: "C-10006", customerName1: "居酒屋 まるよし", address1: "東京都", address2: "台東区上野4-7-2", status: "in_transaction", partnerCode: "BP007", salesPersonName: "鈴木花子", shopCategory: "居酒屋", startTradingDate: new Date("2024-03-01"), email: "maruyoshi@example.com", cellphone: "090-6789-0123" },
    { customerCode: "C-10007", customerName1: "カフェ GREEN LEAF", address1: "東京都", address2: "世田谷区三軒茶屋1-3-6", status: "in_transaction", partnerCode: "BP004", salesPersonName: "佐藤次郎", shopCategory: "カフェ", startTradingDate: new Date("2025-01-15"), email: "greenleaf@example.com", cellphone: "090-7890-1234" },
    { customerCode: "C-10008", customerName1: "寿司 匠", address1: "東京都", address2: "中央区銀座5-12-1", status: "in_transaction", partnerCode: "BP002", salesPersonName: "田中太郎", shopCategory: "寿司", startTradingDate: new Date("2022-05-20"), email: "sushi-takumi@example.com", cellphone: "090-8901-2345" },
    { customerCode: "C-10009", customerName1: "タイ料理 バーンタイ", address1: "東京都", address2: "新宿区大久保1-8-3", status: "in_transaction", partnerCode: "BP003", salesPersonName: "鈴木花子", shopCategory: "タイ料理", startTradingDate: new Date("2025-06-01"), email: "baanthai@example.com", cellphone: "090-9012-3456" },
    { customerCode: "C-10010", customerName1: "スペインバル EL SOL", address1: "東京都", address2: "渋谷区恵比寿南3-2-7", status: "pre_transaction", partnerCode: "BP001", salesPersonName: "佐藤次郎", shopCategory: "スペイン料理", startTradingDate: new Date("2026-02-28"), email: "elsol@example.com", cellphone: "090-0123-4567" },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { customerCode: c.customerCode },
      update: {},
      create: c,
    });
  }
  console.log(`  ✅ ${customers.length} customers`);

  // --- Accounts ---
  const accounts = [
    { email: "rosso@example.com", password: "hashed_password", username: "ROSSO" },
    { email: "sakura@example.com", password: "hashed_password", username: "さくら" },
    { email: "yakiniku-en@example.com", password: "hashed_password", username: "焼肉炎" },
  ];

  for (const a of accounts) {
    await prisma.account.upsert({
      where: { email: a.email },
      update: {},
      create: a,
    });
  }
  console.log(`  ✅ ${accounts.length} accounts`);

  // --- SocialiteProvider (LINE連携) ---
  const account1 = await prisma.account.findUnique({ where: { email: "rosso@example.com" } });
  const account2 = await prisma.account.findUnique({ where: { email: "sakura@example.com" } });

  if (account1) {
    await prisma.socialiteProvider.create({
      data: { provider: "line", providerId: "U1234567890abcdef1234567890abcdef", accountId: account1.id, isFriend: true },
    }).catch(() => {}); // ignore duplicate
  }
  if (account2) {
    await prisma.socialiteProvider.create({
      data: { provider: "line", providerId: "U2345678901abcdef2345678901abcdef", accountId: account2.id, isFriend: true },
    }).catch(() => {});
  }
  console.log("  ✅ socialite providers (LINE)");

  // --- CRM Segments ---
  const segments = [
    { name: "離反リスク（30日未注文）", type: "dynamic", conditions: { groups: [{ logic: "AND", conditions: [{ field: "lastOrderDaysAgo", operator: "gte", value: 30 }] }] }, memberCount: 47 },
    { name: "高単価顧客（月20万以上）", type: "dynamic", conditions: { groups: [{ logic: "AND", conditions: [{ field: "monthlyOrderAmount", operator: "gte", value: 200000 }] }] }, memberCount: 68 },
    { name: "新規顧客（30日以内）", type: "dynamic", conditions: { groups: [{ logic: "AND", conditions: [{ field: "startTradingDaysAgo", operator: "lte", value: 30 }] }] }, memberCount: 18 },
    { name: "LINE未連携", type: "dynamic", conditions: { groups: [{ logic: "AND", conditions: [{ field: "lineConnected", operator: "eq", value: false }] }] }, memberCount: 89 },
    { name: "カゴ落ちユーザー", type: "dynamic", conditions: { groups: [] }, memberCount: 23 },
  ];

  for (const s of segments) {
    await prisma.segment.create({ data: s });
  }
  console.log(`  ✅ ${segments.length} segments`);

  // --- CRM Automation Rules ---
  const rules = [
    { name: "離反リスク通知", triggerType: "no_order", triggerConfig: { days: 30 }, actionChannel: "line", actionMessage: "最近ご注文がないようですが、いかがでしょうか？", cooldownDays: 14, isActive: true },
    { name: "カゴ落ちリマインド", triggerType: "cart_abandon", triggerConfig: { hours: 24 }, actionChannel: "line", actionMessage: "カートに商品が残っています。", actionDelay: 1440, cooldownDays: 3, isActive: true },
    { name: "新規フォローアップ", triggerType: "new_customer", triggerConfig: { days: 3 }, actionChannel: "email", actionMessage: "ご利用ありがとうございます。", actionDelay: 4320, cooldownDays: 30, isActive: true },
  ];

  for (const r of rules) {
    await prisma.automationRule.create({ data: r });
  }
  console.log(`  ✅ ${rules.length} automation rules`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
