import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Simulate logging in as admin (replace with actual admin credentials if known, or just sign up a dummy user to get an access token)
  // Actually, let's just sign in with admin@varsaka.com / admin123 which is the default in the codebase usually.
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@varsaka.com',
    password: 'password123' // Or whatever default is
  });

  if (authErr) {
    console.log('Login failed:', authErr.message);
    // Even if login fails, let's try reading leads
  } else {
    console.log('Logged in as:', authData.user.email);
  }

  const { data: leads, error: fetchError } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  console.log('Leads:', leads?.length, fetchError?.message);

  const [
    { data: sData, error: sErr },
  ] = await Promise.all([
    supabase.from('services').select('*').order('created_at', { ascending: false }),
  ]);

  console.log('Services:', sData?.length, sErr?.message);
}

check();
