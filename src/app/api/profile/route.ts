import { NextResponse } from "next/server";
import { normalizeProfile } from "@/lib/profile";
import { loadProfileForUser, saveProfileForUser } from "@/lib/profile-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

async function requireUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return data.user.id;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const record = await loadProfileForUser(userId);
  return NextResponse.json(record);
}

export async function POST(request: Request) {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const profile = normalizeProfile(body as Record<string, unknown>);

  try {
    await saveProfileForUser(userId, profile);
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
