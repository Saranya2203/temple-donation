import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Standard web application - no service worker needed

createRoot(document.getElementById("root")!).render(<App />);
