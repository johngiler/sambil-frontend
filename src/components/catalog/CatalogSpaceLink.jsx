"use client";

import Link from "next/link";

const variants = {
  mono: "font-mono font-medium mp-text-brand no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_85%,transparent)]",
  text: "font-medium mp-text-brand no-underline underline-offset-2 transition-colors hover:underline hover:decoration-[color-mix(in_srgb,var(--mp-primary)_85%,transparent)]",
};

/**
 * Enlace al detalle público de una toma (`/catalog/:id`).
 * @param {{ spaceId?: number|string|null, children: import('react').ReactNode, variant?: 'mono'|'text', className?: string, stopPropagation?: boolean }} props
 */
export function CatalogSpaceLink({ spaceId, children, variant = "text", className = "", stopPropagation = false }) {
  if (spaceId == null || spaceId === "") {
    return <span className={className}>{children}</span>;
  }
  const base = variants[variant] ?? variants.text;
  return (
    <Link
      href={`/catalog/${spaceId}`}
      className={[base, className].filter(Boolean).join(" ")}
      {...(stopPropagation ? { onClick: (e) => e.stopPropagation() } : {})}
    >
      {children}
    </Link>
  );
}
