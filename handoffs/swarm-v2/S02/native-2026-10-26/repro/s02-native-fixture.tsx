import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ProductShell } from "./ProductShell";
import { legacyViews, type View } from "./navigation";
import "../../styles.css";
function Fixture() {
  const [view, setView] = useState<View>("today");
  const [memory, setMemory] = useState(true);
  useEffect(() => {
    const update = (event: KeyboardEvent) => { if (event.key === "F8") { event.preventDefault(); setMemory(value => !value); } };
    document.addEventListener("keydown", update);
    return () => document.removeEventListener("keydown", update);
  }, []);
  return <ProductShell me={{id:"s02-native-fixture",role:"student",synthetic:true}} view={view} onView={setView} onLogout={() => {}}
    enabledViews={memory ? [...legacyViews,"memory"] : legacyViews}>
    <h1>Fixture tecnica S02 · dati sintetici</h1>
    <p>Solo verifica del componente. F8 simula un aggiornamento delle route montate. Nessun salvataggio, API o consumer di dominio in questa fixture.</p>
    <p data-testid="fixture-view">{view}</p>
  </ProductShell>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
