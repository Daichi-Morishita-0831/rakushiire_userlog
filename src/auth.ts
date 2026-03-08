import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { verifyPassword } from "@/lib/auth-utils";
import type { Provider } from "next-auth/providers";

// --- Mock users (development only) ---
// DB接続後は prisma.account.findUnique() に置き換え
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@rakushiire.com",
    hashedPassword: "$2b$12$RmQ3MYN6JWvS5pSYW0L1seYcMcJKQut7iirgfRm8WpM2F/ipguMay", // admin123
    name: "管理者",
    role: "admin",
  },
  {
    id: "2",
    email: "sales@rakushiire.com",
    hashedPassword: "$2b$12$F6pOz5ywrpPAk2sQ.DqMMu60hsifccw085IuSieBs2iQVxggkIL.q", // sales123
    name: "営業担当",
    role: "sales",
  },
];

// --- プロバイダー構築（Google OAuth は環境変数がある場合のみ有効化）---
const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  Credentials({
    name: "ベジクル CRM",
    credentials: {
      email: { label: "メールアドレス", type: "email" },
      password: { label: "パスワード", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;

      if (!email || !password) return null;

      // --- DB接続後のコード ---
      // const account = await prisma.account.findUnique({ where: { email } });
      // if (!account || account.deletedAt) return null;
      // const valid = await verifyPassword(password, account.password);
      // if (!valid) return null;
      // return { id: String(account.id), email: account.email, name: account.username, role: "sales" };

      // --- Mock auth（開発用）---
      const user = MOCK_USERS.find((u) => u.email === email);
      if (!user) return null;

      const valid = await verifyPassword(password, user.hashedPassword);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  })
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8時間（業務時間中のみ有効）
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnLogin = nextUrl.pathname === "/login";
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      return isLoggedIn;
    },
    jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          // Google OAuth ユーザー: デフォルトで admin ロールを付与
          // DB接続時は Account テーブルからロールを取得する
          // TODO: const dbUser = await prisma.account.findUnique({ where: { email: user.email } });
          // TODO: token.role = dbUser?.role ?? "sales";
          token.role = "admin";
        } else {
          // Credentials ユーザー: authorize() で設定された role を使用
          token.role = user.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});
