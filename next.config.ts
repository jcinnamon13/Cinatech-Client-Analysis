import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit loads font/afm files from disk via relative paths.
  // Without this, Next.js webpack bundles pdfkit and breaks those paths.
  serverExternalPackages: ['pdfkit'],
};

export default nextConfig;
