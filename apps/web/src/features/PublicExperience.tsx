import {PhysicsLab} from "../components/PhysicsLab";

const courseIds = ["strumenti-meccanica", "fluidi-termodinamica", "elettricita-magnetismo", "onde-ottica-radiazioni"];
export function PublicExperience() {
  const requested = new URLSearchParams(location.search).get("percorso");
  const course = requested && courseIds.includes(requested) ? requested : "fluidi-termodinamica";
  const contact = "/?" + new URLSearchParams({percorso: course}) + "#contatto";
  return <div className="public-experience">
    <a className="skip-link" href="#esperimento">Vai all’esperimento</a>
    <header className="experience-header"><a className="wordmark" href="/">ardesia.</a><a href={contact}>Torna al percorso</a></header>
    <main id="esperimento" tabIndex={-1}>
      <div className="experience-heading"><p>Una lezione da provare</p><h1>Un tubo più largo.<br />Che cosa cambia?</h1><p>Prima un’idea, poi un esperimento. Cambia il raggio e scopri perché il vincolo conta.</p></div>
      <PhysicsLab publicPreview numericPrediction />
      <section className="experience-next"><div><h2>Riparti dal ragionamento.</h2><p>Questa esperienza esplora un modello di fluidi. Nel mini-corso il tutor riprende i passaggi con te e propone una prova diversa.</p></div><a className="button-primary" href={contact}>Chiedi disponibilità</a></section>
      <p className="experience-disclosure">Demo pubblica · nessun account richiesto. Il risultato numerico è un controllo del modello; non è un voto né una valutazione del tuo apprendimento. Contenuti in revisione scientifica.</p>
    </main>
    <footer><a href={contact}>Programma e informazioni sul percorso</a><span>Ardesia · uno spazio per capire.</span></footer>
  </div>;
}
