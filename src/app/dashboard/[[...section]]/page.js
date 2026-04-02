import { notFound } from "next/navigation";

import { ADMIN_SECTIONS } from "@/components/admin/adminNavConfig";
import DashboardView from "@/views/DashboardView";

export default async function DashboardPage({ params }) {
  const p = await params;
  const raw = p.section?.[0];
  if (raw && !ADMIN_SECTIONS.has(raw)) {
    notFound();
  }
  const section = raw ?? "resumen";
  return <DashboardView section={section} />;
}
