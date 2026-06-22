"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import {
  checkInAction,
  resolveScanAction,
  type ScannerState,
} from "@/app/admin/(protected)/attendance/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";

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
      {/* Camera viewport */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "#0a0a0a",
          borderBottom: "1px solid rgba(240,168,188,0.2)",
        }}
      >
        <video
          ref={videoRef}
          className="aspect-[3/4] w-full object-cover sm:aspect-video"
          muted
          playsInline
        />
        {/* Scan frame overlay */}
        {running && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="relative h-44 w-44"
              style={{ border: "2px solid rgba(240,168,188,0.7)", borderRadius: "12px" }}
            >
              {/* Corner accents */}
              {[
                "top-0 left-0 border-t-2 border-l-2 rounded-tl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`absolute h-5 w-5 ${cls}`}
                  style={{ borderColor: "#e07898" }}
                />
              ))}
              <ScanLine className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blush animate-pulse" aria-hidden />
            </div>
          </div>
        )}
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-sm text-white/60">Camera inactive</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 px-5 py-4">
        {!running ? (
          <Button onClick={startScanner} type="button" variant="primary" size="default">
            <Camera className="h-4 w-4" />
            Start camera
          </Button>
        ) : (
          <Button onClick={stopScanner} type="button" variant="outline" size="default">
            <CameraOff className="h-4 w-4" />
            Stop camera
          </Button>
        )}
      </div>

      {/* Manual token entry */}
      <div className="px-5 pb-5">
        <p className="mb-2 text-xs font-medium text-muted-ink">
          Or paste a token / pass URL manually:
        </p>
        <form action={action} className="flex flex-col gap-2 sm:flex-row">
          <Input
            name="scan"
            required
            placeholder="Paste scanned token or pass URL"
            className="flex-1"
          />
          <Button type="submit" disabled={pending} variant="outline">
            {pending ? "Validating…" : "Validate"}
          </Button>
        </form>
      </div>

      {/* Error states */}
      {scannerError && (
        <div
          role="alert"
          className="mx-5 mb-4 flex items-start gap-2 rounded-xl px-4 py-3"
          style={{ background: "rgba(176,48,80,0.08)", border: "1px solid rgba(176,48,80,0.2)" }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <p className="text-sm text-danger">{scannerError}</p>
        </div>
      )}
      {(state.status === "invalid" || state.status === "error") && (
        <div
          role="alert"
          className="mx-5 mb-4 flex items-start gap-2 rounded-xl px-4 py-3"
          style={{ background: "rgba(176,48,80,0.08)", border: "1px solid rgba(176,48,80,0.2)" }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <p className="text-sm text-danger">{state.message}</p>
        </div>
      )}

      {/* Scan result card */}
      {state.status === "found" && (
        <div
          className="mx-5 mb-5 rounded-2xl p-5"
          style={{
            background: state.subject.isCheckedIn
              ? "rgba(90,156,86,0.08)"
              : "rgba(253,232,240,0.5)",
            border: state.subject.isCheckedIn
              ? "1px solid rgba(90,156,86,0.25)"
              : "1px solid rgba(240,168,188,0.3)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl font-semibold text-ink">
                {state.subject.fullName}
              </p>
              <p className="mt-0.5 text-sm text-muted-ink">
                {state.subject.tableName ?? "No table assigned"}
              </p>
              <p className="mt-1 text-xs text-muted-ink">
                {state.subject.isCheckedIn
                  ? `Already checked in ${state.subject.lastEventAt ?? ""}`
                  : "Ready to check in"}
              </p>
            </div>
            <Badge variant={state.subject.isCheckedIn ? "success" : "default"}>
              {state.subject.isCheckedIn ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Checked in
                </>
              ) : (
                "Pending"
              )}
            </Badge>
          </div>
          {!state.subject.isCheckedIn && (
            <form action={checkInAction} className="mt-4">
              <input type="hidden" name="inviteeId" value={state.subject.inviteeId} />
              <input type="hidden" name="method" value="qr" />
              <Button type="submit" variant="secondary" size="default" className="w-full">
                <CheckCircle2 className="h-4 w-4" />
                Confirm check-in
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
