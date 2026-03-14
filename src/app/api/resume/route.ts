import { NextResponse } from "next/server";
import { loadProfile, saveProfile } from "@/lib/profile-store";
import { mergeProfileFromResume } from "@/lib/resume";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
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

export async function POST(request: Request) {
  const auth = await requireUserOrToken(request);
  if (!auth) {
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

  const mod = (await import("pdf-parse")) as unknown as {
    default?: (data: Buffer) => Promise<{ text?: string }>;
  };
  const pdfParse =
    mod.default ?? (mod as unknown as (data: Buffer) => Promise<{ text?: string }>);
  const parsed = await pdfParse(Buffer.from(arrayBuffer));
  const text = parsed.text?.trim() ?? "";

  const profile = await loadProfile(auth.userId);
  const updated = mergeProfileFromResume(text, {
    ...profile,
    resumeText: text,
  });

  try {
    await saveProfile(updated, auth.userId);
    return NextResponse.json({ text, profile: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
