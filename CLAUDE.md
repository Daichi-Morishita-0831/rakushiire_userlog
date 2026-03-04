# rakushiire-crm

## Overview
ラクシーレ（rakushiire.com）のCRM管理ツール。飲食店向けB2B卸売ECの顧客行動を可視化し、LINE/メール/SMSでターゲティング配信を実現する。

## Tech Stack
- **Framework**: Next.js 16 (App Router) / React 19 / TypeScript
- **UI**: Tailwind CSS 4 + shadcn/ui + Recharts
- **ORM**: Prisma 7 (MySQL 8.0)
- **Auth**: NextAuth.js 5 (beta) — 現在モック認証
- **LINE連携**: Liny API (Webhook POST)
- **Deploy**: Vercel (https://rakushiire-crm.vercel.app)

## Project Structure
```
src/
├── app/              # Pages (App Router)
│   ├── page.tsx      # Dashboard
│   ├── users/        # User list & detail
│   ├── segments/     # Segment management
│   ├── delivery/     # Manual message delivery
│   ├── automation/   # Automation rules
│   ├── history/      # Delivery history
│   ├── churn/        # Churn/new analysis
│   └── settings/     # Settings & Liny config
├── components/
│   ├── ui/           # shadcn/ui (20+ components)
│   ├── sidebar.tsx   # Navigation
│   └── charts.tsx    # Chart utilities
├── lib/
│   ├── mock-data.ts  # Mock data (→ DB swap予定)
│   ├── types.ts      # Shared type definitions
│   ├── liny.ts       # Liny API client
│   ├── prisma.ts     # Prisma client singleton
│   └── actions/      # Server Actions (data access layer)
│       ├── customers.ts
│       ├── dashboard.ts
│       ├── segments.ts
│       ├── deliveries.ts
│       ├── automation.ts
│       ├── churn.ts
│       └── liny.ts
prisma/
├── schema.prisma     # DB schema (EC + CRM tables)
└── seed.ts           # Seed script
docs/
├── spec.md
├── screens.md
├── development-plan.md
└── technical-findings.md
```

## Development Status (2026-03-04)
- **Phase 1 Frontend**: ✅ Complete (7 screens)
- **Liny API Integration**: ✅ Complete & deployed
- **Data**: 100% mock data — DB connection pending PDM confirmation
- **Auth**: Mock credentials (admin@rakushiire.com / sales@rakushiire.com)

### Pending PDM Items
- [ ] EC_SEARCH_KEYWORD_QUEUE processing destination
- [ ] EC login datetime recording (dedicated column?)
- [ ] CRM → EC DB direct access vs API only

## Architecture
- Server Actions (`src/lib/actions/`) = data access layer
- Mock data → Prisma queries swap when DB connected
- EC MySQL tables = READ-ONLY from CRM
- CRM tables (`crm_segments`, `crm_deliveries`, `crm_automation_rules`) = read-write
- Dashboard page.tsx currently imports mock-data directly (TODO: migrate to Server Actions)

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
- Liny API = POST-only webhook (CRM → Liny)
- LINE UID stored in `SocialiteProvider.provider_id`
- Customer status flow: ec_temporary_register → waiting_for_register → pre_transaction → in_transaction ↔ delivery_stop → stop

## Commands
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio    # DB explorer
```

## Env Variables
```
DATABASE_URL, LINY_ENDPOINT_URL, LINY_API_TOKEN, NEXTAUTH_SECRET, AUTH_SECRET
```

## Related Systems
- rakushiire.com: Customer-facing EC (Laravel 11 / Next.js 14)
- vege-tal.com: Admin dashboard (BPaaS)
- Kintone: Communication history
- Liny: LINE delivery management (5,772 friends)
- GA4: Analytics (deployed)
- Dev company: Kozocom (GitHub org)
