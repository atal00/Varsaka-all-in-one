// design.md §5/§6 — a small numeric label ("02") + uppercase caption substitutes for
// decorative icons next to section titles. `dark` swaps muted color for dark sections.
export default function SectionLabel({ number, children, dark = false }) {
  const muted = dark ? 'text-graphite-300' : 'text-graphite-500'
  return (
    <div className={`flex items-baseline gap-3 text-caption uppercase ${muted}`}>
      {number && <span className="tabular-nums">{number}</span>}
      <span>{children}</span>
    </div>
  )
}
