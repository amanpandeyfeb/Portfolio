import { NextResponse } from "next/server";
import { loadProfileByUsername } from "@/lib/profile-store";
import { normalizeUsername } from "@/lib/username";
import {
  hasServiceEnv,
  hasSupabaseEnv,
  supabaseUrl,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("username") ?? "";
  const username = normalizeUsername(raw);
  const profile = username ? await loadProfileByUsername(username) : null;

  return NextResponse.json({
    username,
    found: Boolean(profile),
    env: {
      hasSupabaseEnv: hasSupabaseEnv(),
      hasServiceEnv: hasServiceEnv(),
      supabaseHost: supabaseUrl
        ? new URL(supabaseUrl).host
        : null,
    },
    profilePreview: profile
      ? {
          name: profile.name,
          email: profile.email,
          public: true,
        }
      : null,
  });
}
