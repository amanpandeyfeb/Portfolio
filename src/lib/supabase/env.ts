export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const adminProfileId =
  process.env.ADMIN_PROFILE_ID ?? "00000000-0000-0000-0000-000000000000";

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function hasServiceEnv() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}
