const { Resend } = require('resend');

const ipCache = new Map();

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } };
  }
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  try {
    const data = JSON.parse(event.body);

    if (data._honey) {
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Application submitted successfully' }) };
    }

    const { name, email, phone, role, experience, resumeLink, coverLetter } = data;

    if (!name || !email || !role || !resumeLink) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Varsaka Labs Careers <careers@varsaka.com>', // MUST BE VERIFIED IN RESEND
        to: ['career@in.varsaka.com'], 
        subject: `New Job Application: ${role} - ${name}`,
        html: `
          <h3>New Career Application</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Experience:</strong> ${experience || 'N/A'}</p>
          <p><strong>Resume Link:</strong> <a href="${resumeLink}">${resumeLink}</a></p>
          <p><strong>Cover Letter / Notes:</strong></p>
          <blockquote>${coverLetter || 'None'}</blockquote>
        `
      });
    } else {
      console.warn('RESEND_API_KEY not configured. Skipping email.');
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Application submitted successfully' })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
