import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hasServiceEnv, hasSupabaseEnv } from "@/lib/supabase/env";
import { defaultProfile, normalizeProfile, readProfile, writeProfile } from "@/lib/profile";
import type { Profile } from "@/lib/profile";

const TABLE = "portfolio_profiles";

export type UserProfileRecord = {
  username: string;
  profile: Profile;
};

async function readPublicProfileByUsername(username: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("data, username")
    .eq("username", username)
    .eq("public", true)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data?.data) return null;
  return {
    username: data.username as string,
    profile: normalizeProfile(data.data as Partial<Profile>),
  };
}

async function readProfileByUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("data, username")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data?.data) return null;
  return {
    username: data.username as string,
    profile: normalizeProfile(data.data as Partial<Profile>),
  };
}

async function writeProfileByUser(userId: string, profile: Profile) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  const { error: upsertError } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      username: data?.username ?? profile.username,
      data: profile,
      public: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    console.error(upsertError);
    throw upsertError;
  }
}

export async function loadProfileByUsername(username: string) {
  if (hasSupabaseEnv()) {
    const record = await readPublicProfileByUsername(username);
    if (!record) return null;
    return record.profile;
  }

  return readProfile();
}

export async function loadProfileForUser(userId: string) {
  if (hasSupabaseEnv()) {
    const record = await readProfileByUser(userId);
    if (record) return record;
  }

  const profile = await readProfile();
  return { username: profile.username ?? "", profile };
}

export async function saveProfileForUser(userId: string, profile: Profile) {
  if (hasSupabaseEnv()) {
    await writeProfileByUser(userId, profile);
    return profile;
  }

  await writeProfile(profile);
  return profile;
}

export async function claimUsername(userId: string, username: string) {
  if (hasServiceEnv()) {
    const supabase = createSupabaseServiceClient();
    const { data: current } = await supabase
      .from(TABLE)
      .select("username")
      .eq("user_id", userId)
      .maybeSingle();

    if (current?.username && current.username !== username) {
      throw new Error("Username already set for this account.");
    }

    const { data: existing } = await supabase
      .from(TABLE)
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existing?.username) {
      throw new Error("Username already taken.");
    }

    const profile = normalizeProfile({
      ...defaultProfile,
      username,
    });

    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: userId,
        username,
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

    return profile;
  }

  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase
    .from(TABLE)
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();

  if (current?.username && current.username !== username) {
    throw new Error("Username already set for this account.");
  }

  const { data: existing } = await supabase
    .from(TABLE)
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existing?.username) {
    throw new Error("Username already taken.");
  }

  const profile = normalizeProfile({
    ...defaultProfile,
    username,
  });

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      username,
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

  return profile;
}

export async function isUsernameAvailable(username: string) {
  if (hasServiceEnv()) {
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase
      .from(TABLE)
      .select("username")
      .eq("username", username)
      .maybeSingle();

    return !data?.username;
  }

  if (!hasSupabaseEnv()) {
    return true;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from(TABLE)
    .select("username")
    .eq("username", username)
    .maybeSingle();

  return !data?.username;
}
