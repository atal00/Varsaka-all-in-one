import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  name = 'Varsaka Labs', 
  type = 'website',
  keywords = 'software testing company, quality assurance services, functional testing, automation testing, performance testing, security testing, AI testing, mobile app testing',
  image = 'https://varsaka.com/og-image.png', // Fallback image
  url,
  author,
  publishedTime,
  modifiedTime,
  children
}) {
  const siteTitle = `${title} | ${name}`;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://varsaka.com');

  // JSON-LD Schema for a Professional Software Testing Company
  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Varsaka Labs",
    "alternateName": "Varsaka Labs QA",
    "url": "https://varsaka.com",
    "logo": "https://varsaka.com/logo.png",
    "image": image,
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "HITEC City",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500081",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 17.4483,
      "longitude": 78.3915
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Software Testing Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Functional Testing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Automation Testing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Performance Testing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Security Testing" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI-Powered Testing" } }
      ]
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://www.linkedin.com/company/varsaka-labs",
      "https://twitter.com/varsakalabs"
    ],
    "telephone": "+917396106271",
    "priceRange": "$$"
  };

  const articleJSONLD = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image,
    "datePublished": publishedTime || new Date().toISOString(),
    "dateModified": modifiedTime || publishedTime || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": author || "Varsaka Labs Engineering Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Varsaka Labs",
      "logo": {
        "@type": "ImageObject",
        "url": "https://varsaka.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    }
  } : null;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={name} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@varsakalabs" />
      <meta name="twitter:creator" content="@varsakalabs" />

      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(articleJSONLD || schemaOrgJSONLD)}
      </script>

      {children}
    </Helmet>
  );
}
