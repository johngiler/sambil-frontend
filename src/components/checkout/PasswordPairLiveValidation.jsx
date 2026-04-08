"use client";

import { useState } from "react";

import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const MIN_LEN = 8;

const ringNeutral = "border border-zinc-200 mp-form-field-accent focus:outline-none";
const ringValid =
  "border border-emerald-500/65 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/25";
const ringInvalid =
  "border border-amber-600/55 focus:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-400/30";

function fieldShell(state, { withToggle = false } = {}) {
  const ring = state === "valid" ? ringValid : state === "invalid" ? ringInvalid : ringNeutral;
  const padEnd = withToggle ? "pr-11" : "";
  return `min-h-11 w-full ${ROUNDED_CONTROL} ${ring} bg-white px-3 py-2.5 ${padEnd} text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out sm:min-h-0 sm:py-2 sm:text-sm`;
}

function IconEye({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconEyeSlash({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.5 10.5a3 3 0 104.2 4.2M6.6 6.6C4.46 8.06 2.5 10.5 2.5 12s3.75 6 9.5 6c1.55 0 3-.35 4.25-.95M9.88 4.24A10.1 10.1 0 0112 4c5.75 0 9.5 6 9.5 6a15.2 15.2 0 01-2.03 2.97"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const hintBase = "mt-1.5 text-xs transition-colors duration-200";

/**
 * Par contraseña / confirmar con validación en vivo (mínimo de caracteres y coincidencia).
 * Opcionalmente incluye botones para mostrar u ocultar cada campo (`showPasswordToggle`).
 */
export function PasswordPairLiveValidation({
  password,
  passwordConfirm,
  onPasswordChange,
  onPasswordConfirmChange,
  passwordId = "checkout-password",
  confirmId = "checkout-password-confirm",
  autoCompletePassword = "new-password",
  /** Error de política del servidor (p. ej. contraseña demasiado común). */
  policyError = "",
  /** Botón para ver u ocultar caracteres en ambos campos. */
  showPasswordToggle = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwdLenOk = password.length >= MIN_LEN;
  const confirmLenOk = passwordConfirm.length >= MIN_LEN;
  const bothMatch = pwdLenOk && confirmLenOk && password === passwordConfirm;

  const pwdState =
    password.length === 0 ? "neutral" : pwdLenOk ? "valid" : "invalid";

  const confirmState =
    passwordConfirm.length === 0
      ? "neutral"
      : bothMatch
        ? "valid"
        : "invalid";

  return (
    <>
      <div>
        <label htmlFor={passwordId} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <input
            id={passwordId}
            type={showPasswordToggle && showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className={fieldShell(pwdState, { withToggle: showPasswordToggle })}
            autoComplete={autoCompletePassword}
            minLength={MIN_LEN}
            aria-invalid={password.length > 0 && !pwdLenOk}
            aria-describedby={`${passwordId}-hint`}
          />
          {showPasswordToggle ? (
            <button
              type="button"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_40%,transparent)]"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <IconEyeSlash /> : <IconEye />}
            </button>
          ) : null}
        </div>
        <p
          id={`${passwordId}-hint`}
          className={`${hintBase} ${
            pwdState === "valid"
              ? "font-medium text-emerald-800"
              : pwdState === "invalid"
                ? "text-amber-900"
                : "text-zinc-500"
          }`}
        >
          {password.length === 0
            ? `Al menos ${MIN_LEN} caracteres.`
            : pwdLenOk
              ? "Longitud mínima cumplida."
              : `Llevas ${password.length} de ${MIN_LEN} caracteres.`}
        </p>
      </div>
      <div>
        <label htmlFor={confirmId} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Confirmar contraseña
        </label>
        <div className="relative mt-1.5">
          <input
            id={confirmId}
            type={showPasswordToggle && showConfirm ? "text" : "password"}
            value={passwordConfirm}
            onChange={(e) => onPasswordConfirmChange(e.target.value)}
            className={fieldShell(confirmState, { withToggle: showPasswordToggle })}
            autoComplete={autoCompletePassword}
            minLength={MIN_LEN}
            aria-invalid={passwordConfirm.length > 0 && !bothMatch}
            aria-describedby={`${confirmId}-hint`}
          />
          {showPasswordToggle ? (
            <button
              type="button"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--mp-primary)_40%,transparent)]"
              aria-label={showConfirm ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
              aria-pressed={showConfirm}
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <IconEyeSlash /> : <IconEye />}
            </button>
          ) : null}
        </div>
        <p
          id={`${confirmId}-hint`}
          className={`${hintBase} ${
            confirmState === "valid"
              ? "font-medium text-emerald-800"
              : confirmState === "invalid"
                ? "text-amber-900"
                : "text-zinc-500"
          }`}
        >
          {passwordConfirm.length === 0
            ? "Debe ser idéntica a la contraseña."
            : bothMatch
              ? "Las contraseñas coinciden."
              : !pwdLenOk
                ? `Cuando la primera tenga ${MIN_LEN} caracteres, podrás validar la coincidencia.`
                : confirmLenOk
                  ? "No coinciden. Revisa mayúsculas y símbolos."
                  : `Llevas ${passwordConfirm.length} de ${MIN_LEN} caracteres.`}
        </p>
      </div>
      {policyError ? (
        <p
          role="alert"
          className={`${ROUNDED_CONTROL} border border-red-200/90 bg-red-50 px-3 py-2 text-sm text-red-900`}
        >
          {policyError}
        </p>
      ) : null}
    </>
  );
}

export const PASSWORD_PAIR_MIN_LENGTH = MIN_LEN;
