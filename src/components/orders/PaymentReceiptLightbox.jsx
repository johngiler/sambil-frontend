"use client";

import { useEffect, useMemo } from "react";

import { ImageLightbox } from "@/components/media/ImageLightbox";
import { isPdfReceiptUrl } from "@/lib/orderPaymentMethods";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";

function IcClose({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IcDownload({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v12m0 0l4-4m-4 4L8 12M4 20h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PdfToolbarButton({ label, onClick, href, download, children }) {
  const className =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-500/80 bg-zinc-800/90 text-zinc-100 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-700";
  if (href) {
    return (
      <a
        href={href}
        download={download}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={className}>
      {children}
    </button>
  );
}

/**
 * Visor de comprobante: imágenes con {@link ImageLightbox}; PDF con iframe y barra solo iconos.
 * @param {{ open: boolean; onClose: () => void; absoluteUrl: string; showDownload?: boolean }} props
 */
export function PaymentReceiptLightbox({ open, onClose, absoluteUrl, showDownload = false }) {
  const pdf = Boolean(absoluteUrl && isPdfReceiptUrl(absoluteUrl));
  const imageItems = useMemo(
    () =>
      absoluteUrl && !pdf
        ? [{ src: absoluteUrl, alt: "Comprobante de pago", downloadFileName: "comprobante" }]
        : [],
    [absoluteUrl, pdf],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !absoluteUrl) return null;

  if (!pdf) {
    return (
      <ImageLightbox
        open={open}
        onClose={onClose}
        items={imageItems}
        showDownload={showDownload}
        showThumbnails={false}
        ariaLabel="Comprobante de pago"
      />
    );
  }

  return (
    <PdfReceiptLightboxInner
      absoluteUrl={absoluteUrl}
      onClose={onClose}
      showDownload={showDownload}
    />
  );
}

function PdfReceiptLightboxInner({ absoluteUrl, onClose, showDownload }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Comprobante de pago PDF"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar" onClick={onClose} />
      <div
        className={`relative z-[81] flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col ${ROUNDED_CONTROL} border border-zinc-200 bg-zinc-950 shadow-2xl ring-1 ring-white/10`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5 sm:right-3 sm:top-3">
          {showDownload ? (
            <PdfToolbarButton
              label="Descargar PDF"
              href={absoluteUrl}
              download
            >
              <IcDownload />
            </PdfToolbarButton>
          ) : null}
          <PdfToolbarButton label="Cerrar visor" onClick={onClose}>
            <IcClose />
          </PdfToolbarButton>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-zinc-900 p-4 pt-14 sm:pt-5">
          <iframe
            title="Comprobante PDF"
            src={absoluteUrl}
            className={`h-[min(70vh,640px)] w-full ${ROUNDED_CONTROL} border border-zinc-700 bg-white`}
          />
        </div>
      </div>
    </div>
  );
}
