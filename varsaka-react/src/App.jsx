import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ScrollTop from './components/ScrollTop';
import Home from './pages/Home';
import Preloader from './components/Preloader';
import ConsentBanner from './components/ConsentBanner';

// 🚀 Performance: Lazy Load non-critical pages
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Careers = lazy(() => import('./pages/Careers'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiesPolicy = lazy(() => import('./pages/CookiesPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Portal = lazy(() => import('./pages/Portal'));
const FunctionalTesting = lazy(() => import('./pages/FunctionalTesting'));
const AutomationTesting = lazy(() => import('./pages/AutomationTesting'));
const PerformanceTesting = lazy(() => import('./pages/PerformanceTesting'));
const SecurityTesting = lazy(() => import('./pages/SecurityTesting'));
const AIPoweredTesting = lazy(() => import('./pages/AIPoweredTesting'));
const MobileTesting = lazy(() => import('./pages/MobileTesting'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Apply = lazy(() => import('./pages/Apply'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
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
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '18px',
        fontFamily: 'Inter, sans-serif'
      }}>
        Authenticating session...
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

  export default function App() {
  useEffect(() => {
    // 🛡️ Prevent Console Logging in Production
    if (import.meta.env.PROD) {
      const noop = () => {};
      Object.defineProperty(window.console, 'log', { value: noop, writable: false });
      Object.defineProperty(window.console, 'warn', { value: noop, writable: false });
      Object.defineProperty(window.console, 'error', { value: noop, writable: false });
      Object.defineProperty(window.console, 'info', { value: noop, writable: false });
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
        <Preloader />
        <AnimationTrigger />
        <ScrollTop />
        <ConsentBanner />

        <Suspense fallback={<div style={{height: '100vh', background: 'var(--bg-white)'}} />}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<><Navbar /><Home /><Chatbot /><Footer /></>} />
            <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
            <Route path="/blog" element={<><Navbar /><Blog /><Footer /></>} />
            <Route path="/blog/:id" element={<><Navbar /><BlogDetail /><Footer /></>} />
            <Route path="/careers" element={<><Navbar /><Careers /><Footer /></>} />
            <Route path="/apply" element={<><Navbar /><Apply /><Footer /></>} />
            <Route path="/case-studies" element={<><Navbar /><CaseStudies /><Footer /></>} />
            <Route path="/case-studies/:id" element={<><Navbar /><CaseStudyDetail /><Footer /></>} />
            <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicy /><Footer /></>} />
            <Route path="/terms-of-service" element={<><Navbar /><TermsOfService /><Footer /></>} />
            <Route path="/terms-and-conditions" element={<><Navbar /><TermsOfService /><Footer /></>} />
            <Route path="/cookies-policy" element={<><Navbar /><CookiesPolicy /><Footer /></>} />
            <Route path="/cookie-policy" element={<><Navbar /><CookiesPolicy /><Footer /></>} />
            <Route path="/refund-policy" element={<><Navbar /><RefundPolicy /><Footer /></>} />
            <Route path="/verify/:id" element={<VerifyCertificate />} />
            <Route path="/contact" element={<Navigate to="/#contact" replace />} />
            
            {/* Portal Pages (Protected) */}
            <Route path="/portal" element={<RequireAuth allowedRoles={['admin', 'employee', 'blogger']}><Portal /></RequireAuth>} />

            {/* Service Pages */}
            <Route path="/services/functional-testing" element={<><Navbar /><FunctionalTesting /><Footer /></>} />
            <Route path="/services/automation-testing" element={<><Navbar /><AutomationTesting /><Footer /></>} />
            <Route path="/services/performance-testing" element={<><Navbar /><PerformanceTesting /><Footer /></>} />
            <Route path="/services/security-testing" element={<><Navbar /><SecurityTesting /><Footer /></>} />
            <Route path="/services/ai-powered-testing" element={<><Navbar /><AIPoweredTesting /><Footer /></>} />
            <Route path="/services/mobile-testing" element={<><Navbar /><MobileTesting /><Footer /></>} />
            <Route path="/services/:slug" element={<><Navbar /><ServiceDetail /><Footer /></>} />
            
            {/* Dynamic Security & 404 Pages */}
            <Route path="/404" element={<Fake404 />} />
            <Route path="*" element={<Fake404 />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </HelmetProvider>
  );
}
