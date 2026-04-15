/**
 * Atributos HTML para `<img>` con URLs del API (WebP en origen desde backend).
 * Complementa el peso del archivo: lazy-load, decodificación asíncrona y menos CLS.
 */
export const catalogRasterImgAttrs = {
  loading: "lazy",
  decoding: "async",
};
