"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CoverImageField } from "@/components/admin/CoverImageField";
import { useAuth } from "@/context/AuthContext";
import { ROUNDED_CONTROL } from "@/lib/uiRounding";
import { changeMePassword, patchMe } from "@/services/authApi";

const fieldClass = `mt-1.5 min-h-11 w-full ${ROUNDED_CONTROL} border border-zinc-200 bg-white px-3.5 py-2.5 text-base text-zinc-900 shadow-sm transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-zinc-400 focus:border-[#0c9dcf]/45 focus:outline-none focus:ring-2 focus:ring-[#0c9dcf]/18 sm:min-h-0 sm:py-2 sm:text-sm`;

const pillBase = `${ROUNDED_CONTROL} border px-3 py-1.5 text-sm font-medium shadow-sm transition`;
const pillInactive = `border-zinc-200/90 bg-white text-zinc-700 hover:border-[#0c9dcf]/40 hover:text-[#0c9dcf]`;
const pillCurrent = `border-[#0c9dcf]/45 bg-sky-50/90 font-semibold text-[#0c9dcf] ring-1 ring-sky-100/80`;

function SectionTitle({ children, id }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500"
    >
      <span className="h-px w-6 bg-gradient-to-r from-[#0c9dcf]/60 to-transparent" aria-hidden />
      {children}
    </h2>
  );
}

export default function PerfilView() {
  const router = useRouter();
  const { authReady, me, accessToken, refreshUser, isAdmin, isClient } = useAuth();
  const fileRef = useRef(null);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [pendingClearCover, setPendingClearCover] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileErr, setProfileErr] = useState("");
  const [profileOk, setProfileOk] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [pwdErr, setPwdErr] = useState("");
  const [pwdOk, setPwdOk] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!me) {
      router.replace("/login?next=/cuenta/perfil");
    }
  }, [authReady, me, router]);

  useEffect(() => {
    if (!me) return;
    setEmail(me.email || "");
    setFirstName(me.first_name || "");
    setLastName(me.last_name || "");
    setCoverFile(null);
    setFilePreview(null);
    setPendingClearCover(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [me?.id, me?.email, me?.first_name, me?.last_name, me?.cover_image]);

  useEffect(() => {
    if (!coverFile) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  if (!authReady || !me) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-zinc-500">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-[#0c9dcf]" />
        <p className="mt-4 text-sm">Cargando…</p>
      </div>
    );
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    setProfileErr("");
    setProfileOk("");
    setProfileSaving(true);
    try {
      const useMultipart = coverFile != null || pendingClearCover;
      if (useMultipart) {
        const fd = new FormData();
        fd.append("email", email.trim());
        fd.append("first_name", firstName.trim());
        fd.append("last_name", lastName.trim());
        if (coverFile) fd.append("cover_image", coverFile);
        if (pendingClearCover) fd.append("remove_cover", "true");
        await patchMe(fd, { token: accessToken });
      } else {
        await patchMe(
          {
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
          { token: accessToken },
        );
      }
      await refreshUser();
      setCoverFile(null);
      setPendingClearCover(false);
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setProfileOk("Datos guardados correctamente.");
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setProfileSaving(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    setPwdErr("");
    setPwdOk("");
    if (newPassword !== confirmPassword) {
      setPwdErr("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPwdSaving(true);
    try {
      await changeMePassword(
        { old_password: oldPassword, new_password: newPassword },
        { token: accessToken },
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdOk("Contraseña actualizada correctamente.");
    } catch (err) {
      setPwdErr(err instanceof Error ? err.message : "Error al cambiar la contraseña");
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Sección de cuenta">
        {isClient ? (
          <>
            <Link href="/cuenta" className={`${pillBase} ${pillInactive}`}>
              Mi empresa
            </Link>
            <Link href="/cuenta/pedidos" className={`${pillBase} ${pillInactive}`}>
              Mis pedidos
            </Link>
          </>
        ) : null}
        {isAdmin ? (
          <Link href="/dashboard" className={`${pillBase} ${pillInactive}`}>
            Panel
          </Link>
        ) : null}
        <span className={`${pillBase} ${pillCurrent}`} aria-current="page">
          Mi perfil
        </span>
      </nav>

      <div className="relative mt-8 overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-sky-50/30 px-5 py-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2c2c81]/90 via-[#0c9dcf] to-[#ea4822]/80"
          aria-hidden
        />
        <h1 className="text-balance text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Mi perfil
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
          Correo, nombre y foto opcional. El <span className="font-medium text-zinc-800">usuario</span> lo asigna
          el equipo; para cambiarlo, contacta a soporte.
        </p>
      </div>

      <form
        onSubmit={onSaveProfile}
        className={`mt-8 ${ROUNDED_CONTROL} border border-zinc-200/90 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-zinc-100/80 sm:p-6`}
      >
        <SectionTitle id="sec-foto">Foto y datos</SectionTitle>

        <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 sm:p-5">
          <CoverImageField
            readOnly={false}
            variant="avatar"
            existingUrl={pendingClearCover ? "" : me.cover_image}
            filePreviewUrl={filePreview}
            onFileChange={(f) => {
              setCoverFile(f);
              setPendingClearCover(false);
            }}
            onClearExisting={() => {
              setPendingClearCover(true);
              setCoverFile(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            fileInputRef={fileRef}
          />
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm font-medium text-zinc-800">Usuario</p>
            <div
              className={`mt-1.5 ${ROUNDED_CONTROL} border border-dashed border-zinc-200 bg-zinc-50/80 px-3.5 py-2.5 font-mono text-sm text-zinc-800`}
            >
              {me.username}
            </div>
            <p className="mt-1.5 text-xs text-zinc-500">No editable desde aquí.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800" htmlFor="pf-email">
              Correo <span className="text-red-600">*</span>
            </label>
            <input
              id="pf-email"
              type="email"
              required
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-800" htmlFor="pf-first">
                Nombre
              </label>
              <input
                id="pf-first"
                className={fieldClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800" htmlFor="pf-last">
                Apellido
              </label>
              <input
                id="pf-last"
                className={fieldClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
        </div>

        {profileErr ? (
          <p
            className={`mt-6 break-words ${ROUNDED_CONTROL} border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-800`}
            role="alert"
          >
            {profileErr}
          </p>
        ) : null}
        {profileOk ? (
          <p
            className={`mt-6 ${ROUNDED_CONTROL} border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900`}
            role="status"
          >
            {profileOk}
          </p>
        ) : null}

        <div className="mt-8 border-t border-zinc-100 pt-6">
          <button
            type="submit"
            disabled={profileSaving}
            className={`inline-flex min-h-11 w-full items-center justify-center sm:w-auto ${ROUNDED_CONTROL} bg-zinc-900 px-6 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99] disabled:bg-zinc-400 sm:text-sm`}
          >
            {profileSaving ? "Guardando…" : "Guardar datos"}
          </button>
        </div>
      </form>

      <div
        className={`mt-8 ${ROUNDED_CONTROL} border border-zinc-200/90 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-zinc-100/80 sm:p-6`}
      >
        <SectionTitle id="sec-password">Seguridad</SectionTitle>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Introduce tu contraseña actual y la nueva (mínimo <span className="font-medium text-zinc-800">8</span>{" "}
          caracteres).
        </p>

        <form onSubmit={onChangePassword} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-800" htmlFor="pf-old-pw">
              Contraseña actual
            </label>
            <input
              id="pf-old-pw"
              type="password"
              className={fieldClass}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-800" htmlFor="pf-new-pw">
                Nueva contraseña
              </label>
              <input
                id="pf-new-pw"
                type="password"
                className={fieldClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800" htmlFor="pf-confirm-pw">
                Confirmar nueva contraseña
              </label>
              <input
                id="pf-confirm-pw"
                type="password"
                className={fieldClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          </div>

          {pwdErr ? (
            <p
              className={`break-words ${ROUNDED_CONTROL} border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-800`}
              role="alert"
            >
              {pwdErr}
            </p>
          ) : null}
          {pwdOk ? (
            <p
              className={`${ROUNDED_CONTROL} border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900`}
              role="status"
            >
              {pwdOk}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pwdSaving || !oldPassword || !newPassword || !confirmPassword}
            className={`inline-flex min-h-11 w-full items-center justify-center border-2 border-zinc-900 bg-white px-6 py-2.5 text-base font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 sm:w-auto sm:text-sm ${ROUNDED_CONTROL}`}
          >
            {pwdSaving ? "Actualizando…" : "Cambiar contraseña"}
          </button>
        </form>
      </div>

      <nav className="mt-10 flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/"
          className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-white px-3 py-1.5 font-medium text-zinc-700 shadow-sm transition hover:border-[#0c9dcf]/40 hover:text-[#0c9dcf]`}
        >
          Inicio
        </Link>
        {isClient ? (
          <Link
            href="/cuenta"
            className={`${ROUNDED_CONTROL} border border-zinc-200/90 bg-white px-3 py-1.5 font-medium text-zinc-700 shadow-sm transition hover:border-[#0c9dcf]/40 hover:text-[#0c9dcf]`}
          >
            Mi empresa
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
