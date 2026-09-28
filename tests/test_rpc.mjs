import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const supabase = createClient(
  'https://hxexoazbnbtqhyytxitq.supabase.co',
  'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV'
);

async function testHeaders() {
  const { data, error } = await supabase.rpc('check_ip_block', { p_ip: '127.0.0.1', p_app: 'admin' });
  console.log('check_ip_block result:', data, 'error:', error);
}

testHeaders();
