import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { EnhancedApp } from "./components/EnhancedApp.tsx";
import "./index.css";

// Development utilities removed for production

// Use EnhancedApp for the new features, or App for the original version
const AppComponent =
  import.meta.env.VITE_USE_ENHANCED_APP === "true" ? EnhancedApp : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppComponent />
  </StrictMode>
);
