import { loadProfile } from "@/lib/profile-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await loadProfile();
  const resumeSnippet = profile.resumeText
    ? `${profile.resumeText.slice(0, 600)}${
        profile.resumeText.length > 600 ? "..." : ""
      }`
    : "Upload your resume to generate a text snapshot here.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4e4,_#f8f2e9_55%,_#efe2d0_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
        <header className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[#6b5f54]">
              Portfolio
            </p>
            <h1 className="display-font text-5xl text-[#1f1b16] sm:text-6xl">
              {profile.name}
            </h1>
            <p className="text-2xl font-semibold text-[#2f6b73]">
              {profile.role}
            </p>
            <p className="text-lg text-[#6b5f54]">{profile.summary}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-[#eadfce] bg-white px-4 py-2">
                {profile.location}
              </span>
              <a
                className="rounded-full border border-[#eadfce] bg-white px-4 py-2"
                href={`mailto:${profile.email}`}
              >
                {profile.email}
              </a>
              <a
                className="rounded-full border border-[#eadfce] bg-white px-4 py-2"
                href={profile.website}
                target="_blank"
                rel="noreferrer"
              >
                {profile.website}
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <h2 className="display-font text-2xl">Resume Snapshot</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6b5f54]">
              {resumeSnippet}
            </p>
            <a
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#e9734f] px-5 py-2 text-sm font-semibold text-white"
              href="/admin"
            >
              Update Resume + Details
            </a>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <h2 className="display-font text-3xl">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#efe2d0] px-4 py-2 text-sm text-[#1f1b16]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <h2 className="display-font text-3xl">Contact</h2>
            <div className="mt-4 space-y-3 text-sm text-[#6b5f54]">
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
              <p>{profile.location}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <h2 className="display-font text-3xl">Experience</h2>
            <div className="mt-6 space-y-6">
              {profile.experience.map((item) => (
                <div key={`${item.company}-${item.title}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[#1f1b16]">
                      {item.title}
                    </h3>
                    <span className="text-sm text-[#6b5f54]">
                      {item.start} - {item.end}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#2f6b73]">
                    {item.company}
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#6b5f54]">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
            <h2 className="display-font text-3xl">Education</h2>
            <div className="mt-6 space-y-4">
              {profile.education.map((item) => (
                <div key={`${item.school}-${item.degree}`}>
                  <p className="text-sm font-semibold text-[#1f1b16]">
                    {item.degree}
                  </p>
                  <p className="text-sm text-[#6b5f54]">{item.school}</p>
                  <p className="text-xs text-[#6b5f54]">{item.year}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
          <h2 className="display-font text-3xl">Projects</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {profile.projects.map((project) => (
              <article
                key={project.name}
                className="rounded-2xl border border-[#efe2d0] bg-[#fffaf3] p-5"
              >
                <h3 className="text-lg font-semibold text-[#1f1b16]">
                  {project.name}
                </h3>
                <p className="mt-2 text-sm text-[#6b5f54]">
                  {project.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#2f6b73]">
                  {project.stack.join(" · ")}
                </p>
                <a
                  className="mt-4 inline-flex text-sm font-semibold text-[#e9734f]"
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View project
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
