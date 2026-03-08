# rakushiire-crm

## Overview
ラクシーレ（rakushiire.com）のCRM管理ツール。飲食店向けB2B卸売ECの顧客行動を可視化し、LINE/メール/SMSでターゲティング配信を実現する。

## Tech Stack
- **Framework**: Next.js 16 (App Router) / React 19 / TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui + Recharts
- **ORM**: Prisma 7 (MySQL 8.0)
- **Auth**: NextAuth.js 5 (beta.30) — bcryptハッシュ済みモック認証（DB切替準備済み）
- **LINE連携**: Liny API (Webhook POST) — **接続テスト済み・正常動作確認**
- **AI Chat**: Anthropic Claude API (claude-sonnet-4-20250514) — LINE自動応答
- **Testing**: Vitest + Testing Library (62テスト)
- **Deploy**: Vercel (https://vegekul-crm.vercel.app)

## Project Structure
```
src/
├── app/              # Pages (App Router)
│   ├── page.tsx      # Dashboard (Server Component)
│   ├── users/        # User list & detail
│   ├── segments/     # Segment management (admin only)
│   ├── delivery/     # Manual message delivery
│   ├── automation/   # Automation rules (admin only)
│   ├── history/      # Delivery history
│   ├── churn/        # Churn/new analysis
│   ├── chat/         # AI Chat session management (admin only)
│   │   ├── page.tsx  # Session list + KPI + filters
│   │   └── [sessionId]/page.tsx  # Message thread + status control
│   ├── settings/     # Settings & Liny config (admin only)
│   ├── login/        # Login page
│   ├── error.tsx     # Global error boundary
│   ├── global-error.tsx  # Root layout error boundary
│   ├── not-found.tsx # Custom 404
│   └── */loading.tsx # Skeleton loading states (all pages)
├── components/
│   ├── ui/           # shadcn/ui (20+ components + Skeleton)
│   ├── sidebar.tsx   # Navigation (role-based filtering)
│   ├── app-shell.tsx # Layout with mobile responsive header
│   ├── page-skeleton.tsx # Loading skeleton variants
│   └── charts.tsx    # Chart utilities
├── lib/
│   ├── mock-data.ts  # Mock data (→ DB swap予定)
│   ├── types.ts      # Shared type definitions
│   ├── liny.ts       # Liny API client (rate limiting, batch support)
│   ├── prisma.ts     # Prisma client singleton
│   ├── auth-utils.ts # bcryptjs password hashing utilities
│   ├── env.ts        # Environment variable validation
│   ├── ai/           # LINE AI Chat
│   │   ├── system-prompt.ts  # 動的システムプロンプト生成（7カテゴリ分類・事実情報・エスカレーション12基準）
│   │   ├── types.ts          # CustomerContext/CrmStatus/ChatSession型定義
│   │   ├── client.ts         # Anthropic SDKクライアント
│   │   ├── chat-responder.ts # メインオーケストレータ
│   │   ├── escalation.ts     # エスカレーション処理（Linyタグ+Webhook+Slack通知）
│   │   ├── slack-notify.ts   # Slack Block Kit通知（緊急度3段階）
│   │   └── token-tracker.ts  # トークン使用量トラッキング
│   ├── __tests__/    # Unit tests (Vitest)
│   └── actions/      # Server Actions (data access layer)
│       ├── customers.ts
│       ├── dashboard.ts
│       ├── segments.ts
│       ├── deliveries.ts
│       ├── delivery.ts
│       ├── history.ts
│       ├── automation.ts
│       ├── churn.ts
│       ├── chat.ts       # AIチャット セッション/メッセージCRUD
│       └── liny.ts
├── types/
│   └── next-auth.d.ts  # NextAuth type augmentation (role)
├── instrumentation.ts  # Startup env validation
src/auth.ts             # NextAuth config (JWT, 8hr session)
src/middleware.ts        # Auth middleware (API routes protected)
prisma/
├── schema.prisma     # DB schema (EC + CRM tables)
└── seed.ts           # Seed script
docs/
├── spec.md
├── screens.md
├── development-plan.md
└── technical-findings.md
```

## Development Status (2026-03-08)

### Completed
- **Phase 1 Frontend**: ✅ 8 screens complete
- **Liny API Integration**: ✅ Connected & tested (HTTP 400 = valid connection)
- **NextAuth Authentication**: ✅ bcrypt hashing, JWT 8hr session, role-based
- **Role-based UI**: ✅ admin sees all, sales sees subset (5 items)
- **Error Handling**: ✅ error.tsx + global-error.tsx
- **Security Headers**: ✅ X-Frame-Options, HSTS, Permissions-Policy, etc.
- **Mobile Responsive**: ✅ Hamburger menu + overlay sidebar
- **Loading States**: ✅ Skeleton UI on all pages
- **Page Metadata**: ✅ Title template, Apple Web App
- **PWA**: ✅ manifest.json, viewport meta
- **Env Validation**: ✅ Startup check via instrumentation.ts
- **Unit Tests**: ✅ 62 tests (Liny, env, batch, auth, types, AI client, system-prompt, chat-responder, escalation, slack-notify, token-tracker)
- **E2E Tests**: ✅ 7 tests (Playwright — auth, navigation, role-based UI, 404)
- **CI/CD**: ✅ GitHub Actions (lint → test → build)
- **Dark Mode**: ✅ next-themes (system/light/dark toggle)
- **Lighthouse Optimization**: ✅ Static asset caching, image formats
- **Custom 404**: ✅ Japanese not-found page
- **LINE AI Chat**: ✅ 全モジュール実装済み（system-prompt, client, chat-responder, escalation, slack-notify, token-tracker）
- **LINE AI Chat 事実情報**: ✅ system-prompt.tsに代表電話、午後便時間、欠品通知、LINE登録フロー、配送方法、写真対応、営業時間外対応等を追加
- **Slack通知**: ✅ Block Kit形式エスカレーション通知（緊急度3段階: critical/high/normal）
- **AI Chat管理画面**: ✅ セッション一覧（KPI+フィルタ）+ メッセージスレッド + ステータス管理
- **LINE問い合わせ分析**: ✅ Liny 3ヶ月分4,200件分析完了（別リポジトリ: vegekul/vegekul-line-ai-chat）

### LINE AI Chat 分析結果サマリー (2026-03-07)
Liny管理画面から3ヶ月分（2025-12-05〜2026-03-07）のメッセージ4,200件を分析:
- 🔴 配送・納品: **28.6%**（最多。Slack分析では3位→実データでは1位に上昇）
- 🟡 商品・価格: 9.0%
- 🟡 注文変更: 8.6%
- 🟠 品質クレーム: 6.1%（全件エスカレーション）
- 🟢 アカウント: 2.0%
- 🟢 支払い・請求: 1.9%（基本エスカレーション）
- 画像メッセージ: 全体の23%（品質クレーム時の写真添付率が高い）
- 月間メッセージ増加率: +18%/月
- 詳細: https://github.com/vegekul/vegekul-line-ai-chat

### Pending
#### PDM回答待ち (2件)
- [x] ~~Liny API連携可否~~ → ✅ CRM独自連携で解決
- [x] ~~EC_SEARCH_KEYWORD_QUEUE処理先~~ → ✅ BPaaS PostgreSQLのec_search_keywordsテーブル
- [ ] ECサイトのログイン日時記録 → Account/Customerに`last_login_at`なし。新規追加が必要
- [ ] CRMからEC DBへのアクセス方式 → SQS経由のみ。内部API新設を推奨

**2026-03-05: PDM（河口さん）にメール送信済み。残2件の回答待ち。**

#### LINE AI Chat 残タスク
- [x] ~~Notionデータ収集（CS/CRM関連ナレッジ）~~ → ✅ 取得・分析完了
- [x] ~~対応問答集の作成~~ → ✅ 7カテゴリ・40+パターン作成済み（Notion: https://www.notion.so/LINE-AI-31cf85be974e806db33ae7ae399af3e0）
- [ ] **CS部門の問答集レビュー待ち** ← ⚠️ ここで止まっている。⚠️確認ポイント12箇所のフィードバックが必要
- [x] ~~system-prompt.ts に事実情報追加~~ → ✅ 代表電話、配送ルール、欠品通知、写真対応等（CSレビュー不要分）
- [x] ~~Slack通知機能~~ → ✅ slack-notify.ts（Block Kit形式、escalation.tsに統合済み）
- [x] ~~AI Chat管理画面~~ → ✅ /chat（セッション一覧+KPI）+ /chat/[sessionId]（メッセージスレッド）
- [ ] system-prompt.ts の最終調整（CSレビュー反映後: AI/人間の境界線確定、回答文面微調整）
- [ ] Slack投稿（調査レポート共有ドラフトのレビュー後）
- [ ] SLACK_ESCALATION_WEBHOOK_URL のVercel設定（Webhook作成後）

### Next Steps (回答後)
1. CRM DB選定（MySQL or PostgreSQL）
2. データ取得方法の確定（API / DB直接 / バッチ処理）
3. Prismaマイグレーション実行
4. モックデータ → 実データ切替（Server Actionsのみ変更）
5. auth.tsのDB認証切替

## Architecture
- Server Actions (`src/lib/actions/`) = data access layer
- Mock data → Prisma queries swap when DB connected
- EC MySQL tables = READ-ONLY from CRM
- CRM tables (`crm_segments`, `crm_deliveries`, `crm_automation_rules`, `crm_chat_sessions`, `crm_chat_messages`) = read-write
- Roles: `admin` (full access) / `sales` (restricted: no segments/automation/settings/chat)
- Auth: NextAuth v5 + bcrypt + JWT strategy (8hr maxAge)

### LINE AI Chat Architecture
```
Liny Webhook → /api/webhooks/liny/inbound
  → createOrGetChatSession(lineUid)
  → getCustomerByLineUid(lineUid) → CustomerContext
  → buildSystemPrompt(customer) → 動的プロンプト生成
  → Claude API (chat-responder.ts)
  → if needsHumanSupport:
      → handleEscalation() → 並行実行:
        1. Liny タグ付与（AI_要対応 + カテゴリ別タグ）
        2. 汎用Webhook通知
        3. Slack Block Kit通知（緊急度3段階）
  → Liny Reply (LINE返信)
```

## Data Model
```
Account → SocialiteProvider (LINE UID = provider_id)
  └── AccountCustomer
        └── Customer → SmileOrder → OrderItem → MorikiProduct
                     → Cart → CartOrder → CartItem
                     → BusinessPartner (parent/children hierarchy)
```
**Note**: 1 Account → N Customer (important for queries)

## Key Patterns
- All data fetching through Server Actions
- Liny API = POST-only webhook (CRM → Liny), rate limited (5 concurrent, 200ms delay)
- LINE UID stored in `SocialiteProvider.provider_id`
- Customer status flow: ec_temporary_register → waiting_for_register → pre_transaction → in_transaction ↔ delivery_stop → stop
- Search keywords: EC → SQS → BPaaS PostgreSQL `ec_search_keywords` → daily CSV to S3

## Commands
```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run test         # Run Vitest (62 tests)
npm run test:watch   # Watch mode
npm run test:e2e     # Run Playwright E2E (7 tests)
npm run lint         # ESLint
npx prisma studio    # DB explorer
```

## Env Variables
```
AUTH_SECRET                    # Required: NextAuth encryption key
ANTHROPIC_API_KEY              # Required: Claude API key (LINE AI Chat)
LINY_ENDPOINT_URL              # Optional: Liny API endpoint
LINY_API_TOKEN                 # Optional: Liny API token (UUID format)
SLACK_ESCALATION_WEBHOOK_URL   # Optional: Slack Incoming Webhook (エスカレーション通知)
ESCALATION_WEBHOOK_URL         # Optional: 汎用Webhook (Slack未設定時のフォールバック)
AI_MONTHLY_TOKEN_BUDGET        # Optional: 月次トークン予算 (default: 500000)
LINY_WEBHOOK_SECRET            # Optional: Liny inbound webhook署名検証
# DATABASE_URL                 # Required when DB connected
```

## Security
- **Headers**: X-Frame-Options DENY, HSTS (2yr), nosniff, strict referrer, Permissions-Policy
- **Auth**: bcrypt (12 rounds), JWT 8hr session, middleware protects all routes except /login, /api/auth/*, /api/cron/*
- **Dev credentials**: Only shown in development mode (NODE_ENV check)

## Related Systems
- rakushiire.com: Customer-facing EC (Laravel 11 / Next.js 14 / MySQL 8.0)
- vege-tal.com: Admin dashboard (BPaaS, Laravel 11 / PostgreSQL 13)
- vegekul-activitylog-backend: Operation logs (Laravel 11 / DocumentDB)
- Kintone: Communication history
- Liny: LINE delivery management (5,772 friends)
- GA4: Analytics (deployed)
- Dev company: Kozocom (GitHub org: Kozocom)
- GitHub org (internal): vegekul
- GitHub repos (Kozocom): vegekul-EC-backend, vegekul-BPaaS-backend, vegekul-EC-frontend, vegekul-BPaaS-frontend-new, vegekul-activitylog-backend, vegekul-pm-docs
- GitHub repos (vegekul): vegekul-line-ai-chat (LINE AI調査データ), vegekul-dwh, sales-automation, infomart-integration, vegekul-support
