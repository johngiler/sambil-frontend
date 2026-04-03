import { adminPrimaryBtn, adminSecondaryBtn } from "@/components/admin/adminFormStyles";

/**
 * CTA primario marketplace: degradado desde `--mp-primary` / `--mp-secondary` del workspace (`WorkspaceBranding`).
 */
export const marketplacePrimaryBtn =
  `${adminPrimaryBtn} disabled:pointer-events-none disabled:!bg-none disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100`;

/**
 * CTA secundario: borde neutro, foco con anillo de marca.
 */
export const marketplaceSecondaryBtn = adminSecondaryBtn;
