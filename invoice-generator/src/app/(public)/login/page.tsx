'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import styles from '@/components/ui/ui.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [clientIp, setClientIp] = useState('Unknown');

  // Check if IP is blocked on mount
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(async data => {
        setClientIp(data.ip);
        try {
          const checkRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/check_ip_block`, {
            method: 'POST',
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_ip: data.ip, p_app: 'invoice' })
          });
          const isBlocked = await checkRes.json();
          if (isBlocked) {
            router.push('/404');
          }
        } catch (err) {}
      })
      .catch(() => {});
  }, [router]);

  const handleFailedAttempt = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/log_failed_attempt`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_ip: clientIp, p_app: 'invoice' })
      });
      
      // Immediately redirect without notification
      window.location.href = 'https://varsaka.com';
    } catch (err) {
      window.location.href = 'https://varsaka.com';
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const emailStr = formData.get('email')?.toString() || '';
    const passStr = formData.get('password')?.toString() || '';
    
    if (!emailStr.trim() || !passStr.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const res = await signIn('credentials', {
      redirect: false,
      email: emailStr,
      password: passStr,
    });
    if (res?.error) {
       handleFailedAttempt();
    } else {
       try {
         await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/clear_ip_block`, {
           method: 'POST',
           headers: {
             'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({ p_ip: clientIp, p_app: 'invoice' })
         });
       } catch (err) {}
       router.push('/dashboard');
    }
  }

  return (
    <div style={{ display: 'flex', flex: 1, backgroundImage: 'url(/3d-bg.png)', backgroundPosition: 'center center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden' }}>
      <div className={styles.glassCard} style={{ width: '100%', maxWidth: '440px', padding: '3.5rem 3rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', color: '#1e293b', marginBottom: '2.5rem', letterSpacing: '-0.03em' }}>Login</h2>
        
        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <input name="email" type="email" placeholder="••••••••••••" required className={styles.neumoInput} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input name="password" type="password" placeholder="••••••••••••" required className={styles.neumoInput} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className={styles.neumoBtn}>
              Login
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
