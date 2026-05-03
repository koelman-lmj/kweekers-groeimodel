import type { ReactNode } from "react";
import { ScanProvider } from "@/app/context/ScanContext";

export default function ScanRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ScanProvider>{children}</ScanProvider>;
}
