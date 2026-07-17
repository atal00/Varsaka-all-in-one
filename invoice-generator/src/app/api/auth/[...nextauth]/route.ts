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
          const block = await prisma.ipBlock.findUnique({ where: { ip_app: { ip, app: 'invoice' } } });
          if (block && (block.isPermanent || (block.blockedUntil && block.blockedUntil > new Date()))) {
            throw new Error("Blocked");
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
            const record = await prisma.ipBlock.upsert({
              where: { ip_app: { ip, app: 'invoice' } },
              update: { failedAttempts: { increment: 1 } },
              create: { ip, app: 'invoice', failedAttempts: 1 }
            });
            
            if (record.failedAttempts >= 3) {
              await prisma.ipBlock.update({
                where: { ip_app: { ip, app: 'invoice' } },
                data: { blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) }
              });
            }
          }
          throw new Error("InvalidCredentials");
        }

        // Success - reset attempts
        if (ip !== 'unknown') {
          await prisma.ipBlock.upsert({
            where: { ip_app: { ip, app: 'invoice' } },
            update: { failedAttempts: 0, blockedUntil: null },
            create: { ip, app: 'invoice', failedAttempts: 0 }
          });
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
