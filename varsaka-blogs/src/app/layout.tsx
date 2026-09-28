import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"]
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"]
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Varsaka Engineering & Quality Assurance Blog | Insights & Practices",
  description: "In-depth insights, engineering guides, and quality assurance strategies from the Varsaka team.",
  metadataBase: new URL("https://blog.varsaka.com"),
  alternates: {
    canonical: "https://blog.varsaka.com",
  },
  openGraph: {
    title: "Varsaka Engineering & QA Blog",
    description: "In-depth insights, engineering guides, and quality assurance strategies from the Varsaka team.",
    url: "https://blog.varsaka.com",
    siteName: "Varsaka Blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varsaka Engineering & QA Blog",
    description: "In-depth insights, engineering guides, and quality assurance strategies from the Varsaka team.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isDown = false;

  if (isDown) {
    return (
      <html lang="en">
        <body style={{ height: '100vh', width: '100vw', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', margin: 0, fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>Under Maintenance</h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px' }}>Our Blog & Case Studies system is temporarily offline for maintenance. Please check back soon.</p>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
