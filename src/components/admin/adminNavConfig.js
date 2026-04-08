import {
  IconAdminBriefcase,
  IconAdminBuilding,
  IconAdminChart,
  IconAdminClipboard,
  IconAdminGrid,
  IconAdminUserPlus,
} from "@/components/admin/adminIcons";

/** segment coincide con la URL bajo /dashboard/… */
export const ADMIN_NAV = [
  { segment: "resumen", href: "/dashboard", label: "Resumen", Icon: IconAdminChart },
  { segment: "centros", href: "/dashboard/centros", label: "Centros comerciales", Icon: IconAdminBuilding },
  { segment: "tomas", href: "/dashboard/tomas", label: "Tomas", Icon: IconAdminGrid },
  { segment: "usuarios", href: "/dashboard/usuarios", label: "Usuarios", Icon: IconAdminUserPlus },
  { segment: "clientes", href: "/dashboard/clientes", label: "Clientes", Icon: IconAdminBriefcase },
  { segment: "pedidos", href: "/dashboard/pedidos", label: "Pedidos", Icon: IconAdminClipboard },
];

export const ADMIN_SECTIONS = new Set(ADMIN_NAV.map((n) => n.segment));
