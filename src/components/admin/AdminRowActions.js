"use client";

import { IconRowEdit, IconRowTrash, IconRowView } from "@/components/admin/rowActionIcons";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const btn = `${ROUNDED_CONTROL} cursor-pointer p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_30%,transparent)]`;

export function AdminRowActions({
  onView,
  onEdit = () => {},
  onDelete,
  viewLabel = "Ver",
  editLabel = "Editar",
  deleteLabel = "Eliminar",
  showEdit = true,
  showDelete = true,
  deleteDisabledTitle = "No disponible",
  trailing = null,
}) {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-0.5">
      <button type="button" className={btn} title={viewLabel} aria-label={viewLabel} onClick={onView}>
        <IconRowView />
      </button>
      {showEdit ? (
        <button type="button" className={btn} title={editLabel} aria-label={editLabel} onClick={onEdit}>
          <IconRowEdit />
        </button>
      ) : null}
      {showDelete ? (
        <button type="button" className={btn} title={deleteLabel} aria-label={deleteLabel} onClick={onDelete}>
          <IconRowTrash />
        </button>
      ) : (
        <button
          type="button"
          disabled
          className={`${btn} cursor-not-allowed opacity-30`}
          title={deleteDisabledTitle}
          aria-label={deleteDisabledTitle}
        >
          <IconRowTrash />
        </button>
      )}
      {trailing}
    </div>
  );
}
