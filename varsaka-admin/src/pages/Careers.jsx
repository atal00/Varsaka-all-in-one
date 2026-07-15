import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Careers.css';

function useFadeIn() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    }, 100);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, []);
}

const isDeadlinePassed = (closesStr) => {
  if (!closesStr) return false;
  const deadline = new Date(closesStr);
  deadline.setHours(23, 59, 59, 999);
  return new Date() > deadline;
};

const jobs = [
  {
    icon: '🎓',
    title: '2026 Cohort Internship Program',
    location: 'Remote / Hybrid (SF / Bangalore)',
    type: 'Internship',
    exp: 'Students / Grads',
    tags: ['Tech', 'HR', 'Finance', 'Design', 'Management'],
    desc: 'Join our intensive 12-week program. Open to all disciplines (Tech, HR, Finance, Design, Marketing, and Operations). Work on real projects, receive 1-on-1 mentorship, and accelerate your career.',
    posted: '2 Jun 2026',
    closes: '30 Jun 2026',
    applyLink: '/apply?role=General+Application',
  },
  {
    icon: '🤖',
    title: 'Senior QA Automation Engineer',
    location: 'Hyderabad (Hybrid)',
    type: 'Full-Time',
    exp: '3+ Years',
    tags: ['Selenium', 'Playwright', 'Cypress', 'CI/CD'],
    desc: 'Lead the design and implementation of end-to-end automation frameworks. You\'ll own the test architecture, mentor junior engineers, and work closely with dev teams to shift quality left.',
    posted: '1 May 2026',
    closes: '31 May 2026',
    applyLink: '/apply?role=Senior+QA+Automation+Engineer',
  },
  {
    icon: '⚡',
    title: 'Performance Test Engineer',
    location: 'Remote',
    type: 'Full-Time',
    exp: '2+ Years',
    tags: ['JMeter', 'k6', 'Gatling', 'Cloud'],
    desc: 'Design and execute load, stress, and soak tests for high-traffic applications. You\'ll identify bottlenecks, build perf dashboards, and work with DevOps to integrate tests into pipelines.',
    posted: '1 May 2026',
    closes: '31 May 2026',
    applyLink: '/apply?role=Performance+Test+Engineer',
  },
  {
    icon: '👥',
    title: 'HR Generalist / Talent Acquisition',
    location: 'Hyderabad',
    type: 'Full-Time',
    exp: '2+ Years',
    tags: ['Recruitment', 'Onboarding', 'HR Operations', 'Culture'],
    desc: 'Lead our recruitment efforts and help build a world-class team culture. You\'ll manage the end-to-end hiring process, from sourcing candidates to onboarding new team members.',
    posted: '10 May 2026',
    closes: '10 Jun 2026',
    applyLink: '/apply?role=HR+Generalist',
  },
  {
    icon: '🧪',
    title: 'QA Engineer - Manual & Exploratory',
    location: 'Hyderabad',
    type: 'Full-Time / Intern',
    exp: '0-2 Years',
    tags: ['Test Cases', 'Bug Reporting', 'Jira', 'Agile'],
    desc: 'Join our QA team to write detailed test cases, perform exploratory testing, and help maintain quality across multiple client projects. Great entry point for freshers who are passionate about quality.',
    posted: '8 May 2026',
    closes: '8 Jun 2026',
    applyLink: '/apply?role=QA+Engineer+Manual',
  },
];

const perks = [
  { icon: '🏠', title: 'Flexible Work', desc: 'Hybrid and remote options available depending on the role.' },
  { icon: '📈', title: 'Fast Growth', desc: 'Small team, big impact - your work directly shapes the company.' },
  { icon: '🎓', title: 'Learning Budget', desc: 'Certifications, courses, and conferences supported.' },
  { icon: '💰', title: 'Competitive Pay', desc: 'Market-aligned salaries with performance reviews every 6 months.' },
  { icon: '🤝', title: 'Great Culture', desc: 'No politics, no micromanagement - just good people doing good work.' },
  { icon: '🌍', title: 'Global Exposure', desc: 'Work on products used across India, Southeast Asia, and the Middle East.' },
];

export default function Careers() {
  useFadeIn();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="page-wrapper">

      {/* HERO */}
      <section className="careers-hero">
        <div className="careers-hero-bg" />
        <div className="careers-hero-content">
          <div className="section-tag" style={{ margin: '0 auto 1.5rem' }}>💼 We're Hiring</div>
          <h1 className="careers-hero-title">Build Your Career at<br /><span className="careers-highlight">Varsaka Labs</span></h1>
          <p className="careers-hero-sub">Join a team of passionate engineers who care deeply about software quality. We move fast, learn constantly, and support each other.</p>
          <div className="careers-hero-stats">
            {[['🌍', 'Remote Friendly'], ['⚡', 'Fast-Moving Team'], ['🎯', 'Impactful Work']].map(([icon, label]) => (
              <div key={label} className="careers-stat-chip">
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPEN ROLES */}
      <section className="careers-roles-section">
        <div className="section-head center fade-in">
          <div className="section-tag">🚀 Open Positions</div>
          <h2 className="section-title">Find Your Role</h2>
          <p className="section-sub">We're a small but growing team. Every hire matters - and so does every project.</p>
        </div>

        <div className="jobs-grid">
          {jobs.map(j => (
            <div key={j.title} className="job-card fade-in">
              <div className="job-card-top">
                <div className="job-icon">{j.icon}</div>
                <div className="job-badges">
                  <span className="job-badge job-badge--type">{j.type}</span>
                  <span className="job-badge job-badge--exp">{j.exp}</span>
                </div>
              </div>

              <h3 className="job-title">{j.title}</h3>
              <div className="job-location">📍 {j.location}</div>
              <p className="job-desc">{j.desc}</p>

              <div className="job-tags">
                {j.tags.map(t => (
                  <span key={t} className="job-tag">{t}</span>
                ))}
              </div>

              <div className="job-dates">
                <span className="job-date-item">📅 Posted: <strong>{j.posted}</strong></span>
                <span className="job-date-sep">·</span>
                <span className="job-date-item job-date-closes">
                  ⏳ Application Deadline: <strong style={isDeadlinePassed(j.closes) ? { color: '#ef4444' } : {}}>{j.closes}{isDeadlinePassed(j.closes) && ' (Passed)'}</strong>
                </span>
              </div>

              {!isDeadlinePassed(j.closes) && (
                <Link to={j.applyLink} className="job-apply-btn">
                  Apply Now <span className="job-apply-arrow"><i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="careers-perks-section">
        <div className="section-head center fade-in">
          <div className="section-tag">❤️ Why Varsaka</div>
          <h2 className="section-title">Why Engineers Love Working Here</h2>
          <p className="section-sub">We've built a culture where great people do their best work.</p>
        </div>
        <div className="perks-grid">
          {perks.map(p => (
            <div key={p.title} className="perk-card fade-in">
              <div className="perk-icon">{p.icon}</div>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
