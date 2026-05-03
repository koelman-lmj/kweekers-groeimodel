"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";

export default function NewScanPage() {
  const router = useRouter();
  const { resetScan } = useScanContext();

  useEffect(() => {
    resetScan();
    router.replace("/scan/nieuw/profile");
  }, [resetScan, router]);

  return (
    <main className="p-8">
      <p className="text-sm text-muted-foreground">
        Nieuwe scan wordt gestart...
      </p>
    </main>
  );
}
