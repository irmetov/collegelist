/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/collegelist' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/collegelist/' : '',
}

module.exports = nextConfig