import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './Apply.css';
import { sanitize, validateEmail, validatePhone } from '../utils/security';
import { supabase } from '../supabaseClient';
import SecureCaptcha from '../components/SecureCaptcha';

// Role-specific config for the Welcome screen
const ROLE_CONFIG = {
  'General Application': {
    icon: '🎓',
    heading: '2026 Cohort Internship Program',
    tagline: 'Apply for our 12-week intensive internship and launch your career with Varsaka Labs.',
    about: 'Our 2026 Cohort is open to ambitious students and recent graduates across all disciplines — Technical, Human Resources, Finance, Design, Marketing, and Operations. You will work on real client projects, receive 1-on-1 mentorship, and gain critical experience inside a fast-growing quality engineering company.',
    details: [
      '📍 Location: Remote (Global) or Hybrid (Hyderabad / Bangalore)',
      '📅 Application Deadline: 30 Jun 2026',
      '⏱️ Duration: 12 Weeks',
      '💡 Perks: Competitive stipend, mentorship, and full-time conversion opportunities.',
    ],
  },
  'Senior QA Automation Engineer': {
    icon: '🤖',
    heading: 'Senior QA Automation Engineer',
    tagline: 'Lead the automation vision at Varsaka Labs and shape our quality engineering culture.',
    about: 'We are looking for an experienced automation architect to own our end-to-end testing frameworks. You will design scalable test suites using Selenium, Playwright, or Cypress, mentor junior engineers, and collaborate closely with dev and DevOps teams to embed quality at every stage of the SDLC.',
    details: [
      '📍 Location: Hyderabad (Hybrid)',
      '🕒 Type: Full-Time',
      '📅 Application Deadline: 31 May 2026',
      '💼 Experience: 3+ Years in QA Automation',
    ],
  },
  'Performance Test Engineer': {
    icon: '⚡',
    heading: 'Performance Test Engineer',
    tagline: 'Build the systems that ensure our platforms scale under pressure.',
    about: 'As a Performance Test Engineer at Varsaka Labs you will design and execute load, stress, and soak tests for high-traffic applications. You will identify bottlenecks, build performance dashboards, and work with our DevOps team to integrate performance tests into CI/CD pipelines using tools like JMeter, k6, and Gatling.',
    details: [
      '📍 Location: Remote',
      '🕒 Type: Full-Time',
      '📅 Application Deadline: 31 May 2026',
      '💼 Experience: 2+ Years in Performance Testing',
    ],
  },
  'HR Generalist': {
    icon: '👥',
    heading: 'HR Generalist / Talent Acquisition',
    tagline: 'Help us find and nurture the talent that powers Varsaka Labs.',
    about: 'We are growing and need an HR Generalist who can lead our recruitment efforts and build a world-class team culture. You will manage the full-cycle hiring process — from sourcing and screening candidates to onboarding new team members — while supporting day-to-day HR operations.',
    details: [
      '📍 Location: Hyderabad',
      '🕒 Type: Full-Time',
      '📅 Application Deadline: 10 Jun 2026',
      '💼 Experience: 2+ Years in HR / Talent Acquisition',
    ],
  },
  'QA Engineer Manual': {
    icon: '🧪',
    heading: 'QA Engineer — Manual & Exploratory',
    tagline: 'Your eye for detail will keep our products rock-solid.',
    about: 'Join our QA team as a Manual & Exploratory Testing specialist. You will write thorough test cases, perform exploratory testing sessions, file detailed bug reports, and help maintain quality across multiple client projects. This is a great entry point for freshers passionate about software quality.',
    details: [
      '📍 Location: Hyderabad',
      '🕒 Type: Full-Time / Intern',
      '📅 Application Deadline: 8 Jun 2026',
      '💼 Experience: 0–2 Years',
    ],
  },
  'Other': {
    icon: '💼',
    heading: 'Other / Not Listed',
    tagline: "Can't find your role? We'd still love to hear from you.",
    about: "If the role you're looking for isn't listed, please go ahead and apply anyway. Tell us about your background, skills, and what you're looking for. Our team reviews every application and will reach out if there's a good fit — now or in the future.",
    details: [
      '📍 Location: Varies by role',
      '🕒 Type: Open to Full-Time, Part-Time & Internship',
      '📅 Rolling applications — reviewed continuously',
      '💡 Tip: Use the essay section to tell us exactly what you bring to the table.',
    ],
  },
};

const getRoleConfig = (role) => {
  if (!role) return ROLE_CONFIG['General Application'];
  // Try exact match first
  if (ROLE_CONFIG[role]) return ROLE_CONFIG[role];
  // Try case-insensitive match
  const key = Object.keys(ROLE_CONFIG).find(
    k => k.toLowerCase() === role.toLowerCase()
  );
  if (key) return ROLE_CONFIG[key];
  // Fallback: generic card for unknown roles
  return {
    icon: '📋',
    heading: role,
    tagline: `Apply for the ${role} position at Varsaka Labs.`,
    about: 'We are excited to review your application. Please complete all steps of this form with accurate information. Our team will reach out to shortlisted candidates within 5–7 business days.',
    details: [
      '📍 Location: See job listing for details',
      '🕒 Type: See job listing for details',
      '📅 Deadline: See job listing for details',
    ],
  };
};

export default function Apply() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryRole = queryParams.get('role');

  const [currentStep, setCurrentStep] = useState(0);

  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    university: '',
    major: '',
    gradYear: '',
    roleTrack: '',
    essayWhy: '',
    essayProject: ''
  });

  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [customSkills, setCustomSkills] = useState([]); // tracks custom tags added by user
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size }
  const [customTagInput, setCustomTagInput] = useState('');
  const [customRole, setCustomRole] = useState(''); // used when roleTrack === 'Other'

  // CAPTCHA State
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaError, setCaptchaError] = useState(false);

  // Form Validation Errors
  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    phone: false,
    linkedin: false,
    github: false,
    portfolio: false,
    university: false,
    major: false,
    gradYear: false,
    roleTrack: false,
    customRole: false,
    skills: false,
    resume: false,
    essayWhy: false,
    essayProject: false,
    captcha: false
  });

  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const defaultSkills = [
    'React', 'Node.js', 'Python', 'Go', 'TypeScript', 'Machine Learning', 
    'Figma', 'Product Strategy', 'SQL', 'Docker', 'CSS Grid', 'Tailwind',
    'Financial Analysis', 'Taxes & Audits', 'Recruiting', 'Onboarding', 
    'Content Writing', 'SEO', 'Data Analysis', 'Talent Acquisition', 'Operations'
  ];

  // 0. Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 2. Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('application_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTimeout(() => {
          if (draft.formState) setFormState(draft.formState);
          if (draft.skills) setSelectedSkills(new Set(draft.skills));
          if (draft.customSkills) setCustomSkills(draft.customSkills);
          // Note: We intentionally do not restore the resume draft file state, 
          // because the actual File object content is not stored in localStorage 
          // (browser sandbox limitation). This forces the user to re-upload the 
          // physical file to ensure it actually gets uploaded on submit.
        }, 0);
      } catch (e) {
        console.error('Error loading application draft: ', e);
      }
    }
  }, []);

  // 3. Override roleTrack if careers page has query role
  useEffect(() => {
    if (queryRole) {
      setTimeout(() => {
        setFormState(prev => ({ ...prev, roleTrack: queryRole }));
      }, 0);
    }
  }, [queryRole]);

  // 4. Save draft in localStorage when changes occur
  useEffect(() => {
    if (currentStep < 5) {
      const draft = {
        formState,
        skills: Array.from(selectedSkills),
        customSkills,
        // Only save metadata — File objects cannot be JSON serialised
        uploadedFile: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size } : null
      };
      localStorage.setItem('application_draft', JSON.stringify(draft));
    }
  }, [formState, selectedSkills, customSkills, uploadedFile, currentStep]);

  // Real-time Input Change Helper
  const handleInputChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  // Step validation engine
  const checkStepValidity = (stepIndex) => {
    const newErrors = { ...errors };
    let isValid = true;

    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    if (stepIndex === 1) { // Personal Details
      const isNameValid = formState.fullName.trim().length >= 2;
      newErrors.fullName = !isNameValid;
      
      const isEmailValid = validateEmail(formState.email);
      newErrors.email = !isEmailValid;

      const isPhoneValid = validatePhone(formState.phone) || /^\+?[0-9\s\-()]{7,15}$/.test(formState.phone);
      newErrors.phone = !isPhoneValid;

      const isLinkedinValid = formState.linkedin.trim() === '' || urlRegex.test(formState.linkedin.trim());
      newErrors.linkedin = !isLinkedinValid;

      const isGithubValid = formState.github.trim() === '' || urlRegex.test(formState.github.trim());
      newErrors.github = !isGithubValid;

      const isPortfolioValid = formState.portfolio.trim() === '' || urlRegex.test(formState.portfolio.trim());
      newErrors.portfolio = !isPortfolioValid;

      isValid = isNameValid && isEmailValid && isPhoneValid && isLinkedinValid && isGithubValid && isPortfolioValid;
    } else if (stepIndex === 2) { // Academic Profile
      const isUniValid = formState.university.trim().length >= 2;
      newErrors.university = !isUniValid;

      const isMajorValid = formState.major.trim().length >= 2;
      newErrors.major = !isMajorValid;

      const year = parseInt(formState.gradYear);
      const isGradValid = !isNaN(year) && year >= 2020 && year <= 2030;
      newErrors.gradYear = !isGradValid;

      const isTrackValid = formState.roleTrack !== '';
      newErrors.roleTrack = !isTrackValid;

      // If 'Other' is chosen, the custom role text is required
      const isCustomRoleValid = formState.roleTrack !== 'Other' || customRole.trim().length >= 2;
      newErrors.customRole = !isCustomRoleValid;

      isValid = isUniValid && isMajorValid && isGradValid && isTrackValid && isCustomRoleValid;
    } else if (stepIndex === 3) { // Skills & Resume
      const isSkillsValid = selectedSkills.size >= 2;
      newErrors.skills = !isSkillsValid;

      const isResumeValid = uploadedFile !== null && uploadedFile.file !== null;
      newErrors.resume = !isResumeValid;

      isValid = isSkillsValid && isResumeValid;
    } else if (stepIndex === 4) { // Motivation & Captcha
      const isWhyValid = formState.essayWhy.trim().length >= 20;
      newErrors.essayWhy = !isWhyValid;

      const isProjectValid = formState.essayProject.trim().length >= 20;
      newErrors.essayProject = !isProjectValid;

      newErrors.captcha = !isCaptchaValid;
      setCaptchaError(!isCaptchaValid);

      isValid = isWhyValid && isProjectValid && isCaptchaValid;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Navigations
  const handleNext = () => {
    if (checkStepValidity(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Find the first error element and scroll to it
      setTimeout(() => {
        const firstError = document.querySelector('.error-msg.visible');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkStepValidity(4)) {
      return;
    }

    setSubmitting(true);

    try {
      const roleLabel = formState.roleTrack === 'Other'
        ? `Other: ${sanitize(customRole)}`
        : formState.roleTrack;

      // ── Step 1: Upload resume to Supabase Storage ──────────────────────────
      let resumeLink = 'Not uploaded';
      if (uploadedFile?.file) {
        const timestamp = Date.now();
        const safeName = uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${timestamp}_${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(storagePath, uploadedFile.file, {
            contentType: uploadedFile.file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase resume upload failed:', uploadError);
          const errorMsg = uploadError.message || JSON.stringify(uploadError);
          alert(`Resume upload failed: ${errorMsg}\n\nThis is typically because:\n1. The "resumes" storage bucket doesn't exist in Supabase.\n2. The bucket's RLS policies do not allow anonymous uploads.\n\nPlease check your Supabase Storage settings.`);
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(storagePath);
        resumeLink = urlData?.publicUrl || 'Upload succeeded but URL unavailable';
      }

      // ── Step 2: Send email via FormSubmit (JSON, with resume link) ─────────
      const payload = {
        _subject:  `New Application — ${roleLabel} | Varsaka Labs`,
        _template: 'table',
        _captcha:  'false',

        'Full Name':               sanitize(formState.fullName),
        'Email':                   sanitize(formState.email),
        'Phone':                   sanitize(formState.phone),
        'LinkedIn':                sanitize(formState.linkedin)  || 'Not provided',
        'GitHub':                  sanitize(formState.github)    || 'Not provided',
        'Portfolio':               sanitize(formState.portfolio) || 'Not provided',
        'University':              sanitize(formState.university),
        'Major / Field':           sanitize(formState.major),
        'Graduation Year':         formState.gradYear,
        'Applied Role':            roleLabel,
        'Skills':                  Array.from(selectedSkills).join(', '),
        'Resume (Download Link)':  resumeLink,
        'Why Varsaka':             sanitize(formState.essayWhy),
        'Project / Achievement':   sanitize(formState.essayProject),
        'Submitted At':            new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      };

      const BACKEND_API = '/.netlify/functions/submitApplication';
      await fetch(BACKEND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Submission failed');
      }

      // Proceed to success screen
      setCurrentStep(5);
      localStorage.removeItem('application_draft');
    } catch (err) {
      console.error(err);
      alert(`Error submitting application: ${err.message || err}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form to start again
  const handleRestart = () => {
    setFormState({
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: '',
      university: '',
      major: '',
      gradYear: '',
      roleTrack: '',
      essayWhy: '',
      essayProject: ''
    });
    setSelectedSkills(new Set());
    setCustomSkills([]);
    setUploadedFile(null);
    setCaptchaKey(prev => prev + 1);
    setIsCaptchaValid(false);
    setCurrentStep(0);
    setErrors({
      fullName: false,
      email: false,
      phone: false,
      linkedin: false,
      github: false,
      portfolio: false,
      university: false,
      major: false,
      gradYear: false,
      roleTrack: false,
      skills: false,
      resume: false,
      essayWhy: false,
      essayProject: false,
      captcha: false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Skill Tag Toggle
  const handleToggleSkill = (skill) => {
    const nextSkills = new Set(selectedSkills);
    if (nextSkills.has(skill)) {
      nextSkills.delete(skill);
    } else {
      if (nextSkills.size >= 8) {
        alert('You can select a maximum of 8 skills.');
        return;
      }
      nextSkills.add(skill);
    }
    setSelectedSkills(nextSkills);
    setErrors(prev => ({ ...prev, skills: nextSkills.size < 2 }));
  };

  // Custom Tag Added
  const handleAddCustomSkill = (e) => {
    if (e) e.preventDefault();
    const text = customTagInput.trim();
    if (text) {
      if (selectedSkills.size >= 8) {
        alert('You can select a maximum of 8 skills.');
        return;
      }
      const allExisting = [...defaultSkills, ...customSkills];
      const isDuplicate = allExisting.some(s => s.toLowerCase() === text.toLowerCase());
      if (isDuplicate) {
        alert('This skill tag already exists.');
        return;
      }
      setCustomSkills(prev => [...prev, text]);
      const nextSkills = new Set(selectedSkills);
      nextSkills.add(text);
      setSelectedSkills(nextSkills);
      setCustomTagInput('');
      setErrors(prev => ({ ...prev, skills: nextSkills.size < 2 }));
    }
  };

  // Drag and Drop Upload Support
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processUploadedFile = (file) => {
    const validExtensions = ['pdf', 'docx'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      alert('Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    setUploadedFile({
      name: file.name,
      size: formatFileSize(file.size),
      file: file           // store the real File object for attachment
    });
    setErrors(prev => ({ ...prev, resume: false }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelectChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors(prev => ({ ...prev, resume: true }));
  };

  // Render steps calculations
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="page-wrapper apply-page-wrapper">
      {/* Glowing background decorative objects */}
      <div className="glow-orb orb-1" aria-hidden="true"></div>
      <div className="glow-orb orb-2" aria-hidden="true"></div>

      <main className="form-container">
        {/* Visual Banner Header */}
        <div className="form-banner-wrapper">
          <img src="/banner.png" alt="Varsaka Labs abstract tech design banner" className="form-banner" id="formBannerImg" />
        </div>

        {/* Form Step Progress Bar */}
        <div className="progress-container" aria-hidden="true">
          <div 
            id="progressBar" 
            className="progress-bar" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>

        {/* Form Content */}
        <div className="form-steps-wrapper">
          
          {/* STEP 0: WELCOME SCREEN — role-specific */}
          {(() => {
            const rc = getRoleConfig(queryRole);
            return (
              <div className={`form-step ${currentStep === 0 ? 'active' : ''}`}>
                <div className="welcome-role-icon" aria-hidden="true">{rc.icon}</div>
                <h1 className="step-title">{rc.heading}</h1>
                <p className="step-subtitle">{rc.tagline}</p>

                <div className="welcome-info-card">
                  <h3>About this Role</h3>
                  <p>{rc.about}</p>
                </div>

                <div className="welcome-info-card">
                  <h3>Key Details</h3>
                  <ul className="welcome-details-list">
                    {rc.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}

          {/* STEP 1: PERSONAL DETAILS */}
          <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
            <h2 className="step-title">Personal Details</h2>
            <p className="step-subtitle">Tell us who you are and how we can reach you.</p>
            
            <div className="grid-container">
              <div className="form-group">
                <input 
                  type="text" 
                  id="fullName" 
                  className={`form-input ${errors.fullName ? 'invalid' : ''}`} 
                  placeholder=" " 
                  required 
                  value={formState.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <div className={`error-msg ${errors.fullName ? 'visible' : ''}`} id="err-fullName">
                  Please enter your full name (minimum 2 characters)
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="email" 
                  id="email" 
                  className={`form-input ${errors.email ? 'invalid' : ''}`} 
                  placeholder=" " 
                  required 
                  value={formState.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className={`error-msg ${errors.email ? 'visible' : ''}`} id="err-email">
                  Please enter a valid email address
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="tel" 
                  id="phone" 
                  className={`form-input ${errors.phone ? 'invalid' : ''}`} 
                  placeholder=" " 
                  required 
                  value={formState.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className={`error-msg ${errors.phone ? 'visible' : ''}`} id="err-phone">
                  Please enter a valid phone number
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="url" 
                  id="linkedin" 
                  className={`form-input ${errors.linkedin ? 'invalid' : ''}`} 
                  placeholder=" " 
                  value={formState.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                />
                <label htmlFor="linkedin" className="form-label">LinkedIn Profile (Optional)</label>
                <div className={`error-msg ${errors.linkedin ? 'visible' : ''}`} id="err-linkedin">
                  Please enter a valid URL
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="url" 
                  id="github" 
                  className={`form-input ${errors.github ? 'invalid' : ''}`} 
                  placeholder=" " 
                  value={formState.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                />
                <label htmlFor="github" className="form-label">GitHub Profile (Optional)</label>
                <div className={`error-msg ${errors.github ? 'visible' : ''}`} id="err-github">
                  Please enter a valid URL
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="url" 
                  id="portfolio" 
                  className={`form-input ${errors.portfolio ? 'invalid' : ''}`} 
                  placeholder=" " 
                  value={formState.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                />
                <label htmlFor="portfolio" className="form-label">Portfolio URL (Optional)</label>
                <div className={`error-msg ${errors.portfolio ? 'visible' : ''}`} id="err-portfolio">
                  Please enter a valid URL
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: ACADEMIC & ROLE SELECTOR */}
          <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
            <h2 className="step-title">Academic Profile</h2>
            <p className="step-subtitle">Share your education timeline and matching track.</p>
            
            <div className="grid-container">
              <div className="form-group">
                <input 
                  type="text" 
                  id="university" 
                  className={`form-input ${errors.university ? 'invalid' : ''}`} 
                  placeholder=" " 
                  required 
                  value={formState.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                />
                <label htmlFor="university" className="form-label">University / Institution</label>
                <div className={`error-msg ${errors.university ? 'visible' : ''}`} id="err-university">
                  Please enter your university name
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="text" 
                  id="major" 
                  className={`form-input ${errors.major ? 'invalid' : ''}`} 
                  placeholder=" " 
                  required 
                  value={formState.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                />
                <label htmlFor="major" className="form-label">Field of Study / Major</label>
                <div className={`error-msg ${errors.major ? 'visible' : ''}`} id="err-major">
                  Please enter your major/field of study
                </div>
              </div>

              <div className="form-group">
                <input 
                  type="number" 
                  id="gradYear" 
                  className={`form-input ${errors.gradYear ? 'invalid' : ''}`} 
                  placeholder=" " 
                  min="2020" 
                  max="2030" 
                  required 
                  value={formState.gradYear}
                  onChange={(e) => handleInputChange('gradYear', e.target.value)}
                />
                <label htmlFor="gradYear" className="form-label">Graduation Year (YYYY)</label>
                <div className={`error-msg ${errors.gradYear ? 'visible' : ''}`} id="err-gradYear">
                  Enter a graduation year between 2020 and 2030
                </div>
              </div>

              <div className="form-group select-wrapper">
                <select 
                  id="roleTrack" 
                  className={`form-select ${errors.roleTrack ? 'invalid' : ''}`} 
                  required
                  value={formState.roleTrack}
                  onChange={(e) => handleInputChange('roleTrack', e.target.value)}
                >
                  <option value="" disabled hidden></option>
                  
                  {/* Cohort Tracks */}
                  <option value="software-frontend">Software Engineering (Frontend) - Intern</option>
                  <option value="software-backend">Software Engineering (Backend) - Intern</option>
                  <option value="software-fullstack">Software Engineering (Full-Stack) - Intern</option>
                  <option value="uiux-design">UI/UX Product Design - Intern</option>
                  <option value="data-science">Data Science & AI Engineering - Intern</option>
                  <option value="product-management">Product Management - Intern</option>
                  <option value="hr-intern">Human Resources & Talent Acquisition - Intern</option>
                  <option value="finance-intern">Finance & Business Operations - Intern</option>
                  <option value="marketing-intern">Marketing & Growth - Intern</option>
                  <option value="other-intern">General / Other Internship Track</option>

                  {/* Careers Page Direct Roles */}
                  <option value="Senior QA Automation Engineer">Senior QA Automation Engineer</option>
                  <option value="Performance Test Engineer">Performance Test Engineer</option>
                  <option value="HR Generalist / Talent Acquisition">HR Generalist / Talent Acquisition</option>
                  <option value="QA Engineer - Manual & Exploratory">QA Engineer - Manual & Exploratory</option>
                  <option value="General Application">General Application</option>
                  <option value="Other">Other / Not Listed</option>
                </select>
                <label htmlFor="roleTrack" className="form-label">Preferred Application Role / Track</label>
                <div className={`error-msg ${errors.roleTrack ? 'visible' : ''}`} id="err-roleTrack">
                  Please select an application track or job role
                </div>

                {/* Custom role input — shown only when Other is selected */}
                {formState.roleTrack === 'Other' && (
                  <div className="custom-role-input-wrapper">
                    <input
                      type="text"
                      id="customRole"
                      className={`form-input ${errors.customRole ? 'invalid' : ''}`}
                      placeholder="e.g. Content Writer, DevOps Engineer, Business Analyst…"
                      value={customRole}
                      onChange={(e) => {
                        setCustomRole(e.target.value);
                        setErrors(prev => ({ ...prev, customRole: e.target.value.trim().length < 2 }));
                      }}
                      autoFocus
                    />
                    <label htmlFor="customRole" className="custom-role-label">Please specify your role ✏️</label>
                    <div className={`error-msg ${errors.customRole ? 'visible' : ''}`} id="err-customRole">
                      Please enter the role you are applying for (min. 2 characters)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: SKILLS & RESUME */}
          <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
            <h2 className="step-title">Skills & Resume</h2>
            <p className="step-subtitle">Highlight your technical skillset and upload your resume.</p>
            
            {/* Dynamic Skill Tag System */}
            <div className="form-group full-width">
              <label className="form-label" style={{ position: 'static', fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-mid)', marginBottom: '0.5rem', display: 'block' }}>
                Select/Add your Top Skills (Max 8, Min 2)
              </label>
              
              <div className="skills-selector-container">
                <div className="tags-pool" id="tagsPool">
                  {defaultSkills.map(skill => (
                    <button 
                      key={skill}
                      type="button" 
                      className={`tag-btn ${selectedSkills.has(skill) ? 'selected' : ''}`}
                      onClick={() => handleToggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                  {customSkills.map(skill => (
                    <button 
                      key={skill}
                      type="button" 
                      className={`tag-btn ${selectedSkills.has(skill) ? 'selected' : ''}`}
                      onClick={() => handleToggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                
                <div className="custom-tag-input-wrapper">
                  <input 
                    type="text" 
                    id="customTagInput" 
                    className="form-input" 
                    placeholder="Or enter custom skill tag..." 
                    maxLength="20"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill(e)}
                  />
                  <button 
                    type="button" 
                    id="addCustomTagBtn" 
                    className="add-tag-btn"
                    onClick={handleAddCustomSkill}
                  >
                    Add
                  </button>
                </div>
                <div className={`error-msg ${errors.skills ? 'visible' : ''}`} id="err-skills">
                  Please select or add at least 2 skills
                </div>
              </div>
            </div>

            {/* Resume Dropzone */}
            <div className="form-group full-width" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" style={{ position: 'static', fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-mid)', marginBottom: '0.5rem', display: 'block' }}>
                Resume / CV (PDF or DOCX, Max 5MB)
              </label>
              
              {!uploadedFile ? (
                <div 
                  id="dropzone" 
                  className={`dropzone ${dragActive ? 'dragover' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  tabIndex="0" 
                  role="button" 
                  aria-label="Upload Resume PDF or Word file"
                >
                  <div className="dropzone-icon">📄</div>
                  <div className="dropzone-text">Drag & drop your Resume here or click to browse</div>
                  <div className="dropzone-subtext">Supports PDF, DOCX (Max 5MB)</div>
                  <input 
                    type="file" 
                    id="resumeFileInput" 
                    accept=".pdf,.docx" 
                    style={{ display: 'none' }} 
                    ref={fileInputRef}
                    onChange={handleFileSelectChange}
                  />
                </div>
              ) : (
                <div id="fileStatus" className="file-status-card">
                  <span className="file-status-icon">✓</span>
                  <div className="file-details">
                    <div id="fileName" className="file-name">{uploadedFile.name}</div>
                    <div id="fileSize" className="file-size">{uploadedFile.size}</div>
                  </div>
                  <button 
                    type="button" 
                    id="removeFileBtn" 
                    className="remove-file-btn"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className={`error-msg ${errors.resume ? 'visible' : ''}`} id="err-resume">
                Resume upload is required
              </div>
            </div>
          </div>

          {/* STEP 4: ESSAYS / MOTIVATION */}
          <div className={`form-step ${currentStep === 4 ? 'active' : ''}`}>
            <h2 className="step-title">Tell Us More</h2>
            <p className="step-subtitle">Express your interest and tell us about your accomplishments.</p>
            
            <div className="form-group full-width">
              <textarea 
                id="essayWhy" 
                className={`form-textarea ${errors.essayWhy ? 'invalid' : ''}`} 
                placeholder=" " 
                required 
                maxLength="1000"
                value={formState.essayWhy}
                onChange={(e) => handleInputChange('essayWhy', e.target.value)}
              />
              <label htmlFor="essayWhy" className="form-label">
                Why do you want to join/intern at Varsaka Labs? (Min 20 characters, Max 1000)
              </label>
              <div className={`error-msg ${errors.essayWhy ? 'visible' : ''}`} id="err-essayWhy">
                Please tell us about your motivation (minimum 20 characters required)
              </div>
            </div>

            <div className="form-group full-width" style={{ marginTop: '2rem' }}>
              <textarea 
                id="essayProject" 
                className={`form-textarea ${errors.essayProject ? 'invalid' : ''}`} 
                placeholder=" " 
                required 
                maxLength="1000"
                value={formState.essayProject}
                onChange={(e) => handleInputChange('essayProject', e.target.value)}
              />
              <label htmlFor="essayProject" className="form-label">
                Describe a challenging technical project you built and what you learned. (Min 20 characters, Max 1000)
              </label>
              <div className={`error-msg ${errors.essayProject ? 'visible' : ''}`} id="err-essayProject">
                Please describe one of your projects (minimum 20 characters required)
              </div>
            </div>

            {/* Math Security CAPTCHA */}
            <div className="form-group full-width captcha-group" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <label className="form-label" style={{ position: 'static', fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-mid)', marginBottom: '0.5rem', display: 'block' }}>
                Quick Security Check 🛡️
              </label>
              <SecureCaptcha key={captchaKey} onValidate={(valid) => { setIsCaptchaValid(valid); setErrors(prev => ({ ...prev, captcha: false })); setCaptchaError(false); }} />
              {captchaError && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>
                  ❌ Incorrect CAPTCHA answer. Please try again.
                </p>
              )}
            </div>
          </div>

          {/* STEP 5: SUCCESS / RECEIPT SCREEN */}
          <div className={`form-step ${currentStep === 5 ? 'active' : ''}`}>
            <div className="success-screen">
              <div className="success-icon-wrapper" aria-hidden="true">✓</div>
              <h1 className="step-title">Application Submitted!</h1>
              <p className="step-subtitle" style={{ marginBottom: '1.5rem' }}>
                Thank you for applying. Your application details are logged below for your reference.
              </p>
              
              {/* Receipt Summary Card */}
              <div className="receipt-card">
                <div className="receipt-header">
                  <span className="receipt-title">Application Receipt</span>
                  <span className="receipt-badge">Received</span>
                </div>
                
                <div className="receipt-grid">
                  <div className="receipt-item">
                    <span className="receipt-label">Applicant Name</span>
                    <span className="receipt-value" id="rec-name">{formState.fullName}</span>
                  </div>
                  <div className="receipt-item">
                    <span className="receipt-label">Email Address</span>
                    <span className="receipt-value" id="rec-email">{formState.email}</span>
                  </div>
                  <div className="receipt-item">
                    <span className="receipt-label">Preferred Track / Role</span>
                    <span className="receipt-value" id="rec-track">
                      {formState.roleTrack.startsWith('software-') || formState.roleTrack.includes('design') || formState.roleTrack.includes('management') || formState.roleTrack.includes('science')
                        ? formState.roleTrack.toUpperCase().replace('-', ' ') + ' (Cohort Intern)'
                        : formState.roleTrack
                      }
                    </span>
                  </div>
                  <div className="receipt-item">
                    <span className="receipt-label">University</span>
                    <span className="receipt-value" id="rec-university">{formState.university}</span>
                  </div>
                  <div className="receipt-item full-width">
                    <span className="receipt-label">Skills Identified</span>
                    <div className="receipt-tags" id="rec-skills">
                      {Array.from(selectedSkills).map(skill => (
                        <span key={skill} className="receipt-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="receipt-item full-width">
                    <span className="receipt-label">Uploaded Resume</span>
                    <span className="receipt-value" id="rec-resume" style={{ fontWeight: 600, color: '#10b981' }}>
                      {uploadedFile ? `${uploadedFile.name} (${uploadedFile.size})` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                id="btnRestart" 
                className="btn btn-secondary" 
                style={{ margin: '2.5rem auto 0' }}
                onClick={handleRestart}
              >
                Apply Again
              </button>
            </div>
          </div>

          {/* Navigation Controls (Hidden in Success Step) */}
          {currentStep < 5 && (
            <div className="form-navigation" id="formNavigation">
              <button 
                type="button" 
                id="btnPrev" 
                className="btn btn-secondary" 
                disabled={currentStep === 0}
                onClick={handlePrev}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  id="btnNext" 
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Next
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ) : (
                <button 
                  type="button" 
                  id="btnNext" 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
