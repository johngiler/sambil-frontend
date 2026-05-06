"use client";

export function AdminInlineAlert({ variant = "error", title, children }) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : undefined}
      className={`mb-4 rounded-[12px] border px-4 py-3 text-sm ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : "border-zinc-200 bg-zinc-50 text-zinc-800"
      }`}
    >
      {title ? <div className="mb-1 font-semibold">{title}</div> : null}
      <div className="whitespace-pre-wrap">{children}</div>
    </div>
  );
}

