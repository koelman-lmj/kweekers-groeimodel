import type { ReactNode } from "react";

export default function ScanLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <main className="mx-auto max-w-4xl p-8">{children}</main>;
}
