# rakushiire-crm 引き継ぎプロンプト

> 新しいチャットセッションにこのプロンプトを貼り付けてください。

---

## プロンプト（コピー用）

```
rakushiire-crm プロジェクトの開発を引き継ぎます。

## プロジェクト
- リポジトリ: /Users/vegekul-024/Desktop/Claude/rakushiire-crm
- CLAUDE.md を最初に読んでください（プロジェクト構成・技術スタック・開発状況がすべて記載）
- 関連ドキュメント:
  - docs/development-plan.md — 開発計画・PDM残件
  - docs/technical-findings.md — 技術調査結果・データモデル
  - docs/spec.md — 仕様書
  - docs/screens.md — 画面設計

## 現在の状況（2026-03-05）
- Phase 1 Frontend: 8画面完成、デプロイ済み（https://rakushiire-crm.vercel.app）
- 技術スタック: Next.js 16 / React 19 / TypeScript / Tailwind CSS 4 / shadcn/ui / Prisma 7 / NextAuth v5
- Liny API接続テスト済み（Webhook POST連携、正常動作確認）
- セキュリティ・レスポンシブ・テスト・PWA・エラーハンドリング全て完了
- 現在モックデータで動作中 → DB接続後に実データに切り替える設計

## PDM回答待ち（2件）
PDM（河口康平 ko.kawaguchi@vegekul.com）にメール送信済み。回答待ち:
1. ECサイトのログイン日時記録 → Account/Customerにlast_login_atなし。新規カラム追加が必要
2. CRMからEC DBへのアクセス方式 → 現状SQS経由のみ。内部API新設を推奨

## 次のステップ（回答後）
1. CRM DB選定（MySQL or PostgreSQL）
2. データ取得方法の確定（API / DB直接 / バッチ処理）
3. Prismaマイグレーション実行
4. モックデータ → 実データ切替（Server Actionsのみ変更）
5. auth.tsのDB認証切替

## 開発環境
- npm run dev でポート3000
- .env.local に AUTH_SECRET, LINY_API_TOKEN, LINY_ENDPOINT_URL 設定済み
- Preview Server: .claude/launch.json の crm-dev
- テスト: npm run test (Vitest 21テスト), npm run test:e2e (Playwright 7テスト)

## 注意点
- Server Actions (src/lib/actions/) がデータアクセス層。DB切替時はここのみ変更
- Role: admin（全機能） / sales（5画面のみ、segments/automation/settings非表示）
- EC MySQL = READ-ONLY、CRMテーブル = read-write
- 1 Account → N Customer の関係性（重要）

まず CLAUDE.md を読んで全体像を把握してください。
```

---

## 追加コンテキスト（必要に応じて追記）

### 開発会社
- Kozocom（GitHub org: Kozocom）
- 関連リポジトリ: vegekul-EC-backend, vegekul-BPaaS-backend, vegekul-EC-frontend, vegekul-BPaaS-frontend-new, vegekul-activitylog-backend, vegekul-pm-docs

### 認証情報（開発用）
- admin: admin@rakushiire.com / admin123
- sales: sales@rakushiire.com / sales123

### Git最新コミット
- `1556bde` — feat: エラーハンドリング・セキュリティヘッダー・レスポンシブ・テスト・PWA
- `de27103` — fix: Liny接続テストで400レスポンスを正常と判定
- `09c898c` — feat: UX改善・ロール別UI制御・ページメタデータ整備
