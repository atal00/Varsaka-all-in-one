import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ScrollTop from './components/ScrollTop';
import Home from './pages/Home';
import Preloader from './components/Preloader';

// 🚀 Performance: Lazy Load non-critical pages
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Careers = lazy(() => import('./pages/Careers'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NdaTemplate = lazy(() => import('./pages/NdaTemplate'));
const Login = lazy(() => import('./pages/Login'));
const Portal = lazy(() => import('./pages/Portal'));
const FunctionalTesting = lazy(() => import('./pages/FunctionalTesting'));
const AutomationTesting = lazy(() => import('./pages/AutomationTesting'));
const PerformanceTesting = lazy(() => import('./pages/PerformanceTesting'));
const SecurityTesting = lazy(() => import('./pages/SecurityTesting'));
const AIPoweredTesting = lazy(() => import('./pages/AIPoweredTesting'));
const MobileTesting = lazy(() => import('./pages/MobileTesting'));
const Apply = lazy(() => import('./pages/Apply'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const Fake404 = lazy(() => import('./pages/Fake404'));
const TimeBasedLogin = lazy(() => import('./pages/TimeBasedLogin'));
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
  const { session, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{height: '100vh', background: 'var(--bg-white)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>LOADING AUTH...</div>;
  
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Attempted Unauthorized Role Escalation
    return <Navigate to="/login" replace />;
  }

  return children;
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
        <Preloader />
        <AnimationTrigger />
        <ScrollTop />

        <Suspense fallback={<div style={{height: '100vh', background: 'var(--bg-white)'}} />}>
          <Routes>
            {/* Admin Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/:accessCode" element={<TimeBasedLogin />} />
            <Route path="/verify/:id" element={<VerifyCertificate />} />
            
            {/* Portal Pages (Protected) */}
            <Route path="/portal" element={<RequireAuth allowedRoles={['superadmin', 'admin', 'employee']}><Portal /></RequireAuth>} />

            {/* Service Pages */}
            <Route path="/services/functional-testing" element={<><Navbar /><FunctionalTesting /><Footer /></>} />
            <Route path="/services/automation-testing" element={<><Navbar /><AutomationTesting /><Footer /></>} />
            <Route path="/services/performance-testing" element={<><Navbar /><PerformanceTesting /><Footer /></>} />
            <Route path="/services/security-testing" element={<><Navbar /><SecurityTesting /><Footer /></>} />
            <Route path="/services/ai-powered-testing" element={<><Navbar /><AIPoweredTesting /><Footer /></>} />
            <Route path="/services/mobile-testing" element={<><Navbar /><MobileTesting /><Footer /></>} />
            
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
