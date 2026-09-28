import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = 'https://hxexoazbnbtqhyytxitq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV';

async function testAdminUpload() {
  console.log('Testing admin authentication and storage upload...');
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });

  const { data: auth, error: authErr } = await client.auth.signInWithPassword({
    email: 'admin@varsaka.com',
    password: 'Varsaka@2026#Admin'
  });

  if (authErr) {
    console.error('Admin login error:', authErr);
    return;
  }
  console.log('Admin logged in successfully! UID:', auth.user.id);

  // 1x1 test PNG
  const dummyPng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 
    0x42, 0x60, 0x82
  ]);

  const testKey = `blogs/test_${Date.now()}.png`;
  const { data: upData, error: upErr } = await client.storage
    .from('public_assets')
    .upload(testKey, dummyPng, { contentType: 'image/png', upsert: true });

  console.log('Upload result:', upData, 'Error:', upErr);

  if (upData) {
    const { data: pubData } = client.storage.from('public_assets').getPublicUrl(testKey);
    console.log('Public URL:', pubData.publicUrl);

    // Now test public read via fetch
    const resp = await fetch(pubData.publicUrl);
    console.log('Public fetch status:', resp.status, 'Content-Type:', resp.headers.get('content-type'));

    // Clean up
    const { error: delErr } = await client.storage.from('public_assets').remove([testKey]);
    console.log('Cleanup result:', delErr);
  }
}

testAdminUpload().catch(console.error);
