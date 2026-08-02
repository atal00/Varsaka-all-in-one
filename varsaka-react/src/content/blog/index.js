// Blog manifest — eager-glob all MDX posts so frontmatter + content component are available
// synchronously for the index list and for per-post routes (SSG needs concrete paths).
// Post count is small; eager import is acceptable.
const mods = import.meta.glob('./*.mdx', { eager: true })

export const posts = Object.entries(mods)
  .map(([path, mod]) => ({
    slug: path.split('/').pop().replace('.mdx', ''),
    frontmatter: mod.frontmatter,
    Content: mod.default,
  }))
  .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1))

export const postBySlug = Object.fromEntries(posts.map((p) => [p.slug, p]))
