import { NextResponse } from "next/server";
import { claimUsername } from "@/lib/profile-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  isReservedUsername,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username";

async function requireUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return data.user.id;
}

export async function POST(request: Request) {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { username?: string };
  const username = normalizeUsername(body.username ?? "");

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Invalid username." }, { status: 400 });
  }

  if (isReservedUsername(username)) {
    return NextResponse.json({ error: "Username is reserved." }, { status: 400 });
  }

  try {
    const profile = await claimUsername(userId, username);
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Claim failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
