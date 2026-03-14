export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4e4,_#f8f2e9_55%,_#efe2d0_100%)]">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="grid gap-8 rounded-3xl border border-[#eadfce] bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[#6b5f54]">
              Portfolio Builder
            </p>
            <h1 className="display-font text-5xl text-[#1f1b16] sm:text-6xl">
              Build a public portfolio in minutes
            </h1>
            <p className="text-lg text-[#6b5f54]">
              Claim a unique username, edit your resume and details, and share
              a clean public page at /username. Anyone can view it.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#2f6b73] px-5 py-2 text-sm font-semibold text-white"
                href="/signup"
              >
                Create your portfolio
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-[#eadfce] px-5 py-2 text-sm font-semibold text-[#1f1b16]"
                href="/amanpandey"
              >
                View example
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-[#efe2d0] bg-[#fffaf3] p-6">
            <h2 className="display-font text-2xl text-[#1f1b16]">
              How it works
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-[#6b5f54]">
              <li>Pick a unique username at /signup.</li>
              <li>Login at /username/admin to add your details.</li>
              <li>Share your public link with recruiters.</li>
            </ol>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Public profile",
              description:
                "Every username has a public page that anyone can open.",
            },
            {
              title: "Private editing",
              description:
                "Only the owner can edit their data after logging in.",
            },
            {
              title: "Resume ready",
              description:
                "Upload a resume PDF to auto-generate a snapshot.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm"
            >
              <h3 className="display-font text-2xl text-[#1f1b16]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-[#6b5f54]">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
