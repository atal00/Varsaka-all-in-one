import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './supabaseClient';
import TimeBasedLogin from './pages/TimeBasedLogin';

// 🚀 Performance: Lazy Load non-critical pages
const Login = lazy(() => import('./pages/Login'));
const Portal = lazy(() => import('./pages/Portal'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const Fake404 = lazy(() => import('./pages/Fake404'));
import './index.css';

function AnimationTrigger() {
  const location = useLocation();
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 40);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.01 });

    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    }, 100);

    return () => {
      obs.disconnect();
      clearTimeout(timer);
    };
  }, [location]);
  return null;
}

// 🛡️ Strict Security Guard: Protected Route via AuthContext
function RequireAuth({ children, allowedRoles }) {
  const { session, userRole, loading, authError } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handlePageShow = async (e) => {
      if (e.persisted) {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          window.location.replace('/login');
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh', 
        background: 'var(--bg-white)', 
        color: '#64748b', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '18px',
        fontFamily: 'Inter, sans-serif',
        gap: '12px'
      }}>
        <div id="auth-status-text">Authenticating session...</div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If session is present but user role could not be resolved from DB
  if (!userRole) {
    return (
      <div style={{
        height: '100vh', 
        background: 'var(--bg-white)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'Inter, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>⚠️</div>
        <h2 style={{color: '#1e293b', marginBottom: '8px'}}>Unable to Authenticate Role</h2>
        <p style={{color: '#64748b', maxWidth: '480px', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5'}}>
          {authError ? `Error details: ${authError}` : 'Could not retrieve your user permissions from the database. Please try logging in again.'}
        </p>
        <button 
          onClick={() => window.location.replace('/login')} 
          style={{padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px'}}
        >
          Return to Login
        </button>
      </div>
    );
  }

  const role = (userRole || '').toLowerCase().trim();
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Attempted Unauthorized Role Escalation
    return <Navigate to="/login" replace />;
  }

  return children;
}

// 🛡️ Root Route: Authenticated users visit /portal; unauthenticated users visit /login
function RootRoute() {
  const { session, loading } = useAuth();
  if (loading) {
    return <div style={{height: '100vh', background: 'var(--bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#64748b'}}>Authenticating session...</div>;
  }
  if (session) {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  useEffect(() => {
    // 🛡️ THE GREAT WALL: Anti-Hacker Protection
    const block = (e) => e.preventDefault();
    
    // Disable Right Click
    document.addEventListener('contextmenu', block);

    const keyBlock = (e) => {
      // Block F12, Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+U (Source), Ctrl+S (Save), Ctrl+Shift+C (Inspect Element)
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || 
        (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 70)) || 
        (e.metaKey && e.shiftKey && e.keyCode === 73) || // Mac support
        (e.metaKey && e.altKey && e.keyCode === 73) // Safari support
      ) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', keyBlock);

    // Disable Drag & Drop (prevents people from stealing assets easily)
    document.addEventListener('dragstart', block);
    
    // 🛡️ Prevent Console Logging in Production
    if (import.meta.env.PROD) {
      const noop = () => {};
      Object.defineProperty(window.console, 'log', { value: noop, writable: false });
      Object.defineProperty(window.console, 'warn', { value: noop, writable: false });
      Object.defineProperty(window.console, 'error', { value: noop, writable: false });
      Object.defineProperty(window.console, 'info', { value: noop, writable: false });
    }

    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', keyBlock);
      document.removeEventListener('dragstart', block);
    };
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
        <AnimationTrigger />

        <Suspense fallback={<div style={{height: '100vh', background: 'var(--bg-white)'}} />}>
          <Routes>
            {/* Admin Public Routes */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify/:id" element={<VerifyCertificate />} />
            
            {/* Portal Pages (Protected) */}
            <Route path="/portal" element={<RequireAuth allowedRoles={['admin', 'employee', 'blogger']}><Portal /></RequireAuth>} />
            
            {/* Dynamic Security & 404 Pages */}
            <Route path="/404" element={<Fake404 />} />
            <Route path="/:accessCode" element={<TimeBasedLogin />} />
            <Route path="*" element={<Fake404 />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </HelmetProvider>
  );
}
