import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './About.css';

function useFadeIn() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => {
      if (!el.classList.contains('visible')) {
        obs.observe(el);
      }
    });
    return () => obs.disconnect();
  }, []);
}

export default function About() {
  useFadeIn();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const stats = [
    { number: '100+', label: 'Custom Test Suites Architected', icon: '🧪' },
    { number: '99.4%', label: 'Defect Prevention Rate', icon: '🎯' },
    { number: '500k+', label: 'Automated Assertions Run Monthly', icon: '⚡' },
    { number: '100%', label: 'Human-Verified Sign-Offs', icon: '🛡️' }
  ];

  const team = [
    {
      role: 'Principal Quality Architect',
      specialty: 'Distributed Systems & Resilience Engineering',
      desc: 'Designs multi-tier test architectures and zero-flakiness frameworks for fintech and cloud platforms.',
      image: '/images/architect_portrait.jpg',
      badge: 'Architecture & Scalability'
    },
    {
      role: 'Lead Automation Engineer',
      specialty: 'Playwright, Cypress & CI/CD Pipelines',
      desc: 'Specializes in synchronous browser orchestration, responsive mobile test suites, and GitHub Actions CD integrations.',
      image: '/images/automation_lead_portrait.jpg',
      badge: 'Automation Engineering'
    },
    {
      role: 'AppSec & Performance Specialist',
      specialty: 'VAPT, OWASP Top 10 & High-Throughput Load',
      desc: 'Simulates distributed DDOS, API fuzzing, and stress-tests microservices up to 50,000 requests per second.',
      image: '/images/security_lead_portrait.jpg',
      badge: 'Security & Performance'
    }
  ];

  const pillars = [
    {
      num: '01',
      title: 'Human Intuition Meets Mechanical Precision',
      desc: 'Automation runs the repetitive sweeps; human intuition finds the bizarre edge cases, psychological UX flaws, and unexpected race conditions that no bot can predict.',
      tag: 'Our Philosophy'
    },
    {
      num: '02',
      title: 'Real Hardware, Real Environments',
      desc: 'We do not rely solely on headless emulators. Our Hyderabad lab maintains dedicated physical iOS, Android, and desktop test rigs to replicate authentic end-user environments.',
      tag: 'Physical Lab'
    },
    {
      num: '03',
      title: 'Radical Engineering Transparency',
      desc: 'No vague progress bars or unreadable logs. We give you clear failure root-causes, replayable video traces, exact reproduction scripts, and human commentary.',
      tag: 'Communication'
    },
    {
      num: '04',
      title: 'Zero-Flakiness Manifesto',
      desc: 'Flaky tests erode team confidence. Every script we author undergoes stability endurance runs before entering your production deployment pipeline.',
      tag: 'Code Quality'
    }
  ];

  return (
    <div className="about-page">
      <SEO 
        title="About Varsaka Labs | Human-Crafted Software Quality Assurance"
        description="Varsaka Labs is an elite software quality engineering team based in Hyderabad. Learn about our human-crafted approach, our physical device test lab, and our engineering team."
        keywords="about varsaka labs, software testing team hyderabad, quality engineering lab, human software testing, playwright cypress experts"
      />

      {/* 🚀 Hero Section with Real Human Photography */}
      <section className="about-hero">
        <div className="about-container">
          <div className="section-tag fade-in">
            <span className="about-pulse-dot"></span>
            Architects of Software Reliability
          </div>
          <h1 className="about-title fade-in">
            Crafted by Engineers.<br />
            <span>Dedicated to Flawless Software.</span>
          </h1>
          <p className="about-sub fade-in">
            Headquartered in the tech corridors of Hyderabad and partnering with product teams globally, 
            Varsaka Labs blends deep human engineering intuition with rigorous automation to deliver software you can ship with absolute certainty.
          </p>

          <div className="about-stats">
            {stats.map((s, i) => (
              <div key={i} className="stat-card fade-in">
                <span className="stat-icon-mini">{s.icon}</span>
                <span className="stat-number">{s.number}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* 📸 Editorial Hero Image Showcase */}
          <div className="about-hero-image-wrap fade-in">
            <div className="about-hero-image-frame">
              <img 
                src="/images/team_whiteboard_architecture.jpg" 
                alt="Varsaka Labs Quality Engineering team collaborating around test architecture whiteboard" 
                className="about-hero-img"
                loading="eager"
              />
              <div className="about-hero-caption-card">
                <div className="caption-tag">● Hyderabad Studio Lab</div>
                <div className="caption-text">Sprint QA Architecture & Matrix Validation Session</div>
                <div className="caption-sub">Every release undergoes collaborative architectural review before test harness deployment.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Our Human Philosophy Section */}
      <section className="about-section bg-white">
        <div className="about-container">
          <div className="about-section-grid">
            <div className="about-content fade-in">
              <div className="section-tag">💡 Why Human-Made QA Matters</div>
              <h2>Software is built for humans - it should be verified by humans who care.</h2>
              <p>
                In an era flooded with generic AI tools and brittle boilerplate scripts, software quality has often been reduced to checking superficial boxes. At Varsaka Labs, we believe that true quality assurance is an art form of defensive engineering.
              </p>
              <p>
                While automated suites give us velocity and continuous regression coverage, human curiosity is what catches catastrophic multi-step flaws: the obscure payment state that fails on iOS Safari in low battery mode, the concurrent inventory race condition, or the subtle accessibility breakdown.
              </p>
              <div className="quote-callout">
                <p>
                  "We don't merely report bugs; we analyze why they occurred, model the user impact, and help your developers prevent them from ever recurring."
                </p>
                <div className="quote-author">- The Varsaka Quality Collective</div>
              </div>
            </div>

            <div className="about-image-feature fade-in">
              <div className="about-feature-card">
                <img 
                  src="/images/exploratory_testing_desk.jpg" 
                  alt="Engineer conducting thoughtful exploratory testing on iPad Pro and DevTools" 
                  className="about-feature-img"
                />
                <div className="feature-overlay-badge">
                  <span className="badge-icon">🔍</span>
                  <div>
                    <strong>Human Exploratory Testing</strong>
                    <span>Real-world user context & behavioral testing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 👥 Meet the Team / Engineering Collective */}
      <section className="about-section bg-soft">
        <div className="about-container">
          <div className="section-header-center fade-in">
            <div className="section-tag">👥 The Engineering Collective</div>
            <h2>Meet the Minds Guarding Your Code</h2>
            <p className="about-sub">
              Passionate quality engineers, automation architects, and security analysts working together under one roof.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, idx) => (
              <div key={idx} className="team-card fade-in">
                <div className="team-image-box">
                  <img src={member.image} alt={member.role} className="team-img" />
                  <span className="team-badge">{member.badge}</span>
                </div>
                <div className="team-details">
                  <h3>{member.role}</h3>
                  <div className="team-specialty">{member.specialty}</div>
                  <p>{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔬 Inside Our Physical Device & Automation Lab */}
      <section className="about-section bg-white">
        <div className="about-container">
          <div className="about-section-grid reverse">
            <div className="about-image-feature fade-in">
              <div className="about-feature-card">
                <img 
                  src="/images/qa_device_lab.jpg" 
                  alt="Varsaka Labs physical test bench with live smartphones, tablets, and test log notes" 
                  className="about-feature-img"
                />
                <div className="feature-overlay-badge bottom-right">
                  <span className="badge-icon">📱</span>
                  <div>
                    <strong>Physical Device Testing Bench</strong>
                    <span>Tested on genuine iOS & Android hardware</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-content fade-in">
              <div className="section-tag">🔬 Inside the Lab</div>
              <h2>Real Hardware. Real Networks. Zero Emulation Illusions.</h2>
              <p>
                Emulators are great for basic linting, but end-users don't use emulators. They hold real phones on 4G networks while walking through subway stations or running multiple background apps.
              </p>
              <p>
                In our dedicated test lab, we execute test plans across actual hardware: high-refresh rate displays, varying screen notch geometries, thermal throttling tests, and memory-constrained devices.
              </p>
              <ul className="lab-feature-list">
                <li>
                  <i className="fa-solid fa-check-circle"></i>
                  <span><strong>Multi-OS Matrix:</strong> iOS 16–18, Android 11–15, iPadOS, macOS, Windows 11</span>
                </li>
                <li>
                  <i className="fa-solid fa-check-circle"></i>
                  <span><strong>Network Condition Simulation:</strong> High-latency 3G, packet-loss, offline-first sync</span>
                </li>
                <li>
                  <i className="fa-solid fa-check-circle"></i>
                  <span><strong>Battery & Thermal Profiling:</strong> Preventing client drain and background execution leaks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 Core Pillars Section */}
      <section className="about-section bg-soft">
        <div className="about-container">
          <div className="section-header-center fade-in">
            <div className="section-tag">💎 Our Principles</div>
            <h2>The Four Pillars of Varsaka Quality</h2>
            <p className="about-sub">Standards we uphold on every test case, commit, and client deployment.</p>
          </div>

          <div className="pillars-grid">
            {pillars.map((p, i) => (
              <div key={i} className="pillar-card fade-in">
                <div className="pillar-header">
                  <span className="pillar-num">{p.num}</span>
                  <span className="pillar-tag">{p.tag}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div className="about-cta-card fade-in">
            <div className="about-cta-content">
              <h3>Ready to partner with real quality engineers?</h3>
              <p>Schedule a 30-minute discovery session with our engineering leads. We'll audit your current QA bottlenecks at no cost.</p>
            </div>
            <div className="about-cta-actions">
              <a href="/#contact" className="btn-primary">
                Speak With An Engineer <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
