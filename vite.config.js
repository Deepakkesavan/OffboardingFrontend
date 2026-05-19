import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  // Development URL
  const base = "http://localhost:4207/";

  return {
    base,
    plugins: [
      react(),
      federation({
        name: "offboardingRemote",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/RemoteApp.jsx",
        },
        remotes: {},
        shared: {
          react: { singleton: true },
          "react-dom": { singleton: true },
          "react-router-dom": { singleton: true },
        },
        dts: false,
      }),
    ],
    server: {
      port: 4207,
      cors: {
        origin: "*",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    preview: {
      port: 4207,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      target: "esnext",
      outDir: "dist",
      minify: false,
      sourcemap: true,
      cssCodeSplit: true,
    },
  };
});