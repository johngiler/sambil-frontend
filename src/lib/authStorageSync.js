/**
 * Cuando el access token se renueva en `authApi` (refresh o login), el estado de React
 * debe alinearse con `localStorage` sin depender solo del montaje inicial.
 */
export const AUTH_TOKENS_CHANGED_EVENT = "sambil-auth-tokens-changed";

export function emitAuthTokensChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_TOKENS_CHANGED_EVENT));
  }
}
