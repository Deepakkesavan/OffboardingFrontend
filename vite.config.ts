import { defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import path from "path";

export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd());

  const base = "/offui/";

  // const entry = "https://people-dev.clarium.tech/orgui/remoteEntry.js";



  return {
    base,
    plugins: [
      react(),
      federation({
        name: "offboardingRemote",
        filename: "remoteEntry.js",
        exposes: {
          './App': './src/RemoteApp.tsx',
          './react': 'react',
          './react-dom-client': 'react-dom/client',
        },
        // remotes: {
        //   orgchart: {
        //     type: "module",
        //     name: "orgchart",
        //     entry: entry,
        //   },
        // },
        shared: {
          react: { singleton: true, requiredVersion: '*' },
          'react-dom': { singleton: true, requiredVersion: '*' },
          'react-router-dom': { singleton: true, requiredVersion: '*' },
        },
      }),
    ],

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