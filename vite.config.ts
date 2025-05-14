
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    allowedHosts: ['8846c003-0f31-4c54-b71d-8e34adea6a37.lovableproject.com']
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean)
}));
