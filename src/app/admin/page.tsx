export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4e4,_#f8f2e9_55%,_#efe2d0_100%)]">
      <main className="mx-auto w-full max-w-3xl space-y-6 px-6 py-16">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-[#6b5f54]">
            Admin
          </p>
          <h1 className="display-font text-4xl text-[#1f1b16]">
            Go to your username admin page
          </h1>
          <p className="text-sm text-[#6b5f54]">
            Admin pages now live at /username/admin. Create a username first or
            visit your own page directly.
          </p>
        </header>
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
