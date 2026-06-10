import { defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";


export default defineConfig(({}) => {
  // This loads the correct .env file
  // const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/offui/",
    plugins: [
      react(),
      federation({
        name: "reactRemote",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/RemoteApp.jsx",
        },
        shared: {
          react: {
            singleton: true,
          },
          "react-dom": {
            singleton: true,
          },
          "react-router-dom": {
            singleton: true,
          },
        },
        //When you remove shared, both the host app and the remote app load their own separate copy of React,
        //so React exists twice in the browser. React hooks and context only work when there is a single React instance,
        //so having two copies causes errors like “Invalid hook call”.
      }),
    ],
    preview: {
      port: 4207,
    },
  };
});


