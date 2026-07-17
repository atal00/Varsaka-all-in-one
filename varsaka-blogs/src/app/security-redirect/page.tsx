'use client';

import React from 'react';

export default function SecurityRedirectPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, margin: 0, color: '#e2e8f0' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginTop: '-1rem', zIndex: 1 }}>Page Not Found</h2>
      <p style={{ marginTop: '1.5rem', color: '#64748b', fontSize: '1.1rem' }}>
        The requested resource was not found.
      </p>
      <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        You have been temporarily blocked for security reasons.
      </p>
    </div>
  );
}
