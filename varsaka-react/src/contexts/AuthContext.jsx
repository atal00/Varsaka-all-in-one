import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { normalizePermissions, hasPermission, ALL_ADMIN_PERMISSIONS } from '../utils/permissions';

const AuthContext = createContext();

// Self-healing: scrub any legacy or stale permission caches that might conflict with DB RBAC
const scrubStaleArtifacts = () => {
  try {
    const staleKeys = [
      'varsaka_permissions', 
      'varsaka_perms', 
      'varsaka_role',
      'vk_perms', 
      'vk_permissions', 
      'vk_role', 
      'vk-role',
      'vk-access-token', 
      'user_permissions',
      'admin_permissions'
    ];
    staleKeys.forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {}
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);

  const enforceSessionTimer = (role) => {
    if (role === 'admin') {
      setSessionExpiry(null);
      return;
    }
    const storedTime = sessionStorage.getItem('varsaka_login_time');
    const now = Date.now();
    const MAX_DURATION = 30 * 60 * 1000; // 30 minutes
    
    if (!storedTime) {
      sessionStorage.setItem('varsaka_login_time', now.toString());
      setSessionExpiry(now + MAX_DURATION);
    } else {
      const loginTime = parseInt(storedTime, 10);
      if (now - loginTime >= MAX_DURATION) {
        signOut();
      } else {
        setSessionExpiry(loginTime + MAX_DURATION);
      }
    }
  };

  const [authError, setAuthError] = useState(null);

  const fetchAndSetRole = useCallback(async (user) => {
    if (!user) return null;
    
    let role = (user.user_metadata?.role || '').toLowerCase().trim() || null;
    let permissions = null;
    let fullName = user.user_metadata?.full_name || null;
    let isDisabled = false;

    try {
      console.log('[AuthContext] Fetching authoritative profile for user.id:', user.id);
      const queryPromise = supabase
        .from('profiles')
        .select('id, role, permissions, full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profiles query timed out after 4000ms')), 4000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      console.log('[AuthContext] profiles query returned:', { data, error });

      if (error) {
        console.error('[AuthContext] Supabase profiles query error:', error);
        setAuthError(error.message || JSON.stringify(error));
        throw error;
      }

      if (data) {
        if (data.role) {
          role = String(data.role).toLowerCase().trim();
        }
        fullName = data.full_name || fullName;
        isDisabled = Boolean(data.permissions?.is_disabled);

        if (isDisabled) {
          console.warn('[AuthContext] Account is deactivated. Terminating session.');
          await signOut();
          return null;
        }

        permissions = normalizePermissions(data.permissions, role);
      } else {
        console.warn('[AuthContext] No profile record found for user id:', user.id);
        setAuthError(`No profile found for user id ${user.id}`);
        // Fall back to user_metadata role if profile row doesn't exist yet
        role = role || 'employee';
        permissions = normalizePermissions(null, role);
      }
    } catch (err) {
      console.error('[AuthContext] Failed to fetch profile:', err);
      setAuthError(err.message || String(err));
      // Do not silently make an admin if error, preserve metadata role or fallback to employee
      role = role || 'employee';
      permissions = normalizePermissions(null, role);
    }

    // 🛡️ Admin Invariant: An admin role guarantees unrestricted access across all 12 modules
    if (role === 'admin') {
      permissions = JSON.parse(JSON.stringify(ALL_ADMIN_PERMISSIONS));
    }

    setUserRole(role);
    setUserPermissions(permissions);
    setUserProfile({ 
      id: user.id, 
      email: user.email, 
      name: fullName || user.email?.split('@')[0] || 'User', 
      role, 
      permissions 
    });
    enforceSessionTimer(role);
    return { role, permissions };
  }, []);

  const signOut = async () => {
    console.log('[AuthContext] signOut() initiated');
    try {
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('supabase.auth.signOut timed out after 1500ms')), 1500)
      );
      const res = await Promise.race([signOutPromise, timeoutPromise]);
      if (res?.error) {
        console.error('[AuthContext] supabase.auth.signOut returned error:', res.error);
      } else {
        console.log('[AuthContext] supabase.auth.signOut succeeded cleanly');
      }
    } catch (err) {
      console.warn('[AuthContext] supabase.auth.signOut warning/timeout:', err);
    } finally {
      // 🛡️ GUARANTEED: State cleanup and token scrubbing CANNOT be skipped
      setSession(null);
      setUserRole(null);
      setUserPermissions({});
      setUserProfile(null);
      setSessionExpiry(null);
      setLoading(false);
      setAuthError(null);

      // Thoroughly scrub all auth tokens and session data from localStorage
      try {
        const keysToRemove = Object.keys(localStorage).filter(k => 
          k.startsWith('sb-') || 
          k.startsWith('supabase.auth') || 
          k.startsWith('varsaka') ||
          k.startsWith('vk-') ||
          k.startsWith('vk_')
        );
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {
        console.error('[AuthContext] Error clearing localStorage auth keys:', e);
      }

      // Clear sessionStorage completely
      try {
        sessionStorage.clear();
      } catch (e) {
        console.error('[AuthContext] Error clearing sessionStorage:', e);
      }
      console.log('[AuthContext] signOut cleanup fully completed');
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 🛡️ SECURITY FIX: Fetch validated session and authoritative role from database
    const initializeAuth = async () => {
      scrubStaleArtifacts();
      console.log('[AuthContext] initializeAuth() starting');
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timed out after 3000ms')), 3000)
        );
        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
        console.log('[AuthContext] getSession returned:', { hasSession: !!data?.session, error });
        const currentSession = data?.session;
        
        if (currentSession?.user) {
          if (isMounted) setSession(currentSession);
          await fetchAndSetRole(currentSession.user);
        } else {
          if (isMounted) {
            setSession(null);
            setUserRole(null);
            setUserPermissions({});
            setUserProfile(null);
          }
        }
      } catch (err) {
        console.error("[AuthContext] Auth init error:", err);
        if (isMounted) {
          setAuthError(err.message || String(err));
          setSession(null);
          setUserRole(null);
          setUserPermissions({});
          setUserProfile(null);
        }
      } finally {
        console.log('[AuthContext] initializeAuth() completed. Setting loading = false');
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen to real-time auth changes securely
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[AuthContext] onAuthStateChange event:', event, 'newSession:', !!newSession);
      try {
        if (event === 'SIGNED_OUT' || !newSession) {
          if (isMounted) {
            setSession(null);
            setUserRole(null);
            setUserPermissions({});
            setUserProfile(null);
            setSessionExpiry(null);
            setLoading(false);
          }
        } else if (newSession) {
          if (isMounted) setSession(newSession);
          await fetchAndSetRole(newSession.user);
          if (isMounted) setLoading(false);
        }
      } catch (err) {
        console.error("[AuthContext] Auth state change error:", err);
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchAndSetRole]);

  useEffect(() => {
    if (!sessionExpiry) return;
    const interval = setInterval(() => {
      if (Date.now() > sessionExpiry) {
        signOut();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionExpiry]);

  const checkPermission = (moduleKey, actionKey = 'view') => {
    if (userRole === 'admin') return true;
    return hasPermission({ role: userRole, permissions: userPermissions }, moduleKey, actionKey);
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      userRole, 
      userPermissions, 
      userProfile, 
      loading, 
      authError,
      signOut, 
      sessionExpiry,
      hasPermission: checkPermission,
      isAdmin: userRole === 'admin',
      refreshProfile: () => session?.user && fetchAndSetRole(session.user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
