import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "*": [
      "./public/images/artworks/**",
      "./public/images/**/*.jpg",
      "./public/images/**/*.jpeg",
      "./public/images/**/*.png",
      "./public/images/**/*.JPG",
      "./public/images/**/*.PNG",
    ],
  },
};

export default nextConfig;
