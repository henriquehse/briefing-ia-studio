import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Desabilitar warning de useSearchParams sem Suspense
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
