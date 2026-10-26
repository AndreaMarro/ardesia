import { useState } from "react";
import { createRoot } from "react-dom/client";
import { SourceStatus, SurfaceState, type SourceState, type SurfaceStatus } from "./SurfaceState";
import "../../styles.css";
import "./product-shell.css";
function ComponentLab() {
  const [state, setState] = useState<SurfaceStatus>("empty");
  const [source, setSource] = useState<SourceState>("unknown");
  const [recovery, setRecovery] = useState(false);
  return <main className="ps-component-lab">
    <header><p className="date-line">S02 · laboratorio locale · dati sintetici</p><h1>Una grammatica per lavorare.</h1><p>Componenti reali, stati espliciti, una sola autorità per i dati. Questa pagina è una prova di sviluppo e non è inclusa nel build pubblico.</p></header>
    <nav aria-label="Viste del prodotto"><a href="/?view=today&edition=fluidi">Oggi</a><a href="/?view=classroom&edition=fluidi">Lezione ed esperimento</a><a href="/?view=work&edition=fluidi">Lavoro e quaderno</a></nav>
    <section><h2>Stato e recupero</h2><p>Simulazione locale: il recupero qui cambia solo lo stato della dimostrazione. Nel prodotto l’azione appartiene alla feature che interroga il Core.</p><label>Stato della superficie<select value={state} onChange={event => {setState(event.target.value as SurfaceStatus);setRecovery(false);}}>{["loading","empty","error","offline","pending","stale","revoked"].map(value => <option key={value}>{value}</option>)}</select></label><SurfaceState state={state} action={{label:"Prova il recupero locale",onClick:()=>{setState("empty");setRecovery(true);}}} />{recovery && <p role="status">Recupero dimostrativo eseguito. Nessun salvataggio sul server.</p>}</section>
    <section><h2>La fonte ha una versione.</h2><label>Stato fornito dal consumer<select value={source} onChange={event => setSource(event.target.value as SourceState)}>{["current","historical","stale","revoked","unknown"].map(value => <option key={value}>{value}</option>)}</select></label><SourceStatus state={source} revision="revisione-sintetica-01" /><p>Lo stato non viene dedotto dal fatto che un documento sia ancora visibile nella cache.</p></section>
    <section><h2>Un’idea rimane leggibile.</h2><p className="ps-formula">Q / Q₀ = (r / r₀)⁴</p><p>Formula tipografica di prova: il modello e la valutazione rimangono nel Core. Il layout accetta testo lungo, versioni e formule senza ridurre i controlli touch.</p><button onClick={() => window.location.assign('/?view=classroom&edition=fluidi')}>Apri l’esperimento esistente</button></section>
  </main>;
}
createRoot(document.getElementById("root")!).render(<ComponentLab />);
