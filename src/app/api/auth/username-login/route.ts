import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hasServiceEnv } from "@/lib/supabase/env";
import { normalizeUsername, isValidUsername } from "@/lib/username";

const TABLE = "portfolio_profiles";

export async function POST(request: Request) {
  if (!hasServiceEnv()) {
    return NextResponse.json(
      { error: "Server auth is not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { username?: string };
  const username = normalizeUsername(body.username ?? "");

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Invalid username." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("data")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }

  const email =
    (data?.data as { email?: string } | null | undefined)?.email ?? "";

  if (!email) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ email });
}
