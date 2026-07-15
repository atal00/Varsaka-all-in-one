'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Features', path: '/features' },
  ];

  return (
    <header style={{ 
      padding: '0.75rem 1.5rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      background: 'rgba(255, 255, 255, 0.85)', 
      backdropFilter: 'blur(32px)', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.8)', 
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
      position: 'sticky', 
      top: 0, 
      zIndex: 50 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Image src="/logo.png" alt="Varsaka Logo" width={36} height={36} style={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            VARSAKA<span style={{ color: 'var(--accent-primary)' }}>.</span>
          </h1>
        </Link>
        <nav style={{ display: 'none', gap: '2.5rem' }} className="md-flex">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.path} 
              style={{ 
                textDecoration: 'none', 
                fontWeight: 600,
                fontSize: '0.875rem', 
                color: pathname === link.path ? 'var(--accent-primary)' : '#334155',
                transition: 'all 0.2s ease'
              }}
              className="nav-link-hover"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', gap: '1.25rem' }}>
        <Link href="/login">
          <Button className="spatial-hover" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>Login <ArrowRight size={14} /></Button>
        </Link>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
        }
      `}</style>
    </header>
  );
};
