import React,{lazy,Suspense} from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const PublicCoursePlayer=lazy(()=>import('./features/PublicCoursePlayer').then(m=>({default:m.PublicCoursePlayer})));

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {location.pathname.startsWith('/corsi')?<Suspense fallback={<p>Apro il percorso…</p>}><PublicCoursePlayer/></Suspense>:<App />}
  </React.StrictMode>,
);
