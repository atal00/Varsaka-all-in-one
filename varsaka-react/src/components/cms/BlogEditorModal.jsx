import React, { useState, useEffect } from 'react';
import ImageUploadField from '../ImageUploadField';
import RichContentEditor from '../RichContentEditor';
import AccentColorPicker from './AccentColorPicker';
import BlogDetailRenderer from './BlogDetailRenderer';
import ConfirmDialog from '../ui/ConfirmDialog';

const DEFAULT_BLOG_SECTIONS = [
  {
    id: 'sec_intro',
    title: 'Introduction & Core Premises',
    subtitle: 'Setting the architectural baseline',
    accent: 'blue',
    content: '<p>Every enterprise faces a trade-off between deployment velocity and comprehensive verification. In this technical deep-dive, we explore sustainable patterns for quality engineering.</p>',
    image: '',
    caption: '',
    alt: '',
    callout: null
  },
  {
    id: 'sec_analysis',
    title: 'Root Cause Analysis: Why Traditional Approaches Break',
    subtitle: 'Examining failure modes in modern pipelines',
    accent: 'red',
    content: '<p>Fragile UI tests, environment drift, and unmocked third-party APIs create flakiness that erodes developer confidence.</p>',
    image: '',
    caption: '',
    alt: '',
    callout: {
      title: 'Key Takeaway',
      text: 'Shift-left quality does not mean writing more tests; it means writing the right tests at the appropriate layer of the test pyramid.'
    }
  },
  {
    id: 'sec_strategy',
    title: 'A Sustainable Architecture for Enterprise Scale',
    subtitle: 'Practical patterns and implementation guidelines',
    accent: 'green',
    content: '<p>By isolating deterministic business logic through contract and component tests, end-to-end suites can focus strictly on high-value user workflows.</p>',
    image: '',
    caption: '',
    alt: '',
    callout: null
  },
  {
    id: 'sec_conclusion',
    title: 'Conclusion & Recommendations',
    subtitle: 'Actionable steps for engineering leadership',
    accent: 'purple',
    content: '<p>Quality must be treated as an architectural feature rather than a post-development verification step.</p>',
    image: '',
    caption: '',
    alt: '',
    callout: null
  }
];

export default function BlogEditorModal({
  isOpen,
  data = null,
  onClose,
  onSave,
  onDelete
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [contentMode, setContentMode] = useState('sections'); // 'sections' or 'full'
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    category: 'Quality Engineering',
    tag: 'Technology',
    tags: ['Quality Engineering', 'Automation', 'DevOps'],
    author: 'Varsaka Engineering Team',
    author_role: 'Quality Engineering & Security Practice',
    date: new Date().toISOString().split('T')[0],
    read_time: '8 min read',
    status: 'draft',
    summary: '',
    content: '',
    image: '',
    thumbnail: '',
    is_featured: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    sections: []
  });

  const [newTagInput, setNewTagInput] = useState('');
  const [editingSection, setEditingSection] = useState(null);
  const [formError, setFormError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDestructive: true,
    action: null
  });

  useEffect(() => {
    if (data) {
      // Parse sections if existing
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

      // If no sections stored, initialize default sections or leave empty if content exists
      if (parsedSections.length === 0) {
        if (data.content && data.content.trim()) {
          // Keep existing content in full mode
          parsedSections = [];
          setContentMode('full');
        } else {
          parsedSections = JSON.parse(JSON.stringify(DEFAULT_BLOG_SECTIONS));
          setContentMode('sections');
        }
      } else {
        setContentMode('sections');
      }

      // Parse tags
      let parsedTags = [];
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        parsedTags = data.tags;
      } else if (data.tag) {
        parsedTags = data.tag.split(',').map(t => t.trim()).filter(Boolean);
      }

      setFormData({
        id: data.id || '',
        title: data.title || '',
        slug: data.slug || '',
        category: data.category || data.tag || 'Quality Engineering',
        tag: data.tag || 'Technology',
        tags: parsedTags.length > 0 ? parsedTags : ['Quality Engineering', 'Security'],
        author: data.author || 'Varsaka Engineering Team',
        author_role: data.author_role || 'Quality Engineering & Security Practice',
        date: data.date ? (typeof data.date === 'string' ? data.date.split('T')[0] : data.date) : new Date().toISOString().split('T')[0],
        read_time: data.read_time || '8 min read',
        status: data.status || 'draft',
        summary: data.summary || '',
        content: data.content || '',
        image: data.image || '',
        thumbnail: data.thumbnail || data.image || '',
        is_featured: Boolean(data.is_featured),
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || '',
        canonical_url: data.canonical_url || '',
        og_title: data.og_title || '',
        og_description: data.og_description || '',
        og_image: data.og_image || '',
        sections: parsedSections
      });
    } else {
      // New Blog Post
      setFormData({
        id: '',
        title: '',
        slug: '',
        category: 'Quality Engineering',
        tag: 'DevSecOps',
        tags: ['Quality Engineering', 'Automation', 'DevSecOps'],
        author: 'Varsaka Engineering Team',
        author_role: 'Quality Engineering & Security Practice',
        date: new Date().toISOString().split('T')[0],
        read_time: '6 min read',
        status: 'draft',
        summary: '',
        content: '',
        image: '',
        thumbnail: '',
        is_featured: false,
        seo_title: '',
        seo_description: '',
        seo_keywords: 'software testing, quality engineering, automation',
        canonical_url: '',
        og_title: '',
        og_description: '',
        og_image: '',
        sections: JSON.parse(JSON.stringify(DEFAULT_BLOG_SECTIONS))
      });
      setContentMode('sections');
    }
    setIsDirty(false);
    setActiveTab('basic');
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'title') {
        if (!prev.slug) {
          next.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (!prev.seo_title) {
          next.seo_title = `${val} | Varsaka Labs`;
        }
        if (!prev.og_title) {
          next.og_title = val;
        }
      }
      if (field === 'summary') {
        if (!prev.seo_description) {
          next.seo_description = val;
        }
        if (!prev.og_description) {
          next.og_description = val;
        }
      }
      return next;
    });
    setIsDirty(true);
  };

  // Section Ordering and Management
  const handleMoveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.sections.length) return;
    const updated = [...formData.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFormData(prev => ({ ...prev, sections: updated }));
    setIsDirty(true);
  };

  const handleAddSection = () => {
    const newSec = {
      id: `sec_${Date.now()}`,
      title: 'New Article Section',
      subtitle: 'Section subheading',
      accent: 'blue',
      content: '<p>Write detailed technical analysis, code explanations, or architectural recommendations.</p>',
      image: '',
      caption: '',
      alt: '',
      callout: null
    };
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
    setEditingSection(newSec);
    setIsDirty(true);
  };

  const handleDeleteSection = (secId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Section?',
      description: 'Are you sure you want to remove this article section? All section content will be discarded.',
      confirmLabel: 'Delete Section',
      cancelLabel: 'Cancel',
      isDestructive: true,
      action: () => {
        setFormData(prev => ({
          ...prev,
          sections: prev.sections.filter(s => s.id !== secId)
        }));
        if (editingSection?.id === secId) setEditingSection(null);
        setIsDirty(true);
      }
    });
  };

  const handleDuplicateSection = (sec) => {
    const dupe = {
      ...sec,
      id: `sec_${Date.now()}`,
      title: `${sec.title} (Copy)`
    };
    setFormData(prev => ({ ...prev, sections: [...prev.sections, dupe] }));
    setIsDirty(true);
  };

  const handleUpdateSection = (updatedSec) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === updatedSec.id ? updatedSec : s)
    }));
    setEditingSection(updatedSec);
    setIsDirty(true);
  };

  // Auto-calculate read time from content and sections
  const calculateReadTime = () => {
    let fullText = formData.summary || '';
    if (formData.sections && formData.sections.length > 0) {
      fullText += ' ' + formData.sections.map(s => `${s.title} ${s.subtitle || ''} ${s.content || ''}`).join(' ');
    } else if (formData.content) {
      fullText += ' ' + formData.content;
    }
    const cleanText = fullText.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    handleChange('read_time', `${mins} min read`);
  };

  const handleClose = () => {
    if (isDirty) {
      setConfirmDialog({
        isOpen: true,
        title: 'Discard Unsaved Changes?',
        description: 'You have unsaved edits in this article. Are you sure you want to leave without saving?',
        confirmLabel: 'Discard Changes',
        cancelLabel: 'Keep Editing',
        isDestructive: true,
        action: () => onClose()
      });
      return;
    }
    onClose();
  };

  const handleSubmit = async (targetStatus) => {
    setFormError(null);
    if (!formData.title.trim()) {
      setFormError('Blog Title is required.');
      setActiveTab('basic');
      return;
    }

    // Build synthesized full HTML content from sections if in section mode
    let compiledContent = formData.content;
    if (contentMode === 'sections' && formData.sections.length > 0) {
      compiledContent = formData.sections.map(s => {
        let block = `<h2>${s.title}</h2>`;
        if (s.subtitle) block += `<p class="subtitle"><em>${s.subtitle}</em></p>`;
        if (s.content) block += s.content;
        if (s.image) {
          block += `<figure><img src="${s.image}" alt="${s.alt || s.title}" />${s.caption ? `<figcaption>${s.caption}</figcaption>` : ''}</figure>`;
        }
        if (s.callout) {
          block += `<blockquote class="callout-box"><strong>${s.callout.title || 'Note'}:</strong> ${s.callout.text || s.callout}</blockquote>`;
        }
        return block;
      }).join('\n\n');
    }

    setSaving(true);
    try {
      const finalPayload = {
        ...formData,
        status: targetStatus || formData.status,
        content: compiledContent,
        tag: (formData.tags || []).join(', '),
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      // Strip empty id so database generates a new UUID
      if (!finalPayload.id || typeof finalPayload.id !== 'string' || !finalPayload.id.trim()) {
        delete finalPayload.id;
      }

      await onSave(finalPayload);
      setIsDirty(false);
      onClose();
    } catch (err) {
      console.error('Save blog error:', err);
      setFormError('Unable to save article. Please verify the required fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="custom-modal-overlay" style={{ zIndex: 1000, overflowY: 'auto', padding: '2rem 1rem' }}>
      <div
        className="custom-modal-box"
        style={{
          maxWidth: activeTab === 'preview' ? '1200px' : '960px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✍️</span> {formData.id ? 'Edit Blog Article CMS' : 'Create Blog Article'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Structured content builder with sections, callouts, author byline, and live public preview.
            </p>
          </div>
          <button className="close-x" onClick={handleClose} type="button">✕</button>
        </div>

        {formError && (
          <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#b91c1c', padding: '10px 1.75rem', fontSize: '0.88rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {formError}</span>
            <button type="button" onClick={() => setFormError(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 1rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'basic', label: '📌 Basic Info' },
            { id: 'media', label: '🖼️ Hero & Cover' },
            { id: 'content', label: `🏗️ Content & Sections (${formData.sections.length})` },
            { id: 'tags', label: '🏷️ Tags' },
            { id: 'seo', label: '🔍 SEO & Social' },
            { id: 'preview', label: '👁️ Live Preview' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, background: activeTab === 'preview' ? '#f8fafc' : '#ffffff' }}>

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="modern-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="modern-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Enter a compelling technical article title"
                  required
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  URL Slug
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.slug}
                  onChange={e => handleChange('slug', e.target.value)}
                  placeholder="e.g., security-mistakes-startups-make"
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  className="modern-input"
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                >
                  <option value="Quality Engineering">Quality Engineering</option>
                  <option value="Security Testing">Security Testing</option>
                  <option value="QA Automation">QA Automation</option>
                  <option value="Performance Engineering">Performance Engineering</option>
                  <option value="AI-Powered Testing">AI-Powered Testing</option>
                  <option value="DevSecOps">DevSecOps</option>
                  <option value="Leadership & Best Practices">Leadership & Best Practices</option>
                </select>
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Author Name
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.author}
                  onChange={e => handleChange('author', e.target.value)}
                  placeholder="e.g., Varsaka Engineering Team, Dr. Jane Smith"
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Author Role / Title
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.author_role}
                  onChange={e => handleChange('author_role', e.target.value)}
                  placeholder="e.g., Principal QA Architect, Security Lead"
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Publish Date
                </label>
                <input
                  type="date"
                  className="modern-input"
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                />
              </div>

              <div className="modern-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                    Reading Time
                  </label>
                  <button
                    type="button"
                    onClick={calculateReadTime}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ⚡ Auto-Calculate
                  </button>
                </div>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.read_time}
                  onChange={e => handleChange('read_time', e.target.value)}
                  placeholder="e.g., 8 min read"
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Publishing Status
                </label>
                <select
                  className="modern-input"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="published">✨ Published (Live on Public Website)</option>
                  <option value="draft">📝 Draft (Private / Hidden from Public)</option>
                </select>
              </div>

              <div className="modern-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Executive Summary / Overview Callout
                </label>
                <textarea
                  className="modern-input modern-textarea"
                  rows="3"
                  value={formData.summary}
                  onChange={e => handleChange('summary', e.target.value)}
                  placeholder="Brief 2-3 sentence overview that appears on blog cards and in the article header callout..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: HERO & COVER */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <ImageUploadField
                label="Featured Hero Image (Header Banner)"
                bucketFolder="blogs"
                value={formData.image}
                onChange={url => handleChange('image', url)}
                helpText="Landscape cover image (Recommended: 1200×630 or 1920×1080 WEBP/PNG)"
              />

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <ImageUploadField
                  label="Thumbnail Image (Optional for compact cards)"
                  bucketFolder="blogs"
                  value={formData.thumbnail}
                  onChange={url => handleChange('thumbnail', url)}
                  helpText="Square or compact 600×400 preview image"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT & SECTIONS */}
          {activeTab === 'content' && (
            <div>
              {/* Mode Switcher */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                background: '#f8fafc',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setContentMode('sections')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: contentMode === 'sections' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: contentMode === 'sections' ? '#eff6ff' : '#ffffff',
                      color: contentMode === 'sections' ? '#2563eb' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🏗️ Structured Sections Builder ({formData.sections.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentMode('full')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: contentMode === 'full' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: contentMode === 'full' ? '#eff6ff' : '#ffffff',
                      color: contentMode === 'full' ? '#2563eb' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Full HTML / Markdown Editor
                  </button>
                </div>

                {contentMode === 'sections' && (
                  <button
                    type="button"
                    onClick={handleAddSection}
                    style={{
                      padding: '6px 14px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="fa-solid fa-plus"></i> Add Section
                  </button>
                )}
              </div>

              {/* MODE 1: SECTION BUILDER */}
              {contentMode === 'sections' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.sections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', width: '20px' }}>
                          #{idx + 1}
                        </span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                            {sec.title}
                          </div>
                          {sec.subtitle && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {sec.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, -1)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.4 : 1
                          }}
                        >
                          <i className="fa-solid fa-arrow-up"></i>
                        </button>
                        <button
                          type="button"
                          disabled={idx === formData.sections.length - 1}
                          onClick={() => handleMoveSection(idx, 1)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: idx === formData.sections.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === formData.sections.length - 1 ? 0.4 : 1
                          }}
                        >
                          <i className="fa-solid fa-arrow-down"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSection(sec)}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            color: '#2563eb',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateSection(sec)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa-solid fa-clone"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec.id)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.sections.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                      <p style={{ color: '#64748b', marginBottom: '1rem' }}>No sections added yet.</p>
                      <button
                        type="button"
                        onClick={handleAddSection}
                        style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        + Add First Section
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: FULL CONTENT EDITOR */}
              {contentMode === 'full' && (
                <div>
                  <RichContentEditor
                    label="Complete Article Body (HTML Formatted)"
                    value={formData.content}
                    onChange={val => handleChange('content', val)}
                    placeholder="Write or paste complete article HTML or markdown..."
                    minHeight="380px"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TAGS */}
          {activeTab === 'tags' && (
            <div style={{ maxWidth: '640px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                Article Topics & Hashtags
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.25rem' }}>
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: '100px',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.tags.filter((_, i) => i !== idx);
                        handleChange('tags', updated);
                      }}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="modern-input"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  placeholder="e.g., Automation, Playwright, API Testing..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTagInput.trim() && !formData.tags.includes(newTagInput.trim())) {
                        handleChange('tags', [...formData.tags, newTagInput.trim()]);
                        setNewTagInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTagInput.trim() && !formData.tags.includes(newTagInput.trim())) {
                      handleChange('tags', [...formData.tags, newTagInput.trim()]);
                      setNewTagInput('');
                    }
                  }}
                  style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Add Tag
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SEO & SOCIAL */}
          {activeTab === 'seo' && (
            <div className="modern-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <div className="modern-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.seo_title}
                  onChange={e => handleChange('seo_title', e.target.value)}
                  placeholder="e.g., Security Testing Insights | Varsaka Labs"
                />
              </div>

              <div className="modern-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  SEO Meta Description
                </label>
                <textarea
                  className="modern-input modern-textarea"
                  rows="3"
                  value={formData.seo_description}
                  onChange={e => handleChange('seo_description', e.target.value)}
                  placeholder="Compelling 150-160 character description..."
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Canonical URL
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.canonical_url}
                  onChange={e => handleChange('canonical_url', e.target.value)}
                  placeholder="https://blog.varsaka.com/..."
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  OpenGraph (OG) Title
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.og_title}
                  onChange={e => handleChange('og_title', e.target.value)}
                  placeholder="Social preview headline"
                />
              </div>

              {/* Google Snippet Simulation */}
              <div style={{
                gridColumn: 'span 2',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1.25rem'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                  GOOGLE SEARCH SNIPPET PREVIEW
                </div>
                <div style={{ fontSize: '0.85rem', color: '#202124' }}>
                  blog.varsaka.com &rsaquo; {formData.slug || 'slug'}
                </div>
                <div style={{ fontSize: '1.15rem', color: '#1a0dab', textDecoration: 'underline', margin: '3px 0' }}>
                  {formData.seo_title || formData.title || 'Blog Post Title'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4d5156', lineHeight: '1.4' }}>
                  {formData.seo_description || formData.summary || 'Read comprehensive engineering perspectives on quality automation and security.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <BlogDetailRenderer post={formData} isPreview={true} />
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div>
            {formData.id && onDelete && (
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: 'Delete Blog Article?',
                    description: `Permanently delete "${formData.title || 'this article'}"? This action cannot be undone.`,
                    confirmLabel: 'Delete Article',
                    cancelLabel: 'Cancel',
                    isDestructive: true,
                    action: () => onDelete(formData.id)
                  });
                }}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete Post
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'content' : 'preview')}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#1e293b',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-eye"></i> {activeTab === 'preview' ? 'Back to Editor' : 'Live Preview'}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('draft')}
              style={{
                background: '#ffffff',
                border: '1px solid #64748b',
                padding: '8px 16px',
                borderRadius: '8px',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              📝 Save Draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit('published')}
              style={{
                background: '#2563eb',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
              {formData.id ? '💾 Save & Publish' : '✨ Publish Article'}
            </button>
          </div>
        </div>

        {/* 🛠️ INDIVIDUAL BLOG SECTION EDITOR */}
        {editingSection && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                  🛠️ Edit Section: {editingSection.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Section Heading (H2) *
                    </label>
                    <input
                      type="text"
                      className="modern-input"
                      value={editingSection.title}
                      onChange={e => handleUpdateSection({ ...editingSection, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Subtitle / Label (Optional)
                    </label>
                    <input
                      type="text"
                      className="modern-input"
                      value={editingSection.subtitle || ''}
                      onChange={e => handleUpdateSection({ ...editingSection, subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <AccentColorPicker
                  label="Callout & Border Accent"
                  value={editingSection.accent}
                  onChange={accent => handleUpdateSection({ ...editingSection, accent })}
                />

                <RichContentEditor
                  label="Section Rich Text Content"
                  value={editingSection.content}
                  onChange={content => handleUpdateSection({ ...editingSection, content })}
                  placeholder="Write clear, engaging technical analysis and observations..."
                  minHeight="220px"
                />

                {/* Section Image */}
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                    🖼️ Section Illustration (Optional)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Image URL</span>
                      <input
                        type="text"
                        className="modern-input"
                        value={editingSection.image || ''}
                        onChange={e => handleUpdateSection({ ...editingSection, image: e.target.value })}
                        placeholder="https://... or upload in Media tab"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Caption / Subtitle</span>
                      <input
                        type="text"
                        className="modern-input"
                        value={editingSection.caption || ''}
                        onChange={e => handleUpdateSection({ ...editingSection, caption: e.target.value })}
                        placeholder="e.g., Figure 1: CI/CD Pipeline Architecture"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Callout Box */}
                <div style={{ background: '#eff6ff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e40af', display: 'block', marginBottom: '8px' }}>
                    📌 Callout / Highlight Box (Optional)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#1e40af' }}>Callout Title</span>
                      <input
                        type="text"
                        className="modern-input"
                        value={editingSection.callout?.title || ''}
                        onChange={e => handleUpdateSection({
                          ...editingSection,
                          callout: { ...(editingSection.callout || {}), title: e.target.value }
                        })}
                        placeholder="e.g., Pro-Tip, Security Warning"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#1e40af' }}>Callout Text</span>
                      <input
                        type="text"
                        className="modern-input"
                        value={editingSection.callout?.text || (typeof editingSection.callout === 'string' ? editingSection.callout : '')}
                        onChange={e => handleUpdateSection({
                          ...editingSection,
                          callout: { ...(editingSection.callout || {}), text: e.target.value }
                        })}
                        placeholder="Highlighted takeaway message..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Done Editing Section
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={async () => {
          if (confirmDialog.action) {
            await confirmDialog.action();
          }
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
