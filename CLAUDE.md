# rakushiire-crm

## プロジェクト概要
rakushiire.com のユーザー行動を可視化し、CRMチームがコミュニケーション（LINE/メール/SMS）を送れる管理ツール。

## 関連サービス
- rakushiire.com: 顧客向けサービス（飲食店向け仕入れ最適化）
- vege-tal.com: 既存管理画面（BPaaS）
- Kintone: 対応履歴蓄積（既存利用中）
- Liny: LINE配信管理（既存利用中・友だち5,772人）
- GA4: アクセス解析（導入済み）

## 運営会社
ベジクル（vegekul）- 業務用野菜卸売業者。ラクシーレは青果以外も含むワンストップ仕入れサービス。

## 既存システム技術スタック（2026-03-03 調査完了）
- EC Backend: PHP 8.2 / Laravel 11 / MySQL 8.0 / Laravel Sanctum
- EC Frontend: Next.js 14 / React 18 / TypeScript
- BPaaS Backend: PHP 8.2 / Laravel 11 / PostgreSQL 13
- BPaaS Frontend: React 18 / Vite / MUI v5
- ActivityLog: Laravel 11 / AWS DocumentDB（MongoDB互換）
- メール: AWS SES
- キュー: AWS SQS（28+キュー）
- ストレージ: AWS S3
- リアルタイム: Pusher WebSocket
- LINE: OAuth Social Login（2アカウント: 都心便 / ネットスーパーマーケット）
- SMS: なし（FAXのみ: Faximo）
- 開発会社: Kozocom（GitHub org: Kozocom）

## ドキュメント構成
- `docs/spec.md` - 仕様書（トラッキング項目・コミュニケーション手段・離反/新規分析）
- `docs/screens.md` - 画面設計（7画面構成）
- `docs/development-plan.md` - Phase別開発計画（技術スタック・ギャップ分析含む）
- `docs/technical-findings.md` - 技術調査結果（データモデル・API・外部サービス詳細）

## 開発方針
- Phase 1: CRM基本機能（閲覧・配信・Kintone連携）
- Phase 2: AIレコメンド機能（Gem + NotebookLM のAPI化）
- モバイル対応: 不要
- データ更新: 日次バッチ

## 現在のステータス
- ✅ 仕様確定（全7画面の詳細設計完了）
- ✅ 技術調査完了（Kozocom org 配下の全7リポジトリ調査済み）
- ⏳ PDMへの残確認事項あり（Liny API、検索KW保存先、DB参照方法）
- ⏳ CRM技術スタック選定待ち

## 重要なデータモデル
- Customer: 顧客情報（customer_code, status, address, partner_code等）
- Account: ログインアカウント（1 Account → N Customer）
- SocialiteProvider: LINE連携（provider_id = LINE UID, is_friend）
- SmileOrder: 注文履歴（customer_code, business_partner_id, product_id, amount）
- Cart/CartOrder/CartItem: カート情報（カゴ落ち検知用）
- MorikiProduct/EcProduct/CommonProduct: 商品（3層構造）
- BusinessPartner: パートナー（parent/children階層構造）

## 注意事項
- ActivityLogは管理画面の操作ログ。EC側のページ閲覧・検索ログはなし
- SMS配信サービスは未導入。新規選定が必要
- Liny API連携可否がPDM確認待ち
- 1 Accountが複数Customerを持てる構造に注意
