/** @type {import('next').NextConfig} */
const nextConfig = {
  // sql.js locates its .wasm file relative to __dirname at runtime, so keep it
  // out of the server bundle and let Node require it from node_modules.
  serverExternalPackages: ["sql.js"],
};

export default nextConfig;
