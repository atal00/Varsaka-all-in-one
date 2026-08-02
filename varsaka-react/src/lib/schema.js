// JSON-LD schema builders (seo.md §3.3). Plain functions so any page can compose the
// blocks it needs and pass them to <Seo jsonLd={...} />. Brand constants come from
// src/lib/seo.js (single source of truth). NOTE: Review/AggregateRating is intentionally
// NOT provided — seo.md §3.3 forbids fabricated ratings (spam-policy risk).

import { SITE_URL, SITE_NAME, LEGAL_NAME, DEFAULT_OG_IMAGE, SAME_AS, CONTACT_EMAIL, FOUNDING_YEAR, SITE_TAGLINE, ENTITY } from './seo.js'

const abs = (u) => (!u ? DEFAULT_OG_IMAGE : u.startsWith('http') ? u : SITE_URL + u)

// Organization is modelled as a ProfessionalService so the entity, its services and the
// audience it serves are unambiguous to search engines and LLMs. Defines the canonical
// "who/what/who-for/why" once; everything else references it by @id.
export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: LEGAL_NAME,
  alternateName: LEGAL_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  image: DEFAULT_OG_IMAGE,
  slogan: SITE_TAGLINE,
  foundingDate: String(FOUNDING_YEAR),
  description: ENTITY.description,
  areaServed: ['India', 'Nepal', 'Worldwide'],
  knowsAbout: [
    'Quality Engineering', 'Software Testing', 'Test Automation', 'Selenium', 'Playwright',
    'Cypress', 'Performance Testing', 'Security Testing', 'VAPT', 'Quality Assurance',
    'QA Consulting', 'QA Strategy', 'Software Reliability', 'Release Confidence',
  ],
  serviceType: ENTITY.services,
  audience: ENTITY.audience.map((name) => ({ '@type': 'Audience', audienceType: name })),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: CONTACT_EMAIL,
    availableLanguage: ['English'],
  },
  sameAs: SAME_AS,
})

// WebPage node — ties an individual page to the site/organization and (optionally) its
// breadcrumb trail. Lightweight; pass the primary content type where useful.
export const webPageSchema = ({ title, description, path = '/', type = 'WebPage', primaryImage }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  '@id': `${SITE_URL}${path}#webpage`,
  url: SITE_URL + path,
  name: title,
  description,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en',
  ...(primaryImage ? { primaryImageOfPage: abs(primaryImage) } : {}),
})

// WebSite node — helps search engines understand the site as a whole. No SearchAction
// (the site has no on-site search endpoint, so we don't claim one).
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en',
})

export const serviceSchema = (svc) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: svc.name,
  name: svc.title,
  description: svc.metaDescription,
  provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  areaServed: ['India', 'Nepal', 'Worldwide'],
  url: `${SITE_URL}/services/${svc.slug}`,
})

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: SITE_URL + it.path,
  })),
})

export const articleSchema = ({ title, description, slug, date, modified, image, author, authorRole }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  image: abs(image),
  datePublished: date || undefined,
  dateModified: modified || date || undefined,
  author: author
    ? { '@type': 'Person', name: author, ...(authorRole ? { jobTitle: authorRole } : {}), worksFor: { '@id': `${SITE_URL}/#organization` } }
    : { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}/#organization` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  isPartOf: { '@id': `${SITE_URL}/#website` },
  mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
})

// JobPosting — for careers detail pages. employmentType/location are derived from the
// job document; we only emit fields we actually have.
export const jobPostingSchema = ({ title, description, slug, datePosted, employmentType, location, department }) => {
  const map = { 'Full-time': 'FULL_TIME', 'Part-time': 'PART_TIME', 'Contract': 'CONTRACTOR', 'Internship': 'INTERN' }
  const remote = /remote/i.test(location || '')
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description: description || title,
    datePosted: datePosted || undefined,
    employmentType: map[employmentType] || undefined,
    occupationalCategory: department || undefined,
    hiringOrganization: { '@type': 'Organization', name: SITE_NAME, sameAs: SITE_URL, logo: DEFAULT_OG_IMAGE },
    jobLocationType: remote ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements: remote ? { '@type': 'Country', name: 'Worldwide' } : undefined,
    ...(location && !remote
      ? { jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: location } } }
      : {}),
    url: `${SITE_URL}/careers/${slug}`,
  }
}

// Case study — modelled as an Article/CreativeWork about a client engagement.
export const caseStudySchema = ({ title, description, slug, sector, image, date, modified }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  image: abs(image),
  about: sector || undefined,
  datePublished: date || undefined,
  dateModified: modified || date || undefined,
  author: { '@type': 'Organization', name: SITE_NAME },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE },
  },
  mainEntityOfPage: `${SITE_URL}/work/${slug}`,
})

export const faqPageSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
})
