# Varsaka UI Component & Design System Guidelines

**Version:** 2.4.0  
**Owner:** UI/UX Lead Agent  
**Applies to:** `varsaka-react`, `varsaka-admin`, `varsaka-blogs`, `invoice-generator`  

---

## 1. Design Philosophy & Aesthetic Principles
Varsaka Labs embodies a **Precision Engineering Aesthetic**: clean, modern, restrained yet high-tech. The visual architecture communicates trust, rigorous technical competence, and mathematical precision.

1. **Clarity First**: No gratuitous animations, distracting parallax shifts, or decorative clutter that obscures technical information.
2. **Predictable Layouts**: Strict 8-point spatial grid. Elements snap into alignment across all viewports.
3. **High Contrast & Readability**: Strict adherence to WCAG 2.1 AA/AAA contrast ratios. Editorial typography with serif headlines and clean sans-serif body.
4. **Purposeful Feedback**: Every interactive component provides immediate visual and accessibility feedback on hover, focus, active, and error states.

---

## 2. Design Tokens & CSS Custom Properties

```css
:root {
  /* Surface Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-dark: #020617;
  --bg-dark-elevated: #0f172a;
  --bg-dark-card: #1e293b;

  /* Text & Foreground Colors */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --text-inverse: #f8fafc;

  /* Accent & Action Colors */
  --accent-primary: #2563eb;       /* Royal Blue */
  --accent-primary-hover: #1d4ed8;
  --accent-secondary: #4f46e5;     /* Indigo */
  --accent-cyan: #06b6d4;          /* Technical Cyan */
  --accent-success: #10b981;       /* Emerald */
  --accent-warning: #f59e0b;       /* Amber */
  --accent-danger: #ef4444;        /* Crimson */

  /* Borders & Dividers */
  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.16);
  --border-dark-subtle: rgba(255, 255, 255, 0.08);
  --border-dark-strong: rgba(255, 255, 255, 0.16);

  /* Elevation Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
  --shadow-glow: 0 0 25px -5px rgba(37, 99, 235, 0.25);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* Spatial Scale */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1.0rem;   /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2.0rem;   /* 32px */
  --space-12: 3.0rem;  /* 48px */
  --space-16: 4.0rem;  /* 64px */
}
```

---

## 3. Typography Guidelines

### 3.1 Font Family Stacks
- **Headings & Key Metrics**: `Newsreader`, `Instrument Serif`, `Georgia`, serif
- **Body & Interface Elements**: `Plus Jakarta Sans`, `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Code & Verification Hashes**: `IBM Plex Mono`, `Fira Code`, monospace

### 3.2 Prose Standards
For all legal documents, articles, case studies, and informational blocks:
```css
.prose-block {
  font-size: 1.0rem;
  line-height: 1.68;
  color: var(--text-secondary);
  text-align: justify;
  text-justify: inter-word;
  hyphens: auto;
  max-width: 820px;
  margin: 0 auto;
}

.prose-block h2 {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 2.25rem;
  margin-bottom: 0.75rem;
  letter-spacing: -0.015em;
}

.prose-block p {
  margin-bottom: 1.25rem;
}

.prose-block ul, .prose-block ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}
```

---

## 4. Component Specifications

### 4.1 Buttons & Action Triggers
- **Primary Action (`.btn-primary`)**:
  - Background: `var(--accent-primary)`
  - Text: `#ffffff`
  - Padding: `0.75rem 1.5rem` (Min height: 44px)
  - Border Radius: `var(--radius-md)`
  - Hover: Background `var(--accent-primary-hover)`, `transform: translateY(-1px)`, Shadow `var(--shadow-md)`
  - Focus-visible: `outline: 2px solid var(--accent-primary); outline-offset: 2px;`
- **Secondary Action (`.btn-secondary`)**:
  - Background: `transparent`
  - Border: `1px solid var(--border-strong)`
  - Text: `var(--text-primary)`
  - Hover: Background `var(--bg-tertiary)`

### 4.2 Form Controls & Consent Inputs
- **Text Inputs & Textareas**:
  - Height: 44px (inputs)
  - Padding: `0.625rem 0.875rem`
  - Border: `1px solid var(--border-strong)`
  - Border Radius: `var(--radius-sm)`
  - Focus: Border `var(--accent-primary)`, Box Shadow `0 0 0 3px rgba(37, 99, 235, 0.15)`
- **DPDP Act Affirmative Consent Checkbox**:
  - Input: Checkbox must be **unchecked by default**.
  - Target Hit Area: Minimum 24px x 24px container with clear clickable label.
  - Text: Must clearly state data usage, link to Privacy Policy, and provide contact for grievance redressal (`info@varsaka.com`).

### 4.3 Cards & Surface Elevations
- Border: `1px solid var(--border-subtle)`
- Border Radius: `var(--radius-lg)`
- Background: `var(--bg-primary)` (or `var(--bg-dark-card)` on dark mode)
- Transition: `box-shadow 0.2s ease, transform 0.2s ease`
- Hover state: `transform: translateY(-2px)`, shadow `var(--shadow-lg)`

### 4.4 Data Tables & Status Badges
- **Header**: Sticky (`position: sticky; top: 0;`), background `var(--bg-secondary)`, uppercase font 0.75rem, letter-spacing `0.05em`.
- **Row Hover**: `background: rgba(37, 99, 235, 0.03)`
- **Status Badges**:
  - Verified: `background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;`
  - Pending: `background: #fef9c3; color: #a16207; border: 1px solid #fef08a;`
  - Action Required: `background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;`

### 4.5 Modals & Overlays
- Backdrop: `rgba(2, 6, 23, 0.75)` with `backdrop-filter: blur(8px)`
- Container: Centered, max-width 640px (standard) or 960px (wide)
- Animation: Scale in from `0.96` to `1.0` with `opacity: 0` to `1` over 150ms.
- Keyboard: `Esc` closes modal; focus trapped within modal element.

---

## 5. Responsive Breakpoint Rules
- **Mobile (`< 640px`)**: Single column flow, full-width buttons, collapsible drawer navigation, 16px horizontal margins.
- **Tablet (`641px - 1024px`)**: 2-column grids, horizontal scrolling for complex data tables, 24px margins.
- **Desktop (`1025px - 1440px`)**: 3-column service grids, max-width container 1280px, sticky sidebar navigation.
- **Wide (`> 1440px`)**: Centered layout with max-width clamp (`max-width: 1400px; margin: 0 auto;`).
