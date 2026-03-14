import { NextResponse } from "next/server";
import { loadProfileForUser, saveProfileForUser } from "@/lib/profile-store";
import { mergeProfileFromResume } from "@/lib/resume";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
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

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "No resume file provided." },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF resumes are supported right now." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "Resume is too large. Max size is 5MB." },
      { status: 400 }
    );
  }

  let text = "";
  try {
    const mod = (await import("pdf-parse")) as unknown as {
      default?: (data: Buffer) => Promise<{ text?: string }>;
    };
    const pdfParse =
      mod.default ??
      (mod as unknown as (data: Buffer) => Promise<{ text?: string }>);
    const parsed = await pdfParse(Buffer.from(arrayBuffer));
    text = parsed.text?.trim() ?? "";
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to parse PDF.";
    return NextResponse.json(
      { error: "Resume parsing failed.", detail: message },
      { status: 400 }
    );
  }

  const record = await loadProfileForUser(userId);
  const baseProfile = {
    ...record.profile,
    username: record.username,
  };
  const updated = mergeProfileFromResume(text, {
    ...baseProfile,
    resumeText: text,
  });

  try {
    await saveProfileForUser(userId, updated);
    return NextResponse.json({ text, profile: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
