import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-wrapper">
      <div className="prose-block">
        <div className="section-tag">⚖️ Legal</div>
        <h1>Privacy Policy</h1>
        <p className="meta">Last Updated: May 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us through our contact forms and chatbot, including your name, email address, and project details.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to respond to your inquiries, provide our services, and communicate with you about your project.</p>

        <h2>3. Data Security</h2>
        <p>We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. Your data is sent via encrypted channels to our secure endpoints.</p>

        <h2>4. Third-Party Services</h2>
        <p>We use third-party services like FormSubmit and Google Sheets to process and store your inquiries. These services have their own privacy policies regarding your data.</p>

        <h2>5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at info@varsaka.com.</p>
      </div>
    </div>
  );
}
