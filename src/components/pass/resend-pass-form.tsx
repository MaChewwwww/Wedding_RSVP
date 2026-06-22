"use client";

import { useActionState } from "react";
import {
  resendPassEmailAction,
  type ResendPassState,
} from "@/app/(guest)/pass/actions";
import { Button } from "@/components/ui/button";

const initialState: ResendPassState = { status: "idle" };

export function ResendPassForm() {
  const [state, action, pending] = useActionState(
    resendPassEmailAction,
    initialState,
  );

  return (
    <form action={action} className="mt-8 text-center">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Sending…" : "Email my pass again"}
      </Button>
      {state.status !== "idle" && (
        <p
          role="status"
          className={`mt-3 text-sm ${
            state.status === "success" ? "text-ink" : "text-danger"
          }`}
        >
          {state.status === "success"
            ? "Your pass email has been requested."
            : state.message}
        </p>
      )}
    </form>
  );
}
