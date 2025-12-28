const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    reactStrictMode: true,

    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
        {
          protocol: "http",
          hostname: "**",
        },
      ],
    },
  };

  // Enable Serwist for both development and production
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_DEVELOPMENT_SERVER) {
    const withSerwist = (await import("@serwist/next")).default({
      swSrc: "app/sw.ts",
      swDest: "public/sw.js",
      cacheOnNavigation: true,
      reloadOnOnline: true,
      // Development-specific options
      disable: false,
      // Inject manifest for precaching
      injectionPoint: "self.__SW_MANIFEST",
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
};
