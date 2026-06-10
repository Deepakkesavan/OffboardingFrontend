import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Mount to tms-root for CSS scoping isolation in micro-frontend
const container = document.getElementById("tms-root");
if (!container) throw new Error('Root element "tms-root" not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
