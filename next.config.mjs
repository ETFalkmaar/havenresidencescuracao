/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "pcdojiarpptcgeoddfeg.supabase.co" },
      // Airbnb image CDN — used for Blue Haven Residence photos
      // imported from the live Airbnb listing.
      { protocol: "https", hostname: "a0.muscache.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
