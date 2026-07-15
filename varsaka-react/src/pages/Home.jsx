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

const BACKEND_API = '/.netlify/functions/submitLead';
const GS_TARGET = import.meta.env.VITE_GS_SYNC_URL;

function useFadeIn() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 90);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const TOOLS = ['🔵 Selenium','⚫ Playwright','🟢 Cypress','🔴 JMeter','🟡 Postman','🟣 Appium','🔵 JIRA','⚫ Jenkins','🟢 GitHub Actions','🔴 Burp Suite','🟡 k6','🟣 TestRail'];

export default function Home() {
  useFadeIn();
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [services, setServices] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

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
          link: '/contact' // New services might not have a dedicated page yet
        })));
      }
      setServicesLoading(false);
      // Testimonials
      const { data: tData } = await supabase.from('testimonials').select('*').eq('status', 'approved').order('created_at', { ascending: false });
      if (tData) {
        setTestimonials(tData.map((t, idx) => ({
          stars: '⭐'.repeat(t.rating) + '☆'.repeat(5 - t.rating),
          text: `"${t.text}"`,
          name: t.client,
          role: t.company,
          bg: ['#2563eb', '#1d4ed8', '#3b82f6'][idx % 3],
          init: t.client.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
        })));
      }
      setTestimonialsLoading(false);

      // FAQs
      const { data: fData } = await supabase.from('faqs').select('*').order('created_at', { ascending: true });
      if (fData) {
        setFaqs(fData.map(f => ({
          q: f.question,
          a: f.answer,
          category: f.category
        })));
      }
      setFaqsLoading(false);
    };
    fetchDynamicContent();
  }, []);

  // 🛡️ Smooth Scroll Guardian (Fixes cross-page #hash links)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const [formState, setFormState] = useState({ 
    name: '', email: '', phone: '', countryCode: '+91', service: 'Functional Testing', message: '' 
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

    // 🛡️ BOT CHECK 0: Rate Limit (1 submission every 30 seconds)
    const lastSub = localStorage.getItem('varsaka_last_sub');
    const now = Date.now();
    if (lastSub && (now - parseInt(lastSub)) < 30000) {
      setBtnTxt('🛡️ Please wait 30s');
      setTimeout(() => setBtnTxt(<>{'Send Message'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>), 2000);
      return;
    }

    // 🛡️ BOT CHECK 1: Honeypot
    if (e.target._honey.value) return; 

    // 🛡️ BOT CHECK 2: Secure Canvas CAPTCHA
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
      // 🛡️ Data Sanitization
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

      // 1. Send Email Notification (Check if URL exists)
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
      } else {
        console.warn('Security Alert: VITE_FORMSUBMIT_URL is not configured.');
      }

      // 2. Save to Supabase Secure Database
      const { error: sbError } = await supabase
        .from('leads')
        .insert([{
          ...cleanData,
          source: 'Website' // 🌐 Source Tag
        }]);

      if (sbError) throw sbError;
      
      // 🛡️ Log submission time for security
      localStorage.setItem('varsaka_last_sub', Date.now().toString());

      // 3. Sync to Google Sheet (Live Mirror)
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
        setFormState({ name:'', email:'', phone:'', countryCode: '+91', service:'Functional Testing', message:'' }); 
        setCaptchaKey(prev => prev + 1); 
        setIsCaptchaValid(false);
      }, 3500);
    } catch (err) {
      // 🛡️ Critical Error Logging
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
        title="Top Software Testing Company | Quality Assurance Services"
        description="Varsaka Labs is a premier software testing company providing functional, automation, performance, security, and AI-powered QA services to help you ship bug-free software."
        keywords="testing companies, best software testing company, QA services India, test automation agency, performance testing services, security audit company"
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
        <div className="hero-badge"><div className="badge-dot" />🏆 India's Leading Software Testing Company</div>
        <h1>Varsaka Labs <span className="h1-blue h1-underline">Precision</span> in QA<br />Excellence in Testing</h1>
        <p className="hero-sub">The trusted partner for global testing companies and startups. Varsaka Labs delivers thorough software testing - functional, automation, performance, security and AI-powered - so your team ships with total confidence.</p>
        <div className="hero-btns">
          <a href="#contact" className="btn-primary">Start Free Consultation <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></a>
          <a href="#services" className="btn-ghost">See All Services <i className="fa-solid fa-arrow-down" style={{ marginLeft: '8px' }}></i></a>
        </div>
        <div className="hero-proof">
          <div className="proof-avs">
            {[['#2563eb','RS'],['#1d4ed8','PK'],['#3b82f6','AM'],['#1e40af','SK']].map(([bg,init]) => (
              <div key={init} className="proof-av" style={{background:bg}}>{init}</div>
            ))}
          </div>
          <div className="proof-copy">
            <span className="proof-stars">★★★★★</span>
            <strong>Trusted by 25+ clients in just 4 months</strong>
            99% satisfaction rate - quality you can count on
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-strip">
        {[['🚀','25+','Projects in 4 Months'],['😊','99%','Client Satisfaction'],['👩‍💻','20+','Expert Testers'],['⚡','5x','Faster Bug Detection']].map(([icon,num,label]) => (
          <div key={label} className="stat">
            <span className="stat-icon">{icon}</span>
            <span className="stat-num">{num}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* SERVICES */}
      <section id="services" className="bg-white">
        <div className="section-head fade-in">
          <div className="section-tag">✨ Our Services</div>
          <h2 className="section-title">Everything Your Software Needs to Succeed</h2>
          <p className="section-sub">From manual checks to AI-driven automation - we cover every layer of your application with care and precision.</p>
        </div>
        <div className="services-grid">
          {servicesLoading ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>Loading services...</div>
          ) : services.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>More services coming soon!</div>
          ) : services.map(s => (
            <Link key={s.title} to={s.link} className="svc-card fade-in" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="svc-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="svc-pill">{s.pill}</span>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 700 }}>Learn More <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOOLS MARQUEE */}
      <div className="tools-belt">
        <p className="tools-label">Tools & Technologies We Work With</p>
        <div style={{overflow:'hidden'}}>
          <div className="marquee">
            {[...TOOLS,...TOOLS].map((t,i) => <div key={i} className="tool-chip">{t}</div>)}
          </div>
        </div>
      </div>

      {/* PROCESS */}
      <section id="process" className="bg-soft">
        <div className="section-head center fade-in">
          <div className="section-tag">🗺️ Our Process</div>
          <h2 className="section-title">Simple, Transparent & Friendly</h2>
          <p className="section-sub">No jargon, no surprises. Here's exactly how we partner with you from day one to delivery.</p>
        </div>
        <div className="process-grid">
          {[
            {n:'01',icon:'🔍',title:'Discovery & Planning',desc:'We sit down with you, understand your app, and define a tailored testing strategy that fits your goals, tech stack, and timeline perfectly.'},
            {n:'02',icon:'📋',title:'Test Design',desc:'Our team writes clear test cases and builds automation frameworks - everything documented so you always know exactly what\'s being tested and why.'},
            {n:'03',icon:'🚀',title:'Execution & Reporting',desc:'We run tests, catch bugs early, and share live dashboards with plain-English insights. No confusing reports - just clear, actionable information.'},
            {n:'04',icon:'✅',title:'Sign-off & Support',desc:'Quality confirmed, final report delivered - and we stick around after go-live too. We\'re your long-term quality partner, not just a one-time vendor.'},
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

      {/* WHY VARSAKA */}
      <section id="why" className="bg-white">
        <div className="section-head fade-in">
          <div className="section-tag">💙 Why Varsaka Labs</div>
          <h2 className="section-title">Quality You Trust, People You'll Love Working With</h2>
          <p className="section-sub">We're not just testers - we're friendly partners who genuinely care about your product's success.</p>
        </div>
        <div className="why-grid">
          {[
            {icon:'⚡',title:'Fast Turnaround',desc:'Quick onboarding and accelerated cycles - ship faster without ever cutting corners on quality.'},
            {icon:'🎯',title:'Domain Expertise',desc:'Deep experience in fintech, healthcare, ecommerce, SaaS, and enterprise applications.'},
            {icon:'🔄',title:'CI/CD Ready',desc:'Seamless fit into your DevOps pipeline - automated tests trigger on every single commit.'},
            {icon:'📊',title:'Live Dashboards',desc:'Real-time test progress and bug tracking - complete visibility with zero mystery.'},
            {icon:'🔒',title:'NDA & Data Safe',desc:'Your IP is protected with strict NDAs, secure environments, and ISO-aligned processes.'},
            {icon:'💰',title:'Honest Pricing',desc:'Enterprise quality at startup-friendly rates. Flexible project or retainer - no surprise bills.'},
          ].map(w => (
            <div key={w.title} className="why-card fade-in">
              <div className="why-icon">{w.icon}</div>
              <div><h4>{w.title}</h4><p>{w.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-soft">
        <div className="section-head center fade-in">
          <div className="section-tag">💬 Client Stories</div>
          <h2 className="section-title">Teams Love Working with Varsaka Labs</h2>
          <p className="section-sub">Don't just take our word for it - here's what our happy clients have to say.</p>
        </div>
        <div className="testi-grid">
          {testimonialsLoading ? (
             <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>Loading client stories...</div>
          ) : testimonials.length === 0 ? (
             <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '2rem'}}>More client stories coming soon!</div>
          ) : testimonials.map(t => (
            <div key={t.name} className="testi-card fade-in">
              <div className="stars" style={{color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px', marginBottom: '1rem'}}>{t.stars}</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className="author-av" style={{background:t.bg}}>{t.init}</div>
                <div><div className="author-name">{t.name}</div><div className="author-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="section-head center fade-in">
          <div className="section-tag">🤔 FAQs</div>
          <h2 className="section-title">Common Questions</h2>
          <p className="section-sub">Have questions? We have answers. Here's what people usually ask us.</p>
        </div>
        <div className="faq-container fade-in">
          {faqsLoading ? (
            <div style={{textAlign: 'center', padding: '2rem'}}>Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div style={{textAlign: 'center', padding: '2rem'}}>More FAQs coming soon!</div>
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

      {/* CTA BANNER */}
      <div className="cta-banner">
        <h2>Ready to Ship with Total Confidence? 🚀</h2>
        <p>Book a free, no-pressure 30-minute chat. We'll review your app and suggest the best approach - completely free, no strings attached.</p>
        <div className="cta-btns">
          <a href="#contact" className="btn-white">Get Free Consultation</a>
          <a href="#services" className="btn-outline-white">Explore Services</a>
        </div>
      </div>

      {/* CONTACT */}
      <section id="contact" className="contact-section">
        <div className="contact-wrapper">

          {/* LEFT PANEL */}
          <div className="contact-left fade-in">
            <div className="contact-left-inner">
              <div className="contact-avail-badge">
                <span className="avail-dot" />
                Currently available for new projects
              </div>
              <h2 className="contact-left-title">Let's Build Something Great Together</h2>
              <p className="contact-left-sub">No pressure, no sales pitch - just an honest conversation about how we can help you ship better software, faster.</p>

              <div className="contact-tiles">
                {[
                  { icon: '📧', label: 'Email Us', val: 'info@varsaka.com', sub: 'We reply within 4 business hours' },
                  { icon: '💬', label: 'WhatsApp', val: <a href="https://wa.me/917396106271" style={{color:'inherit',textDecoration:'none'}}>+91 73961 06271</a>, sub: 'Quick questions? Chat instantly' },
                  { icon: '📍', label: 'Based In', val: 'Hyderabad, Telangana', sub: 'Serving clients across the globe' },
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
                {['🔒 NDA First', '⚡ 3-5 Day Kickoff', '🌍 Global Clients', '✅ 99% Satisfaction'].map(t => (
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
                  <p>We'll get back to you within 4 business hours.</p>
                </div>
                <span className="form-time-badge">⏱ 2 min</span>
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
                  <label>Tell Us About Your Project</label>
                  <textarea name="message" placeholder="Brief description - what you're building, current challenges, timeline, etc." value={formState.message} onChange={handleChange} />
                </div>

                {/* 🛡️ Secure Canvas CAPTCHA */}
                <div className="form-group captcha-group">
                  <label>Quick Security Check 🛡️</label>
                  <SecureCaptcha key={captchaKey} onValidate={setIsCaptchaValid} />
                </div>

                <input type="text" name="_honey" style={{display:'none'}} />
                <button type="submit" className="submit-btn" id="submitBtn" disabled={submitting} style={btnColor ? {background:btnColor} : {}}>
                  {btnTxt}
                </button>
                <p className="form-privacy-note">🔒 Your details are safe with us. We never spam or share your data.</p>
              </form>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
