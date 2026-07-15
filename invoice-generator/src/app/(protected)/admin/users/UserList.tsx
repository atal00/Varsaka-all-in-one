'use client';

import React, { useState } from 'react';
import { deleteUser, createUser } from '@/actions/admin';
import { Button } from '@/components/ui/Button';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import styles from '@/components/ui/ui.module.css';

export default function UserList({ initialUsers }: { initialUsers: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    try {
      await createUser(formData);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    try {
      await deleteUser(id);
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
      <div className={styles.glassCard} style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} className="text-primary" />
          Registered Users
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {initialUsers.map(user => (
            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
              {user.email !== 'invoice@varsaka.com' && (
                <button onClick={() => handleDelete(user.id)} disabled={loading} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={18} />
                </button>
              )}
              {user.email === 'invoice@varsaka.com' && (
                <span style={{ fontSize: '0.75rem', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Master</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.glassCard} style={{ padding: '2rem', alignSelf: 'start' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={20} className="text-primary" />
          Add New User
        </h2>
        
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>{error}</p>}
        
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
            <input name="name" type="text" required className={styles.neumoInput} placeholder="e.g. Rahul Sharma" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
            <input name="email" type="email" required className={styles.neumoInput} placeholder="rahul@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
            <input name="password" type="password" required minLength={8} className={styles.neumoInput} placeholder="Minimum 8 characters" />
          </div>
          <Button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating...' : 'Create Secure Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
