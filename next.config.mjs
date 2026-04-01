/** @type {import('next').NextConfig} */
function mediaPatternFromApiUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const pat = {
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      pathname: "/media/**",
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      ...(fromEnv ? [fromEnv] : []),
    ],
  },
};

export default nextConfig;
