import Layout from './Layout.jsx'
import Admin from './pages/Admin.jsx'
import Login from './pages/Login.jsx'
import PortalApp from './pages/portal/PortalApp.jsx'
import { AuthProvider } from './lib/rbac.jsx'
import BlogEditor from './pages/admin/editors/BlogEditor.jsx'
import CaseStudyEditor from './pages/admin/editors/CaseStudyEditor.jsx'
import CareerEditor from './pages/admin/editors/CareerEditor.jsx'

// Each gated area shares one session via AuthProvider.
const gated = (el) => <AuthProvider>{el}</AuthProvider>

// Route map. Content (blog posts, jobs, case studies) is served dynamically from the API /
// MongoDB at runtime, so detail pages use a single `:slug` route rather than build-time
// prerendered paths. Marketing pages remain code-split via `lazy`.
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, lazy: () => import('./pages/Home.jsx') },

      { path: 'services/functional-testing', lazy: () => import('./pages/services/functional.jsx') },
      { path: 'services/automation-testing', lazy: () => import('./pages/services/automation.jsx') },
      { path: 'services/performance-testing', lazy: () => import('./pages/services/performance.jsx') },
      { path: 'services/security-testing-vapt', lazy: () => import('./pages/services/security.jsx') },
      { path: 'services/ai-powered-qa', lazy: () => import('./pages/services/aiQa.jsx') },
      { path: 'services/mobile-app-testing', lazy: () => import('./pages/services/mobile.jsx') },

      { path: 'process', lazy: () => import('./pages/Process.jsx') },
      { path: 'about', lazy: () => import('./pages/About.jsx') },
      { path: 'pricing', lazy: () => import('./pages/Pricing.jsx') },
      { path: 'contact', lazy: () => import('./pages/Contact.jsx') },

      // Legal
      { path: 'privacy-policy', lazy: () => import('./pages/PrivacyPolicy.jsx') },
      { path: 'terms-and-conditions', lazy: () => import('./pages/TermsConditions.jsx') },

      // Careers — list + dynamic per-role detail (data from MongoDB).
      { path: 'careers', lazy: () => import('./pages/Careers.jsx') },
      { path: 'careers/:slug', lazy: () => import('./pages/CareerDetail.jsx') },

      // Work / case studies — list + dynamic per-study detail (data from MongoDB).
      { path: 'work', lazy: () => import('./pages/Work.jsx') },
      { path: 'work/:slug', lazy: () => import('./pages/CaseStudyDetail.jsx') },

      // Blog — list + dynamic per-post detail (data from MongoDB).
      { path: 'blog', lazy: () => import('./pages/Blog.jsx') },
      { path: 'blog/:slug', lazy: () => import('./pages/BlogPost.jsx') },

      // Internal, unlinked, noindex.
      { path: 'dev/styleguide', lazy: () => import('./pages/Styleguide.jsx') },
      { path: 'dev/hero-test', lazy: () => import('./pages/HeroTest.jsx') },

      // Concrete /404 so the build emits a static 404.html (Vercel serves it for
      // unmatched routes with a real 404 status); the wildcard handles in-app
      // client-side navigation to unknown paths.
      { path: '404', lazy: () => import('./pages/NotFound.jsx') },
      { path: '*', lazy: () => import('./pages/NotFound.jsx') },
    ],
  },
  {
    // Single auth entry point. Shares the AuthProvider session; redirects by role
    // after sign-in (staff → /admin/dashboard, client → /portal).
    path: '/login',
    element: (
      <AuthProvider>
        <Login />
      </AuthProvider>
    ),
  },
  {
    // The active admin section lives in the URL (/admin, /admin/blog, /admin/users, …)
    // so refresh and direct URL access land on the same view. The optional :section
    // param keeps a single Admin/AuthProvider mounted across section switches.
    path: '/admin/:section?',
    element: (
      <AuthProvider>
        <Admin />
      </AuthProvider>
    ),
  },
  // Dedicated full-page CMS editors (replace the old slide-over drawers).
  { path: '/admin/blog/new', element: gated(<BlogEditor />) },
  { path: '/admin/blog/:id/edit', element: gated(<BlogEditor />) },
  { path: '/admin/case-studies/new', element: gated(<CaseStudyEditor />) },
  { path: '/admin/case-studies/:id/edit', element: gated(<CaseStudyEditor />) },
  { path: '/admin/careers/new', element: gated(<CareerEditor />) },
  { path: '/admin/careers/:id/edit', element: gated(<CareerEditor />) },
  {
    // Client portal — separate auth context; clients never reach the admin dashboard.
    path: '/portal/*',
    element: (
      <AuthProvider>
        <PortalApp />
      </AuthProvider>
    ),
  },
]

// Static, prerenderable marketing paths for the build-time sitemap. Dynamic content
// (/blog/:slug, /careers/:slug) is indexed from the database by the backend, not here.
export const staticPaths = [
  '/',
  '/services/functional-testing',
  '/services/automation-testing',
  '/services/performance-testing',
  '/services/security-testing-vapt',
  '/services/ai-powered-qa',
  '/services/mobile-app-testing',
  '/process',
  '/about',
  '/pricing',
  '/contact',
  '/careers',
  '/work',
  '/blog',
  '/privacy-policy',
  '/terms-and-conditions',
  '/login',
  '/admin',
  '/portal',
]

// Admin section routes are prerendered via ssgOptions.includedRoutes in vite.config.js
// (they match the `/admin/:section?` param route, which the SSG crawler does not
// auto-discover). Keeping the list there avoids importing this app module into the
// Vite config. The active section lives in the URL so refresh / direct access work.
export const ADMIN_SSG_PATHS = [
  '/admin',
  '/admin/dashboard',
  '/admin/blog',
  '/admin/case-studies',
  '/admin/careers',
  '/admin/contact',
  '/admin/media',
  '/admin/users',
  '/admin/roles',
  '/admin/audit',
  '/admin/settings',
]
