import React from 'react';
import { getInvoices, deleteInvoice } from '@/actions/invoice';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FileText, Plus, Trash2, Edit, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { StatusDropdown } from '@/components/StatusDropdown';
import { NewInvoiceButton } from '@/components/NewInvoiceButton';

export default async function DashboardPage() {
  const invoices = await getInvoices();
  const totalRevenue = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.total, 0);
  const totalOutstanding = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Sent').reduce((acc, inv) => acc + inv.total, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard Overview</h1>
        <NewInvoiceButton />
      </div>

      {/* Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
          padding: '2rem', 
          borderRadius: '1.5rem', 
          boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 8px 10px -6px rgba(59, 130, 246, 0.1)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '150px', height: '150px', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>Total Revenue (Paid)</h3>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.75rem', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}>
              <DollarSign size={24} color="white" />
            </div>
          </div>
          <p style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.05em', position: 'relative', zIndex: 1 }}>${totalRevenue.toFixed(2)}</p>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
          padding: '2rem', 
          borderRadius: '1.5rem', 
          boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 8px 10px -6px rgba(16, 185, 129, 0.1)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', background: 'rgba(255,255,255,0.1)', width: '150px', height: '150px', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>Total Invoices</h3>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.75rem', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}>
              <TrendingUp size={24} color="white" />
            </div>
          </div>
          <p style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.05em', position: 'relative', zIndex: 1 }}>{invoices.length}</p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
          padding: '2rem', 
          borderRadius: '1.5rem', 
          boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.4), 0 8px 10px -6px rgba(245, 158, 11, 0.1)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', background: 'rgba(255,255,255,0.1)', width: '150px', height: '150px', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>Outstanding (Pending/Overdue)</h3>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.75rem', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}>
              <Clock size={24} color="white" />
            </div>
          </div>
          <p style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.05em', position: 'relative', zIndex: 1 }}>${totalOutstanding.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', borderRadius: '1.5rem', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Recent Invoices</h2>
        </div>
        
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)' }}>
            <div style={{ width: '80px', height: '80px', background: '#e0e7ff', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)' }}>
               <FileText size={40} color="#4f46e5" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No invoices yet</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>You haven't created any invoices. Get started by generating your first professional invoice.</p>
            <NewInvoiceButton />
          </div>
        ) : (
          <div style={{ overflowX: 'auto', padding: '1rem' }}>
            <table className="enterprise-table">
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
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{inv.issueDate}</td>
                    <td style={{ fontWeight: 500, color: 'var(--accent-primary)' }}>#{inv.invoiceNumber}</td>
                    <td>{inv.clientName}</td>
                    <td>
                      <StatusDropdown invoiceId={inv.id} initialStatus={inv.status} />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{inv.currency} {inv.total.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link href={`/app?edit=${inv.id}`}>
                          <button style={{ padding: '0.4rem', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', border: '1px solid transparent', borderRadius: '4px' }} title="Edit">
                            <Edit size={16} />
                          </button>
                        </Link>
                        <form action={async () => {
                          'use server';
                          await deleteInvoice(inv.id);
                        }}>
                          <button style={{ padding: '0.4rem', background: 'transparent', cursor: 'pointer', color: '#dc2626', border: '1px solid transparent', borderRadius: '4px' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
