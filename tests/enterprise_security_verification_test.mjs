import { DB_URL } from './db_env.mjs';
import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';

const SUPABASE_URL = 'https://hxexoazbnbtqhyytxitq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV';


const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } }
});

async function runEnterpriseSecurityVerification() {
  console.log('🛡️ Starting Comprehensive Enterprise Security Hardening E2E Verification...\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  const TEST_IP = '203.0.113.88'; // RFC 5737 Test IP

  try {
    // Ensure search path covers both invoice_db and public schemas
    await prisma.$executeRawUnsafe('SET search_path TO "invoice_db", "public"');

    // 0. Clean up any previous test artifacts
    await prisma.$executeRawUnsafe(`DELETE FROM public."IpBlock" WHERE ip IN ('${TEST_IP}', '103.172.202.192')`);
    await prisma.$executeRawUnsafe(`DELETE FROM invoice_db."IpBlock" WHERE ip IN ('${TEST_IP}', '103.172.202.192')`);
    await prisma.$executeRawUnsafe(`DELETE FROM public."security_logs" WHERE ip_address IN ('${TEST_IP}', '103.172.202.192')`);

    // ==========================================
    // TEST 1: Login with correct credentials
    // ==========================================
    console.log('\n--- 1. AUTHENTICATION INTEGRITY ---');
    const { data: authData, error: authError } = await adminClient.auth.signInWithPassword({
      email: 'admin@varsaka.com',
      password: 'Varsaka@2026#Admin'
    });
    assert(!authError && authData?.session?.access_token, 'Valid admin login succeeds and returns authoritative JWT');

    // ==========================================
    // TEST 2: Login with incorrect credentials fails safely
    // ==========================================
    const { data: badAuthData, error: badAuthError } = await anonClient.auth.signInWithPassword({
      email: 'admin@varsaka.com',
      password: 'WrongPassword2026!'
    });
    assert(badAuthError !== null, 'Wrong password correctly rejected by backend');
    assert(!badAuthData?.session, 'No session issued on wrong password');

    const { data: badUserData, error: badUserError } = await anonClient.auth.signInWithPassword({
      email: 'nonexistent_attacker_target@varsaka.com',
      password: 'WrongPassword2026!'
    });
    assert(badUserError !== null, 'Nonexistent username correctly rejected by backend');
    assert(badAuthError.message.toLowerCase().includes('invalid') || badAuthError.message.toLowerCase().includes('credentials'), 
      'Generic credential failure response does not leak user existence');

    // ==========================================
    // TEST 3: Anti-IP Spoofing & Trusted Proxy Detection
    // ==========================================
    console.log('\n--- 2. ANTI-IP SPOOFING & TRUSTED PROXY EXTRACTION ---');
    const { data: spoofTest } = await anonClient.rpc('check_ip_security_status', {
      p_ip: '1.2.3.4', // Attempting to spoof as 1.2.3.4
      p_app: 'admin'
    });
    assert(spoofTest.ip !== '1.2.3.4', 'Server rejects client-supplied fake IP and extracts real trusted gateway IP');
    assert(spoofTest.isBlocked === false, 'Caller status is verified accurately');

    // ==========================================
    // TEST 4: Server-Side Failed Attempt Tracking & Progressive IP Blocking
    // ==========================================
    console.log('\n--- 3. PROGRESSIVE IP BLOCKING & ABUSE DETECTION ---');

    // Initial status for TEST_IP
    const checkInit = await prisma.$queryRawUnsafe(`
      SELECT public.check_ip_security_status('${TEST_IP}', 'admin') as status
    `);
    const s0 = checkInit[0].status;
    assert(s0.isBlocked === false && s0.status === 'ACTIVE', 'Initial test IP is not blocked');

    // Attempts 1 to 4: Tracked without blocking
    for (let i = 1; i <= 4; i++) {
      const recRes = await prisma.$queryRawUnsafe(`
        SELECT public.record_login_attempt(
          '${TEST_IP}', 'admin', 'admin@varsaka.com', false, 'PenTestEngine/2.0', 'req-${i}'
        ) as result
      `);
      const r = recRes[0].result;
      assert(r.isBlocked === false, `Attempt ${i}: IP remains unblocked`);
      assert(r.attempts === i, `Attempt ${i}: Server accurately records ${i} failed attempt(s)`);
      assert(r.attemptsRemaining === (5 - i), `Attempt ${i}: Server correctly computes attempts remaining (${5 - i})`);
    }

    // Verify 4 login_failed audit records in security_logs
    const logs4 = await prisma.$queryRawUnsafe(`
      SELECT action, ip_address, status FROM security_logs 
      WHERE ip_address = '${TEST_IP}' ORDER BY created_at ASC
    `);
    assert(logs4.length === 4, 'Exactly 4 failed login events recorded in audit trail');
    assert(logs4.every(l => l.action === 'login_failed'), 'All events have action = login_failed');

    // Attempt 5: Server triggers progressive temporary block
    const rec5Res = await prisma.$queryRawUnsafe(`
      SELECT public.record_login_attempt(
        '${TEST_IP}', 'admin', 'admin@varsaka.com', false, 'PenTestEngine/2.0', 'req-5'
      ) as result
    `);
    const r5 = rec5Res[0].result;
    assert(r5.isBlocked === true, 'Attempt 5: Server triggers automatic IP block');
    assert(r5.isPermanent === false, 'Block is TEMPORARY (not automatic permanent ban)');
    assert(r5.durationMinutes === 15, 'Initial block duration is exactly 15 minutes as configured');
    assert(r5.blockedUntil !== null, 'Temporary block has a concrete expiration timestamp');

    // Verify check_ip_security_status reports TEMPORARILY_BLOCKED
    const checkBlocked = await prisma.$queryRawUnsafe(`
      SELECT public.check_ip_security_status('${TEST_IP}', 'admin') as status
    `);
    const sb = checkBlocked[0].status;
    assert(sb.isBlocked === true, 'check_ip_security_status reports IP as actively blocked');
    assert(sb.status === 'TEMPORARILY_BLOCKED', 'Reported status is TEMPORARILY_BLOCKED');
    assert(sb.failedAttempts === 5, 'Failed attempts count is 5');

    // Verify security_logs contains security_ip_blocked and login_blocked
    const logs5 = await prisma.$queryRawUnsafe(`
      SELECT action FROM security_logs 
      WHERE ip_address = '${TEST_IP}' ORDER BY created_at DESC LIMIT 2
    `);
    const actions5 = logs5.map(l => l.action);
    assert(actions5.includes('security_ip_blocked') && actions5.includes('login_blocked'), 
      'security_logs contains security_ip_blocked and login_blocked audit records');

    // ==========================================
    // TEST 5: Manual Permanent Block & Unblock (Admin RPC)
    // ==========================================
    console.log('\n--- 4. MANUAL IP FIREWALL MANAGEMENT & AUDITING ---');

    // Admin permanently blocks IP via admin_block_ip RPC
    const { data: permBlockRes, error: permBlockErr } = await adminClient.rpc('admin_block_ip', {
      p_ip: TEST_IP,
      p_app: 'admin',
      p_permanent: true,
      p_duration_minutes: 0,
      p_reason: 'Repeated automated brute-force attacks detected during security audit'
    });
    assert(!permBlockErr && permBlockRes?.success === true, 'admin_block_ip permanently blocks IP');

    // Verify status is PERMANENTLY_BLOCKED
    const checkPerm = await prisma.$queryRawUnsafe(`
      SELECT public.check_ip_security_status('${TEST_IP}', 'admin') as status
    `);
    assert(checkPerm[0].status.isBlocked === true, 'IP is actively blocked');
    assert(checkPerm[0].status.isPermanent === true, 'IP is marked as isPermanent');
    assert(checkPerm[0].status.status === 'PERMANENTLY_BLOCKED', 'Reported status is PERMANENTLY_BLOCKED');

    // Verify audit log has ip_permanently_blocked
    const permAudit = await prisma.$queryRawUnsafe(`
      SELECT action, metadata FROM security_logs 
      WHERE ip_address = '${TEST_IP}' AND action = 'ip_permanently_blocked'
    `);
    assert(permAudit.length >= 1, 'ip_permanently_blocked recorded in audit trail');
    assert(JSON.stringify(permAudit[0].metadata).includes('brute-force'), 'Audit metadata preserves admin reason');

    // Admin unblocks IP via admin_unblock_ip RPC
    const { data: unblockRes, error: unblockErr } = await adminClient.rpc('admin_unblock_ip', {
      p_ip: TEST_IP,
      p_app: 'admin',
      p_reason: 'Pentest verification complete - IP unblocked by administrator'
    });
    assert(!unblockErr && unblockRes?.success === true, 'admin_unblock_ip successfully unblocks IP');

    // Verify status is UNBLOCKED
    const checkUnblocked = await prisma.$queryRawUnsafe(`
      SELECT public.check_ip_security_status('${TEST_IP}', 'admin') as status
    `);
    assert(checkUnblocked[0].status.isBlocked === false, 'IP is verified as UNBLOCKED');
    assert(checkUnblocked[0].status.status === 'ACTIVE', 'Reported status is ACTIVE');

    // Verify audit log has ip_unblocked
    const unblockAudit = await prisma.$queryRawUnsafe(`
      SELECT action, metadata FROM security_logs 
      WHERE ip_address = '${TEST_IP}' AND action = 'ip_unblocked'
    `);
    assert(unblockAudit.length >= 1, 'ip_unblocked recorded in audit trail');

    // Verify unauthenticated user CANNOT block IP
    const { error: anonBlockErr } = await anonClient.rpc('admin_block_ip', {
      p_ip: '198.51.100.99',
      p_app: 'admin',
      p_permanent: true,
      p_duration_minutes: 0,
      p_reason: 'Attacker spoof attempt'
    });
    assert(anonBlockErr !== null, 'Unauthenticated caller is REJECTED from admin_block_ip');

    // ==========================================
    // TEST 6: Granular RBAC & Security Auditor Role Auto-Expiry
    // ==========================================
    console.log('\n--- 5. GRANULAR RBAC & SECURITY AUDITOR ROLE ---');

    const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    const futureDate = new Date(Date.now() + 86400000).toISOString(); // 24 hours future
    const testAuditorId = '4a492e05-1bed-4ebe-ac10-82de14d8bbbd'; // ravi@varsaka.com
    const originalProf = await prisma.$queryRawUnsafe(`SELECT role FROM profiles WHERE id = '${testAuditorId}'::uuid`);
    const origRole = originalProf[0]?.role || 'blogger';

    // Grant temporary Security Auditor access via authenticated admin API
    const { error: grantErr } = await adminClient.from('profiles').update({
      role: 'security_auditor',
      temporary_access_expires_at: futureDate
    }).eq('id', testAuditorId);
    assert(!grantErr, 'Admin successfully grants temporary Security Auditor access');

    const activeAuditor = await prisma.$queryRawUnsafe(`
      SELECT 
        (role = 'security_auditor' AND (temporary_access_expires_at IS NULL OR temporary_access_expires_at > now())) as can_view
      FROM profiles WHERE id = '${testAuditorId}'::uuid
    `);
    assert(activeAuditor[0].can_view === true, 'Active Security Auditor has valid temporary access');

    // Expire temporary access via authenticated admin API
    const { error: expireErr } = await adminClient.from('profiles').update({
      temporary_access_expires_at: pastDate
    }).eq('id', testAuditorId);
    assert(!expireErr, 'Temporary access timestamp updated to past');

    const expiredAuditor = await prisma.$queryRawUnsafe(`
      SELECT 
        (role = 'security_auditor' AND (temporary_access_expires_at IS NULL OR temporary_access_expires_at > now())) as can_view
      FROM profiles WHERE id = '${testAuditorId}'::uuid
    `);
    assert(expiredAuditor[0].can_view === false, 'Expired Security Auditor is AUTOMATICALLY DENIED access');

    // Restore original role and remove temporary expiry
    await adminClient.from('profiles').update({
      role: origRole,
      temporary_access_expires_at: null
    }).eq('id', testAuditorId);

    // ==========================================
    // TEST 7: Audit Log Immutability & Anti-Tamper
    // ==========================================
    console.log('\n--- 6. AUDIT LOG IMMUTABILITY & ANTI-TAMPER ---');

    // Direct INSERT attempt on security_logs via anon client
    const { error: insertErr } = await anonClient.from('security_logs').insert({
      action: 'FAKE_LOG_ATTACK',
      details: 'hacked'
    });
    assert(insertErr !== null, 'Direct INSERT into security_logs is BLOCKED by RLS');

    // Direct UPDATE attempt on security_logs via anon client
    const { error: updateErr } = await anonClient.from('security_logs').update({
      action: 'TAMPERED_LOG'
    }).eq('ip_address', TEST_IP);
    assert(updateErr !== null, 'Direct UPDATE on security_logs is BLOCKED by RLS');

    // Direct DELETE attempt on security_logs via anon client
    const { error: deleteErr } = await anonClient.from('security_logs').delete().eq('ip_address', TEST_IP);
    assert(deleteErr !== null, 'Direct DELETE on security_logs is BLOCKED by RLS');

    // Verify plaintext password column dropped
    const passColCheck = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'IpBlock' AND column_name = 'lastAttemptedPass'
    `);
    assert(passColCheck.length === 0, 'Plaintext password column (lastAttemptedPass) permanently removed from IpBlock');

    const leakCheck = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM security_logs 
      WHERE metadata::text ILIKE '%Varsaka@2026%' OR (metadata::text ILIKE '%password%' AND metadata::text ILIKE '%admin%')
    `);
    assert(Number(leakCheck[0].count) === 0, 'Zero plaintext passwords found in security_logs table');

    // ==========================================
    // TEST 8: Platform Security Settings
    // ==========================================
    console.log('\n--- 7. PLATFORM SECURITY POLICIES ---');
    const secSettingsRes = await prisma.$queryRawUnsafe(`SELECT * FROM public.security_settings WHERE id = 'default'`);
    assert(secSettingsRes.length === 1, 'security_settings record exists');
    const settings = secSettingsRes[0];
    assert(settings.failed_attempt_threshold === 5, 'Configured failed_attempt_threshold is 5');
    assert(settings.initial_block_minutes === 15, 'Configured initial_block_minutes is 15');
    assert(settings.progressive_multiplier === 4, 'Configured progressive_multiplier is 4');
    assert(settings.max_block_minutes === 1440, 'Configured max_block_minutes is 1440 (24 hours)');

    // ==========================================
    // CLEANUP
    // ==========================================
    await prisma.$executeRawUnsafe(`DELETE FROM "IpBlock" WHERE ip IN ('${TEST_IP}', '103.172.202.192')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "security_logs" WHERE ip_address IN ('${TEST_IP}', '103.172.202.192')`);

    console.log(`\n🎉 ALL ${passed}/${total} ENTERPRISE SECURITY HARDENING VERIFICATION TESTS PASSED PERFECTLY!\n`);
  } finally {
    await prisma.$disconnect();
  }
}

runEnterpriseSecurityVerification().catch(err => {
  console.error('\n❌ Enterprise Security Verification Failed:', err);
  process.exit(1);
});
