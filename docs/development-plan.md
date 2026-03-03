# rakushiire-crm 開発計画

## Phase概要

| Phase | 内容 | 前提条件 |
|-------|------|---------|
| Phase 1 | CRM基本機能 | 技術調査完了（✅ 2026-03-03） |
| Phase 2 | AIレコメンド + サイト内バナー + テンプレート | Phase 1完了 |

---

## 技術スタック（確定: 2026-03-03）

既存システムとの整合性を考慮した構成:

| 項目 | 既存システム | CRM候補 |
|------|------------|---------|
| バックエンド | PHP 8.2 / Laravel 11 | Laravel 11（統一） |
| フロントエンド | Next.js 14 / React 18 | React 18 + Vite or Next.js 14 |
| DB | MySQL 8.0（EC） / PostgreSQL 13（BPaaS） | 要決定 |
| 認証 | Laravel Sanctum | Laravel Sanctum |
| メール配信 | AWS SES | AWS SES |
| キュー | AWS SQS | AWS SQS |
| ストレージ | AWS S3 | AWS S3 |
| SMS | なし（新規導入必要） | 要選定 |
| LINE | Liny（API連携可否未確認） | Liny API or 直接API |

詳細は [technical-findings.md](technical-findings.md) を参照。

---

## Phase 1: CRM基本機能

### Step 1: 技術調査・設計 ✅ 完了

**GitHub調査（2026-03-03 完了）:**
- [x] rakushiire.com の技術スタック → PHP 8.2 / Laravel 11 / MySQL 8.0 / Next.js 14
- [x] ユーザー行動ログ → 管理画面操作ログのみ。EC側ページ閲覧等はなし
- [x] 注文データのテーブル構造 → SmileOrder / OrderItem で把握済み
- [x] 外部API → EC-backend: 90+ REST API、Sanctum認証
- [x] メール配信サービス → AWS SES
- [x] SMS配信サービス → なし（FAXのみ: Faximo）
- [x] LINEユーザーIDの紐づけ → SocialiteProvider.provider_id で紐付き済み

**PDMに要確認（残件）:**
- [ ] Liny API連携可否
- [ ] EC_SEARCH_KEYWORD_QUEUEの処理先
- [ ] ECサイトのログイン日時記録有無
- [ ] CRMからEC DBを直接参照可能か

**回答後に決定すること:**
- CRMツールのDB選定（MySQL or PostgreSQL）
- データ取得方法（API / DB直接 / バッチ処理）
- SMS配信サービスの選定
- Liny連携方法

### Step 2: データ基盤構築

- EC-backend MySQL からの日次データ取得バッチ処理
  - Customer テーブル（顧客情報・ステータス）
  - SmileOrder / OrderItem テーブル（注文データ）
  - Cart / CartOrder / CartItem テーブル（カゴ落ち検知）
  - SocialiteProvider テーブル（LINE連携状況）
  - BusinessPartner テーブル（パートナー情報）
  - MorikiProduct / EcProduct テーブル（商品情報）
- CRM用データベース設計・構築
- 日次バッチの仕組み構築（AWS SQS活用）
- **新規**: ユーザー行動トラッキング基盤の構築
  - EC-frontend にトラッキングJS追加 or GA4 Data API連携
  - ページ閲覧・滞在時間・流入元の記録

### Step 3: 管理画面 - 閲覧系

| 画面 | 内容 | データソース |
|------|------|-------------|
| ダッシュボード | KPIカード・グラフ・アクションリスト・離反/新規分析 | SmileOrder, Customer |
| ユーザー一覧 | 検索・フィルタ・ソート | Customer, Account, SocialiteProvider |
| ユーザー詳細 | 注文履歴・行動履歴・コミュニケーション履歴 | SmileOrder, Cart, ActivityLog |

### Step 4: 管理画面 - セグメント・配信系

| 画面 | 内容 |
|------|------|
| セグメント作成 + 行動検索 | 属性＋行動条件の組み合わせ検索・保存（動的/静的） |
| 手動配信 | LINE / メール / SMS の手動送信（単一・複数チャネル対応） |
| 配信履歴 | 送信済みコミュニケーションの一覧・効果測定・CSVエクスポート |

### Step 5: 自動配信

| 画面 | 内容 |
|------|------|
| 自動配信ルール設定 | トリガー条件＋アクションの自動化・重複防止機能 |

### Step 6: 外部連携

- Kintone連携（対応履歴・行動データ・コミュニケーション履歴の蓄積）
- GA4連携（流入元データ・ページ閲覧・滞在時間の取得）
- Liny連携（LINE配信トリガー・タグ連携）※ API可否確認後

---

## Phase 2: 拡張機能（将来）

### メッセージテンプレート機能
- よく使うメッセージを保存・再利用
- チャネル別テンプレート管理

### サイト内バナー表示
- CRMツールから rakushiire.com 上にバナー表示を制御
- ユーザー・セグメント単位でのバナー出し分け
- rakushiire.com 側のエンジニア実装が必要

### AIレコメンド機能
- 現在 Gem + NotebookLM で手動実行しているクロスセル提案を自動化
- 顧客プロフィール強化（食べログ等の外部データ取得）
- AIによる商品レコメンド自動生成
- レコメンド → 即配信フロー
- セグメント単位での一括レコメンド

### 前提条件
- Phase 1のCRM基本機能が稼働していること
- パートナー商品データベースが整備されていること
- AI API（Gemini等）の利用方針が決まっていること

---

## 画面設計ステータス

| # | 画面 | ステータス |
|---|------|----------|
| 1 | ダッシュボード | ✅ 確定 |
| 2 | ユーザー一覧 | ✅ 確定 |
| 3 | ユーザー詳細 | ✅ 確定 |
| 4 | セグメント作成 + 行動検索 | ✅ 確定 |
| 5 | 手動配信 | ✅ 確定 |
| 6 | 自動配信ルール設定 | ✅ 確定 |
| 7 | 配信履歴 | ✅ 確定 |

詳細は [screens.md](screens.md) を参照。

---

## ギャップ分析（既存 vs CRM要件）

### 利用可能なデータ ✅

| データ | ソース | テーブル/モデル |
|--------|--------|---------------|
| 顧客情報 | EC MySQL | Customer |
| 注文履歴 | EC MySQL | SmileOrder / OrderItem |
| カート（カゴ落ち） | EC MySQL | Cart / CartOrder / CartItem |
| LINE連携 | EC MySQL | SocialiteProvider |
| パートナー情報 | EC MySQL | BusinessPartner |
| 商品情報 | EC MySQL | MorikiProduct / EcProduct / CommonProduct |
| 顧客ステータス変遷 | ActivityLog DocumentDB | ActivityLog (feature=CUSTOMER) |

### 不足データ ❌（新規開発/連携が必要）

| データ | 現状 | 対策案 | 優先度 |
|--------|------|--------|--------|
| ページ閲覧ログ | なし | GA4連携 or EC-frontendにJS追加 | 高 |
| サイト内検索KW | SQSキューあり（保存先不明） | PDMに確認 → 既存処理を活用 | 高 |
| ECログイン日時 | 専用カラムなし | ログインAPI処理時に記録追加 | 高 |
| 滞在時間 | なし | GA4連携 | 中 |
| 流入元 | なし | GA4連携 | 中 |
| SMS配信基盤 | なし | 新規サービス導入 | 中 |

---

## 決定事項・未決定事項

| 項目 | 状態 | 決定タイミング |
|------|------|--------------|
| 既存技術スタック | ✅ 調査完了 | 2026-03-03 |
| メール配信サービス | ✅ AWS SES | 2026-03-03 |
| LINE UID紐づけ | ✅ SocialiteProvider.provider_id | 2026-03-03 |
| CRM用DB選定 | 未決定 | PDM回答後 |
| データ取得方法 | 未決定 | PDM回答後 |
| SMS配信サービス | 未決定（新規導入必要） | Phase 1開始時 |
| Liny連携方法 | 未決定（API可否未確認） | PDM回答後 |
| モバイル対応 | ✅ 不要と確定 | - |
| AIレコメンドの技術選定 | 未決定 | Phase 2開始時 |
