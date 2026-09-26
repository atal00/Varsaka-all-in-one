import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Privacy Policy & DPDP Act Compliance | Varsaka Labs</title>
        <meta 
          name="description" 
          content="Privacy Policy and compliance details under the Digital Personal Data Protection Act, 2023 (DPDP Act) for Varsaka Labs." 
        />
      </Helmet>

      <div className="prose-block">
        <div className="section-tag">⚖️ Legal & Compliance</div>
        <h1>Privacy Policy</h1>
        <p className="meta">
          Effective Date: September 2026 | Compliant with India's Digital Personal Data Protection Act, 2023 (DPDP Act)
        </p>

        <section>
          <h2>1. Introduction & Scope</h2>
          <p>
            Varsaka Labs ("Varsaka", "we", "our", or "us") is dedicated to safeguarding the privacy and personal data of our website visitors, clients, applicants, and partners. This Privacy Policy sets out how we collect, process, store, and protect digital personal data in strict compliance with India's <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and applicable global data protection principles.
          </p>
          <p>
            For the purposes of the DPDP Act, 2023, Varsaka Labs operates as a <strong>Data Fiduciary</strong> responsible for determining the purpose and means of processing personal data provided to us.
          </p>
        </section>

        <section>
          <h2>2. Clear, Affirmative Consent (Section 6, DPDP Act)</h2>
          <p>
            We process your personal data only on the basis of <strong>free, specific, informed, unconditional, and unambiguous consent with a clear affirmative action</strong>. 
          </p>
          <p>
            Whenever you submit information through our website (including contact inquiries, project requests, job or internship applications, and chatbot consultations), you are presented with an <strong>un-ticked affirmative consent checkbox</strong> with a direct link to this Privacy Policy. No consent is ever bundled, pre-checked, or assumed.
          </p>
        </section>

        <section>
          <h2>3. Personal Data We Collect</h2>
          <p>We only collect personal data that is strictly necessary for fulfilling specified, lawful purposes:</p>
          <ul>
            <li><strong>Contact & Inquiry Data:</strong> Full name, professional email address, phone number, company name, service interests, and inquiry messages submitted through our contact and consultation forms.</li>
            <li><strong>Careers & Internship Data:</strong> Full name, email address, phone number, resume/curriculum vitae (CV), educational qualifications, university name, graduation year, portfolio links (GitHub, LinkedIn), and skill proficiencies submitted via our application portals.</li>
            <li><strong>Technical & Essential Session Data:</strong> Minimal technical information such as anonymized IP addresses, browser types, and essential session identifiers required to maintain website security, prevent spam, and enforce rate limits.</li>
          </ul>
        </section>

        <section>
          <h2>4. Lawful Purpose for Processing</h2>
          <p>Your personal data is collected and processed exclusively for the following specified purposes:</p>
          <ul>
            <li>Responding to your project inquiries, providing service quotations, and delivering Quality Engineering and Software Testing services.</li>
            <li>Evaluating internship and job applications, conducting candidate evaluations, and issuing verifiable training/internship certificates.</li>
            <li>Protecting the security and integrity of our systems against bots, fraud, unauthorized access, and malicious activities.</li>
            <li>Complying with statutory, regulatory, and legal obligations under Indian law.</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Rights as a Data Principal (DPDP Act, 2023)</h2>
          <p>
            Under Chapter III of the Digital Personal Data Protection Act, 2023, you (the "Data Principal") are entitled to exercise the following statutory rights:
          </p>
          <ul>
            <li><strong>Right to Access Information (Section 11):</strong> You may request a summary of the personal data being processed about you, the processing activities carried out, and the identities of any Data Processors with whom it has been shared.</li>
            <li><strong>Right to Correction & Erasure (Section 12):</strong> You have the right to request correction of inaccurate data, completion of incomplete data, updating of outdated data, and erasure of personal data that is no longer necessary for the purpose for which it was collected.</li>
            <li><strong>Right of Grievance Redressal (Section 13):</strong> You have the right to register a grievance with our designated Grievance Redressal Officer regarding any matter relating to your personal data.</li>
            <li><strong>Right to Nominate (Section 14):</strong> You have the right to nominate another individual who may exercise your data principal rights in the event of death or incapacity.</li>
          </ul>
        </section>

        <section>
          <h2>6. Right to Withdraw Consent (Section 6(4), DPDP Act)</h2>
          <p>
            You have the right to withdraw your consent at any time, as easily as it was given. Upon receipt of your withdrawal request, we will cease processing your personal data within a reasonable timeframe, unless continued processing is required or authorized under Indian law.
          </p>
          <p>
            To withdraw your consent, simply send an email with the subject line <em>"Withdrawal of Consent - DPDP Act"</em> to <a href="mailto:info@varsaka.com">info@varsaka.com</a>.
          </p>
        </section>

        <section>
          <h2>7. Data Retention & Erasure</h2>
          <p>
            We retain your personal data only for as long as is necessary to satisfy the purpose for which it was collected or to comply with statutory legal requirements. Once the purpose is fulfilled and retention periods expire, your data is securely deleted or rendered irreversibly anonymized.
          </p>
        </section>

        <section>
          <h2>8. Data Security Measures</h2>
          <p>
            We implement stringent technical and organizational security measures to protect personal data against accidental loss, unauthorized access, alteration, or disclosure. All data transmissions occur over encrypted HTTPS channels (TLS 1.3), with role-based access controls, database row-level security (RLS), and rate limiting.
          </p>
        </section>

        <section>
          <h2>9. Grievance Redressal Officer & Contact Details</h2>
          <p>
            In compliance with Section 8(9) and Section 13 of the Digital Personal Data Protection Act, 2023, Varsaka Labs has appointed a designated Grievance Redressal Officer. If you have any inquiries, requests to exercise your Data Principal rights, or grievances regarding your personal data, please contact:
          </p>
          <div style={{ background: 'var(--bg-light, #f8fafc)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '12px', padding: '20px 24px', margin: '20px 0' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--text)' }}>Data Protection & Grievance Redressal Officer</p>
            <p style={{ margin: '0 0 6px' }}><strong>Organization:</strong> Varsaka Labs</p>
            <p style={{ margin: '0 0 6px' }}><strong>Email:</strong> <a href="mailto:info@varsaka.com">info@varsaka.com</a></p>
            <p style={{ margin: '0 0 6px' }}><strong>Location:</strong> Gachibowli, Hyderabad, Telangana 500032, India</p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Response Time: Inquiries are acknowledged within 48 hours and resolved within 30 days as prescribed by law.</p>
          </div>
        </section>

        <section>
          <h2>10. Related Policies & Governance</h2>
          <p>
            This Privacy Policy operates in conjunction with our broader compliance framework. Please also review our{' '}
            <Link to="/cookies-policy">Cookies Policy</Link>, <Link to="/terms-of-service">Terms of Service</Link>, and{' '}
            <Link to="/refund-policy">Refund & Cancellation Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
