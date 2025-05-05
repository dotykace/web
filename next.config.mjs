/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Nastavenie base path pre GitHub Pages, ak používate vlastnú doménu, môžete to odstrániť
  // basePath: '/nazov-repozitara',
  // Nastavenie assetPrefix pre GitHub Pages, ak používate vlastnú doménu, môžete to odstrániť
  // assetPrefix: '/nazov-repozitara',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
