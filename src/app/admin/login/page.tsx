import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { site } from "@/config/site";



export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900">
          {site.couple.displayName} · Admin
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
