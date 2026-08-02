import LegalPage from '../components/LegalPage.jsx'
import { CONTACT_EMAIL, SITE_URL, SITE_NAME, LEGAL_NAME } from '../lib/seo.js'
import { webPageSchema } from '../lib/schema.js'

const LAST_UPDATED = 'June 22, 2026'
const email = <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>{CONTACT_EMAIL}</a>

const SECTIONS = [
  {
    id: 'acceptance',
    heading: 'Acceptance of Terms',
    blocks: [
      { p: `These Terms & Conditions ("Terms") govern your access to and use of the ${SITE_NAME} website at ${SITE_URL} and any services provided by ${LEGAL_NAME} ("Varsaka", "we", "us" or "our").` },
      { p: 'By accessing our website, submitting an inquiry, or engaging us for services, you confirm that you have read, understood and agree to be bound by these Terms. If you are entering into these Terms on behalf of a company or other entity, you represent that you have the authority to bind that entity. If you do not agree, please do not use our website or services.' },
    ],
  },
  {
    id: 'services',
    heading: 'Services Overview',
    blocks: [
      { p: 'Varsaka provides quality engineering and software testing services, including functional and exploratory testing, test automation, performance testing, security testing and VAPT, AI-powered QA, mobile application testing, and quality engineering consulting.' },
      { p: 'The specific scope, deliverables, timelines and fees for any engagement are defined in a separate written agreement, statement of work or proposal ("Engagement Agreement"). Where an Engagement Agreement conflicts with these Terms, the Engagement Agreement governs for that engagement. Information on this website is provided for general guidance and does not constitute a binding offer.' },
    ],
  },
  {
    id: 'user-responsibilities',
    heading: 'User Responsibilities',
    blocks: [
      { p: 'When using our website or working with us, you agree to:' },
      { list: [
        'Provide accurate, current and complete information when you contact us or engage our services.',
        'Use the website lawfully and refrain from attempting to disrupt, probe, scan, or gain unauthorised access to our systems or those of others.',
        'Not submit content that is unlawful, infringing, malicious, or that contains malware or harmful code.',
        'For engagements, ensure you have the right to grant us access to any systems, data, environments or materials you provide, and obtain any necessary consents.',
      ] },
      { p: 'You are responsible for maintaining the confidentiality of any credentials shared with you and for all activity that occurs under your access.' },
    ],
  },
  {
    id: 'intellectual-property',
    heading: 'Intellectual Property',
    blocks: [
      { p: `All content on this website — including text, graphics, logos, the ${SITE_NAME} name and brand, design, and code — is owned by or licensed to ${LEGAL_NAME} and is protected by intellectual property laws. You may not copy, reproduce, distribute or create derivative works from it without our prior written permission.` },
      { p: 'For client engagements, ownership of deliverables, test assets and pre-existing materials is set out in the relevant Engagement Agreement. Unless agreed otherwise in writing, we retain ownership of our pre-existing tools, methodologies, frameworks and general know-how, and you retain ownership of your systems and data.' },
    ],
  },
  {
    id: 'limitation-of-liability',
    heading: 'Limitation of Liability',
    blocks: [
      { p: 'Our website and any general information on it are provided "as is" and "as available" without warranties of any kind, whether express or implied, to the fullest extent permitted by law.' },
      { p: 'To the maximum extent permitted by applicable law, Varsaka will not be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, revenue, data or goodwill, arising out of or related to your use of the website. Liability arising from a paid engagement is governed by, and limited as set out in, the applicable Engagement Agreement.' },
      { p: 'Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, such as liability for fraud or for death or personal injury caused by negligence.' },
    ],
  },
  {
    id: 'payments',
    heading: 'Payments',
    blocks: [
      { p: 'Fees, payment schedules, currencies and invoicing terms for services are specified in the applicable Engagement Agreement. Unless stated otherwise, invoices are payable within the period set out in that agreement.' },
      { list: [
        'Engagements may be priced as fixed-price cycles, monthly retainers, or time and materials, as agreed in writing.',
        'Fees are exclusive of applicable taxes unless stated otherwise.',
        'Late or unpaid invoices may result in suspension of services and, where applicable, interest or recovery costs as permitted by law.',
      ] },
      { p: 'No fees are charged for browsing this website or for an initial discovery conversation.' },
    ],
  },
  {
    id: 'third-party-services',
    heading: 'Third-Party Services',
    blocks: [
      { p: 'Our website and services may reference, integrate with, or link to third-party tools, platforms and websites (for example, automation frameworks, cloud providers, or our social profiles). We do not control and are not responsible for the content, policies or practices of third parties.' },
      { p: 'Your use of any third-party service is governed by that provider’s own terms and policies. Where a client engagement requires third-party tools or licences, responsibility for those licences is allocated in the relevant Engagement Agreement.' },
    ],
  },
  {
    id: 'termination',
    heading: 'Termination',
    blocks: [
      { p: 'We may suspend or restrict access to our website at any time if we reasonably believe these Terms have been breached or to protect the integrity and security of our systems.' },
      { p: 'Termination of a paid engagement — including notice periods, wind-down and payment for work performed — is governed by the applicable Engagement Agreement. Provisions that by their nature should survive termination, such as intellectual property, confidentiality and limitation of liability, will continue to apply.' },
    ],
  },
  {
    id: 'governing-law',
    heading: 'Governing Law',
    blocks: [
      { p: `These Terms are governed by and construed in accordance with the laws of the jurisdiction in which ${LEGAL_NAME} is established, without regard to conflict-of-law principles.` },
      { p: 'Any dispute arising out of or in connection with these Terms that cannot be resolved amicably will be subject to the exclusive jurisdiction of the competent courts of that jurisdiction. Where a separate Engagement Agreement specifies a governing law or dispute-resolution mechanism, that agreement controls for the relevant engagement.' },
    ],
  },
  {
    id: 'contact',
    heading: 'Contact Information',
    blocks: [
      { p: 'If you have any questions about these Terms, please get in touch — we are glad to clarify anything before you engage us.' },
      { p: <>Email: {email}</> },
      { p: <>You can also reach the team through our <a href="/contact" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>contact page</a>.</> },
    ],
  },
]

export function Component() {
  return (
    <LegalPage
      path="/terms-and-conditions"
      title="Terms & Conditions"
      lastUpdated={LAST_UPDATED}
      intro="These terms govern your use of the Varsaka website and the services we provide. Please read them carefully."
      sections={SECTIONS}
      jsonLd={webPageSchema({ title: 'Terms & Conditions', description: 'The terms governing use of the Varsaka website and services.', path: '/terms-and-conditions' })}
    />
  )
}

export default Component
