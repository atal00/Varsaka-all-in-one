import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { supabase } from '../supabaseClient';
import SEO from '../components/SEO';
import { resolveServiceSlug, generateServiceSlug } from '../utils/serviceSlug';
import './Services.css';

// 🛡️ Security Guard: Safely sanitize external/admin URLs to prevent javascript: or data: XSS
function safeUrl(url, fallback = '/') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

// Category-based fallback metadata generators for rich dynamic display
function getServicePresets(service) {
  const cat = (service.category || '').toLowerCase();
  const name = (service.name || '').toLowerCase();

  if (cat.includes('auto') || name.includes('auto')) {
    return {
      icon: '🤖',
      pills: ['E2E Automation', 'CI/CD Pipelines', 'Cross-Browser', 'Self-Healing', 'Regression Suites'],
      stats: [
        { val: '10x', label: 'Faster Regression' },
        { val: '99.5%', label: 'Test Reliability' },
        { val: 'Zero', label: 'Flaky Tests' }
      ],
      capabilities: [
        { icon: '⚡', title: 'End-to-End Test Automation', desc: 'Resilient browser and API automated suites running in parallel across test stages.' },
        { icon: '🔄', title: 'Continuous Integration / CD', desc: 'Direct triggers inside GitHub Actions, GitLab CI, and Jenkins on every pull request.' },
        { icon: '🧩', title: 'Modular Framework Design', desc: 'Clean Page Object Model (POM) and modular test architecture built for scalability.' },
        { icon: '📊', title: 'Visual & Reporting Dashboards', desc: 'Instant failure traces, video recordings, and execution dashboards for dev teams.' },
        { icon: '🛠️', title: 'Flaky Test Remediation', desc: 'Systematic root-cause analysis of timing issues and DOM state transitions.' },
        { icon: '🌐', title: 'Cross-Browser & Multi-Platform', desc: 'Parallel headless and headful runs across Chromium, WebKit, and Firefox.' }
      ],
      tools: ['Playwright', 'Cypress', 'Selenium', 'Appium', 'Postman', 'GitHub Actions', 'Docker', 'Allure Report']
    };
  }

  if (cat.includes('sec') || name.includes('sec') || name.includes('pen') || name.includes('audit')) {
    return {
      icon: '🔐',
      pills: ['OWASP Top 10', 'VAPT Audits', 'API Security', 'Penetration Testing', 'Compliance'],
      stats: [
        { val: 'OWASP', label: 'Aligned Audits' },
        { val: '100%', label: 'Confidentiality' },
        { val: '< 24h', label: 'Critical Alert SLA' }
      ],
      capabilities: [
        { icon: '🛡️', title: 'Vulnerability Assessment & Pen Testing', desc: 'Proactive simulated attacks identifying authorization flaws, injections, and data leaks.' },
        { icon: '🔑', title: 'Authentication & Session Hardening', desc: 'Verifying JWT, OAuth, token expiration, and privilege escalation vulnerabilities.' },
        { icon: '📡', title: 'API & Microservice Security', desc: 'Validating rate limiting, input sanitization, and GraphQL/REST endpoint protections.' },
        { icon: '📜', title: 'Compliance & Regulatory Readiness', desc: 'Ensuring alignment with ISO 27001, SOC 2, and data protection privacy standards.' },
        { icon: '🔍', title: 'Static & Dynamic Code Analysis', desc: 'Catching insecure dependencies and secret leaks before production deployment.' },
        { icon: '📑', title: 'Actionable Remediation Reports', desc: 'Clear proof-of-concept exploits, CVSS risk scores, and developer fix guidance.' }
      ],
      tools: ['Burp Suite Pro', 'OWASP ZAP', 'Postman', 'Nmap', 'Snyk', 'SonarQube', 'Wireshark', 'Metasploit']
    };
  }

  if (cat.includes('perf') || name.includes('perf') || name.includes('load') || name.includes('stress')) {
    return {
      icon: '⚡',
      pills: ['Load Testing', 'Stress Testing', 'Latency Benchmarks', 'Concurrency', 'Capacity Planning'],
      stats: [
        { val: '< 200ms', label: 'Target Latency' },
        { val: '50k+', label: 'Concurrent Users' },
        { val: '99.99%', label: 'Uptime SLA' }
      ],
      capabilities: [
        { icon: '📈', title: 'High-Concurrency Stress Testing', desc: 'Simulating peak traffic spikes to detect server memory leaks and database bottlenecks.' },
        { icon: '⏱️', title: 'Sub-Second Latency Profiling', desc: 'Microsecond-level breakdown of DNS, TLS handshake, TTFB, and server compute times.' },
        { icon: '🗄️', title: 'Database & Query Bottleneck Audits', desc: 'Identifying locking conflicts, connection pool starvation, and unindexed queries.' },
        { icon: '🌐', title: 'Distributed Geographic Load', desc: 'Simulating user traffic worldwide from multiple cloud nodes and edge locations.' },
        { icon: '📊', title: 'Scalability & Threshold Analysis', desc: 'Finding the exact breaking point and auto-scaling limits of your infrastructure.' },
        { icon: '📋', title: 'Executive Performance Brief', desc: 'Actionable charts, resource saturation curves, and hardware sizing recommendations.' }
      ],
      tools: ['k6 Load Engine', 'Apache JMeter', 'Locust', 'Grafana', 'Prometheus', 'AWS CloudWatch', 'Datadog']
    };
  }

  if (cat.includes('ai') || name.includes('ai') || name.includes('ml')) {
    return {
      icon: '🧠',
      pills: ['LLM Verification', 'Prompt Injection Defense', 'Output Reliability', 'Model Drift', 'NextGen QA'],
      stats: [
        { val: '99.8%', label: 'Hallucination Defense' },
        { val: 'Zero', label: 'Prompt Leaks' },
        { val: '100%', label: 'Deterministic Guardrails' }
      ],
      capabilities: [
        { icon: '🤖', title: 'LLM Response Consistency Testing', desc: 'Validating output structure, JSON schema compliance, and semantic repeatability.' },
        { icon: '🛡️', title: 'Red Teaming & Jailbreak Defense', desc: 'Stress testing model defenses against adversarial inputs and system prompt extraction.' },
        { icon: '📉', title: 'Hallucination & Drift Detection', desc: 'Automated evaluation pipelines measuring retrieval accuracy and factual fidelity.' },
        { icon: '🔄', title: 'Self-Healing Test Suites', desc: 'AI-assisted test maintenance that automatically updates locators when UI changes.' },
        { icon: '⚡', title: 'RAG Pipeline Evaluation', desc: 'Measuring context precision, chunk relevance, and vector search recall.' },
        { icon: '📊', title: 'Safety & Bias Audits', desc: 'Comprehensive benchmarking for toxicity, content safety, and privacy protections.' }
      ],
      tools: ['DeepEval', 'Ragas', 'OpenAI Evals', 'LangSmith', 'Promptfoo', 'Playwright AI', 'Python PyTest']
    };
  }

  if (cat.includes('mob') || name.includes('mob') || name.includes('app') || name.includes('ios') || name.includes('android')) {
    return {
      icon: '📱',
      pills: ['iOS & Android', 'Real Device Fleet', 'Battery & Thermal', 'Network Throttling', 'Touch Latency'],
      stats: [
        { val: '30+', label: 'Physical Devices' },
        { val: '100%', label: 'OEM Coverage' },
        { val: '0', label: 'Emulator Blindspots' }
      ],
      capabilities: [
        { icon: '📱', title: 'Real Hardware Device Bench', desc: 'Testing across iPhones, iPads, Samsung, and Pixel hardware under real physical constraints.' },
        { icon: '📶', title: 'Network Throttling & Offline Mode', desc: 'Simulating 2G/3G drops, airplane mode transitions, and packet loss recovery.' },
        { icon: '🔋', title: 'Battery, Thermal & Memory Audits', desc: 'Measuring background drain, CPU throttling, and memory leaks during extended sessions.' },
        { icon: '🔄', title: 'Interruption & State Restores', desc: 'Validating app behavior during phone calls, notifications, and background resumes.' },
        { icon: '📐', title: 'Responsive Viewport & Notch Testing', desc: 'Perfect pixel alignment across dynamic islands, foldable screens, and diverse screen ratios.' },
        { icon: '🚀', title: 'Store Release Verification', desc: 'Pre-flight checks to guarantee compliance with App Store and Google Play guidelines.' }
      ],
      tools: ['Appium', 'XCUITest', 'Espresso', 'BrowserStack', 'LambdaTest', 'Charles Proxy', 'Xcode', 'Android Studio']
    };
  }

  // Default QA Engineering preset
  return {
    icon: '🧪',
    pills: [service.category || 'Quality Assurance', 'Feature Validation', 'Defect Prevention', 'Regression Control', 'Release Certification'],
    stats: [
      { val: '99.4%', label: 'Defect Detection' },
      { val: '3-5 Days', label: 'Rapid Onboarding' },
      { val: '100%', label: 'Scope Documented' }
    ],
    capabilities: [
      { icon: '✅', title: 'Comprehensive Functional Validation', desc: 'Verifying every user workflow, business rule, and input boundary behaves according to specification.' },
      { icon: '🔁', title: 'Regression Guardrails', desc: 'Ensuring existing functionality remains rock-solid after every commit, patch, or release.' },
      { icon: '🌐', title: 'Cross-Platform Compatibility', desc: 'Testing across desktop browsers, mobile viewports, and varied operating environments.' },
      { icon: '📋', title: 'Requirements Traceability (RTM)', desc: 'Direct mapping of user stories to test cases to guarantee exhaustive coverage.' },
      { icon: '🔍', title: 'Exploratory & Edge-Case Discovery', desc: 'Experienced testers exploring unforeseen user journeys to catch elusive edge bugs.' },
      { icon: '📊', title: 'Detailed Defect Intelligence', desc: 'Actionable bug reports complete with network logs, reproduction steps, and severity ratings.' }
    ],
    tools: ['JIRA', 'TestRail', 'Postman', 'BrowserStack', 'Playwright', 'Confluence', 'GitHub', 'Zephyr']
  };
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    async function fetchService() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: dbError } = await supabase
          .from('services')
          .select('*')
          .in('status', ['active', 'beta']);

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          // Match by resolveServiceSlug or exact slug or ID
          const normalizedSlug = (slug || '').toLowerCase().trim();
          const matched = data.find(s => {
            const resolved = resolveServiceSlug(s, data);
            const direct = generateServiceSlug(s.slug || s.name || '');
            return resolved === normalizedSlug || direct === normalizedSlug || s.id === slug;
          });

          if (matched && isMounted) {
            setService(matched);
            setLoading(false);
            return;
          }
        }

        if (isMounted) {
          setError('Service not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load service');
          setLoading(false);
        }
      }
    }

    if (slug) {
      fetchService();
    }
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="svc-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'iconFloat 2s infinite ease-in-out' }}>🧪</div>
          <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="svc-page" style={{ padding: '6rem 5% 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '3rem 2rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Service Not Found</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
            The requested service may have been moved, updated, or does not exist.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/#services" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.8rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
              View All Services
            </Link>
            <Link to="/" style={{ background: '#f1f5f9', color: '#334155', padding: '0.75rem 1.8rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const preset = getServicePresets(service);
  const serviceTitle = service.hero_title || service.name || 'Quality Engineering Service';
  const serviceDesc = service.hero_description || service.hero_subtitle || service.description || `Professional ${service.category || 'QA'} solutions delivered by Varsaka Labs certified engineers.`;
  const serviceIcon = service.icon || preset.icon || '🧪';

  // Feature Tags / Pills
  const featureTags = Array.isArray(service.tags) && service.tags.length > 0
    ? service.tags
    : (service.tags ? [] : (preset.pills || []));

  // Capabilities (What We Cover)
  const rawCapabilities = Array.isArray(service.capabilities)
    ? service.capabilities.filter(c => c.active !== false && (c.title || c.desc))
    : (service.capabilities ? [] : (preset.capabilities || []));

  // Process / Implementation Steps
  const rawProcessSteps = Array.isArray(service.process_steps) && service.process_steps.length > 0
    ? service.process_steps
    : (service.process_steps ? [] : [
        { step_num: '01', title: 'Requirement & Architecture Review', desc: 'We inspect specs, user workflows, acceptance criteria, and system architecture to establish the testing perimeter.' },
        { step_num: '02', title: 'Strategy & Test Plan Formulation', desc: 'Our QA leads document test scope, environments, risk matrices, coverage metrics, and milestone schedules.' },
        { step_num: '03', title: 'Test Case Architecture & Scripting', desc: 'We craft comprehensive positive, negative, and extreme boundary test suites mapped to user requirements.' },
        { step_num: '04', title: 'Systematic Execution & Validation', desc: 'Engineers execute test cases meticulously, capturing network logs, console traces, and reproduction evidence.' },
        { step_num: '05', title: 'Defect Tracking & Regression Verification', desc: 'Every reported defect is tracked through its resolution cycle and re-verified before sign-off.' },
        { step_num: '06', title: 'Delivery Sign-off & Quality Certificate', desc: 'You receive full traceability documentation, release readiness metrics, and formal quality certification.' },
      ]);

  // Proof Points / Metrics
  const serviceMetrics = Array.isArray(service.metrics) && service.metrics.length > 0
    ? service.metrics.filter(m => m.val || m.label)
    : (service.metrics ? [] : (preset.stats || []));

  // Additional Flexible Structured Sections
  const extraSections = Array.isArray(service.sections)
    ? service.sections.filter(s => s.active !== false && (s.title || s.content))
    : [];

  // Overview content
  const overviewHeading = service.overview?.heading || `Why Choose ${service.name || serviceTitle}?`;
  const overviewSubtitle = service.overview?.subtitle || '';
  const overviewDesc = service.overview?.description || '';
  const highlightMetric = service.overview?.highlight_metric || '';
  const highlightLabel = service.overview?.highlight_label || '';

  // CTA content
  const ctaHeading = service.cta?.heading || 'Ready to Elevate Your Software Quality? 🚀';
  const ctaDesc = service.cta?.description || 'Book a free consultation and let our QA experts evaluate your product. No commitment, just honest engineering insight.';
  const primaryBtnText = service.cta?.primary_btn_text || 'Get Free Consultation';
  const primaryBtnUrl = service.cta?.primary_btn_url || '/#contact';
  const secondaryBtnText = service.cta?.secondary_btn_text || 'Explore Other Services';
  const secondaryBtnUrl = service.cta?.secondary_btn_url || '/#services';

  // SEO metadata
  const seoTitle = service.seo_title || service.og_title || (service.hero_title ? `${service.hero_title} | Varsaka Labs` : `${service.name || serviceTitle} | Varsaka Labs Engineering`);
  const seoDesc = service.seo_description || service.og_description || service.hero_subtitle || serviceDesc;
  const seoKeywords = service.seo_keywords || (Array.isArray(service.tags) ? service.tags.join(', ') : '') || `${service.name || serviceTitle}, software testing, quality engineering, QA services, Varsaka Labs`;

  return (
    <div className="svc-page">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
      />

      {/* HERO BANNER */}
      <div className="svc-hero">
        <div className="svc-breadcrumb">
          <a onClick={() => navigate('/')}>Home</a>
          <span>/</span>
          <a onClick={() => navigate('/#services')}>Services</a>
          <span>/</span>
          <span style={{ color: '#fff' }}>{service.name || serviceTitle}</span>
        </div>
        <div className="svc-hero-icon">{serviceIcon}</div>
        <h1>{serviceTitle}</h1>
        <p className="svc-hero-sub">{serviceDesc}</p>
        {featureTags.length > 0 && (
          <div className="svc-hero-pills">
            {featureTags.map((p, idx) => (
              <span key={idx} className="svc-hero-pill">{p}</span>
            ))}
          </div>
        )}
      </div>

      <div className="svc-content">

        {/* OVERVIEW SECTION (Only render if description or preset content exists) */}
        {(overviewDesc || service.description || preset) && (
          <div className="svc-overview">
            <div className="svc-overview-text">
              <h2>{overviewHeading}</h2>
              {overviewSubtitle && <p style={{ fontWeight: 600, color: '#2563eb', marginBottom: '0.75rem' }}>{overviewSubtitle}</p>}
              {overviewDesc ? (
                overviewDesc.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <>
                  <p>
                    In today's fast-moving software development cycles, quality cannot be an afterthought.
                    Varsaka Labs delivers rigorous, human-engineered verification for {(service.name || serviceTitle).toLowerCase()}
                    designed to eliminate release anxiety and safeguard your end-user experience.
                  </p>
                  <p>
                    Our certified quality engineers embed seamlessly into your sprint cadence, collaborating directly
                    within your existing CI/CD pipelines, issue trackers, and staging environments.
                  </p>
                  <p>
                    From proactive edge-case discovery to enterprise-grade compliance, we give your team complete confidence before every production deployment.
                  </p>
                </>
              )}
            </div>
            <div className="svc-overview-visual">
              <div className="big-icon">{serviceIcon}</div>
              {highlightMetric && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <strong style={{ fontSize: '2rem', color: '#2563eb', display: 'block', fontWeight: 900 }}>{highlightMetric}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{highlightLabel}</span>
                </div>
              )}
              {serviceMetrics.length > 0 && !highlightMetric && (
                <div className="svc-stat-row">
                  {serviceMetrics.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="svc-stat">
                      <strong>{s.val}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAPABILITIES / WHAT WE COVER (Auto-hides if empty) */}
        {rawCapabilities.length > 0 && (
          <div className="svc-capabilities-section" style={{ marginBottom: '5rem' }}>
            <h2 className="svc-section-title">What We Cover</h2>
            <p className="svc-section-sub">A structured, end-to-end quality validation across every dimension of your software.</p>
            <div className="svc-features-grid" style={{ marginBottom: 0 }}>
              {rawCapabilities.map((c, idx) => (
                <div key={c.id || idx} className="svc-feature-card">
                  <div className="svc-feature-icon">{c.icon || '⚡'}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc || c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROCESS / IMPLEMENTATION (Auto-hides if empty) */}
        {rawProcessSteps.length > 0 && (
          <div className="svc-process">
            <h2 className="svc-section-title">Our Testing Process</h2>
            <p className="svc-section-sub">A disciplined, transparent lifecycle engineered for accuracy and speed.</p>
            <div className="svc-steps">
              {rawProcessSteps.map((s, idx) => {
                const stepNum = s.step_num || String(idx + 1).padStart(2, '0');
                return (
                  <div key={s.id || idx} className="svc-step">
                    <div className="svc-step-num">{stepNum}</div>
                    <div className="svc-step-body">
                      <h3>{s.title}</h3>
                      <p>{s.desc || s.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* METRICS / PROOF POINTS SECTION (Auto-hides if empty) */}
        {serviceMetrics.length > 0 && (
          <div className="svc-metrics-section" style={{ marginBottom: '5rem' }}>
            <h2 className="svc-section-title">Key Proof Points & Impact</h2>
            <p className="svc-section-sub">Quantified outcomes and measurable assurance delivered across our engagements.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              {serviceMetrics.map((m, idx) => (
                <div key={m.id || idx} style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  {m.icon && <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{m.icon}</div>}
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb', marginBottom: '0.25rem' }}>{m.val}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '0.35rem' }}>{m.label}</div>
                  {m.desc && <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>{m.desc}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADDITIONAL CUSTOM SECTIONS (Auto-hides if empty) */}
        {extraSections.map((sec, idx) => (
          <div key={sec.id || idx} style={{ marginBottom: '5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
              {sec.icon && <span style={{ fontSize: '2rem' }}>{sec.icon}</span>}
              <h2 className="svc-section-title" style={{ margin: 0 }}>{sec.title}</h2>
            </div>
            {sec.subtitle && <p style={{ fontWeight: 600, color: '#2563eb', marginBottom: '1rem' }}>{sec.subtitle}</p>}
            {sec.image && (
              <img
                src={safeUrl(sec.image, '')}
                alt={sec.title}
                style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem' }}
              />
            )}
            <div
              style={{ color: '#475569', lineHeight: '1.7', fontSize: '0.98rem' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sec.content || '') }}
            />
          </div>
        ))}

        {/* TOOLS & DELIVERABLES (Only if available in presets or service) */}
        {preset.tools && preset.tools.length > 0 && (
          <div className="svc-tools">
            <h2 className="svc-section-title">Tools & Technologies</h2>
            <p className="svc-section-sub">We utilize industry-leading tools to integrate seamlessly with your stack.</p>
            <div className="svc-tools-grid">
              {preset.tools.map(t => (
                <span key={t} className="svc-tool-chip">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* DELIVERABLES */}
        <div className="svc-deliverables">
          <h2 className="svc-section-title">What You'll Receive</h2>
          <p className="svc-section-sub">Clear, actionable deliverables provided with every client engagement.</p>
          <div className="svc-deliverables-list">
            {[
              'Comprehensive Test Plan & Strategy Document',
              'Requirements Traceability Matrix (RTM)',
              'Exhaustive Test Case & Scenario Repository',
              'Detailed Defect Reports with Steps & Evidence',
              'Sprint Execution & Test Coverage Metrics',
              'Final QA Sign-off & Release Certification'
            ].map(d => (
              <div key={d} className="svc-deliverable-item">{d}</div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="svc-cta">
          <h2>{ctaHeading}</h2>
          <p>{ctaDesc}</p>
          <div className="svc-cta-btns">
            <a href={safeUrl(primaryBtnUrl, '/#contact')} className="svc-btn-white">{primaryBtnText}</a>
            <a href={safeUrl(secondaryBtnUrl, '/#services')} className="svc-btn-outline">{secondaryBtnText}</a>
          </div>
        </div>

      </div>
    </div>
  );
}
