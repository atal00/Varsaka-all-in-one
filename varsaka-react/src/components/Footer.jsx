import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '1rem' }}>
            <img src={logo} alt="Varsaka Logo" style={{ height: 44, borderRadius: 8 }} />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: '800', lineHeight: '1.1', color: 'var(--text)' }}>Varsaka</span>
              <span style={{ fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.5px', color: '#94a3b8', textTransform: 'uppercase' }}>Quality Engineering</span>
            </div>
          </Link>
          <p>Varsaka Labs is a progressive technology firm with expertise in Software Testing, Quality Engineering, and End-to-End Development Solutions.</p>
        </div>

        <div className="footer-col">
          <h5>Services</h5>
          <ul>
            <li><Link to="/services/functional-testing">Functional Testing</Link></li>
            <li><Link to="/services/automation-testing">Automation Testing</Link></li>
            <li><Link to="/services/performance-testing">Performance Testing</Link></li>
            <li><Link to="/services/security-testing">Security Testing</Link></li>
            <li><Link to="/services/ai-powered-testing">AI-Powered Testing</Link></li>
            <li><Link to="/services/mobile-testing">Mobile Testing</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/case-studies">Case Studies</Link></li>

          </ul>
        </div>

        <div className="footer-col">
          <h5>Legal</h5>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
            <li><Link to="/nda-template">NDA Template</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© January 2026 Varsaka Labs. All rights reserved. Made with ❤️ in Hyderabad, India.</p>
        <div className="social-links">
          <a href="https://wa.me/917396106271" className="social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-whatsapp"></i>
          </a>
          <a href="https://www.linkedin.com/company/varsaka-labs-llp/posts/?feedView=all" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-linkedin-in"></i>
          </a>
          <a href="https://www.instagram.com/varsakalabs/?hl=en" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
