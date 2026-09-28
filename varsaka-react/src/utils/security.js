/**
 * 🛡️ Varsaka Security Utils - Hardened Version
 * Provides multi-layer sanitization to prevent XSS and Injection attacks.
 */

export const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  
  // 🛡️ Step 1: Deep Strip Malicious Patterns
  let clean = str
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "[removed]") // Remove scripts
    .replace(/on\w+="[^"]*"/gim, "") // Remove event handlers like onclick
    .replace(/javascript:[^"]*/gim, "") // Remove JS links
    .replace(/expression\((.*?)\)/gim, "") // Remove CSS expressions
    .replace(/vbscript:[^"]*/gim, "") // Remove VBScript
    .trim();

  // 🛡️ Step 2: Character-Level Escaping (The most secure part for React)
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    "/": '&#x2F;',
    "`": '&#x60;',
    "=": '&#x3D;'
  };
  
  return clean.replace(/[&<>"'/`=]/g, (m) => map[m]);
};

export const validateEmail = (email) => {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
};

export const validatePhone = (phone) => {
  return /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/im.test(phone);
};

export const logSecurityEvent = async (supabaseClient, { action, targetId, metadata = {} } = {}) => {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient.rpc('log_security_event', {
      p_action: sanitize(action || 'unknown_action'),
      p_target_id: targetId ? sanitize(String(targetId)) : null,
      p_metadata: metadata && typeof metadata === 'object' ? metadata : {}
    });
    if (error) {
      console.warn('Security audit log could not be written via RPC:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Security audit log could not be written:', err.message);
    return null;
  }
};

/**
 * 🧱 Check IP security status (active, temporarily blocked, or permanently blocked)
 */
export const checkIpSecurityStatus = async (supabaseClient, { ip = 'Unknown', app = 'admin' } = {}) => {
  if (!supabaseClient) return { isBlocked: false, isPermanent: false, status: 'ACTIVE' };
  try {
    const { data, error } = await supabaseClient.rpc('check_ip_security_status', {
      p_ip: ip,
      p_app: app
    });
    if (error) {
      console.warn('Failed to check IP security status:', error.message);
      return { isBlocked: false, isPermanent: false, status: 'ACTIVE' };
    }
    return data || { isBlocked: false, isPermanent: false, status: 'ACTIVE' };
  } catch (err) {
    console.warn('Error checking IP security status:', err.message);
    return { isBlocked: false, isPermanent: false, status: 'ACTIVE' };
  }
};

/**
 * 🔐 Track login attempts on the server side with progressive blocking
 */
export const recordLoginAttempt = async (supabaseClient, { ip = 'Unknown', app = 'admin', username = '', success = false, userAgent = null, requestId = null } = {}) => {
  if (!supabaseClient) return { isBlocked: false, status: 'ok' };
  try {
    const { data, error } = await supabaseClient.rpc('record_login_attempt', {
      p_ip: ip,
      p_app: app,
      p_username: sanitize(username || ''),
      p_success: Boolean(success),
      p_user_agent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'),
      p_request_id: requestId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    });
    if (error) {
      console.warn('Failed to record login attempt:', error.message);
      return { isBlocked: false, status: success ? 'ok' : 'failed' };
    }
    return data || { isBlocked: false, status: success ? 'ok' : 'failed' };
  } catch (err) {
    console.warn('Error recording login attempt:', err.message);
    return { isBlocked: false, status: success ? 'ok' : 'failed' };
  }
};

/**
 * 🚫 Admin Block IP (Temporary or Permanent) with server-side audit logging
 */
export const adminBlockIp = async (supabaseClient, { ip, app = 'admin', permanent = false, durationMinutes = 1440, reason = 'Administrative block' } = {}) => {
  if (!supabaseClient || !ip) return { success: false, error: 'Missing client or IP' };
  try {
    const { data, error } = await supabaseClient.rpc('admin_block_ip', {
      p_ip: sanitize(ip),
      p_app: sanitize(app),
      p_permanent: Boolean(permanent),
      p_duration_minutes: Number(durationMinutes) || 1440,
      p_reason: sanitize(reason)
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 🔓 Admin Unblock IP with server-side audit logging
 */
export const adminUnblockIp = async (supabaseClient, { ip, app = 'admin', reason = 'Manually unblocked by administrator' } = {}) => {
  if (!supabaseClient || !ip) return { success: false, error: 'Missing client or IP' };
  try {
    const { data, error } = await supabaseClient.rpc('admin_unblock_ip', {
      p_ip: sanitize(ip),
      p_app: sanitize(app),
      p_reason: sanitize(reason)
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * ⚙️ Update platform security settings (Administrator only)
 */
export const updateSecuritySettings = async (supabaseClient, settings = {}) => {
  if (!supabaseClient) return { success: false, error: 'Missing client' };
  try {
    const { data, error } = await supabaseClient.rpc('update_security_settings', {
      p_failed_attempt_threshold: settings.failed_attempt_threshold || null,
      p_initial_block_minutes: settings.initial_block_minutes || null,
      p_progressive_multiplier: settings.progressive_multiplier || null,
      p_max_block_minutes: settings.max_block_minutes || null,
      p_mfa_enforced_for_admins: settings.mfa_enforced_for_admins ?? null,
      p_session_timeout_minutes: settings.session_timeout_minutes || null
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};


