import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV, hasSupabase } from "./env";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  if (!_client) {
    _client = createClient(ENV.SUPABASE_URL!, ENV.SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
