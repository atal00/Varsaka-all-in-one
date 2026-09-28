import React from 'react';

export const ACCENT_COLORS = [
  { id: 'neutral', label: 'Neutral Slate', color: '#64748b', bg: '#f8fafc', border: '#cbd5e1' },
  { id: 'blue', label: 'Primary Blue', color: '#2563eb', bg: '#eff6ff', border: '#3b82f6' },
  { id: 'red', label: 'Challenge Red', color: '#dc2626', bg: '#fef2f2', border: '#ef4444' },
  { id: 'green', label: 'Outcomes Green', color: '#16a34a', bg: '#f0fdf4', border: '#22c55e' },
  { id: 'orange', label: 'Alert Orange', color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
  { id: 'purple', label: 'Takeaways Purple', color: '#9333ea', bg: '#faf5ff', border: '#a855f7' }
];

export default function AccentColorPicker({ value = 'neutral', onChange, label = 'Section Accent Color' }) {
  const current = value || 'neutral';

  return (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {ACCENT_COLORS.map(item => {
          const isSelected = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: isSelected ? `2px solid ${item.color}` : '1px solid #e2e8f0',
                background: isSelected ? item.bg : '#ffffff',
                color: isSelected ? item.color : '#475569',
                cursor: 'pointer',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.82rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: item.color,
                display: 'inline-block'
              }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
