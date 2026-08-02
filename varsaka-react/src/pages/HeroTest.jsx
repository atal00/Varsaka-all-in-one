import Seo from '../components/Seo.jsx'
import HomeHero from '../sections/HomeHero.jsx'

// Internal isolation route for iterating hero scroll-scrub timing (workflow.md P1 S3).
// Unlinked, noindex. Extra scroll space below so the pin/scrub can be exercised alone.
export function Component() {
  return (
    <>
      <Seo title="Hero test (internal)" description="Isolated hero animation harness." path="/dev/hero-test" noindex />
      <HomeHero />
      <div className="container-edge py-section">
        <p className="text-graphite-500">Scroll target — isolated hero harness.</p>
      </div>
    </>
  )
}
