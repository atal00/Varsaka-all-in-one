import { useEffect } from 'react';
import SEO from '../components/SEO';
import './CaseStudies.css';

const studies = [
  { 
    client: 'Ourfab Technologies', 
    tag: 'Security Testing', 
    icon: 'fa-shield-halved',
    outcome: 'Critical Security Risks Remediated Post-Audit', 
    desc: 'Conducted a comprehensive OWASP security audit on their fintech platform. Identified and helped the engineering team remediate several critical vulnerabilities before the public production release.' 
  },
  { 
    client: 'Techtd Platform', 
    tag: 'Automation', 
    icon: 'fa-bolt-lightning',
    outcome: 'Regression Testing Time Significantly Optimized', 
    desc: 'Developed a custom Cypress automation framework integrated with their CI/CD pipeline. Successfully reduced the manual regression effort, allowing faster feedback for developers.' 
  },
  { 
    client: 'TakeCare360', 
    tag: 'AI-Powered Testing', 
    icon: 'fa-robot',
    outcome: 'Test Coverage Expanded to 85%+', 
    desc: 'Implemented AI-assisted test generation to bridge existing coverage gaps. Successfully expanded the automated test suite to cover critical edge cases in their healthcare platform.' 
  },
  { 
    client: 'RetailEdge India', 
    tag: 'Performance Testing', 
    icon: 'fa-gauge-high',
    outcome: 'System Reliability Improved Under Load', 
    desc: 'Performed targeted load and stress testing using JMeter. Identified performance bottlenecks in the checkout flow, leading to infrastructure optimizations for peak traffic periods.' 
  },
];

export default function CaseStudies() {
  useEffect(() => { 
    window.scrollTo(0, 0); 
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="case-page">
      <SEO 
        title="Case Studies | Software Testing Success Stories"
        description="Explore how Varsaka Labs has helped global clients solve their quality and security challenges. See our success stories in automation, security audits, and performance engineering."
        keywords="software testing case studies, QA success stories, security audit results, automation testing impact, performance testing examples"
      />
      <section className="case-hero">
        <div className="case-container">
          <div className="section-tag fade-in">
            <i className="fa-solid fa-chart-line" style={{ marginRight: '8px' }}></i> Success Stories
          </div>
          <h1 className="blog-title fade-in" style={{ marginBottom: '1.5rem' }}>Impactful Solutions for <br /><span>Our Partners</span></h1>
          <p className="blog-sub fade-in" style={{ margin: '0 auto 4rem' }}>
            Helping teams across the globe solve their most critical quality and security challenges through engineering excellence.
          </p>
        </div>
      </section>

      <div className="case-container">
        <div className="case-grid">
          {studies.map((s, i) => (
            <div key={i} className="case-card fade-in">
              <div className="case-icon">
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <span className="case-tag">{s.tag}</span>
              <h3>{s.client}</h3>
              <div className="case-outcome">
                <i className="fa-solid fa-circle-check" style={{ marginTop: '4px' }}></i>
                <span>{s.outcome}</span>
              </div>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
