import React, {lazy, Suspense} from "react";
import { createRoot } from "react-dom/client";
import { PublicExperience } from "./features/PublicExperience";
import "./styles.css";

const PublicCoursePlayer = lazy(() => import('./features/PublicCoursePlayer').then(m=>({default:m.PublicCoursePlayer})));

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {location.pathname.startsWith('/corsi')?<Suspense fallback={<p>Apro il percorso…</p>}><PublicCoursePlayer/></Suspense>:<PublicExperience/>}
  </React.StrictMode>,
);
