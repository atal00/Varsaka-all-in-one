const { createClient } = require('@supabase/supabase-js');

// Standard in-memory rate limiter per container
const ipCache = new Map();

// Strict UUIDv4 regex to reject malformed or sequential IDs before any DB query
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const GENERIC_ERROR_MESSAGE = 'Certificate could not be verified. Please check the verification link and try again.';

exports.handler = async (event) => {
  // 1. CORS headers
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'https://varsaka.com,https://loginto.varsaka.com').split(',').map(o => o.trim());
  const requestOrigin = event.headers.origin || event.headers.Origin;

  let corsOrigin = allowedOrigins[0];
  if (requestOrigin && (allowedOrigins.includes(requestOrigin) || requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1'))) {
    corsOrigin = requestOrigin;
  }

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  // 2. Server-side Rate Limiting (30 requests per minute per IP)
  const ip = event.headers['client-ip'] || 
             event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
             event.headers['x-nf-client-connection-ip'] || 
             'unknown';

  const now = Date.now();
  const rateLimitWindow = 60 * 1000; // 1 minute
  const limit = 30;

  let requestInfo = ipCache.get(ip) || { count: 0, firstRequest: now };
  if (now - requestInfo.firstRequest > rateLimitWindow) {
    requestInfo = { count: 1, firstRequest: now };
  } else {
    requestInfo.count += 1;
  }
  ipCache.set(ip, requestInfo);

  if (requestInfo.count > limit) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Too many verification requests. Please try again later.'
      })
    };
  }

  // 3. Token Parameter Extraction & Format Validation
  const token = event.queryStringParameters?.token?.trim();

  // Reject missing or malformed tokens (e.g. sequential "VAR-INT-2026-001")
  if (!token || !UUID_REGEX.test(token)) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: GENERIC_ERROR_MESSAGE
      })
    };
  }

  // 4. Server-Side Supabase Query (Minimizing response, no internal IDs)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hxexoazbnbtqhyytxitq.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration in serverless environment.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: GENERIC_ERROR_MESSAGE
      })
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Call secure RPC verify_certificate_by_token
    const { data, error } = await supabase
      .rpc('verify_certificate_by_token', { p_token: token });

    if (error || !data || data.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: GENERIC_ERROR_MESSAGE
        })
      };
    }

    const cert = data[0];

    // Response Minimization: Exclude internal primary keys, created_at, admin metadata
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          full_name: cert.full_name,
          internship_role: cert.internship_role,
          project_title: cert.project_title,
          mentor_name: cert.mentor_name,
          grade: cert.grade,
          location: cert.location,
          start_date: cert.start_date,
          end_date: cert.end_date,
          issue_date: cert.issue_date,
          certificate_id: cert.certificate_id,
          public_verification_token: cert.public_verification_token
        }
      })
    };
  } catch (err) {
    console.error('Verification handler error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: GENERIC_ERROR_MESSAGE
      })
    };
  }
};
