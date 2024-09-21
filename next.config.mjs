/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
      return [
          {
              source: '/embed',
              headers: [
                  {
                      key: 'X-Frame-Options',
                      value: 'ALLOWALL',
                  },
              ],
          },
      ];
  },
  experimental: {
      serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
  },
  webpack: (config) => {
      // Prevent bundling specific modules
      config.resolve.alias = {
          ...config.resolve.alias,
          "sharp$": false,
          "onnxruntime-node$": false,
      };
      return config;
  },
};

export default nextConfig;
