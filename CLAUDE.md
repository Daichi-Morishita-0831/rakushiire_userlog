# rakushiire-crm

## Overview
ラクシーレ（rakushiire.com）のCRM管理ツール。飲食店向けB2B卸売ECの顧客行動を可視化し、LINE/メール/SMSでターゲティング配信を実現する。

## Tech Stack
- **Framework**: Next.js 16 (App Router) / React 19 / TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui + Recharts
- **ORM**: Prisma 7 (MySQL 8.0)
- **Auth**: NextAuth.js 5 (beta.30) — bcryptハッシュ済みモック認証（DB切替準備済み）
- **LINE連携**: Liny API (Webhook POST) — **接続テスト済み・正常動作確認**
- **Testing**: Vitest + Testing Library (11テスト)
- **Deploy**: Vercel (https://rakushiire-crm.vercel.app)

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

## Development Status (2026-03-05)

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
- **Unit Tests**: ✅ 21 tests (Liny client, env validation, batch, auth, types)
- **E2E Tests**: ✅ 7 tests (Playwright — auth, navigation, role-based UI, 404)
- **CI/CD**: ✅ GitHub Actions (lint → test → build)
- **Dark Mode**: ✅ next-themes (system/light/dark toggle)
- **Lighthouse Optimization**: ✅ Static asset caching, image formats
- **Custom 404**: ✅ Japanese not-found page

### Pending (PDM回答待ち: 2件)
- [x] ~~Liny API連携可否~~ → ✅ CRM独自連携で解決
- [x] ~~EC_SEARCH_KEYWORD_QUEUE処理先~~ → ✅ BPaaS PostgreSQLのec_search_keywordsテーブル
- [ ] ECサイトのログイン日時記録 → Account/Customerに`last_login_at`なし。新規追加が必要
- [ ] CRMからEC DBへのアクセス方式 → SQS経由のみ。内部API新設を推奨

**2026-03-05: PDM（河口さん）にメール送信済み。残2件の回答待ち。**

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
- CRM tables (`crm_segments`, `crm_deliveries`, `crm_automation_rules`) = read-write
- Roles: `admin` (full access) / `sales` (restricted: no segments/automation/settings)
- Auth: NextAuth v5 + bcrypt + JWT strategy (8hr maxAge)

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
npm run test         # Run Vitest (21 tests)
npm run test:watch   # Watch mode
npm run test:e2e     # Run Playwright E2E (7 tests)
npm run lint         # ESLint
npx prisma studio    # DB explorer
```

## Env Variables
```
AUTH_SECRET           # Required: NextAuth encryption key
LINY_ENDPOINT_URL     # Optional: Liny API endpoint
LINY_API_TOKEN        # Optional: Liny API token (UUID format)
# DATABASE_URL        # Required when DB connected
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
- GitHub repos: vegekul-EC-backend, vegekul-BPaaS-backend, vegekul-EC-frontend, vegekul-BPaaS-frontend-new, vegekul-activitylog-backend, vegekul-pm-docs
