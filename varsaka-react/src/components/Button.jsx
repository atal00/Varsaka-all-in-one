import { Link } from 'react-router-dom'

// design.md §8. Primary CTA: signal-500, sharp 4px radius (institutional, not pill), no
// glow/pulse. Hover DARKENS to signal-700 (not the spec's signal-300) so white label stays
// ≥ WCAG AA — documented accessibility override of design.md §8. Renders <Link> when `to` set.
export function PrimaryCTA({ to, href, children, className = '', ...rest }) {
  const cls =
    'inline-block rounded-cta bg-signal-500 px-7 py-3.5 font-sans text-[15px] font-semibold ' +
    'tracking-[0.01em] text-paper-0 transition-colors duration-[160ms] ease-calm ' +
    'hover:bg-signal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    'focus-visible:outline-signal-500 ' +
    className
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  return <a href={href} className={cls} {...rest}>{children}</a>
}

// design.md §8 secondary CTA: text link, 1px underline draws in from left on hover,
// arrow (plain → char) slides 4px right. `dark` swaps color for dark sections.
export function ArrowLink({ to, href, children, dark = false, className = '' }) {
  const color = dark ? 'text-paper-0' : 'text-ink-900'
  const inner = (
    <span className={`group inline-flex items-center gap-2 font-sans text-[15px] font-semibold ${color} ${className}`}>
      <span className="relative">
        {children}
        <span
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-200 ease-calm group-hover:scale-x-100"
          aria-hidden="true"
        />
      </span>
      <span className="transition-transform duration-200 ease-calm group-hover:translate-x-1" aria-hidden="true">→</span>
    </span>
  )
  if (to) return <Link to={to}>{inner}</Link>
  return <a href={href}>{inner}</a>
}
