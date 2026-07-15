import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: leads, error: errLeads } = await supabase.from('leads').select('*');
  console.log('Leads Error:', errLeads?.message || 'OK', 'Count:', leads?.length);

  const { data: services, error: errServices } = await supabase.from('services').select('*').order('created_at', { ascending: false });
  console.log('Services Error:', errServices?.message || 'OK', 'Count:', services?.length);

  const { data: blogs, error: errBlogs } = await supabase.from('blogs').select('*');
  console.log('Blogs Error:', errBlogs?.message || 'OK', 'Count:', blogs?.length);

  const { data: testimonials, error: errTestimonials } = await supabase.from('testimonials').select('*');
  console.log('Testimonials Error:', errTestimonials?.message || 'OK', 'Count:', testimonials?.length);

  const { data: faqs, error: errFaqs } = await supabase.from('faqs').select('*');
  console.log('Faqs Error:', errFaqs?.message || 'OK', 'Count:', faqs?.length);
}

checkData();
