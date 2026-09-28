'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/components/ui/ui.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientIp, setClientIp] = useState('Unknown');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl');
      const target = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('/api') && callbackUrl !== '/login'
        ? callbackUrl
        : '/dashboard';
      router.replace(target);
    }
  }, [status, router, searchParams]);

  // Handle URL error parameters
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      if (urlError === 'CredentialsSignin' || urlError === 'InvalidCredentials') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (urlError === 'Blocked') {
        router.push('/security-redirect');
      } else {
        setError('Authentication error occurred. Please try again.');
      }
    }
  }, [searchParams, router]);

  // Check if IP is blocked on mount
  useEffect(() => {
    let isMounted = true;
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(async data => {
        if (!isMounted) return;
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
          
          if (checkRes.ok) {
            const isBlocked = await checkRes.json();
            if (isBlocked === true && isMounted) {
              router.push('/security-redirect');
            }
          }
        } catch (err) {}
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
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

      const checkRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/check_ip_block`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_ip: clientIp, p_app: 'invoice' })
      });

      if (checkRes.ok) {
        const isBlocked = await checkRes.json();
        if (isBlocked === true) {
          router.push('/security-redirect');
          return;
        }
      }
    } catch (err) {}
    
    // Stay on login page and display generic secure error
    setError('Invalid email or password. Please check your credentials and try again.');
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const emailStr = formData.get('email')?.toString().trim().toLowerCase() || '';
    const passStr = formData.get('password')?.toString() || '';
    
    if (!emailStr || !passStr) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: emailStr,
        password: passStr,
      });

      if (res?.error) {
        await handleFailedAttempt();
      } else {
        // Clear IP block record on successful auth
        if (clientIp !== 'Unknown') {
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
        }

        // Validate callbackUrl if provided
        const callbackUrl = searchParams.get('callbackUrl');
        const target = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('/api') && callbackUrl !== '/login'
          ? callbackUrl
          : '/dashboard';

        router.refresh();
        router.push(target);
      }
    } catch (err) {
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flex: 1, backgroundImage: 'url(/3d-bg.png)', backgroundPosition: 'center center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden' }}>
      <div className={styles.glassCard} style={{ width: '100%', maxWidth: '440px', padding: '3.5rem 3rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, textAlign: 'center', color: '#1e293b', marginBottom: '2.5rem', letterSpacing: '-0.03em' }}>Login</h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ color: '#ef4444', textAlign: 'center', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <input 
              name="email" 
              type="email" 
              placeholder="name@varsaka.com" 
              required 
              disabled={loading}
              className={styles.neumoInput} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••••••" 
              required 
              disabled={loading}
              className={styles.neumoInput} 
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button 
              type="submit" 
              disabled={loading}
              className={styles.neumoBtn}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
