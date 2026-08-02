// Deterministic node-grid generator for the hero "Quality Gate" (animation.md §2.1).
// MUST be deterministic (seeded, no Math.random) so the SSG-prerendered SVG matches the
// client render exactly — otherwise React hydration mismatches on the hero.
//
// Organic (not rigid-grid) scatter: jittered grid cells. Each node links to its nearest
// 1–2 neighbours (cheap SVG, animation.md §2.3 node-count budget: ≤180 desktop / ≤70 mobile).

// mulberry32 — tiny seeded PRNG.
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const VIEWBOX = { w: 1200, h: 760 }

// Build a jittered grid scatter sized to roughly `target` nodes.
export function generateNodeGrid({ target = 140, seed = 20260618 } = {}) {
  const rng = mulberry32(seed)
  const aspect = VIEWBOX.w / VIEWBOX.h
  const rows = Math.max(4, Math.round(Math.sqrt(target / aspect)))
  const cols = Math.max(4, Math.round(target / rows))
  const cellW = VIEWBOX.w / cols
  const cellH = VIEWBOX.h / rows

  const nodes = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (rng() - 0.5) * cellW * 0.7
      const jy = (rng() - 0.5) * cellH * 0.7
      const x = +(cellW * (c + 0.5) + jx).toFixed(2)
      const y = +(cellH * (r + 0.5) + jy).toFixed(2)
      // ~8% of nodes are the "last edge cases" — flipped in a late cluster (§2.2 0.7–0.85)
      const lateEdge = rng() < 0.08
      nodes.push({ id: nodes.length, x, y, lateEdge })
    }
  }

  // Connect each node to up to 2 nearest neighbours within a radius (dedup pairs).
  const maxDist = Math.hypot(cellW, cellH) * 1.6
  const seen = new Set()
  const links = []
  for (let i = 0; i < nodes.length; i++) {
    const dists = []
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
      if (d <= maxDist) dists.push([d, j])
    }
    dists.sort((a, b) => a[0] - b[0])
    for (let k = 0; k < Math.min(2, dists.length); k++) {
      const j = dists[k][1]
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push({ a: i, b: j })
    }
  }

  return { nodes, links, viewBox: VIEWBOX }
}
