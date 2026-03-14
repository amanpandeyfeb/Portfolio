"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isReservedUsername, isValidUsername } from "@/lib/username";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [nickname, setNickname] = useState(""); // honeypot
  const [signInUsername, setSignInUsername] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  const normalizedUsername = useMemo(
    () => username.trim().toLowerCase(),
    [username]
  );

  const checkAvailability = async () => {
    if (!isValidUsername(normalizedUsername)) {
      setAvailable(false);
      return false;
    }

    if (isReservedUsername(normalizedUsername)) {
      setAvailable(false);
      return false;
    }
    setChecking(true);
    const response = await fetch(
      `/api/username-available?username=${encodeURIComponent(normalizedUsername)}`
    );
    const data = (await response.json()) as { available?: boolean };
    const isAvailable = Boolean(data.available);
    setAvailable(isAvailable);
    setChecking(false);
    return isAvailable;
  };

  const checkUsername = async () => {
    await checkAvailability();
  };

  const handleSignup = async () => {
    setStatus(null);

    if (company.trim() || nickname.trim()) {
      setStatus("Signup blocked.");
      return;
    }

    if (Date.now() - startedAt < 3000) {
      setStatus("Please wait a moment and try again.");
      return;
    }

    if (!isValidUsername(normalizedUsername)) {
      setStatus("Username must be 3-20 chars (a-z, 0-9, -)." );
      return;
    }

    if (isReservedUsername(normalizedUsername)) {
      setStatus("That username is reserved.");
      return;
    }

    if (!password) {
      setStatus("Password is required.");
      return;
    }

    if (password.length < 6) {
      setStatus("Password must be at least 6 characters.");
      return;
    }

    if (available === false) {
      setStatus("Username already taken.");
      return;
    }

    if (available === null) {
      const isAvailable = await checkAvailability();
      if (!isAvailable) {
        setStatus("Username already taken.");
        return;
      }
    }

    setStatus("Creating account...");
    const supabase = createSupabaseBrowserClient();
    const authEmail = `${normalizedUsername}@portfolio.local`;
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });
      if (signInError) {
        setStatus("Account created. Please sign in to continue.");
        return;
      }
    }

    const claimRes = await fetch("/api/profile/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: normalizedUsername }),
    });

    if (!claimRes.ok) {
      const err = (await claimRes.json()) as { error?: string };
      setStatus(err.error ?? "Could not claim username.");
      return;
    }

    window.location.href = `/${normalizedUsername}/admin`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4e4,_#f8f2e9_55%,_#efe2d0_100%)]">
      <main className="mx-auto w-full max-w-2xl space-y-6 px-6 py-16">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-[#6b5f54]">
            Create your portfolio
          </p>
          <h1 className="display-font text-4xl text-[#1f1b16]">Claim a username</h1>
          <p className="text-sm text-[#6b5f54]">
            Your portfolio will be public at /username. Pick a unique username
            to get started.
          </p>
        </header>

        <div className="grid gap-4 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-sm">
          <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
            Username
          </label>
          <input
            className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            onBlur={checkUsername}
            placeholder="amanpandey"
          />
          <div className="text-xs text-[#6b5f54]">
            {checking
              ? "Checking..."
              : available === true
              ? "Username is available"
              : available === false
              ? "Username is taken"
              : ""}
          </div>

          <label className="text-xs uppercase tracking-[0.2em] text-[#6b5f54]">
            Password
          </label>
          <input
            className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Minimum 6 characters"
          />

          <input
            className="hidden"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            className="hidden"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />

          <button
            className="mt-2 rounded-full bg-[#2f6b73] px-5 py-2 text-sm font-semibold text-white"
            onClick={handleSignup}
          >
            Create account
          </button>
          {status ? <p className="text-sm text-[#6b5f54]">{status}</p> : null}
          <div className="mt-2 grid gap-3">
            <p className="text-xs text-[#6b5f54]">
              Already have an account? Enter your username to sign in.
            </p>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                className="w-full rounded-xl border border-[#eadfce] px-4 py-2 text-sm"
                value={signInUsername}
                onChange={(event) => setSignInUsername(event.target.value)}
                placeholder="yourusername"
              />
              <a
                className="inline-flex items-center justify-center rounded-full border border-[#eadfce] px-5 py-2 text-sm font-semibold text-[#1f1b16]"
                href={
                  signInUsername.trim()
                    ? `/${signInUsername.trim().toLowerCase()}/admin`
                    : "/"
                }
              >
                Sign in
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
