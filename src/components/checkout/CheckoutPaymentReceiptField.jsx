"use client";

import { FileDropZoneField } from "@/components/ui/FileDropZoneField";

/**
 * Campo de comprobante de pago para checkout (misma UX que `FileDropZoneField`).
 * @param {{
 *   id: string;
 *   label?: string;
 *   value: File | null;
 *   onChange: (file: File | null) => void;
 *   accept?: string;
 *   helperText: string;
 * }} props
 */
export function CheckoutPaymentReceiptField({
  id,
  label = "Comprobante de pago",
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  helperText,
}) {
  return (
    <FileDropZoneField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      accept={accept}
      helperText={helperText}
      formatsHint="JPG, PNG, WebP o PDF · máximo 5 MB"
      formatErrorMessage="Formato no permitido. Usa JPG, PNG, WebP o PDF."
      dropZoneAriaLabel="Zona para adjuntar comprobante"
    />
  );
}
