import type { Metadata } from "next";
import { Inter, Roboto, Playfair_Display, Space_Mono, Outfit } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Varsaka Invoice",
  description: "Varsaka Premium Invoice Generator",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { headers } = await import('next/headers');
  const { prisma } = await import('@/lib/db');
  
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

  if (ip !== 'unknown') {
    try {
      const block = await prisma.ipBlock.findUnique({ where: { ip_app: { ip, app: 'invoice' } } });
      if (block && (block.isPermanent || (block.blockedUntil && block.blockedUntil > new Date()))) {
        return (
          <html lang="en">
            <head>
               <title>404: This page could not be found.</title>
               <meta name="robots" content="noindex, nofollow" />
               <meta httpEquiv="refresh" content="5;url=https://varsaka.com" />
            </head>
            <body style={{ color: '#000', background: '#fff', margin: 0, fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans","Helvetica Neue",sans-serif' }}>
              <div style={{ height: '100vh', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                  <h1 style={{ display: 'inline-block', margin: '0 20px 0 0', paddingRight: '23px', fontSize: '24px', fontWeight: 500, verticalAlign: 'top', borderRight: '1px solid rgba(0,0,0,.3)' }}>404</h1>
                  <div style={{ display: 'inline-block', textAlign: 'left' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 400, lineHeight: '28px', margin: 0 }}>This page could not be found.</h2>
                  </div>
                </div>
              </div>
            </body>
          </html>
        );
      }
    } catch (e) {
      console.error("IP Block check failed:", e);
      // Fail open: don't crash the whole site if DB query fails
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} ${playfair.variable} ${spaceMono.variable} ${outfit.variable} ${inter.className}`}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
