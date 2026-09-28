import React, { useState, useMemo } from 'react';

export const ICONS = [
  { id: 'fa-shield-halved', name: 'Shield / Security', category: 'Security' },
  { id: 'fa-chart-line', name: 'Chart / Performance', category: 'Analytics' },
  { id: 'fa-gauge-high', name: 'Speed / Benchmark', category: 'Analytics' },
  { id: 'fa-robot', name: 'Robot / AI Automation', category: 'Engineering' },
  { id: 'fa-code', name: 'Code / Development', category: 'Engineering' },
  { id: 'fa-laptop-code', name: 'Laptop / Engineering', category: 'Engineering' },
  { id: 'fa-briefcase', name: 'Briefcase / Enterprise', category: 'Business' },
  { id: 'fa-building', name: 'Building / Context', category: 'Business' },
  { id: 'fa-compass-drafting', name: 'Compass / Architecture', category: 'Engineering' },
  { id: 'fa-triangle-exclamation', name: 'Warning / Challenge', category: 'Status' },
  { id: 'fa-square-check', name: 'Checkmark / Results', category: 'Status' },
  { id: 'fa-circle-check', name: 'Verified / Quality', category: 'Status' },
  { id: 'fa-bullseye', name: 'Target / Objectives', category: 'Strategy' },
  { id: 'fa-screwdriver-wrench', name: 'Wrench / Tooling', category: 'Engineering' },
  { id: 'fa-gear', name: 'Gear / Configuration', category: 'Engineering' },
  { id: 'fa-graduation-cap', name: 'Cap / Lessons Learned', category: 'Strategy' },
  { id: 'fa-database', name: 'Database / Storage', category: 'Backend' },
  { id: 'fa-server', name: 'Server / Infrastructure', category: 'Backend' },
  { id: 'fa-network-wired', name: 'Network / APIs', category: 'Backend' },
  { id: 'fa-cloud', name: 'Cloud / Microservices', category: 'Backend' },
  { id: 'fa-lock', name: 'Lock / Access Control', category: 'Security' },
  { id: 'fa-bug', name: 'Bug / QA Defect', category: 'Engineering' },
  { id: 'fa-bolt', name: 'Lightning / Speed', category: 'Analytics' },
  { id: 'fa-mobile-screen', name: 'Mobile / Cross-Platform', category: 'Engineering' },
  { id: 'fa-rocket', name: 'Rocket / Deployment', category: 'Strategy' },
  { id: 'fa-layer-group', name: 'Stack / Architecture', category: 'Engineering' },
  { id: 'fa-magnifying-glass', name: 'Search / Audit', category: 'Strategy' },
  { id: 'fa-lightbulb', name: 'Lightbulb / Innovation', category: 'Strategy' },
  { id: 'fa-file-shield', name: 'File Shield / Compliance', category: 'Security' }
];

export default function IconPicker({ value = 'fa-chart-line', onChange, label = 'Section Icon' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const cleanVal = (value || 'fa-chart-line').replace(/^fa-(solid|regular|brands)\s+/, '');
  const selectedIcon = ICONS.find(i => i.id === cleanVal || cleanVal.includes(i.id)) || {
    id: cleanVal,
    name: cleanVal.replace('fa-', '')
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return ICONS;
    const q = search.toLowerCase();
    return ICONS.filter(i => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [search]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem'
          }}>
            <i className={`fa-solid ${selectedIcon.id}`}></i>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
              {selectedIcon.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <code>{selectedIcon.id}</code>
            </div>
          </div>
        </div>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.8rem', color: '#94a3b8' }}></i>
      </button>

      {/* Popover */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          padding: '12px',
          maxHeight: '320px',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search icons (e.g. security, cloud, check)..."
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }}>
            {filtered.map(icon => {
              const isSelected = selectedIcon.id === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => {
                    onChange(icon.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #2563eb' : '1px solid #f1f5f9',
                    background: isSelected ? '#eff6ff' : '#f8fafc',
                    color: isSelected ? '#2563eb' : '#334155',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className={`fa-solid ${icon.id}`} style={{ width: '16px', textAlign: 'center', flexShrink: 0 }}></i>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {icon.name.split('/')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              No icons found matching "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
