/**
 * El marketplace solo permite nuevas reservas cuando el estado comercial de la toma es «disponible».
 * Debe coincidir con `ad_space_allows_marketplace_reservation` en el backend.
 */
export function spaceAllowsMarketplaceReservation(status) {
  return String(status ?? "") === "available";
}
