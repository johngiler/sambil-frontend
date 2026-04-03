"use client";

import { ROUNDED_CONTROL } from "@/lib/uiRounding";

const MIN_LEN = 8;

const ringNeutral = "border border-zinc-200 mp-form-field-accent focus:outline-none";
const ringValid =
  "border border-emerald-500/65 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/25";
const ringInvalid =
  "border border-amber-600/55 focus:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-400/30";

function fieldShell(state) {
  const ring = state === "valid" ? ringValid : state === "invalid" ? ringInvalid : ringNeutral;
  return `mt-1.5 min-h-11 w-full ${ROUNDED_CONTROL} ${ring} bg-white px-3 py-2.5 text-base text-zinc-900 transition-[border-color,box-shadow] duration-200 ease-out sm:min-h-0 sm:py-2 sm:text-sm`;
}

const hintBase = "mt-1.5 text-xs transition-colors duration-200";

/**
 * Par contraseña / confirmar con validación en vivo (mínimo de caracteres y coincidencia).
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
}) {
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
        <input
          id={passwordId}
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={fieldShell(pwdState)}
          autoComplete={autoCompletePassword}
          minLength={MIN_LEN}
          aria-invalid={password.length > 0 && !pwdLenOk}
          aria-describedby={`${passwordId}-hint`}
        />
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
        <input
          id={confirmId}
          type="password"
          value={passwordConfirm}
          onChange={(e) => onPasswordConfirmChange(e.target.value)}
          className={fieldShell(confirmState)}
          autoComplete={autoCompletePassword}
          minLength={MIN_LEN}
          aria-invalid={passwordConfirm.length > 0 && !bothMatch}
          aria-describedby={`${confirmId}-hint`}
        />
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
