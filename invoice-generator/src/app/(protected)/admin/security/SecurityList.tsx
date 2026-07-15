'use client';

import React, { useState } from 'react';
import { unblockIp, togglePermanentBlock, deleteIpBlock } from '@/actions/security';
import toast from 'react-hot-toast';
import { Shield, ShieldOff, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SecurityList({ initialIps }: { initialIps: any[] }) {
  const [ips, setIps] = useState(initialIps);

  async function handleUnblock(ip: string) {
    try {
      await unblockIp(ip);
      setIps(ips.map(i => i.ip === ip ? { ...i, blockedUntil: null, failedAttempts: 0, isPermanent: false } : i));
      toast.success(`IP ${ip} has been unblocked`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleTogglePermanent(ip: string, currentStatus: boolean) {
    try {
      await togglePermanentBlock(ip, !currentStatus);
      setIps(ips.map(i => i.ip === ip ? { ...i, isPermanent: !currentStatus } : i));
      toast.success(currentStatus ? `Removed permanent block for ${ip}` : `Permanently blocked ${ip}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete(ip: string) {
    if (!confirm('Are you sure you want to delete this IP record completely?')) return;
    try {
      await deleteIpBlock(ip);
      setIps(ips.filter(i => i.ip !== ip));
      toast.success(`IP record deleted`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: '1.5rem', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto', padding: '1rem' }}>
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>IP Address</th>
              <th>Failed Attempts</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ips.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No IPs have been recorded or blocked yet.
                </td>
              </tr>
            ) : ips.map((ipRecord) => {
              const is24hrBlocked = ipRecord.blockedUntil && new Date(ipRecord.blockedUntil) > new Date();
              const isBlocked = ipRecord.isPermanent || is24hrBlocked;
              
              return (
                <tr key={ipRecord.ip}>
                  <td style={{ fontWeight: 600 }}>{ipRecord.ip}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      background: ipRecord.failedAttempts >= 3 ? '#fee2e2' : '#f1f5f9',
                      color: ipRecord.failedAttempts >= 3 ? '#ef4444' : '#64748b',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {ipRecord.failedAttempts} / 3
                    </span>
                  </td>
                  <td>
                    {ipRecord.isPermanent ? (
                      <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <ShieldOff size={16} /> Permanent Block
                      </span>
                    ) : is24hrBlocked ? (
                      <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <Clock size={16} /> 24hr Block
                      </span>
                    ) : (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <Shield size={16} /> Active
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {isBlocked && (
                        <Button variant="secondary" onClick={() => handleUnblock(ipRecord.ip)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Unblock
                        </Button>
                      )}
                      <Button 
                        variant={ipRecord.isPermanent ? "secondary" : "primary"} 
                        onClick={() => handleTogglePermanent(ipRecord.ip, ipRecord.isPermanent)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: ipRecord.isPermanent ? undefined : '#ef4444' }}
                      >
                        {ipRecord.isPermanent ? 'Remove Perm Block' : 'Perm Block'}
                      </Button>
                      <button 
                        onClick={() => handleDelete(ipRecord.ip)} 
                        style={{ padding: '0.4rem', background: 'transparent', cursor: 'pointer', color: '#dc2626', border: '1px solid transparent', borderRadius: '4px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
