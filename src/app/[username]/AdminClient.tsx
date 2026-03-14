"use client";

import type { Profile } from "@/lib/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { themeOptions } from "@/lib/themes";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
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
  resumeUrl: "",
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

type ProfileResponse = {
  username: string;
  profile: Profile;
};

export default function AdminClient({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [skillsText, setSkillsText] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [projectsText, setProjectsText] = useState("");
  const [educationText, setEducationText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [ownUsername, setOwnUsername] = useState<string | null>(null);
  const [usernameMismatch, setUsernameMismatch] = useState(false);

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
    if (!signedIn) {
      setIsOwner(false);
      return;
    }

    const load = async () => {
      if (!username.trim()) {
        setAuthStatus("Username missing in URL. Open /yourusername/admin.");
        setIsOwner(false);
        setProfileLoaded(true);
        return;
      }

      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) {
        setIsOwner(false);
        setProfileLoaded(true);
        return;
      }
      const data = (await response.json()) as ProfileResponse;
      setProfileLoaded(true);
      setOwnUsername(data.username ?? null);

      if (!data.username && username.trim()) {
        const claim = await fetch("/api/profile/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (!claim.ok) {
          const err = (await claim.json()) as { error?: string };
          setAuthStatus(err.error ?? "Could not claim username.");
          setIsOwner(false);
          return;
        }

        setOwnUsername(username);
        setIsOwner(true);
        setUsernameMismatch(false);
        setProfile({ ...data.profile, username });
        setSkillsText(formatSkills(data.profile.skills));
        setExperienceText(formatExperience(data.profile));
        setProjectsText(formatProjects(data.profile));
        setEducationText(formatEducation(data.profile));
        return;
      }

      if (data.username && data.username !== username) {
        setIsOwner(false);
        setUsernameMismatch(true);
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        setSignedIn(false);
        setAuthStatus(
          `You're signed in with a different account. Please sign in with the email used for ${username}.`
        );
        return;
      }

      setIsOwner(true);
      setUsernameMismatch(false);
      setProfile(data.profile);
      setSkillsText(formatSkills(data.profile.skills));
      setExperienceText(formatExperience(data.profile));
      setProjectsText(formatProjects(data.profile));
      setEducationText(formatEducation(data.profile));
    };

    load();
  }, [signedIn, username]);

  useEffect(() => {
    if (signedIn && usernameMismatch && ownUsername) {
      return;
    }
  }, [signedIn, usernameMismatch, ownUsername]);

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
    if (!email || !password) {
      setAuthStatus("Enter email and password.");
      return;
    }
    setAuthStatus("Signing in...");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthStatus(error.message);
      return;
    }

    setAuthStatus("Signed in.");
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSignedIn(false);
    setIsOwner(false);
  };

  const handleSave = async () => {
    setStatus("Saving...");
    const payload: Profile = {
      ...profile,
      username,
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
            Update {username}&apos;s portfolio
          </h1>
          <p className="text-sm text-[#6b5f54]">
            Login is required to edit or upload a resume. Your portfolio page
            stays public.
          </p>
          <a
            className="text-sm font-semibold text-[#e9734f]"
            href={`/${username}`}
          >
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
              Not for you. Be the owner of this username.
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button
              className="mt-4 rounded-full bg-[#2f6b73] px-4 py-2 text-sm font-semibold text-white"
              onClick={handleSignIn}
            >
              Sign in
            </button>
            {authStatus ? (
              <p className="text-sm text-[#6b5f54]">{authStatus}</p>
            ) : null}
            <p className="text-xs text-[#6b5f54]">
              Need an account? Create one at /signup.
            </p>
          </section>
        ) : !isOwner && profileLoaded ? null : null}

        {signedIn && isOwner ? (
          <>
            <Card className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="display-font text-2xl text-[#1f1b16]">
                    Theme gallery
                  </h2>
                  <p className="text-sm text-[#6b5f54]">
                    Pick a layout skin. It instantly updates your public profile.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/${username}`, "_blank")}
                >
                  Preview live
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {themeOptions.map((theme) => (
                  <div
                    key={`${theme.id}-gallery`}
                    className={`rounded-2xl border p-4 ${
                      (profile.theme ?? "sand") === theme.id
                        ? "border-[#2f6b73] bg-[#f3f7f8]"
                        : "border-[#eadfce] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#1f1b16]">
                          {theme.label}
                        </p>
                        <p className="text-xs text-[#6b5f54]">
                          {theme.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setProfile((prev) => ({ ...prev, theme: theme.id }))
                        }
                      >
                        Select
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {theme.swatches.map((color) => (
                        <span
                          key={`${theme.id}-${color}`}
                          className="h-6 w-full rounded-lg border border-[#eadfce]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="md:grid md:grid-cols-2 md:gap-6">
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
                    setProfile((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
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
                    setProfile((prev) => ({
                      ...prev,
                      website: event.target.value,
                    }))
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
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Resume URL
                </label>
                <input
                  className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                  value={profile.resumeUrl ?? ""}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      resumeUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
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
              <div className="space-y-3 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Theme
                </label>
                <RadioGroup
                  value={profile.theme ?? "sand"}
                  onValueChange={(value) =>
                    setProfile((prev) => ({ ...prev, theme: value }))
                  }
                  className="grid gap-4 md:grid-cols-2"
                >
                  {themeOptions.map((theme) => (
                    <label
                      key={theme.id}
                      className="flex cursor-pointer gap-3 rounded-2xl border border-[#eadfce] bg-white p-4 text-left text-sm transition hover:border-[#2f6b73]"
                    >
                      <RadioGroupItem value={theme.id} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[#1f1b16]">
                              {theme.label}
                            </p>
                            <p className="text-xs text-[#6b5f54]">
                              {theme.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {theme.swatches.map((color) => (
                            <span
                              key={color}
                              className="h-5 w-5 rounded-full border border-[#eadfce]"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </Card>

            <Card className="grid gap-6">
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
                <Button
                  className="bg-[#2f6b73]"
                  onClick={handleSave}
                >
                  Save portfolio data
                </Button>
                {status ? (
                  <span className="text-sm text-[#6b5f54]">{status}</span>
                ) : null}
              </div>
            </Card>

            <Card className="grid gap-6">
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
                  Upload resume (PDF)
                </label>
                <input
                  className="w-full text-sm"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setResumeFile(
                      event.target.files ? event.target.files[0] : null
                    )
                  }
                />
              </div>
              <Button
                className="bg-[#e9734f]"
                onClick={handleUpload}
              >
                Scan resume
              </Button>
              {uploadStatus ? (
                <p className="text-sm text-[#6b5f54]">{uploadStatus}</p>
              ) : null}
              <div className="rounded-2xl border border-[#efe2d0] bg-[#fffaf3] p-4 text-sm text-[#6b5f54]">
                {resumePreview}
              </div>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
