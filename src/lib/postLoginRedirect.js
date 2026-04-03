/**
 * Destino tras iniciar sesión en el marketplace del operador (tenant).
 * Admin → panel; cliente → pedidos salvo `next` explícito (p. ej. checkout).
 */
export function postLoginRedirectPath({ role, nextPath }) {
  const raw = typeof nextPath === "string" ? nextPath.trim() : "";
  const deepNext =
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.toLowerCase().startsWith("/login") &&
    raw !== "/"
      ? raw
      : "";

  if (role === "admin") return "/dashboard";
  if (role === "client") return deepNext || "/cuenta/pedidos";
  return deepNext || "/";
}
