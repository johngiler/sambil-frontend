"use client";

import { IconRowChevron } from "@/components/admin/rowActionIcons";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

export function AdminAccordionToggle({ expanded, onToggle, rowId, controlsId }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`inline-flex ${ROUNDED_CONTROL} p-1.5 text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_35%,transparent)]`}
      aria-expanded={expanded}
      aria-controls={controlsId}
      id={rowId ? `accordion-trigger-${rowId}` : undefined}
    >
      <span
        className={`inline-flex transition-transform duration-200 ease-out ${expanded ? "rotate-90" : ""}`}
      >
        <IconRowChevron />
      </span>
    </button>
  );
}
