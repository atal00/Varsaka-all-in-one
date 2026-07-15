import { useEffect } from 'react';
import SEO from '../components/SEO';
import './About.css';

function useFadeIn() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 100);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function About() {
  useFadeIn();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const stats = [
    { number: '25+', label: 'Global Clients', icon: '🌍' },
    { number: '5x', label: 'Fast Bug Detection', icon: '🔍' },
    { number: '24/7', label: 'Support Coverage', icon: '🛡️' },
    { number: '99%', label: 'Client Satisfaction', icon: '⭐' }
  ];

  const values = [
    {
      title: 'Radical Transparency',
      desc: 'You always know what we\'re testing, why we\'re testing it, and exactly what we found. No hidden bugs, no technical jargon.',
      icon: 'fa-eye'
    },
    {
      title: 'True Partnership',
      desc: 'We don\'t just "check boxes". We think like your product owners and users to ensure your software actually solves problems.',
      icon: 'fa-handshake'
    },
    {
      title: 'Velocity with Precision',
      desc: 'We move fast to match your sprint cycles, but we never cut corners. Our tests are thorough, repeatable, and rock-solid.',
      icon: 'fa-bolt'
    }
  ];

  return (
    <div className="about-page">
      <SEO 
        title="About Us | Our Mission & Values"
        description="Learn about Varsaka Labs, India's leading software testing company. Discover our mission, core values, and why we are the trusted QA partner for global tech teams."
        keywords="about varsaka labs, software testing experts, Hyderabad QA company, our mission and values, quality engineering team"
      />
      {/* 🚀 Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <div className="section-tag fade-in">🏢 Who We Are</div>
          <h1 className="about-title fade-in">
            We are <span>Varsaka Labs</span>.<br />
            Architects of Quality.
          </h1>
          <p className="about-sub fade-in">
            Headquartered in Hyderabad and serving clients globally, we are a team of passionate engineers 
            dedicated to making software better - one test at a time.
          </p>

          <div className="about-stats">
            {stats.map((s, i) => (
              <div key={i} className="stat-card fade-in">
                <span className="stat-number">{s.number}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛠️ Our Mission Section */}
      <section className="about-section bg-white">
        <div className="about-container">
          <div className="about-section-grid">
            <div className="about-content fade-in">
              <div className="section-tag">🎯 Our Mission</div>
              <h2>Building Trust in Technology</h2>
              <p>
                Our mission is simple: To be the most trusted QA partner for technology teams across India and beyond. 
                We deliver honest, thorough, and friendly quality engineering that helps products ship with total confidence.
              </p>
              <p>
                In a world where software is everything, we ensure that yours is the very best it can be.
              </p>
            </div>
            <div className="about-image fade-in">
              <div className="about-image-card">
                <i className="fa-solid fa-shield-halved" style={{ fontSize: '120px', color: 'var(--blue-mid)', display: 'block', margin: '0 auto', filter: 'drop-shadow(0 10px 15px rgba(37,99,235,0.2))' }}></i>
                <h3>Reliable. Scalable. Secure.</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 Core Values Section */}
      <section className="about-section bg-soft">
        <div className="about-container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="fade-in">
            <div className="section-tag">💎 Core Values</div>
            <h2>What Drives Us</h2>
            <p className="about-sub">Our values aren't just posters on a wall. They are the principles we live by every single day.</p>
          </div>

          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card fade-in">
                <div className="value-icon">
                  <i className={`fa-solid ${v.icon}`}></i>
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

