import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function CookiesPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Cookies Policy | Varsaka Labs</title>
        <meta 
          name="description" 
          content="Learn how Varsaka Labs uses cookies and similar technologies, your choices under the DPDP Act 2023, and how to manage cookie preferences." 
        />
      </Helmet>

      <div className="prose-block">
        <div className="section-tag">🍪 Transparency & Data Control</div>
        <h1>Cookies Policy</h1>
        <p className="meta">
          Effective Date: September 2026 | Compliant with DPDP Act, 2023 & Information Technology (Reasonable Security Practices) Rules, 2011
        </p>

        <section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your computer, tablet, or mobile device by websites that you visit. They are widely used across the internet to ensure websites function securely and efficiently, remember your preferences across sessions, and provide anonymized aggregate operational metrics.
          </p>
          <p>
            This Cookies Policy explains how <strong>Varsaka Labs</strong> ("Varsaka", "we", "our", or "us") utilizes cookies, local storage, and similar digital identifiers on <a href="https://varsaka.com">varsaka.com</a>, and outlines your rights to manage or decline them.
          </p>
        </section>

        <section>
          <h2>2. Our Approach to Cookies & Consent</h2>
          <p>
            In strict adherence to India's <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and global privacy standards, Varsaka Labs does not track your digital activity across third-party websites or deploy covert fingerprinting mechanisms.
          </p>
          <p>
            When you first access our website, you are presented with our transparent cookie and data protection banner. You maintain full autonomy to accept all cookies or restrict usage strictly to <strong>Essential / Strictly Necessary Cookies</strong> required for website operation.
          </p>
        </section>

        <section>
          <h2>3. Categories of Cookies We Use</h2>
          <p>We classify the cookies and browser storage technologies utilized on our website into three distinct categories:</p>
          <ul>
            <li>
              <strong>1. Strictly Necessary & Security Cookies (Essential):</strong> These cookies and local storage tokens are essential to enable core site functionality, maintain navigation state, protect against Cross-Site Request Forgery (CSRF) and bot attacks, and record your privacy preferences. These cookies cannot be turned off in our systems as the website cannot operate properly without them.
            </li>
            <li>
              <strong>2. Functional & Preference Cookies:</strong> These allow our website to remember choices you make (such as dark mode versus light mode theme preferences, selected language, or form field persistence) to deliver a personalized, seamless experience.
            </li>
            <li>
              <strong>3. Performance & Diagnostic Telemetry (Aggregated):</strong> When enabled with your affirmative consent, these minimal cookies collect anonymized performance telemetry (such as page load speeds, resource latency, and aggregated visitor counts) to help us troubleshoot technical bottlenecks. No personal identity or individual browsing history is ever captured or linked.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Cookies Table & Retention Schedule</h2>
          <p>The following table summarizes the cookies and local storage keys deployed by our platform:</p>
          <div style={{ overflowX: 'auto', margin: '14px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-light, #f1f5f9)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', color: 'var(--text)' }}>Identifier / Key</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text)' }}>Category</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text)' }}>Purpose</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text)' }}>Retention</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '500' }}>varsaka_dpdp_consent, varsaka_dpdp_preferences</td>
                  <td style={{ padding: '10px 12px' }}>Essential</td>
                  <td style={{ padding: '10px 12px' }}>Stores your affirmative cookie and DPDP Act privacy preferences</td>
                  <td style={{ padding: '10px 12px' }}>12 Months</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '500' }}>varsaka_last_sub</td>
                  <td style={{ padding: '10px 12px' }}>Essential</td>
                  <td style={{ padding: '10px 12px' }}>Anti-spam rate limiting and bot submission protection</td>
                  <td style={{ padding: '10px 12px' }}>24 Hours</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '500' }}>varsaka_theme / vk-theme</td>
                  <td style={{ padding: '10px 12px' }}>Functional / Preferences</td>
                  <td style={{ padding: '10px 12px' }}>Persists your preferred interface theme (Light or Dark mode)</td>
                  <td style={{ padding: '10px 12px' }}>Persistent (Optional)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '500' }}>application_draft</td>
                  <td style={{ padding: '10px 12px' }}>Functional / Preferences</td>
                  <td style={{ padding: '10px 12px' }}>Locally preserves candidate job/internship application drafts</td>
                  <td style={{ padding: '10px 12px' }}>Session / Until Submit</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '500' }}>Aggregated Telemetry</td>
                  <td style={{ padding: '10px 12px' }}>Analytics (Optional)</td>
                  <td style={{ padding: '10px 12px' }}>Anonymized performance diagnostics (disabled unless consented)</td>
                  <td style={{ padding: '10px 12px' }}>Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>5. Third-Party Cookies & Ad Trackers</h2>
          <p>
            Varsaka Labs operates an advertising-free corporate platform. <strong>We do not host third-party advertising networks, data brokers, or behavioural tracking beacons on our website.</strong> We do not sell or exchange your browsing telemetry with any commercial marketing syndicates.
          </p>
        </section>

        <section>
          <h2>6. How to Manage & Disable Cookies</h2>
          <p>
            You have the absolute right to accept, customize, or decline cookies at any time:
          </p>
          <ul>
            <li>
              <strong>Through our Consent Banner:</strong> You can choose <strong>"Reject Optional"</strong> on our consent banner to restrict all non-essential telemetry and functional storage, select <strong>"Accept All"</strong>, or click <strong>"Customize"</strong> to independently select your preference categories.
            </li>
            <li>
              <strong>Revisiting Cookie Preferences:</strong> You can change or withdraw your consent at any time by clicking <strong>"Cookie Preferences"</strong> in the footer of any page or using the button below.
            </li>
            <li>
              <strong>Through Your Browser Settings:</strong> Modern web browsers allow you to manage cookie settings, view cookies stored on your device, and block or delete them entirely. Visit your browser's official support documentation (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge) to modify your preferences.
            </li>
          </ul>
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('varsaka-open-cookie-preferences'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
            >
              <span>⚙️</span> Manage Cookie Preferences
            </button>
          </div>
          <p style={{ marginTop: '14px' }}>
            Please note that disabling strictly necessary cookies may impact essential website functions, such as anti-abuse protections or maintaining secure login sessions.
          </p>
        </section>

        <section>
          <h2>7. Updates to This Policy</h2>
          <p>
            We may periodically review and update this Cookies Policy to reflect changes in our operational technologies or statutory Indian privacy requirements under the DPDP Act. Any modifications will be published on this page with an updated Effective Date.
          </p>
        </section>

        <section>
          <h2>8. Questions & Contact</h2>
          <p>
            If you have questions regarding our use of cookies or wish to exercise your data principal rights, please contact our team at:
          </p>
          <div style={{ background: 'var(--bg-light, #f8fafc)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '12px', padding: '18px 22px', margin: '16px 0' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--text)' }}>Varsaka Labs – Data Governance</p>
            <p style={{ margin: '0 0 4px' }}><strong>Email:</strong> <a href="mailto:info@varsaka.com">info@varsaka.com</a></p>
            <p style={{ margin: '0 0 4px' }}><strong>Location:</strong> Gachibowli, Hyderabad, Telangana 500032, India</p>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Related Policies: <Link to="/privacy-policy">Privacy Policy</Link> • <Link to="/terms-of-service">Terms of Service</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
}
