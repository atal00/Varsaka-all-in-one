// Per-service abstract line motifs (animation.md §3). design.md §6 permits custom-drawn,
// single-weight (1.5px stroke), monochrome line icons where a marker is functionally
// necessary — never filled, never multi-color, never in a circle background. "Technical
// drawing," not "app icon." All inherit currentColor.
const common = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const paths = {
  // functional — a branch resolving to a verified tick
  functional: <><path d="M10 32h14l6-8" /><path d="M30 40h10" /><path d="M44 24l6 6-6 6" /><path d="M24 32l5 6 11-14" /></>,
  // automation — infinity loop (continuous single stroke)
  automation: <path d="M22 32c0-6-12-6-12 0s12 6 12 0 12-6 18-6 6 12 0 12-12-6-12-6" />,
  // performance — line-graph trace trending up
  performance: <><path d="M10 46l12-10 8 6 12-18 12 8" /><path d="M10 52h44" /></>,
  // security — shield outline (stroke only)
  security: <path d="M32 10l16 6v12c0 11-8 18-16 22-8-4-16-11-16-22V16z" />,
  // ai-powered — central node with orbiting self-healing arc
  aiQa: <><circle cx="32" cy="32" r="6" /><path d="M32 14a18 18 0 0 1 16 26" /><path d="M44 38l4 2 2-4" /><path d="M32 50a18 18 0 0 1-16-26" /><path d="M20 26l-4-2-2 4" /></>,
  // mobile — device outline
  mobile: <><rect x="22" y="12" width="20" height="40" rx="3" /><path d="M29 16h6" /></>,
}

export default function ServiceMotif({ name, className = '' }) {
  return (
    <svg {...common} className={className} aria-hidden="true" focusable="false">
      {paths[name] ?? null}
    </svg>
  )
}
