import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // The hub serves this site next to the relay on one domain, so it ships as a
  // container. Standalone output bundles only what the server imports.
  output: "standalone",
};

export default withNextIntl(nextConfig);
