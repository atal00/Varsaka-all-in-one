import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import logo from '../assets/logo.png';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { sanitize, logSecurityEvent, updateSecuritySettings } from '../utils/security'; // 🛡️ Security Guard
import { MODULES, ACTIONS, normalizePermissions, hasPermission, ALL_ADMIN_PERMISSIONS } from '../utils/permissions';
import SecurityLogsPanel from '../components/SecurityLogsPanel';
import ImageUploadField from '../components/ImageUploadField';
import RichContentEditor from '../components/RichContentEditor';
import CaseStudyEditorModal from '../components/cms/CaseStudyEditorModal';
import BlogEditorModal from '../components/cms/BlogEditorModal';
import ServiceEditorModal from '../components/cms/ServiceEditorModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ToastContainer from '../components/ui/Toast';
import { resolveServiceSlug } from '../utils/serviceSlug';
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

const TimerBanner = ({ sessionExpiry }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!sessionExpiry) return;
    const updateTimer = () => {
      const remaining = sessionExpiry - Date.now();
      if (remaining <= 0) {
        setTimeLeft('00:00');
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sessionExpiry]);

  if (!sessionExpiry) return null;

  return (
    <div style={{ backgroundColor: '#ff4d4f', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold', fontSize: '16px', zIndex: 1000, position: 'sticky', top: 0 }}>
      ⏳ Your session will expire in {timeLeft} minutes.
    </div>
  );
};

const PUBLIC_VERIFY_URL = (import.meta.env.VITE_SITE_URL || 'https://varsaka.com').replace(/\/+$/, '');

export default function Portal() {
  const { session: authSession, userRole, userPermissions, userProfile, loading: authLoading, signOut, sessionExpiry, refreshProfile } = useAuth();

  // Normalized session object with authoritative role & permissions
  const session = useMemo(() => {
    if (!authSession) return null;
    const normalizedRole = (userRole || '').toLowerCase().trim() || null;
    const effectivePermissions = normalizedRole === 'admin'
      ? JSON.parse(JSON.stringify(ALL_ADMIN_PERMISSIONS))
      : userPermissions;

    return {
      id: authSession.user.id,
      role: normalizedRole,
      permissions: effectivePermissions,
      name: userProfile?.name || authSession.user.user_metadata?.full_name || authSession.user.email?.split('@')[0] || 'User',
      email: authSession.user.email
    };
  }, [authSession, userRole, userPermissions, userProfile]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(() => {
    const role = (userRole || '').toLowerCase().trim();
    if (role === 'blogger') return 'Blog';
    if (role === 'employee') return 'Care Requests';
    return 'Dashboard';
  });

  // Keep activeTab aligned once role loads asynchronously
  useEffect(() => {
    if (userRole) {
      const role = userRole.toLowerCase().trim();
      if (role === 'admin' && activeTab !== 'Dashboard') {
        // preserve selected tab if user is admin
      } else if (role === 'blogger' && activeTab === 'Dashboard') {
        setActiveTab('Blog');
      } else if (role === 'employee' && activeTab === 'Dashboard') {
        setActiveTab('Care Requests');
      }
    }
  }, [userRole]);
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

  // --- Real Role & Permission Management Users State ---
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // User Management Modals
  const [permModalUser, setPermModalUser] = useState(null);
  const [editingPerms, setEditingPerms] = useState(null);
  const [savingPerms, setSavingPerms] = useState(false);

  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('employee');
  const [tempAccessDuration, setTempAccessDuration] = useState('permanent');
  const [savingRole, setSavingRole] = useState(false);

  // Platform Security Settings State
  const [secSettings, setSecSettings] = useState({
    failed_attempt_threshold: 5,
    initial_block_minutes: 15,
    progressive_multiplier: 4,
    max_block_minutes: 1440,
    mfa_enforced_for_admins: false,
    session_timeout_minutes: 480
  });
  const [savingSecSettings, setSavingSecSettings] = useState(false);
  const [secSettingsMsg, setSecSettingsMsg] = useState(null);

  // Certificate Deletion Modal State
  const [certToDelete, setCertToDelete] = useState(null);
  const [deletingCert, setDeletingCert] = useState(false);


  const [settingsTab, setSettingsTab] = useState('profile');

  // MFA State
  const [mfaData, setMfaData] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaFactors, setMfaFactors] = useState([]);
  const [mfaMsg, setMfaMsg] = useState(null);

  const fetchMfaFactors = async () => {
    try {
      if (!supabase?.auth?.mfa) return;
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data?.totp) {
        setMfaFactors(data.totp.filter(f => f.status === 'verified'));
      }
    } catch (e) {
      console.warn('MFA factors fetch error:', e);
    }
  };

  const handleEnrollMfa = async () => {
    setMfaLoading(true);
    setMfaMsg(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Varsaka Labs' });
      if (error) throw error;
      setMfaData(data);
    } catch (err) {
      setMfaMsg({ type: 'error', text: err.message || 'MFA enrollment failed.' });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaData || !mfaCode.trim()) return;
    setMfaLoading(true);
    setMfaMsg(null);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaData.id,
        code: mfaCode.trim()
      });
      if (error) throw error;
      setMfaMsg({ type: 'success', text: 'Two-Factor Authentication successfully verified & activated!' });
      setMfaData(null);
      setMfaCode('');
      fetchMfaFactors();
      await logSecurityEvent(supabase, {
        action: 'mfa_success',
        targetId: session?.id,
        metadata: { event: 'MFA_ENROLLED' }
      });
    } catch (err) {
      setMfaMsg({ type: 'error', text: err.message || 'Invalid verification code. Please try again.' });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleSaveSecuritySettings = async (e) => {
    e.preventDefault();
    setSavingSecSettings(true);
    setSecSettingsMsg(null);
    const res = await updateSecuritySettings(supabase, secSettings);
    setSavingSecSettings(false);
    if (res.success) {
      setSecSettingsMsg({ type: 'success', text: 'Security policies updated & audited successfully.' });
    } else {
      setSecSettingsMsg({ type: 'error', text: res.error || 'Failed to update security settings.' });
    }
  };

  // --- Modern Toast & Confirmation Dialog System ---
  const [toasts, setToasts] = useState([]);
  const addToast = (type, message, title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, title }]);
  };
  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDestructive: true,
    isLoading: false,
    onConfirm: () => {}
  });

  const showConfirm = ({ title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', isDestructive = true, onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      confirmLabel,
      cancelLabel,
      isDestructive,
      isLoading: false,
      onConfirm: async () => {
        try {
          if (onConfirm) await onConfirm();
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  // --- Generic Modal State for Mock CRUD ---
  const [genericModal, setGenericModal] = useState({ isOpen: false, type: '', data: null });
  const [mockServices, setMockServices] = useState([]);
  const [mockBlogs, setMockBlogs] = useState([]);
  const [mockFaqs, setMockFaqs] = useState([]);
  const [mockCaseStudies, setMockCaseStudies] = useState([]);
  const [mockJobs, setMockJobs] = useState([]);

  // --- Filter States for Blog & Case Studies ---
  const [blogFilter, setBlogFilter] = useState('all');
  const [caseStudyFilter, setCaseStudyFilter] = useState('all');

  const blogCounts = useMemo(() => ({
    all: mockBlogs.length,
    published: mockBlogs.filter(b => b.status === 'published').length,
    draft: mockBlogs.filter(b => b.status === 'draft' || b.status !== 'published').length
  }), [mockBlogs]);

  const filteredBlogs = useMemo(() => {
    if (blogFilter === 'published') return mockBlogs.filter(b => b.status === 'published');
    if (blogFilter === 'draft') return mockBlogs.filter(b => b.status === 'draft' || b.status !== 'published');
    return mockBlogs;
  }, [mockBlogs, blogFilter]);

  const caseStudyCounts = useMemo(() => ({
    all: mockCaseStudies.length,
    published: mockCaseStudies.filter(cs => cs.status === 'published').length,
    draft: mockCaseStudies.filter(cs => cs.status === 'draft' || cs.status !== 'published').length
  }), [mockCaseStudies]);

  const filteredCaseStudies = useMemo(() => {
    if (caseStudyFilter === 'published') return mockCaseStudies.filter(cs => cs.status === 'published');
    if (caseStudyFilter === 'draft') return mockCaseStudies.filter(cs => cs.status === 'draft' || cs.status !== 'published');
    return mockCaseStudies;
  }, [mockCaseStudies, caseStudyFilter]);

  // Rich Content & Media States
  const [modalTab, setModalTab] = useState('basic');
  const [blogImage, setBlogImage] = useState('');
  const [blogThumbnail, setBlogThumbnail] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [csImage, setCsImage] = useState('');
  const [csLogo, setCsLogo] = useState('');
  const [csContent, setCsContent] = useState('');
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(null);

  const handleOpenGenericModal = (type, data = null) => {
    setGenericModal({ isOpen: true, type, data });
    setModalTab('basic');
    setIsFormDirty(false);
    if (type === 'Blog') {
      setBlogImage(data?.image || '');
      setBlogThumbnail(data?.thumbnail || '');
      setBlogContent(data?.content || data?.summary || '');
      setImageError(null);
      setImageUploading(false);
    } else if (type === 'Case Study') {
      setCsImage(data?.image || '');
      setCsLogo(data?.logo || '');
      setCsContent(data?.description || data?.approach || '');
      setImageError(null);
      setImageUploading(false);
    }
  };

  const handleCloseGenericModal = (force = false) => {
    if (!force && isFormDirty) {
      showConfirm({
        title: 'Discard Unsaved Changes?',
        description: 'You have unsaved edits in this form. Are you sure you want to discard them?',
        confirmLabel: 'Discard Changes',
        cancelLabel: 'Keep Editing',
        isDestructive: true,
        onConfirm: () => handleCloseGenericModal(true)
      });
      return;
    }
    setGenericModal({ isOpen: false, type: '', data: null });
    setModalTab('basic');
    setBlogImage('');
    setBlogThumbnail('');
    setBlogContent('');
    setCsImage('');
    setCsLogo('');
    setCsContent('');
    setImageError(null);
    setImageUploading(false);
    setIsFormDirty(false);
  };

  const validateAndUploadBlogImage = async (file) => {
    if (!file) return;
    setImageError(null);

    // 1. File size check (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setImageError('Image size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    // 2. Extension check
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!ext || !allowedExts.includes(ext)) {
      setImageError('Unsupported file extension. Allowed formats: JPG, JPEG, PNG, WEBP.');
      return;
    }

    // 3. MIME type check
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
      setImageError(`Invalid MIME type (${file.type}). Allowed: JPG, PNG, WEBP.`);
      return;
    }

    // 4. Magic bytes / file signature validation
    try {
      const buffer = await file.slice(0, 12).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let isValidSig = false;

      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        // JPEG: FF D8 FF
        isValidSig = true;
      } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        // PNG: 89 50 4E 47
        isValidSig = true;
      } else if (
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // 'RIFF'
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // 'WEBP'
      ) {
        // WEBP
        isValidSig = true;
      }

      if (!isValidSig) {
        setImageError('Security Alert: File signature does not match a valid image. Upload aborted.');
        return;
      }

      // 5. Safe object key to prevent path traversal
      const safeKey = `blogs/blog_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      setImageUploading(true);

      const { error: uploadErr } = await supabase.storage
        .from('public_assets')
        .upload(safeKey, file, { contentType: file.type, upsert: true });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('public_assets')
        .getPublicUrl(safeKey);

      // If replacing an existing image in public_assets, delete old one
      if (blogImage && blogImage.includes('/public_assets/blogs/')) {
        const oldPath = blogImage.split('/public_assets/')[1];
        if (oldPath) {
          supabase.storage.from('public_assets').remove([oldPath]).catch(() => {});
        }
      }

      setBlogImage(publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
      setImageError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveBlogImage = async () => {
    if (blogImage && blogImage.includes('/public_assets/blogs/')) {
      const oldPath = blogImage.split('/public_assets/')[1];
      if (oldPath) {
        supabase.storage.from('public_assets').remove([oldPath]).catch(() => {});
      }
    }
    setBlogImage('');
    setImageError(null);
  };

  // 🛡️ Prevent background page from scrolling while any modal is open
  const isAnyModalOpen = Boolean(
    genericModal.isOpen ||
    showRejectModal ||
    showDeleteModal ||
    showInfoModal ||
    permModalUser ||
    roleModalUser ||
    certToDelete ||
    showAddIntern ||
    celebration
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalOpen]);

  const handleSaveService = async (servicePayload) => {
    try {
      const isValidUuid = typeof servicePayload.id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(servicePayload.id);

      let savedRecord;
      if (isValidUuid) {
        const { id, ...updates } = servicePayload;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('services').update(updates).eq('id', id).select();
        if (error) throw error;
        savedRecord = data && data[0] ? data[0] : { ...servicePayload };
        setMockServices(mockServices.map(s => s.id === id ? savedRecord : s));
        logSecurityEvent('CMS_SERVICE_UPDATED', { id, name: servicePayload.name, status: servicePayload.status });
        addToast('success', 'Service updated successfully');
      } else {
        const insertPayload = { ...servicePayload };
        delete insertPayload.id;
        insertPayload.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('services').insert([insertPayload]).select();
        if (error) throw error;
        savedRecord = data[0];
        setMockServices([savedRecord, ...mockServices]);
        logSecurityEvent('CMS_SERVICE_CREATED', { id: savedRecord.id, name: savedRecord.name, status: savedRecord.status });
        addToast('success', 'Service created successfully');
      }
      handleCloseGenericModal(true);
      return savedRecord;
    } catch (err) {
      console.error('CMS Service Save Error:', err);
      addToast('error', 'Unable to save service. Please verify the required fields and try again.');
      throw err;
    }
  };

  const handleDeleteService = async (id) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setMockServices(mockServices.filter(s => s.id !== id));
      logSecurityEvent('CMS_SERVICE_DELETED', { id });
      addToast('success', 'Service deleted successfully');
      handleCloseGenericModal(true);
    } catch (err) {
      console.error('CMS Service Delete Error:', err);
      addToast('error', 'Unable to delete this service. Please try again.');
      throw err;
    }
  };

  const handleSaveCaseStudy = async (studyPayload) => {
    try {
      const isValidUuid = typeof studyPayload.id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studyPayload.id);

      if (isValidUuid) {
        const { id, ...updates } = studyPayload;
        if (!updates.slug && (updates.client || updates.title)) {
          updates.slug = (updates.client || updates.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const { error } = await supabase.from('case_studies').update(updates).eq('id', id);
        if (error) throw error;
        setMockCaseStudies(mockCaseStudies.map(s => s.id === id ? { ...s, ...studyPayload } : s));
        logSecurityEvent('CMS_CASE_STUDY_UPDATED', { id, client: studyPayload.client, status: studyPayload.status });
        addToast('success', 'Case study updated successfully');
      } else {
        const insertPayload = { ...studyPayload };
        delete insertPayload.id;
        if (!insertPayload.slug && (insertPayload.client || insertPayload.title)) {
          insertPayload.slug = (insertPayload.client || insertPayload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const { data, error } = await supabase.from('case_studies').insert([insertPayload]).select();
        if (error) throw error;
        const newItem = data[0];
        setMockCaseStudies([newItem, ...mockCaseStudies]);
        logSecurityEvent('CMS_CASE_STUDY_CREATED', { id: newItem.id, client: newItem.client, status: newItem.status });
        addToast('success', 'Case study created successfully');
      }
      handleCloseGenericModal(true);
    } catch (err) {
      console.error('CMS Case Study Save Error:', err);
      addToast('error', 'Unable to save this case study. Please verify the client name and required fields, then retry.');
      throw err;
    }
  };

  const handleDeleteCaseStudy = async (id) => {
    try {
      const { error } = await supabase.from('case_studies').delete().eq('id', id);
      if (error) throw error;
      setMockCaseStudies(mockCaseStudies.filter(s => s.id !== id));
      logSecurityEvent('CMS_CASE_STUDY_DELETED', { id });
      addToast('success', 'Case study deleted successfully');
      handleCloseGenericModal(true);
    } catch (err) {
      console.error('CMS Case Study Delete Error:', err);
      addToast('error', 'Unable to delete this case study. Please try again.');
      throw err;
    }
  };

  const handleSaveBlog = async (blogPayload) => {
    try {
      const isValidUuid = typeof blogPayload.id === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(blogPayload.id);

      if (isValidUuid) {
        const { id, ...updates } = blogPayload;
        if (!updates.slug && updates.title) {
          updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const { error } = await supabase.from('blogs').update(updates).eq('id', id);
        if (error) throw error;
        setMockBlogs(mockBlogs.map(b => b.id === id ? { ...b, ...blogPayload } : b));
        logSecurityEvent('CMS_BLOG_UPDATED', { id, title: blogPayload.title, status: blogPayload.status });
        addToast('success', 'Blog article updated successfully');
      } else {
        const insertPayload = { ...blogPayload };
        delete insertPayload.id;
        if (!insertPayload.slug && insertPayload.title) {
          insertPayload.slug = insertPayload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        const { data, error } = await supabase.from('blogs').insert([insertPayload]).select();
        if (error) throw error;
        const newItem = data[0];
        setMockBlogs([newItem, ...mockBlogs]);
        logSecurityEvent('CMS_BLOG_CREATED', { id: newItem.id, title: newItem.title, status: newItem.status });
        addToast('success', 'Blog article created successfully');
      }
      handleCloseGenericModal(true);
    } catch (err) {
      console.error('CMS Blog Save Error:', err);
      addToast('error', 'Unable to save this article. Please verify the title and required fields, then retry.');
      throw err;
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      setMockBlogs(mockBlogs.filter(b => b.id !== id));
      logSecurityEvent('CMS_BLOG_DELETED', { id });
      addToast('success', 'Blog article deleted successfully');
      handleCloseGenericModal(true);
    } catch (err) {
      console.error('CMS Blog Delete Error:', err);
      addToast('error', 'Unable to delete this article. Please try again.');
      throw err;
    }
  };

  const handleGenericSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const updates = Object.fromEntries(fd.entries());

    // Strip empty id so database generates fresh UUID on insert
    if (updates.id !== undefined && (!updates.id || typeof updates.id !== 'string' || !updates.id.trim())) {
      delete updates.id;
    }

    if (genericModal.type === 'Blog') {
      updates.image = blogImage;
      updates.thumbnail = blogThumbnail;
      updates.content = blogContent;
      // Auto-generate slug if empty
      if (!updates.slug && updates.title) {
        updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      // Auto-calculate read time if missing
      if (!updates.read_time && updates.content) {
        const textOnly = updates.content.replace(/<[^>]*>/g, ' ');
        const wordCount = textOnly.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        updates.read_time = `${minutes} min read`;
      }
    } else if (genericModal.type === 'Case Study') {
      updates.image = csImage;
      updates.logo = csLogo;
      updates.description = csContent;
      if (!updates.slug && (updates.client || updates.title)) {
        updates.slug = (updates.client || updates.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }

    let table = '';
    if (genericModal.type === 'Service') table = 'services';
    else if (genericModal.type === 'Blog') table = 'blogs';
    else if (genericModal.type === 'FAQ') table = 'faqs';
    else if (genericModal.type === 'Case Study') table = 'case_studies';
    else if (genericModal.type === 'Career') table = 'jobs';

    if (genericModal.type === 'Career') {
      if (typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
      } else if (!Array.isArray(updates.tags)) {
        updates.tags = [];
      }
      if (updates.apply_link === '') {
        updates.apply_link = null;
      }
    }

    // User management is handled via the dedicated Role & Permission Management interface
    if (genericModal.type === 'User') {
      triggerInfo('User management is handled via the Role & Permission Management table.');
      handleCloseGenericModal(true);
      return;
    }

    try {
      if (genericModal.data) {
        const { error } = await supabase.from(table).update(updates).eq('id', genericModal.data.id);
        if (error) throw error;

        if (table === 'services') setMockServices(mockServices.map(s => s.id === genericModal.data.id ? {...s, ...updates} : s));
        if (table === 'blogs') setMockBlogs(mockBlogs.map(b => b.id === genericModal.data.id ? {...b, ...updates} : b));
        if (table === 'faqs') setMockFaqs(mockFaqs.map(f => f.id === genericModal.data.id ? {...f, ...updates} : f));
        if (table === 'case_studies') setMockCaseStudies(mockCaseStudies.map(cs => cs.id === genericModal.data.id ? {...cs, ...updates} : cs));
        if (table === 'jobs') setMockJobs(mockJobs.map(j => j.id === genericModal.data.id ? {...j, ...updates} : j));
      } else {
        const { data, error } = await supabase.from(table).insert([updates]).select();
        if (error) throw error;

        const newItem = data[0];
        if (table === 'services') setMockServices([newItem, ...mockServices]);
        if (table === 'blogs') setMockBlogs([newItem, ...mockBlogs]);
        if (table === 'faqs') setMockFaqs([newItem, ...mockFaqs]);
        if (table === 'case_studies') setMockCaseStudies([newItem, ...mockCaseStudies]);
        if (table === 'jobs') setMockJobs([newItem, ...mockJobs]);
      }
      setIsFormDirty(false);
      addToast('success', `${genericModal.type} saved successfully`);
      handleCloseGenericModal(true);
    } catch (err) {
      console.error('Generic CMS Save Error:', err);
      let userFriendlyMsg = 'Unable to save changes. Please verify the required fields and try again.';
      if (genericModal.type === 'Career') {
        userFriendlyMsg = 'Unable to save the career opening. Please ensure all required fields are filled correctly.';
      } else if (genericModal.type === 'Service') {
        userFriendlyMsg = 'Unable to save the service. Please verify the service name and details.';
      } else if (genericModal.type === 'FAQ') {
        userFriendlyMsg = 'Unable to save the FAQ. Please ensure question and answer are provided.';
      }
      addToast('error', userFriendlyMsg);
    }
  };

  const handleGenericDelete = async () => {
    let table = '';
    if (genericModal.type === 'Service') table = 'services';
    else if (genericModal.type === 'Blog') table = 'blogs';
    else if (genericModal.type === 'FAQ') table = 'faqs';
    else if (genericModal.type === 'Case Study') table = 'case_studies';
    else if (genericModal.type === 'Career') table = 'jobs';

    if (genericModal.type === 'User') {
      triggerInfo('User management is handled via the Role & Permission Management table.');
      handleCloseGenericModal();
      return;
    }

    try {
      const { error } = await supabase.from(table).delete().eq('id', genericModal.data.id);
      if (error) throw error;

      if (table === 'services') setMockServices(mockServices.filter(s => s.id !== genericModal.data.id));
      if (table === 'blogs') setMockBlogs(mockBlogs.filter(s => s.id !== genericModal.data.id));
      if (table === 'faqs') setMockFaqs(mockFaqs.filter(s => s.id !== genericModal.data.id));
      if (table === 'case_studies') setMockCaseStudies(mockCaseStudies.filter(s => s.id !== genericModal.data.id));
      if (table === 'jobs') setMockJobs(mockJobs.filter(s => s.id !== genericModal.data.id));
      addToast('success', `${genericModal.type} deleted successfully`);
      handleCloseGenericModal();
    } catch (err) {
      console.error('Generic CMS Delete Error:', err);
      addToast('error', 'Unable to delete this item. Please try again.');
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
        { data: fData },
        csResult,
        jobsResult
      ] = await Promise.all([
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('blogs').select('*').order('created_at', { ascending: false }),
        supabase.from('faqs').select('*').order('created_at', { ascending: false }),
        supabase.from('case_studies').select('*').order('created_at', { ascending: false }).then(res => res).catch(() => ({ data: [] })),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }).then(res => res).catch(() => ({ data: [] }))
      ]);

      if (sData) setMockServices(sData);
      if (bData) setMockBlogs(bData);
      if (fData) setMockFaqs(fData);
      if (csResult?.data) setMockCaseStudies(csResult.data);
      if (jobsResult?.data) setMockJobs(jobsResult.data);

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
      const { data: profiles, error: pError } = await supabase.from('staff_directory').select('id, full_name, email');
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
    if (!session?.id) return;

    // Initial fetch
    fetchData();
    fetchStaff();

    // ⚡ Supabase Realtime: auto-refresh when any table changes
    const channel = supabase
      .channel('admin-portal-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        supabase.from('jobs').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setMockJobs(data); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        supabase.from('services').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setMockServices(data); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, () => {
        supabase.from('blogs').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setMockBlogs(data); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, () => {
        supabase.from('faqs').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setMockFaqs(data); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_studies' }, () => {
        supabase.from('case_studies').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setMockCaseStudies(data); });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => fetchInterns())
      .subscribe();

    // Fallback polling every 60s (backup)
    const interval = setInterval(fetchData, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  // 🔔 Post-Login Notification
  useEffect(() => {
    if (session?.id && !sessionStorage.getItem('notified_refresh')) {
      setTimeout(() => {
        triggerInfo('Welcome back! Kindly refresh from the top button to see the latest leads.');
      }, 0);
      sessionStorage.setItem('notified_refresh', 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

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

      const { data: insertedCert, error } = await supabase
        .from('certificates')
        .insert([internData])
        .select()
        .single();
      if (error) throw error;
      const publicToken = insertedCert?.public_verification_token;
      triggerInfo(`Intern certificate added successfully!\nVerification URL: ${PUBLIC_VERIFY_URL}/verify/${publicToken || internData.certificate_id}`);
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

  // --- Certificate Deletion Handlers ---
  const requestDeleteIntern = (intern) => {
    if (!hasPermission(session, 'certificates', 'delete')) {
      triggerInfo('Error: You do not have permission to delete certificates.');
      return;
    }
    setCertToDelete(intern);
  };

  const confirmDeleteCert = async () => {
    if (!certToDelete) return;
    if (!hasPermission(session, 'certificates', 'delete')) {
      triggerInfo('Error: You do not have permission to delete certificates.');
      setCertToDelete(null);
      return;
    }
    setDeletingCert(true);
    try {
      const { error } = await supabase.from('certificates').delete().eq('id', certToDelete.id);
      if (error) throw error;

      await logSecurityEvent(supabase, {
        actorId: session?.id,
        actorEmail: session?.email,
        action: 'certificate_deleted',
        targetId: certToDelete.id,
        metadata: {
          certificate_id: certToDelete.certificate_id,
          recipient_name: certToDelete.full_name,
          public_token: certToDelete.public_verification_token
        }
      });

      triggerInfo(`Certificate ${certToDelete.certificate_id} deleted successfully.`);
      setCertToDelete(null);
      fetchInterns();
    } catch (err) {
      triggerInfo('Delete failed: ' + err.message);
    } finally {
      setDeletingCert(false);
    }
  };

  // --- User & Role Management Handlers ---
  const fetchUsers = async () => {
    if (!hasPermission(session, 'users', 'view')) {
      setUsersList([]);
      setUsersLoading(false);
      return;
    }
    setUsersLoading(true);
    setUsersError(null);
    try {
      // 1. Try secure RPC function (joins profiles with auth.users for last_sign_in_at and status)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_users');
      if (!rpcError && Array.isArray(rpcData)) {
        setUsersList(rpcData.map(u => ({
          id: u.id,
          name: u.full_name || 'Staff Member',
          email: u.email || 'N/A',
          role: u.role || 'employee',
          permissions: normalizePermissions(u.permissions, u.role),
          lastLogin: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never',
          status: u.status || 'active',
          created_at: u.created_at
        })));
      } else {
        // 2. Fallback to direct profiles query if RPC is pending migration
        // Note: public.profiles does not contain created_at; sort by full_name
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, permissions')
          .order('full_name', { ascending: true });

        if (profError) throw profError;

        setUsersList((profData || []).map(p => ({
          id: p.id,
          name: p.full_name || 'Staff Member',
          email: p.email || 'N/A',
          role: p.role || 'employee',
          permissions: normalizePermissions(p.permissions, p.role),
          lastLogin: 'N/A',
          status: (p.permissions && p.permissions.is_disabled) ? 'disabled' : 'active',
          created_at: null
        })));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsersError(err.message || 'Failed to load user records.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Users') {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleOpenPermModal = (user) => {
    setPermModalUser(user);
    setEditingPerms(JSON.parse(JSON.stringify(normalizePermissions(user.permissions, user.role))));
  };

  const togglePermission = (moduleKey, actionKey) => {
    setEditingPerms(prev => {
      const copy = { ...prev };
      if (!copy[moduleKey]) copy[moduleKey] = {};
      copy[moduleKey] = {
        ...copy[moduleKey],
        [actionKey]: !copy[moduleKey][actionKey]
      };
      return copy;
    });
  };

  const handleSavePermissions = async () => {
    if (!permModalUser || !editingPerms) return;
    if (session?.role !== 'admin') {
      triggerInfo('Access Denied: Only administrators can modify employee permissions.');
      return;
    }

    setSavingPerms(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ permissions: editingPerms })
        .eq('id', permModalUser.id);

      if (error) throw error;

      await logSecurityEvent(supabase, {
        actorId: session?.id,
        actorEmail: session?.email,
        action: 'permissions_changed',
        targetId: permModalUser.id,
        metadata: {
          target_email: permModalUser.email,
          updated_permissions: editingPerms
        }
      });

      triggerInfo(`Permissions for ${permModalUser.name} updated successfully.`);
      setPermModalUser(null);
      setEditingPerms(null);
      fetchUsers();
    } catch (err) {
      triggerInfo('Failed to update permissions: ' + err.message);
    } finally {
      setSavingPerms(false);
    }
  };

  const handleOpenRoleModal = (user) => {
    if (session?.role !== 'admin') {
      triggerInfo('Access Denied: Only administrators can modify user roles.');
      return;
    }
    if (user.id === session?.id) {
      triggerInfo('Self-demotion is prevented. An administrator cannot change their own role.');
      return;
    }
    setRoleModalUser(user);
    setSelectedNewRole(user.role || 'employee');
    setTempAccessDuration(user.temporary_access_expires_at ? '24h' : 'permanent');
  };

  const handleSaveRole = async () => {
    if (!roleModalUser) return;
    if (session?.role !== 'admin') {
      triggerInfo('Access Denied: Only administrators can modify user roles.');
      return;
    }

    // Self-demotion check
    if (roleModalUser.id === session?.id && selectedNewRole !== 'admin') {
      triggerInfo('Access Denied: Self-demotion is prevented. You cannot change your own role.');
      return;
    }

    // Last-admin protection check
    if (roleModalUser.role === 'admin' && selectedNewRole !== 'admin') {
      const activeAdminCount = usersList.filter(u => u.role === 'admin' && u.status !== 'disabled').length;
      if (activeAdminCount <= 1) {
        triggerInfo('Operation blocked: Cannot demote the last remaining active administrator.');
        return;
      }
    }

    setSavingRole(true);
    try {
      const updateData = { role: selectedNewRole };
      if (selectedNewRole === 'security_auditor') {
        if (tempAccessDuration === '24h') {
          updateData.temporary_access_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        } else if (tempAccessDuration === '7d') {
          updateData.temporary_access_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        } else {
          updateData.temporary_access_expires_at = null;
        }
      } else {
        updateData.temporary_access_expires_at = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', roleModalUser.id);

      if (error) throw error;

      await logSecurityEvent(supabase, {
        actorId: session?.id,
        actorEmail: session?.email,
        action: 'user_role_changed',
        targetId: roleModalUser.id,
        metadata: {
          target_email: roleModalUser.email,
          old_role: roleModalUser.role,
          new_role: selectedNewRole,
          temporary_access_expires_at: updateData.temporary_access_expires_at
        }
      });

      triggerInfo(`Role for ${roleModalUser.name} changed to ${selectedNewRole}.`);
      setRoleModalUser(null);
      fetchUsers();
    } catch (err) {
      triggerInfo('Failed to change role: ' + err.message);
    } finally {
      setSavingRole(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    if (session?.role !== 'admin') {
      triggerInfo('Access Denied: Only administrators can disable or enable employee accounts.');
      return;
    }

    // Prevent disabling self
    if (user.id === session?.id) {
      triggerInfo('Action prevented: You cannot disable your own account.');
      return;
    }

    const isCurrentlyDisabled = user.status === 'disabled' || Boolean(user.permissions?.is_disabled);
    const newDisabledState = !isCurrentlyDisabled;

    // Last admin protection
    if (user.role === 'admin' && newDisabledState) {
      const activeAdminCount = usersList.filter(u => u.role === 'admin' && u.status !== 'disabled').length;
      if (activeAdminCount <= 1) {
        triggerInfo('Operation blocked: Cannot disable the last remaining active administrator.');
        return;
      }
    }

    const updatedPermissions = {
      ...(user.permissions || {}),
      is_disabled: newDisabledState
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ permissions: updatedPermissions })
        .eq('id', user.id);

      if (error) throw error;

      await logSecurityEvent(supabase, {
        actorId: session?.id,
        actorEmail: session?.email,
        action: newDisabledState ? 'user_disabled' : 'user_enabled',
        targetId: user.id,
        metadata: {
          target_email: user.email,
          status: newDisabledState ? 'disabled' : 'active'
        }
      });

      triggerInfo(`User ${user.name} has been ${newDisabledState ? 'disabled' : 'activated'}.`);
      fetchUsers();
    } catch (err) {
      triggerInfo('Failed to update user status: ' + err.message);
    }
  };


  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    sessionStorage.removeItem('notified_refresh');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  // 🛡️ Prevent stale authenticated view on browser Back/Forward (bfcache)
  useEffect(() => {
    const handlePageShow = async (e) => {
      if (e.persisted || !authSession) {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          navigate('/login', { replace: true });
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [authSession, navigate]);

  const assignTask = async (leadId, staffId) => {
    if (session?.role !== 'admin' && !hasPermission(session, 'leads', 'edit')) {
      triggerInfo('Error: You do not have permission to assign care requests.');
      return;
    }

    const targetLead = data.find(l => l.id === leadId);
    const updates = { assigned_to: staffId || null };

    // If assigning to an employee and current status is NEW, auto-advance to ASSIGNED
    if (staffId && (!targetLead || targetLead.status === 'new' || targetLead.status === 'NEW')) {
      updates.status = 'ASSIGNED';
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId);

    if (updateError) {
      triggerInfo('Failed to assign task: ' + updateError.message);
    } else {
      const assignedStaff = staffList.find(s => s.id === staffId);
      triggerInfo(staffId ? `Care request assigned to ${assignedStaff?.name || 'staff member'}.` : 'Care request unassigned.');
      fetchData();
    }
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

      // 🛡️ GATED APPROVAL
      const gsUrl = import.meta.env.VITE_GS_SYNC_URL;
      if (!isStaff && gsUrl) {
        fetch(gsUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: 'add',
            ...newLead,
            phone: `'${newLead.countryCode} ${newLead.phone}`
          })
        }).catch(err => console.error('GS Sync Error:', err));
      }

      setNewLead({ name: '', email: '', phone: '', countryCode: '+91', service: 'Functional Testing', msg: '' });
      setShowAddLead(false);
      fetchData(); // Refresh data
    } catch (err) {
      triggerInfo('Error: ' + (err?.message || err || 'Unknown Error'));
    } finally {
      setAddingLead(false);
    }
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

  // 📈 Live Production Stats Calculation
  const liveStats = useMemo(() => {
    const relevantLeads = data.filter(r => session?.role === 'admin' || r.assigned_to === session?.id);
    const publishedBlogs = mockBlogs.filter(b => b.status === 'published').length;
    const activeServices = mockServices.filter(s => s.status === 'active').length;
    const openLeads = relevantLeads.filter(r => ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'new', 'ongoing', 'pending'].includes(r.status)).length;
    const openCareers = mockJobs.filter(j => j.status !== 'closed').length;
    const totalCaseStudies = mockCaseStudies.length;
    const totalFaqs = mockFaqs.length;
    const activeStaff = usersList.length > 0 ? usersList.filter(u => u.status !== 'disabled').length : staffList.length;

    return {
      publishedBlogs,
      totalBlogs: mockBlogs.length,
      activeServices,
      totalServices: mockServices.length,
      openLeads,
      totalLeads: relevantLeads.length,
      openCareers,
      totalCareers: mockJobs.length,
      totalCaseStudies,
      totalFaqs,
      activeStaff,
      needsReview: relevantLeads.filter(r => r.status === 'approval_pending').length
    };
  }, [mockBlogs, mockServices, data, mockJobs, mockCaseStudies, mockFaqs, usersList, staffList, session?.role, session?.id]);

  // Backward compatibility alias
  const stats = {
    total: liveStats.totalLeads,
    new: liveStats.openLeads,
    ongoing: data.filter(r => ['IN_PROGRESS', 'WAITING', 'ongoing'].includes(r.status)).length,
    completed: data.filter(r => ['RESOLVED', 'CLOSED', 'completed'].includes(r.status)).length,
    needsReview: liveStats.needsReview
  };

  // 🔍 Filtering Logic
  const filteredData = data.filter(r => {
    if (session?.role === 'employee' && r.assigned_to !== session?.id && !hasPermission(session, 'leads', 'view')) return false;
    const normalizedRowStatus = String(r.status || '').toUpperCase();
    if (filter !== 'all') {
      const normalizedFilter = filter.toUpperCase();
      if (normalizedFilter === 'NEW' && !['NEW', 'PENDING'].includes(normalizedRowStatus)) return false;
      else if (normalizedFilter === 'ASSIGNED' && normalizedRowStatus !== 'ASSIGNED') return false;
      else if (normalizedFilter === 'IN_PROGRESS' && !['IN_PROGRESS', 'ONGOING'].includes(normalizedRowStatus)) return false;
      else if (normalizedFilter === 'WAITING' && normalizedRowStatus !== 'WAITING') return false;
      else if (normalizedFilter === 'RESOLVED' && !['RESOLVED', 'COMPLETED'].includes(normalizedRowStatus)) return false;
      else if (normalizedFilter === 'CLOSED' && normalizedRowStatus !== 'CLOSED') return false;
      else if (normalizedFilter === 'REJECTED' && normalizedRowStatus !== 'REJECTED' && r.status !== 'rejected') return false;
    }
    const s = search.toLowerCase();
    return (r.name || '').toLowerCase().includes(s) || (r.email || '').toLowerCase().includes(s) || (r.msg || '').toLowerCase().includes(s);
  });

  const TAB_MODULE_MAP = {
    'Dashboard': 'dashboard',
    'Services': 'services',
    'Blog': 'blog',
    'Case Studies': 'case_studies',
    'Care Requests': 'leads',
    'Careers': 'careers',
    'Certificates': 'certificates',
    'FAQ': 'faqs',
    'Users': 'users',
    'Security Logs': 'security_logs',
    'Settings': 'settings'
  };

  const isTabAuthorized = (tabId) => {
    if (!session) return false;
    const role = (session.role || '').toLowerCase().trim();
    if (role === 'admin') return true;
    const mod = TAB_MODULE_MAP[tabId];
    if (!mod) return true;
    return hasPermission(session, mod, 'view');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'Certificates') {
      setShowTeam(false);
      fetchInterns();
    } else if (tab === 'Care Requests' || tab === 'Careers') {
      setShowTeam(false);
    } else if (tab === 'Users') {
      fetchUsers();
    }
  };

  const MENU_ITEMS = [
    { id: 'Dashboard', icon: 'fa-solid fa-chart-pie', label: 'Dashboard' },
    { id: 'Services', icon: 'fa-solid fa-layer-group', label: 'Services' },
    { id: 'Blog', icon: 'fa-solid fa-pen-nib', label: 'Blog' },
    { id: 'Case Studies', icon: 'fa-solid fa-book-open', label: 'Case Studies' },
    { id: 'Care Requests', icon: 'fa-solid fa-heart-pulse', label: 'Care Requests' },
    { id: 'Careers', icon: 'fa-solid fa-briefcase', label: 'Careers' },
    { id: 'Certificates', icon: 'fa-solid fa-graduation-cap', label: 'Certificates' },
    { id: 'FAQ', icon: 'fa-solid fa-circle-question', label: 'FAQ' },
    { id: 'Users', icon: 'fa-solid fa-users', label: 'Users' },
    { id: 'Security Logs', icon: 'fa-solid fa-shield-halved', label: 'Security Logs' },
    { id: 'Settings', icon: 'fa-solid fa-gear', label: 'Settings' }
  ].filter(item => isTabAuthorized(item.id));

  if (!session || authLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>
        Authenticating session...
      </div>
    );
  }

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
            <span>{session?.role === 'admin' ? 'Admin Panel' : 'Staff Portal'}</span>
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
        <TimerBanner sessionExpiry={sessionExpiry} />
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
          {!isTabAuthorized(activeTab) ? (
            <div className="portal-container" style={{padding: '3rem 2rem', textAlign: 'center'}}>
              <div className="dash-panel" style={{maxWidth: '600px', margin: '2rem auto', padding: '3rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize: '3.5rem', marginBottom: '1rem'}}>🔒</div>
                <h2 style={{color: '#1e293b', marginBottom: '0.75rem', fontSize: '1.5rem'}}>Access Restricted</h2>
                <p style={{color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem'}}>
                  You do not have the required permission (<code>{TAB_MODULE_MAP[activeTab] || activeTab}.view</code>) to access the <strong>{activeTab}</strong> section.
                </p>
                <div style={{background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '1.5rem'}}>
                  Please contact a system administrator to request access.
                </div>
                <button
                  className="btn-refresh"
                  onClick={() => setActiveTab('Dashboard')}
                  style={{padding: '0.75rem 2rem', background: '#2563eb', color: '#fff', borderColor: '#2563eb', fontWeight: 'bold'}}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
        {activeTab === 'Dashboard' && (
          <>
            <div className="dash-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="dash-card">
                <div className="dash-card-title">Published Posts</div>
                <div className="dash-card-value">{liveStats.publishedBlogs}</div>
                <div className="dash-card-footer"><i className="fa-solid fa-pen-nib"></i> {liveStats.totalBlogs} total articles</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Active Services</div>
                <div className="dash-card-value">{liveStats.activeServices}</div>
                <div className="dash-card-footer"><i className="fa-solid fa-layer-group"></i> {liveStats.totalServices} total catalog</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Open Care Requests</div>
                <div className="dash-card-value">{liveStats.openLeads}</div>
                <div className="dash-card-footer"><i className="fa-solid fa-heart-pulse"></i> {liveStats.totalLeads} total inquiries</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Open Careers</div>
                <div className="dash-card-value">{liveStats.openCareers}</div>
                <div className="dash-card-footer"><i className="fa-solid fa-briefcase"></i> {liveStats.totalCareers} active listings</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Case Studies</div>
                <div className="dash-card-value">{liveStats.totalCaseStudies}</div>
                <div className="dash-card-footer"><i className="fa-solid fa-book-open"></i> Client success stories</div>
              </div>
              <div className="dash-card">
                <div className="dash-card-title">Authorized Staff</div>
                <div className="dash-card-value">{liveStats.activeStaff}</div>
                <div className="dash-card-footer"><i className="fa-solid fa-users"></i> Active team members</div>
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
                  <div className="quick-action-btn" onClick={() => handleTabChange('Careers')}>
                    <span>Manage Careers</span>
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
                    <th style={{width: '60px', textAlign: 'center'}}>Icon</th>
                    <th>Service Name</th>
                    <th>Category</th>
                    <th>URL Slug</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockServices.map(srv => {
                    const resolvedSlug = srv.slug || resolveServiceSlug(srv, mockServices);
                    return (
                      <tr key={srv.id}>
                        <td style={{fontSize: '1.5rem', textAlign: 'center'}}>{srv.icon || '🧪'}</td>
                        <td><strong>{srv.name}</strong></td>
                        <td><span className="pill badge-blue">{srv.category}</span></td>
                        <td>
                          <code style={{fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a'}}>
                            /services/{resolvedSlug}
                          </code>
                        </td>
                        <td>
                          <span className={`status-badge ${srv.status === 'active' ? 'status-won' : (srv.status === 'beta' ? 'status-new' : 'status-lost')}`}>{srv.status}</span>
                        </td>
                        <td>
                          <button className="btn-action" onClick={() => handleOpenGenericModal('Service', srv)}>Edit</button>
                          <a
                            href={`${PUBLIC_VERIFY_URL}/services/${resolvedSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-action"
                            style={{marginLeft: '6px', textDecoration: 'none'}}
                          >
                            View ↗
                          </a>
                          <button
                            className="btn-action"
                            style={{marginLeft: '6px', color: '#dc2626'}}
                            onClick={() => {
                              showConfirm({
                                title: 'Delete Service?',
                                description: `Permanently delete "${srv.name}"? This action cannot be undone.`,
                                confirmLabel: 'Delete Service',
                                cancelLabel: 'Cancel',
                                isDestructive: true,
                                onConfirm: () => handleDeleteService(srv.id)
                              });
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
              <div className="filter-row" style={{marginBottom: '1rem', display: 'flex', gap: '8px'}}>
                <button
                  className={`filter-btn ${blogFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBlogFilter('all')}
                >
                  All Posts ({blogCounts.all})
                </button>
                <button
                  className={`filter-btn ${blogFilter === 'published' ? 'active' : ''}`}
                  onClick={() => setBlogFilter('published')}
                >
                  Published ({blogCounts.published})
                </button>
                <button
                  className={`filter-btn ${blogFilter === 'draft' ? 'active' : ''}`}
                  onClick={() => setBlogFilter('draft')}
                >
                  Drafts ({blogCounts.draft})
                </button>
              </div>

              {filteredBlogs.length === 0 ? (
                <div className="empty-state" style={{padding: '3rem 1rem', textAlign: 'center', color: '#64748b'}}>
                  <div style={{fontSize: '2.5rem', marginBottom: '0.75rem'}}>📝</div>
                  <h3 style={{color: '#0f172a', marginBottom: '0.25rem'}}>
                    {blogFilter === 'published' ? 'No published articles found.' : (blogFilter === 'draft' ? 'No draft articles found.' : 'No articles found.')}
                  </h3>
                  <p style={{fontSize: '0.9rem'}}>
                    {blogFilter === 'published' ? 'Articles will appear here once published.' : 'Create a draft post or switch filters to view content.'}
                  </p>
                </div>
              ) : (
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
                    {filteredBlogs.map(post => (
                      <tr key={post.id}>
                        <td><strong>{post.title}</strong></td>
                        <td><span className={`status-badge ${post.status === 'published' ? 'status-won' : 'status-lost'}`}>{post.status}</span></td>
                        <td>{post.views || 0}</td>
                        <td>{post.date || 'Recent'}</td>
                        <td>
                          <button className="btn-action" onClick={() => handleOpenGenericModal('Blog', post)}>Edit</button>
                          <button
                            className="btn-action"
                            style={{marginLeft: '6px', color: '#dc2626'}}
                            onClick={() => {
                              showConfirm({
                                title: 'Delete Blog Article?',
                                description: `Permanently delete "${post.title}"? This action cannot be undone.`,
                                confirmLabel: 'Delete Article',
                                cancelLabel: 'Cancel',
                                isDestructive: true,
                                onConfirm: () => handleDeleteBlog(post.id)
                              });
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Case Studies' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Case Studies</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}} onClick={() => handleOpenGenericModal('Case Study')}>➕ Add Study</button>
              </div>

              <div className="filter-row" style={{marginBottom: '1rem', display: 'flex', gap: '8px'}}>
                <button
                  className={`filter-btn ${caseStudyFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCaseStudyFilter('all')}
                >
                  All Case Studies ({caseStudyCounts.all})
                </button>
                <button
                  className={`filter-btn ${caseStudyFilter === 'published' ? 'active' : ''}`}
                  onClick={() => setCaseStudyFilter('published')}
                >
                  Published ({caseStudyCounts.published})
                </button>
                <button
                  className={`filter-btn ${caseStudyFilter === 'draft' ? 'active' : ''}`}
                  onClick={() => setCaseStudyFilter('draft')}
                >
                  Drafts ({caseStudyCounts.draft})
                </button>
              </div>

              {filteredCaseStudies.length === 0 ? (
                <div className="empty-state" style={{padding: '3rem 1rem', textAlign: 'center', color: '#64748b'}}>
                  <div style={{fontSize: '2.5rem', marginBottom: '0.75rem'}}>💼</div>
                  <h3 style={{color: '#0f172a', marginBottom: '0.25rem'}}>
                    {caseStudyFilter === 'published' ? 'No published case studies found.' : (caseStudyFilter === 'draft' ? 'No draft case studies found.' : 'No case studies found.')}
                  </h3>
                  <p style={{fontSize: '0.9rem'}}>Add a case study or switch filters to view items.</p>
                </div>
              ) : (
                <div className="leads-table-wrap" style={{marginTop: '1rem'}}>
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Category Tag</th>
                        <th>Status</th>
                        <th>Outcome</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCaseStudies.map(cs => (
                        <tr key={cs.id}>
                          <td><strong>{cs.client}</strong></td>
                          <td><span className="role-badge employee" style={{background:'#eff6ff', color:'#1d4ed8'}}>{cs.tag || cs.category || 'QA'}</span></td>
                          <td>
                            <span className={`status-badge ${cs.status === 'published' ? 'status-won' : 'status-lost'}`}>{cs.status || 'published'}</span>
                          </td>
                          <td>{cs.outcome}</td>
                          <td>
                            <button className="btn-action" onClick={() => handleOpenGenericModal('Case Study', cs)}>Edit</button>
                            <button
                              className="btn-action"
                              style={{marginLeft: '6px', color: '#dc2626'}}
                              onClick={() => {
                                showConfirm({
                                  title: 'Delete Case Study?',
                                  description: `Permanently delete case study for "${cs.client}"? This action cannot be undone.`,
                                  confirmLabel: 'Delete Case Study',
                                  cancelLabel: 'Cancel',
                                  isDestructive: true,
                                  onConfirm: () => handleDeleteCaseStudy(cs.id)
                                });
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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


        {activeTab === 'Users' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
                <div>
                  <h2>Role & Permission Management</h2>
                  <p style={{color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0'}}>
                    Manage staff access levels, granular module permissions, and account statuses
                  </p>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <button
                    className="btn-refresh"
                    onClick={fetchUsers}
                    disabled={usersLoading}
                    style={{padding: '6px 14px', fontSize: '0.85rem'}}
                  >
                    ↻ {usersLoading ? 'Loading...' : 'Refresh Users'}
                  </button>
                  {hasPermission(session, 'users', 'create') && (
                    <button
                      className="btn-settings"
                      style={{background: 'var(--brand-blue)', color: 'white', padding: '6px 14px', fontSize: '0.85rem'}}
                      onClick={() => handleOpenGenericModal('User')}
                    >
                      ➕ Invite User
                    </button>
                  )}
                </div>
              </div>

              {usersError && (
                <div style={{background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', margin: '1.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <strong>Query Error:</strong> {usersError}
                  </div>
                  <button className="btn-refresh" onClick={fetchUsers} style={{background: '#b91c1c', color: '#fff', borderColor: '#b91c1c', padding: '4px 10px'}}>
                    Retry
                  </button>
                </div>
              )}

              <div style={{overflowX: 'auto', marginTop: '1.25rem'}}>
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
                    {usersLoading ? (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                          <div style={{fontSize: '1.8rem', marginBottom: '8px'}}>⏳</div>
                          Loading user directory...
                        </td>
                      </tr>
                    ) : usersError ? (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '2.5rem', color: '#b91c1c'}}>
                          Unable to retrieve users due to a server or permission error.
                        </td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                          <div style={{fontSize: '2rem', marginBottom: '8px'}}>👥</div>
                          <strong>No users found</strong>
                          <p style={{fontSize: '0.85rem', margin: '4px 0 0'}}>Zero user records returned from the database.</p>
                        </td>
                      </tr>
                    ) : (
                      usersList.map(user => {
                        const isSelf = user.id === session?.id;
                        const isDisabled = user.status === 'disabled';
                        return (
                          <tr key={user.id} style={{opacity: isDisabled ? 0.6 : 1}}>
                            <td>
                              <strong>{user.name}</strong>
                              {isSelf && (
                                <span style={{marginLeft: '8px', fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>
                                  YOU
                                </span>
                              )}
                            </td>
                            <td style={{color: '#475569'}}>{user.email}</td>
                            <td>
                              <span
                                className={`pill ${user.role === 'admin' ? 'badge-blue' : user.role === 'blogger' ? 'badge-orange' : 'badge-purple'}`}
                                style={{textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.75rem'}}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td style={{fontSize: '0.85rem', color: '#64748b'}}>{user.lastLogin}</td>
                            <td>
                              <span className={`status-badge ${isDisabled ? 'status-lost' : 'status-won'}`}>
                                {isDisabled ? 'DISABLED' : 'ACTIVE'}
                              </span>
                            </td>
                            <td>
                              <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center'}}>
                                {user.role !== 'admin' && hasPermission(session, 'users', 'edit') && (
                                  <button
                                    className="btn-action"
                                    onClick={() => handleOpenPermModal(user)}
                                    style={{background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px'}}
                                    title="Edit granular permissions"
                                  >
                                    🔑 Permissions
                                  </button>
                                )}
                                {hasPermission(session, 'users', 'edit') && (
                                  <button
                                    className="btn-action"
                                    onClick={() => handleOpenRoleModal(user)}
                                    disabled={isSelf}
                                    style={{background: isSelf ? '#e2e8f0' : '#8b5cf6', color: isSelf ? '#94a3b8' : '#fff', border: 'none', padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: isSelf ? 'not-allowed' : 'pointer'}}
                                    title={isSelf ? 'Cannot change your own role' : 'Change user role'}
                                  >
                                    👤 Role
                                  </button>
                                )}
                                {hasPermission(session, 'users', 'edit') && (
                                  <button
                                    className="btn-action"
                                    onClick={() => handleToggleUserStatus(user)}
                                    disabled={isSelf}
                                    style={{background: isSelf ? '#e2e8f0' : (isDisabled ? '#10b981' : '#f59e0b'), color: isSelf ? '#94a3b8' : '#fff', border: 'none', padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: isSelf ? 'not-allowed' : 'pointer'}}
                                    title={isSelf ? 'Cannot disable yourself' : (isDisabled ? 'Activate account' : 'Disable account')}
                                  >
                                    {isDisabled ? '✓ Enable' : '⊘ Disable'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
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
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px'}}>
                        <div>
                          <h3 style={{margin: 0}}>Security & Multi-Factor Authentication</h3>
                          <p style={{color: '#666', fontSize: '0.85rem', margin: '4px 0 0'}}>Manage account TOTP MFA credentials and enterprise login firewall policies.</p>
                        </div>
                      </div>

                      {mfaMsg && (
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          marginBottom: '1.25rem',
                          fontSize: '0.85rem',
                          background: mfaMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                          color: mfaMsg.type === 'success' ? '#166534' : '#991b1b',
                          border: `1px solid ${mfaMsg.type === 'success' ? '#86efac' : '#fca5a5'}`
                        }}>
                          {mfaMsg.type === 'success' ? '✓' : '⚠️'} {mfaMsg.text}
                        </div>
                      )}

                      {/* MFA Card */}
                      <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '1.5rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                          <div>
                            <strong style={{fontSize: '1rem', color: '#1e293b'}}>Two-Factor Authentication (TOTP MFA)</strong>
                            <p style={{fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0'}}>
                              Require a time-based 6-digit one-time code from Google Authenticator, 1Password, or Authy on login.
                            </p>
                          </div>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: mfaFactors.length > 0 ? '#dcfce7' : '#f1f5f9',
                            color: mfaFactors.length > 0 ? '#166534' : '#64748b'
                          }}>
                            {mfaFactors.length > 0 ? '✓ MFA ACTIVE' : 'NOT CONFIGURED'}
                          </span>
                        </div>

                        {!mfaData && mfaFactors.length === 0 && (
                          <div style={{marginTop: '1.25rem'}}>
                            <button
                              onClick={handleEnrollMfa}
                              disabled={mfaLoading}
                              className="btn-settings"
                              style={{background: 'var(--brand-blue, #2563eb)', color: 'white'}}
                            >
                              {mfaLoading ? 'Generating TOTP Key...' : '🔐 Configure TOTP Two-Factor Authentication'}
                            </button>
                          </div>
                        )}

                        {mfaData && (
                          <div style={{marginTop: '1.25rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1'}}>
                            <h4 style={{margin: '0 0 8px', color: '#0f172a'}}>Scan QR Code or Enter Secret Key</h4>
                            <p style={{fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px'}}>
                              Scan the QR code with your authenticator app, then enter the 6-digit code below to verify:
                            </p>

                            {mfaData.totp?.qr_code && (
                              <div style={{textAlign: 'center', margin: '1rem 0'}}>
                                <img
                                  src={mfaData.totp.qr_code}
                                  alt="MFA QR Code"
                                  style={{maxWidth: '180px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px', background: '#fff'}}
                                />
                              </div>
                            )}

                            {mfaData.totp?.secret && (
                              <div style={{fontSize: '0.8rem', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem', wordBreak: 'break-all'}}>
                                <strong>Manual Secret:</strong> <code style={{fontFamily: 'monospace', color: '#2563eb'}}>{mfaData.totp.secret}</code>
                              </div>
                            )}

                            <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                              <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                value={mfaCode}
                                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                style={{padding: '8px 12px', fontSize: '1rem', width: '160px', letterSpacing: '4px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                              />
                              <button
                                onClick={handleVerifyMfa}
                                disabled={mfaLoading || mfaCode.length !== 6}
                                style={{padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: mfaCode.length === 6 ? 'pointer' : 'not-allowed'}}
                              >
                                {mfaLoading ? 'Verifying...' : 'Verify & Enable'}
                              </button>
                              <button
                                onClick={() => { setMfaData(null); setMfaCode(''); }}
                                style={{padding: '8px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer'}}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 23. ADMIN PLATFORM SECURITY POLICIES */}
                      {session?.role === 'admin' && (
                        <div style={{background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                            <div>
                              <strong style={{fontSize: '1rem', color: '#1e293b'}}>Enterprise Security Policies & Firewall Thresholds</strong>
                              <p style={{fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0'}}>
                                Configure automated progressive IP blocking rules and session expiry durations.
                              </p>
                            </div>
                            <span className="pill badge-purple" style={{fontSize: '0.75rem'}}>ADMIN ONLY</span>
                          </div>

                          {secSettingsMsg && (
                            <div style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              marginBottom: '1rem',
                              fontSize: '0.8rem',
                              background: secSettingsMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                              color: secSettingsMsg.type === 'success' ? '#166534' : '#991b1b',
                              border: `1px solid ${secSettingsMsg.type === 'success' ? '#86efac' : '#fca5a5'}`
                            }}>
                              {secSettingsMsg.text}
                            </div>
                          )}

                          <form onSubmit={handleSaveSecuritySettings}>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem'}}>
                              <div>
                                <label style={{display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px'}}>
                                  Failed Attempts Threshold
                                </label>
                                <input
                                  type="number"
                                  min={3}
                                  max={20}
                                  value={secSettings.failed_attempt_threshold}
                                  onChange={e => setSecSettings({ ...secSettings, failed_attempt_threshold: Number(e.target.value) })}
                                  style={{width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                                />
                                <span style={{fontSize: '0.7rem', color: '#64748b'}}>Triggers automatic IP blocking (Requirement: 5)</span>
                              </div>

                              <div>
                                <label style={{display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px'}}>
                                  Initial Block Duration (Minutes)
                                </label>
                                <input
                                  type="number"
                                  min={5}
                                  max={1440}
                                  value={secSettings.initial_block_minutes}
                                  onChange={e => setSecSettings({ ...secSettings, initial_block_minutes: Number(e.target.value) })}
                                  style={{width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                                />
                                <span style={{fontSize: '0.7rem', color: '#64748b'}}>Duration of first automatic temporary block</span>
                              </div>

                              <div>
                                <label style={{display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px'}}>
                                  Progressive Backoff Multiplier
                                </label>
                                <input
                                  type="number"
                                  min={2}
                                  max={10}
                                  value={secSettings.progressive_multiplier}
                                  onChange={e => setSecSettings({ ...secSettings, progressive_multiplier: Number(e.target.value) })}
                                  style={{width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                                />
                                <span style={{fontSize: '0.7rem', color: '#64748b'}}>Multiplier applied on repeated abuse (e.g. 4x)</span>
                              </div>

                              <div>
                                <label style={{display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px'}}>
                                  Maximum Temporary Block (Minutes)
                                </label>
                                <input
                                  type="number"
                                  min={60}
                                  max={10080}
                                  value={secSettings.max_block_minutes}
                                  onChange={e => setSecSettings({ ...secSettings, max_block_minutes: Number(e.target.value) })}
                                  style={{width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1'}}
                                />
                                <span style={{fontSize: '0.7rem', color: '#64748b'}}>Upper bound for auto progressive blocks (e.g. 1440m = 24h)</span>
                              </div>
                            </div>

                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                              <button
                                type="submit"
                                disabled={savingSecSettings}
                                style={{padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'}}
                              >
                                {savingSecSettings ? 'Updating Policies...' : '💾 Save Security Policies'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
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

        {(activeTab === 'Care Requests' || activeTab === 'Certificates') && (
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
              {(session.role === 'admin' || hasPermission(session, 'certificates', 'create')) && activeTab === 'Certificates' && (
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
        {activeTab === 'Certificates' && (
          <div className="portal-settings-panel fade-in visible" style={{borderColor: '#7c3aed'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h3>🎓 Intern Certificate Management</h3>
              {session.role === 'admin' && (
                <button className="btn-save" onClick={() => setShowAddIntern(!showAddIntern)} style={{background: '#7c3aed'}}>
                  {showAddIntern ? '✕ Close Form' : '➕ Add Intern'}
                </button>
              )}
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
                    <input type="text" placeholder="e.g. Lead QA Mentor" value={newIntern.mentor_name} onChange={e => setNewIntern({...newIntern, mentor_name: e.target.value})} />
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
                        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                          <button
                            className="btn-refresh"
                            onClick={() => window.open(`${PUBLIC_VERIFY_URL}/verify/${intern.public_verification_token || intern.certificate_id}`, '_blank')}
                            style={{padding:'4px 8px', fontSize:'0.75rem'}}
                          >
                            View
                          </button>
                          <button
                            className="btn-refresh"
                            onClick={() => {
                              const verifyUrl = `${PUBLIC_VERIFY_URL}/verify/${intern.public_verification_token || intern.certificate_id}`;
                              navigator.clipboard.writeText(verifyUrl);
                              triggerInfo(`Verification link copied to clipboard!\n${verifyUrl}`);
                            }}
                            style={{padding:'4px 8px', fontSize:'0.75rem', background: '#0284c7', borderColor: '#0284c7', color: '#fff'}}
                            title="Copy public verification link"
                          >
                            Copy Link
                          </button>
                          {hasPermission(session, 'certificates', 'delete') && (
                            <button
                              className="btn-del-staff"
                              onClick={() => requestDeleteIntern(intern)}
                              style={{position:'static', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5'}}
                              title="Delete Certificate"
                            >
                              ✕
                            </button>
                          )}
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
          <input type="text" placeholder="Search care requests..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING">Waiting</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="leads-table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Assignee</th>
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
                        <select
                          className={`status-select ${String(r.status || 'NEW').toLowerCase()}`}
                          value={String(r.status || 'NEW').toUpperCase() === 'ONGOING' ? 'IN_PROGRESS' : String(r.status || 'NEW').toUpperCase() === 'COMPLETED' ? 'RESOLVED' : String(r.status || 'NEW').toUpperCase()}
                          onChange={e => updateStatus(r.id, e.target.value)}
                        >
                          <option value="NEW">NEW</option>
                          <option value="ASSIGNED">ASSIGNED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="WAITING">WAITING</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                          {session.role === 'admin' && <option value="rejected">REJECTED</option>}
                        </select>
                      )}
                    </div>
                  </td>
                  <td>
                    {session.role === 'admin' ? (
                      <select className="assign-select" value={r.assigned_to || ''} onChange={e => assignTask(r.id, e.target.value)}>
                        <option value="">Unassigned</option>
                        {staffList.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                      </select>
                    ) : (
                      <div>
                        {r.assigned_to === session?.id ? (
                          <span className="pill badge-blue" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>👤 Assigned to You</span>
                        ) : r.assigned_to ? (
                          <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                            {staffList.find(s => s.id === r.assigned_to)?.name || 'Staff Member'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </div>
                    )}
                  </td>
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

        {activeTab === 'Careers' && (
          <div className="portal-container" style={{padding: '2rem'}}>
            <div className="dash-panel">
              <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Careers / Open Positions</h2>
                <button className="btn-settings" style={{background: 'var(--brand-blue)', color: 'white'}} onClick={() => handleOpenGenericModal('Career')}>➕ Add Position</button>
              </div>

              {mockJobs.length === 0 ? (
                <div className="empty-state" style={{marginTop: '2rem'}}>
                  <h3>No Careers / Open Positions Listed</h3>
                  <p>Add your first job opening to start receiving applications.</p>
                </div>
              ) : (
                <div className="leads-table-wrap" style={{marginTop: '1.5rem'}}>
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Experience</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockJobs.map(job => (
                        <tr key={job.id}>
                          <td><strong>{job.icon} {job.title}</strong></td>
                          <td><span className="pill badge-blue" style={{textTransform:'none'}}>{job.type}</span></td>
                          <td>{job.exp}</td>
                          <td>📍 {job.location}</td>
                          <td>
                            <button className="btn-action" onClick={() => handleOpenGenericModal('Career', job)}>Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
            </>
          )}
        </main>
      </div>

      {/* 🛠️ CMS Service Full Builder Modal */}
      {genericModal.isOpen && genericModal.type === 'Service' && (
        <ServiceEditorModal
          isOpen={true}
          data={genericModal.data}
          onClose={() => handleCloseGenericModal(false)}
          onSave={handleSaveService}
          onDelete={handleDeleteService}
        />
      )}

      {/* 📖 CMS Case Study Multi-Section Editor Modal */}
      {genericModal.isOpen && genericModal.type === 'Case Study' && (
        <CaseStudyEditorModal
          isOpen={true}
          data={genericModal.data}
          onClose={() => handleCloseGenericModal(false)}
          onSave={handleSaveCaseStudy}
          onDelete={handleDeleteCaseStudy}
        />
      )}

      {/* ✍️ CMS Blog Multi-Section Editor Modal */}
      {genericModal.isOpen && genericModal.type === 'Blog' && (
        <BlogEditorModal
          isOpen={true}
          data={genericModal.data}
          onClose={() => handleCloseGenericModal(false)}
          onSave={handleSaveBlog}
          onDelete={handleDeleteBlog}
        />
      )}

      {/* --- Generic CRUD Modal (FAQs, Users, Careers) --- */}
      {genericModal.isOpen && genericModal.type !== 'Blog' && genericModal.type !== 'Case Study' && genericModal.type !== 'Service' && (
        <div className="modern-modal-overlay">
          <div className="modern-modal-content">
            <div className="modern-modal-header">
              <h3>
                {genericModal.type === 'FAQ' && '❓ '}
                {genericModal.type === 'User' && '👤 '}
                {genericModal.type === 'Career' && '💼 '}
                {genericModal.data ? 'Edit' : 'Add'} {genericModal.type}
              </h3>
              <button type="button" className="modern-modal-close" onClick={() => handleCloseGenericModal(false)}>✕</button>
            </div>

            <form onSubmit={handleGenericSave} className="modern-modal-form">
              <div className="modern-modal-body">
                <div className="modern-form-grid">

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

              {genericModal.type === 'Career' && (
                <>
                  <div className="modern-form-group">
                    <label>Job Title</label>
                    <input type="text" name="title" className="modern-input" defaultValue={genericModal.data?.title || ''} required placeholder="e.g., QA Automation Engineer" />
                  </div>
                  <div className="modern-form-group">
                    <label>Icon Emoji</label>
                    <input type="text" name="icon" className="modern-input" defaultValue={genericModal.data?.icon || '💼'} required placeholder="e.g., 🎓, 🤖, ⚡" />
                  </div>
                  <div className="modern-form-group">
                    <label>Location</label>
                    <input type="text" name="location" className="modern-input" defaultValue={genericModal.data?.location || ''} required placeholder="e.g., Remote / Hyderabad" />
                  </div>
                  <div className="modern-form-group">
                    <label>Job Type</label>
                    <input type="text" name="type" className="modern-input" defaultValue={genericModal.data?.type || 'Full-Time'} required placeholder="e.g., Full-Time / Internship" />
                  </div>
                  <div className="modern-form-group">
                    <label>Experience Level</label>
                    <input type="text" name="exp" className="modern-input" defaultValue={genericModal.data?.exp || ''} required placeholder="e.g., 2+ Years / Students" />
                  </div>
                  <div className="modern-form-group">
                    <label>Tags / Skills (comma-separated)</label>
                    <input type="text" name="tags" className="modern-input" defaultValue={genericModal.data?.tags ? (Array.isArray(genericModal.data.tags) ? genericModal.data.tags.join(', ') : genericModal.data.tags) : ''} placeholder="e.g., Selenium, Playwright, Cypress" />
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Description</label>
                    <textarea name="description" className="modern-input modern-textarea" defaultValue={genericModal.data?.description || ''} required placeholder="Describe the responsibilities and requirements..."></textarea>
                  </div>
                  <div className="modern-form-group">
                    <label>Posted Date</label>
                    <input type="text" name="posted" className="modern-input" defaultValue={genericModal.data?.posted || ''} required placeholder="e.g., 10 May 2026" />
                  </div>
                  <div className="modern-form-group">
                    <label>Closes Date</label>
                    <input type="text" name="closes" className="modern-input" defaultValue={genericModal.data?.closes || ''} required placeholder="e.g., 10 Jun 2026" />
                  </div>
                  <div className="modern-form-group full-width">
                    <label>Apply Link (Optional)</label>
                    <input type="text" name="apply_link" className="modern-input" defaultValue={genericModal.data?.apply_link || ''} placeholder="Leave empty for default application form link" />
                  </div>
                </>
              )}
                </div>
              </div>

              <div className="modern-modal-actions">
                {genericModal.data && (
                  <button type="button" className="modern-btn-delete" onClick={() => {
                    showConfirm({
                      title: `Delete ${genericModal.type}?`,
                      description: `Are you sure you want to permanently delete this ${genericModal.type.toLowerCase()} record? This action cannot be undone.`,
                      confirmLabel: `Delete ${genericModal.type}`,
                      cancelLabel: 'Cancel',
                      isDestructive: true,
                      onConfirm: () => handleGenericDelete()
                    });
                  }}>🗑️ Delete</button>
                )}
                <button type="button" className="modern-btn-cancel" onClick={() => handleCloseGenericModal(false)}>Cancel</button>
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

      {/* 🗑️ CERTIFICATE DELETION CONFIRMATION MODAL */}
      {certToDelete && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{maxWidth: '480px'}}>
            <div className="modal-header">
              <h3>🗑️ Confirm Certificate Deletion</h3>
              <button className="close-x" onClick={() => setCertToDelete(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.5'}}>
                Are you sure you want to permanently delete the certificate for <strong>{certToDelete.full_name}</strong>?
              </p>
              <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '14px 0', fontSize: '0.85rem'}}>
                <div><strong>Certificate ID:</strong> <code>{certToDelete.certificate_id}</code></div>
                <div><strong>Role:</strong> {certToDelete.internship_role}</div>
                <div><strong>Issue Date:</strong> {certToDelete.issue_date}</div>
              </div>
              <div style={{background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', lineHeight: '1.4'}}>
                ⚠️ <strong>Security Notice:</strong> Once deleted, the public verification URL (<code>/verify/...</code>) will immediately return no certificate and fail verification. This action is logged in the security audit trail and cannot be undone.
              </div>
            </div>
            <div className="modal-footer" style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <button className="btn-cancel" onClick={() => setCertToDelete(null)} disabled={deletingCert}>
                Cancel
              </button>
              <button
                className="btn-confirm-reject"
                onClick={confirmDeleteCert}
                disabled={deletingCert}
                style={{background: '#dc2626', borderColor: '#dc2626'}}
              >
                {deletingCert ? 'Deleting...' : 'Delete Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔑 EMPLOYEE PERMISSIONS MATRIX MODAL */}
      {permModalUser && editingPerms && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{maxWidth: '750px', width: '90%'}}>
            <div className="modal-header">
              <div>
                <h3>🔑 Edit Employee Permissions</h3>
                <p style={{fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0'}}>
                  {permModalUser.name} &bull; {permModalUser.email} ({permModalUser.role})
                </p>
              </div>
              <button className="close-x" onClick={() => { setPermModalUser(null); setEditingPerms(null); }}>✕</button>
            </div>
            <div className="modal-body" style={{maxHeight: '60vh', overflowY: 'auto', padding: '1.5rem'}}>
              <p style={{fontSize: '0.85rem', color: '#475569', marginBottom: '1rem'}}>
                Configure granular module-level permissions for this employee. Permissions are enforced by PostgreSQL Row Level Security (RLS) policies at the database layer.
              </p>

              <div style={{border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden'}}>
                <table className="portal-table" style={{margin: 0}}>
                  <thead style={{background: '#f8fafc'}}>
                    <tr>
                      <th style={{width: '35%'}}>Module</th>
                      {ACTIONS.map(act => (
                        <th key={act.key} style={{textAlign: 'center', width: '16%'}}>{act.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(mod => (
                      <tr key={mod.key}>
                        <td>
                          <strong style={{color: '#1e293b'}}>{mod.label}</strong>
                          <span style={{display: 'block', fontSize: '0.75rem', color: '#64748b'}}>{mod.description}</span>
                        </td>
                        {ACTIONS.map(act => {
                          const isChecked = Boolean(editingPerms[mod.key]?.[act.key]);
                          return (
                            <td key={act.key} style={{textAlign: 'center'}}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(mod.key, act.key)}
                                style={{width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb'}}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(editingPerms.users?.view || editingPerms.users?.edit || editingPerms.security_logs?.view) && (
                <div style={{marginTop: '1rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem'}}>
                  ⚠️ <strong>Elevated Privileges:</strong> You have selected User Management or Security Logs access for this employee. Ensure this level of trust is authorized.
                </div>
              )}
            </div>
            <div className="modal-footer" style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <button
                className="btn-cancel"
                onClick={() => { setPermModalUser(null); setEditingPerms(null); }}
                disabled={savingPerms}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSavePermissions}
                disabled={savingPerms}
                style={{background: '#2563eb'}}
              >
                {savingPerms ? 'Saving Changes...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👤 CHANGE USER ROLE MODAL */}
      {roleModalUser && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{maxWidth: '460px'}}>
            <div className="modal-header">
              <h3>👤 Change User Role</h3>
              <button className="close-x" onClick={() => setRoleModalUser(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '0.9rem', color: '#1e293b', marginBottom: '1rem'}}>
                Select the target role for <strong>{roleModalUser.name}</strong> ({roleModalUser.email}).
              </p>
              <div className="modern-form-group">
                <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block'}}>
                  System Role
                </label>
                <select
                  className="modern-input"
                  value={selectedNewRole}
                  onChange={e => setSelectedNewRole(e.target.value)}
                  style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}}
                >
                  <option value="admin">Admin (Full System Access)</option>
                  <option value="security_auditor">Security Auditor (View Security Logs & Firewall)</option>
                  <option value="employee">Employee (Restricted to Assigned Permissions)</option>
                  <option value="blogger">Blogger (Blog & Media Management)</option>
                </select>
              </div>

              {selectedNewRole === 'security_auditor' && (
                <div className="modern-form-group" style={{marginTop: '1rem'}}>
                  <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px', display: 'block'}}>
                    Access Duration & Auto-Expiry
                  </label>
                  <select
                    className="modern-input"
                    value={tempAccessDuration}
                    onChange={e => setTempAccessDuration(e.target.value)}
                    style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}}
                  >
                    <option value="permanent">Standard / Permanent Access</option>
                    <option value="24h">⏱️ Temporary: 24 Hours (Auto-expires)</option>
                    <option value="7d">⏱️ Temporary: 7 Days (Auto-expires)</option>
                  </select>
                  <span style={{display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>
                    {tempAccessDuration === '24h' ? 'Access automatically revokes 24 hours after grant.' : tempAccessDuration === '7d' ? 'Access automatically revokes 7 days after grant.' : 'Indefinite view access until revoked.'}
                  </span>
                </div>
              )}

              {roleModalUser.role === 'admin' && selectedNewRole !== 'admin' && (
                <div style={{marginTop: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem'}}>
                  ⚠️ <strong>Warning:</strong> Demoting an administrator removes full administrative privileges.
                </div>
              )}
            </div>
            <div className="modal-footer" style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <button className="btn-cancel" onClick={() => setRoleModalUser(null)} disabled={savingRole}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveRole}
                disabled={savingRole}
                style={{background: '#2563eb'}}
              >
                {savingRole ? 'Updating Role...' : 'Confirm Role Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        isDestructive={confirmDialog.isDestructive}
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Modern Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
