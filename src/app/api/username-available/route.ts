import { NextResponse } from "next/server";
import { isUsernameAvailable } from "@/lib/profile-store";
import {
  isReservedUsername,
  isValidUsername,
  normalizeUsername,
} from "@/lib/username";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("username") ?? "";
  const username = normalizeUsername(raw);

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { available: false, error: "Invalid username." },
      { status: 400 }
    );
  }

  if (isReservedUsername(username)) {
    return NextResponse.json(
      { available: false, error: "Username is reserved." },
      { status: 400 }
    );
  }

  try {
    const available = await isUsernameAvailable(username);
    return NextResponse.json({ available });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check failed.";
    return NextResponse.json({ available: false, error: message }, { status: 500 });
  }
}
