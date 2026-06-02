"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to original destination or home
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Onjuist wachtwoord");
        setPassword("");
      }
    } catch {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-black/70"
          >
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Voer het wachtwoord in"
            required
            autoFocus
            className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#ed6e41]/40 focus:ring-2 focus:ring-[#ed6e41]/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !password}
          className="w-full rounded-xl bg-[#ed6e41] px-4 py-3 font-medium text-white transition hover:bg-[#d85f35] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/kweekers-logo.png"
            alt="Kweekers Groeimodel"
            width={180}
            height={48}
            priority
          />
          <p className="text-sm text-muted-foreground">Groeimodel</p>
        </div>

        {/* Login form wrapped in Suspense for useSearchParams */}
        <Suspense
          fallback={
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-24 rounded bg-black/10" />
                <div className="h-12 rounded-xl bg-black/5" />
                <div className="h-12 rounded-xl bg-black/10" />
              </div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          Deze website is beveiligd. Vraag het wachtwoord aan bij de beheerder.
        </p>
      </div>
    </div>
  );
}
