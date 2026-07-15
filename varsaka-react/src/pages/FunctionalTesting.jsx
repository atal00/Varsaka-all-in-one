import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import './Services.css';

export default function FunctionalTesting() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="svc-page">
      <SEO 
        title="Functional Testing Services | Manual & Scripted QA"
        description="Varsaka Labs provides comprehensive functional testing services to ensure every feature of your software works perfectly across all devices and browsers."
        keywords="functional testing services, manual testing company, software feature validation, regression testing, QA manual testing agency"
      />
      <div className="svc-hero">
        <div className="svc-breadcrumb">
          <a onClick={() => navigate('/')}>Home</a>
          <span>/</span>
          <a onClick={() => navigate('/#services')}>Services</a>
          <span>/</span>
          <span style={{ color: '#fff' }}>Functional Testing</span>
        </div>
        <div className="svc-hero-icon">🧪</div>
        <h1>Functional Testing</h1>
        <p className="svc-hero-sub">We verify every feature works exactly as your users expect - across browsers, devices, and all those sneaky edge cases.</p>
        <div className="svc-hero-pills">
          {['Manual Testing', 'Scripted Testing', 'Regression Testing', 'Cross-Browser', 'Exploratory Testing'].map(p => (
            <span key={p} className="svc-hero-pill">{p}</span>
          ))}
        </div>
      </div>

      <div className="svc-content">

        {/* OVERVIEW */}
        <div className="svc-overview">
          <div className="svc-overview-text">
            <h2>What is Functional Testing?</h2>
            <p>Functional testing is the backbone of software quality. It validates that every button, form, workflow, and feature in your application behaves exactly the way it was designed to - no surprises, no exceptions.</p>
            <p>At Varsaka Labs, our certified QA engineers combine systematic manual exploration with structured scripted test cases to provide complete confidence before every release.</p>
            <p>We think like your users, so your users never have to encounter broken experiences.</p>
          </div>
          <div className="svc-overview-visual">
            <div className="big-icon">🧪</div>
            <div className="svc-stat-row">
              <div className="svc-stat"><strong>99%</strong><span>Bug Detection Rate</span></div>
              <div className="svc-stat"><strong>3-5 days</strong><span>Onboarding Time</span></div>
              <div className="svc-stat"><strong>100%</strong><span>Coverage Documented</span></div>
            </div>
          </div>
        </div>

        {/* WHAT WE COVER */}
        <h2 className="svc-section-title">What We Cover</h2>
        <p className="svc-section-sub">A complete functional validation across every layer of your application.</p>
        <div className="svc-features-grid">
          {[
            { icon: '✅', title: 'UI & UX Validation', desc: 'Verify every button, input field, modal, and page transition works correctly and consistently.' },
            { icon: '🔁', title: 'Regression Testing', desc: 'After every code change, we re-run the full suite to make sure nothing that worked before is now broken.' },
            { icon: '🌐', title: 'Cross-Browser Testing', desc: 'We test across Chrome, Firefox, Safari, and Edge to ensure a consistent experience for all your users.' },
            { icon: '📋', title: 'Requirements Traceability', desc: 'Every test case maps back to a requirement, so you always know what has been tested and why.' },
            { icon: '🔍', title: 'Exploratory Testing', desc: 'Our experienced testers go beyond scripted cases - exploring your app with a curious, user-centric mindset.' },
            { icon: '📊', title: 'Defect Reporting', desc: 'Detailed bug reports with screenshots, steps to reproduce, severity ratings, and fix suggestions.' },
          ].map(f => (
            <div key={f.title} className="svc-feature-card">
              <div className="svc-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* PROCESS */}
        <div className="svc-process">
          <h2 className="svc-section-title">Our Testing Process</h2>
          <p className="svc-section-sub">A structured, transparent workflow from kickoff to sign-off.</p>
          <div className="svc-steps">
            {[
              { n: '01', title: 'Requirement Analysis', desc: 'We review your specs, user stories, and acceptance criteria to understand exactly what needs to be tested.' },
              { n: '02', title: 'Test Plan & Strategy', desc: 'We create a detailed test plan defining scope, approach, timelines, tools, and entry/exit criteria.' },
              { n: '03', title: 'Test Case Design', desc: 'Our team writes clear, reusable test cases covering positive, negative, and boundary scenarios.' },
              { n: '04', title: 'Test Execution', desc: 'Testers execute all cases meticulously, logging every defect with full reproduction steps and evidence.' },
              { n: '05', title: 'Bug Tracking & Retesting', desc: 'We track bugs through their lifecycle and retest every fix to confirm resolution before sign-off.' },
              { n: '06', title: 'Final Report & Sign-off', desc: 'You receive a comprehensive QA report with full metrics, coverage stats, and our quality certification.' },
            ].map(s => (
              <div key={s.n} className="svc-step">
                <div className="svc-step-num">{s.n}</div>
                <div className="svc-step-body"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* TOOLS */}
        <div className="svc-tools">
          <h2 className="svc-section-title">Tools & Technologies</h2>
          <p className="svc-section-sub">We use industry-standard tools to deliver precise, well-documented results.</p>
          <div className="svc-tools-grid">
            {['JIRA', 'TestRail', 'Zephyr', 'Confluence', 'Postman', 'BrowserStack', 'LambdaTest', 'Excel/Sheets', 'Xray', 'Qase.io'].map(t => (
              <span key={t} className="svc-tool-chip">{t}</span>
            ))}
          </div>
        </div>

        {/* DELIVERABLES */}
        <div className="svc-deliverables">
          <h2 className="svc-section-title">What You'll Get</h2>
          <p className="svc-section-sub">Every engagement includes these clear, professional deliverables.</p>
          <div className="svc-deliverables-list">
            {['Test Plan Document', 'Test Case Repository', 'Test Execution Report', 'Bug Report with Severity', 'RTM (Requirements Traceability Matrix)', 'Final Sign-off Certificate', 'Session Notes & Evidence', 'Re-test Report'].map(d => (
              <div key={d} className="svc-deliverable-item">{d}</div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="svc-cta">
          <h2>Ready for Bug-Free Releases? 🚀</h2>
          <p>Book a free consultation and let our QA experts review your application. No obligation, just honest advice.</p>
          <div className="svc-cta-btns">
            <a href="/#contact" className="svc-btn-white">Get Free Consultation</a>
            <a href="/#services" className="svc-btn-outline">Explore Other Services</a>
          </div>
        </div>

      </div>
    </div>
  );
}
