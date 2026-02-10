import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    LEADERBOARD_DATA_PATH: process.env.LEADERBOARD_DATA_PATH,
  },
};

export default nextConfig;
