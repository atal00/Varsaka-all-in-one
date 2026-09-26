import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Refund & Cancellation Policy | Varsaka Labs</title>
        <meta 
          name="description" 
          content="Refund and Cancellation Policy for Varsaka Labs Software Quality Engineering services, consulting engagements, and training programs under Indian law." 
        />
      </Helmet>

      <div className="prose-block">
        <div className="section-tag">💼 Billing & Consumer Protection</div>
        <h1>Refund & Cancellation Policy</h1>
        <p className="meta">
          Effective Date: September 2026 | Governed by Consumer Protection Act, 2019 & Indian Contract Act, 1872
        </p>

        <section>
          <h2>1. Overview & Commitment</h2>
          <p>
            At <strong>Varsaka Labs</strong> ("Varsaka", "we", "our", or "us"), our priority is delivering world-class Software Testing, Automation Framework Architecture, and Quality Engineering consulting. We stand firmly behind the precision and rigor of our deliverables.
          </p>
          <p>
            This Refund & Cancellation Policy sets forth the terms under which refunds, cancellations, and project adjustments are processed for our B2B client services, technical consultations, and educational/internship cohorts.
          </p>
        </section>

        <section>
          <h2>2. B2B Software Testing & Quality Engineering Engagements</h2>
          <p>
            Client commercial testing projects are governed by custom Statements of Work (SOW) or Master Services Agreements (MSA) executed between Varsaka Labs and the Client:
          </p>
          <ul>
            <li>
              <strong>Milestone Deliverables & Acceptance:</strong> Professional services are invoiced based on mutually agreed milestone deliverables (e.g., test strategy delivery, test automation suite hand-off, or completion of security penetration testing audit). Clients receive a designated acceptance window (typically 5 to 10 business days as defined in the SOW) to review findings, verify test script execution, and request technical revisions.
            </li>
            <li>
              <strong>Revisions & Defect Retesting:</strong> If any delivered test deliverable fails to conform to the documented technical criteria set out in the SOW, Varsaka will re-execute tests and rectify deliverables at no additional charge during the warranty window.
            </li>
            <li>
              <strong>Early Project Termination:</strong> If a client terminates an active engagement prior to project completion, billing will be prorated strictly for documented work completed and milestones approved up to the formal date of written notice. Any unutilized advance retainer balances will be refunded within 14 business days.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Technical Consultations & Audit Scoping Sessions</h2>
          <p>
            For paid technical advisory consultations and architectural scoping calls:
          </p>
          <ul>
            <li>
              <strong>Cancellations with More Than 24 Hours Notice:</strong> Full refund or 100% credit toward rescheduled consultation slots.
            </li>
            <li>
              <strong>Cancellations within 24 Hours:</strong> Consultations may be rescheduled once without penalty; no direct cash refund applies for missed sessions without prior written notice.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Internship & Training Cohort Programs</h2>
          <p>
            For candidates enrolled in structured training, industry mentorship, or credentialed QA cohorts:
          </p>
          <ul>
            <li>
              <strong>Cooling-off Period:</strong> A student or participant may request a full cancellation and refund within <strong>7 calendar days</strong> of enrollment or prior to the commencement of the first interactive session, whichever occurs earlier.
            </li>
            <li>
              <strong>Post-Commencement Withdrawals:</strong> Once cohort instruction begins and proprietary course repositories, LMS credentials, or project codebases have been accessed, fees become non-refundable due to the immediate allocation of dedicated mentor bandwidth and intellectual property access.
            </li>
            <li>
              <strong>Certificate Verification:</strong> Refund requests cannot be made or honored after a verifiable certificate of completion or internship credential has been issued.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Refund Processing Timelines & Method</h2>
          <p>
            All approved refunds are processed back to the original method of payment (bank transfer, UPI, or corporate card).
          </p>
          <ul>
            <li><strong>Acknowledgment:</strong> Within 48 business hours of receipt of the refund request.</li>
            <li><strong>Investigation & Approval:</strong> Evaluated within 3 to 5 business days.</li>
            <li><strong>Bank Credit:</strong> Once approved, the funds typically reflect in your account within <strong>5 to 7 business days</strong>, subject to your banking institution's processing cycles.</li>
          </ul>
        </section>

        <section>
          <h2>6. How to Request a Refund or Dispute an Invoice</h2>
          <p>
            To initiate a formal refund review or billing inquiry, submit an email with the subject line <em>"Refund Request - [Invoice / Order Number]"</em> to our billing department:
          </p>
          <div style={{ background: 'var(--bg-light, #f8fafc)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '12px', padding: '18px 22px', margin: '16px 0' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--text)' }}>Varsaka Labs – Accounts & Billing</p>
            <p style={{ margin: '0 0 4px' }}><strong>Email:</strong> <a href="mailto:info@varsaka.com">info@varsaka.com</a></p>
            <p style={{ margin: '0 0 4px' }}><strong>Phone / WhatsApp:</strong> <a href="https://wa.me/917396106271" target="_blank" rel="noopener noreferrer">+91 7396106271</a></p>
            <p style={{ margin: '0 0 4px' }}><strong>Address:</strong> Gachibowli, Hyderabad, Telangana 500032, India</p>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Related: <Link to="/terms-of-service">Terms of Service</Link> • <Link to="/privacy-policy">Privacy Policy</Link></p>
          </div>
        </section>
      </div>
    </div>
  );
}
