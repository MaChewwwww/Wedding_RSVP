import { QrScanner } from "@/components/admin/qr-scanner";
import { PageHeader } from "@/components/admin/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ScannerPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <PageHeader
        title="QR Scanner"
        subtitle="Camera access begins only after selecting Start camera."
      >
        <Link href="/admin/attendance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to roster
          </Button>
        </Link>
      </PageHeader>

      <div
        className="rounded-3xl overflow-hidden"
        style={{
          border: "1px solid rgba(240,168,188,0.25)",
          boxShadow: "0 4px 24px rgba(60,30,20,0.08)",
        }}
      >
        <QrScanner />
      </div>
    </div>
  );
}
