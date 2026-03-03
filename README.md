# rakushiire-crm

rakushiire.com ユーザー行動管理 & コミュニケーションツール

## 概要

rakushiire.com のユーザー行動データを日次で収集・可視化し、CRMチームが手動/自動でコミュニケーション（LINE・メール・SMS）を送れる管理ツール。

## ドキュメント

- [仕様書](docs/spec.md) - システム全体の仕様
- [画面設計](docs/screens.md) - 各画面の詳細設計（全7画面）
- [開発計画](docs/development-plan.md) - Phase別の開発ロードマップ
- [技術調査結果](docs/technical-findings.md) - 既存システム調査の詳細レポート

## 技術スタック（既存システム）

| 項目 | 技術 |
|------|------|
| バックエンド | PHP 8.2 / Laravel 11 / Laravel Sanctum |
| ECフロントエンド | Next.js 14 / React 18 / TypeScript |
| EC DB | MySQL 8.0 |
| 管理画面 DB | PostgreSQL 13 |
| 操作ログ DB | AWS DocumentDB（MongoDB互換） |
| メール配信 | AWS SES |
| リアルタイム通知 | Pusher WebSocket |
| ストレージ | AWS S3 |
| キュー | AWS SQS |
| LINE | OAuth Social Login（2アカウント）/ Liny |

## 関連サービス

| サービス | URL | 用途 |
|---------|-----|------|
| rakushiire.com | https://rakushiire.com/ | 顧客向けサービス（LP） |
| vege-tal.com | https://vege-tal.com/login | 管理画面（BPaaS） |
| Kintone | - | 対応履歴蓄積 |
| Liny | - | LINE配信管理 |
| GA4 | - | アクセス解析 |

## ソースコード（既存システム）

| リポジトリ | 用途 |
|-----------|------|
| Kozocom/vegekul-EC-backend | ECサイトバックエンド |
| Kozocom/vegekul-EC-frontend | ECサイトフロントエンド |
| Kozocom/vegekul-BPaaS-backend | 管理画面バックエンド |
| Kozocom/vegekul-BPaaS-frontend | 管理画面フロントエンド |
| Kozocom/vegekul-activitylog-backend | 操作ログ管理 |
| Kozocom/vegekul-PDF-backend | PDF生成 |
| Kozocom/vegekul-pm-docs | プロジェクト管理ドキュメント |

## 現在のステータス

- ✅ 仕様確定（全7画面）
- ✅ 技術調査完了（2026-03-03）
- ⏳ PDMへの残確認事項あり（Liny API、検索KW保存先、DB参照方法）
- ⏳ CRM技術スタック選定待ち
