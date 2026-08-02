import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseStudiesData as studies } from '../data/caseStudiesData';
import SEO from '../components/SEO';
import './CaseStudies.css';

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
            <div key={i} className="case-card fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="case-icon">
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <span className="case-tag">{s.tag}</span>
              <h3>{s.client}</h3>
              <div className="case-outcome">
                <i className="fa-solid fa-circle-check" style={{ marginTop: '4px' }}></i>
                <span>{s.outcome}</span>
              </div>
              <p style={{ flexGrow: 1 }}>{s.desc}</p>
              <Link to={`/case-studies/${s.id}`} className="read-more" style={{ marginTop: '1.5rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'inline-block' }}>
                Read Full Story <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
