import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import logo from '../assets/logo.png';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { sanitize } from '../utils/security'; // 🛡️ Security Guard
import SecurityLogsPanel from '../components/SecurityLogsPanel';
import './Portal.css';

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

const PROJECT_SUGGESTIONS = {
  'QA Intern': ['Automated Regression Suite', 'Security & Pen Testing', 'Mobile App Quality Audit', 'API Performance Benchmarking', 'Cross-Browser Compatibility Lab'],
  'Frontend Intern': ['Interactive Dashboard UI', 'Component Library Development', 'Responsive Website Redesign', 'E-commerce Frontend Optimization', 'Accessibility (WCAG) Compliance'],
  'Backend Intern': ['Scalable Microservices Architecture', 'Secure Authentication System', 'Real-time Data Processing', 'API Integration Middleware', 'Cloud Infrastructure Automation'],
  'Full Stack Intern': ['Workforce Management Portal', 'Customer Analytics Platform', 'Internal CRM System', 'Inventory Tracking Application', 'Collaborative Project Tool'],
  'Security Analyst Intern': ['Threat Intelligence Dashboard', 'Network Vulnerability Scan', 'Zero Trust Policy Framework', 'Encryption Standards Audit', 'Incident Response Protocol'],
  'HR Intern': ['Employee Engagement Survey', 'Talent Acquisition Pipeline', 'Onboarding Workflow Optimization', 'Policy Documentation Refresh', 'Staff Performance Metrics'],
  'Finance Intern': ['Accounts Reconciliation System', 'Budget Variance Analysis', 'Tax Compliance Reporting', 'Expense Tracking Dashboard', 'Financial Projection Modeling']
};

const CONGRATS_MESSAGES = [
  "🚀 Boom! Admin just approved your lead! Let's crush it!",
  "✅ Great job! Your submission has been given the green light!",
  "🌟 Outstanding! Admin loved your lead and it's now live!",
  "💪 Success! Another project added to your list. Keep it up!",
  "🔥 You're on fire! Your latest lead was just approved!"
];

const ASSIGNMENT_MESSAGES = [
  "💼 New Task Alert! Admin has picked you for a new project. Let's go!",
  "🎯 You've been chosen! A new lead is waiting for your expertise.",
  "🚀 Ready for a new challenge? You've just been assigned a task!",
  "🌟 Congratulations! Admin has entrusted you with this new inquiry.",
  "📈 Fresh Assignment! A new project is now under your care."
];

export default function Portal() {
  const { session: authSession, userRole, signOut } = useAuth();
  
  // Mimic old session object for minimal refactoring
  const session = authSession ? {
    id: authSession.user.id,
    role: userRole,
    name: authSession.user.user_metadata?.full_name || authSession.user.email?.split('@')[0] || 'User',
    email: authSession.user.email
  } : null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showTeam, setShowTeam] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [infoIcon, setInfoIcon] = useState({ url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f6e1_fe0f/512.gif', fallback: '🛡️' });

  const INFO_ICONS = [
    { url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f6e1_fe0f/512.gif', fallback: '🛡️' },
    { url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f512/512.gif',      fallback: '🔒' },
    { url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f511/512.gif',      fallback: '🔑' },
    { url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a1/512.gif',      fallback: '💡' },
    { url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/512.gif',      fallback: '🚀' },
    { url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4cc/512.gif',      fallback: '📌' }
  ];

  const triggerInfo = (msg) => {
    if (showInfoModal) return; // 🛡️ Prevent rapid-fire clicks/Enter key spam
    setInfoMsg(msg);
    const iconObj = INFO_ICONS[msg.length % INFO_ICONS.length];
    setInfoIcon(iconObj);
    setShowInfoModal(true);
  };

  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ 
    name: '', email: '', phone: '', countryCode: '+91', service: 'Functional Testing', msg: '' 
  });
  const [addingLead, setAddingLead] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);

  // Celebration System
  const [celebration, setCelebration] = useState(null);

  // Modal States for new features
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // --- Certificate Management States ---
  const [showInterns, setShowInterns] = useState(false);
  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(false);
  const [showAddIntern, setShowAddIntern] = useState(false);
  const [newIntern, setNewIntern] = useState({
    full_name: '',
    internship_role: 'QA Intern',
    project_title: '',
    mentor_name: 'Technical Director',
    grade: 'A+',
    location: 'Gachibowli, Hyderabad',
    start_date: '',
    end_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    cert_year: new Date().getFullYear().toString(),
    cert_num: '',
    certificate_id: ''
  });
  const [addingIntern, setAddingIntern] = useState(false);
  
  const [mockUsers, setMockUsers] = useState([]);

  const [settingsTab, setSettingsTab] = useState('profile');
  
  // --- Generic Modal State for Mock CRUD ---
  const [genericModal, setGenericModal] = useState({ isOpen: false, type: '', data: null });
  const [mockServices, setMockServices] = useState([]);
  const [mockBlogs, setMockBlogs] = useState([]);
  const [mockTestimonials, setMockTestimonials] = useState([]);
  const [mockFaqs, setMockFaqs] = useState([]);

  const handleOpenGenericModal = (type, data = null) => {
    setGenericModal({ isOpen: true, type, data });
  };

  const handleCloseGenericModal = () => {
    setGenericModal({ isOpen: false, type: '', data: null });
  };

  const handleGenericSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updates = Object.fromEntries(fd.entries());
    
    let table = '';
    if (genericModal.type === 'Service') table = 'services';
    else if (genericModal.type === 'Blog') table = 'blogs';
    else if (genericModal.type === 'Testimonial') table = 'testimonials';
    else if (genericModal.type === 'FAQ') table = 'faqs';
    
    // For users, it's more complex (Supabase Auth). We skip database modification for mocked users for now.
    if (genericModal.type === 'User') {
      if (genericModal.data) setMockUsers(mockUsers.map(s => s.id === genericModal.data.id ? {...s, ...updates} : s));
      else setMockUsers([...mockUsers, { id: Date.now().toString(), lastLogin: 'Never', ...updates }]);
      handleCloseGenericModal();
      return;
    }

    try {
      if (genericModal.data) {
        const { error } = await supabase.from(table).update(updates).eq('id', genericModal.data.id);
        if (error) throw error;
        
        if (table === 'services') setMockServices(mockServices.map(s => s.id === genericModal.data.id ? {...s, ...updates} : s));
        if (table === 'blogs') setMockBlogs(mockBlogs.map(s => s.id === genericModal.data.id ? {...s, ...updates} : s));
        if (table === 'testimonials') setMockTestimonials(mockTestimonials.map(s => s.id === genericModal.data.id ? {...s, ...updates} : s));
        if (table === 'faqs') setMockFaqs(mockFaqs.map(s => s.id === genericModal.data.id ? {...s, ...updates} : s));
      } else {
        const { data, error } = await supabase.from(table).insert([updates]).select();
        if (error) throw error;
        
        const newItem = data[0];
        if (table === 'services') setMockServices([newItem, ...mockServices]);
        if (table === 'blogs') setMockBlogs([newItem, ...mockBlogs]);
        if (table === 'testimonials') setMockTestimonials([newItem, ...mockTestimonials]);
        if (table === 'faqs') setMockFaqs([newItem, ...mockFaqs]);
      }
      handleCloseGenericModal();
    } catch (err) {
      alert(`Database Error: ${err.message}. Have you run the migrations.sql script?`);
    }
  };

  const handleGenericDelete = async () => {
    let table = '';
    if (genericModal.type === 'Service') table = 'services';
    else if (genericModal.type === 'Blog') table = 'blogs';
    else if (genericModal.type === 'Testimonial') table = 'testimonials';
    else if (genericModal.type === 'FAQ') table = 'faqs';

    if (genericModal.type === 'User') {
      setMockUsers(mockUsers.filter(s => s.id !== genericModal.data.id));
      handleCloseGenericModal();
      return;
    }

    try {
      const { error } = await supabase.from(table).delete().eq('id', genericModal.data.id);
      if (error) throw error;

      if (table === 'services') setMockServices(mockServices.filter(s => s.id !== genericModal.data.id));
      if (table === 'blogs') setMockBlogs(mockBlogs.filter(s => s.id !== genericModal.data.id));
      if (table === 'testimonials') setMockTestimonials(mockTestimonials.filter(s => s.id !== genericModal.data.id));
      if (table === 'faqs') setMockFaqs(mockFaqs.filter(s => s.id !== genericModal.data.id));
      
      handleCloseGenericModal();
    } catch (err) {
      alert(`Database Error: ${err.message}. Have you run the migrations.sql script?`);
    }
  };

  // --- Smart ID Suggestion Logic ---
  useEffect(() => {
    if (showAddIntern && interns.length > 0) {
      const yearPrefix = `VAR-INT-${newIntern.cert_year}-`;
      const yearNums = interns
        .filter(i => i.certificate_id.startsWith(yearPrefix))
        .map(i => {
          const parts = i.certificate_id.split('-');
          const num = parseInt(parts[parts.length - 1]);
          return isNaN(num) ? 0 : num;
        });

      const nextNum = yearNums.length > 0 ? Math.max(...yearNums) + 1 : 1;
      // Pad to 3 digits (e.g. 001, 015, 120)
      const paddedNum = nextNum.toString().padStart(3, '0');
      
      setTimeout(() => {
        setNewIntern(prev => ({ ...prev, cert_num: paddedNum }));
      }, 0);
    }
  }, [newIntern.cert_year, showAddIntern, interns]);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 🛡️ SECURITY FIX 3: Network Data Minimization
      // Prevent data leakage over network by strictly querying only assigned leads for employees
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      
      if (session.role === 'employee') {
        query = query.eq('assigned_to', session.id);
      }
      
      const { data: leads, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;

      // Fetch other data
      const [
        { data: sData },
        { data: bData },
        { data: tData },
        { data: fData }
      ] = await Promise.all([
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('blogs').select('*').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('faqs').select('*').order('created_at', { ascending: false })
      ]);

      if (sData) setMockServices(sData);
      if (bData) setMockBlogs(bData);
      if (tData) setMockTestimonials(tData);
      if (fData) setMockFaqs(fData);

      setData(leads.map(l => ({
        id: l.id,
        time: new Date(l.created_at).toLocaleString(),
        name: l.name,
        email: l.email,
        phone: l.phone,
        service: l.service,
        msg: l.message,
        notes: l.notes || '',
        status: l.status || 'new',
        assigned_to: l.assigned_to,
        rejected_at: l.rejected_at,
        approval_seen: l.approval_seen,
        source: l.source || 'Unknown' // 👈 Map source
      })));

      // 🎊 Celebration Check (Only for Employee)
      if (session.role === 'employee') {
        // 1. Check for newly approved leads
        const newlyApproved = leads.find(l => 
          l.assigned_to === session.id && 
          l.status === 'new' && 
          !localStorage.getItem(`celebrated_${l.id}`)
        );

        if (newlyApproved) {
          const msg = CONGRATS_MESSAGES[Math.floor(Math.random() * CONGRATS_MESSAGES.length)];
          setCelebration({ name: newlyApproved.name, message: msg, type: 'approval' });
          localStorage.setItem(`celebrated_${newlyApproved.id}`, 'true');
        } 
        // 2. Or check for newly assigned leads (if not already approved/celebrated)
        else {
          const newlyAssigned = leads.find(l => 
            l.assigned_to === session.id && 
            l.status !== 'rejected' &&
            l.status !== 'approval_pending' && // 🛡️ Fix: Don't celebrate yet!
            !localStorage.getItem(`assigned_notified_${l.id}`)
          );

          if (newlyAssigned) {
            const msg = ASSIGNMENT_MESSAGES[Math.floor(Math.random() * ASSIGNMENT_MESSAGES.length)];
            setCelebration({ name: newlyAssigned.name, message: msg, type: 'assignment' });
            localStorage.setItem(`assigned_notified_${newlyAssigned.id}`, 'true');
          }
        }
      }
    } catch (e) {
      console.error('Portal Data Error:', e);
      setError(e.message);
    }
    setLoading(false);
  };

  const fetchStaff = async () => {
    try {
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
      if (pError) throw pError;
      setStaffList(profiles.map(p => ({ id: p.id, name: p.full_name, email: p.email })));
    } catch (e) {
      console.error('Staff Fetch Error:', e);
    }
  };

  const fetchInterns = async () => {
    setLoadingInterns(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInterns(data);
    } catch (e) {
      console.error('Fetch Interns Error:', e);
      triggerInfo('Failed to load interns: ' + e.message);
    }
    setLoadingInterns(false);
  };

  // Session validation is now handled strictly by AuthContext.

  // Fetch data only after session is validated and set
  useEffect(() => {
    if (session) {
      setTimeout(() => {
        fetchData();
        fetchStaff();
      }, 0);
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // 🔔 Post-Login Notification
  useEffect(() => {
    if (session && !sessionStorage.getItem('notified_refresh')) {
      setTimeout(() => {
        triggerInfo('Welcome back! Kindly refresh from the top button to see the latest leads.');
      }, 0);
      sessionStorage.setItem('notified_refresh', 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // 🧹 BACKGROUND CLEANUP: Auto-delete rejected leads after 60 mins
  useEffect(() => {
    const cleanup = async () => {
      const now = new Date();
      const sixtyMinsAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      
      const { data: expired } = await supabase
        .from('leads')
        .select('id')
        .eq('status', 'rejected')
        .lt('rejected_at', sixtyMinsAgo);

      if (expired && expired.length > 0) {
        const ids = expired.map(e => e.id);
        await supabase.from('leads').delete().in('id', ids);
        fetchData();
      }
    };

    const timer = setInterval(cleanup, 60000); // Check every minute
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ⌨️ Modal Accessibility: Focus the button when modal opens
  useEffect(() => {
    if (showInfoModal) {
      setTimeout(() => {
        const btn = document.getElementById('btn-info-close');
        if (btn) btn.focus();
      }, 50);
    }
  }, [showInfoModal]);



  const addIntern = async (e) => {
    e.preventDefault();
    if (session?.role !== 'admin') {
      return triggerInfo('Error: Only Admins can add certificates.');
    }
    if (!newIntern.full_name || !newIntern.cert_num || !newIntern.start_date || !newIntern.end_date) {
      return triggerInfo('Please fill in all required fields (Name, Serial Number, and Dates)');
    }
    setAddingIntern(true);
    try {
      const internData = {
        full_name: sanitize(newIntern.full_name),
        internship_role: sanitize(newIntern.internship_role),
        project_title: sanitize(newIntern.project_title),
        mentor_name: sanitize(newIntern.mentor_name),
        grade: sanitize(newIntern.grade),
        location: sanitize(newIntern.location),
        start_date: newIntern.start_date,
        end_date: newIntern.end_date,
        issue_date: newIntern.issue_date,
        certificate_id: `VAR-INT-${newIntern.cert_year}-${newIntern.cert_num}`
      };
      
      if (internData.internship_role === 'other') {
        internData.internship_role = sanitize(internData.custom_role) || 'Intern';
      }
      delete internData.custom_role;
      delete internData.cert_year;
      delete internData.cert_num;

      const { error } = await supabase
        .from('certificates')
        .insert([internData]);
      if (error) throw error;
      triggerInfo('Intern certificate added successfully!');
      setNewIntern({
        full_name: '',
        internship_role: 'QA Intern',
        project_title: '',
        mentor_name: 'Technical Director',
        grade: 'A+',
        location: 'Gachibowli, Hyderabad',
        start_date: '',
        end_date: '',
        issue_date: new Date().toISOString().split('T')[0],
        cert_year: new Date().getFullYear().toString(),
        cert_num: '',
        certificate_id: ''
      });
      setShowAddIntern(false);
      fetchInterns();
    } catch (e) {
      triggerInfo('Error: ' + e.message);
    }
    setAddingIntern(false);
  };

  const deleteIntern = async (id) => {
    if (session?.role !== 'admin') {
      triggerInfo('Error: Only Admins can delete intern records.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this intern record?')) return;
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) triggerInfo('Delete failed: ' + error.message);
    else fetchInterns();
  };

  const handleLogout = async () => {
    await signOut();
    sessionStorage.removeItem('notified_refresh'); // 🔄 Clear flag on logout
    navigate('/login');
  };

  const assignTask = async (leadId, staffId) => {
    if (session?.role !== 'admin') {
      triggerInfo('Error: Only Admins can assign tasks.');
      return;
    }
    const { error: updateError } = await supabase
      .from('leads')
      .update({ assigned_to: staffId || null })
      .eq('id', leadId);

    if (updateError) {
      triggerInfo('Failed to assign task: ' + updateError.message);
    } else fetchData();
  };



  const updateStaffName = async (sid, newName) => {
    if (!newName) return;
    if (session?.role !== 'admin' && sid !== session?.id) {
      triggerInfo('Error: You can only update your own profile name.');
      return;
    }
    await supabase.from('profiles').update({ full_name: newName }).eq('id', sid);
    fetchStaff();
  };

  const removeStaff = (sid) => {
    if (sid === session.id) return triggerInfo('You cannot delete yourself!');
    triggerInfo('Kindly connect with your super admin to add or delete any employee.');
  };

  const updateStatus = async (id, val) => {
    if (session?.role === 'employee') {
      const lead = data.find(r => r.id === id);
      if (!lead || lead.assigned_to !== session.id) {
        triggerInfo('Error: You can only update leads assigned to you.');
        return;
      }
    }
    const { error: updateError } = await supabase.from('leads').update({ status: val }).eq('id', id);
    if (updateError) {
      triggerInfo('Failed to update status: ' + updateError.message);
    } else fetchData();
  };

  const updateNoteLocally = (id, text) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, notes: text } : r));
  };

  const saveNoteToDB = async (id, text) => {
    if (session?.role === 'employee') {
      const lead = data.find(r => r.id === id);
      if (!lead || lead.assigned_to !== session.id) {
        console.warn('Block: Attempted to edit notes on unassigned lead.');
        return;
      }
    }
    const { error: updateError } = await supabase.from('leads').update({ notes: text }).eq('id', id);
    if (updateError) console.error('Auto-save failed:', updateError.message);
  };

  const deleteRow = (id) => {
    if (session?.role !== 'admin') return;
    const targetRow = data.find(r => r.id === id);
    if (!targetRow) return;
    setDeleteTarget(targetRow);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (session?.role !== 'admin') {
      triggerInfo('Error: Only Admins can delete leads.');
      return;
    }
    if (!deleteTarget) return;
    const { id, email } = deleteTarget;
    
    const { error: deleteError } = await supabase.from('leads').delete().eq('id', id);
    
    if (deleteError) {
      triggerInfo('Failed to delete from DB: ' + deleteError.message);
    } else {
      // --- GOOGLE SHEET SYNC (DELETE) ---
      const gsUrl = import.meta.env.VITE_GS_SYNC_URL;
      if (gsUrl) {
        fetch(gsUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action: 'delete', email: email })
        }).catch(err => console.error('GS Sync Error:', err));
      }
      setShowDeleteModal(false);
      fetchData();
    }
  };

  const addLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) {
      return triggerInfo('Please enter Name and Email');
    }
    
    setAddingLead(true);
    try {
      const isStaff = session.role === 'employee';
      const { error: insError } = await supabase.from('leads').insert([{
        name: sanitize(newLead.name),
        email: sanitize(newLead.email),
        phone: `${newLead.countryCode} ${sanitize(newLead.phone)}`,
        service: sanitize(newLead.service),
        message: sanitize(newLead.msg),
        status: isStaff ? 'approval_pending' : 'new',
        assigned_to: isStaff ? session.id : null,
        source: session.name || 'Direct Admin'
      }]);

      if (insError) throw insError;

      triggerInfo(isStaff ? 'Lead submitted for Admin approval!' : 'Lead added successfully!');
      
      // 🛡️ GATED APPROVAL: Only sync to GS if Admin is adding it directly.
      // Employee leads wait for Admin Approval.
      const gsUrl = import.meta.env.VITE_GS_SYNC_URL;
      if (!isStaff && gsUrl) {
        fetch(gsUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ 
            action: 'add', 
            ...newLead,
            phone: `'${newLead.countryCode} ${newLead.phone}` // 🛠️ Fix: Add ' to prevent GS formula error
          })
        }).catch(err => console.error('GS Sync Error:', err));
      }
      
      setNewLead({ name: '', email: '', phone: '', countryCode: '+91', service: 'Functional Testing', msg: '' });
      setShowAddLead(false);
      fetchData();
    } catch (err) {
      triggerInfo('Error: ' + err.message);
    }
    setAddingLead(false);
  };

  const approveLead = async (lead) => {
    if (session?.role !== 'admin') {
      triggerInfo('Error: Only Admins can approve leads.');
      return;
    }
    const { error } = await supabase.from('leads').update({ status: 'new' }).eq('id', lead.id);
    
    const gsUrl = import.meta.env.VITE_GS_SYNC_URL;
    if (!error && gsUrl) {
      // 🚀 SYNC TO GOOGLE SHEETS ONLY ON APPROVAL
      fetch(gsUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
          action: 'add', 
          name: lead.name,
          email: lead.email,
          phone: `'${lead.phone}`, // 🛠️ Fix: Add ' to prevent GS formula error
          service: lead.service,
          msg: lead.msg 
        })
      }).catch(err => console.error('GS Sync Error:', err));
    }
    
    fetchData();
  };

  const exportToCSV = () => {
    if (session?.role !== 'admin') {
      return triggerInfo('Error: Only Admins can export data.');
    }
    if (data.length === 0) {
      return triggerInfo('No data to export!');
    }
    
    const headers = ['Time', 'Client Name', 'Email', 'Phone', 'Service', 'Message', 'Status', 'Notes'];
    const rows = data.map(r => [
      `"${r.time}"`,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.phone || ''}"`,
      `"${r.service}"`,
      `"${r.msg.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Varsaka_Leads_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rejectLead = async () => {
    if (session?.role !== 'admin') {
      triggerInfo('Error: Only Admins can reject leads.');
      return;
    }
    if (!rejectReason.trim()) return;
    await supabase.from('leads').update({ 
      status: 'rejected',
      notes: `🚫 REJECTED: ${rejectReason}`,
      rejected_at: new Date().toISOString() // ⏱️ Start countdown
    }).eq('id', rejectId);
    setShowRejectModal(false);
    setRejectReason('');
    fetchData();
  };

  // 📈 Stats Calculation
  const stats = (() => {
    const relevant = data.filter(r => session?.role === 'admin' || r.assigned_to === session?.id);
    return {
      total: relevant.length,
      new: relevant.filter(r => r.status === 'new').length,
      ongoing: relevant.filter(r => r.status === 'ongoing').length,
      completed: relevant.filter(r => r.status === 'completed').length,
      needsReview: relevant.filter(r => r.status === 'approval_pending').length
    };
  })();

  // 🔍 Filtering Logic
  const filteredData = data.filter(r => {
    if (session?.role === 'employee' && r.assigned_to !== session?.id) return false;
    if (filter !== 'all' && r.status !== filter) return false;
    const s = search.toLowerCase();
    return r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s) || r.msg.toLowerCase().includes(s);
  });

  if (!session) return <div style={{height: '100vh', background: 'red', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>DEBUG: SESSION IS NULL IN PORTAL!</div>;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'Jobs') {
      setShowTeam(false);
      fetchInterns();
    } else if (tab === 'Care Requests') {
      setShowTeam(false);
    }
  };

  const MENU_ITEMS = [
    { id: 'Dashboard', icon: 'fa-solid fa-chart-pie', label: 'Dashboard' },
    { id: 'Services', icon: 'fa-solid fa-layer-group', label: 'Services' },
    { id: 'Blog', icon: 'fa-solid fa-pen-nib', label: 'Blog' },
    { id: 'Case Studies', icon: 'fa-solid fa-book-open', label: 'Case Studies' },
    { id: 'Care Requests', icon: 'fa-solid fa-heart-pulse', label: 'Care Requests' },
    { id: 'Jobs', icon: 'fa-solid fa-user-tie', label: 'Jobs' },
    { id: 'Testimonials', icon: 'fa-solid fa-comment-dots', label: 'Testimonials' },
    { id: 'FAQ', icon: 'fa-solid fa-circle-question', label: 'FAQ' },
    { id: 'Media', icon: 'fa-solid fa-image', label: 'Media' },
    { id: 'Users', icon: 'fa-solid fa-users', label: 'Users' },
    { id: 'Security Logs', icon: 'fa-solid fa-shield-halved', label: 'Security Logs' },
    { id: 'Settings', icon: 'fa-solid fa-gear', label: 'Settings' }
  ];

  return (
    <div className="admin-layout">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Varsaka Labs" />
          <div className="sidebar-brand-text">
            <h2>Varsaka Labs</h2>
            <span>Admin Panel</span>
          </div>
        </div>
        
        <div className="sidebar-menu-title">Menu</div>
        
        <nav className="sidebar-nav">
          {MENU_ITEMS.map(item => (
            <div 
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{session.name.charAt(0)}</div>
          <div className="sidebar-user-info">
            <strong>{session.name}</strong>
            <span>{session.email}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        <header className="admin-topbar">
          <h1>{activeTab}</h1>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-user-text">
                <strong>{session.name}</strong>
                <span>{session.email}</span>
              </div>
              <div className="topbar-avatar">{session.name.slice(0, 2).toUpperCase()}</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} style={{marginLeft: '10px', padding: '0.5rem 1rem'}}>Logout</button>
          </div>
        </header>

        <main className="admin-content">

        {activeTab === 'Dashboard' && (
          <>
            <div className="dash-stats-grid">
              <div className="dash-card">
                <div className="dash-card-title">Total Posts</div>
                <div className="dash-card-value">3</div>
                <div className="dash-card-footer"><i className="fa-solid fa-minus"></i> 3 case studies</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Services</div>
                <div className="dash-card-value">6</div>
                <div className="dash-card-footer"><i className="fa-solid fa-minus"></i> All active</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Care Requests</div>
                <div className="dash-card-value">{stats.new}</div>
                <div className="dash-card-footer"><i className="fa-solid fa-minus"></i> {stats.new} pending</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Testimonials</div>
                <div className="dash-card-value">3</div>
                <div className="dash-card-footer"><i className="fa-solid fa-minus"></i> Active</div>
              </div>
            </div>

            <div className="dash-bottom-grid">
              <div className="dash-panel">
                <h3>Recent Care Requests</h3>
                {data.length === 0 ? (
                  <div className="empty-state">No care requests yet.</div>
                ) : (
                  <div className="leads-table-wrap">
                    <table className="leads-table">
                      <thead>
                        <tr>
                          <th>Client Name</th>
                          <th>Service</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.slice(0, 5).map(r => (
                          <tr key={r.id}>
                            <td><strong>{r.name}</strong></td>
                            <td><span className="service-tag">{r.service}</span></td>
                            <td><span className={`role-badge ${r.status === 'new' ? 'admin' : 'employee'}`}>{r.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="dash-panel">
                <h3>Quick Actions</h3>
                <div className="quick-actions-list">
                  <div className="quick-action-btn">
                    <span>New Blog Post</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                  <div className="quick-action-btn">
                    <span>Manage Services</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                  <div className="quick-action-btn" onClick={() => handleTabChange('Care Requests')}>
                    <span>Care Requests</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                  <div className="quick-action-btn">
                    <span>Testimonials</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </div>

                <div className="system-status">
                  <div className="status-dot"></div>
                  <span>System Status</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Services' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Services Management</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}} onClick={() => handleOpenGenericModal('Service')}>➕ Add Service</button>
              </div>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockServices.map(srv => (
                    <tr key={srv.id}>
                      <td><strong>{srv.name}</strong></td>
                      <td><span className="pill badge-blue">{srv.category}</span></td>
                      <td>
                        <span className={`status-badge ${srv.status === 'active' ? 'status-new' : 'status-in-progress'}`}>{srv.status}</span>
                      </td>
                      <td>
                        <button className="btn-action" onClick={() => handleOpenGenericModal('Service', srv)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Blog' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Blog Content</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}} onClick={() => handleOpenGenericModal('Blog')}>✍️ New Post</button>
              </div>
              <div className="filter-row" style={{marginBottom: '1rem'}}>
                <button className="filter-btn active">All Posts</button>
                <button className="filter-btn">Published</button>
                <button className="filter-btn">Drafts</button>
              </div>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBlogs.map(post => (
                    <tr key={post.id}>
                      <td><strong>{post.title}</strong></td>
                      <td><span className={`status-badge ${post.status === 'published' ? 'status-won' : 'status-lost'}`}>{post.status}</span></td>
                      <td>{post.views}</td>
                      <td>{post.date}</td>
                      <td>
                        <button className="btn-action" onClick={() => handleOpenGenericModal('Blog', post)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Case Studies' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Case Studies</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}}>➕ Add Study</button>
              </div>
              <div className="empty-state" style={{marginTop: '2rem'}}>
                <h3>No Case Studies Published</h3>
                <p>Add your first case study to showcase your work.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Testimonials' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Client Testimonials</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}} onClick={() => handleOpenGenericModal('Testimonial')}>➕ Add Testimonial</button>
              </div>
              <div className="interns-grid" style={{marginTop: '1.5rem'}}>
                {mockTestimonials.map(t => (
                  <div key={t.id} className="intern-card" style={{cursor: 'pointer'}} onClick={() => handleOpenGenericModal('Testimonial', t)}>
                    <div className="intern-card-header">
                      <h3>{t.client}</h3>
                      <span className={`status-badge ${t.status === 'approved' ? 'status-won' : 'status-in-progress'}`}>{t.status}</span>
                    </div>
                    <div className="intern-card-body">
                      <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>{t.company}</p>
                      <p>"{t.text}"</p>
                      <p style={{color: 'gold', marginTop: '10px'}}>{"★".repeat(t.rating)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FAQ' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>FAQ Manager</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}} onClick={() => handleOpenGenericModal('FAQ')}>➕ Add Question</button>
              </div>
              <div className="interns-grid" style={{marginTop: '1.5rem'}}>
                {mockFaqs.map(f => (
                  <div key={f.id} className="intern-card" style={{borderLeft: '4px solid var(--brand-blue)', cursor: 'pointer'}} onClick={() => handleOpenGenericModal('FAQ', f)}>
                    <div className="intern-card-header">
                      <h3>{f.question}</h3>
                      <span className="pill badge-purple">{f.category}</span>
                    </div>
                    <div className="intern-card-body">
                      <p>{f.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Media' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Media Library</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}}>☁️ Upload</button>
              </div>
              <div className="empty-state" style={{marginTop: '2rem', border: '2px dashed #ddd', background: '#f9fafb'}}>
                <h3>Drag & Drop Files Here</h3>
                <p>Support for PNG, JPG, PDF, SVG</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Role Management</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}} onClick={() => handleOpenGenericModal('User')}>➕ Invite User</button>
              </div>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(user => (
                    <tr key={user.id}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span className={`pill ${user.role === 'admin' ? 'badge-blue' : 'badge-purple'}`}>{user.role}</span></td>
                      <td>{user.lastLogin}</td>
                      <td><span className={`status-badge ${user.status === 'active' ? 'status-won' : 'status-lost'}`}>{user.status}</span></td>
                      <td>
                        <button className="btn-action" onClick={() => handleOpenGenericModal('User', user)}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Security Logs' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <SecurityLogsPanel />
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Platform Settings</h2>
              </div>
              <div className="settings-container" style={{display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap'}}>
                <div className="settings-nav" style={{flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <button className={`filter-btn ${settingsTab === 'profile' ? 'active' : ''}`} onClick={() => setSettingsTab('profile')} style={{textAlign: 'left', width: '100%'}}>Profile</button>
                  <button className={`filter-btn ${settingsTab === 'security' ? 'active' : ''}`} onClick={() => setSettingsTab('security')} style={{textAlign: 'left', width: '100%'}}>Security & 2FA</button>
                  <button className={`filter-btn ${settingsTab === 'api' ? 'active' : ''}`} onClick={() => setSettingsTab('api')} style={{textAlign: 'left', width: '100%'}}>API Keys</button>
                  <button className={`filter-btn ${settingsTab === 'notifications' ? 'active' : ''}`} onClick={() => setSettingsTab('notifications')} style={{textAlign: 'left', width: '100%'}}>Notifications</button>
                </div>
                <div className="settings-content" style={{flex: 1, minWidth: '300px', padding: '2rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #eee'}}>
                  {settingsTab === 'profile' && (
                    <div>
                      <h3>Profile Settings</h3>
                      <p style={{color: '#666', marginBottom: '1.5rem'}}>Update your personal information.</p>
                      <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label style={{fontWeight: 600, fontSize: '0.9rem', color: '#4b5563'}}>Full Name</label>
                        <input type="text" className="portal-input" value={session.name} readOnly style={{marginTop: '0.5rem'}} />
                      </div>
                      <div className="form-group">
                        <label style={{fontWeight: 600, fontSize: '0.9rem', color: '#4b5563'}}>Email Address</label>
                        <input type="email" className="portal-input" value={session.email} readOnly style={{marginTop: '0.5rem'}} />
                      </div>
                    </div>
                  )}
                  {settingsTab === 'security' && (
                    <div>
                      <h3>Security & 2FA</h3>
                      <p style={{color: '#666', marginBottom: '1.5rem'}}>Protect your account with additional security.</p>
                      <div className="empty-state" style={{padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        <p>Two-factor authentication is not configured.</p>
                        <button className="btn-settings" style={{marginTop: '1rem', background: 'var(--brand-blue)', color: 'white'}}>Enable 2FA</button>
                      </div>
                    </div>
                  )}
                  {settingsTab === 'api' && (
                    <div>
                      <h3>API Keys</h3>
                      <p style={{color: '#666', marginBottom: '1.5rem'}}>Manage API tokens for external integrations.</p>
                      <div className="empty-state" style={{padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        <p>No API keys generated.</p>
                        <button className="btn-settings" style={{marginTop: '1rem', background: '#10b981', color: 'white', border: 'none'}}>Generate Key</button>
                      </div>
                    </div>
                  )}
                  {settingsTab === 'notifications' && (
                    <div>
                      <h3>Notification Preferences</h3>
                      <p style={{color: '#666', marginBottom: '1.5rem'}}>Choose what you want to be notified about.</p>
                      <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', cursor: 'pointer'}}>
                          <input type="checkbox" defaultChecked /> Email alerts for new Leads
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                          <input type="checkbox" defaultChecked /> Email alerts for new Job Applications
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'Care Requests' || activeTab === 'Jobs') && (
          <div className="portal-container" style={{padding: 0}}>
            
            {/* Context Actions */}
            <div className="filter-row" style={{justifyContent: 'flex-end', marginBottom: '1rem'}}>
              {activeTab === 'Care Requests' && (
                <button className="btn-settings" onClick={() => setShowAddLead(!showAddLead)}>
                  {showAddLead ? '✕ Close Form' : '➕ Add Lead'}
                </button>
              )}
              {session.role === 'admin' && activeTab === 'Care Requests' && (
                <button className="btn-settings" onClick={() => setShowTeam(!showTeam)}>
                  {showTeam ? '📋 Show Leads' : '👥 Team Workload'}
                </button>
              )}
              {session.role === 'admin' && activeTab === 'Jobs' && (
                <button className="btn-settings" style={{background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff'}} onClick={() => setShowAddIntern(!showAddIntern)}>
                  ➕ Add Intern
                </button>
              )}
              <button className="btn-refresh" onClick={() => exportToCSV()} style={{background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0'}}>📥 Export Data</button>
              <button className="btn-refresh" onClick={() => fetchData()} disabled={loading}>↻ {loading ? '...' : 'Refresh'}</button>
            </div>

        {showAddLead && (
          <div className="portal-settings-panel fade-in visible" style={{borderColor: '#2563eb'}}>
            <h3>➕ Add New Lead</h3>
            <form className="add-lead-form" onSubmit={addLead}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Client Name</label>
                  <input type="text" placeholder="Full Name" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="email@example.com" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <div style={{display:'flex', gap:'5px', position:'relative'}}>
                    <div 
                      className="country-picker-trigger"
                      style={{
                        width:'100px', padding:'0.5rem', borderRadius:'8px', border:'1px solid #e2e8f0', 
                        background:'white', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center',
                        fontSize: '0.85rem', fontWeight: '600'
                      }}
                      onClick={() => setShowCountryList(!showCountryList)}
                    >
                      <span>{newLead.countryCode}</span>
                      <span>▾</span>
                    </div>

                    {showCountryList && (
                      <div className="country-dropdown-list" style={{
                        position:'absolute', top:'100%', left:0, width:'250px', maxHeight:'300px', 
                        overflowY:'auto', background:'white', border:'1px solid #e2e8f0', 
                        borderRadius:'12px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)', zIndex:1000, marginTop:'5px'
                      }}>
                        <input 
                          type="text" 
                          placeholder="Search country..." 
                          style={{width:'100%', padding:'10px', border:'none', borderBottom:'1px solid #f1f5f9', position:'sticky', top:0, background:'white'}}
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                        {ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.code.includes(countrySearch)).map(c => (
                          <div 
                            key={c.name}
                            style={{padding:'12px', cursor:'pointer', fontSize:'0.85rem', borderBottom:'1px solid #f8fafc', display:'flex', gap:'10px'}}
                            onClick={() => {
                              setNewLead({...newLead, countryCode: c.code});
                              setShowCountryList(false);
                              setCountrySearch('');
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span>{c.flag}</span>
                            <strong>{c.code}</strong> 
                            <span style={{color:'#64748b'}}>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <input 
                      style={{flex:1}}
                      type="tel" 
                      placeholder="00000 00000" 
                      value={newLead.phone} 
                      onChange={e => setNewLead({...newLead, phone: e.target.value.replace(/\D/g, '')})} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Service Type</label>
                  <select value={newLead.service} onChange={e => setNewLead({...newLead, service: e.target.value})}>
                    <option>Functional Testing</option>
                    <option>Automation Testing</option>
                    <option>Performance Testing</option>
                    <option>Security Testing</option>
                    <option>Development</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project Message</label>
                  <textarea placeholder="Tell us about the project..." value={newLead.msg} onChange={e => setNewLead({...newLead, msg: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-save" style={{marginTop:'1rem'}} disabled={addingLead}>
                {addingLead ? 'Processing...' : (session.role === 'admin' ? <>{'Create Lead'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></> : <>{'Submit for Approval'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>)}
              </button>
            </form>
          </div>
        )}
        {showTeam && session.role === 'admin' && (
          <div className="portal-settings-panel fade-in visible">
            <h3>Team Management</h3>
            <div className="workload-grid">
              {staffList.map(s => {
                const sLeads = data.filter(r => r.assigned_to === s.id);
                return (
                  <div key={s.id} className="staff-stat-card">
                    <div className="staff-header">
                      <div className="staff-info">
                        <input className="staff-name-edit" value={s.name} onChange={e => {
                          setStaffList(prev => prev.map(item => item.id === s.id ? { ...item, name: e.target.value } : item));
                        }} onBlur={e => updateStaffName(s.id, e.target.value)} />
                        <div className="staff-meta"><div className="meta-item">🆔 {s.id.slice(0,8)}...</div></div>
                      </div>
                      <button className="btn-del-staff" onClick={() => removeStaff(s.id)}>✕</button>
                    </div>
                    <div className="work-counts">
                      <div className="count-pill new">🔵 {sLeads.filter(r => r.status === 'new').length} Pending</div>
                      <div className="count-pill ongoing">🟠 {sLeads.filter(r => r.status === 'ongoing').length} Ongoing</div>
                      <div className="count-pill done">🟢 {sLeads.filter(r => r.status === 'completed').length} Done</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {showInterns && session.role === 'admin' && (
          <div className="portal-settings-panel fade-in visible" style={{borderColor: '#7c3aed'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h3>🎓 Intern Certificate Management</h3>
              <button className="btn-save" onClick={() => setShowAddIntern(!showAddIntern)} style={{background: '#7c3aed'}}>
                {showAddIntern ? '✕ Close Form' : '➕ Add Intern'}
              </button>
            </div>

            {showAddIntern && (
              <form className="add-lead-form" onSubmit={addIntern} style={{marginBottom:'2rem', background:'#f5f3ff', padding:'1.5rem', borderRadius:'12px'}}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Intern Name" value={newIntern.full_name} onChange={e => setNewIntern({...newIntern, full_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Internship Role</label>
                    <select 
                      value={newIntern.internship_role} 
                      onChange={e => setNewIntern({...newIntern, internship_role: e.target.value})}
                    >
                      <option value="QA Intern">QA Intern</option>
                      <option value="Frontend Intern">Frontend Intern</option>
                      <option value="Backend Intern">Backend Intern</option>
                      <option value="Full Stack Intern">Full Stack Intern</option>
                      <option value="Security Analyst Intern">Security Analyst Intern</option>
                      <option value="HR Intern">HR Intern</option>
                      <option value="Finance Intern">Finance Intern</option>
                      <option value="other">Other (Custom Role)...</option>
                    </select>
                    {newIntern.internship_role === 'other' && (
                      <input 
                        type="text" 
                        placeholder="Enter custom role title" 
                        style={{marginTop: '10px'}}
                        onChange={e => setNewIntern({...newIntern, custom_role: e.target.value})}
                        required 
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Certificate ID Generator</label>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                      <span style={{background: '#f1f5f9', padding: '0.6rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', color: '#64748b'}}>VAR-INT-</span>
                      <select 
                        style={{width: '90px'}} 
                        value={newIntern.cert_year} 
                        onChange={e => setNewIntern({...newIntern, cert_year: e.target.value})}
                      >
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                      <span style={{fontWeight: 'bold'}}>-</span>
                      <input 
                        type="text" 
                        placeholder="001" 
                        style={{flex: 1}} 
                        value={newIntern.cert_num} 
                        onChange={e => setNewIntern({...newIntern, cert_num: e.target.value.toUpperCase()})} 
                        required 
                      />
                    </div>
                    <p style={{fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px'}}>
                      Result: VAR-INT-{newIntern.cert_year}-{newIntern.cert_num || '???' }
                    </p>
                  </div>
                  <div className="form-group">
                    <label>Issue Date</label>
                    <input type="date" value={newIntern.issue_date} onChange={e => setNewIntern({...newIntern, issue_date: e.target.value})} />
                  </div>
                  <div className="form-group" style={{gridColumn: 'span 2'}}>
                    <label>Project Title</label>
                    <input type="text" placeholder="e.g. AI-Powered Testing" value={newIntern.project_title} onChange={e => setNewIntern({...newIntern, project_title: e.target.value})} />
                    
                    {/* Suggestions Bar */}
                    {PROJECT_SUGGESTIONS[newIntern.internship_role] && (
                      <div className="suggestion-pills" style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>
                        {PROJECT_SUGGESTIONS[newIntern.internship_role].map(title => (
                          <button 
                            key={title} 
                            type="button" 
                            className="suggestion-pill"
                            style={{
                              padding: '4px 10px', fontSize: '0.7rem', borderRadius: '100px', 
                              background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer',
                              color: '#475569', transition: 'all 0.2s'
                            }}
                            onClick={() => setNewIntern({...newIntern, project_title: title})}
                            onMouseOver={e => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#1e293b'; }}
                            onMouseOut={e => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#475569'; }}
                          >
                            + {title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Mentor / Guided By</label>
                    <input type="text" placeholder="e.g. Atal Pandey" value={newIntern.mentor_name} onChange={e => setNewIntern({...newIntern, mentor_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Performance Grade</label>
                    <select value={newIntern.grade} onChange={e => setNewIntern({...newIntern, grade: e.target.value})}>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B+">B+</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Office Location</label>
                    <select value={newIntern.location} onChange={e => setNewIntern({...newIntern, location: e.target.value})}>
                      <option value="Gachibowli, Hyderabad">Gachibowli, Hyderabad</option>
                      <option value="Work From Home">Work From Home</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={newIntern.start_date} onChange={e => setNewIntern({...newIntern, start_date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={newIntern.end_date} onChange={e => setNewIntern({...newIntern, end_date: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="btn-save" style={{marginTop:'1rem', background:'#7c3aed'}} disabled={addingIntern}>
                  {addingIntern ? 'Processing...' : 'Generate & Save Record'}
                </button>
              </form>
            )}

            <div className="leads-table-wrap">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Certificate ID</th>
                    <th>Intern Name</th>
                    <th>Role</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingInterns ? (
                    <tr><td colSpan="5" style={{textAlign:'center'}}>Loading interns...</td></tr>
                  ) : interns.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign:'center'}}>No interns found.</td></tr>
                  ) : interns.map(intern => (
                    <tr key={intern.id}>
                      <td><strong>{intern.certificate_id}</strong></td>
                      <td>{intern.full_name}</td>
                      <td><span className="role-badge employee" style={{background:'#f3e8ff', color:'#7e22ce'}}>{intern.internship_role}</span></td>
                      <td>{new Date(intern.start_date).toLocaleDateString()} - {new Date(intern.end_date).toLocaleDateString()}</td>
                      <td>
                        <div style={{display:'flex', gap:'10px'}}>
                          <button className="btn-refresh" onClick={() => window.open(`/verify/${intern.certificate_id}`, '_blank')} style={{padding:'4px 8px', fontSize:'0.75rem'}}>View</button>
                          <button className="btn-del-staff" onClick={() => deleteIntern(intern.id)} style={{position:'static'}}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Care Requests' && (
          <>
            <div className="mobile-stats-toggle">
              <button className="btn-stats-toggle" onClick={() => setShowMobileStats(!showMobileStats)}>
                {showMobileStats ? '📊 Hide Analytics' : '📊 View Analytics'}
              </button>
            </div>

            <div className={`stats-bar ${showMobileStats ? 'stats-open' : ''}`}>
          <div className="stat-box">
            <span>
              <img 
                src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4ca/512.gif" 
                width="24" 
                style={{verticalAlign:'middle', marginRight:'8px'}} 
                alt="📊"
                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '📊 '); }}
              /> 
              Total
            </span>
            <strong>{stats.total}</strong>
          </div>
          {session.role === 'admin' && stats.needsReview > 0 && (
            <div className="stat-box warning pulse-border">
              <span>🚨 Needs Review</span>
              <strong style={{color: '#f97316'}}>{stats.needsReview}</strong>
            </div>
          )}
          <div className="stat-box new">
            <span>
              <img 
                src="https://fonts.gstatic.com/s/e/notoemoji/latest/23f3/512.gif" 
                width="24" 
                style={{verticalAlign:'middle', marginRight:'8px'}} 
                alt="⏳"
                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '⏳ '); }}
              /> 
              Pending
            </span>
            <strong>{stats.new}</strong>
          </div>
          <div className="stat-box ongoing">
            <span>
              <img 
                src="https://fonts.gstatic.com/s/e/notoemoji/latest/2699_fe0f/512.gif" 
                width="24" 
                style={{verticalAlign:'middle', marginRight:'8px'}} 
                alt="⚙️"
                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '⚙️ '); }}
              /> 
              Ongoing
            </span>
            <strong>{stats.ongoing}</strong>
          </div>
          <div className="stat-box done">
            <span>
              <img 
                src="https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.gif" 
                width="24" 
                style={{verticalAlign:'middle', marginRight:'8px'}} 
                alt="✅"
                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '✅ '); }}
              /> 
              Completed
            </span>
            <strong>{stats.completed}</strong>
          </div>
        </div>

        <div className="filter-row">
          <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Items</option>
            <option value="new">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="leads-table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Status</th>
                {session.role === 'admin' && <th>Assign To</th>}
                <th>Client Details</th>
                <th>Project Inquiry</th>
                <th>Notes</th>
                {session.role === 'admin' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(r => (
                <tr key={r.id} className={`status-row-${r.status}`}>
                  <td className="status-cell">
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      {r.status === 'new' && <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/23f3/512.gif" width="20" />}
                      {r.status === 'ongoing' && <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2699_fe0f/512.gif" width="20" />}
                      {r.status === 'completed' && <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2705/512.gif" width="20" />}
                      {r.status === 'approval_pending' ? (
                        <div className="status-badge-pending pulse-text">⚠️ Review Required</div>
                      ) : r.status === 'rejected' ? (
                        <div className="status-badge-rejected">
                          🚫 Rejected
                          <div style={{fontSize:'0.6rem', color:'#ef4444', marginTop:'2px', fontWeight:'bold'}}>
                            {(() => {
                              if (!r.rejected_at) return 'Auto-deleting...';
                              const rejTime = new Date(r.rejected_at).getTime();
                              const diff = 60 - Math.floor((new Date().getTime() - rejTime) / 60000);
                              return diff > 0 ? `Delete in ${diff}m` : 'Deleting...';
                            })()}
                          </div>
                        </div>
                      ) : (
                        <select className={`status-select ${r.status}`} value={r.status} onChange={e => updateStatus(r.id, e.target.value)}>
                          <option value="new">Pending</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          {session.role === 'admin' && <option value="rejected">Rejected</option>}
                        </select>
                      )}
                    </div>
                  </td>
                  {session.role === 'admin' && (
                    <td>
                      <select className="assign-select" value={r.assigned_to || ''} onChange={e => assignTask(r.id, e.target.value)}>
                        <option value="">Unassigned</option>
                        {staffList.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                      </select>
                    </td>
                  )}
                  <td>
                    <div className="client-name">{r.name}</div>
                    <div className="client-email">{r.email}</div>
                    {r.phone ? (
                      <div className="client-phone" style={{fontSize:'0.75rem', color:'#2563eb', marginTop:'4px', fontWeight:'600'}}>
                        📞 {r.phone}
                      </div>
                    ) : (
                      <div style={{fontSize:'0.7rem', color:'#94a3b8', marginTop:'4px'}}>No phone provided</div>
                    )}
                    {/* 🏷️ Lead Source Badge (Admin ONLY) */}
                    {session.role === 'admin' && (
                      <div style={{marginTop:'8px'}}>
                        <span style={{
                          fontSize:'0.6rem', padding:'2px 8px', borderRadius:'100px', 
                          background: r.source === 'Website' ? '#dbeafe' : r.source === 'AI Chatbot' ? '#f3e8ff' : '#f1f5f9',
                          color: r.source === 'Website' ? '#1e40af' : r.source === 'AI Chatbot' ? '#7e22ce' : '#475569',
                          fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.03em', border:'1px solid rgba(0,0,0,0.05)'
                        }}>
                          {r.source === 'Website' ? '🌐 Website' : r.source === 'AI Chatbot' ? '🤖 AI Bot' : `👤 ${r.source}`}
                        </span>
                      </div>
                    )}
                  </td>
                  <td><div className="service-tag">{r.service}</div><p className="client-msg">{r.msg}</p></td>
                  <td>
                    <textarea 
                      placeholder="Add notes..." 
                      value={r.notes} 
                      onChange={e => updateNoteLocally(r.id, e.target.value)} 
                      onBlur={e => saveNoteToDB(r.id, e.target.value)}
                    />
                  </td>
                  {session.role === 'admin' && (
                    <td>
                      {r.status === 'approval_pending' ? (
                        <div style={{display:'flex', gap:'5px'}}>
                          <button className="btn-save" onClick={() => approveLead(r)}>Approve</button>
                          <button className="btn-delete" onClick={() => {setRejectId(r.id); setShowRejectModal(true);}}>Reject</button>
                        </div>
                      ) : <button className="btn-delete" onClick={() => deleteRow(r.id)}>Delete</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && !loading && <div className="no-data">No results found.</div>}
        </div>
          </>
        )}

        </div>
        )}
        </main>
      </div>

      {/* --- Generic CRUD Modal --- */}
      {genericModal.isOpen && (
        <div className="modern-modal-overlay">
          <div className="modern-modal-content">
            <div className="modern-modal-header">
              <h3>
                {genericModal.type === 'Service' && '🛠️ '}
                {genericModal.type === 'Blog' && '✍️ '}
                {genericModal.type === 'Testimonial' && '💬 '}
                {genericModal.type === 'FAQ' && '❓ '}
                {genericModal.type === 'User' && '👤 '}
                {genericModal.data ? 'Edit' : 'Add'} {genericModal.type}
              </h3>
              <button type="button" className="modern-modal-close" onClick={handleCloseGenericModal}>✕</button>
            </div>

            <form onSubmit={handleGenericSave} className="modern-form-grid">
              
              {genericModal.type === 'Service' && (
                <>
                  <div className="modern-form-group">
                    <label>Service Name</label>
                    <input type="text" name="name" className="modern-input" defaultValue={genericModal.data?.name || ''} required placeholder="e.g., Automation Testing" />
                  </div>
                  <div className="modern-form-group">
                    <label>Category</label>
                    <input type="text" name="category" className="modern-input" defaultValue={genericModal.data?.category || ''} required placeholder="e.g., Testing" />
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Description</label>
                    <textarea name="description" className="modern-input modern-textarea" defaultValue={genericModal.data?.description || ''} placeholder="Write a short description about this service..."></textarea>
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Status</label>
                    <select name="status" className="modern-input" defaultValue={genericModal.data?.status || 'active'}>
                      <option value="active">Active</option>
                      <option value="beta">Beta</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              {genericModal.type === 'Blog' && (
                <>
                  <div className="modern-form-group full-width">
                    <label>Title</label>
                    <input type="text" name="title" className="modern-input" defaultValue={genericModal.data?.title || ''} required placeholder="Enter an engaging blog title" />
                  </div>
                  <div className="modern-form-group">
                    <label>Status</label>
                    <select name="status" className="modern-input" defaultValue={genericModal.data?.status || 'draft'}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="modern-form-group">
                    <label>Publish Date</label>
                    <input type="date" name="date" className="modern-input" defaultValue={genericModal.data?.date || new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Content Summary</label>
                    <textarea name="summary" className="modern-input modern-textarea" defaultValue={genericModal.data?.summary || ''} placeholder="Write a brief excerpt or summary for the blog..."></textarea>
                  </div>
                  <input type="hidden" name="views" value={genericModal.data?.views || 0} />
                </>
              )}

              {genericModal.type === 'Testimonial' && (
                <>
                  <div className="modern-form-group">
                    <label>Client Name</label>
                    <input type="text" name="client" className="modern-input" defaultValue={genericModal.data?.client || ''} required placeholder="e.g., Jane Doe" />
                  </div>
                  <div className="modern-form-group">
                    <label>Company</label>
                    <input type="text" name="company" className="modern-input" defaultValue={genericModal.data?.company || ''} required placeholder="e.g., TechCorp" />
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Testimonial Text</label>
                    <textarea name="text" className="modern-input modern-textarea" defaultValue={genericModal.data?.text || ''} required placeholder="What did they say about Varsaka?"></textarea>
                  </div>
                  <div className="modern-form-group">
                    <label>Rating (1-5)</label>
                    <input type="number" name="rating" className="modern-input" min="1" max="5" defaultValue={genericModal.data?.rating || 5} required />
                  </div>
                  <div className="modern-form-group">
                    <label>Status</label>
                    <select name="status" className="modern-input" defaultValue={genericModal.data?.status || 'pending'}>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </>
              )}

              {genericModal.type === 'FAQ' && (
                <>
                  <div className="modern-form-group full-width">
                    <label>Question</label>
                    <input type="text" name="question" className="modern-input" defaultValue={genericModal.data?.question || ''} required placeholder="What is the frequent question?" />
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Answer</label>
                    <textarea name="answer" className="modern-input modern-textarea" defaultValue={genericModal.data?.answer || ''} required placeholder="Provide a helpful answer..."></textarea>
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Category</label>
                    <input type="text" name="category" className="modern-input" defaultValue={genericModal.data?.category || 'General'} required />
                  </div>
                </>
              )}

              {genericModal.type === 'User' && (
                <>
                  <div className="modern-form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" className="modern-input" defaultValue={genericModal.data?.name || ''} required placeholder="e.g., John Smith" />
                  </div>
                  <div className="modern-form-group">
                    <label>Email</label>
                    <input type="email" name="email" className="modern-input" defaultValue={genericModal.data?.email || ''} required placeholder="john@example.com" />
                  </div>
                  <div className="modern-form-group">
                    <label>Role</label>
                    <select name="role" className="modern-input" defaultValue={genericModal.data?.role || 'employee'}>
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>
                  <div className="modern-form-group">
                    <label>Status</label>
                    <select name="status" className="modern-input" defaultValue={genericModal.data?.status || 'active'}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <input type="hidden" name="lastLogin" value={genericModal.data?.lastLogin || 'Never'} />
                </>
              )}

              <div className="modern-modal-actions">
                {genericModal.data && (
                  <button type="button" className="modern-btn-delete" onClick={() => {
                    if(window.confirm(`Are you sure you want to delete this ${genericModal.type}?`)) handleGenericDelete();
                  }}>🗑️ Delete</button>
                )}
                <button type="button" className="modern-btn-cancel" onClick={handleCloseGenericModal}>Cancel</button>
                <button type="submit" className="modern-btn-submit">
                  {genericModal.data ? '💾 Save Changes' : '✨ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-header">
              <h3>🚫 Reject Submission</h3>
              <button className="close-x" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '10px'}}>
                Please provide a clear reason for rejecting this lead. This will be visible to the employee.
              </p>
              <textarea 
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)} 
                placeholder="e.g., Duplicate entry, Incorrect service selected, etc." 
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn-confirm-reject" onClick={rejectLead}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {celebration && (
        <div className="custom-modal-overlay">
          <div className={`celebration-box fade-in visible ${celebration.type}`}>
            <div className="confetti-wrap">
              <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif" width="100" />
            </div>
            <h2>{celebration.type === 'approval' ? '🎊 APPROVED! 🎊' : '💼 NEW ASSIGNMENT! 💼'}</h2>
            <p className="celebration-msg">{celebration.message}</p>
            <div className="celebration-detail">
              Project: <strong>{celebration.name}</strong>
            </div>
            <button className="btn-save" style={{marginTop: '20px', width: '100%', background: celebration.type === 'approval' ? '#16a34a' : '#2563eb'}} onClick={() => setCelebration(null)}>
              {celebration.type === 'approval' ? "Let's Go! 🚀" : "Start Task 🎯"}
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="modal-header">
              <h3>🗑️ Confirm Deletion</h3>
              <button className="close-x" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '1rem', color: '#1e293b', fontWeight: '600'}}>
                Are you sure you want to delete the lead for <strong>"{deleteTarget?.name}"</strong>?
              </p>
              <p style={{fontSize: '0.85rem', color: '#ef4444', marginTop: '10px', fontWeight: '500'}}>
                ⚠️ This action is permanent and will also remove the entry from your Google Sheet.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-confirm-reject" onClick={confirmDelete}>Permanently Delete</button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box info-modal-box">
            <div className="modal-header">
              <h3>Notice</h3>
              <button className="close-x" onClick={() => setShowInfoModal(false)}>✕</button>
            </div>
            <div className="modal-body center-content">
              <div className="info-icon-wrap">
                <img 
                  src={infoIcon.url} 
                  alt={infoIcon.fallback} 
                  className="info-live-gif" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="fallback-emoji" style={{display: 'none', fontSize: '3rem'}}>{infoIcon.fallback}</span>
              </div>
              <p className="info-text-large">
                {infoMsg}
              </p>
            </div>
            <div className="modal-footer" style={{justifyContent: 'center'}}>
              <button 
                id="btn-info-close"
                className="btn-save" 
                onClick={() => setShowInfoModal(false)} 
                style={{padding: '0.9rem 3rem', borderRadius: '100px'}}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
