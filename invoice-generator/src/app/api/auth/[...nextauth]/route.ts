import NextAuth, { NextAuthOptions } from "next-auth"
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
                throw new Error("Blocked");
              }
            }
          } catch (e) {
            if (e instanceof Error && e.message === "Blocked") throw e;
          }
        }

        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
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
          throw new Error("InvalidCredentials");
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

        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('NEXTAUTH_SECRET is missing') })() : "fallback_secret_for_local_dev"),
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
