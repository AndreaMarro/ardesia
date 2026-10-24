import React from "react";
import { createRoot } from "react-dom/client";
import { PublicExperience } from "./features/PublicExperience";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PublicExperience />
  </React.StrictMode>,
);
