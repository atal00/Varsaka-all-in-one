import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { caseStudiesData } from '../data/caseStudiesData';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';
import defaultHeroImg from '../assets/automation_makeover.png';
import CaseStudyDetailRenderer from '../components/cms/CaseStudyDetailRenderer';
import './CaseStudies.css'; 

export default function CaseStudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    const fetchStudy = async () => {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let query = supabase.from('case_studies').select('*').eq('status', 'published');
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('slug', id);
        }
        
        const { data, error } = await query.maybeSingle();

        if (error) {
          console.warn('DB error fetching case study, using static fallback:', error.message);
          const local = caseStudiesData.find(s => s.id === id || s.slug === id);
          if (local) {
            setStudy(local);
          } else {
            navigate('/case-studies');
          }
        } else if (data) {
          // Parse sections
          let parsedSections = [];
          if (Array.isArray(data.sections) && data.sections.length > 0) {
            parsedSections = data.sections;
          } else if (typeof data.sections === 'string' && data.sections.trim()) {
            try {
              parsedSections = JSON.parse(data.sections);
            } catch (e) {
              parsedSections = [];
            }
          }

          // Normalize record
          setStudy({
            id: data.id,
            slug: data.slug || data.id,
            client: data.client,
            title: data.title || `${data.client} Quality Engineering Transformation`,
            industry: data.industry || 'Technology / Enterprise Software',
            tag: data.tag || 'Quality Engineering',
            icon: data.icon || 'fa-chart-line',
            outcome: data.outcome || 'Quality & Stability Objectives Met',
            image: data.image || defaultHeroImg,
            logo: data.logo,
            engagement: data.engagement || 'End-to-End QA Audit',
            verification: data.verification || '✓ Verified Results',
            business_context: data.business_context || '',
            challenge: data.challenge || '',
            objectives: data.objectives || '',
            approach: data.approach || '',
            technologies: data.technologies ? (Array.isArray(data.technologies) ? data.technologies : data.technologies.split(',').map(t => t.trim()).filter(Boolean)) : [],
            description: data.description || '',
            results: data.results || '',
            metrics_verified: data.metrics_verified || '',
            lessons_learned: data.lessons_learned || '',
            seo_title: data.seo_title || `${data.client} Case Study | Varsaka Labs`,
            seo_description: data.seo_description || data.outcome,
            sections: parsedSections
          });
        } else {
          const local = caseStudiesData.find(s => s.id === id);
          if (local) {
            setStudy(local);
          } else {
            navigate('/case-studies');
          }
        }
      } catch (err) {
        console.warn('Network exception fetching case study, using fallback:', err);
        const local = caseStudiesData.find(s => s.id === id);
        if (local) {
          setStudy(local);
        } else {
          navigate('/case-studies');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [id, navigate]);

  if (loading) {
    return <div style={{textAlign: 'center', padding: '10rem', color: '#64748b'}}>Loading case study...</div>;
  }
  if (!study) return null;

  return (
    <div className="case-detail-page">
      <SEO 
        title={study.seo_title || `${study.client} Case Study | Varsaka Labs`}
        description={study.seo_description || study.outcome}
        keywords={`${study.tag}, software testing case study, ${study.client}, quality engineering`}
        image={study.image}
      />

      {/* Render via unified CaseStudyDetailRenderer with dynamic section and legacy fallback support */}
      <CaseStudyDetailRenderer study={study} showBackBtn={false} />

      {/* 🔙 Back to All Case Studies CTA */}
      <div className="back-btn-container" style={{ maxWidth: '960px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
        <Link to="/case-studies" className="back-to-listing-btn" aria-label="Back to All Case Studies">
          <i className="fa-solid fa-arrow-left back-arrow-icon" aria-hidden="true"></i>
          <span>Back to All Case Studies</span>
        </Link>
      </div>
    </div>
  );
}
