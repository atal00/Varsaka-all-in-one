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
    const block = await prisma.ipBlock.findUnique({ where: { ip } });
    if (block && (block.isPermanent || (block.blockedUntil && block.blockedUntil > new Date()))) {
      return (
        <html lang="en">
          <body className={`${inter.variable} ${roboto.variable} ${playfair.variable} ${spaceMono.variable} ${outfit.variable} ${inter.className}`}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
              <h1 style={{ fontSize: '6rem', fontWeight: 900, margin: 0, color: '#e2e8f0' }}>404</h1>
              <h2 style={{ fontSize: '2rem', marginTop: '-1rem', zIndex: 1 }}>Page Not Found</h2>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>The requested resource was not found.</p>
            </div>
          </body>
        </html>
      );
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
