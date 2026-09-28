import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const supabase = createClient(
  'https://hxexoazbnbtqhyytxitq.supabase.co',
  'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV'
);

async function testSecurityRpc() {
  console.log('1. Testing check_ip_security_status...');
  const { data: statusData, error: statusErr } = await supabase.rpc('check_ip_security_status', {
    p_ip: '127.0.0.1',
    p_app: 'admin'
  });
  console.log('Status result:', statusData, 'Error:', statusErr);

  console.log('\n2. Testing record_login_attempt (simulated failed attempt)...');
  const { data: failData, error: failErr } = await supabase.rpc('record_login_attempt', {
    p_ip: '198.51.100.99', // RFC 5737 test IP
    p_app: 'admin',
    p_username: 'test_attacker@example.com',
    p_success: false,
    p_user_agent: 'SecurityAuditTester/1.0',
    p_request_id: 'req-test-001'
  });
  console.log('Fail result:', failData, 'Error:', failErr);
}

testSecurityRpc();
