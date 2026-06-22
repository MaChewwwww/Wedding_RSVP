import { QrScanner } from "@/components/admin/qr-scanner";

export default function ScannerPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8">
      <h1 className="text-3xl font-semibold">QR scanner</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Camera access begins only after selecting Start camera.
      </p>
      <div className="mt-6">
        <QrScanner />
      </div>
    </main>
  );
}
