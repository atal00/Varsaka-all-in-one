import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hxexoazbnbtqhyytxitq.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV";
  return createBrowserClient(url, key);
}
