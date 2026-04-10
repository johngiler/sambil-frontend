import { authFetch } from "@/services/authApi";

export const MY_CONTRACTS_PATH = "/api/me/contracts/";
export const MY_FAVORITES_PATH = "/api/me/favorites/";

/** @param {string} [phase] */
export function contractsPath(phase = "all") {
  if (!phase || phase === "all") return MY_CONTRACTS_PATH;
  return `${MY_CONTRACTS_PATH}?phase=${encodeURIComponent(phase)}`;
}

/**
 * @param {{ phase?: string, token?: string | null }} opts
 */
export async function fetchMyContracts({ phase = "all", token } = {}) {
  return authFetch(contractsPath(phase), { token });
}

/**
 * @param {{ ad_space: number, token?: string | null }} opts
 */
export async function postFavorite({ ad_space, token }) {
  return authFetch(MY_FAVORITES_PATH, {
    method: "POST",
    body: { ad_space },
    token,
  });
}

/**
 * @param {{ adSpaceId: number, token?: string | null }} opts
 */
export async function deleteFavorite({ adSpaceId, token }) {
  return authFetch(`${MY_FAVORITES_PATH}${adSpaceId}/`, { method: "DELETE", token });
}
