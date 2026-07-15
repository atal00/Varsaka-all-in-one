import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer style={{ 
      padding: '4rem 3rem 2rem 3rem', 
      borderTop: '1px solid rgba(255, 255, 255, 0.4)', 
      color: 'var(--text-secondary)',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            INVOICER<span style={{ color: 'var(--accent-primary)' }}>.</span>
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>The ultimate invoicing platform for modern professionals.</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Product</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link href="/features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Social</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Twitter</a></li>
            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>LinkedIn</a></li>
            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a></li>
          </ul>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.875rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem' }}>
        © {new Date().getFullYear()} Invoicer SaaS. All rights reserved.
      </div>
    </footer>
  );
};
