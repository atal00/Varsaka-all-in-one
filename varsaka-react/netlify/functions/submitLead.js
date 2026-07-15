const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Standard Node rate limiter map (since Netlify functions are somewhat stateless, 
// this only works per-container, but it's enough for basic spam prevention)
const ipCache = new Map();

exports.handler = async (event, context) => {
  // 1. CORS & Methods
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } };
  }
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 2. Rate Limiting (5 requests per hour per IP)
  const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const rateLimitWindow = 60 * 60 * 1000; // 1 hour
  const limit = 5;

  let requestInfo = ipCache.get(ip) || { count: 0, firstRequest: now };
  if (now - requestInfo.firstRequest > rateLimitWindow) {
    requestInfo = { count: 1, firstRequest: now };
  } else {
    requestInfo.count += 1;
  }
  ipCache.set(ip, requestInfo);

  if (requestInfo.count > limit) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  try {
    const data = JSON.parse(event.body);

    // 3. Honeypot check (Spam prevention)
    if (data._honey) {
      // Silently accept but do nothing
      return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Lead submitted successfully' }) };
    }

    const { name, email, phone, service, message } = data;

    // 4. Basic Validation
    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // 5. Secure Database Insertion via Service Role
    // Bypasses RLS safely on the backend
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: dbError } = await supabase.from('leads').insert([{
        name: name.substring(0, 100), // sanitize length
        email: email.substring(0, 150),
        phone: phone ? phone.substring(0, 20) : null,
        service: service ? service.substring(0, 50) : 'General Inquiry',
        message: message.substring(0, 2000),
        status: 'new',
        source: 'Website Form'
      }]);

      if (dbError) {
        console.error('Supabase Error:', dbError);
        // Continue to send email even if DB fails
      }
    } else {
      console.warn('Supabase service role key not configured. Skipping DB insert.');
    }

    // 6. Send Email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Varsaka Labs Leads <leads@varsaka.com>', // MUST BE VERIFIED IN RESEND
        to: ['abhishek@ai.varsaka.com'], 
        subject: `New Lead: ${service || 'General Inquiry'} from ${name}`,
        html: `
          <h3>New Lead Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Message:</strong></p>
          <blockquote>${message}</blockquote>
        `
      });
    } else {
      console.warn('RESEND_API_KEY not configured. Skipping email.');
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Lead submitted successfully' })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
