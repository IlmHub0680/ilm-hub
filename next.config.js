/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // app/dashboard (the bookstore/media/orders account page) moved to
      // app/account/dashboard so its URL matches what it actually is --
      // this keeps every existing bookmark/shared link to /dashboard
      // working instead of 404ing.
      {
        source: '/dashboard',
        destination: '/account/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
