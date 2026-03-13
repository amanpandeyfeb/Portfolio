import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./env";

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
