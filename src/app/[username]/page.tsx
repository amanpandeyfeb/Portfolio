"use client";

import { use, useEffect, useState } from "react";
import { normalizeUsername } from "@/lib/username";
import { resolveTheme } from "@/lib/themes";
import type { Profile } from "@/lib/profile";

export const dynamic = "force-dynamic";

type ProfileResponse = { profile?: Profile };

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }> | { username: string };
}) {
  const resolvedParams = use(params);
  const username = (resolvedParams as { username: string }).username;
  const slug = normalizeUsername(username);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!slug) {
        setError("Username is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/public-profile?username=${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          setError("Profile not found.");
          setProfile(null);
          setLoading(false);
          return;
        }

        const data = (await response.json()) as ProfileResponse;
        if (!cancelled) {
          setProfile(data.profile ?? null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load profile.");
          setProfile(null);
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4e4,_#f8f2e9_55%,_#efe2d0_100%)]">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
          <h1 className="display-font text-3xl text-[#1f1b16]">Loading profile...</h1>
          <p className="text-sm text-[#6b5f54]">
            Fetching your public portfolio. Please wait.
          </p>
        </main>
      </div>
    );
  }

  if (!profile || error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4e4,_#f8f2e9_55%,_#efe2d0_100%)]">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
          <h1 className="display-font text-3xl text-[#1f1b16]">Profile not found</h1>
          <p className="text-sm text-[#6b5f54]">
            {error ?? "We could not find this portfolio yet."}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              className="rounded-full bg-[#2f6b73] px-5 py-2 text-sm font-semibold text-white"
              href="/signup"
            >
              Create a username
            </a>
            <a
              className="rounded-full border border-[#eadfce] px-5 py-2 text-sm font-semibold text-[#1f1b16]"
              href="/"
            >
              Back home
            </a>
          </div>
        </main>
      </div>
    );
  }

  const resumeSnippet = profile.resumeText
    ? `${profile.resumeText.slice(0, 600)}${
        profile.resumeText.length > 600 ? "..." : ""
      }`
    : "Upload your resume to generate a text snapshot here.";

  return (
    <div
      className={`min-h-screen portfolio-surface theme-${resolveTheme(profile.theme)}`}
    >
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
        <header className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Portfolio
            </p>
            <h1 className="display-font text-5xl text-[color:var(--foreground)] sm:text-6xl">
              {profile.name}
            </h1>
            <p className="text-2xl font-semibold text-[color:var(--accent-2)]">
              {profile.role}
            </p>
            <p className="text-lg text-[color:var(--muted)]">{profile.summary}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2">
                {profile.location}
              </span>
              <a
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </a>
              {profile.website ? (
                <a
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2"
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.website}
                </a>
              ) : null}
              {profile.github ? (
                <a
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2"
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              ) : null}
              {profile.linkedin ? (
                <a
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              ) : null}
            </div>
          </div>
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <h2 className="display-font text-2xl">Resume Snapshot</h2>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
              {resumeSnippet}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {profile.resumeUrl ? (
                <a
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-2 text-sm font-semibold text-white"
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download Resume
                </a>
              ) : null}
              <a
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-5 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                href={`/${slug}/admin`}
              >
                Update Resume + Details
              </a>
            </div>
          </div>
        </header>

        <section className="grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <h2 className="display-font text-3xl">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[color:var(--chip)] px-4 py-2 text-sm text-[color:var(--foreground)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="self-start rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <h2 className="display-font text-3xl">Contact</h2>
            <div className="mt-4 grid gap-2 text-sm text-[color:var(--muted)]">
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
              <p>{profile.location}</p>
            </div>
          </div>
        </section>

        <section className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <h2 className="display-font text-3xl">Experience</h2>
            <div className="mt-6 space-y-6">
              {profile.experience.map((item) => (
                <div key={`${item.company}-${item.title}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                      {item.title}
                    </h3>
                    <span className="text-sm text-[color:var(--muted)]">
                      {item.start} - {item.end}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[color:var(--accent-2)]">
                    {item.company}
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="self-start rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
            <h2 className="display-font text-3xl">Education</h2>
            <div className="mt-6 space-y-4">
              {profile.education.map((item) => (
                <div key={`${item.school}-${item.degree}`}>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {item.degree}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">{item.school}</p>
                  <p className="text-xs text-[color:var(--muted)]">{item.year}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="self-start rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
          <h2 className="display-font text-3xl">Projects</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {profile.projects.map((project) => (
              <article
                key={project.name}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-soft)] p-5"
              >
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                  {project.name}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {project.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
                  {project.stack.join(" • ")}
                </p>
                {project.link ? (
                  <a
                    className="mt-4 inline-flex text-sm font-semibold text-[color:var(--accent)]"
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View project
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
