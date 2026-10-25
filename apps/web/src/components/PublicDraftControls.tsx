import {useState} from "react";
import {erasePublicDraft, readPublicDraft, savePublicDraft} from "../publicDraft";
import type {PublicDrafts, PublicModel} from "../publicDraft";

export function PublicDraftControls<M extends PublicModel>({model, data}: {model: M; data: PublicDrafts[M]}) {
  const [status, setStatus] = useState(() => readPublicDraft(model) ? "Bozza locale riaperta. Il risultato resta nascosto fino al confronto." : "");
  return <div className="public-local-draft">
    <p>Bozza facoltativa, solo in questo browser: conserva parametri e previsione. Non crea un account, una consegna o una misura di apprendimento.</p>
    <button type="button" onClick={() => {
      const saved = savePublicDraft(model, data);
      setStatus(saved === "saved" ? "Bozza salvata solo in questo browser. Per aggiornare la copia, salva di nuovo." : saved === "invalid"
        ? "Per salvare la bozza usa una previsione numerica valida e i parametri disponibili."
        : "Il browser non consente il salvataggio. La previsione resta disponibile in questa pagina.");
    }}>Salva una bozza in questo browser</button>
    <button type="button" onClick={() => setStatus(erasePublicDraft(model)
      ? "Bozza locale cancellata. I valori aperti restano qui fino a quando lasci la pagina."
      : "Il browser non consente la cancellazione. Puoi gestire i dati dalle impostazioni del browser.")}>Cancella la bozza locale</button>
    {status && <p role="status">{status}</p>}
  </div>;
}
