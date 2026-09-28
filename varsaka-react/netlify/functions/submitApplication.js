const { Resend } = require('resend');

const ipCache = new Map();

exports.handler = async (event, context) => {
  // Strict CORS checking
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'https://varsaka.com,https://loginto.varsaka.com').split(',').map(o => o.trim());
  const requestOrigin = event.headers.origin;
  
  let corsOrigin = allowedOrigins[0];
  if (requestOrigin && (allowedOrigins.includes(requestOrigin) || requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1'))) {
    corsOrigin = requestOrigin;
  }

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // Rate Limiting (5 requests per hour)
  const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const rateLimitWindow = 60 * 60 * 1000;
  
  let requestInfo = ipCache.get(ip) || { count: 0, firstRequest: now };
  if (now - requestInfo.firstRequest > rateLimitWindow) {
    requestInfo = { count: 1, firstRequest: now };
  } else {
    requestInfo.count += 1;
  }
  ipCache.set(ip, requestInfo);

  if (requestInfo.count > 5) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  try {
    const data = JSON.parse(event.body);

    if (data._honey) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Application submitted successfully' }) };
    }

    const { name, email, phone, role, experience, resumeLink, coverLetter } = data;

    if (!name || !email || !role || !resumeLink) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email format' }) };
    }

    // Strict URL validation for resume link (https or http only)
    if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(resumeLink)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid resume link URL. Must start with http:// or https://' }) };
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const escapeHtml = (str) => {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone || 'N/A');
      const safeRole = escapeHtml(role);
      const safeExp = escapeHtml(experience || 'N/A');
      const safeResume = escapeHtml(resumeLink);
      const safeLetter = escapeHtml(coverLetter || 'None');
      const safeSubject = `New Job Application: ${safeRole} - ${safeName}`.replace(/[\r\n]+/g, ' ').substring(0, 150);

      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Varsaka Labs Careers <careers@varsaka.com>', // MUST BE VERIFIED IN RESEND
        to: ['career@in.varsaka.com'], 
        subject: safeSubject,
        html: `
          <h3>New Career Application</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Role:</strong> ${safeRole}</p>
          <p><strong>Experience:</strong> ${safeExp}</p>
          <p><strong>Resume Link:</strong> <a href="${safeResume}" target="_blank" rel="noopener noreferrer">${safeResume}</a></p>
          <p><strong>Cover Letter / Notes:</strong></p>
          <blockquote>${safeLetter}</blockquote>
        `
      });
    } else {
      console.warn('RESEND_API_KEY not configured. Skipping email.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Application submitted successfully' })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
