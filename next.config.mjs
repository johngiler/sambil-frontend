/** @type {import('next').NextConfig} */
function mediaPatternFromApiUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    // `/**` evita 400 en `/_next/image` si el backend sirve rutas distintas a `/media/...`
    // o si el patrón `/media/**` no encaja con cómo se serializa la URL.
    const pat = {
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      pathname: "/**",
    };
    if (u.port) pat.port = u.port;
    return pat;
  } catch {
    return null;
  }
}

const fromEnv = mediaPatternFromApiUrl();

const nextConfig = {
  // Rutas dinámicas impiden `output: "export"` (solo estático). Standalone + Nginx proxy en prod.
  output: "standalone",
  images: {
    // Next 14+ bloquea IPs privadas en el optimizador (SSRF). En `next dev` el media en 127.0.0.1 falla sin esto.
    // En producción sirve las imágenes desde un dominio público o, en entornos cerrados, valora `unoptimized` / proxy.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      // Sin `port`: en Next coincide con cualquier puerto (evita desajuste 8000 vs omisión).
      // `pathname: "/**"`: cubre `/media/...` y cualquier otra ruta que sirva el API en local.
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      ...(fromEnv ? [fromEnv] : []),
    ],
  },
};

export default nextConfig;
