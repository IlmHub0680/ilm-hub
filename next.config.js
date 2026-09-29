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
      // Events and News used to be two separate standalone listing
      // pages, alongside the combined /updates page the homepage's
      // "Events and News" card and "View All" button always used --
      // visitors ending up on one or the other read as the site
      // treating events and news as unrelated. Both now redirect into
      // the one combined page; individual news articles still live at
      // their own /news/<id> URL, untouched by this (Next only
      // matches the exact '/news' path here, not its subpaths).
      {
        source: '/events',
        destination: '/updates',
        permanent: true,
      },
      {
        source: '/news',
        destination: '/updates',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
