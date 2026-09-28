import { createClient } from '../varsaka-react/node_modules/@supabase/supabase-js/dist/main/index.js';

const supabase = createClient(
  'https://hxexoazbnbtqhyytxitq.supabase.co',
  'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV'
);

async function testUpload() {
  console.log('Testing Supabase storage upload to public_assets...');
  
  // Dummy 1x1 png file buffer: 89 50 4e 47 0d 0a 1a 0a ...
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

  const testPath = `blogs/test_${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from('public_assets')
    .upload(testPath, dummyPng, { contentType: 'image/png', upsert: true });

  console.log('Upload result:', data, 'Error:', error);

  if (data) {
    const { data: pubData } = supabase.storage.from('public_assets').getPublicUrl(testPath);
    console.log('Public URL:', pubData.publicUrl);

    // Clean up
    const { error: delErr } = await supabase.storage.from('public_assets').remove([testPath]);
    console.log('Cleanup error:', delErr);
  }
}

testUpload().catch(console.error);
