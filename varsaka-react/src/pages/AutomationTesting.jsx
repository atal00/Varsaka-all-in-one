import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import './Services.css';

export default function AutomationTesting() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="svc-page">
      <SEO 
        title="Automation Testing Services | Selenium, Playwright, Cypress"
        description="Varsaka Labs offers professional automation testing services. We build scalable frameworks using Selenium, Playwright, and Cypress to reduce regression time by 80%."
        keywords="automation testing services, test automation agency, Selenium automation, Playwright testing company, Cypress automation, CI/CD testing integration"
      />
      <div className="svc-hero">
        <div className="svc-breadcrumb">
          <a onClick={() => navigate('/')}>Home</a>
          <span>/</span>
          <a onClick={() => navigate('/#services')}>Services</a>
          <span>/</span>
          <span style={{ color: '#fff' }}>Automation Testing</span>
        </div>
        <div className="svc-hero-icon">🤖</div>
        <h1>Automation Testing</h1>
        <p className="svc-hero-sub">Build it once, run it forever. We design solid automation frameworks that cut your regression time by up to 80%.</p>
        <div className="svc-hero-pills">
          {['Selenium', 'Playwright', 'Cypress', 'Appium', 'CI/CD Integration', 'Self-Healing Tests'].map(p => (
            <span key={p} className="svc-hero-pill">{p}</span>
          ))}
        </div>
      </div>

      <div className="svc-content">
        <div className="svc-overview">
          <div className="svc-overview-text">
            <h2>What is Automation Testing?</h2>
            <p>Test automation replaces slow, repetitive manual regression runs with fast, reliable scripts that execute in minutes. It is the key to shipping faster without sacrificing quality.</p>
            <p>At Varsaka Labs, we don't just "write automation scripts." We build enterprise-grade, maintainable frameworks designed to scale with your product - integrated directly into your CI/CD pipeline.</p>
            <p>The result: every code commit is automatically tested, and your team gets instant feedback before bugs ever reach production.</p>
          </div>
          <div className="svc-overview-visual">
            <div className="big-icon">🤖</div>
            <div className="svc-stat-row">
              <div className="svc-stat"><strong>80%</strong><span>Regression Time Saved</span></div>
              <div className="svc-stat"><strong>24/7</strong><span>Automated Monitoring</span></div>
              <div className="svc-stat"><strong>3x</strong><span>Faster Release Cycles</span></div>
            </div>
          </div>
        </div>

        <h2 className="svc-section-title">What We Automate</h2>
        <p className="svc-section-sub">From UI flows to APIs - we automate intelligently, not blindly.</p>
        <div className="svc-features-grid">
          {[
            { icon: '🖥️', title: 'UI Test Automation', desc: 'End-to-end browser automation with Selenium, Playwright or Cypress - covering every critical user journey.' },
            { icon: '🔗', title: 'API Test Automation', desc: 'REST and GraphQL API automation ensuring your backend contracts are always validated on every build.' },
            { icon: '🔄', title: 'Regression Suites', desc: 'Full regression packs that run automatically on every pull request, catching breaking changes immediately.' },
            { icon: '🛠️', title: 'Framework Architecture', desc: 'We design Page Object Model (POM) or Screenplay-pattern frameworks built for maintainability and scale.' },
            { icon: '⚙️', title: 'CI/CD Integration', desc: 'Plug our test suites into Jenkins, GitHub Actions, GitLab CI, or Azure DevOps for fully automated pipelines.' },
            { icon: '🩺', title: 'Self-Healing Tests', desc: 'AI-assisted scripts that automatically detect and adapt to minor UI changes, reducing maintenance overhead.' },
          ].map(f => (
            <div key={f.title} className="svc-feature-card">
              <div className="svc-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="svc-process">
          <h2 className="svc-section-title">Our Automation Journey</h2>
          <p className="svc-section-sub">We follow a proven approach to deliver automation that actually works long-term.</p>
          <div className="svc-steps">
            {[
              { n: '01', title: 'Automation Feasibility Study', desc: 'We analyze your application and identify which flows deliver the highest ROI when automated.' },
              { n: '02', title: 'Framework Design', desc: 'We architect a clean, scalable framework using industry-standard design patterns.' },
              { n: '03', title: 'Script Development', desc: 'Our engineers write modular, readable test scripts with full version control and peer review.' },
              { n: '04', title: 'CI/CD Pipeline Setup', desc: 'We integrate the suite with your pipeline so tests run automatically on every commit or PR.' },
              { n: '05', title: 'Execution & Reporting', desc: 'Rich dashboards with pass/fail trends, screenshots, and video recordings of every test run.' },
              { n: '06', title: 'Handover & Training', desc: 'We hand over the full framework with documentation and train your team to own and extend it.' },
            ].map(s => (
              <div key={s.n} className="svc-step">
                <div className="svc-step-num">{s.n}</div>
                <div className="svc-step-body"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="svc-tools">
          <h2 className="svc-section-title">Tools & Frameworks</h2>
          <p className="svc-section-sub">We are proficient across the complete modern automation ecosystem.</p>
          <div className="svc-tools-grid">
            {['Selenium WebDriver', 'Playwright', 'Cypress', 'Appium', 'RestAssured', 'Postman/Newman', 'TestNG', 'JUnit 5', 'GitHub Actions', 'Jenkins', 'Azure DevOps', 'Allure Reports', 'Extent Reports', 'Maven/Gradle'].map(t => (
              <span key={t} className="svc-tool-chip">{t}</span>
            ))}
          </div>
        </div>

        <div className="svc-deliverables">
          <h2 className="svc-section-title">What You'll Get</h2>
          <p className="svc-section-sub">A complete, production-grade automation solution.</p>
          <div className="svc-deliverables-list">
            {['Automation Framework (Source Code)', 'Test Script Repository', 'CI/CD Pipeline Configuration', 'Execution Dashboard', 'Framework Documentation', 'Training Session Recording', 'Maintenance Guidelines', 'Coverage Report'].map(d => (
              <div key={d} className="svc-deliverable-item">{d}</div>
            ))}
          </div>
        </div>

        <div className="svc-cta">
          <h2>Ready to Automate Your Testing? 🤖</h2>
          <p>Let's calculate your potential time savings and build a roadmap that fits your team and budget.</p>
          <div className="svc-cta-btns">
            <a href="/#contact" className="svc-btn-white">Get Free Consultation</a>
            <a href="/#services" className="svc-btn-outline">Explore Other Services</a>
          </div>
        </div>
      </div>
    </div>
  );
}
