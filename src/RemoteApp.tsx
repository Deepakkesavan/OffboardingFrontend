import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const RemoteApp = () => (
  <StrictMode>
    <BrowserRouter basename="offboarding">
      <App />
    </BrowserRouter>
  </StrictMode>
);

export default RemoteApp;