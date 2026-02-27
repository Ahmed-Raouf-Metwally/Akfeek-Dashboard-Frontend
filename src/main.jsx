import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n"; // ✅ Initialize i18n
import { initThemeSync } from "./hooks/useTheme.js";

// Apply theme class before first paint to prevent flash
initThemeSync();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
