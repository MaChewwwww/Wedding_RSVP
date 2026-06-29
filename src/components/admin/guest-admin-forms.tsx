"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createPartyAction,
  importGuestsAction,
  type AdminFormState,
} from "@/app/admin/(protected)/guests/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";

const initial: AdminFormState = { status: "idle" };

export function CreatePartyForm({ onDone }: { onDone?: () => void }) {
  const [state, action, pending] = useActionState(createPartyAction, initial);
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Guest added");
      router.refresh();
      const t = setTimeout(() => onDone?.(), 600);
      return () => clearTimeout(t);
    }
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state, router, onDone]);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Guest full name</Label>
        <Input id="fullName" name="fullName" required placeholder="e.g. Juan dela Cruz" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email <span className="text-muted-ink">(optional)</span>
        </Label>
        <Input id="email" name="email" type="email" placeholder="guest@email.com" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create guest invitation"}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

export function ImportGuestsForm({ onDone }: { onDone?: () => void }) {
  const [state, action, pending] = useActionState(importGuestsAction, initial);
  const router = useRouter();
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Guests imported");
      router.refresh();
      const t = setTimeout(() => onDone?.(), 800);
      return () => clearTimeout(t);
    }
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state, router, onDone]);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="csv">Guest List</Label>
        <Textarea
          id="csv"
          name="csv"
          rows={7}
          placeholder={"Juan dela Cruz, juan@example.com\nMaria Clara\nJose Rizal, jose@example.com"}
          required
          className="font-mono text-xs"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Importing…" : "Import Guests"}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

function FormMessage({ state }: { state: AdminFormState }) {
  if (state.status === "idle") return null;
  const isSuccess = state.status === "success";
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl px-3 py-2.5"
      style={{
        background: isSuccess ? "rgba(90,156,86,0.08)" : "rgba(176,48,80,0.08)",
        border: isSuccess ? "1px solid rgba(90,156,86,0.25)" : "1px solid rgba(176,48,80,0.2)",
      }}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
      )}
      <p className={`text-sm ${isSuccess ? "text-sage-deep" : "text-danger"}`}>
        {state.message}
      </p>
    </div>
  );
}
