import { normalizeMediaUrlForUi } from "@/services/api";

/** @param {unknown} coverImage */
export function rawSpaceCoverSrc(coverImage) {
  if (typeof coverImage === "string" && coverImage.trim() !== "") return coverImage;
  if (
    coverImage &&
    typeof coverImage === "object" &&
    typeof coverImage.url === "string" &&
    coverImage.url.trim() !== ""
  ) {
    return coverImage.url;
  }
  return "";
}

/** URL lista para `<Image />` / `<img>` a partir del objeto espacio del API. */
export function spaceCoverUrlForUi(space) {
  if (!space) return "";
  return normalizeMediaUrlForUi(rawSpaceCoverSrc(space.cover_image));
}
