import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import path from "path";

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
          "./App": "./src/RemoteApp.tsx",
        },
        remotes: {},
        shared: {
          react: { singleton: true },
          "react-dom": { singleton: true },
          "react-router-dom": { singleton: true },
        },
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