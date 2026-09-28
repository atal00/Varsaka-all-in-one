import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import defaultHeroImg from '../../assets/automation_makeover.png';
import '../../pages/CaseStudies.css';

const ACCENT_STYLES = {
  neutral: { borderLeft: '4px solid #cbd5e1', badgeBg: '#f1f5f9', badgeColor: '#334155' },
  blue: { borderLeft: '4px solid #3b82f6', badgeBg: '#eff6ff', badgeColor: '#1d4ed8' },
  red: { borderLeft: '4px solid #ef4444', badgeBg: '#fef2f2', badgeColor: '#b91c1c' },
  green: { borderLeft: '4px solid #22c55e', badgeBg: '#f0fdf4', badgeColor: '#15803d' },
  orange: { borderLeft: '4px solid #f59e0b', badgeBg: '#fffbeb', badgeColor: '#b45309' },
  purple: { borderLeft: '4px solid #a855f7', badgeBg: '#faf5ff', badgeColor: '#7e22ce' }
};

export default function CaseStudyDetailRenderer({ study, isPreview = false, showBackBtn = true }) {
  if (!study) return null;

  const sanitizeHtml = (html) => {
    return DOMPurify.sanitize(html || '', {
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed']
    });
  };

  const hasDynamicSections = Array.isArray(study.sections) && study.sections.length > 0;

  // Normalize icon class
  const getIconClass = (iconStr, fallback = 'fa-chart-line') => {
    const raw = iconStr || fallback;
    if (raw.startsWith('fa-')) return `fa-solid ${raw}`;
    return raw;
  };

  return (
    <div className="case-detail-page">
      {isPreview && (
        <div style={{
          background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
          color: '#ffffff',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          👁️ LIVE PREVIEW MODE &bull; Matching Public Website Renderer 1:1 ({study.status === 'draft' ? 'Draft' : 'Published'})
        </div>
      )}

      {/* 🚀 Hero Banner */}
      <div className="case-detail-header-img">
        <img 
          src={study.image || defaultHeroImg} 
          alt={study.client || 'Case Study Cover'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%)' }}></div>
      </div>

      <div className="case-hero" style={{ paddingBottom: '1.5rem', paddingTop: '3rem' }}>
        <div className="case-container" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <i className={getIconClass(study.icon, 'fa-chart-line')}></i> {study.tag || 'Quality Engineering'}
          </div>
          <h1 className="blog-title" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', maxWidth: '950px', margin: '0.75rem auto 1rem', lineHeight: 1.25 }}>
            {study.title || `${study.client} Quality Engineering Transformation`}
          </h1>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '1.5rem' }}>
            Client: <strong>{study.client || 'Enterprise Client'}</strong>
          </p>

          {study.outcome && (
            <div className="case-outcome" style={{ justifyContent: 'center', fontSize: '1.15rem' }}>
              <i className="fa-solid fa-circle-check"></i>
              <span>{study.outcome}</span>
            </div>
          )}

          {/* 📊 Project Metadata Strip */}
          <div className="case-meta-strip">
            <div className="meta-stat-item">
              <span className="meta-stat-label">Industry</span>
              <span className="meta-stat-value">{study.industry || 'Technology / Enterprise Software'}</span>
            </div>
            <div className="meta-stat-item">
              <span className="meta-stat-label">Engagement</span>
              <span className="meta-stat-value">{study.engagement || 'End-to-End QA Audit'}</span>
            </div>
            <div className="meta-stat-item">
              <span className="meta-stat-label">Domain</span>
              <span className="meta-stat-value">{study.tag || 'Quality Engineering'}</span>
            </div>
            <div className="meta-stat-item">
              <span className="meta-stat-label">Audit Verification</span>
              <span className="meta-stat-value" style={{ color: '#16a34a' }}>
                {study.verification || '✓ Verified Results'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="case-story-container">
        {/* Dynamic Sections Mode */}
        {hasDynamicSections ? (
          study.sections.map((section, idx) => {
            const accent = ACCENT_STYLES[section.accent || 'neutral'] || ACCENT_STYLES.neutral;
            const iconClass = getIconClass(section.icon, 'fa-circle-dot');

            // Parse technologies if string or array
            const techList = Array.isArray(section.technologies) 
              ? section.technologies 
              : (section.technologies ? section.technologies.split(',').map(t => t.trim()).filter(Boolean) : []);

            // Parse objectives if string or array
            const objList = Array.isArray(section.objectives)
              ? section.objectives
              : (section.objectives ? section.objectives.split('\n').map(o => o.trim()).filter(Boolean) : []);

            // Parse metrics if string or array of objects
            const metricsList = Array.isArray(section.metrics) ? section.metrics : [];

            return (
              <div 
                key={section.id || idx} 
                className="case-section-block"
                style={{ borderLeft: accent.borderLeft, marginBottom: '2.5rem' }}
              >
                <h3 className="case-section-title">
                  <div className="case-badge-icon" style={{ background: accent.badgeBg, color: accent.badgeColor }}>
                    <i className={iconClass}></i>
                  </div>
                  {section.title}
                </h3>

                {section.subtitle && (
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '-0.35rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                    {section.subtitle}
                  </p>
                )}

                {/* Primary Content Text / HTML */}
                {section.content && (
                  <div 
                    className="case-section-text blog-full-content"
                    style={{ margin: '0.75rem 0', maxWidth: '100%', textAlign: 'left' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
                  />
                )}

                {/* Objectives Checklist */}
                {objList.length > 0 && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0' }}>
                    <strong style={{ color: accent.badgeColor, display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                      <i className="fa-solid fa-bullseye"></i> Engagement Objectives:
                    </strong>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#334155', lineHeight: '1.7' }}>
                      {objList.map((obj, oIdx) => (
                        <li key={oIdx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies Grid */}
                {techList.length > 0 && (
                  <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e40af', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <i className="fa-solid fa-screwdriver-wrench"></i> Technologies, Frameworks & Tooling:
                    </strong>
                    <div className="tech-tags-grid">
                      {techList.map((t, tIdx) => (
                        <span key={tIdx} className="tech-tag-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Metrics Banner */}
                {metricsList.length > 0 && (
                  <div className="verified-metrics-banner" style={{ marginTop: '1.5rem' }}>
                    <h4><i className="fa-solid fa-chart-line"></i> Confirmed Quality Metrics</h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '12px',
                      marginTop: '12px'
                    }}>
                      {metricsList.map((m, mIdx) => (
                        <div key={mIdx} style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#047857', textTransform: 'uppercase' }}>
                            {m.label}
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#065f46', margin: '4px 0' }}>
                            {m.value}
                          </div>
                          {m.description && (
                            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
                              {m.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy text metrics fallback if present on section */}
                {section.metrics_verified && metricsList.length === 0 && (
                  <div className="verified-metrics-banner" style={{ marginTop: '1.25rem' }}>
                    <h4><i className="fa-solid fa-chart-line"></i> Confirmed Quality Metrics</h4>
                    <p style={{ margin: 0, color: '#065f46', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {section.metrics_verified}
                    </p>
                  </div>
                )}

                {/* Optional Highlight / Callout Box */}
                {section.callout && (
                  <div style={{
                    margin: '1.5rem 0',
                    padding: '1.25rem 1.5rem',
                    background: accent.badgeBg,
                    borderLeft: `4px solid ${accent.badgeColor}`,
                    borderRadius: '0 8px 8px 0'
                  }}>
                    {section.callout.title && (
                      <strong style={{ color: accent.badgeColor, display: 'block', marginBottom: '4px' }}>
                        {section.callout.title}
                      </strong>
                    )}
                    <p style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {section.callout.text || section.callout}
                    </p>
                  </div>
                )}

                {/* Section Image with optional caption */}
                {section.image && (
                  <figure style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                    <img 
                      src={section.image} 
                      alt={section.alt || section.title} 
                      style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                    />
                    {section.caption && (
                      <figcaption style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        {section.caption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Lessons Learned Card */}
                {section.lessons_learned && (
                  <div className="lessons-learned-box" style={{ marginTop: '1.5rem' }}>
                    <h4><i className="fa-solid fa-graduation-cap"></i> Lessons Learned & Architectural Takeaways</h4>
                    <p style={{ margin: 0, color: '#334155', fontSize: '0.98rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {section.lessons_learned}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Legacy Static Sections Fallback */
          <>
            {/* 🏢 Business Context & Overview */}
            {study.business_context && (
              <div className="case-section-block">
                <h3 className="case-section-title">
                  <div className="case-badge-icon" style={{ background: '#f1f5f9', color: '#334155' }}>
                    <i className="fa-solid fa-building"></i>
                  </div>
                  Business Context & Platform Background
                </h3>
                <p className="case-section-text">{study.business_context}</p>
              </div>
            )}

            {/* ⚠️ The Challenge */}
            {study.challenge && (
              <div className="case-section-block challenge-block">
                <h3 className="case-section-title">
                  <div className="case-badge-icon">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  The Engineering Challenge
                </h3>
                <p className="case-section-text">{study.challenge}</p>
                {study.objectives && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed #fee2e2' }}>
                    <strong style={{ color: '#991b1b', display: 'block', marginBottom: '0.5rem' }}>
                      <i className="fa-solid fa-bullseye"></i> Engagement Objectives:
                    </strong>
                    <p className="case-section-text" style={{ margin: 0 }}>{study.objectives}</p>
                  </div>
                )}
              </div>
            )}

            {/* 🛠️ The Solution & Approach */}
            {(study.approach || study.description) && (
              <div className="case-section-block solution-block">
                <h3 className="case-section-title">
                  <div className="case-badge-icon">
                    <i className="fa-solid fa-compass-drafting"></i>
                  </div>
                  Our Technical Approach & Strategy
                </h3>
                {study.approach && <p className="case-section-text">{study.approach}</p>}

                {/* Technologies Grid */}
                {Array.isArray(study.technologies) && study.technologies.length > 0 && (
                  <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <strong style={{ color: '#1e40af', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <i className="fa-solid fa-screwdriver-wrench"></i> Technologies, Frameworks & Tooling:
                    </strong>
                    <div className="tech-tags-grid">
                      {study.technologies.map((t, idx) => (
                        <span key={idx} className="tech-tag-pill">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Rich Content Story */}
                {study.description && (
                  <div 
                    className="blog-full-content" 
                    style={{ margin: '1.5rem 0 0', maxWidth: '100%', textAlign: 'left' }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(study.description) }} 
                  />
                )}
              </div>
            )}

            {/* ✅ Verified Results & Engineering Outcomes */}
            {(study.metrics_verified || study.results) && (
              <div className="case-section-block results-block">
                <h3 className="case-section-title">
                  <div className="case-badge-icon">
                    <i className="fa-solid fa-square-check"></i>
                  </div>
                  Verified Outcomes & Engineering Impact
                </h3>

                {/* Verified Metrics Callout Banner */}
                {study.metrics_verified && (
                  <div className="verified-metrics-banner">
                    <h4><i className="fa-solid fa-chart-line"></i> Confirmed Quality Metrics</h4>
                    <p style={{ margin: 0, color: '#065f46', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {study.metrics_verified}
                    </p>
                  </div>
                )}

                {study.results && <p className="case-section-text">{study.results}</p>}

                {/* Lessons Learned */}
                {study.lessons_learned && (
                  <div className="lessons-learned-box">
                    <h4><i className="fa-solid fa-graduation-cap"></i> Lessons Learned & Architectural Takeaways</h4>
                    <p style={{ margin: 0, color: '#334155', fontSize: '0.98rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {study.lessons_learned}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 🔙 Back to All Case Studies CTA */}
        {showBackBtn && (
          <div className="back-btn-container">
            {isPreview ? (
              <div className="back-to-listing-btn" style={{ opacity: 0.8, cursor: 'default' }}>
                <i className="fa-solid fa-arrow-left back-arrow-icon" aria-hidden="true"></i>
                <span>Back to All Case Studies (Preview)</span>
              </div>
            ) : (
              <Link to="/case-studies" className="back-to-listing-btn" aria-label="Back to All Case Studies">
                <i className="fa-solid fa-arrow-left back-arrow-icon" aria-hidden="true"></i>
                <span>Back to All Case Studies</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
