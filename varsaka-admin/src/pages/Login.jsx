import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import SecureCaptcha from '../components/SecureCaptcha';
import './Login.css';

export default function Login() {
  const [role, setRole] = useState('employee');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [clientIp, setClientIp] = useState('Unknown');
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    setCaptchaKey(prev => prev + 1);
    setIsCaptchaValid(false);
    setError(''); // Clear any errors when switching tabs
  }, [role]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (session) navigate('/portal');
  }, [session, navigate]);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(async data => {
        setClientIp(data.ip);
        const { data: isBlocked } = await supabase.rpc('check_ip_block', { p_ip: data.ip, p_app: 'admin' });
        if (isBlocked) {
          navigate('/404', { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleFailedAttempt = async () => {
    await supabase.rpc('log_failed_attempt', { p_ip: clientIp, p_app: 'admin' });
    // Immediately redirect without notification
    window.location.href = 'https://varsaka.com';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!user.trim() || !pass.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (!isCaptchaValid) {
      handleFailedAttempt();
      return;
    }

    // In Supabase, we use email for login. 
    // If the user enters 'atal', we can assume 'atal@varsaka.com' or just require email.
    // For now, let's assume they enter their email.
    const loginEmail = user.includes('@') ? user.trim() : `${user.trim()}@varsaka.com`;

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: pass.trim(),
    });

    if (authError) {
      handleFailedAttempt();
      return;
    }

    // Clear failed attempts on successful login
    await supabase.rpc('clear_ip_block', { p_ip: clientIp, p_app: 'admin' });

    const { user: sbUser } = data;
    
    // Check role from user metadata
    const userRole = sbUser.user_metadata?.role || 'employee';
    const fullName = sbUser.user_metadata?.full_name || sbUser.email.split('@')[0];

    // ROLE PROTECTION: 
    // If the user selected 'Admin' tab but their account is 'employee', block them.
    // If the user selected 'Employee' tab but their account is 'admin', block them.
    if (role === 'admin' && userRole !== 'admin') {
      await supabase.auth.signOut();
      setError('This account does not have Admin privileges.');
      return;
    }
    if (role === 'employee' && userRole === 'admin') {
      await supabase.auth.signOut();
      setError('Admins must log in through the Admin tab.');
      return;
    }

    // Log activity (Optional: Move this to Supabase later)
    const logs = JSON.parse(localStorage.getItem('varsaka_activity') || '[]');
    logs.push({ id: sbUser.id, name: fullName, type: 'login', time: Date.now() });
    localStorage.setItem('varsaka_activity', JSON.stringify(logs.slice(-500)));

    navigate('/portal');
  };

  return (
    <div className={`login-page ${role}-mode`}>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="login-card fade-in visible">
        <div className="login-header">
          <div className="login-animation">
            <img 
              src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f512/512.gif" 
              alt="🔒" 
              className="lock-gif" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.insertAdjacentHTML('afterend', '<span style="font-size: 2.5rem;">🔒</span>');
              }}
            />
          </div>
          <h1>{role === 'admin' ? 'Admin' : 'Employee'} Login</h1>
          <p className="login-sub">Secure authentication for Varsaka Labs Team</p>
        </div>

        <div className="login-tabs">
          <button className={role === 'employee' ? 'active' : ''} onClick={() => setRole('employee')}>Employee</button>
          <button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="login-group">
            <label>Username</label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input 
                type="text" 
                placeholder="Enter your ID" 
                value={user} 
                onChange={e => setUser(e.target.value)} 
                required 
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>
          <div className="login-group">
            <label>Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="••••••••" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                required 
                autoComplete="off"
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? '👁️' : '🕶️'}
              </button>
            </div>
          </div>
          <div className="login-group">
            <label>Security Check</label>
            <SecureCaptcha key={captchaKey} onValidate={setIsCaptchaValid} />
          </div>
          
          <button type="submit" className="login-btn">
            <>{'Secure Login'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>
          </button>
        </form>

        <div className="login-footer">
          <p>🛡️ End-to-End Encrypted Session</p>
          <span>Authorized Personnel Only</span>
          <div className="login-home-link">
            <button onClick={() => navigate('/')} className="btn-home-back">🏠 Back to Website</button>
          </div>
        </div>
      </div>
    </div>
  );
}
