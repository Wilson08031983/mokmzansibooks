
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { router } from "@/routes";
import { Toaster } from "@/components/ui/toaster";
import "@/index.css";
import { initializeApp } from "@/utils/initApp";
import { PersistenceProvider } from "./contexts/PersistenceContext";

// Initialize the app before rendering
initializeApp();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PersistenceProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </PersistenceProvider>
  </React.StrictMode>
);
