import {PhysicsLab} from "../components/PhysicsLab";
import {PublicHydrostaticLab} from "../components/PublicHydrostaticLab";
import {PublicSpringLab} from "../components/PublicSpringLab";
import {useState} from "react";
import "./PublicExperience.css";

const courseIds = ["strumenti-meccanica", "fluidi-termodinamica", "elettricita-magnetismo", "onde-ottica-radiazioni"];
const experiments = [
  {id: "poiseuille", slug: "poiseuille", label: "Flusso e raggio", title: <>Un tubo più largo.<br />Che cosa cambia?</>},
  {id: "hydrostatic", slug: "idrostatica", label: "Pressione e profondità", title: <>Più in profondità.<br />Quale pressione?</>},
  {id: "spring", slug: "molla", label: "Molla e forza", title: <>Tiri una molla.<br />Quanto si allunga?</>},
] as const;
export function PublicExperience() {
  const [model, setModel] = useState<string>(() => {
    const query = new URLSearchParams(location.search);
    return experiments.find(entry => entry.slug === query.get("modello"))?.id
      ?? (query.get("percorso") === "strumenti-meccanica" ? "spring" : "poiseuille");
  });
  const requested = new URLSearchParams(location.search).get("percorso");
  const course = requested && courseIds.includes(requested) ? requested : model === "spring" ? "strumenti-meccanica" : "fluidi-termodinamica";
  const contact = "/?" + new URLSearchParams({percorso: course}) + "#contatto";
  function chooseExperiment(entry: (typeof experiments)[number]) {
    const url = new URL(location.href);
    url.searchParams.set("modello", entry.slug);
    history.replaceState(history.state, "", url);
    setModel(entry.id);
  }
  return <div className="public-experience">
    <a className="skip-link" href="#esperimento">Vai all’esperimento</a>
    <header className="experience-header"><a className="wordmark" href="/">ardesia.</a><a href={contact}>Torna al percorso</a></header>
    <main id="esperimento" tabIndex={-1}>
      <div className="experience-heading"><p>Una lezione da provare</p><h1>{experiments.find(entry => entry.id === model)?.title}</h1><p>Prima un’idea, poi un esperimento. Tre piccoli modelli di Fisica per mettere alla prova il ragionamento: flusso, pressione e forze.</p></div>
      <div className="experience-models" role="group" aria-label="Scegli un esperimento di Fisica">
        {experiments.map(entry => <button key={entry.id} aria-pressed={model === entry.id} onClick={() => chooseExperiment(entry)}>{entry.label}</button>)}
      </div>
      {model === "poiseuille" ? <PhysicsLab publicPreview numericPrediction publicPersistence /> : model === "hydrostatic" ? <PublicHydrostaticLab /> : <PublicSpringLab />}
      <section className="experience-next"><div><h2>Riparti dal ragionamento.</h2><p>Questa demo esplora tre situazioni circoscritte. Nel mini-corso il tutor riprende i passaggi con te e propone una prova diversa.</p></div><a className="button-primary" href={contact}>Chiedi disponibilità</a></section>
      <p className="experience-disclosure">Demo pubblica · nessun account richiesto. Scenari originali DEMO, separati dalla banca di quesiti. I numeri sono verificati dal motore scientifico; l’approvazione editoriale umana è distinta. Il confronto non è un voto né una valutazione del tuo apprendimento. Puoi salvare facoltativamente una bozza solo in questo browser.</p>
    </main>
    <footer><a href={contact}>Programma e informazioni sul percorso</a><span>Ardesia · uno spazio per capire.</span></footer>
  </div>;
}
