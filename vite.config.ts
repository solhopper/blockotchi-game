import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "module";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const require = createRequire(import.meta.url);
const processBrowserPath = require.resolve("process/browser");
const bufferPath = require.resolve("buffer");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    include: ["buffer", "process"],
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      process: processBrowserPath,
      buffer: bufferPath,
    },
  },
}));
