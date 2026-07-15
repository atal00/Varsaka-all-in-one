import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setUserRole(data.role);
      } else {
        setUserRole('employee'); // Fallback default
      }
    } catch (err) {
      console.error('Failed to fetch role:', err);
    }
  };

  useEffect(() => {
    // 🛡️ SECURITY FIX: Fetch validated session and role from database
    const initializeAuth = async () => {
      // 🛡️ SECURITY FIX: Prevent infinite hangs from Supabase Web Locks API deadlocks
      const timeoutId = setTimeout(() => {
        console.warn('Supabase Auth Initialization Timed Out. Forcing load...');
        setLoading(false);
      }, 3000);

      try {
        const { data, error } = await supabase.auth.getSession();
        const currentSession = data?.session;
        
        if (currentSession?.user) {
          setSession(currentSession);
          await fetchAndSetRole(currentSession.user.id);
        } else {
          setSession(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setSession(null);
        setUserRole(null);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to real-time auth changes securely
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      try {
        if (event === 'SIGNED_OUT' || !newSession) {
          setSession(null);
          setUserRole(null);
        } else if (newSession) {
          setSession(newSession);
          await fetchAndSetRole(newSession.user.id);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // fetchAndSetRole moved above useEffect

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    // Clear any potential rogue storage
    sessionStorage.removeItem('varsaka_user');
    localStorage.removeItem('supabase.auth.token');
  };

  return (
    <AuthContext.Provider value={{ session, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
