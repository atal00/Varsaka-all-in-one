import { useEffect } from 'react';

export default function NdaTemplate() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-wrapper">
      <div className="prose-block">
        <div className="section-tag">⚖️ Legal</div>
        <h1>Non-Disclosure Agreement (NDA)</h1>
        <p className="meta">Standard Template for Clients</p>

        <p>This is a standard NDA template that we use with our clients to ensure the confidentiality of their project details and intellectual property.</p>

        <div className="info-card" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Confidentiality Clause</h3>
          <p style={{ fontStyle: 'italic', color: 'var(--text-mid)', marginBottom: 0 }}>"The Recipient agrees to hold all Confidential Information in strict confidence and shall not disclose any such information to any third party without the prior written consent of the Disclosing Party..."</p>
        </div>

        <p style={{ marginTop: '2rem' }}>When you partner with Varsaka Labs, we provide a fully signed and legally binding version of this document tailored to your specific project needs.</p>
      </div>
    </div>
  );
}
