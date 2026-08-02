import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import SectionLabel from '../components/SectionLabel.jsx'
import ServiceMotif from '../components/ServiceMotif.jsx'
import FaqList from '../components/FaqList.jsx'
import Reveal from '../components/Reveal.jsx'
import { PrimaryCTA, ArrowLink } from '../components/Button.jsx'
import { services } from '../content/services.js'
import { serviceSchema, breadcrumbSchema, faqPageSchema, webPageSchema, organizationSchema } from '../lib/schema.js'

// Single service-page template (tech_stack.md §6, workflow.md P2 S1). Lighter than the
// homepage: a mini hero (no full scroll-pin), what-we-test, tools, engagement + deliverable,
// related services (internal linking, seo.md §3.5), service FAQ, CTA. Schema: Service +
// BreadcrumbList + FAQPage (seo.md §3.3); Organization comes from Layout.
export default function ServicePage({ data }) {
  const jsonLd = [
    organizationSchema(),
    webPageSchema({ title: data.title, description: data.metaDescription, path: `/services/${data.slug}` }),
    serviceSchema(data),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/#services' },
      { name: data.name, path: `/services/${data.slug}` },
    ]),
    faqPageSchema(data.faqs),
  ]
  const related = data.related.map((k) => services[k])

  return (
    <>
      <Seo title={data.title} description={data.metaDescription} path={`/services/${data.slug}`} jsonLd={jsonLd} />

      {/* Mini hero (dark, lighter than homepage) */}
      <section className="bg-ink-900 text-paper-0">
        <div className="container-edge py-section-mobile md:py-section">
          <nav aria-label="Breadcrumb" className="text-caption uppercase text-graphite-300">
            <Link to="/" className="hover:text-paper-0">Home</Link>
            <span className="px-2">/</span>
            <a href="/#services" className="hover:text-paper-0">Services</a>
          </nav>
          <div className="mt-8 flex items-start gap-6">
            <div className="text-signal-300"><ServiceMotif name={Object.keys(services).find((k) => services[k] === data)} className="hidden h-14 w-14 shrink-0 sm:block" /></div>
            <div>
              <p className="text-caption uppercase text-graphite-300">{data.primaryKeyword}</p>
              <h1 className="mt-3 max-w-[18ch] font-display text-h1">{data.name}</h1>
            </div>
          </div>
          <p className="mt-7 max-w-2xl text-body-lg text-graphite-300">{data.lead}</p>
          <div className="mt-9"><PrimaryCTA to="/contact">Book a Free QA Audit</PrimaryCTA></div>
        </div>
      </section>

      {/* What we test */}
      <section className="bg-paper-0 text-ink-900">
        <div className="container-edge py-section-mobile md:py-section">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4"><SectionLabel number="01">What we test</SectionLabel></div>
            <ul className="md:col-span-8">
              {data.whatWeTest.map((item) => (
                <li key={item} className="border-b border-hairline py-5 text-body-lg first:border-t">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tools + engagement + deliverable */}
      <section className="bg-paper-100 text-ink-900">
        <div className="container-edge py-section-mobile md:py-section">
          <div className="grid gap-12 md:grid-cols-3">
            <Reveal>
              <SectionLabel number="02">Tools we use</SectionLabel>
              <ul className="mt-5 flex flex-wrap gap-2">
                {data.tools.map((t) => (
                  <li key={t} className="border border-hairline px-3 py-1.5 text-body text-graphite-500">{t}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={80}>
              <SectionLabel number="03">Typical engagement</SectionLabel>
              <p className="mt-5 text-body text-graphite-500">{data.engagement}</p>
            </Reveal>
            <Reveal delay={160}>
              <SectionLabel number="04">What you get</SectionLabel>
              <p className="mt-5 text-body text-graphite-500">{data.deliverable}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Related services (internal linking) */}
      <section className="bg-paper-0 text-ink-900">
        <div className="container-edge py-section-mobile md:py-section">
          <SectionLabel number="05">Related services</SectionLabel>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} to={`/services/${r.slug}`} className="group flex items-center justify-between border border-hairline p-6 transition-colors hover:border-signal-500">
                <span>
                  <span className="text-h3">{r.name}</span>
                  <span className="mt-1 block text-body text-graphite-500">{r.outcome}</span>
                </span>
                <span className="text-signal-500 transition-transform duration-200 ease-calm group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-body">
            <ArrowLink to="/pricing">See pricing</ArrowLink>
            <ArrowLink to="/process">How we work</ArrowLink>
          </div>
        </div>
      </section>

      {/* Service FAQ */}
      <section className="bg-paper-0 text-ink-900">
        <div className="container-edge pb-section-mobile md:pb-section">
          <SectionLabel number="06">Questions</SectionLabel>
          <h2 className="mt-4 font-display text-h2">{data.name} — FAQ</h2>
          <div className="mt-10"><FaqList faqs={data.faqs} /></div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-900 text-paper-0">
        <div className="container-edge py-section-mobile text-center md:py-section">
          <h2 className="mx-auto max-w-[20ch] font-display text-h2">{data.outcome}</h2>
          <p className="mx-auto mt-6 max-w-xl text-body-lg text-graphite-300">
            Book a free 30-minute audit and we’ll show you where the risk is in your current setup.
          </p>
          <div className="mt-9"><PrimaryCTA to="/contact">Book a Free QA Audit</PrimaryCTA></div>
        </div>
      </section>
    </>
  )
}
