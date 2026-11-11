import type { NextConfig } from "next";
import config from "./site.config.json";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || config.siteUrl).replace(/\/$/, "");
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? new URL(siteUrl).pathname).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_GSC_VERIFICATION: process.env.NEXT_PUBLIC_GSC_VERIFICATION || config.gscVerification,
    NEXT_PUBLIC_BING_VERIFICATION: process.env.NEXT_PUBLIC_BING_VERIFICATION || config.bingVerification,
    NEXT_PUBLIC_YANDEX_VERIFICATION: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || config.yandexVerification,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
