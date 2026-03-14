import { NextResponse } from "next/server";
import { loadProfileByUsername } from "@/lib/profile-store";
import { normalizeUsername } from "@/lib/username";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = normalizeUsername(url.searchParams.get("username") ?? "");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required." },
      { status: 400 }
    );
  }

  const profile = await loadProfileByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
