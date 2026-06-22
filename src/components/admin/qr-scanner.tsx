"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import {
  checkInAction,
  resolveScanAction,
  type ScannerState,
} from "@/app/admin/(protected)/attendance/actions";

const initial: ScannerState = { status: "idle" };

export function QrScanner() {
  const [state, action, pending] = useActionState(resolveScanAction, initial);
  const [running, setRunning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  async function startScanner() {
    setScannerError(null);
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      if (!videoRef.current) return;
      setRunning(true);
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (!result) return;
          controlsRef.current?.stop();
          setRunning(false);
          const formData = new FormData();
          formData.set("scan", result.getText());
          startTransition(() => action(formData));
        },
      );
    } catch {
      setRunning(false);
      setScannerError(
        "Camera access failed. Use manual token entry or check browser permissions.",
      );
    }
  }

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setRunning(false);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="aspect-[3/4] w-full object-cover sm:aspect-video" muted playsInline />
      </div>
      <div className="mt-4 flex gap-2">
        {!running ? (
          <button onClick={startScanner} type="button" className="min-h-11 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white">
            Start camera
          </button>
        ) : (
          <button onClick={stopScanner} type="button" className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm">
            Stop camera
          </button>
        )}
      </div>

      <form action={action} className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input name="scan" required placeholder="Paste scanned token or pass URL" className="min-h-11 flex-1 rounded-md border border-zinc-300 px-3" />
        <button disabled={pending} className="min-h-11 rounded-md border border-zinc-300 px-4 text-sm">
          {pending ? "Validating…" : "Validate"}
        </button>
      </form>

      {scannerError && <p role="alert" className="mt-3 text-sm text-red-700">{scannerError}</p>}
      {(state.status === "invalid" || state.status === "error") && (
        <p role="alert" className="mt-3 text-sm text-red-700">{state.message}</p>
      )}
      {state.status === "found" && (
        <div className="mt-6 border-y border-zinc-200 py-5">
          <p className="text-lg font-semibold">{state.subject.fullName}</p>
          <p className="text-sm text-zinc-600">
            {state.subject.tableName ?? "Unassigned table"}
          </p>
          <p className="mt-1 text-sm">
            {state.subject.isCheckedIn
              ? `Already checked in ${state.subject.lastEventAt ?? ""}`
              : "Ready to check in"}
          </p>
          {!state.subject.isCheckedIn && (
            <form
              action={checkInAction}
              className="mt-4"
            >
              <input type="hidden" name="inviteeId" value={state.subject.inviteeId} />
              <input type="hidden" name="method" value="qr" />
              <button className="min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white">
                Confirm check-in
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
