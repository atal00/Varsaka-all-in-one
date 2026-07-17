"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [clientIp, setClientIp] = useState('Unknown');

  useEffect(() => {
    // If they got kicked out for access denied, ensure they are locally signed out
    if (typeof window !== 'undefined' && window.location.search.includes('error=access_denied')) {
      setError('Access Denied: Your administrator has not granted you access to the Blogs CMS.');
      supabase.auth.signOut();
      setSession(null);
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Check if IP is blocked on mount
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(async data => {
        setClientIp(data.ip);
        const { data: isBlocked } = await supabase.rpc('check_ip_block', { p_ip: data.ip, p_app: 'blogs' });
        if (isBlocked) {
          router.push('/404');
        }
      })
      .catch(() => {});

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleFailedAttempt = async () => {
    await supabase.rpc('log_failed_attempt', { p_ip: clientIp, p_app: 'blogs' });
    // Immediately redirect without notification
    window.location.href = 'https://varsaka.com';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      handleFailedAttempt();
    } else {
      await supabase.rpc('clear_ip_block', { p_ip: clientIp, p_app: 'blogs' });
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-serif tracking-tight text-foreground font-medium">
          Varsaka <span className="text-v-muted italic font-light">Content Intelligence</span>
        </h1>
        <p className="text-xl text-v-muted font-sans">
          Enterprise-grade AI platform for trending topic discovery, deep research, and high-quality content generation.
        </p>
        
        <div className="pt-8 flex flex-col items-center justify-center space-y-4">
          {!session ? (
            <div className="bg-surface p-8 rounded-xl shadow-sm border border-border w-full max-w-md text-left">
              <h2 className="text-2xl font-serif font-medium mb-4 text-foreground text-center">Sign in to Dashboard</h2>
              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <button disabled={loading} type="submit" className="w-full bg-foreground hover:bg-v-muted text-background font-medium font-sans py-3 px-4 rounded-lg transition-colors">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-surface p-8 rounded-xl shadow-sm border border-border w-full max-w-md flex flex-col items-center justify-center space-y-4">
              <h2 className="text-2xl font-serif font-medium text-foreground">Welcome!</h2>
              <p className="text-v-muted font-sans">Access your content dashboard.</p>
              <button onClick={() => router.push("/dashboard")} className="block w-full mt-4 bg-foreground text-background hover:bg-v-muted font-medium font-sans py-3 px-4 rounded-lg transition-colors text-center">
                Go to Dashboard
              </button>
              <button onClick={() => supabase.auth.signOut()} className="block w-full mt-2 text-foreground font-medium py-2 text-center underline">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
