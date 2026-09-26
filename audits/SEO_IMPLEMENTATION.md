# Varsaka Technical SEO Implementation & Schema Standards

**Lead Auditor:** Technical SEO Lead  
**Document Purpose:** Implementation guide for JSON-LD Structured Data, Open Graph metadata, and indexing rules  
**Status:** PRODUCTION READY  

---

## 1. JSON-LD Structured Data Implementations

### 1.1 Organization Schema (`/` Homepage)
Inject the following JSON-LD script into the `<head>` of the root document:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Varsaka Labs",
  "url": "https://varsaka.com",
  "logo": "https://varsaka.com/logo.png",
  "description": "Enterprise software testing, functional quality assurance, automation, performance, security, and AI testing solutions.",
  "email": "info@varsaka.com",
  "sameAs": [
    "https://www.linkedin.com/company/varsaka",
    "https://twitter.com/varsaka"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@varsaka.com",
    "contactType": "customer support",
    "areaServed": "IN, US, GB, AE",
    "availableLanguage": ["English", "Hindi"]
  }
}
```

### 1.2 Professional Service Schema (`/services/*`)
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Software Quality Engineering & Testing Services",
  "provider": {
    "@type": "Organization",
    "name": "Varsaka Labs"
  },
  "url": "https://varsaka.com/services/automation-testing",
  "areaServed": "Global",
  "serviceType": "Automated Software Quality Assurance",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "Contact for custom enterprise quote"
  }
}
```

### 1.3 Article / Blog Schema (`/blog/:id`)
```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Modernizing Enterprise Regression Suites for 2026",
  "publisher": {
    "@type": "Organization",
    "name": "Varsaka Labs",
    "logo": "https://varsaka.com/logo.png"
  },
  "author": {
    "@type": "Organization",
    "name": "Varsaka Quality Engineering Editorial Team"
  },
  "datePublished": "2026-05-11",
  "dateModified": "2026-09-25",
  "mainEntityOfPage": "https://varsaka.com/blog/regression-suite-makeover"
}
```

---

## 2. Meta Tag Conventions & Open Graph Specs

For every dynamic page rendered via `react-helmet-async`:
```jsx
<Helmet>
  <title>{pageTitle} | Varsaka Labs</title>
  <meta name="description" content={pageDescription} />
  <link rel="canonical" href={`https://varsaka.com${location.pathname}`} />
  
  {/* Open Graph */}
  <meta property="og:site_name" content="Varsaka Labs" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:url" content={`https://varsaka.com${location.pathname}`} />
  <meta property="og:type" content={isArticle ? "article" : "website"} />
  <meta property="og:image" content="https://varsaka.com/og-image.png" />
  
  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />
  <meta name="twitter:image" content="https://varsaka.com/og-image.png" />
</Helmet>
```

---

## 3. Crawl Hygiene Rules
1. Never link to `localhost` in production build outputs.
2. Keep `sitemap.xml` synchronized with all public route changes.
3. Keep non-public endpoints (`/portal`, `/login`, `/verify/*`) out of sitemaps and blocked in `robots.txt`.
