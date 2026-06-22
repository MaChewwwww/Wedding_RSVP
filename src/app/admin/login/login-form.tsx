"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const initial: LoginState = { status: "idle" };

export function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, initial);

  React.useEffect(() => {
    if (state.status === "success") router.replace("/admin");
  }, [state, router]);

  const errorMsg =
    state.status === "error"
      ? state.message
      : state.status === "rate_limited"
        ? "Too many attempts. Please wait and try again."
        : state.status === "unconfigured"
          ? "Admin backend is not configured yet."
          : null;

  return (
    <form action={action} className="w-full space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-ink">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      {/* Error message */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl px-4 py-3"
          style={{
            background: "rgba(176, 48, 80, 0.08)",
            border: "1px solid rgba(176, 48, 80, 0.25)",
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <p className="text-sm text-danger">{errorMsg}</p>
        </div>
      )}

      {/* Decorative divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1" style={{ background: "rgba(240,168,188,0.35)" }} />
        <span className="font-cursive text-lg text-blush-deep">✦</span>
        <div className="h-px flex-1" style={{ background: "rgba(240,168,188,0.35)" }} />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full"
        aria-busy={pending}
      >
        {pending ? "Signing in…" : "Sign in to Portal"}
      </Button>
    </form>
  );
}
