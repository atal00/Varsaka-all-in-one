const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Strict CORS checking
  const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'https://varsaka.com').split(',').map(o => o.trim());
  const requestOrigin = event.headers.origin;
  
  let corsOrigin = allowedOrigins[0];
  if (requestOrigin && (allowedOrigins.includes(requestOrigin) || requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1'))) {
    corsOrigin = requestOrigin;
  }

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: 'Server misconfiguration: Missing Supabase credentials in environment.' }) 
    };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Missing token' }) };
  }
  const token = authHeader.replace('Bearer ', '');

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Validate caller token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Invalid token' }) };
    }

    // Check if caller is admin
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Admin access required' }) };
    }

    const { action, payload } = JSON.parse(event.body);

    if (action === 'create') {
      const { email, password, full_name, role, permissions } = payload;
      
      // Input Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email format' }) };
      }
      
      const allowedRoles = ['admin', 'super_admin', 'employee', 'manager'];
      if (role && !allowedRoles.includes(role)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid role specified' }) };
      }
      
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
      });
      if (createError) throw createError;

      const userId = authData.user.id;
      
      // Wait for trigger to fire
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { error: updateError } = await supabaseAdmin.from('profiles').update({
        role: role || 'employee',
        permissions: permissions || { manage_blogs: false, manage_services: false, access_portal: true, access_invoice: false, access_blogs: false }
      }).eq('id', userId);

      if (updateError) throw updateError;

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'User created successfully', user: authData.user }) };
    } 
    
    else if (action === 'update') {
      const { userId, role, permissions } = payload;
      
      // Input Validation
      const allowedRoles = ['admin', 'super_admin', 'employee', 'manager'];
      if (role && !allowedRoles.includes(role)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid role specified' }) };
      }
      const { error: updateError } = await supabaseAdmin.from('profiles').update({
        role,
        permissions
      }).eq('id', userId);
      
      if (updateError) throw updateError;
      
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'User updated successfully' }) };
    }
    
    else if (action === 'delete') {
      const { userId } = payload;
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'User deleted successfully' }) };
    }
    
    else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
    }
  } catch (error) {
    console.error('Manage Users Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
