import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit loads font/afm files from disk via relative paths.
  // Without this, Next.js webpack bundles pdfkit and breaks those paths.
  serverExternalPackages: ['pdfkit'],
  // react-pdf and pdfjs-dist ship ESM-only internals that webpack cannot
  // handle without transpilation in Next.js App Router.
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
};

export default nextConfig;
