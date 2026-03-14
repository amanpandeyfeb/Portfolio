import { NextResponse } from "next/server";
import { normalizeProfile } from "@/lib/profile";
import { loadProfile, saveProfile } from "@/lib/profile-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";

async function requireUserOrToken(request: Request) {
  if (ADMIN_TOKEN) {
    const auth = request.headers.get("authorization");
    if (auth === `Bearer ${ADMIN_TOKEN}`) {
      return { userId: undefined };
    }
  }

  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return { userId: data.user.id };
  }

  return null;
}

export async function GET() {
  const profile = await loadProfile();
  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  const auth = await requireUserOrToken(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const profile = normalizeProfile(body as Record<string, unknown>);
  await saveProfile(profile, auth.userId);
  return NextResponse.json(profile);
}
