'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, Box, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === 'invoice@varsaka.com';

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/app', icon: FileText },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Items', href: '#', icon: Box },
  ];
  
  const bottomLinks = [
    { name: 'Settings', href: '/profile', icon: require('lucide-react').Settings },
  ];

  if (isAdmin) {
    bottomLinks.unshift({ name: 'IP Security', href: '/admin/security', icon: ShieldAlert });
    bottomLinks.unshift({ name: 'User Management', href: '/admin/users', icon: ShieldAlert });
  }

  return (
    <aside style={{ width: '240px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-light)', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          INVOICER<span style={{ color: 'var(--accent-primary)' }}>.</span>
        </h1>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
          Overview
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      <div style={{ flex: 1 }}></div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {bottomLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};
