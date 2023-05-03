/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL || 'http://127.0.0.1:3000'
  },
  output: 'export'
}

module.exports = nextConfig
