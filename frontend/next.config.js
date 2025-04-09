/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['sonar-assets.s3.amazonaws.com'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
    SOLANA_NETWORK: process.env.SOLANA_NETWORK || 'devnet',
  },
}

module.exports = nextConfig 