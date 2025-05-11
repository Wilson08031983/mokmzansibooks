
import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// Create and export the router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  // Additional routes can be added here
]);
