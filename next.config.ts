import type { NextConfig } from "next";

// Hide the dev-mode "N" badge so it does not show during the demo.
const nextConfig: NextConfig = { devIndicators: false };

export default nextConfig;
