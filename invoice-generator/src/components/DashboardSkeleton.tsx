import React from 'react';

export function MetricCardsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
      {/* Revenue Card Skeleton */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid var(--border-light)',
        padding: '2rem', 
        borderRadius: '1.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '140px', height: '18px' }} />
          <div className="skeleton-shimmer" style={{ width: '42px', height: '42px', borderRadius: '1rem' }} />
        </div>
        <div className="skeleton-shimmer" style={{ width: '180px', height: '44px', marginBottom: '0.5rem' }} />
      </div>

      {/* Invoices Card Skeleton */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid var(--border-light)',
        padding: '2rem', 
        borderRadius: '1.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '120px', height: '18px' }} />
          <div className="skeleton-shimmer" style={{ width: '42px', height: '42px', borderRadius: '1rem' }} />
        </div>
        <div className="skeleton-shimmer" style={{ width: '90px', height: '44px', marginBottom: '0.5rem' }} />
      </div>

      {/* Outstanding Card Skeleton */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid var(--border-light)',
        padding: '2rem', 
        borderRadius: '1.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '160px', height: '18px' }} />
          <div className="skeleton-shimmer" style={{ width: '42px', height: '42px', borderRadius: '1rem' }} />
        </div>
        <div className="skeleton-shimmer" style={{ width: '170px', height: '44px', marginBottom: '0.5rem' }} />
      </div>
    </div>
  );
}

export function RecentInvoicesSkeleton() {
  const placeholderRows = [1, 2, 3, 4, 5];

  return (
    <div style={{ 
      background: 'var(--bg-surface)', 
      borderRadius: '1.5rem', 
      border: '1px solid var(--border-light)', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
      overflow: 'hidden' 
    }}>
      <div style={{ 
        padding: '1.5rem 2rem', 
        borderBottom: '1px solid var(--border-light)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: '#f8fafc' 
      }}>
        <div className="skeleton-shimmer" style={{ width: '160px', height: '24px' }} />
        <div className="skeleton-shimmer" style={{ width: '80px', height: '18px', borderRadius: '4px' }} />
      </div>

      <div style={{ overflowX: 'auto', padding: '1rem' }}>
        <table className="enterprise-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice #</th>
              <th>Customer Name</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {placeholderRows.map((n) => (
              <tr key={n}>
                <td>
                  <div className="skeleton-shimmer" style={{ width: '90px', height: '16px' }} />
                </td>
                <td>
                  <div className="skeleton-shimmer" style={{ width: '80px', height: '16px' }} />
                </td>
                <td>
                  <div className="skeleton-shimmer" style={{ width: '140px', height: '16px' }} />
                </td>
                <td>
                  <div className="skeleton-shimmer" style={{ width: '70px', height: '24px', borderRadius: '4px' }} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="skeleton-shimmer" style={{ width: '90px', height: '18px', marginLeft: 'auto' }} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <div className="skeleton-shimmer" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                    <div className="skeleton-shimmer" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="skeleton-shimmer" style={{ width: '220px', height: '32px' }} />
        <div className="skeleton-shimmer" style={{ width: '140px', height: '40px', borderRadius: '8px' }} />
      </div>

      {/* Metric Cards Skeleton */}
      <MetricCardsSkeleton />

      {/* Recent Invoices Skeleton */}
      <RecentInvoicesSkeleton />
    </div>
  );
}

export default DashboardSkeleton;
