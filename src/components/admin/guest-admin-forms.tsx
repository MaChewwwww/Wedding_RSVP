"use client";

import { useActionState } from "react";
import {
  createPartyAction,
  importGuestsAction,
  type AdminFormState,
} from "@/app/admin/(protected)/guests/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: AdminFormState = { status: "idle" };

export function CreatePartyForm() {
  const [state, action, pending] = useActionState(createPartyAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Guest full name</Label>
        <Input id="fullName" name="fullName" required />
      </div>

      <div>
        <Label htmlFor="email">Initial email (optional)</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create guest invitation"}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

export function ImportGuestsForm() {
  const [state, action, pending] = useActionState(importGuestsAction, initial);
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="csv">CSV data</Label>
        <Textarea
          id="csv"
          name="csv"
          rows={8}
          placeholder="full_name,email"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Importing…" : "Import CSV"}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

function FormMessage({ state }: { state: AdminFormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role="status"
      className={state.status === "success" ? "text-sm text-emerald-700" : "text-sm text-red-700"}
    >
      {state.message}
    </p>
  );
}
