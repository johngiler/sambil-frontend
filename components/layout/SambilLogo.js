/**
 * Logotipo: `public/logotype.svg` (copia de `images/logos/logotype.svg`).
 * Ejecuta `npm run assets:logos` en la raíz del monorepo tras actualizar los SVG.
 */
export function SambilLogo() {
  return (
    <img
      src="/logotype.svg"
      alt="Sambil"
      width={150}
      height={30}
      decoding="async"
      className="h-6 w-auto max-w-[min(42vw,9.5rem)] sm:h-7 sm:max-w-[9.5rem]"
    />
  );
}
