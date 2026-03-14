import { createClient } from "@supabase/supabase-js";
import { supabaseServiceKey, supabaseUrl } from "./env";

export function createSupabaseServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase service role key is missing.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
