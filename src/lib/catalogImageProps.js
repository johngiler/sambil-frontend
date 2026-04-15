/**
 * Atributos HTML para `<img>` con URLs resueltas vía `lib/mediaUrls` (WebP en origen).
 * Complementa el peso del archivo: lazy-load, decodificación asíncrona y menos CLS.
 */
export const catalogRasterImgAttrs = {
  loading: "lazy",
  decoding: "async",
};
