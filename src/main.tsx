
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import App from "@/App";
import { Toaster } from "@/components/ui/toaster";
import "@/index.css";
import { initializeApp } from "@/utils/initApp";
import { PersistenceProvider } from "@/contexts/PersistenceContext";
import { BrowserRouter } from "react-router-dom";

// Initialize the app before rendering
initializeApp();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistenceProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </PersistenceProvider>
  </React.StrictMode>
);
