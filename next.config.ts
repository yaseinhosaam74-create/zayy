/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: '/data/data/com.termux/files/home/my-store',
  },
};

module.exports = nextConfig;