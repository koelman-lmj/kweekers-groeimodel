"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function DiagnosePage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();

  const scanId = getParam(params.id);

  useEffect(() => {
    router.replace(`/scan/${scanId}/flow/diagnose/ownership_clarity`);
  }, [router, scanId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Diagnose laden</h1>
      <p className="text-sm text-muted-foreground">
        Je wordt doorgestuurd naar de diagnosevragen.
      </p>
    </div>
  );
}
