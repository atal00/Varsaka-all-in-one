'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Technical error is logged server-side / console only, never exposed to user
    console.error('Dashboard rendering error:', error.message);
  }, [error]);

  return (
    <div style={{ maxWidth: '1200px', margin: '3rem auto', textAlign: 'center' }}>
      <div style={{ 
        background: 'var(--bg-surface)', 
        borderRadius: '1.5rem', 
        border: '1px solid var(--border-light)', 
        padding: '4rem 2rem',
        maxWidth: '560px',
        margin: '0 auto',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: '#fee2e2', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          color: '#dc2626'
        }}>
          <AlertTriangle size={32} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
          Unable to load dashboard data
        </h2>

        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          We encountered an issue retrieving your latest invoices and revenue summary. Your data is secure. Please try again.
        </p>

        <Button 
          onClick={() => reset()}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem'
          }}
        >
          <RefreshCw size={16} />
          Retry
        </Button>
      </div>
    </div>
  );
}
