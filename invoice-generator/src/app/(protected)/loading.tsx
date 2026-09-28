import React from 'react';

export default function ProtectedLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="skeleton-shimmer" style={{ width: '200px', height: '32px' }} />
        <div className="skeleton-shimmer" style={{ width: '120px', height: '38px', borderRadius: '8px' }} />
      </div>

      <div style={{ 
        background: 'var(--bg-surface)', 
        borderRadius: '1.5rem', 
        border: '1px solid var(--border-light)', 
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="skeleton-shimmer" style={{ width: '40%', height: '24px', marginBottom: '1.5rem' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', marginBottom: '1rem' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', marginBottom: '1rem' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', marginBottom: '1rem' }} />
        <div className="skeleton-shimmer" style={{ width: '80%', height: '48px' }} />
      </div>
    </div>
  );
}
