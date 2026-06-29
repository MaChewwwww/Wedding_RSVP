"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  checkInAction,
  resolveScanAction,
  type ScannerState,
} from "@/app/admin/(protected)/attendance/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Camera, CameraOff, ScanLine, CheckCircle2, AlertCircle, ImageUp } from "lucide-react";

const initial: ScannerState = { status: "idle" };

// Removed ConfirmCheckInButton as we will use useAdminAction inline

export function QrScanner() {
  const [state, action, pending] = useActionState(resolveScanAction, initial);
  const [running, setRunning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  
  // This state controls the popup modal
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "already_checked_in";
    title: string;
    message?: string;
    guestName?: string;
    tableName?: string | null;
  } | null>(null);

  const { pending: checkInPending, run: runCheckIn } = useAdminAction();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onConfirmCheckIn(inviteeId: string, fullName: string, tableName: string | null) {
    runCheckIn(
      () => {
        const fd = new FormData();
        fd.set("inviteeId", inviteeId);
        fd.set("method", "qr");
        return checkInAction(fd);
      },
      {
        onSuccess: () => {
          setScanResult({
            type: "success",
            title: "Check-in Successful",
            guestName: fullName,
            tableName: tableName,
          });
        },
      }
    );
  }

  // Effect to handle state changes from resolveScanAction
  import { useEffect } from "react"; // Added to scope since we need it
  useEffect(() => {
    if (state.status === "found") {
      if (!state.subject.isCheckedIn) {
        // Automatically check them in
        onConfirmCheckIn(state.subject.inviteeId, state.subject.fullName, state.subject.tableName);
      } else {
        // Already checked in
        setScanResult({
          type: "already_checked_in",
          title: "Already Checked In",
          guestName: state.subject.fullName,
          tableName: state.subject.tableName,
          message: `Checked in at ${state.subject.lastEventAt || "an unknown time"}`,
        });
      }
    } else if (state.status === "invalid" || state.status === "error") {
      setScanResult({
        type: "error",
        title: "Scan Failed",
        message: state.message,
      });
    }
  }, [state]);

  // Effect to auto-close the modal after 5 seconds
  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setScanResult(null);
        // Start camera again automatically if it was stopped? (Optional, maybe they want to keep scanning)
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  async function decodeFromFile(file: File) {
    setScannerError(null);
    const url = URL.createObjectURL(file);
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(url);
      const formData = new FormData();
      formData.set("scan", result.getText());
      startTransition(() => action(formData));
    } catch {
      setScannerError(
        "No QR code found in that image. Try a clearer photo or the camera.",
      );
    } finally {
      URL.revokeObjectURL(url);
    }
  }

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
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <p className="text-sm font-medium text-white/80">Camera is ready</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 px-5 py-4">
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
        <Button
          onClick={() => fileRef.current?.click()}
          type="button"
          variant="outline"
          size="default"
        >
          <ImageUp className="h-4 w-4" />
          Upload QR image
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) decodeFromFile(file);
            e.target.value = "";
          }}
        />
      </div>

        />
      </div>

      {/* Auto-closing Result Modal */}
      <Modal
        open={scanResult !== null || checkInPending || pending}
        onClose={() => {
          if (!checkInPending && !pending) {
            setScanResult(null);
          }
        }}
        title={pending || checkInPending ? "Processing..." : scanResult?.title}
      >
        {pending || checkInPending ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-sage-light border-t-sage-deep"></div>
            <p className="mt-4 text-sm font-medium text-muted-ink">Please wait...</p>
          </div>
        ) : scanResult && (
          <div className="flex flex-col items-center py-4 text-center">
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                scanResult.type === "success" || scanResult.type === "already_checked_in"
                  ? "bg-sage-light"
                  : "bg-rose/20"
              }`}
            >
              {scanResult.type === "success" || scanResult.type === "already_checked_in" ? (
                <CheckCircle2 className="h-8 w-8 text-sage-deep" />
              ) : (
                <AlertCircle className="h-8 w-8 text-danger" />
              )}
            </div>
            
            {scanResult.guestName ? (
              <>
                <p className="text-2xl font-display font-semibold text-ink">
                  {scanResult.guestName}
                </p>
                {scanResult.message && (
                  <p className="mt-2 text-sm text-muted-ink">{scanResult.message}</p>
                )}
                <div className="mt-4 w-full rounded-xl border border-sage-light bg-[rgba(90,156,86,0.05)] px-6 py-4">
                  <p className="text-sm font-medium text-muted-ink">Table Assignment</p>
                  <p className="mt-1 text-4xl font-bold text-sage-deep">
                    {scanResult.tableName ?? "No Table"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-lg font-medium text-danger">{scanResult.message}</p>
            )}

            <Button
              className="mt-6 w-full"
              variant="primary"
              onClick={() => setScanResult(null)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
