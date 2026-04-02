import { redirect } from "next/navigation";

/** El dashboard de administración vive en `/dashboard`; la cuenta cliente no incluye dashboard. */
export default function ClientDashboardRedirectPage() {
  redirect("/cuenta/pedidos");
}
