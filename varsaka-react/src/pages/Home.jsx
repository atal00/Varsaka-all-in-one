import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Home.css';
import { sanitize, validateEmail } from '../utils/security';
import SEO from '../components/SEO';
import SecureCaptcha from '../components/SecureCaptcha';

const ALL_COUNTRIES = [
  { name: 'Afghanistan', code: '+93', flag: '🇦🇫' }, { name: 'Albania', code: '+355', flag: '🇦🇱' }, { name: 'Algeria', code: '+213', flag: '🇩🇿' },
  { name: 'Andorra', code: '+376', flag: '🇦🇩' }, { name: 'Angola', code: '+244', flag: '🇦🇴' }, { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Armenia', code: '+374', flag: '🇦🇲' }, { name: 'Australia', code: '+61', flag: '🇦🇺' }, { name: 'Austria', code: '+43', flag: '🇦🇹' },
  { name: 'Azerbaijan', code: '+994', flag: '🇦🇿' }, { name: 'Bahamas', code: '+1', flag: '🇧🇸' }, { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' }, { name: 'Barbados', code: '+1', flag: '🇧🇧' }, { name: 'Belarus', code: '+375', flag: '🇧🇾' },
  { name: 'Belgium', code: '+32', flag: '🇧🇪' }, { name: 'Belize', code: '+501', flag: '🇧🇿' }, { name: 'Benin', code: '+229', flag: '🇧🇯' },
  { name: 'Bhutan', code: '+975', flag: '🇧🇹' }, { name: 'Bolivia', code: '+591', flag: '🇧🇴' }, { name: 'Bosnia', code: '+387', flag: '🇧🇦' },
  { name: 'Botswana', code: '+267', flag: '🇧🇼' }, { name: 'Brazil', code: '+55', flag: '🇧🇷' }, { name: 'Brunei', code: '+673', flag: '🇧🇳' },
  { name: 'Bulgaria', code: '+359', flag: '🇧🇬' }, { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' }, { name: 'Burundi', code: '+257', flag: '🇧🇮' },
  { name: 'Cambodia', code: '+855', flag: '🇰🇭' }, { name: 'Cameroon', code: '+237', flag: '🇨🇲' }, { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Cape Verde', code: '+238', flag: '🇨🇻' }, { name: 'Central African Republic', code: '+236', flag: '🇨🇫' }, { name: 'Chad', code: '+235', flag: '🇹🇩' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' }, { name: 'China', code: '+86', flag: '🇨🇳' }, { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Comoros', code: '+269', flag: '🇰🇲' }, { name: 'Congo', code: '+242', flag: '🇨🇬' }, { name: 'Costa Rica', code: '+506', flag: '🇨🇷' },
  { name: 'Croatia', code: '+385', flag: '🇭🇷' }, { name: 'Cuba', code: '+53', flag: '🇨🇺' }, { name: 'Cyprus', code: '+357', flag: '🇨🇾' },
  { name: 'Czech Republic', code: '+420', flag: '🇨🇿' }, { name: 'Denmark', code: '+45', flag: '🇩🇰' }, { name: 'Djibouti', code: '+253', flag: '🇩🇯' },
  { name: 'Dominica', code: '+1', flag: '🇩🇲' }, { name: 'Dominican Republic', code: '+1', flag: '🇩🇴' }, { name: 'Ecuador', code: '+593', flag: '🇪🇨' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' }, { name: 'El Salvador', code: '+503', flag: '🇸🇻' }, { name: 'Equatorial Guinea', code: '+240', flag: '🇬🇶' },
  { name: 'Eritrea', code: '+291', flag: '🇪🇷' }, { name: 'Estonia', code: '+372', flag: '🇪🇪' }, { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
  { name: 'Fiji', code: '+679', flag: '🇫🇯' }, { name: 'Finland', code: '+358', flag: '🇫🇮' }, { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Gabon', code: '+241', flag: '🇬🇦' }, { name: 'Gambia', code: '+220', flag: '🇬🇲' }, { name: 'Georgia', code: '+995', flag: '🇬🇪' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' }, { name: 'Ghana', code: '+233', flag: '🇬🇭' }, { name: 'Greece', code: '+30', flag: '🇬🇷' },
  { name: 'Grenada', code: '+1', flag: '🇬🇩' }, { name: 'Guatemala', code: '+502', flag: '🇬🇹' }, { name: 'Guinea', code: '+224', flag: '🇬🇳' },
  { name: 'Guyana', code: '+592', flag: '🇬🇾' }, { name: 'Haiti', code: '+509', flag: '🇭🇹' }, { name: 'Honduras', code: '+504', flag: '🇭🇳' },
  { name: 'Hong Kong', code: '+852', flag: '🇭🇰' }, { name: 'Hungary', code: '+36', flag: '🇭🇺' }, { name: 'Iceland', code: '+354', flag: '🇮🇸' },
  { name: 'India', code: '+91', flag: '🇮🇳' }, { name: 'Indonesia', code: '+62', flag: '🇮🇩' }, { name: 'Iran', code: '+98', flag: '🇮🇷' },
  { name: 'Iraq', code: '+964', flag: '🇮🇶' }, { name: 'Ireland', code: '+353', flag: '🇮🇪' }, { name: 'Israel', code: '+972', flag: '🇮🇱' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' }, { name: 'Jamaica', code: '+1', flag: '🇯🇲' }, { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Jordan', code: '+962', flag: '🇯🇴' }, { name: 'Kazakhstan', code: '+7', flag: '🇰🇿' }, { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Kiribati', code: '+686', flag: '🇰🇮' }, { name: 'Kuwait', code: '+965', flag: '🇰🇼' }, { name: 'Kyrgyzstan', code: '+996', flag: '🇰🇬' },
  { name: 'Laos', code: '+856', flag: '🇱🇦' }, { name: 'Latvia', code: '+371', flag: '🇱🇻' }, { name: 'Lebanon', code: '+961', flag: '🇱🇧' },
  { name: 'Lesotho', code: '+266', flag: '🇱🇸' }, { name: 'Liberia', code: '+231', flag: '🇱🇷' }, { name: 'Libya', code: '+218', flag: '🇱🇾' },
  { name: 'Liechtenstein', code: '+423', flag: '🇱🇮' }, { name: 'Lithuania', code: '+370', flag: '🇱🇹' }, { name: 'Luxembourg', code: '+352', flag: '🇱🇺' },
  { name: 'Macao', code: '+853', flag: '🇲🇴' }, { name: 'Macedonia', code: '+389', flag: '🇲🇰' }, { name: 'Madagascar', code: '+261', flag: '🇲🇬' },
  { name: 'Malawi', code: '+265', flag: '🇲🇼' }, { name: 'Malaysia', code: '+60', flag: '🇲🇾' }, { name: 'Maldives', code: '+960', flag: '🇲🇻' },
  { name: 'Mali', code: '+223', flag: '🇲🇱' }, { name: 'Malta', code: '+356', flag: '🇲🇹' }, { name: 'Mauritania', code: '+222', flag: '🇲🇷' },
  { name: 'Mauritius', code: '+230', flag: '🇲🇺' }, { name: 'Mexico', code: '+52', flag: '🇲🇽' }, { name: 'Moldova', code: '+373', flag: '🇲🇩' },
  { name: 'Monaco', code: '+377', flag: '🇲🇨' }, { name: 'Mongolia', code: '+976', flag: '🇲🇳' }, { name: 'Montenegro', code: '+382', flag: '🇲🇪' },
  { name: 'Morocco', code: '+212', flag: '🇲🇦' }, { name: 'Mozambique', code: '+258', flag: '🇲🇿' }, { name: 'Myanmar', code: '+95', flag: '🇲🇲' },
  { name: 'Namibia', code: '+264', flag: '🇳🇦' }, { name: 'Nepal', code: '+977', flag: '🇳🇵' }, { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿' }, { name: 'Nicaragua', code: '+505', flag: '🇳🇮' }, { name: 'Niger', code: '+227', flag: '🇳🇪' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' }, { name: 'Norway', code: '+47', flag: '🇳🇴' }, { name: 'Oman', code: '+968', flag: '🇴🇲' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' }, { name: 'Panama', code: '+507', flag: '🇵🇦' }, { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { name: 'Peru', code: '+51', flag: '🇵🇪' }, { name: 'Philippines', code: '+63', flag: '🇵🇭' }, { name: 'Poland', code: '+48', flag: '🇵🇱' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' }, { name: 'Qatar', code: '+974', flag: '🇶🇦' }, { name: 'Romania', code: '+40', flag: '🇷🇴' },
  { name: 'Russia', code: '+7', flag: '🇷🇺' }, { name: 'Rwanda', code: '+250', flag: '🇷🇼' }, { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'Senegal', code: '+221', flag: '🇸🇳' }, { name: 'Serbia', code: '+381', flag: '🇷🇸' }, { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Slovakia', code: '+421', flag: '🇸🇰' }, { name: 'Slovenia', code: '+386', flag: '🇸🇮' }, { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷' }, { name: 'Spain', code: '+34', flag: '🇪🇸' }, { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { name: 'Sudan', code: '+249', flag: '🇸🇩' }, { name: 'Sweden', code: '+46', flag: '🇸🇪' }, { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { name: 'Taiwan', code: '+886', flag: '🇹🇼' }, { name: 'Tanzania', code: '+255', flag: '🇹🇿' }, { name: 'Thailand', code: '+66', flag: '🇹🇭' },
  { name: 'Tunisia', code: '+216', flag: '🇹🇳' }, { name: 'Turkey', code: '+90', flag: '🇹🇷' }, { name: 'Uganda', code: '+256', flag: '🇺🇬' },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦' }, { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' }, { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United States', code: '+1', flag: '🇺🇸' }, { name: 'Uruguay', code: '+598', flag: '🇺🇾' }, { name: 'Uzbekistan', code: '+998', flag: '🇺🇿' },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪' }, { name: 'Vietnam', code: '+84', flag: '🇻🇳' }, { name: 'Yemen', code: '+967', flag: '🇾🇪' },
  { name: 'Zambia', code: '+260', flag: '🇿🇲' }, { name: 'Zimbabwe', code: '+263', flag: '🇿🇼' }
];

const BACKEND_API = 'https://formsubmit.co/ajax/info@varsaka.com';
const GS_TARGET = import.meta.env.VITE_GS_SYNC_URL;

function useFadeIn(deps = []) {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => {
      if (!el.classList.contains('visible')) {
        obs.observe(el);
      }
    });
    return () => obs.disconnect();
  }, deps);
}

const TOOLS = [
  'Playwright', 'Cypress', 'Selenium', 'Postman', 'k6 Load Engine', 
  'JMeter', 'Appium Mobile', 'Burp Suite VAPT', 'GitHub Actions', 
  'Jenkins CI', 'JIRA Software', 'Docker Containers', 'PyTest', 'TestRail'
];

export default function Home() {
  const [faqs, setFaqs] = useState([]);
  const [services, setServices] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

  useFadeIn([services, faqs]);

  // Fetch Dynamic Content
  useEffect(() => {
    const fetchDynamicContent = async () => {
      // Services
      const { data: sData } = await supabase.from('services').select('*').in('status', ['active', 'beta']).order('created_at', { ascending: true });
      if (sData) {
        setServices(sData.map((s, idx) => ({
          icon: ['🧪', '🤖', '⚡', '🔐', '🧠', '📱'][idx % 6],
          title: s.name,
          desc: s.description || `Professional ${s.category} solutions delivered by Varsaka Labs experts.`,
          pill: s.category,
          link: `/services/${s.name.toLowerCase().replace(/\s+/g, '-')}`
        })));
      }
      setServicesLoading(false);

      // FAQs
      const { data: fData } = await supabase.from('faqs').select('*').order('created_at', { ascending: true });
      if (fData) {
        let dbFaqs = fData.map(f => ({
          q: f.question,
          a: f.answer,
          category: f.category
        }));
        
        if (dbFaqs.length < 5) {
           const fallbacks = [
             { q: 'How fast can you start?', a: 'Most engagements begin within a week of the discovery call. Automation framework setup typically takes one to two weeks.' },
             { q: 'Do you work inside our existing tools?', a: 'Yes. We work in your Jira, GitHub, GitLab, and integrate test runs into your existing CI/CD pipelines.' },
             { q: 'What about contracts and data security?', a: 'Every engagement starts with a bilateral NDA. We operate strictly under ISO-aligned controls and DPDP Act compliance.' }
           ];
           dbFaqs = [...dbFaqs, ...fallbacks.filter(fb => !dbFaqs.some(d => d.q === fb.q))];
        }
        setFaqs(dbFaqs);
      }
      setFaqsLoading(false);
    };
    fetchDynamicContent();
  }, []);

  // Smooth Scroll Guardian (Fixes cross-page #hash links)
  useEffect(() => {
    const handleScrollToHash = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    if (window.location.hash) {
      setTimeout(handleScrollToHash, 150);
      setTimeout(handleScrollToHash, 600);
    }

    window.addEventListener('hashchange', handleScrollToHash);
    return () => window.removeEventListener('hashchange', handleScrollToHash);
  }, []);

  const [formState, setFormState] = useState({ 
    name: '', email: '', phone: '', countryCode: '+91', service: 'Functional Testing', message: '', dpdpConsent: false
  });
  const [btnTxt, setBtnTxt] = useState(<>{'Send Message'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>);
  const [btnColor, setBtnColor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);

  // CAPTCHA System
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  const [faqOpen, setFaqOpen] = useState(null);

  const handleChange = e => setFormState(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // DPDP Act 2023: Affirmative Consent Check
    if (!formState.dpdpConsent) {
      setBtnTxt('❌ Consent required (DPDP Act)');
      setTimeout(() => {
        setBtnTxt(<>{'Send Message'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>);
      }, 2500);
      return;
    }

    // Rate Limit (1 submission every 30 seconds)
    const lastSub = localStorage.getItem('varsaka_last_sub');
    const now = Date.now();
    if (lastSub && (now - parseInt(lastSub)) < 30000) {
      setBtnTxt('🛡️ Please wait 30s');
      setTimeout(() => setBtnTxt(<>{'Send Message'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>), 2000);
      return;
    }

    // Honeypot
    if (e.target._honey.value) return; 

    // Secure Canvas CAPTCHA
    if (!isCaptchaValid) {
      setBtnTxt('❌ Incorrect CAPTCHA!');
      setCaptchaKey(prev => prev + 1);
      setIsCaptchaValid(false);
      setTimeout(() => {
        setBtnTxt(<>{'Send Message'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>);
      }, 2000);
      return;
    }

    setSubmitting(true);
    setBtnTxt('Sending...');
    setBtnColor('');
    try {
      const cleanData = {
        name: sanitize(formState.name),
        email: sanitize(formState.email),
        phone: `${formState.countryCode} ${sanitize(formState.phone)}`,
        service: formState.service,
        message: sanitize(formState.message)
      };

      if (!validateEmail(cleanData.email)) {
        setBtnTxt('❌ Invalid Email');
        setSubmitting(false);
        return;
      }

      if (BACKEND_API) {
        try {
          await fetch(BACKEND_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(cleanData)
          });
        } catch (e) {
          console.warn('Email notification failed, but continuing to database save...', e);
        }
      }

      const { error: sbError } = await supabase
        .from('leads')
        .insert([{
          ...cleanData,
          source: 'Website'
        }]);

      if (sbError) throw sbError;
      
      localStorage.setItem('varsaka_last_sub', Date.now().toString());

      if (GS_TARGET) {
        fetch(GS_TARGET, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action: 'add', ...formState })
        }).catch(err => console.error('GS Sync Error:', err));
      }

      setBtnTxt(<>{"✅ Message Sent! We'll reply soon 😊"}</>); 
      setBtnColor('#16a34a');
      setTimeout(() => { 
        setBtnTxt(<>{'Send Message'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>); 
        setBtnColor(''); 
        setSubmitting(false); 
        setFormState({ name:'', email:'', phone:'', countryCode: '+91', service:'Functional Testing', message:'', dpdpConsent: false }); 
        setCaptchaKey(prev => prev + 1); 
        setIsCaptchaValid(false);
      }, 3500);
    } catch (err) {
      window.console.error('CRITICAL FORM ERROR:', err);
      setBtnTxt('❌ Error sending. Try again.'); 
      setBtnColor('#dc2626');
      setTimeout(() => { 
        setBtnTxt(<>{'Send Message'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>); 
        setBtnColor(''); 
        setSubmitting(false); 
      }, 3500);
    }
  };

  return (
    <>
      <SEO 
        title="Varsaka Labs | Premier Software Quality Engineering & Testing"
        description="Varsaka Labs provides human-engineered software quality assurance, test automation, performance stress testing, and real device QA for global tech companies."
        keywords="software testing company, quality engineering lab, hyderabad qa agency, playwright automation, performance testing, security testing"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f.a
              }
            }))
          })}
        </script>
      </SEO>

      {/* HERO */}
      <section className="hero">
        <div className="blob blob1" /><div className="blob blob2" /><div className="blob blob3" />
        <div className="hero-dots" />
        <div className="hero-badge fade-in"><div className="badge-dot" />🏆 India's Leading Software Testing Company</div>
        <h1 className="fade-in">Varsaka Labs <span className="h1-blue h1-underline">Precision</span> in QA<br />Excellence in Testing</h1>
        <p className="hero-sub fade-in">The trusted partner for global testing companies and startups. Varsaka Labs delivers thorough software testing - functional, automation, performance, security and AI-powered - so your team ships with total confidence.</p>
        <div className="hero-btns fade-in">
          <a href="#contact" className="btn-primary">Start Free Consultation <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></a>
          <a href="#services" className="btn-ghost">See All Services <i className="fa-solid fa-arrow-down" style={{ marginLeft: '8px' }}></i></a>
        </div>
        <div className="hero-proof fade-in">
          <div className="proof-avs">
            {[['#2563eb','RS'],['#1d4ed8','PK'],['#3b82f6','AM'],['#1e40af','SK']].map(([bg,init]) => (
              <div key={init} className="proof-av" style={{background:bg, fontSize: '0.68rem', fontWeight: 800}}>{init}</div>
            ))}
          </div>
          <div className="proof-copy">
            <span className="proof-stars">★★★★★</span>
            <strong>Trusted by 25+ clients in just 4 months</strong>
            99% satisfaction rate - quality you can count on
          </div>
        </div>
      </section>

      {/* 📊 STATS STRIP */}
      <div className="stats-strip">
        {[
          ['🧪', '100+', 'Custom Test Suites Architected'],
          ['🎯', '99.4%', 'Defect Prevention Rate'],
          ['⚡', '10x', 'CI/CD Regression Speedup'],
          ['🔒', '100%', 'Strict NDA & IP Protected']
        ].map(([icon, num, label]) => (
          <div key={label} className="stat">
            <span className="stat-icon">{icon}</span>
            <span className="stat-num">{num}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* 🔬 NEW SECTION: INSIDE THE VARSAKA LAB */}
      <section id="lab" className="lab-feature-section bg-soft">
        <div className="section-head center fade-in">
          <div className="section-tag">🔬 Behind the Scenes</div>
          <h2 className="section-title">Real Hardware. Real Engineers. Zero Black-Box Shortcuts.</h2>
          <p className="section-sub">
            Software is experienced by real people on physical hardware. Here is how our Hyderabad lab ensures your releases never stumble.
          </p>
        </div>

        <div className="lab-cards-grid">
          <div className="lab-photo-card fade-in">
            <div className="lab-photo-wrap">
              <img 
                src="/images/qa_device_lab.jpg" 
                alt="Real smartphone and tablet testing bench in Hyderabad" 
                className="lab-card-img" 
              />
              <div className="lab-photo-tag">● Physical Device Testing Fleet</div>
            </div>
            <div className="lab-card-body">
              <h3>Multi-OEM Physical Device Bench</h3>
              <p>
                We execute continuous test matrices on actual iPhones, iPads, Samsung, and Pixel devices. 
                Catching real-world thermal throttling, battery drain, touch latency, and viewport rendering quirks that emulators overlook.
              </p>
              <div className="lab-card-footer">
                <span className="lab-metric-chip">📱 30+ Dedicated Lab Devices</span>
                <span className="lab-metric-chip">📶 4G/5G Network Throttling</span>
              </div>
            </div>
          </div>

          <div className="lab-photo-card fade-in">
            <div className="lab-photo-wrap">
              <img 
                src="/images/exploratory_testing_desk.jpg" 
                alt="Engineer conducting thoughtful exploratory human testing" 
                className="lab-card-img" 
              />
              <div className="lab-photo-tag">● Human Exploratory QA</div>
            </div>
            <div className="lab-card-body">
              <h3>Intuitive Human Verification</h3>
              <p>
                Automated tests verify what you expect; human intuition discovers the bizarre race conditions you never imagined. 
                From obscure payment multi-tab deadlocks to subtle accessibility friction, human curiosity guards your brand reputation.
              </p>
              <div className="lab-card-footer">
                <span className="lab-metric-chip">🔍 Deep Edge-Case Discovery</span>
                <span className="lab-metric-chip">☕ Thorough Scenario Audits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✨ SERVICES */}
      <section id="services" className="bg-white">
        <div className="section-head fade-in">
          <div className="section-tag">✨ Engineering Services</div>
          <h2 className="section-title">Everything Your Product Needs to Ship Confidently</h2>
          <p className="section-sub">From resilient automation frameworks to penetration testing - we cover every layer with engineering precision.</p>
        </div>
        <div className="services-grid">
          {servicesLoading ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>Loading engineering services...</div>
          ) : services.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>More services coming soon!</div>
          ) : services.map(s => (
            <Link key={s.title} to={s.link} className="svc-card fade-in" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="svc-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="svc-pill">{s.pill}</span>
              <div style={{ marginTop: '1.2rem', fontSize: '0.86rem', color: '#2563eb', fontWeight: 700 }}>
                Explore Service <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 🛠️ TOOLS MARQUEE */}
      <div className="tools-belt">
        <p className="tools-label">Tools & Frameworks Mastered By Our Engineers</p>
        <div style={{overflow:'hidden'}}>
          <div className="marquee">
            {[...TOOLS,...TOOLS].map((t,i) => (
              <div key={i} className="tool-chip">
                <span className="tool-dot"></span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🗺️ PROCESS */}
      <section id="process" className="bg-soft">
        <div className="section-head center fade-in">
          <div className="section-tag">🗺️ Our Process</div>
          <h2 className="section-title">Simple, Transparent & Collaborative</h2>
          <p className="section-sub">No confusing jargon or surprise invoices. Here is exactly how we partner from day one to delivery.</p>
        </div>
        <div className="process-grid">
          {[
            {n:'01',icon:'🔍',title:'Discovery & Architecture',desc:'We analyze your repository, user flows, and tech stack to formulate a high-yield test plan aligned with your sprint cadence.'},
            {n:'02',icon:'📋',title:'Harness & Script Design',desc:'Our engineers author resilient, self-healing Playwright/Cypress suites with zero flaky dependencies, fully version-controlled in Git.'},
            {n:'03',icon:'🚀',title:'Parallel CI & Device Run',desc:'Tests execute concurrently across our physical device rigs and cloud runners, streaming live telemetry and video replays.'},
            {n:'04',icon:'✅',title:'Human Sign-off & Audit',desc:'Before any release reaches production, our senior QA leads perform hands-on verification and issue a verified sign-off dossier.'},
          ].map(p => (
            <div key={p.n} className="process-card fade-in">
              <div className="process-num">{p.n}</div>
              <span className="process-icon">{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 💙 WHY VARSAKA */}
      <section id="why" className="bg-white" style={{ paddingBottom: '4rem' }}>
        <div className="section-head fade-in">
          <div className="section-tag">💙 Why Varsaka Labs</div>
          <h2 className="section-title">Enterprise Rigor, Human Partnership</h2>
          <p className="section-sub">We don't just find defects - we help your engineering team build a culture of zero-regression confidence.</p>
        </div>
        <div className="why-grid">
          {[
            {icon:'⚡',title:'3-Day Onboarding',desc:'Plug directly into your Jira, Slack, and GitHub workflows with zero friction.'},
            {icon:'🎯',title:'Deep Domain Expertise',desc:'Extensive experience across FinTech, HealthTech, B2B SaaS, and high-load eCommerce.'},
            {icon:'🔄',title:'Zero-Flakiness Guarantee',desc:'Every automated script undergoes strict endurance validation before merging into CI.'},
            {icon:'📊',title:'Live Video & Trace Logs',desc:'Replayable failure traces with exact line numbers and network payloads for instant fixes.'},
            {icon:'🔒',title:'Strict Bilateral NDA',desc:'Your intellectual property is quarantined in isolated virtual and physical environments.'},
            {icon:'💰',title:'Transparent Engineering Rates',desc:'Predictable sprint retainer or milestone pricing with zero hidden fees or surprise billings.'},
          ].map(w => (
            <div key={w.title} className="why-card fade-in">
              <div className="why-icon">{w.icon}</div>
              <div><h4>{w.title}</h4><p>{w.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* 🤔 FAQ */}
      <section id="faq" className="bg-white">
        <div className="section-head center fade-in">
          <div className="section-tag">🤔 FAQs</div>
          <h2 className="section-title">Common Questions</h2>
          <p className="section-sub">Everything you need to know about partnering with Varsaka Labs.</p>
        </div>
        <div className="faq-container fade-in">
          {faqsLoading ? (
            <div style={{textAlign: 'center', padding: '2rem'}}>Loading FAQs...</div>
          ) : faqs.map((f, i) => (
            <div key={i} className={`faq-item${faqOpen === i ? ' open' : ''}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
              <button className="faq-btn">
                {f.q}
                <span className="faq-icon">{faqOpen === i ? '−' : '+'}</span>
              </button>
              <div className="faq-content" style={{maxHeight: faqOpen === i ? '200px' : '0'}}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 CTA BANNER */}
      <div className="cta-banner">
        <h2>Ready to Ship with Total Confidence? 🚀</h2>
        <p>Book a free 30-minute discovery consultation with our QA architects. We will audit your current testing hurdles - completely free of charge.</p>
        <div className="cta-btns">
          <a href="#contact" className="btn-white">Book Free QA Consultation</a>
          <a href="#services" className="btn-outline-white">Explore All Services</a>
        </div>
      </div>

      {/* 📬 CONTACT */}
      <section id="contact" className="contact-section">
        <div className="contact-wrapper">

          {/* LEFT PANEL */}
          <div className="contact-left fade-in">
            <div className="contact-left-inner">
              <div className="contact-avail-badge">
                <span className="avail-dot" />
                Currently accepting new QA partnerships
              </div>
              <h2 className="contact-left-title">Let's Build Something Rock-Solid Together</h2>
              <p className="contact-left-sub">
                No aggressive sales pitch - just a candid technical conversation with senior quality engineers about how to streamline your releases.
              </p>

              <div className="contact-tiles">
                {[
                  { icon: '📧', label: 'Email Engineering', val: 'info@varsaka.com', sub: 'Guaranteed reply within 4 business hours' },
                  { icon: '💬', label: 'Direct WhatsApp', val: <a href="https://wa.me/917396106271" style={{color:'inherit',textDecoration:'none'}}>+91 73961 06271</a>, sub: 'Instant response from our team' },
                  { icon: '📍', label: 'Engineering Hub', val: 'Hyderabad, Telangana, India', sub: 'Serving enterprise clients worldwide' },
                ].map(c => (
                  <div key={c.label} className="contact-tile">
                    <div className="contact-tile-icon">{c.icon}</div>
                    <div>
                      <div className="contact-tile-label">{c.label}</div>
                      <div className="contact-tile-val">{c.val}</div>
                      <div className="contact-tile-sub">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-trust">
                {['🔒 Bilateral NDA First', '⚡ 3-Day Sprint Kickoff', '🌍 Global Product Teams', '✅ 99.4% Defect Prevention'].map(t => (
                  <span key={t} className="contact-trust-chip">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - FORM */}
          <div className="contact-right fade-in">
            <div className="form-wrap-v2">
              <div className="form-wrap-header">
                <div>
                  <h3>Send Us a Message</h3>
                  <p>Our engineering lead will respond within 4 business hours.</p>
                </div>
                <span className="form-time-badge">⏱ 2 min response</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Your Name <span className="req">*</span></label>
                    <input type="text" name="name" placeholder="e.g. Rahul Verma" required value={formState.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Work Email <span className="req">*</span></label>
                    <input type="email" name="email" placeholder="you@company.com" value={formState.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div style={{display:'flex', gap:'6px', position:'relative'}}>
                    <div
                      style={{width:'108px', padding:'0.75rem', borderRadius:'10px', border:'1.5px solid var(--border)', background:'var(--bg-white)', color:'var(--text)', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.9rem', fontWeight:'600', flexShrink:0}}
                      onClick={() => setShowCountryList(!showCountryList)}
                    >
                      <span>{formState.countryCode}</span><span>▾</span>
                    </div>
                    {showCountryList && (
                      <div className="country-dropdown-list" style={{position:'absolute', top:'100%', left:0, width:'260px', maxHeight:'240px', overflowY:'auto', background:'var(--bg-white)', border:'1.5px solid var(--border)', borderRadius:'12px', boxShadow:'var(--shadow-md)', zIndex:1000, marginTop:'5px'}}>
                        <input type="text" placeholder="Search country..." style={{width:'100%', padding:'10px', border:'none', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--bg-white)', color:'var(--text)'}} value={countrySearch} onChange={e => setCountrySearch(e.target.value)} autoFocus onClick={e => e.stopPropagation()} />
                        {ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)).map(c => (
                          <div key={c.name} style={{padding:'11px 12px', cursor:'pointer', fontSize:'0.85rem', borderBottom:'1px solid var(--border)', display:'flex', gap:'10px', color:'var(--text)'}}
                            onClick={() => { setFormState({...formState, countryCode: c.code}); setShowCountryList(false); setCountrySearch(''); }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--blue-light)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span>{c.flag}</span><strong>{c.code}</strong><span style={{color:'#64748b'}}>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <input style={{flex:1}} type="tel" name="phone" placeholder="Your contact number" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value.replace(/\D/g, '')})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Service You Need</label>
                  <select name="service" value={formState.service} onChange={handleChange}>
                    {['Functional Testing','Automation Testing','Performance Testing','Security Testing','AI-Powered Testing','Mobile Testing','Full QA Partnership'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tell Us About Your Project & Architecture</label>
                  <textarea name="message" placeholder="Brief overview - current stack, upcoming releases, QA pain points, or timeline..." value={formState.message} onChange={handleChange} />
                </div>

                {/* 🛡️ Secure Canvas CAPTCHA */}
                <div className="form-group captcha-group">
                  <label>Quick Security Check 🛡️</label>
                  <SecureCaptcha key={captchaKey} onValidate={setIsCaptchaValid} />
                </div>

                {/* 🛡️ DPDP Act, 2023 Affirmative Consent Checkbox */}
                <div className="form-group dpdp-consent-wrap" style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, userSelect: 'none' }}>
                    <input 
                      type="checkbox" 
                      name="dpdpConsent"
                      id="homeDpdpConsent"
                      checked={!!formState.dpdpConsent}
                      onChange={e => setFormState(s => ({ ...s, dpdpConsent: e.target.checked }))}
                      required
                      style={{ marginTop: '3px', width: '17px', height: '17px', accentColor: '#2563eb', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span>
                      I provide clear, affirmative consent under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> for Varsaka Labs to collect and process my personal data (name, email, phone number) for evaluating and responding to my inquiry in accordance with the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                <input type="text" name="_honey" style={{display:'none'}} />
                <button type="submit" className="submit-btn" id="submitBtn" disabled={submitting} style={btnColor ? {background:btnColor} : {}}>
                  {btnTxt}
                </button>
                <p className="form-privacy-note">🔒 Your details are safe with us. We operate strictly under bilateral NDA.</p>
              </form>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
