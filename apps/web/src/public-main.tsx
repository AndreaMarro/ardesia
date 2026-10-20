import React from "react";
import { createRoot } from "react-dom/client";
import { Public } from "./features/Public";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Public publicPreview />
  </React.StrictMode>,
);
