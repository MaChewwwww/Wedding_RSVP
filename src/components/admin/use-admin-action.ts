"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type RunOptions = {
  loading?: string;
  success?: string;
  error?: string;
  onSuccess?: () => void;
  refresh?: boolean;
};

/*
  Wraps a void server action with pending state + toasts. Server actions throw
  on failure (they return void on success), so we surface that to a toast and
  keep the UI responsive while Supabase is slow.
*/
export function useAdminAction() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<void>, opts: RunOptions = {}) {
    const {
      loading = "Saving…",
      success = "Done",
      error = "Something went wrong",
      onSuccess,
      refresh = true,
    } = opts;
    const toastId = toast.loading(loading);
    startTransition(async () => {
      try {
        await action();
        toast.success(success, { id: toastId });
        onSuccess?.();
        if (refresh) router.refresh();
      } catch (e) {
        const message = e instanceof Error ? e.message : error;
        toast.error(message || error, { id: toastId });
      }
    });
  }

  return { pending, run };
}
