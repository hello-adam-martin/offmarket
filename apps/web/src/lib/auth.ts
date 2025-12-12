import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        // For development/demo - in production, implement proper email verification
        if (!credentials?.email) return null;

        const email = credentials.email as string;

        // Call our API to register/login the user
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();

        if (!data.success) return null;

        return {
          id: data.data.user.id,
          email: data.data.user.email,
          name: data.data.user.name,
          apiToken: data.data.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.apiToken = (user as any).apiToken;
      }

      // If signing in with OAuth, register with API
      if (account && account.provider !== "credentials") {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: token.email,
              name: token.name,
            }),
          }
        );

        const data = await response.json();
        if (data.success) {
          token.id = data.data.user.id;
          token.apiToken = data.data.token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).apiToken = token.apiToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
