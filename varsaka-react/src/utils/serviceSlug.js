// Deterministic, URL-safe slug generation for Services

export function generateServiceSlug(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Map of canonical aliases for existing core services
export const CANONICAL_SERVICE_SLUGS = {
  'functional testing': 'functional-testing',
  'automation testing': 'automation-testing',
  'automated testing': 'automation-testing',
  'performance testing': 'performance-testing',
  'security testing': 'security-testing',
  'ai-powered testing': 'ai-powered-testing',
  'ai powered testing': 'ai-powered-testing',
  'mobile testing': 'mobile-testing',
  'mobile app testing': 'mobile-testing'
};

export function resolveServiceSlug(service, allServices) {
  if (!service) return '';
  if (service.slug && typeof service.slug === 'string' && service.slug.trim()) {
    return generateServiceSlug(service.slug);
  }
  const normalizedName = (service.name || service.title || '').toLowerCase().trim();
  const baseSlug = CANONICAL_SERVICE_SLUGS[normalizedName] || generateServiceSlug(normalizedName);

  if (Array.isArray(allServices) && service.id) {
    const matching = allServices.filter(s => {
      const sNorm = (s.name || s.title || '').toLowerCase().trim();
      const sSlug = (s.slug && typeof s.slug === 'string' && s.slug.trim())
        ? generateServiceSlug(s.slug)
        : (CANONICAL_SERVICE_SLUGS[sNorm] || generateServiceSlug(sNorm));
      return sSlug === baseSlug;
    });
    if (matching.length > 1) {
      const idx = matching.findIndex(s => s.id === service.id);
      if (idx > 0) {
        return `${baseSlug}-${idx + 1}`;
      }
    }
  }

  return baseSlug;
}
