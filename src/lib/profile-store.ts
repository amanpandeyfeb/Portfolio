import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { normalizeProfile, readProfile, writeProfile } from "@/lib/profile";
import type { Profile } from "@/lib/profile";

const TABLE = "portfolio_profiles";

async function readPublicProfileFromSupabase(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("data")
    .eq("public", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data?.data) return null;
  return normalizeProfile(data.data as Partial<Profile>);
}

async function readProfileFromSupabase(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data?.data) return null;
  return normalizeProfile(data.data as Partial<Profile>);
}

async function writeProfileToSupabase(userId: string, profile: Profile) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      data: profile,
      public: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function loadProfile(userId?: string) {
  if (hasSupabaseEnv()) {
    if (userId) {
      const profile = await readProfileFromSupabase(userId);
      if (profile) return profile;
    }
    const publicProfile = await readPublicProfileFromSupabase();
    if (publicProfile) return publicProfile;
  }

  return readProfile();
}

export async function saveProfile(profile: Profile, userId?: string) {
  if (hasSupabaseEnv() && userId) {
    await writeProfileToSupabase(userId, profile);
    return profile;
  }

  await writeProfile(profile);
  return profile;
}
