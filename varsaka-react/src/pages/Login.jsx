import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import SecureCaptcha from '../components/SecureCaptcha';
import { checkIpSecurityStatus, recordLoginAttempt } from '../utils/security';
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

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCaptchaKey(prev => prev + 1);
    setIsCaptchaValid(false);
    setError(''); // Clear any errors when switching tabs
    setLoginStatus('');
    setIsLoggingIn(false);
  }, [role]);

  const handleCaptchaValidate = (isValid) => {
    console.log('[Login] Security verification state updated:', isValid);
    setIsCaptchaValid(isValid);
    if (isValid) {
      setError(prev => prev === 'Please complete the security check.' ? '' : prev);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (session && !isLoggingIn) navigate('/portal');
  }, [session, navigate, isLoggingIn]);

  const [ipSecurityStatus, setIpSecurityStatus] = useState({
    isBlocked: false,
    isPermanent: false,
    status: 'ACTIVE',
    reason: '',
    remainingSeconds: 0
  });

  useEffect(() => {
    let active = true;
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(async data => {
        if (!active) return;
        setClientIp(data.ip);
        const status = await checkIpSecurityStatus(supabase, { ip: data.ip, app: 'varsaka_main' });
        if (!active) return;
        setIpSecurityStatus(status);
        if (status.isBlocked) {
          setError(
            status.isPermanent
              ? '⛔ Access from this IP address has been permanently blocked by an administrator.'
              : `⛔ Access temporarily restricted due to excessive failed attempts. Please try again later.`
          );
        }
      })
      .catch(async () => {
        if (!active) return;
        const status = await checkIpSecurityStatus(supabase, { ip: 'Unknown', app: 'varsaka_main' });
        if (!active) return;
        setIpSecurityStatus(status);
      });
    return () => { active = false; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoggingIn || ipSecurityStatus.isBlocked) return; // Prevent double-clicks and blocked requests
    setError('');
    setLoginStatus('');

    console.log('[Login] Login submission state - isLoggingIn:', isLoggingIn, 'isCaptchaValid:', isCaptchaValid, 'user:', user);

    if (ipSecurityStatus.isBlocked) {
      setError(
        ipSecurityStatus.isPermanent
          ? '⛔ Access from this IP address has been permanently blocked by an administrator.'
          : '⛔ Access temporarily restricted due to excessive failed attempts. Please try again later.'
      );
      return;
    }

    if (!user.trim() || !pass.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (!isCaptchaValid) {
      console.warn('[Login] Submission rejected: CAPTCHA security check incomplete.');
      setError('Please complete the security check.');
      setCaptchaKey(prev => prev + 1);
      setIsCaptchaValid(false);
      
      const secRes = await recordLoginAttempt(supabase, {
        ip: clientIp,
        app: 'varsaka_main',
        username: user.trim(),
        success: false
      });

      if (secRes.isBlocked) {
        setIpSecurityStatus(secRes);
        setError(
          secRes.isPermanent
            ? '⛔ Access from this IP address has been permanently blocked by an administrator.'
            : `⛔ Too many failed attempts. Access temporarily restricted for ${secRes.durationMinutes || 15} minutes.`
        );
      }
      return;
    }

    // 1 & 2 & 3: Immediately disable button, show spinner, and display initial status
    setIsLoggingIn(true);
    setLoginStatus('Verifying your credentials...');

    // In Supabase, we use email for login.
    const loginEmail = user.includes('@') ? user.trim() : `${user.trim()}@varsaka.com`;

    // Record explicit login time BEFORE signIn to prevent race condition with onAuthStateChange
    sessionStorage.setItem('varsaka_login_time', Date.now().toString());

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: pass.trim(),
      });

      if (authError) {
        sessionStorage.removeItem('varsaka_login_time');
        setIsLoggingIn(false);
        setLoginStatus('');
        
        // Generic failure response - never leak whether username or password was incorrect
        setError('Invalid username or password.');
        
        // Prevent stale CAPTCHA reuse after failed login
        setCaptchaKey(prev => prev + 1);
        setIsCaptchaValid(false);

        const secRes = await recordLoginAttempt(supabase, {
          ip: clientIp,
          app: 'varsaka_main',
          username: user.trim(),
          success: false
        });

        if (secRes.isBlocked) {
          setIpSecurityStatus(secRes);
          setError(
            secRes.isPermanent
              ? '⛔ Access from this IP address has been permanently blocked by an administrator.'
              : `⛔ Too many failed attempts. Access temporarily restricted for ${secRes.durationMinutes || 15} minutes.`
          );
        } else if (secRes.attemptsRemaining !== undefined && secRes.attemptsRemaining <= 2) {
          setError(`Invalid username or password. Warning: ${secRes.attemptsRemaining} attempt${secRes.attemptsRemaining === 1 ? '' : 's'} remaining before temporary block.`);
        }
        return;
      }

      // Record successful login in security audit logs and clear failed attempt counters
      await recordLoginAttempt(supabase, {
        ip: clientIp,
        app: 'varsaka_main',
        username: loginEmail,
        success: true
      });

      const { user: sbUser } = data;
      if (!sbUser) {
        setIsLoggingIn(false);
        setLoginStatus('');
        setError("We couldn't verify your account access. Please try again.");
        return;
      }

      // 4. Update status when profile/role verification starts
      setLoginStatus('Verifying account access...');

      let userRole = (sbUser.user_metadata?.role || '').toLowerCase().trim();
      let fullName = sbUser.user_metadata?.full_name || sbUser.email.split('@')[0];

      try {
        const queryPromise = supabase
          .from('profiles')
          .select('role, permissions, full_name')
          .eq('id', sbUser.id)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile query timeout')), 4000)
        );

        const { data: prof, error: profErr } = await Promise.race([queryPromise, timeoutPromise]);

        if (profErr) {
          console.error('[Login] Profile query error:', profErr);
          await supabase.auth.signOut();
          sessionStorage.removeItem('varsaka_login_time');
          setIsLoggingIn(false);
          setLoginStatus('');
          setError("We couldn't verify your account access. Please try again.");
          return;
        }

        if (prof) {
          if (prof.role) userRole = String(prof.role).toLowerCase().trim();
          if (prof.full_name) fullName = prof.full_name;
          if (prof.permissions?.is_disabled) {
            await supabase.auth.signOut();
            sessionStorage.removeItem('varsaka_login_time');
            setIsLoggingIn(false);
            setLoginStatus('');
            setError('Your account has been deactivated. Please contact an administrator.');
            return;
          }
        } else if (!userRole) {
          await supabase.auth.signOut();
          sessionStorage.removeItem('varsaka_login_time');
          setIsLoggingIn(false);
          setLoginStatus('');
          setError("We couldn't verify your account access. Please try again.");
          return;
        }
      } catch (err) {
        console.error('[Login] Profile verification timeout/error:', err);
        await supabase.auth.signOut();
        sessionStorage.removeItem('varsaka_login_time');
        setIsLoggingIn(false);
        setLoginStatus('');
        setError("We couldn't verify your account access. Please try again.");
        return;
      }

      if (!userRole) userRole = 'employee';

      // ROLE PROTECTION: 
      // If the user selected 'Admin' tab but their account is 'employee', block them.
      // If the user selected 'Employee' tab but their account is 'admin', block them.
      if (role === 'admin' && userRole !== 'admin') {
        await supabase.auth.signOut();
        sessionStorage.removeItem('varsaka_login_time');
        setIsLoggingIn(false);
        setLoginStatus('');
        setError('This account does not have Admin privileges.');
        return;
      }
      if (role === 'employee' && userRole === 'admin') {
        await supabase.auth.signOut();
        sessionStorage.removeItem('varsaka_login_time');
        setIsLoggingIn(false);
        setLoginStatus('');
        setError('Admins must log in through the Admin tab.');
        return;
      }

      // Admins do not have session timeout
      if (userRole === 'admin') {
        sessionStorage.removeItem('varsaka_login_time');
      }

      // Log activity
      try {
        const logs = JSON.parse(localStorage.getItem('varsaka_activity') || '[]');
        logs.push({ id: sbUser.id, name: fullName, type: 'login', time: Date.now() });
        localStorage.setItem('varsaka_activity', JSON.stringify(logs.slice(-500)));
      } catch (e) {}

      // 5. Authorization succeeds: show verified & redirecting status
      setLoginStatus('Access verified. Redirecting...');

      // 6. Navigate to /portal
      setTimeout(() => {
        navigate('/portal');
      }, 350);
    } catch (err) {
      console.error('[Login] Unexpected login exception:', err);
      sessionStorage.removeItem('varsaka_login_time');
      setIsLoggingIn(false);
      setLoginStatus('');
      setError("We couldn't verify your account access. Please try again.");
    }
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
                disabled={isLoggingIn || ipSecurityStatus.isBlocked}
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
                disabled={isLoggingIn || ipSecurityStatus.isBlocked}
                autoComplete="off"
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} disabled={ipSecurityStatus.isBlocked}>
                {showPass ? '👁️' : '🕶️'}
              </button>
            </div>
          </div>
          <div className="login-group">
            <label>Security Check</label>
            <SecureCaptcha key={captchaKey} onValidate={handleCaptchaValidate} />
          </div>
          
          <button type="submit" className="login-btn" disabled={isLoggingIn || ipSecurityStatus.isBlocked} id="btn-login-submit">
            {isLoggingIn ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="login-spinner" />
                Signing in...
              </span>
            ) : ipSecurityStatus.isBlocked ? (
              <span>⛔ Access Blocked</span>
            ) : (
              <>Secure Login <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i></>
            )}
          </button>

          {loginStatus && (
            <div className="login-status-msg" id="login-progress-status">
              <span className="login-status-pulse" />
              <span>{loginStatus}</span>
            </div>
          )}
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
