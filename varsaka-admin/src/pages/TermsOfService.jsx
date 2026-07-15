import { useEffect } from 'react';

export default function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-wrapper">
      <div className="prose-block">
        <div className="section-tag">⚖️ Legal</div>
        <h1>Terms of Service</h1>
        <p className="meta">Last Updated: May 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the Varsaka Labs website, you agree to be bound by these Terms of Service.</p>

        <h2>2. Services</h2>
        <p>Varsaka Labs provides software testing and quality engineering services. The scope of work for any project will be defined in a separate agreement.</p>

        <h2>3. Intellectual Property</h2>
        <p>All content on this website is the property of Varsaka Labs and is protected by copyright laws.</p>

        <h2>4. Limitation of Liability</h2>
        <p>Varsaka Labs will not be liable for any indirect, incidental, or consequential damages arising out of your use of our website or services.</p>

        <h2>5. Governing Law</h2>
        <p>These Terms of Service are governed by the laws of India.</p>
      </div>
    </div>
  );
}
