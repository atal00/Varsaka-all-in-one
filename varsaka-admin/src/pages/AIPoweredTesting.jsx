import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import './Services.css';

export default function AIPoweredTesting() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="svc-page">
      <SEO 
        title="AI-Powered Testing Services | Intelligent QA Solutions"
        description="Varsaka Labs uses machine learning and AI to deliver intelligent software testing. We provide self-healing scripts and anomaly detection for modern applications."
        keywords="AI powered testing, intelligent QA, machine learning in testing, self healing automation, predictive QA services, smart software testing"
      />
      <div className="svc-hero">
        <div className="svc-breadcrumb">
          <a onClick={() => navigate('/')}>Home</a>
          <span>/</span>
          <a onClick={() => navigate('/#services')}>Services</a>
          <span>/</span>
          <span style={{ color: '#fff' }}>AI-Powered Testing</span>
        </div>
        <div className="svc-hero-icon">🧠</div>
        <h1>AI-Powered Testing</h1>
        <p className="svc-hero-sub">We use machine learning to auto-generate smart test cases, detect anomalies early, and keep test scripts self-healing.</p>
        <div className="svc-hero-pills">
          {['ML Test Generation', 'Self-Healing Scripts', 'Anomaly Detection', 'Visual AI Testing', 'Predictive QA', 'Smart Coverage'].map(p => (
            <span key={p} className="svc-hero-pill">{p}</span>
          ))}
        </div>
      </div>

      <div className="svc-content">
        <div className="svc-overview">
          <div className="svc-overview-text">
            <h2>What is AI-Powered Testing?</h2>
            <p>AI-powered testing leverages machine learning and intelligent algorithms to make your QA process smarter, faster, and more resilient. It moves beyond traditional scripted testing to create adaptive, self-improving quality assurance systems.</p>
            <p>At Varsaka Labs, we apply AI at every stage - from intelligently generating test cases from your user stories, to self-healing scripts that adapt when your UI changes, to predictive analytics that tell you where bugs are most likely to appear.</p>
            <p>The future of QA is here. Let us bring it to your product today.</p>
          </div>
          <div className="svc-overview-visual">
            <div className="big-icon">🧠</div>
            <div className="svc-stat-row">
              <div className="svc-stat"><strong>97%</strong><span>Test Coverage Achieved</span></div>
              <div className="svc-stat"><strong>60%</strong><span>Maintenance Effort Reduced</span></div>
              <div className="svc-stat"><strong>5x</strong><span>Faster Test Generation</span></div>
            </div>
          </div>
        </div>

        <h2 className="svc-section-title">AI Capabilities We Bring</h2>
        <p className="svc-section-sub">Cutting-edge AI techniques applied to real-world QA challenges.</p>
        <div className="svc-features-grid">
          {[
            { icon: '✨', title: 'AI Test Case Generation', desc: 'Our models analyze your requirements, user stories, and code to automatically generate comprehensive test cases.' },
            { icon: '🩺', title: 'Self-Healing Automation', desc: 'Scripts that automatically detect and fix broken locators when your UI changes, eliminating maintenance sprints.' },
            { icon: '👁️', title: 'Visual AI Testing', desc: 'Computer vision-based testing that catches pixel-level UI regressions invisible to code-based tests.' },
            { icon: '🔮', title: 'Predictive Bug Detection', desc: 'ML models trained on your code history to predict which areas are most likely to contain defects in new releases.' },
            { icon: '📊', title: 'Intelligent Test Prioritization', desc: 'AI ranks your test suite by risk and impact so the most critical tests always run first in your pipeline.' },
            { icon: '🔍', title: 'Anomaly Detection', desc: 'Continuous monitoring that learns normal application behavior and instantly alerts on deviations in production.' },
          ].map(f => (
            <div key={f.title} className="svc-feature-card">
              <div className="svc-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="svc-process">
          <h2 className="svc-section-title">How We Implement AI Testing</h2>
          <p className="svc-section-sub">A structured, phased approach to intelligent QA adoption.</p>
          <div className="svc-steps">
            {[
              { n: '01', title: 'AI Readiness Assessment', desc: 'We evaluate your current testing maturity, codebase, and data availability to design the right AI strategy.' },
              { n: '02', title: 'Model Training & Calibration', desc: 'We train AI models on your specific application patterns, historical bugs, and test data.' },
              { n: '03', title: 'Intelligent Suite Generation', desc: 'AI generates an optimized set of test cases covering edge cases that humans typically miss.' },
              { n: '04', title: 'Self-Healing Framework Setup', desc: 'We integrate self-healing capabilities into your existing automation framework.' },
              { n: '05', title: 'Continuous Learning Pipeline', desc: 'The system continues learning from new test runs, improving accuracy and coverage over time.' },
              { n: '06', title: 'Dashboards & Insights', desc: 'AI-driven dashboards surfacing quality trends, risk hotspots, and release readiness scores.' },
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
          <p className="svc-section-sub">The best AI and ML tools powering our intelligent QA solutions.</p>
          <div className="svc-tools-grid">
            {['Applitools Eyes', 'Testim', 'Mabl', 'Functionize', 'Diffblue Cover', 'Playwright AI', 'OpenAI API', 'TensorFlow', 'scikit-learn', 'Selenium AI', 'Percy', 'Chromatic'].map(t => (
              <span key={t} className="svc-tool-chip">{t}</span>
            ))}
          </div>
        </div>

        <div className="svc-deliverables">
          <h2 className="svc-section-title">What You'll Get</h2>
          <p className="svc-section-sub">A smart, future-proof QA system built for your application.</p>
          <div className="svc-deliverables-list">
            {['AI Test Strategy Document', 'Auto-Generated Test Suite', 'Self-Healing Framework', 'Visual Regression Baseline', 'Predictive Analytics Dashboard', 'Risk Heatmap Report', 'Model Training Documentation', 'Continuous Monitoring Setup'].map(d => (
              <div key={d} className="svc-deliverable-item">{d}</div>
            ))}
          </div>
        </div>

        <div className="svc-cta">
          <h2>Make Your Testing Smarter with AI! 🧠</h2>
          <p>Let's explore how AI can transform your QA process - reduce costs, increase coverage, and eliminate manual bottlenecks.</p>
          <div className="svc-cta-btns">
            <a href="/#contact" className="svc-btn-white">Get Free AI QA Consultation</a>
            <a href="/#services" className="svc-btn-outline">Explore Other Services</a>
          </div>
        </div>
      </div>
    </div>
  );
}
