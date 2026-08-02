// Reusable FAQ accordion (design.md §11.8, animation.md §5). Native <details> for zero-JS
// accessibility + prerender; plus/minus glyph rotates 45° on open. Shared by the homepage
// FAQ section and each service page.
export default function FaqList({ faqs }) {
  return (
    <div className="border-t border-hairline">
      {faqs.map((item) => (
        <details key={item.q} className="group border-b border-hairline py-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
            <span className="text-h3">{item.q}</span>
            <span
              className="relative h-4 w-4 shrink-0 text-graphite-500 transition-transform duration-200 ease-calm group-open:rotate-45"
              aria-hidden="true"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
              <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-current" />
            </span>
          </summary>
          <p className="mt-4 max-w-2xl text-body text-graphite-500">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
