import React, { useState, useEffect } from 'react';
import ImageUploadField from '../ImageUploadField';
import RichContentEditor from '../RichContentEditor';
import IconPicker from './IconPicker';
import AccentColorPicker from './AccentColorPicker';
import CaseStudyDetailRenderer from './CaseStudyDetailRenderer';
import ConfirmDialog from '../ui/ConfirmDialog';

const DEFAULT_SECTIONS = [
  {
    id: 'sec_context',
    type: 'context',
    title: 'Business Context & Platform Background',
    subtitle: 'Deployment environment and operational landscape',
    icon: 'fa-building',
    accent: 'neutral',
    content: '<p>Provide detailed background on the client enterprise, architecture challenges, and mission-critical requirements.</p>',
    technologies: [],
    objectives: [],
    metrics: [],
    lessons_learned: '',
    callout: null,
    image: '',
    caption: '',
    alt: ''
  },
  {
    id: 'sec_challenge',
    type: 'challenge',
    title: 'The Engineering Challenge',
    subtitle: 'Core operational and scalability bottlenecks',
    icon: 'fa-triangle-exclamation',
    accent: 'red',
    content: '<p>Describe the specific technical, testing, or security bottlenecks encountered prior to our engagement.</p>',
    technologies: [],
    objectives: [
      'Eliminate high-severity defects prior to production rollout',
      'Reduce regression cycle time while expanding test coverage',
      'Establish reliable automated quality gates in the CI/CD pipeline'
    ],
    metrics: [],
    lessons_learned: '',
    callout: null,
    image: '',
    caption: '',
    alt: ''
  },
  {
    id: 'sec_approach',
    type: 'approach',
    title: 'Our Technical Approach & Strategy',
    subtitle: 'Architectural methodology and test automation engineering',
    icon: 'fa-compass-drafting',
    accent: 'blue',
    content: '<p>Detail the customized testing framework, automation architecture, and tooling strategy implemented.</p>',
    technologies: ['Cypress', 'Playwright', 'TypeScript', 'GitHub Actions', 'Docker', 'k6'],
    objectives: [],
    metrics: [],
    lessons_learned: '',
    callout: {
      title: 'Shift-Left Quality Architecture',
      text: 'Automated test suites were embedded directly into the developer workflow, triggering instant feedback upon pull request creation.'
    },
    image: '',
    caption: '',
    alt: ''
  },
  {
    id: 'sec_results',
    type: 'results',
    title: 'Verified Outcomes & Engineering Impact',
    subtitle: 'Quantifiable metrics and business reliability gains',
    icon: 'fa-square-check',
    accent: 'green',
    content: '<p>Document the tangible ROI, stability enhancements, and operational velocity achieved through this transformation.</p>',
    technologies: [],
    objectives: [],
    metrics: [
      { label: 'Defect Escape Rate', value: '< 0.2%', description: 'Critical production bugs reduced to near zero' },
      { label: 'Regression Cycle', value: '4 Hours', description: 'Down from 2 full days of manual validation' },
      { label: 'Test Coverage', value: '94% Core Flows', description: 'Complete coverage of mission-critical customer journeys' }
    ],
    lessons_learned: '',
    callout: null,
    image: '',
    caption: '',
    alt: ''
  },
  {
    id: 'sec_lessons',
    type: 'lessons',
    title: 'Lessons Learned & Architectural Takeaways',
    subtitle: 'Best practices for sustainable test engineering',
    icon: 'fa-graduation-cap',
    accent: 'purple',
    content: '',
    technologies: [],
    objectives: [],
    metrics: [],
    lessons_learned: '1. Modular Page Object Models (POM) significantly reduce maintenance overhead when UI components change.\n2. Running end-to-end regression suites in parallelized container pods cuts CI execution times by over 70%.\n3. Early contract testing between frontend and backend prevents integration friction during major releases.',
    callout: null,
    image: '',
    caption: '',
    alt: ''
  }
];

export default function CaseStudyEditorModal({
  isOpen,
  data = null,
  onClose,
  onSave,
  onDelete
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    client: '',
    title: '',
    slug: '',
    tag: 'Quality Engineering',
    icon: 'fa-chart-line',
    industry: 'Technology / Enterprise Software',
    engagement: 'End-to-End QA Audit',
    verification: '✓ Verified Results',
    status: 'published',
    description: '',
    outcome: '',
    image: '',
    logo: '',
    seo_title: '',
    seo_description: '',
    sections: []
  });

  // Section Editing Modal / Drawer
  const [editingSection, setEditingSection] = useState(null);
  const [newTechInput, setNewTechInput] = useState('');
  const [newObjInput, setNewObjInput] = useState('');
  const [newMetric, setNewMetric] = useState({ label: '', value: '', description: '' });
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
      // Parse sections if existing, or generate from legacy fields
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

      // If no sections stored yet, initialize from existing legacy fields
      if (parsedSections.length === 0) {
        parsedSections = [
          {
            id: 'sec_context',
            type: 'context',
            title: 'Business Context & Platform Background',
            subtitle: 'Deployment environment and operational landscape',
            icon: 'fa-building',
            accent: 'neutral',
            content: data.business_context ? `<p>${data.business_context}</p>` : DEFAULT_SECTIONS[0].content,
            technologies: [],
            objectives: [],
            metrics: [],
            lessons_learned: '',
            callout: null,
            image: '',
            caption: '',
            alt: ''
          },
          {
            id: 'sec_challenge',
            type: 'challenge',
            title: 'The Engineering Challenge',
            subtitle: 'Core operational and scalability bottlenecks',
            icon: 'fa-triangle-exclamation',
            accent: 'red',
            content: data.challenge ? `<p>${data.challenge}</p>` : DEFAULT_SECTIONS[1].content,
            technologies: [],
            objectives: data.objectives ? data.objectives.split('\n').filter(Boolean) : DEFAULT_SECTIONS[1].objectives,
            metrics: [],
            lessons_learned: '',
            callout: null,
            image: '',
            caption: '',
            alt: ''
          },
          {
            id: 'sec_approach',
            type: 'approach',
            title: 'Our Technical Approach & Strategy',
            subtitle: 'Architectural methodology and test automation engineering',
            icon: 'fa-compass-drafting',
            accent: 'blue',
            content: data.description || (data.approach ? `<p>${data.approach}</p>` : DEFAULT_SECTIONS[2].content),
            technologies: data.technologies ? (Array.isArray(data.technologies) ? data.technologies : data.technologies.split(',').map(t => t.trim()).filter(Boolean)) : DEFAULT_SECTIONS[2].technologies,
            objectives: [],
            metrics: [],
            lessons_learned: '',
            callout: null,
            image: '',
            caption: '',
            alt: ''
          },
          {
            id: 'sec_results',
            type: 'results',
            title: 'Verified Outcomes & Engineering Impact',
            subtitle: 'Quantifiable metrics and business reliability gains',
            icon: 'fa-square-check',
            accent: 'green',
            content: data.results ? `<p>${data.results}</p>` : DEFAULT_SECTIONS[3].content,
            technologies: [],
            objectives: [],
            metrics: DEFAULT_SECTIONS[3].metrics,
            metrics_verified: data.metrics_verified || '',
            lessons_learned: '',
            callout: null,
            image: '',
            caption: '',
            alt: ''
          },
          {
            id: 'sec_lessons',
            type: 'lessons',
            title: 'Lessons Learned & Architectural Takeaways',
            subtitle: 'Best practices for sustainable test engineering',
            icon: 'fa-graduation-cap',
            accent: 'purple',
            content: '',
            technologies: [],
            objectives: [],
            metrics: [],
            lessons_learned: data.lessons_learned || DEFAULT_SECTIONS[4].lessons_learned,
            callout: null,
            image: '',
            caption: '',
            alt: ''
          }
        ];
      }

      setFormData({
        id: data.id || '',
        client: data.client || '',
        title: data.title || '',
        slug: data.slug || '',
        tag: data.tag || 'Quality Engineering',
        icon: data.icon || 'fa-chart-line',
        industry: data.industry || 'Technology / Enterprise Software',
        engagement: data.engagement || 'End-to-End QA Audit',
        verification: data.verification || '✓ Verified Results',
        status: data.status || 'published',
        description: data.description || '',
        outcome: data.outcome || '',
        image: data.image || '',
        logo: data.logo || '',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        sections: parsedSections
      });
    } else {
      // New Case Study template
      setFormData({
        id: '',
        client: '',
        title: '',
        slug: '',
        tag: 'Automation',
        icon: 'fa-chart-line',
        industry: 'B2B SaaS / Enterprise',
        engagement: 'End-to-End QA Audit',
        verification: '✓ Verified Results',
        status: 'published',
        description: '',
        outcome: '',
        image: '',
        logo: '',
        seo_title: '',
        seo_description: '',
        sections: JSON.parse(JSON.stringify(DEFAULT_SECTIONS))
      });
    }
    setIsDirty(false);
    setActiveTab('basic');
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'client' && !prev.slug) {
        next.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (field === 'title' && !prev.seo_title) {
        next.seo_title = `${val} | Varsaka Labs`;
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

  const handleAddCustomSection = () => {
    const newSec = {
      id: `sec_custom_${Date.now()}`,
      type: 'custom',
      title: 'New Custom Section',
      subtitle: 'Additional project insights and engineering details',
      icon: 'fa-layer-group',
      accent: 'blue',
      content: '<p>Add rich technical content, architecture diagrams, or team observations here.</p>',
      technologies: [],
      objectives: [],
      metrics: [],
      lessons_learned: '',
      callout: null,
      image: '',
      caption: '',
      alt: ''
    };
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
    setEditingSection(newSec);
    setIsDirty(true);
  };

  const handleDeleteSection = (secId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Section?',
      description: 'Are you sure you want to remove this section? All section content will be discarded.',
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

  const handleClose = () => {
    if (isDirty) {
      setConfirmDialog({
        isOpen: true,
        title: 'Discard Unsaved Changes?',
        description: 'You have unsaved edits in this case study. Are you sure you want to leave without saving?',
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
    if (!formData.client.trim()) {
      setFormError('Client Name is required.');
      setActiveTab('basic');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Case Study Title is required.');
      setActiveTab('basic');
      return;
    }

    setSaving(true);
    try {
      const finalPayload = {
        ...formData,
        status: targetStatus || formData.status,
        slug: formData.slug || formData.client.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formData.description || formData.outcome || formData.sections.find(s => s.type === 'context')?.content?.replace(/<[^>]*>/g, '') || 'Comprehensive Quality Engineering & Verification',
        // Also sync legacy summary fields for full backward compatibility
        business_context: formData.sections.find(s => s.type === 'context')?.content?.replace(/<[^>]*>/g, '') || '',
        challenge: formData.sections.find(s => s.type === 'challenge')?.content?.replace(/<[^>]*>/g, '') || '',
        approach: formData.sections.find(s => s.type === 'approach')?.content?.replace(/<[^>]*>/g, '') || '',
        results: formData.sections.find(s => s.type === 'results')?.content?.replace(/<[^>]*>/g, '') || '',
        lessons_learned: formData.sections.find(s => s.type === 'lessons')?.lessons_learned || '',
        technologies: (formData.sections.find(s => s.type === 'approach')?.technologies || []).join(', ')
      };

      // Strip empty id so database generates a new UUID
      if (!finalPayload.id || typeof finalPayload.id !== 'string' || !finalPayload.id.trim()) {
        delete finalPayload.id;
      }

      await onSave(finalPayload);
      setIsDirty(false);
      onClose();
    } catch (err) {
      console.error('Save case study error:', err);
      setFormError('Unable to save case study. Please verify the required fields and try again.');
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
              <span>🚀</span> {formData.id ? 'Edit Case Study CMS' : 'Create Case Study'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Full-featured multi-section Case Study CMS matching the public website design.
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

        {/* Tab Navigation Strip */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 1rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'basic', label: '📌 Basic Info' },
            { id: 'media', label: '🖼️ Hero & Media' },
            { id: 'meta', label: '📊 Metadata' },
            { id: 'sections', label: `🏗️ Section Builder (${formData.sections.length})` },
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

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, background: activeTab === 'preview' ? '#f8fafc' : '#ffffff' }}>

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="modern-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.client}
                  onChange={e => handleChange('client', e.target.value)}
                  placeholder="e.g., TakeCare360, RetailEdge India"
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
                  placeholder="e.g., takecare360-qa-transformation"
                />
              </div>

              <div className="modern-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Case Study Title *
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="e.g., AI-Assisted Test Generation and Validation for Mission-Critical Systems"
                  required
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Category Tag
                </label>
                <select
                  className="modern-input"
                  value={formData.tag}
                  onChange={e => handleChange('tag', e.target.value)}
                >
                  <option value="Performance Testing">Performance Testing</option>
                  <option value="Automation">Automation</option>
                  <option value="Security Testing">Security Testing</option>
                  <option value="AI-Powered Testing">AI-Powered Testing</option>
                  <option value="Functional Testing">Functional Testing</option>
                  <option value="Performance & Security">Performance & Security</option>
                  <option value="Quality Engineering">Quality Engineering</option>
                </select>
              </div>

              <div className="modern-form-group">
                <IconPicker
                  label="Category Icon"
                  value={formData.icon}
                  onChange={icon => handleChange('icon', icon)}
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Industry
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.industry}
                  onChange={e => handleChange('industry', e.target.value)}
                  placeholder="e.g., FinTech / Manufacturing, HealthTech, B2B SaaS"
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
                  <option value="published">✨ Published (Visible on Public Website)</option>
                  <option value="draft">📝 Draft (Private / Hidden from Public)</option>
                </select>
              </div>

              <div className="modern-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Short Description
                </label>
                <textarea
                  className="modern-input modern-textarea"
                  rows="2"
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Concise overview of the client engagement and testing objective..."
                ></textarea>
              </div>

              <div className="modern-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Short Key Outcome (Highlight Card Summary)
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.outcome}
                  onChange={e => handleChange('outcome', e.target.value)}
                  placeholder="e.g., 12 Critical Vulnerabilities Resolved Prior to Production Launch"
                />
              </div>
            </div>
          )}

          {/* TAB 2: HERO & MEDIA */}
          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <ImageUploadField
                label="Featured Hero Image (Header Cover Banner)"
                bucketFolder="case-studies"
                value={formData.image}
                onChange={url => handleChange('image', url)}
                helpText="High-resolution banner (Recommended: 1920×1080 or 1200×600 WEBP/PNG)"
              />

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <ImageUploadField
                  label="Client / Partner Logo (Optional)"
                  bucketFolder="case-studies"
                  value={formData.logo}
                  onChange={url => handleChange('logo', url)}
                  helpText="Transparent PNG or SVG logo for client attribution"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT METADATA */}
          {activeTab === 'meta' && (
            <div className="modern-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Industry Sector
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.industry}
                  onChange={e => handleChange('industry', e.target.value)}
                  placeholder="e.g., Healthcare & MedTech, E-Commerce Retail, FinTech"
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Engagement Type
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.engagement}
                  onChange={e => handleChange('engagement', e.target.value)}
                  placeholder="e.g., End-to-End QA Audit, Continuous Automation, Pen Testing"
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Domain / Category
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.tag}
                  onChange={e => handleChange('tag', e.target.value)}
                  placeholder="e.g., Automation & Performance"
                />
              </div>

              <div className="modern-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Audit Verification Status
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={formData.verification}
                  onChange={e => handleChange('verification', e.target.value)}
                  placeholder="e.g., ✓ Verified Results, ✓ Production Certified"
                />
              </div>

              <div style={{ gridColumn: 'span 2', background: '#eff6ff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <strong style={{ color: '#1e40af', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                  ℹ️ Public Metadata Strip Preview
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                  These values are displayed prominently right under the hero title in the 4-box project metadata strip.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SECTION BUILDER */}
          {activeTab === 'sections' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                    Case Study Sections
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Reorder, customize, and add custom sections. The order here matches the public website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomSection}
                  style={{
                    padding: '8px 16px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
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
              </div>

              {/* Sections List */}
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
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', width: '20px' }}>
                        #{idx + 1}
                      </span>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        <i className={`fa-solid ${sec.icon || 'fa-circle-dot'}`}></i>
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                          {sec.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Type: <code>{sec.type}</code> &bull; Accent: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{sec.accent || 'neutral'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        title="Move Up"
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
                        title="Move Down"
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
                        title="Duplicate Section"
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
                        title="Delete Section"
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
                  placeholder="e.g., TakeCare360 Case Study | Varsaka Labs"
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
                  placeholder="Compelling overview for search engines and social sharing..."
                />
              </div>

              {/* Google Search Snippet Simulation */}
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
                  varsaka.com &rsaquo; case-studies &rsaquo; {formData.slug || 'slug'}
                </div>
                <div style={{ fontSize: '1.15rem', color: '#1a0dab', textDecoration: 'underline', margin: '3px 0' }}>
                  {formData.seo_title || formData.title || 'Case Study Title'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4d5156', lineHeight: '1.4' }}>
                  {formData.seo_description || formData.outcome || 'Discover how Varsaka delivered mission-critical test engineering and verification.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <CaseStudyDetailRenderer study={formData} isPreview={true} />
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
                    title: 'Delete Case Study?',
                    description: `Permanently delete case study for "${formData.client || 'this client'}"? This action cannot be undone.`,
                    confirmLabel: 'Delete Case Study',
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
                🗑️ Delete Study
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
              onClick={() => setActiveTab(activeTab === 'preview' ? 'sections' : 'preview')}
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
              {formData.id ? '💾 Save & Publish' : '✨ Publish Case Study'}
            </button>
          </div>
        </div>

        {/* 🛠️ INDIVIDUAL SECTION EDITOR DRAWER / POPUP */}
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
                      Section Heading *
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
                      Subtitle / Label
                    </label>
                    <input
                      type="text"
                      className="modern-input"
                      value={editingSection.subtitle || ''}
                      onChange={e => handleUpdateSection({ ...editingSection, subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <IconPicker
                    label="Section Icon"
                    value={editingSection.icon}
                    onChange={icon => handleUpdateSection({ ...editingSection, icon })}
                  />

                  <AccentColorPicker
                    label="Left Border & Badge Accent"
                    value={editingSection.accent}
                    onChange={accent => handleUpdateSection({ ...editingSection, accent })}
                  />
                </div>

                {/* Rich Content Editor for Section Text */}
                <RichContentEditor
                  label="Section Rich Text Content"
                  value={editingSection.content}
                  onChange={content => handleUpdateSection({ ...editingSection, content })}
                  placeholder="Write clear, engaging technical analysis and observations..."
                  minHeight="220px"
                />

                {/* Repeatable Objectives List */}
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                    🎯 Repeatable Objectives / Key Focus Points
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                    {(editingSection.objectives || []).map((obj, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#2563eb' }}>&bull;</span>
                        <input
                          type="text"
                          className="modern-input"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                          value={obj}
                          onChange={e => {
                            const updated = [...(editingSection.objectives || [])];
                            updated[oIdx] = e.target.value;
                            handleUpdateSection({ ...editingSection, objectives: updated });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingSection.objectives.filter((_, idx) => idx !== oIdx);
                            handleUpdateSection({ ...editingSection, objectives: updated });
                          }}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="modern-input"
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={newObjInput}
                      onChange={e => setNewObjInput(e.target.value)}
                      placeholder="Add a new objective..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newObjInput.trim()) {
                            handleUpdateSection({
                              ...editingSection,
                              objectives: [...(editingSection.objectives || []), newObjInput.trim()]
                            });
                            setNewObjInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newObjInput.trim()) {
                          handleUpdateSection({
                            ...editingSection,
                            objectives: [...(editingSection.objectives || []), newObjInput.trim()]
                          });
                          setNewObjInput('');
                        }
                      }}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Repeatable Technologies Grid */}
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                    🔧 Technologies & Tools Tags
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {(editingSection.technologies || []).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          background: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingSection.technologies.filter((_, idx) => idx !== tIdx);
                            handleUpdateSection({ ...editingSection, technologies: updated });
                          }}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}
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
                      style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      value={newTechInput}
                      onChange={e => setNewTechInput(e.target.value)}
                      placeholder="e.g., Cypress, k6, TypeScript, Docker..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTechInput.trim()) {
                            handleUpdateSection({
                              ...editingSection,
                              technologies: [...(editingSection.technologies || []), newTechInput.trim()]
                            });
                            setNewTechInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTechInput.trim()) {
                          handleUpdateSection({
                            ...editingSection,
                            technologies: [...(editingSection.technologies || []), newTechInput.trim()]
                          });
                          setNewTechInput('');
                        }
                      }}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                {/* Repeatable Confirmed Quality Metrics */}
                <div style={{ background: '#ecfdf5', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#065f46', display: 'block', marginBottom: '8px' }}>
                    📈 Confirmed Quality Metrics Cards
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    {(editingSection.metrics || []).map((m, mIdx) => (
                      <div key={mIdx} style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 12px', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingSection.metrics.filter((_, idx) => idx !== mIdx);
                            handleUpdateSection({ ...editingSection, metrics: updated });
                          }}
                          style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>{m.label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46' }}>{m.value}</div>
                        {m.description && <div style={{ fontSize: '0.8rem', color: '#475569' }}>{m.description}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Add New Metric Form */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '8px', alignItems: 'end' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Label</span>
                      <input
                        type="text"
                        className="modern-input"
                        style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                        value={newMetric.label}
                        onChange={e => setNewMetric(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g., Regression Cycle"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Value</span>
                      <input
                        type="text"
                        className="modern-input"
                        style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                        value={newMetric.value}
                        onChange={e => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="e.g., 2 Days -> 4 Hours"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Description</span>
                      <input
                        type="text"
                        className="modern-input"
                        style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                        value={newMetric.description}
                        onChange={e => setNewMetric(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Execution duration reduced"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (newMetric.label.trim() && newMetric.value.trim()) {
                          handleUpdateSection({
                            ...editingSection,
                            metrics: [...(editingSection.metrics || []), { ...newMetric }]
                          });
                          setNewMetric({ label: '', value: '', description: '' });
                        }
                      }}
                      style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', height: '36px' }}
                    >
                      + Add Metric
                    </button>
                  </div>
                </div>

                {/* Lessons Learned */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    🎓 Lessons Learned & Architectural Takeaways (Optional)
                  </label>
                  <textarea
                    className="modern-input modern-textarea"
                    rows="3"
                    value={editingSection.lessons_learned || ''}
                    onChange={e => handleUpdateSection({ ...editingSection, lessons_learned: e.target.value })}
                    placeholder="Bullet points or key takeaways from this engagement..."
                  />
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
