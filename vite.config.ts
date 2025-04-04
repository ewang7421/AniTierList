import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { plugins: [["babel-plugin-react-compiler"]] } }),
    tsconfigPaths(),
  ],
  server: {
    host: "localhost",
    port: 3000,
  },
  base: "/AniTierList/",
});
