"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If someone lands here with an existing session, only forward them on if
  // that session actually belongs to an admin — otherwise leave them on the
  // form. (Middleware intentionally doesn't do this redirect itself; see
  // middleware.ts for why.)
  useEffect(() => {
    let cancelled = false;
    async function checkExistingSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminRow && !cancelled) {
        router.replace(searchParams.get("next") ?? "/admin");
      }
    }
    checkExistingSession();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // Deliberately generic — don't reveal whether the email exists.
      setError("Invalid email or password.");
      return;
    }

    router.push(searchParams.get("next") ?? "/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-[var(--radius-card)] bg-surface p-8 shadow-sm"
    >
      <h1 className="font-[family-name:var(--font-fraunces)] text-xl text-primary">
        Admin sign in
      </h1>

      <label className="mt-6 block text-sm text-muted" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />

      <label className="mt-4 block text-sm text-muted" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-background transition-transform active:scale-[0.97] disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
