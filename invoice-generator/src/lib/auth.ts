import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

        if (ip !== 'unknown') {
          try {
            const checkRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/check_ip_block`, {
              method: 'POST',
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ p_ip: ip, p_app: 'invoice' }),
              cache: 'no-store'
            });
            if (checkRes.ok) {
              const isBlocked = await checkRes.json();
              if (isBlocked === true) {
                return null;
              }
            }
          } catch (e) {}
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() }
        });
        
        const isPasswordValid = user ? await bcrypt.compare(credentials.password, user.password) : false;

        if (!user || !isPasswordValid) {
          if (ip !== 'unknown') {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/log_failed_attempt`, {
                method: 'POST',
                headers: {
                  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ p_ip: ip, p_app: 'invoice' })
              });
            } catch (e) {}
          }
          return null;
        }

        // Success - reset attempts
        if (ip !== 'unknown') {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/clear_ip_block`, {
              method: 'POST',
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ p_ip: ip, p_app: 'invoice' })
            });
          } catch (e) {}
        }

        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = (token.id as string) || (token.sub as string);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        if (url === "/" || url.startsWith("/api/auth") || url === "/login") {
          return `${baseUrl}/dashboard`;
        }
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) {
          if (parsed.pathname === "/" || parsed.pathname.startsWith("/api/auth") || parsed.pathname === "/login") {
            return `${baseUrl}/dashboard`;
          }
          return url;
        }
      } catch {}
      return `${baseUrl}/dashboard`;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("CRITICAL: NEXTAUTH_SECRET is required in production"); })() : "varsaka_dev_nextauth_secret_insecure_local_only"),
};
