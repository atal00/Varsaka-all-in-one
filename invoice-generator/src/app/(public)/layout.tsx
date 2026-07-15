import React from 'react';
import { Navbar } from '@/components/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundImage: 'url(/landing-bg.png)', backgroundSize: 'cover', backgroundAttachment: 'fixed', backgroundPosition: 'center', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
