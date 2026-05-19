import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiFetch, TokenResponse } from "./api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "magic-link",
      name: "Magic Link",
      credentials: {
        apiToken: { label: "API Token", type: "text" },
        userId: { label: "User ID", type: "text" },
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.apiToken || !credentials?.userId || !credentials?.email) {
          return null;
        }
        return {
          id: credentials.userId,
          email: credentials.email,
          apiToken: credentials.apiToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.apiToken = (user as { apiToken?: string }).apiToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
      }
      (session as { apiToken?: string }).apiToken = token.apiToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function syncApiToken(userId: string, email: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/sync", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, email }),
  });
}
