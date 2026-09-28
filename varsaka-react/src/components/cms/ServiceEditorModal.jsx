import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateServiceSlug, resolveServiceSlug } from '../../utils/serviceSlug';
import ConfirmDialog from '../ui/ConfirmDialog';
import '../../pages/Services.css';

const PRESET_EMOJIS = [
  '🧪', '🤖', '⚡', '🔐', '📱', '☁️', '🛡️', '🎯',
  '🔬', '🌐', '🚀', '💡', '🧠', '📊', '🔍', '⚙️',
  '📈', '🏢', '💻', '🛠️', '📦', '🔒', '👥', '🏆'
];

const DEFAULT_SERVICE_CATEGORIES = [
  'Testing',
  'Automation',
  'Security',
  'Performance',
  'AI & ML',
  'Mobile',
  'Cloud QA',
  'Consulting'
];

export default function ServiceEditorModal({
  isOpen,
  data = null,
  allServices = [],
  onClose,
  onSave,
  onDelete
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Testing',
    status: 'active',
    description: '',
    slug: '',
    icon: '🧪',
    image: '',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_image: '',
    tags: ['Quality Engineering', 'Defect Prevention', 'Test Automation'],
    overview: {
      heading: '',
      subtitle: '',
      content: '',
      highlight_val: '99.4%',
      highlight_label: 'Defect Detection Rate',
      image: ''
    },
    capabilities: [],
    process_steps: [],
    metrics: [],
    sections: [],
    cta: {
      heading: 'Ready for Bug-Free Releases? 🚀',
      description: 'Book a free consultation and let our QA experts review your application. No obligation, just honest advice.',
      primary_text: 'Get Free Consultation',
      primary_url: '/#contact',
      secondary_text: 'Explore Other Services',
      secondary_url: '/#services'
    },
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: ''
  });

  const [newTagInput, setNewTagInput] = useState('');
  const [formError, setFormError] = useState(null);

  // Initialize or reset form state
  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      // Parse tags
      let parsedTags = [];
      if (Array.isArray(data.tags)) {
        parsedTags = data.tags;
      } else if (typeof data.tags === 'string' && data.tags.trim()) {
        try {
          parsedTags = JSON.parse(data.tags);
        } catch {
          parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }

      // Parse capabilities
      let parsedCaps = [];
      if (Array.isArray(data.capabilities)) {
        parsedCaps = data.capabilities;
      } else if (typeof data.capabilities === 'string' && data.capabilities.trim()) {
        try { parsedCaps = JSON.parse(data.capabilities); } catch { parsedCaps = []; }
      }

      // Parse process steps
      let parsedSteps = [];
      if (Array.isArray(data.process_steps)) {
        parsedSteps = data.process_steps;
      } else if (typeof data.process_steps === 'string' && data.process_steps.trim()) {
        try { parsedSteps = JSON.parse(data.process_steps); } catch { parsedSteps = []; }
      }

      // Parse metrics
      let parsedMetrics = [];
      if (Array.isArray(data.metrics)) {
        parsedMetrics = data.metrics;
      } else if (typeof data.metrics === 'string' && data.metrics.trim()) {
        try { parsedMetrics = JSON.parse(data.metrics); } catch { parsedMetrics = []; }
      }

      // Parse additional sections
      let parsedSections = [];
      if (Array.isArray(data.sections)) {
        parsedSections = data.sections;
      } else if (typeof data.sections === 'string' && data.sections.trim()) {
        try { parsedSections = JSON.parse(data.sections); } catch { parsedSections = []; }
      }

      // Parse overview
      let parsedOverview = {
        heading: `What is ${data.name || 'this service'}?`,
        subtitle: 'Enterprise-grade validation engineered for mission-critical software.',
        content: data.description || '',
        highlight_val: '99.4%',
        highlight_label: 'Defect Detection Rate',
        image: ''
      };
      if (data.overview && typeof data.overview === 'object' && !Array.isArray(data.overview)) {
        parsedOverview = { ...parsedOverview, ...data.overview };
      } else if (typeof data.overview === 'string' && data.overview.trim()) {
        try { parsedOverview = { ...parsedOverview, ...JSON.parse(data.overview) }; } catch {}
      }

      // Parse CTA
      let parsedCta = {
        heading: 'Ready for Bug-Free Releases? 🚀',
        description: 'Book a free consultation and let our QA experts review your application. No obligation, just honest advice.',
        primary_text: 'Get Free Consultation',
        primary_url: '/#contact',
        secondary_text: 'Explore Other Services',
        secondary_url: '/#services'
      };
      if (data.cta && typeof data.cta === 'object' && !Array.isArray(data.cta)) {
        parsedCta = { ...parsedCta, ...data.cta };
      } else if (typeof data.cta === 'string' && data.cta.trim()) {
        try { parsedCta = { ...parsedCta, ...JSON.parse(data.cta) }; } catch {}
      }

      // If existing capabilities are empty, provide starter structure
      if (parsedCaps.length === 0) {
        parsedCaps = [
          { icon: '✅', title: 'Comprehensive Validation', desc: 'Validates all user journeys, workflows, and edge conditions.', active: true },
          { icon: '🔁', title: 'Continuous Regression', desc: 'Guarantees releases never break previously deployed features.', active: true },
          { icon: '🌐', title: 'Multi-Environment Audits', desc: 'Validates behavior across browsers, device viewports, and OS layers.', active: true },
          { icon: '📊', title: 'Defect Reporting & Telemetry', desc: 'Actionable reproduction traces, network logs, and severity ratings.', active: true }
        ];
      }

      // If process steps are empty, provide standard 6-stage lifecycle
      if (parsedSteps.length === 0) {
        parsedSteps = [
          { title: 'Requirement & Architecture Analysis', desc: 'Review specs, user stories, and acceptance criteria to define testing perimeter.' },
          { title: 'Test Strategy & Planning', desc: 'Document scope, risks, tooling, timelines, and entry/exit milestones.' },
          { title: 'Test Case Architecture & Scripting', desc: 'Design exhaustive positive, negative, and extreme boundary test suites.' },
          { title: 'Systematic Execution', desc: 'Execute tests across environments capturing detailed logs and reproduction evidence.' },
          { title: 'Defect Triage & Verification', desc: 'Track issues to resolution and re-verify fixes before release.' },
          { title: 'Sign-off & Quality Certification', desc: 'Deliver formal verification metrics and release readiness sign-off.' }
        ];
      }

      setFormData({
        id: data.id || '',
        name: data.name || '',
        category: data.category || 'Testing',
        status: data.status || 'active',
        description: data.description || '',
        slug: data.slug || resolveServiceSlug(data, allServices),
        icon: data.icon || '🧪',
        image: data.image || '',
        hero_title: data.hero_title || data.name || '',
        hero_subtitle: data.hero_subtitle || data.category || '',
        hero_description: data.hero_description || data.description || '',
        hero_image: data.hero_image || '',
        tags: parsedTags.length > 0 ? parsedTags : ['Quality Engineering', 'Defect Prevention'],
        overview: parsedOverview,
        capabilities: parsedCaps,
        process_steps: parsedSteps,
        metrics: parsedMetrics,
        sections: parsedSections,
        cta: parsedCta,
        seo_title: data.seo_title || `${data.name || 'Quality Engineering'} | Varsaka Labs`,
        seo_description: data.seo_description || data.description || '',
        seo_keywords: data.seo_keywords || '',
        og_title: data.og_title || data.hero_title || data.name || '',
        og_description: data.og_description || data.description || '',
        og_image: data.og_image || '',
        canonical_url: data.canonical_url || `https://varsaka.com/services/${data.slug || resolveServiceSlug(data, allServices)}`
      });
    } else {
      // New service defaults
      setFormData({
        id: '',
        name: '',
        category: 'Testing',
        status: 'active',
        description: '',
        slug: '',
        icon: '🧪',
        image: '',
        hero_title: '',
        hero_subtitle: '',
        hero_description: '',
        hero_image: '',
        tags: ['Quality Engineering', 'Defect Prevention', 'Test Automation'],
        overview: {
          heading: 'What is this Service?',
          subtitle: 'Enterprise-grade validation engineered for mission-critical software.',
          content: '',
          highlight_val: '99.4%',
          highlight_label: 'Defect Detection Rate',
          image: ''
        },
        capabilities: [
          { icon: '✅', title: 'Comprehensive Validation', desc: 'Validates all user journeys, workflows, and edge conditions.', active: true },
          { icon: '🔁', title: 'Continuous Regression', desc: 'Guarantees releases never break previously deployed features.', active: true },
          { icon: '🌐', title: 'Multi-Environment Audits', desc: 'Validates behavior across browsers, device viewports, and OS layers.', active: true },
          { icon: '📊', title: 'Defect Reporting & Telemetry', desc: 'Actionable reproduction traces, network logs, and severity ratings.', active: true }
        ],
        process_steps: [
          { title: 'Requirement & Architecture Analysis', desc: 'Review specs, user stories, and acceptance criteria to define testing perimeter.' },
          { title: 'Test Strategy & Planning', desc: 'Document scope, risks, tooling, timelines, and entry/exit milestones.' },
          { title: 'Test Case Architecture & Scripting', desc: 'Design exhaustive positive, negative, and extreme boundary test suites.' },
          { title: 'Systematic Execution', desc: 'Execute tests across environments capturing detailed logs and reproduction evidence.' },
          { title: 'Defect Triage & Verification', desc: 'Track issues to resolution and re-verify fixes before release.' },
          { title: 'Sign-off & Quality Certification', desc: 'Deliver formal verification metrics and release readiness sign-off.' }
        ],
        metrics: [
          { val: '99.4%', label: 'Bug Detection Rate', desc: 'Caught before production', icon: '🎯' },
          { val: '3-5 Days', label: 'Onboarding SLA', desc: 'Rapid sprint integration', icon: '⚡' },
          { val: '100%', label: 'Scope Documented', desc: 'Full requirements traceability', icon: '📋' }
        ],
        sections: [],
        cta: {
          heading: 'Ready for Bug-Free Releases? 🚀',
          description: 'Book a free consultation and let our QA experts review your application. No obligation, just honest advice.',
          primary_text: 'Get Free Consultation',
          primary_url: '/#contact',
          secondary_text: 'Explore Other Services',
          secondary_url: '/#services'
        },
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
        canonical_url: ''
      });
    }

    setActiveTab('basic');
    setIsDirty(false);
  }, [isOpen, data]);

  // Auto-generate slug when name changes (if slug was empty or auto-derived)
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setIsDirty(true);
    setFormData(prev => {
      const generatedSlug = generateServiceSlug(newName);
      const shouldUpdateSlug = !prev.slug || prev.slug === generateServiceSlug(prev.name);
      return {
        ...prev,
        name: newName,
        slug: shouldUpdateSlug ? generatedSlug : prev.slug,
        hero_title: !prev.hero_title || prev.hero_title === prev.name ? newName : prev.hero_title,
        seo_title: !prev.seo_title || prev.seo_title.startsWith(prev.name) ? `${newName} | Varsaka Labs Engineering` : prev.seo_title,
        canonical_url: `https://varsaka.com/services/${shouldUpdateSlug ? generatedSlug : prev.slug}`
      };
    });
  };

  const handleSlugChange = (e) => {
    const raw = e.target.value;
    const clean = generateServiceSlug(raw);
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      slug: clean,
      canonical_url: `https://varsaka.com/services/${clean}`
    }));
  };

  const handleClose = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  // Tag Handlers
  const handleAddTag = (e) => {
    e?.preventDefault();
    const tag = newTagInput.trim();
    if (!tag) return;
    if (formData.tags.includes(tag)) return;
    setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setNewTagInput('');
    setIsDirty(true);
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
    setIsDirty(true);
  };

  const handleMoveTag = (index, direction) => {
    const newTags = [...formData.tags];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newTags.length) return;
    const temp = newTags[index];
    newTags[index] = newTags[targetIdx];
    newTags[targetIdx] = temp;
    setFormData(prev => ({ ...prev, tags: newTags }));
    setIsDirty(true);
  };

  // Capability Handlers
  const handleAddCapability = () => {
    const newCap = {
      icon: '✅',
      title: 'New Capability',
      desc: 'Describe what this feature or capability validates in detail.',
      metric: '',
      supporting_content: '',
      active: true
    };
    setFormData(prev => ({ ...prev, capabilities: [...prev.capabilities, newCap] }));
    setIsDirty(true);
  };

  const handleUpdateCapability = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.capabilities];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, capabilities: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveCapability = (index) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleMoveCapability = (index, direction) => {
    const updated = [...formData.capabilities];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormData(prev => ({ ...prev, capabilities: updated }));
    setIsDirty(true);
  };

  // Process Steps Handlers
  const handleAddStep = () => {
    const newStep = {
      title: 'New Process Stage',
      desc: 'Describe the key actions and deliverables completed during this stage.',
      icon: ''
    };
    setFormData(prev => ({ ...prev, process_steps: [...prev.process_steps, newStep] }));
    setIsDirty(true);
  };

  const handleUpdateStep = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.process_steps];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, process_steps: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      process_steps: prev.process_steps.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleMoveStep = (index, direction) => {
    const updated = [...formData.process_steps];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormData(prev => ({ ...prev, process_steps: updated }));
    setIsDirty(true);
  };

  // Metrics Handlers
  const handleAddMetric = () => {
    const newMetric = {
      val: '99%',
      label: 'Verified Metric',
      desc: 'Short supporting note',
      icon: '📊'
    };
    setFormData(prev => ({ ...prev, metrics: [...prev.metrics, newMetric] }));
    setIsDirty(true);
  };

  const handleUpdateMetric = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.metrics];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, metrics: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveMetric = (index) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // Additional Flexible Sections Handlers
  const handleAddSection = () => {
    const newSec = {
      title: 'Additional Section Title',
      subtitle: 'Optional supporting subtitle',
      content: '<p>Write in-depth technical explanation, architecture diagrams description, or engagement scope details here.</p>',
      image: '',
      icon: '💡',
      active: true
    };
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
    setIsDirty(true);
  };

  const handleUpdateSection = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
    setIsDirty(true);
  };

  const handleRemoveSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  // Save / Publish
  const handleSave = async (targetStatus) => {
    setFormError(null);
    if (!formData.name.trim()) {
      setActiveTab('basic');
      setFormError('Service Name is required.');
      return;
    }
    if (!formData.category.trim()) {
      setActiveTab('basic');
      setFormError('Category is required.');
      return;
    }
    if (!formData.description.trim()) {
      setActiveTab('basic');
      setFormError('Short Description is required.');
      return;
    }

    setSaving(true);
    try {
      const finalSlug = generateServiceSlug(formData.slug || formData.name);

      const finalPayload = {
        ...formData,
        status: targetStatus || formData.status,
        slug: finalSlug,
        hero_title: formData.hero_title || formData.name,
        hero_description: formData.hero_description || formData.description,
        seo_title: formData.seo_title || `${formData.name} | Varsaka Labs Engineering`,
        seo_description: formData.seo_description || formData.description,
        canonical_url: formData.canonical_url || `https://varsaka.com/services/${finalSlug}`
      };

      // Strip empty ID so PostgreSQL assigns UUID on new inserts
      if (!finalPayload.id || typeof finalPayload.id !== 'string' || !finalPayload.id.trim()) {
        delete finalPayload.id;
      }

      await onSave(finalPayload);
      setIsDirty(false);
      onClose();
    } catch (err) {
      console.error('Service save error:', err);
      setFormError('Unable to save service. Please verify required fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="custom-modal-overlay" style={{ zIndex: 1000, overflowY: 'auto', padding: '1.5rem 1rem' }}>
        <div
          className="custom-modal-box"
          style={{
            maxWidth: activeTab === 'preview' ? '1280px' : '1060px',
            width: '96%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: '20px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)'
          }}
        >
          {/* MODAL HEADER */}
          <div style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>{formData.icon || '🧪'}</span>
                <span>{formData.id ? `Edit Service — ${formData.name || 'Untitled'}` : 'Full Service Builder'}</span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  background: formData.status === 'active' ? '#ecfdf5' : '#fffbeb',
                  color: formData.status === 'active' ? '#047857' : '#b45309',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {formData.status}
                </span>
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Structured CMS architecture powering public dynamic <code style={{ color: '#2563eb' }}>/services/{formData.slug || 'slug'}</code>
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: 'all 0.15s'
              }}
            >
              ✕
            </button>
          </div>

          {formError && (
            <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#b91c1c', padding: '10px 1.75rem', fontSize: '0.88rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚠️ {formError}</span>
              <button type="button" onClick={() => setFormError(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
          )}

          {/* TAB NAVIGATION BAR */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '0 1rem',
            overflowX: 'auto',
            gap: '4px'
          }}>
            {[
              { id: 'basic', label: '📌 Basic Info' },
              { id: 'hero', label: '🚀 Hero & Tags' },
              { id: 'overview', label: '📖 Overview' },
              { id: 'capabilities', label: `⚡ Capabilities (${formData.capabilities.length})` },
              { id: 'process', label: `🔄 Process (${formData.process_steps.length})` },
              { id: 'metrics', label: `📊 Metrics (${formData.metrics.length})` },
              { id: 'additional', label: `🧩 Additional (${formData.sections.length})` },
              { id: 'cta', label: '🎯 CTA' },
              { id: 'seo', label: '🔍 SEO' },
              { id: 'preview', label: '👁️ Live Preview' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 14px',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* MODAL BODY (SCROLLABLE) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', background: '#f8fafc' }}>

            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Core Service Details</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Service Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="e.g., AI-Powered Testing"
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Category *
                      </label>
                      <input
                        type="text"
                        list="service-categories"
                        value={formData.category}
                        onChange={(e) => { setFormData(prev => ({ ...prev, category: e.target.value })); setIsDirty(true); }}
                        placeholder="e.g., Automation / SecOps / AI"
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                      />
                      <datalist id="service-categories">
                        {DEFAULT_SERVICE_CATEGORIES.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Short Description *
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => { setFormData(prev => ({ ...prev, description: e.target.value })); setIsDirty(true); }}
                      placeholder="Brief overview summarizing the quality assurance scope for this service card..."
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => { setFormData(prev => ({ ...prev, status: e.target.value })); setIsDirty(true); }}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', background: '#fff' }}
                      >
                        <option value="active">Active (Published on Website)</option>
                        <option value="beta">Beta (Preview & Evaluation)</option>
                        <option value="inactive">Inactive (Draft / Hidden)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="e.g., ai-powered-testing"
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>

                  {/* LIVE URL PREVIEW */}
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '0.86rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔗</span>
                    <span>Public Route: <strong>/services/{formData.slug || 'service-slug'}</strong></span>
                  </div>
                </div>

                {/* VISUAL ICON PICKER */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Service Icon / Visual Motif</h4>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                    Pick an emoji or enter any visual symbol that appears in listings, hero banners, and cards.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: '#f8fafc',
                      border: '2px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>
                      {formData.icon || '🧪'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Custom Icon / Emoji
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => { setFormData(prev => ({ ...prev, icon: e.target.value })); setIsDirty(true); }}
                        placeholder="Paste emoji or icon text"
                        style={{ width: '100%', maxWidth: '200px', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PRESET_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => { setFormData(prev => ({ ...prev, icon: emoji })); setIsDirty(true); }}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          border: formData.icon === emoji ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: formData.icon === emoji ? '#eff6ff' : '#ffffff',
                          fontSize: '1.35rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HERO & TAGS */}
            {activeTab === 'hero' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Hero Banner Configuration</h4>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Hero H1 Heading
                    </label>
                    <input
                      type="text"
                      value={formData.hero_title}
                      onChange={(e) => { setFormData(prev => ({ ...prev, hero_title: e.target.value })); setIsDirty(true); }}
                      placeholder="Defaults to Service Name if blank"
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Hero Subtitle / Tagline
                    </label>
                    <textarea
                      rows={3}
                      value={formData.hero_description}
                      onChange={(e) => { setFormData(prev => ({ ...prev, hero_description: e.target.value })); setIsDirty(true); }}
                      placeholder="Expanded tagline shown directly under the H1 on the public hero banner..."
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}
                    />
                  </div>
                </div>

                {/* FEATURE TAGS / PILLS */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Feature Tags / Pills</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                        Displayed as glassmorphic badges across the hero banner.
                      </p>
                    </div>
                  </div>

                  {/* Add Tag Form */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(e); }}
                      placeholder="Add tag (e.g., Cross-Browser, Self-Healing, k6 Load Engine)..."
                      style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add Tag
                    </button>
                  </div>

                  {/* Tags List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.tags.map((tag, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.85rem',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                          ● {tag}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveTag(idx, -1)}
                            disabled={idx === 0}
                            style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                          >
                            ⬆️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTag(idx, 1)}
                            disabled={idx === formData.tags.length - 1}
                            style={{ background: 'none', border: 'none', cursor: idx === formData.tags.length - 1 ? 'default' : 'pointer', opacity: idx === formData.tags.length - 1 ? 0.3 : 1 }}
                          >
                            ⬇️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Overview & Methodology</h4>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={formData.overview.heading}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, overview: { ...prev.overview, heading: val } }));
                        setIsDirty(true);
                      }}
                      placeholder={`e.g., What is ${formData.name || 'this service'}?`}
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Detailed Explanation / Philosophy
                    </label>
                    <textarea
                      rows={6}
                      value={formData.overview.content}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, overview: { ...prev.overview, content: val } }));
                        setIsDirty(true);
                      }}
                      placeholder="Detailed architectural breakdown of this testing domain, why it matters, and how Varsaka engineers deliver it..."
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Highlight Stat Value
                      </label>
                      <input
                        type="text"
                        value={formData.overview.highlight_val}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, overview: { ...prev.overview, highlight_val: val } }));
                          setIsDirty(true);
                        }}
                        placeholder="e.g., 99.4%"
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Highlight Stat Label
                      </label>
                      <input
                        type="text"
                        value={formData.overview.highlight_label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, overview: { ...prev.overview, highlight_label: val } }));
                          setIsDirty(true);
                        }}
                        placeholder="e.g., Defect Prevention Rate"
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CAPABILITIES BUILDER */}
            {activeTab === 'capabilities' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Repeatable Capability Cards</h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Renders in the "What We Cover" 6-card feature grid. Auto-hides if empty.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCapability}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Capability
                  </button>
                </div>

                {formData.capabilities.length === 0 ? (
                  <div style={{ background: '#fff', padding: '3rem', textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Capabilities Configured</h4>
                    <p style={{ color: '#64748b', margin: '0 0 1.25rem', fontSize: '0.9rem' }}>This section will be hidden on the public page until you add capability cards.</p>
                    <button type="button" onClick={handleAddCapability} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      Add First Capability
                    </button>
                  </div>
                ) : (
                  formData.capabilities.map((cap, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '1.25rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.8rem'
                          }}>
                            {idx + 1}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{cap.title || 'Untitled Card'}</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveCapability(idx, -1)}
                            disabled={idx === 0}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                          >
                            ⬆️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCapability(idx, 1)}
                            disabled={idx === formData.capabilities.length - 1}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: idx === formData.capabilities.length - 1 ? 'default' : 'pointer', opacity: idx === formData.capabilities.length - 1 ? 0.3 : 1 }}
                          >
                            ⬇️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCapability(idx)}
                            style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Icon</label>
                          <input
                            type="text"
                            value={cap.icon}
                            onChange={(e) => handleUpdateCapability(idx, 'icon', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '1.2rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Title</label>
                          <input
                            type="text"
                            value={cap.title}
                            onChange={(e) => handleUpdateCapability(idx, 'title', e.target.value)}
                            placeholder="Capability title..."
                            style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Description</label>
                        <textarea
                          rows={2}
                          value={cap.desc}
                          onChange={(e) => handleUpdateCapability(idx, 'desc', e.target.value)}
                          placeholder="Describe this capability..."
                          style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: PROCESS STEPS */}
            {activeTab === 'process' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Testing Lifecycle & Process Stages</h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Step numbers automatically re-sequence as 01, 02, 03... based on display order.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Step
                  </button>
                </div>

                {formData.process_steps.length === 0 ? (
                  <div style={{ background: '#fff', padding: '3rem', textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔄</div>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Process Steps Added</h4>
                    <p style={{ color: '#64748b', margin: '0 0 1.25rem', fontSize: '0.9rem' }}>The process section will automatically hide until steps are configured.</p>
                    <button type="button" onClick={handleAddStep} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      Add Step 01
                    </button>
                  </div>
                ) : (
                  formData.process_steps.map((step, idx) => {
                    const stepNum = String(idx + 1).padStart(2, '0');
                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#fff',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          padding: '1.25rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              background: '#2563eb',
                              color: '#fff',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontWeight: 900,
                              fontSize: '0.85rem'
                            }}>
                              Stage {stepNum}
                            </span>
                            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{step.title || 'Untitled Stage'}</strong>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, -1)}
                              disabled={idx === 0}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                            >
                              ⬆️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, 1)}
                              disabled={idx === formData.process_steps.length - 1}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', cursor: idx === formData.process_steps.length - 1 ? 'default' : 'pointer', opacity: idx === formData.process_steps.length - 1 ? 0.3 : 1 }}
                            >
                              ⬇️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(idx)}
                              style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div style={{ marginBottom: '0.75rem' }}>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Stage Title</label>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                            placeholder="e.g., Requirement Analysis & Test Plan"
                            style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Description</label>
                          <textarea
                            rows={2}
                            value={step.desc}
                            onChange={(e) => handleUpdateStep(idx, 'desc', e.target.value)}
                            placeholder="Describe actions taken during this process stage..."
                            style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 6: METRICS / PROOF POINTS */}
            {activeTab === 'metrics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Repeatable Metrics & Proof Points</h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Auto-hides completely if zero metrics are configured.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMetric}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Metric
                  </button>
                </div>

                {formData.metrics.length === 0 ? (
                  <div style={{ background: '#fff', padding: '3rem', textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Metrics Defined</h4>
                    <p style={{ color: '#64748b', margin: '0 0 1.25rem', fontSize: '0.9rem' }}>The metrics section will automatically hide on the public page.</p>
                    <button type="button" onClick={handleAddMetric} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      Add Key Stat
                    </button>
                  </div>
                ) : (
                  formData.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '1.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                          Metric #{idx + 1}: {m.val || 'Value'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMetric(idx)}
                          style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '60px 140px 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Icon</label>
                          <input
                            type="text"
                            value={m.icon}
                            onChange={(e) => handleUpdateMetric(idx, 'icon', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Value</label>
                          <input
                            type="text"
                            value={m.val}
                            onChange={(e) => handleUpdateMetric(idx, 'val', e.target.value)}
                            placeholder="e.g. 97% or 10x"
                            style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Label</label>
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => handleUpdateMetric(idx, 'label', e.target.value)}
                            placeholder="e.g. Defect Detection Rate"
                            style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 7: ADDITIONAL CONTENT */}
            {activeTab === 'additional' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Custom Structured Sections</h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Add flexible structured blocks without code modifications. Auto-hides if empty.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Section
                  </button>
                </div>

                {formData.sections.length === 0 ? (
                  <div style={{ background: '#fff', padding: '3rem', textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧩</div>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Additional Sections</h4>
                    <p style={{ color: '#64748b', margin: '0 0 1.25rem', fontSize: '0.9rem' }}>You can add custom blocks for deliverables, tooling matrices, or compliance details.</p>
                    <button type="button" onClick={handleAddSection} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                      Create Section
                    </button>
                  </div>
                ) : (
                  formData.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '1.25rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                          Section #{idx + 1}: {sec.title || 'Untitled Section'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(idx)}
                          style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Section Title</label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleUpdateSection(idx, 'title', e.target.value)}
                          placeholder="e.g., Deliverables & Release Certification"
                          style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Content (Markdown / Text)</label>
                        <textarea
                          rows={4}
                          value={sec.content}
                          onChange={(e) => handleUpdateSection(idx, 'content', e.target.value)}
                          placeholder="Section copy..."
                          style={{ width: '100%', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 8: CTA */}
            {activeTab === 'cta' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Call to Action (CTA) Banner</h4>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>CTA Heading</label>
                    <input
                      type="text"
                      value={formData.cta.heading}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, cta: { ...prev.cta, heading: val } }));
                        setIsDirty(true);
                      }}
                      placeholder="e.g., Ready for Bug-Free Releases? 🚀"
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>CTA Description</label>
                    <textarea
                      rows={2}
                      value={formData.cta.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, cta: { ...prev.cta, description: val } }));
                        setIsDirty(true);
                      }}
                      placeholder="Supporting consultation offer..."
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Primary Button Text</label>
                      <input
                        type="text"
                        value={formData.cta.primary_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, cta: { ...prev.cta, primary_text: val } }));
                          setIsDirty(true);
                        }}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Primary Button URL</label>
                      <input
                        type="text"
                        value={formData.cta.primary_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, cta: { ...prev.cta, primary_url: val } }));
                          setIsDirty(true);
                        }}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Secondary Button Text</label>
                      <input
                        type="text"
                        value={formData.cta.secondary_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, cta: { ...prev.cta, secondary_text: val } }));
                          setIsDirty(true);
                        }}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Secondary Button URL</label>
                      <input
                        type="text"
                        value={formData.cta.secondary_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, cta: { ...prev.cta, secondary_url: val } }));
                          setIsDirty(true);
                        }}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: SEO */}
            {activeTab === 'seo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Search Engine & Social Optimization</h4>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>SEO Page Title</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => { setFormData(prev => ({ ...prev, seo_title: e.target.value })); setIsDirty(true); }}
                      placeholder="e.g., AI-Powered Testing Services | Varsaka Labs"
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Meta Description</label>
                    <textarea
                      rows={3}
                      value={formData.seo_description}
                      onChange={(e) => { setFormData(prev => ({ ...prev, seo_description: e.target.value })); setIsDirty(true); }}
                      placeholder="Search engine snippet text (150-160 characters)..."
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Canonical URL</label>
                    <input
                      type="text"
                      value={formData.canonical_url}
                      onChange={(e) => { setFormData(prev => ({ ...prev, canonical_url: e.target.value })); setIsDirty(true); }}
                      placeholder="https://varsaka.com/services/..."
                      style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: LIVE PREVIEW */}
            {activeTab === 'preview' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: previewMode === 'desktop' ? '#2563eb' : '#fff',
                      color: previewMode === 'desktop' ? '#fff' : '#475569',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🖥️ Desktop View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: previewMode === 'mobile' ? '#2563eb' : '#fff',
                      color: previewMode === 'mobile' ? '#fff' : '#475569',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    📱 Mobile View
                  </button>
                </div>

                <div style={{
                  maxWidth: previewMode === 'desktop' ? '1100px' : '480px',
                  margin: '0 auto',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                }}>
                  {/* PUBLIC PREVIEW RENDER */}
                  <div className="svc-page" style={{ minHeight: 'auto' }}>
                    {/* HERO */}
                    <div className="svc-hero">
                      <div className="svc-breadcrumb">
                        <span>Home</span>
                        <span>/</span>
                        <span>Services</span>
                        <span>/</span>
                        <span style={{ color: '#fff' }}>{formData.name || 'Service Title'}</span>
                      </div>
                      <div className="svc-hero-icon">{formData.icon || '🧪'}</div>
                      <h1>{formData.hero_title || formData.name || 'Service Name'}</h1>
                      <p className="svc-hero-sub">{formData.hero_description || formData.description || 'Service short description...'}</p>

                      {formData.tags.length > 0 && (
                        <div className="svc-hero-pills">
                          {formData.tags.map(t => (
                            <span key={t} className="svc-hero-pill">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="svc-content" style={{ padding: '2rem 1.5rem' }}>
                      {/* OVERVIEW */}
                      <div className="svc-overview" style={{ marginBottom: '3rem' }}>
                        <div className="svc-overview-text">
                          <h2>{formData.overview.heading || `What is ${formData.name || 'this service'}?`}</h2>
                          <p>{formData.overview.content || formData.description || 'Overview description...'}</p>
                        </div>
                        <div className="svc-overview-visual">
                          <div className="big-icon">{formData.icon || '🧪'}</div>
                          <div className="svc-stat-row">
                            <div className="svc-stat">
                              <strong>{formData.overview.highlight_val || '99.4%'}</strong>
                              <span>{formData.overview.highlight_label || 'Defect Detection Rate'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CAPABILITIES */}
                      {formData.capabilities.length > 0 && (
                        <div style={{ marginBottom: '3.5rem' }}>
                          <h2 className="svc-section-title">What We Cover</h2>
                          <p className="svc-section-sub">A structured, end-to-end quality validation across every dimension.</p>
                          <div className="svc-features-grid">
                            {formData.capabilities.map((c, i) => (
                              <div key={i} className="svc-feature-card">
                                <div className="svc-feature-icon">{c.icon || '✅'}</div>
                                <h3>{c.title}</h3>
                                <p>{c.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PROCESS */}
                      {formData.process_steps.length > 0 && (
                        <div className="svc-process" style={{ marginBottom: '3.5rem' }}>
                          <h2 className="svc-section-title">Our Testing Process</h2>
                          <p className="svc-section-sub">A disciplined, transparent lifecycle engineered for accuracy.</p>
                          <div className="svc-steps">
                            {formData.process_steps.map((s, i) => (
                              <div key={i} className="svc-step">
                                <div className="svc-step-num">{String(i + 1).padStart(2, '0')}</div>
                                <div className="svc-step-body">
                                  <h3>{s.title}</h3>
                                  <p>{s.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* METRICS */}
                      {formData.metrics.length > 0 && (
                        <div style={{ marginBottom: '3.5rem' }}>
                          <h2 className="svc-section-title">Verified Impact</h2>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            {formData.metrics.map((m, i) => (
                              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{m.icon || '🎯'}</div>
                                <strong style={{ fontSize: '1.8rem', color: '#2563eb', display: 'block' }}>{m.val}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{m.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="svc-cta" style={{ margin: '2rem 0 1rem' }}>
                        <h2>{formData.cta.heading || 'Ready for Bug-Free Releases? 🚀'}</h2>
                        <p>{formData.cta.description || 'Book a free consultation and let our QA experts review your application.'}</p>
                        <div className="svc-cta-btns">
                          <span className="svc-btn-white">{formData.cta.primary_text || 'Get Free Consultation'}</span>
                          <span className="svc-btn-outline">{formData.cta.secondary_text || 'Explore Other Services'}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* MODAL STICKY FOOTER ACTIONS */}
          <div style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              {formData.id && onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fee2e2',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Delete Service
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                style={{
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSave('beta')}
                disabled={saving}
                style={{
                  background: '#fff',
                  color: '#2563eb',
                  border: '1px solid #2563eb',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Save as Beta / Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave('active')}
                disabled={saving}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                }}
              >
                {saving ? 'Publishing...' : 'Publish & Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Delete Service?"
        description={`This action permanently removes "${formData.name}". Any external links pointing to /services/${formData.slug} may 404.`}
        confirmLabel="Delete Service"
        cancelLabel="Keep Service"
        isDestructive={true}
        onConfirm={async () => {
          setConfirmDeleteOpen(false);
          if (formData.id && onDelete) {
            await onDelete(formData.id);
            onClose();
          }
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* CONFIRM DISCARD CHANGES DIALOG */}
      <ConfirmDialog
        isOpen={confirmDiscardOpen}
        title="Discard Unsaved Changes?"
        description="You have unsaved changes in this Service Builder session. Are you sure you want to exit without saving?"
        confirmLabel="Discard Changes"
        cancelLabel="Continue Editing"
        isDestructive={true}
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          setIsDirty(false);
          onClose();
        }}
        onCancel={() => setConfirmDiscardOpen(false)}
      />
    </>
  );
}
