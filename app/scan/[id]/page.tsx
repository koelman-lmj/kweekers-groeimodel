import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScanIdPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/scan/${id}/summary/advies`);
}
