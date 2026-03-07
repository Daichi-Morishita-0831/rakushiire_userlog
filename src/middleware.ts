export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // 以下を除外して全ルートを保護:
    // - /api/auth/* (NextAuth APIルート)
    // - /api/cron/* (CRONジョブ — 別途トークン検証)
    // - /api/webhooks/* (Webhook — 署名検証で保護)
    // - /_next/static, /_next/image (Nextアセット)
    // - /favicon.ico
    // - /login (ログインページ)
    "/((?!api/auth|api/cron|api/webhooks|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
