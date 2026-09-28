import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import defaultBlogImg from '../../assets/ai_testing_future.png';
import '../../pages/Blog.css';

const ACCENT_MAP = {
  neutral: { border: '#cbd5e1', bg: '#f8fafc', color: '#334155' },
  blue: { border: '#2563eb', bg: 'rgba(37, 99, 235, 0.04)', color: '#1e40af' },
  red: { border: '#dc2626', bg: '#fef2f2', color: '#991b1b' },
  green: { border: '#16a34a', bg: '#f0fdf4', color: '#166534' },
  orange: { border: '#d97706', bg: '#fffbeb', color: '#92400e' },
  purple: { border: '#9333ea', bg: '#faf5ff', color: '#6b21a8' }
};

export default function BlogDetailRenderer({ post, isPreview = false, showBackBtn = true }) {
  if (!post) return null;

  const sanitizeHtml = (html) => {
    return DOMPurify.sanitize(html || '', {
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed']
    });
  };

  const hasDynamicSections = Array.isArray(post.sections) && post.sections.length > 0;
  const tagList = Array.isArray(post.tags) 
    ? post.tags 
    : (post.tag ? post.tag.split(',').map(t => t.trim()).filter(Boolean) : []);

  return (
    <div className="blog-detail-page">
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
          👁️ LIVE PREVIEW MODE &bull; Matching Public Website Renderer 1:1 ({post.status === 'draft' ? 'Draft' : 'Published'})
        </div>
      )}

      <div id="reading-progress" className="reading-progress-bar"></div>
      
      {/* 🚀 Article Header Hero Banner */}
      <div className="blog-detail-header-img" style={{ height: '420px', overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
        <img 
          src={post.image || defaultBlogImg} 
          alt={post.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 60%)' }}></div>
      </div>

      <div className="blog-hero" style={{ paddingBottom: '1.5rem', paddingTop: '3rem' }}>
        <div className="blog-container" style={{ textAlign: 'center' }}>
          <div className="section-tag" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            {post.category || post.tag || 'Quality Engineering'}
          </div>
          <h1 className="blog-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', maxWidth: '950px', margin: '0.75rem auto 1.5rem', lineHeight: 1.25 }}>
            {post.title}
          </h1>

          {/* 👤 Author Byline & Article Metadata */}
          <div className="blog-author-bar">
            <div className="author-avatar-circle">
              {post.author ? post.author.charAt(0).toUpperCase() : 'V'}
            </div>
            <div className="author-info-text">
              <span className="author-name-title">{post.author || 'Varsaka Engineering Team'}</span>
              <span className="author-role-sub">{post.author_role || 'Quality Engineering & Security Practice'}</span>
              <div className="author-meta-details">
                <span><i className="fa-regular fa-calendar"></i> {post.date}</span>
                <span>•</span>
                <span><i className="fa-regular fa-clock"></i> {post.read_time || '8 min read'}</span>
                <span>•</span>
                <span><i className="fa-solid fa-shield-halved"></i> Engineering Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="blog-container">
        {/* 📌 Executive Summary / Excerpt Callout */}
        {post.summary && (
          <div style={{
            maxWidth: '850px',
            margin: '0 auto 2.5rem',
            padding: '1.25rem 1.75rem',
            background: 'rgba(37, 99, 235, 0.03)',
            borderLeft: '4px solid #2563eb',
            borderRadius: '0 12px 12px 0',
            fontSize: '1.12rem',
            lineHeight: '1.8',
            color: 'var(--text, #1e293b)',
            fontStyle: 'normal'
          }}>
            <strong>Overview:</strong> {post.summary}
          </div>
        )}

        {/* 📖 Sanitize and render Article Body */}
        <div className="prose-block" style={{ marginTop: 0, boxShadow: 'none', border: 'none', background: 'transparent', padding: '0 4%' }}>
          {hasDynamicSections ? (
            <div className="blog-full-content">
              {post.sections.map((sec, sIdx) => {
                const accent = ACCENT_MAP[sec.accent || 'blue'] || ACCENT_MAP.blue;
                return (
                  <section key={sec.id || sIdx} style={{ marginBottom: '2.5rem' }}>
                    {sec.title && (
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text, #1e293b)', marginBottom: '0.75rem' }}>
                        {sec.title}
                      </h2>
                    )}
                    {sec.subtitle && (
                      <p style={{ fontSize: '1.05rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1rem' }}>
                        {sec.subtitle}
                      </p>
                    )}

                    {sec.content && (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(sec.content) }} />
                    )}

                    {/* Section Image */}
                    {sec.image && (
                      <figure style={{ margin: '2rem 0', textAlign: 'center' }}>
                        <img 
                          src={sec.image} 
                          alt={sec.alt || sec.title || 'Article Illustration'} 
                          style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                        />
                        {sec.caption && (
                          <figcaption style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            {sec.caption}
                          </figcaption>
                        )}
                      </figure>
                    )}

                    {/* Section Callout */}
                    {sec.callout && (
                      <div style={{
                        margin: '1.75rem 0',
                        padding: '1.25rem 1.75rem',
                        background: accent.bg,
                        borderLeft: `4px solid ${accent.border}`,
                        borderRadius: '0 10px 10px 0'
                      }}>
                        {sec.callout.title && (
                          <strong style={{ color: accent.color, display: 'block', marginBottom: '4px', fontSize: '1.05rem' }}>
                            {sec.callout.title}
                          </strong>
                        )}
                        <p style={{ margin: 0, color: '#1e293b', lineHeight: '1.7' }}>
                          {sec.callout.text || sec.callout}
                        </p>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <div 
              className="blog-full-content" 
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || '<p>Content coming soon.</p>') }} 
            />
          )}

          {/* Tags Footer */}
          {tagList.length > 0 && (
            <div style={{ maxWidth: '850px', margin: '3rem auto 1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tagList.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 🔙 Back to All Blogs CTA */}
        {showBackBtn && (
          <div className="back-btn-container" style={{ textAlign: 'center', marginTop: '3.5rem', marginBottom: '4rem' }}>
            {isPreview ? (
              <div className="back-to-listing-btn" style={{ opacity: 0.8, cursor: 'default' }}>
                <i className="fa-solid fa-arrow-left back-arrow-icon" aria-hidden="true"></i>
                <span>Back to All Blogs (Preview)</span>
              </div>
            ) : (
              <Link to="/blog" className="back-to-listing-btn" aria-label="Back to All Blogs">
                <i className="fa-solid fa-arrow-left back-arrow-icon" aria-hidden="true"></i>
                <span>Back to All Blogs</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
