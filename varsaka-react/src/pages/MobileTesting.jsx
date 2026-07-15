import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import './Services.css';

export default function MobileTesting() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="svc-page">
      <SEO 
        title="Mobile App Testing Services | iOS & Android QA"
        description="Varsaka Labs offers expert mobile app testing on 100+ real devices. We ensure your iOS and Android apps are pixel-perfect and perform flawlessly."
        keywords="mobile app testing services, iOS testing company, Android QA services, real device testing, mobile application audit, Appium experts"
      />
      <div className="svc-hero">
        <div className="svc-breadcrumb">
          <a onClick={() => navigate('/')}>Home</a>
          <span>/</span>
          <a onClick={() => navigate('/#services')}>Services</a>
          <span>/</span>
          <span style={{ color: '#fff' }}>Mobile Testing</span>
        </div>
        <div className="svc-hero-icon">📱</div>
        <h1>Mobile Testing</h1>
        <p className="svc-hero-sub">Native, hybrid or cross-platform - we test on 100+ real devices. iOS and Android, every screen size, pixel-perfect quality guaranteed.</p>
        <div className="svc-hero-pills">
          {['iOS Testing', 'Android Testing', 'Appium', 'Real Device Testing', 'Cross-Platform', 'Performance on Mobile'].map(p => (
            <span key={p} className="svc-hero-pill">{p}</span>
          ))}
        </div>
      </div>

      <div className="svc-content">
        <div className="svc-overview">
          <div className="svc-overview-text">
            <h2>What is Mobile Testing?</h2>
            <p>Mobile testing validates that your app works flawlessly across the fragmented landscape of devices, OS versions, screen sizes, network conditions, and hardware configurations that your real users have.</p>
            <p>At Varsaka Labs, we test on 100+ real physical devices - not just emulators. We cover iOS and Android, from the latest flagship phones to older budget devices still widely used across India and emerging markets.</p>
            <p>Your mobile app is often the first impression of your brand. We make sure it is a great one.</p>
          </div>
          <div className="svc-overview-visual">
            <div className="big-icon">📱</div>
            <div className="svc-stat-row">
              <div className="svc-stat"><strong>100+</strong><span>Real Devices</span></div>
              <div className="svc-stat"><strong>iOS & Android</strong><span>Full Coverage</span></div>
              <div className="svc-stat"><strong>Pixel Perfect</strong><span>UI Validation</span></div>
            </div>
          </div>
        </div>

        <h2 className="svc-section-title">What We Test On Mobile</h2>
        <p className="svc-section-sub">Comprehensive mobile QA covering every dimension of quality.</p>
        <div className="svc-features-grid">
          {[
            { icon: '🎯', title: 'Functional Testing', desc: 'Every feature, screen, and gesture tested across iOS and Android to ensure consistent behavior.' },
            { icon: '🖼️', title: 'UI / UX Validation', desc: 'Pixel-perfect verification of layouts, fonts, icons, and animations across all screen sizes and resolutions.' },
            { icon: '⚡', title: 'Mobile Performance', desc: 'App startup time, scroll smoothness, memory usage, battery drain, and network efficiency testing.' },
            { icon: '🌐', title: 'Network Condition Testing', desc: 'Testing under 2G, 3G, 4G, 5G, and offline scenarios to validate graceful degradation.' },
            { icon: '🔄', title: 'Interrupt Testing', desc: 'Calls, SMS, low battery, background apps, rotation - we test every real-world interruption scenario.' },
            { icon: '♿', title: 'Accessibility Testing', desc: 'VoiceOver, TalkBack, and WCAG 2.1 compliance validation to make your app usable by everyone.' },
          ].map(f => (
            <div key={f.title} className="svc-feature-card">
              <div className="svc-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="svc-process">
          <h2 className="svc-section-title">Our Mobile Testing Process</h2>
          <p className="svc-section-sub">A thorough, device-aware testing workflow for mobile apps.</p>
          <div className="svc-steps">
            {[
              { n: '01', title: 'Device Matrix Selection', desc: 'We analyze your user analytics to select the most representative real devices for maximum coverage.' },
              { n: '02', title: 'Test Planning', desc: 'Define test types, coverage scope, automation candidacy, and testing environments.' },
              { n: '03', title: 'Manual Exploration', desc: 'Expert testers explore the app on real devices, uncovering usability issues automation misses.' },
              { n: '04', title: 'Automation with Appium', desc: 'We build an Appium-based suite for regression on multiple devices in parallel.' },
              { n: '05', title: 'Performance Profiling', desc: 'Using Xcode Instruments and Android Profiler to measure CPU, memory, and network in real scenarios.' },
              { n: '06', title: 'Report & Certification', desc: 'Device-wise results with screenshots, device logs, and a final mobile quality sign-off report.' },
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
          <p className="svc-section-sub">Leading mobile testing tools we use for maximum coverage.</p>
          <div className="svc-tools-grid">
            {['Appium', 'XCUITest', 'Espresso', 'BrowserStack', 'Sauce Labs', 'Firebase Test Lab', 'Xcode Instruments', 'Android Profiler', 'Charles Proxy', 'XCUI', 'Detox', 'Maestro'].map(t => (
              <span key={t} className="svc-tool-chip">{t}</span>
            ))}
          </div>
        </div>

        <div className="svc-deliverables">
          <h2 className="svc-section-title">What You'll Get</h2>
          <p className="svc-section-sub">A complete mobile quality assurance package.</p>
          <div className="svc-deliverables-list">
            {['Device Matrix Document', 'Mobile Test Plan', 'Appium Automation Suite', 'Device-wise Bug Reports', 'UI Screenshot Evidence', 'Performance Profiling Report', 'Accessibility Audit Report', 'Final Mobile QA Certificate'].map(d => (
              <div key={d} className="svc-deliverable-item">{d}</div>
            ))}
          </div>
        </div>

        <div className="svc-cta">
          <h2>Launch a Mobile App Your Users Will Love! 📱</h2>
          <p>Get a free mobile testing consultation and device matrix recommendation tailored to your user base.</p>
          <div className="svc-cta-btns">
            <a href="/#contact" className="svc-btn-white">Get Free Consultation</a>
            <a href="/#services" className="svc-btn-outline">Explore Other Services</a>
          </div>
        </div>
      </div>
    </div>
  );
}
