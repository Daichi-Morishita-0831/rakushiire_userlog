import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth-utils";

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "ラクシーレ CRM",
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
    }),
  ],
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
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
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
