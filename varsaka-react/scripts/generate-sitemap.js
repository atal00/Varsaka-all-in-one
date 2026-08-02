// Build-time sitemap.xml generator. Runs after `vite-react-ssg build` and writes
// dist/sitemap.xml. Static marketing routes are always included; dynamic content
// (published blog posts, jobs and case studies) is pulled live from the API so the
// sitemap reflects the real database — no manual lists, no stale filesystem reads.
// If the API is unreachable at build time, we still emit a valid static sitemap.
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://varsaka.com'
const API = (process.env.VITE_API_BASE || 'https://api.varsaka.com').replace(/\/$/, '')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Static routes with a priority/changefreq hint. (Admin + portal are intentionally absent.)
const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/services/functional-testing', changefreq: 'monthly', priority: '0.9' },
  { path: '/services/automation-testing', changefreq: 'monthly', priority: '0.9' },
  { path: '/services/performance-testing', changefreq: 'monthly', priority: '0.9' },
  { path: '/services/security-testing-vapt', changefreq: 'monthly', priority: '0.9' },
  { path: '/services/ai-powered-qa', changefreq: 'monthly', priority: '0.9' },
  { path: '/services/mobile-app-testing', changefreq: 'monthly', priority: '0.9' },
  { path: '/process', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
  { path: '/work', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/careers', changefreq: 'weekly', priority: '0.7' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' },
]

async function fetchItems(path) {
  try {
    const res = await fetch(`${API}${path}`, { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : (data.items || [])
  } catch (err) {
    console.warn(`  [sitemap] could not fetch ${path} (${err.message}) — skipping those URLs`)
    return []
  }
}

const iso = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null)

async function main() {
  const dynamic = []

  const blogs = await fetchItems('/blogs?status=published&limit=1000')
  for (const b of blogs) {
    if (!b.slug) continue
    dynamic.push({ path: `/blog/${b.slug}`, changefreq: 'monthly', priority: '0.7', lastmod: iso(b.updatedAt || b.publishAt) })
  }

  const cases = await fetchItems('/case-studies?status=published&limit=1000')
  for (const c of cases) {
    if (!c.slug) continue
    dynamic.push({ path: `/work/${c.slug}`, changefreq: 'monthly', priority: '0.7', lastmod: iso(c.updatedAt) })
  }

  const jobs = await fetchItems('/jobs?status=published&limit=1000')
  for (const j of jobs) {
    if (!j.slug) continue
    dynamic.push({ path: `/careers/${j.slug}`, changefreq: 'weekly', priority: '0.6', lastmod: iso(j.updatedAt || j.postedAt) })
  }

  const all = [...staticRoutes, ...dynamic]
  const urls = all
    .map(({ path, changefreq, priority, lastmod }) => {
      const parts = [`    <loc>${SITE}${path}</loc>`]
      if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`)
      parts.push(`    <changefreq>${changefreq}</changefreq>`)
      parts.push(`    <priority>${priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  writeFileSync(resolve(root, 'dist', 'sitemap.xml'), xml)
  console.log(`sitemap.xml written — ${staticRoutes.length} static + ${dynamic.length} dynamic = ${all.length} URLs`)
}

main().catch((err) => {
  console.error('  [sitemap] generation failed:', err.message)
  process.exit(1)
})
