# 技術調査結果

調査日: 2026-03-03
調査対象リポジトリ: Kozocom org 配下

---

## 1. システム全体像

```
┌──────────────────────────────────────────────────────────────┐
│                      フロントエンド                            │
│   EC (Next.js 14 / React 18)    │  BPaaS (React 18 / Vite)  │
│   rakushiire.com（バイヤー向け）  │  vege-tal.com（管理画面）   │
└──────────┬──────────────────────────────────┬────────────────┘
           │ REST API (Sanctum)              │ REST API (Sanctum)
┌──────────▼──────────────┐    ┌─────────────▼────────────────┐
│  vegekul-EC-backend     │    │  vegekul-BPaaS-backend       │
│  Laravel 11 / PHP 8.2   │    │  Laravel 11 / PHP 8.2        │
│  MySQL 8.0              │    │  PostgreSQL 13               │
│  90+ APIエンドポイント    │    │  Porto アーキテクチャ          │
└──────────┬──────────────┘    └─────────────┬────────────────┘
           │ SQS                             │ SQS
           └──────────────┬──────────────────┘
              ┌───────────▼──────────────┐
              │ vegekul-activitylog      │
              │ Laravel 11 / PHP 8.2     │
              │ DocumentDB (MongoDB互換) │
              │ 操作ログ一元管理          │
              └──────────────────────────┘
```

### 調査対象リポジトリ

| リポジトリ | 用途 | 技術スタック |
|-----------|------|-------------|
| vegekul-EC-backend | ECサイトバックエンド | Laravel 11 / MySQL 8.0 |
| vegekul-EC-frontend | ECサイトフロントエンド | Next.js 14 / React 18 / TypeScript |
| vegekul-BPaaS-backend | 管理画面バックエンド | Laravel 11 / PostgreSQL 13 |
| vegekul-BPaaS-frontend | 管理画面フロントエンド | React 18 / Vite / MUI v5 |
| vegekul-activitylog-backend | 操作ログ管理 | Laravel 11 / DocumentDB |
| vegekul-PDF-backend | PDF生成 | Laravel 11 / wkhtmltopdf |
| vegekul-pm-docs | プロジェクト管理ドキュメント | Markdown |

---

## 2. データモデル（EC-backend）

### 2.1 Customer × Account × LINE の3層構造

```
Account（ログインID）
  ├── SocialiteProvider（LINE UID, is_friend）
  └── AccountCustomer [中間テーブル]
        ├── Customer（得意先コード, ステータス, 営業担当, 住所...）
        │     ├── SmileOrder（注文履歴）
        │     ├── BusinessPartner（所属パートナー）
        │     └── BusinessPartnerCourse（配送コース）
        └── Cart → CartOrder → CartItem → MorikiProduct
```

**重要**: 1つのAccountが複数のCustomer（得意先コード）と紐付く。

### 2.2 Customer モデル

**テーブル名:** `customer`（SoftDeletes あり）

#### 主要カラム

| カラム | 説明 | CRM活用 |
|--------|------|---------|
| `idx` | UUID | - |
| `customer_code` | 顧客コード（自動採番） | ユーザー識別 |
| `customer_name1` / `customer_name2` | 顧客名 | 表示用 |
| `email` / `password` | 認証情報 | - |
| `telephone` / `cellphone` / `cellphone_2` | 電話番号 | SMS配信先 |
| `address1` / `address2` / `address3` / `postal_code` | 住所 | エリア分析 |
| `partner_code` | 所属パートナーコード | パートナー別分析 |
| `status` | **顧客ステータス** | **ファネル管理** |
| `start_trading_date` | 取引開始日 | LTV計算 |
| `estimated_monthly_amount` | 月間見込み額 | セグメント条件 |
| `sales_person_code` / `sales_person_name` | 担当営業 | 営業管理 |
| `shop_category` | 店舗カテゴリ | セグメント条件 |
| `restaurant_category_id` | 飲食店カテゴリ | 業態分析 |
| `rank_classification_id` | ランク区分 | セグメント条件 |
| `is_registered_from_ec` | EC経由登録フラグ | 流入元分析 |
| `is_from_flyer` | チラシ経由フラグ | 流入元分析 |
| `email_verified_at` | メール認証完了日時 | - |
| `verification_code` / `verification_code_created_at` | 認証コード | - |
| `use_infomart` / `using_infomart_code` | インフォマート連携 | - |
| `ec_shipping_fee` / `amount_for_free_shipping` | 送料設定 | - |
| `credit_limit` | 与信限度額 | - |
| `customer_note` | メモ | - |
| `transaction_cancellation_month` / `transaction_trust_month` | 取引中断・信頼月 | 離反分析 |

#### CustomerStatus（ステータス値）

```
ec_temporary_register → waiting_for_register → pre_transaction → in_transaction ↔ delivery_stop → stop
       仮登録              登録待ち              取引前           取引中         配送停止      停止
```

| 値 | 意味 |
|----|------|
| `ec_temporary_register` | EC仮登録 |
| `manual_register` | 手動登録 |
| `waiting_for_register` | 登録待ち |
| `pre_transaction` | 取引前 |
| `in_transaction` | 取引中（アクティブ） |
| `delivery_stop` | 配送停止 |
| `stop` | 停止 |

#### 主要リレーション

| メソッド | 種類 | 相手モデル | 説明 |
|----------|------|-----------|------|
| `partner()` | BelongsTo | BusinessPartner | 所属パートナー |
| `smileOrders()` | HasMany | SmileOrder | 注文履歴 |
| `carts()` | BelongsToMany | Cart | カート |
| `productFavourites()` | BelongsToMany | MorikiProduct | お気に入り商品 |
| `campaigns()` | BelongsToMany | Campaign | 適用キャンペーン |
| `businessPartners()` | BelongsToMany | BusinessPartner | 利用パートナー群 |
| `socialiteProviders()` | HasMany | SocialiteProvider | LINE等ソーシャル連携 |
| `accounts()` | BelongsToMany | Account | 紐付きアカウント |
| `personInCharge()` | BelongsTo | PersonInCharge | ベジクル担当者 |
| `restaurantCategory()` | BelongsTo | RestaurantCategory | 飲食店カテゴリ |

### 2.3 Account モデル

**テーブル名:** `accounts`（SoftDeletes あり）

| カラム | 説明 |
|--------|------|
| `email` | メールアドレス |
| `password` | パスワード（ハッシュ） |
| `verification_code` / `verification_code_created_at` | 認証コード |
| `email_verified_at` | メール認証完了日時 |
| `latest_customer_id` | 最後に選択したcustomer_id |
| `username` | ユーザー名 |
| `cellphone` | 携帯番号 |

### 2.4 SocialiteProvider モデル（LINE連携）

**テーブル名:** `socialite_providers`（SoftDeletes あり）

| カラム | 説明 | CRM活用 |
|--------|------|---------|
| `provider` | プロバイダー種別（`line` / `google`） | LINE判定 |
| `provider_id` | **LINE/GoogleのユーザーID** | **Linyとの紐付けキー** |
| `account_id` | Accountとの紐付けID | Account→LINE |
| `is_friend` | **LINE公式アカウントの友だちフラグ** | **LINE配信可否判定** |
| `avatar` | アバターURL | - |
| `email` | プロバイダー側メール | - |
| `firstname` / `lastname` / `nickname` | プロバイダー側の名前 | - |

**LINE連携フロー:**
```
Account → SocialiteProvider (provider='line')
  └── provider_id = LINE UID → Linyと紐付け可能
  └── is_friend = true/false → LINE公式の友だち判定
```

### 2.5 SmileOrder モデル（注文）

**テーブル名:** `orders_smileorder`（SoftDeletes あり）

| カラム | 説明 | CRM活用 |
|--------|------|---------|
| `order_number` | 注文番号（8桁自動採番） | 注文特定 |
| `customer_code` | 顧客コード | 顧客別注文分析 |
| `delivery_date` | 配送日 | 注文頻度分析 |
| `business_partner_id` | パートナーID | パートナー別分析 |
| `product_id` | 商品ID | 商品別分析 |
| `quantity` / `quantity_unit` / `kg_quantity` | 数量 | - |
| `unit_price` / `amount` | 単価・金額 | 金額分析 |
| `total_amount` / `sub_total` / `discount` | 合計・割引 | 金額分析 |
| `shipping_fee` | 送料 | - |
| `status` | 注文ステータス | - |
| `order_type` | 注文タイプ | 注文経路分析 |
| `created_from` | 作成元（EC/管理画面等） | 注文経路分析 |
| `account_id` | アカウントID | アカウント別分析 |
| `course_id` | コースID | 配送コース別分析 |
| `note` / `delivery_memo` | 備考 | - |

**注文タイプ（OrderType）:**
- `SMILE` / `EC` / `ADDITION` / `ORDER_ADMIN` / `ADDITION_ADMIN` / `ORDER_PARTNER` / `ADDITION_PARTNER` / `INFORMAT`

### 2.6 Cart / CartOrder / CartItem（カート）

**3層構造:**
```
Cart (customer_id, account_customer_id)
  └── CartOrder (business_partner_id, delivery_date, shipping_fee)
        └── CartItem (product_id, quantity)
              └── MorikiProduct
```

カゴ落ち検知: Cart存在 & 対応するOrder未完了 で判定可能。

### 2.7 商品モデル（3層構造）

```
CommonProduct（共通商品マスタ）
  └── MorikiProduct（パートナー別商品マスタ = business_partner_morikiproduct）
        └── EcProduct（EC公開用情報 = ec_products）
```

**MorikiProduct 主要カラム:**
- `product_system_code` / `in_house_managed_product_code` - 商品コード
- `product_name` / `product_name_furigana` - 商品名
- `partner_code` - 所属パートナー
- `food_major_classification_name` / `food_medium_classification_name` - 食品分類
- `retail_unit_price` / `reference_wholesale_price` - 価格
- `selling_discontinued` - 販売終了フラグ

### 2.8 BusinessPartner モデル

**テーブル名:** `business_partner`（SoftDeletes あり）

| カラム | 説明 | CRM活用 |
|--------|------|---------|
| `code` | パートナーコード | パートナー識別 |
| `name` | 名称 | 表示用 |
| `type` | 種別（`parent` / `children`） | 階層構造 |
| `parent_id` | 親パートナーID | 階層構造 |
| `line_official_account` | LINE公式アカウント種別 | LINE連携 |
| `order_cutoff_time` | 注文締め切り時刻 | - |
| `is_display_search_ec` | EC検索表示フラグ | - |

**LINE公式アカウント種別（LineOfficialAccountType）:**
- `toshinbin` - 都心便（ベジクル公式LINE）
- `net_supermarket` - ネットスーパーマーケット

### 2.9 中間テーブル

**AccountCustomer（`account_customers`）:**
- `account_id` / `customer_id` / `is_main_customer` / `username` / `cellphone`

**BusinessPartnerCustomer（`business_partner_customers`）:**
- `business_partner_id` / `customer_code` / `course_id` / `ec_shipping_fee` / `amount_for_free_shipping`

---

## 3. ActivityLog マイクロサービス

### 3.1 概要

- **目的:** BPaaS/EC管理画面での操作ログを一元管理
- **注意: ユーザー行動ログ（ページ閲覧・検索等）ではなく、管理画面の操作ログ**
- DB: AWS DocumentDB（MongoDB互換）
- 認証: PostgreSQL + Laravel Sanctum
- キュー: AWS SQS

### 3.2 ActivityLog コレクション

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `_id` | string | MongoDB ObjectID |
| `user_id` | integer | 操作者のユーザーID |
| `user_name` | string | 操作者のユーザー名 |
| `role_id` | integer | 操作者のロールID |
| `role_name` | string | ロール名 |
| `metadata` | array | IPアドレス等のメタ情報 |
| `agent` | string | ユーザーエージェント |
| `status` | string | ログステータス |
| `type` | string | ログタイプ（大分類） |
| `feature` | string | 機能名（中分類） |
| `action` | string | アクション名（小分類） |
| `logs` | array | 変更差分の配列（old/new） |
| `main_request_id` | string | 親リクエストID |

### 3.3 Enum 定義

**ActivityLogTypeEnum（type: 大分類）:**

| 値 | 意味 |
|----|------|
| `ORDER_DATA` | 注文データ系 |
| `REPORT` | レポート系 |
| `MASTER_DATA` | マスターデータ系 |
| `AUTH` | 認証系 |

**ActivityLogFeatureEnum（feature: 機能名）:**

| 値 | 日本語 | type |
|----|--------|------|
| `ORDER_DATA_IMPORT` | 注文データインポート | ORDER_DATA |
| `INQUIRY` | 注文一覧 | ORDER_DATA |
| `ORDER` | EC注文一覧 | ORDER_DATA |
| `ORDER_SPREADSHEET` | 注文集計表 | REPORT |
| `PICKING_LIST` | ピッキングリスト | REPORT |
| `PRODUCT` | 商品マスター/パートナー別 | MASTER_DATA |
| `COMMON_PRODUCT` | 商品マスター/共通 | MASTER_DATA |
| `CUSTOMER` | 得意先マスター | MASTER_DATA |
| `PARTNER` | パートナーマスター | MASTER_DATA |
| `COURSE` | コースマスター | MASTER_DATA |
| `CAMPAIGN_BANNER` | バナー | MASTER_DATA |
| `COMMON_CATEGORY` | カテゴリーマスター | MASTER_DATA |
| `USER` | ユーザーマスター | MASTER_DATA |
| `LOGIN` | ログイン | AUTH |

**追加feature（言語ファイルにのみ存在）:**
- `ADDITIONAL_ORDER`（EC追加伝票一覧）
- `SHIPPING`（配送料）
- `PRODUCT_UNIT_PRICE`（単価マスター）
- `UNIT_PRICE_GROUP`（単価グループ）
- `PERSON_IN_CHARGE`（担当者マスター）
- `LINE_SUMMARY`（摘要マスター）

**ActivityLogActionEnum（action）:**
- `START` / `END` / `IMPORT_START` / `IMPORT_END` / `OUT_START` / `OUT_END` / `LOGIN` / `LOGOUT`

**RoleEnum（操作者のロール）:**
- `ROLE_DASHBOARD_ADMIN`（ベジクル管理者）
- `ROLE_DASHBOARD_STAFF`（ベジクルスタッフ）
- `ROLE_PARTNER_ADMIN`（パートナー管理者）

### 3.4 APIエンドポイント

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | `/api/v1/activity-logs` | ログ一覧取得（ページネーション） | Sanctum |
| GET | `/api/v1/activity-logs/export` | CSVエクスポート（Shift_JIS） | Sanctum |

### 3.5 ログ処理フロー

```
STARTING_REQUEST → UPDATING_DATA / BATCH_UPDATING_DATA → COMPLETED / FAILED
   ドキュメント新規作成    変更差分を追記              完了 or 削除
```

外部システムからSQSキュー経由でJob投入される仕組み。

---

## 4. EC-backend APIエンドポイント

認証: Laravel Sanctum（Bearerトークン）

### 主要エンドポイント一覧

| カテゴリ | 主なエンドポイント |
|---------|-------------------|
| 認証 | login, verify-code, register, forgot-password, logout |
| アカウント | accounts (CRUD), profiles |
| カート | carts/add, carts/update, carts/remove, carts/detail |
| 注文 | orders (CRUD), order-history, cancel |
| 商品 | products/search, products/favourites |
| パートナー | business-partners (一覧・詳細) |
| カテゴリ | categories |
| キャンペーン | campaigns |
| 納品書 | delivery-slips |
| アドバイス | advises |
| LINE | social-login (LINE OAuth) |

### 環境変数（CRM関連）

| 変数 | 説明 |
|------|------|
| `LINE_CLIENT_ID` / `LINE_CLIENT_SECRET` | LINE OAuth（ネットスーパーマーケット） |
| `LINE_TOSHINBIN_CLIENT_ID` / `LINE_TOSHINBIN_CLIENT_SECRET` | LINE OAuth（都心便） |
| `PUSHER_APP_KEY` / `PUSHER_CUSTOMER_CHANNEL` | Pusher WebSocket |
| `EC_SEARCH_KEYWORD_QUEUE` | SQS（検索キーワードトラッキング） |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS（S3, SES等） |

---

## 5. 外部サービス

| サービス | 用途 | 設定状況 |
|---------|------|---------|
| **AWS SES** | メール配信 | EC-backendで設定済み |
| **Pusher** | WebSocket（リアルタイム通知） | EC-backendで設定済み |
| **AWS S3** | ファイルストレージ | EC-backendで設定済み |
| **AWS SQS** | メッセージキュー（28+キュー） | ActivityLog連携等 |
| **Google Maps API** | 住所検索 | EC-backendで設定済み |
| **ZIP Cloud** | 郵便番号検索 | EC-backendで設定済み |
| **Faximo** | FAX送信 | BPaaS-backendで設定 |
| **LINE OAuth** | ソーシャルログイン（2アカウント） | EC-backendで設定済み |
| **GA4** | アクセス解析 | 導入済み |
| **Liny** | LINE配信管理 | ✅ 運用中・CRM独自Webhook連携テスト済み |

### SMS配信について

**SMS配信サービスは現在導入されていない。** FAX送信（Faximo）のみ。
CRMでSMS配信を行う場合は、新規サービス導入が必要。

---

## 6. CRM構築に向けたギャップ分析

### 利用可能なデータ（既存で取得可能）

| データ | ソース | 取得方法 |
|--------|--------|---------|
| 顧客情報（コード・名前・住所・ステータス等） | EC-backend MySQL | DB直接 or API |
| 注文履歴（日付・金額・パートナー・商品） | EC-backend MySQL | DB直接 or API |
| カート情報（カゴ落ち検知） | EC-backend MySQL | DB直接 |
| LINE連携状況（UID・友だちフラグ） | EC-backend MySQL | DB直接 |
| パートナー情報 | EC-backend MySQL | DB直接 or API |
| 商品情報（3層構造） | EC-backend MySQL | DB直接 or API |
| 管理画面操作ログ（マスタ変更履歴等） | ActivityLog DocumentDB | API |

### 不足しているデータ（新規開発/連携が必要）

| データ | 現状 | 対策案 |
|--------|------|--------|
| **ページ閲覧ログ** | なし（ActivityLogは管理画面操作ログのみ） | GA4連携 or EC-frontendにトラッキングJS追加 |
| **サイト内検索キーワード** | ✅ SQSキュー → BPaaS PostgreSQL `ec_search_keywords`テーブルに保存、日次CSVでS3出力 | 既存データ活用可能 |
| **EC側ログイン日時** | Accountの`updated_at`のみ（専用カラムなし） | ログインAPI呼び出し時に記録する仕組みが必要 |
| **滞在時間** | なし | GA4連携で取得 |
| **流入元** | なし | GA4連携で取得 |
| **SMS配信基盤** | なし（FAXのみ） | 新規SMS配信サービス導入が必要 |

### CRMシステムの技術スタック候補

既存システムとの整合性を考慮した候補:

| 項目 | 推奨 | 理由 |
|------|------|------|
| バックエンド | Laravel 11 / PHP 8.2 | 既存システムと同一。開発会社の知見活用可能 |
| フロントエンド | React 18 + Vite or Next.js 14 | 既存システムと同一 |
| DB | MySQL 8.0 or PostgreSQL 13 | 既存システムと同一 |
| 認証 | Laravel Sanctum | 既存システムと同一 |
| メール配信 | AWS SES | 既存利用中 |
| キュー | AWS SQS | 既存利用中 |

---

## 7. エンジニア確認事項の回答状況

| # | 確認項目 | 回答 | ソース |
|---|---------|------|--------|
| 1 | 技術スタック | **PHP 8.2 / Laravel 11 / MySQL 8.0 / Next.js 14** | composer.json, package.json |
| 2 | ユーザー行動ログ | **管理画面の操作ログのみ。EC側のページ閲覧等はなし** | activitylog-backend調査 |
| 3 | 注文データ構造 | **SmileOrder / OrderItem で把握済み** | EC-backend Models |
| 4 | 外部API | **EC-backend: 90+ REST API、Sanctum認証** | routes/api.php |
| 5 | メール配信サービス | **AWS SES** | .env.example, config |
| 6 | SMS配信サービス | **なし（FAXのみ: Faximo）** | pm-docs調査 |
| 7 | Liny API連携可否 | **✅ CRM独自Webhook POST連携で解決・テスト済み** | CRM実装・テスト |
| 8 | LINE UID紐づけ | **SocialiteProvider.provider_id で紐付き済み** | SocialiteProvider モデル |

### 残確認事項（2026-03-05更新: 4件中2件解決）

- [x] Liny APIの仕様・連携可否 → ✅ CRM独自のWebhook POST連携で解決。接続テスト済み（HTTP 400 = 到達＆認証OK）
- [x] `EC_SEARCH_KEYWORD_QUEUE`の処理先 → ✅ BPaaS-backendの`ProcessSearchKeywordJob`がSQSから受信し、PostgreSQLの`ec_search_keywords`テーブルに保存。日次CSVでS3出力
- [ ] ECサイトのログイン日時の記録有無 → ❌ Account/Customerに`last_login_at`カラムなし。新規追加が必要（PDM回答待ち）
- [ ] CRMツールからEC-backendのDBを直接参照可能か → ❌ 現状SQS経由のみ。CRM用内部APIの新設を推奨（PDM回答待ち）

**2026-03-05: PDM（河口さん）にメール送信済み。残2件の回答待ち。**
