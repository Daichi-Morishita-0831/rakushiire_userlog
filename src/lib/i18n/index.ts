export { ja } from "./ja";
export type { Locale } from "./ja";

/**
 * 現在のロケールテキストを取得
 * 将来の多言語対応時にロケール切替ロジックをここに追加
 */
export function getTexts() {
  // 現在は日本語のみ
  // 将来: ブラウザ設定やユーザー設定に基づいてロケールを切替
  return import("./ja").then((m) => m.ja);
}
