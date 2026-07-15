import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import './Services.css';

export default function SecurityTesting() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="svc-page">
      <SEO 
        title="Security Testing & VAPT Services | OWASP Audit"
        description="Varsaka Labs provides comprehensive security testing and VAPT services. We run penetration tests and OWASP audits to protect your application from vulnerabilities."
        keywords="security testing services, VAPT company, penetration testing agency, OWASP audit, ethical hacking services, website security audit"
      />
      <div className="svc-hero">
        <div className="svc-breadcrumb">
          <a onClick={() => navigate('/')}>Home</a>
          <span>/</span>
          <a onClick={() => navigate('/#services')}>Services</a>
          <span>/</span>
          <span style={{ color: '#fff' }}>Security Testing</span>
        </div>
        <div className="svc-hero-icon">🔐</div>
        <h1>Security Testing</h1>
        <p className="svc-hero-sub">Your users trust you with their data. We run penetration tests, OWASP audits and vulnerability assessments so that trust is never broken.</p>
        <div className="svc-hero-pills">
          {['OWASP Top 10', 'Penetration Testing', 'VAPT', 'API Security', 'SQL Injection', 'XSS Testing'].map(p => (
            <span key={p} className="svc-hero-pill">{p}</span>
          ))}
        </div>
      </div>

      <div className="svc-content">
        <div className="svc-overview">
          <div className="svc-overview-text">
            <h2>What is Security Testing?</h2>
            <p>Security testing identifies vulnerabilities, weaknesses, and flaws in your application that could be exploited by malicious actors to steal data, gain unauthorized access, or disrupt your service.</p>
            <p>At Varsaka Labs, our security engineers use the same tools and techniques that real attackers use - but with your permission and your best interests in mind. We find the holes before the hackers do.</p>
            <p>In today's threat landscape, security is not optional. It is a business requirement.</p>
          </div>
          <div className="svc-overview-visual">
            <div className="big-icon">🔐</div>
            <div className="svc-stat-row">
              <div className="svc-stat"><strong>12+</strong><span>Critical Vulns Found Avg.</span></div>
              <div className="svc-stat"><strong>100%</strong><span>OWASP Coverage</span></div>
              <div className="svc-stat"><strong>NDA</strong><span>Protected Engagements</span></div>
            </div>
          </div>
        </div>

        <h2 className="svc-section-title">What We Test For</h2>
        <p className="svc-section-sub">Comprehensive security validation covering all attack vectors.</p>
        <div className="svc-features-grid">
          {[
            { icon: '💉', title: 'Injection Attacks', desc: 'SQL, NoSQL, LDAP, and Command Injection testing to protect your databases and server from unauthorized access.' },
            { icon: '🔑', title: 'Authentication & Authorization', desc: 'We test login flows, session management, JWT tokens, and privilege escalation vulnerabilities.' },
            { icon: '🌐', title: 'XSS & CSRF', desc: 'Cross-Site Scripting and Cross-Site Request Forgery tests to protect your users from client-side attacks.' },
            { icon: '🔗', title: 'API Security', desc: 'Deep testing of REST and GraphQL APIs for broken object-level authorization and data exposure issues.' },
            { icon: '📁', title: 'Sensitive Data Exposure', desc: 'We identify unencrypted data in transit, insecure storage, and improper error messages that leak info.' },
            { icon: '🧩', title: 'Third-Party Dependencies', desc: 'Scanning of all npm, pip, and Maven packages for known CVEs and supply-chain vulnerabilities.' },
          ].map(f => (
            <div key={f.title} className="svc-feature-card">
              <div className="svc-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="svc-process">
          <h2 className="svc-section-title">Our Security Testing Process</h2>
          <p className="svc-section-sub">A structured, ethical, and thorough penetration testing methodology.</p>
          <div className="svc-steps">
            {[
              { n: '01', title: 'Scoping & NDA', desc: 'We define the scope, rules of engagement, and sign a mutual NDA to protect both parties.' },
              { n: '02', title: 'Reconnaissance', desc: 'Passive and active information gathering to understand your application\'s attack surface.' },
              { n: '03', title: 'Vulnerability Scanning', desc: 'Automated scanning combined with manual analysis to identify all potential weaknesses.' },
              { n: '04', title: 'Exploitation Attempt', desc: 'Controlled, ethical exploitation to confirm real-world impact of discovered vulnerabilities.' },
              { n: '05', title: 'Reporting', desc: 'Detailed report with CVSS scores, proof-of-concept evidence, and clear remediation guidance.' },
              { n: '06', title: 'Re-Testing', desc: 'After your team fixes the issues, we re-test to verify that all vulnerabilities are properly resolved.' },
            ].map(s => (
              <div key={s.n} className="svc-step">
                <div className="svc-step-num">{s.n}</div>
                <div className="svc-step-body"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="svc-tools">
          <h2 className="svc-section-title">Tools & Technologies</h2>
          <p className="svc-section-sub">We use the same tools trusted by ethical hackers worldwide.</p>
          <div className="svc-tools-grid">
            {['Burp Suite Pro', 'OWASP ZAP', 'Metasploit', 'Nmap', 'Nessus', 'Nikto', 'SQLMap', 'Wireshark', 'Kali Linux', 'Snyk', 'SonarQube', 'Dependency-Check'].map(t => (
              <span key={t} className="svc-tool-chip">{t}</span>
            ))}
          </div>
        </div>

        <div className="svc-deliverables">
          <h2 className="svc-section-title">What You'll Get</h2>
          <p className="svc-section-sub">A professional security audit package you can share with clients and stakeholders.</p>
          <div className="svc-deliverables-list">
            {['Executive Summary Report', 'Technical Vulnerability Report', 'CVSS Risk Scoring', 'Proof of Concept Evidence', 'Remediation Roadmap', 'OWASP Compliance Checklist', 'Re-test Confirmation Report', 'Security Certificate'].map(d => (
              <div key={d} className="svc-deliverable-item">{d}</div>
            ))}
          </div>
        </div>

        <div className="svc-cta">
          <h2>Is Your Application Truly Secure? 🔐</h2>
          <p>Book a free security discovery call. We'll give you an honest, no-pressure assessment of your risk exposure.</p>
          <div className="svc-cta-btns">
            <a href="/#contact" className="svc-btn-white">Get Free Security Consultation</a>
            <a href="/#services" className="svc-btn-outline">Explore Other Services</a>
          </div>
        </div>
      </div>
    </div>
  );
}
