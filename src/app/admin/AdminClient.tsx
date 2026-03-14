"use client";

import type { Profile } from "@/lib/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { useEffect, useMemo, useState } from "react";

const emptyProfile: Profile = {
  name: "",
  role: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  github: "",
  linkedin: "",
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  resumeText: "",
};

function formatSkills(skills: string[]) {
  return skills.join(", ");
}

function parseSkills(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatExperience(profile: Profile) {
  return profile.experience
    .map(
      (item) =>
        `${item.company} | ${item.title} | ${item.start} | ${item.end} | ${item.bullets.join(
          "; "
        )}`
    )
    .join("\n");
}

function parseExperience(value: string): Profile["experience"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [company, title, start, end, bulletsRaw] = line
        .split("|")
        .map((item) => item.trim());

      const bullets = bulletsRaw
        ? bulletsRaw
            .split(";")
            .map((bullet) => bullet.trim())
            .filter(Boolean)
        : [];

      return {
        company: company ?? "",
        title: title ?? "",
        start: start ?? "",
        end: end ?? "",
        bullets,
      };
    });
}

function formatProjects(profile: Profile) {
  return profile.projects
    .map(
      (project) =>
        `${project.name} | ${project.link} | ${project.stack.join(", ")} | ${project.description}`
    )
    .join("\n");
}

function parseProjects(value: string): Profile["projects"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, link, stackRaw, description] = line
        .split("|")
        .map((item) => item.trim());

      const stack = stackRaw
        ? stackRaw
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      return {
        name: name ?? "",
        link: link ?? "",
        description: description ?? "",
        stack,
      };
    });
}

function formatEducation(profile: Profile) {
  return profile.education
    .map((item) => `${item.school} | ${item.degree} | ${item.year}`)
    .join("\n");
}

function parseEducation(value: string): Profile["education"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [school, degree, year] = line
        .split("|")
        .map((item) => item.trim());

      return {
        school: school ?? "",
        degree: degree ?? "",
        year: year ?? "",
      };
    });
}

export default function AdminClient() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [skillsText, setSkillsText] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [projectsText, setProjectsText] = useState("");
  const [educationText, setEducationText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setSignedIn(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSignedIn(Boolean(session));
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const data = (await response.json()) as Profile;
      setProfile(data);
      setSkillsText(formatSkills(data.skills));
      setExperienceText(formatExperience(data));
      setProjectsText(formatProjects(data));
      setEducationText(formatEducation(data));
    };

    load();
  }, []);

  const resumePreview = useMemo(() => {
    if (!profile.resumeText) {
      return "No resume parsed yet.";
    }
    return `${profile.resumeText.slice(0, 400)}${
      profile.resumeText.length > 400 ? "..." : ""
    }`;
  }, [profile.resumeText]);

  const handleSignIn = async () => {
    if (!hasSupabaseEnv()) {
      setAuthStatus("Supabase is not configured yet.");
      return;
    }
    setAuthStatus("Sending magic link...");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      setAuthStatus(error.message);
      return;
    }

    setAuthStatus("Check your email for the sign-in link.");
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSignedIn(false);
  };

  const handleSave = async () => {
    setStatus("Saving...");
    const payload: Profile = {
      ...profile,
      skills: parseSkills(skillsText),
      experience: parseExperience(experienceText),
      projects: parseProjects(projectsText),
      education: parseEducation(educationText),
    };

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("Save failed.");
      return;
    }

    const data = (await response.json()) as Profile;
    setProfile(data);
    setStatus("Saved.");
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setUploadStatus("Please choose a PDF resume first.");
      return;
    }

    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", resumeFile);

    const response = await fetch("/api/resume", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      setUploadStatus(error.error ?? "Resume upload failed.");
      return;
    }

    const data = (await response.json()) as { text: string; profile: Profile };
    setProfile(data.profile);
    setUploadStatus("Resume scanned and applied.");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4e4,_#f8f2e9_55%,_#efe2d0_100%)]">
      <main className="mx-auto w-full max-w-5xl space-y-10 px-6 py-14">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#6b5f54]">
            Admin
          </p>
          <h1 className="display-font text-4xl text-[#1f1b16]">
            Update your portfolio data
          </h1>
          <p className="text-sm text-[#6b5f54]">
            Login is required to edit or upload a resume. Your portfolio page
            stays public.
          </p>
          <a className="text-sm font-semibold text-[#e9734f]" href="/">
            Back to portfolio
          </a>
        </header>

        {!hasSupabaseEnv() ? (
          <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#6b5f54]">
              Supabase is not configured. Add the Supabase environment variables
              in Vercel, then refresh this page.
            </p>
          </section>
        ) : signedIn === null ? (
          <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#6b5f54]">Checking login...</p>
          </section>
        ) : !signedIn ? (
          <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <div className="rounded-2xl border border-[#f1c7b8] bg-[#fff2ec] p-4 text-sm text-[#8b4f3c]">
              Not for you. Be an admin.
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
              <input
                className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                className="rounded-full bg-[#2f6b73] px-4 py-2 text-sm font-semibold text-white"
                onClick={handleSignIn}
              >
                Send magic link
              </button>
            </div>
            {authStatus ? (
              <p className="text-sm text-[#6b5f54]">{authStatus}</p>
            ) : null}
          </section>
        ) : (
          <section className="grid gap-4 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-[#6b5f54]">Signed in.</p>
              <button
                className="rounded-full bg-[#2f6b73] px-4 py-2 text-sm font-semibold text-white"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </section>
        )}

        {signedIn ? (
          <>
            <section className="grid gap-6 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Name
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Role
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.role}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, role: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Location
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.location}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, location: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Email
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Phone
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Website
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.website}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, website: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  GitHub
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.github}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, github: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  LinkedIn
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.linkedin}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      linkedin: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Summary
                </label>
                <textarea
                  className="h-24 w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.summary}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      summary: event.target.value,
                    }))
                  }
                />
              </div>
            </section>

            <section className="grid gap-6 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Skills (comma separated)
                </label>
                <textarea
                  className="h-20 w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={skillsText}
                  onChange={(event) => setSkillsText(event.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Experience (company | title | start | end | bullet; bullet)
                </label>
                <textarea
                  className="h-32 w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={experienceText}
                  onChange={(event) => setExperienceText(event.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Projects (name | link | stack, stack | description)
                </label>
                <textarea
                  className="h-32 w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={projectsText}
                  onChange={(event) => setProjectsText(event.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Education (school | degree | year)
                </label>
                <textarea
                  className="h-24 w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={educationText}
                  onChange={(event) => setEducationText(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="rounded-full bg-[#2f6b73] px-5 py-2 text-sm font-semibold text-white"
                  onClick={handleSave}
                >
                  Save portfolio data
                </button>
                {status ? (
                  <span className="text-sm text-[#6b5f54]">{status}</span>
                ) : null}
              </div>
            </section>

            <section className="grid gap-6 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Upload resume (PDF)
                </label>
                <input
                  className="w-full text-sm"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setResumeFile(event.target.files ? event.target.files[0] : null)
                  }
                />
              </div>
              <button
                className="rounded-full bg-[#e9734f] px-5 py-2 text-sm font-semibold text-white"
                onClick={handleUpload}
              >
                Scan resume
              </button>
              {uploadStatus ? (
                <p className="text-sm text-[#6b5f54]">{uploadStatus}</p>
              ) : null}
              <div className="rounded-2xl border border-[#efe2d0] bg-[#fffaf3] p-4 text-sm text-[#6b5f54]">
                {resumePreview}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
