import { DB_URL } from './db_env.mjs';
import { PrismaClient } from '../invoice-generator/node_modules/@prisma/client/index.js';
import { createClient } from '../varsaka-admin/node_modules/@supabase/supabase-js/dist/index.mjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB_URL
    }
  }
});

const supabase = createClient(
  'https://hxexoazbnbtqhyytxitq.supabase.co',
  'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV'
);

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.test_get_client_ip()
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        v_headers JSONB;
      BEGIN
        BEGIN
          v_headers := current_setting('request.headers', true)::jsonb;
        EXCEPTION WHEN OTHERS THEN
          v_headers := '{}'::jsonb;
        END;
        RETURN jsonb_build_object(
          'x_forwarded_for', v_headers->>'x-forwarded-for',
          'cf_connecting_ip', v_headers->>'cf-connecting-ip'
        );
      END;
      $$;
    `);

    await prisma.$executeRawUnsafe(`
      GRANT EXECUTE ON FUNCTION public.test_get_client_ip() TO anon, authenticated, service_role;
    `);

    const { data, error } = await supabase.rpc('test_get_client_ip');
    console.log('PostgREST headers inspection:', data, 'error:', error);

    // Clean up test function
    await prisma.$executeRawUnsafe(`DROP FUNCTION IF EXISTS public.test_get_client_ip();`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
