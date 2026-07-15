import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const [
    { data: sData, error: sErr },
    { data: bData, error: bErr },
    { data: tData, error: tErr },
    { data: fData, error: fErr }
  ] = await Promise.all([
    supabase.from('services').select('*').order('created_at', { ascending: false }),
    supabase.from('blogs').select('*').order('created_at', { ascending: false }),
    supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
    supabase.from('faqs').select('*').order('created_at', { ascending: false })
  ]);

  console.log('Services:', sData?.length, sErr?.message);
  console.log('Blogs:', bData?.length, bErr?.message);
  console.log('Testimonials:', tData?.length, tErr?.message);
  console.log('Faqs:', fData?.length, fErr?.message);
}

check();
