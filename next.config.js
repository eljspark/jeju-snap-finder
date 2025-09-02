/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cvuirhzznizztbtclieu.supabase.co'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  transpilePackages: ['lucide-react'],
}

module.exports = nextConfig