// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

// next.config.js
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
  };
  
  export default nextConfig;