"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: LoginState = { status: "idle" };

export function LoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, initial);

  React.useEffect(() => {
    if (state.status === "success") router.replace("/admin");
  }, [state, router]);

  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {(state.status === "error" ||
        state.status === "rate_limited" ||
        state.status === "unconfigured") && (
        <p role="alert" className="text-sm text-danger">
          {state.status === "error"
            ? state.message
            : state.status === "rate_limited"
              ? "Too many attempts. Please wait and try again."
              : "Admin backend is not configured yet."}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
