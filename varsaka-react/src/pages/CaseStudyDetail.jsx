import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { caseStudiesData } from '../data/caseStudiesData';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';
import './CaseStudies.css'; 

export default function CaseStudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const study = caseStudiesData.find(s => s.id === id);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    if (!study) {
      navigate('/case-studies');
    }
  }, [study, navigate]);

  if (!study) return null;

  return (
    <div className="case-detail-page">
      <SEO 
        title={`${study.client} Case Study | Varsaka Labs`}
        description={study.desc}
        keywords={`${study.tag}, software testing case study, ${study.client}`}
      />

      <div className="case-hero" style={{ paddingBottom: '3rem', paddingTop: '6rem', background: 'var(--bg-white)' }}>
        <div className="case-container" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`fa-solid ${study.icon}`} style={{ marginRight: '8px' }}></i> {study.tag}
          </div>
          <h1 className="blog-title" style={{ fontSize: '3rem', maxWidth: '900px', margin: '0 auto 1.5rem' }}>{study.client}</h1>
          <div className="case-outcome" style={{ justifyContent: 'center', fontSize: '1.2rem', color: 'var(--brand-blue)' }}>
            <i className="fa-solid fa-circle-check" style={{ marginTop: '4px', marginRight: '6px' }}></i>
            <span>{study.outcome}</span>
          </div>
        </div>
      </div>

      <div className="case-container" style={{ maxWidth: '800px', margin: '0 auto 4rem' }}>
        <div className="prose-block" style={{ padding: '0', border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <div className="blog-full-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(study.content) }} />
          
          <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '2rem' }}>
            <Link to="/case-studies" className="read-more" style={{ display: 'inline-flex', fontSize: '1.1rem', fontWeight: 600, color: 'var(--brand-blue)', textDecoration: 'none' }}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i> Back to Case Studies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
