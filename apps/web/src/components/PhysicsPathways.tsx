import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";

type Coverage = {
  questionCount: number; familyCount: number; unitIds: string[]; prerequisites: string[];
  learningObjectives: string[]; microareas: string[]; countsByAuthoringStatus: Record<string, number>;
  editorialStatus: string; scientificReview: string; gaps: string[]; creatable: false;
};
type Unit = Coverage & { id: string; title: string; collectionIds: string[] };
type Pathway = Coverage & { id: string; title: string; units: Unit[] };
export type Pathways = {
  id: string; version: number; sha256: string;
  bankRef: { bankId: string; bankVersion: number; bankSha256: string };
  items: Pathway[]; coverage: Coverage; transversalCollectionIds: string[];
};
type Selection = { path: string | null; unit: string | null; version: string | null; sha: string | null };
const readSelection = (): Selection => {
  const p = new URLSearchParams(location.search);
  return { path: p.get("pathway"), unit: p.get("unit"), version: p.get("catalogVersion"), sha: p.get("catalogSha") };
};
export const hasPathwayLink = () => new URLSearchParams(location.search).get("catalog") === "pathways";

function Metadata({ item }: { item: Coverage }) {
  return <>
    <p className="curriculum-counts">{item.questionCount.toLocaleString("it-IT")} quesiti · {item.familyCount} famiglie</p>
    <p>Stato autoriale: {Object.entries(item.countsByAuthoringStatus).map(([state, count]) => `${state}: ${count.toLocaleString("it-IT")}`).join(" · ") || "non documentato"}. Revisione umana da attestare.</p>
    <details><summary>Obiettivi dichiarati nei quesiti ({item.learningObjectives.length})</summary><ul>{item.learningObjectives.map(text => <li key={text}>{text}</li>)}</ul></details>
    <h4>Prerequisiti dichiarati</h4>{item.prerequisites.length ? <ul>{item.prerequisites.map(text => <li key={text}>{text}</li>)}</ul> : <p>Non documentati.</p>}
    <h4>Copertura osservata</h4><p>{item.microareas.join(" · ") || "Non documentata"}</p>
    <h4>Prima dell’erogazione</h4><ul>{item.gaps.map(text => <li key={text}>{text}</li>)}</ul>
  </>;
}

export function PhysicsPathways({ data, unavailable, renderCollection }: {
  data: Pathways | null; unavailable?: string | null; renderCollection: (id: string) => React.ReactNode;
}) {
  const [selection, setSelection] = useState(readSelection);
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(selection);
  // The route must be subscribed as soon as its heading is committed. A passive
  // effect can miss a popstate between that commit and effect registration.
  useLayoutEffect(() => {
    const pop = () => setSelection(readSelection());
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (previous.current !== selection) heading.current?.focus();
    previous.current = selection;
  }, [selection]);
  function destination(path?: string, unit?: string) {
    const url = new URL(location.href);
    for (const key of ["pathway", "unit", "catalogVersion", "catalogSha"]) url.searchParams.delete(key);
    url.searchParams.set("catalog", "pathways");
    if (path && data) {
      url.searchParams.set("pathway", path); url.searchParams.set("catalogVersion", String(data.version));
      url.searchParams.set("catalogSha", data.sha256);
      if (unit) url.searchParams.set("unit", unit);
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); history.pushState(null, "", event.currentTarget.href); setSelection(readSelection());
  }
  if (!data) return <div role="status"><h3>Percorsi non disponibili</h3><p>La composizione non è leggibile o i riferimenti al materiale sono cambiati. Programmi e raccolte restano consultabili.</p><code>{unavailable ?? "curriculum_pathways_unavailable"}</code></div>;
  const path = data.items.find(p => p.id === selection.path);
  const unit = path?.units.find(u => u.id === selection.unit);
  const stale = selection.path && (selection.version !== String(data.version) || selection.sha !== data.sha256);
  const invalid = stale || (selection.path && !path) || (selection.unit && !unit);
  return <div className="physics-pathways">
    <nav className="pathway-breadcrumb" aria-label="Posizione nel catalogo">
      <a href={destination()} onClick={navigate}>Tutti i percorsi</a>
      {path && <><span aria-hidden="true"> / </span><a href={destination(path.id)} onClick={navigate}>{path.title}</a></>}
      {unit && <span aria-current="page"> / {unit.id} · {unit.title}</span>}
    </nav>
    <h3 ref={heading} tabIndex={-1}>{invalid ? "Riferimento non disponibile" : unit ? `${unit.id} · ${unit.title}` : path?.title ?? `${data.items.length} percorsi, una banca canonica`}</h3>
    {invalid ? <p role="status">Il riferimento è sconosciuto o appartiene a una composizione precedente. Torna all’indice per scegliere il materiale corrente.</p> : <>
      <p className="fine-print">Composizione editoriale iniziale. Un percorso non stabilisce incontri o calendario e non è un CoursePack erogabile. La pubblicazione dipende da edizione, quesito e revisione.</p>
      {!path ? <>
        <p className="curriculum-counts">{data.coverage.questionCount.toLocaleString("it-IT")} quesiti distinti · {data.coverage.familyCount} famiglie · {data.coverage.unitIds.join("–")}</p>
        <div className="curriculum-grid">{data.items.map(item => <article key={item.id} className="curriculum-card" aria-label={item.title}>
          <div className="curriculum-card-heading"><p className="section-meta">Percorso composto · {item.unitIds.join(" + ")}</p><span className="curriculum-status">{item.editorialStatus}</span></div>
          <h4><a href={destination(item.id)} onClick={navigate}>{item.title}</a></h4>
          <p className="curriculum-counts">{item.questionCount.toLocaleString("it-IT")} quesiti · {item.familyCount} famiglie</p>
          <p>{item.units.length} unità canoniche. Sequenza e durata da deliberare.</p>
        </article>)}</div>
        <details><summary>Simulazioni trasversali</summary><p>Selezione sugli stessi quesiti, esclusa dal totale dei percorsi.</p>{data.transversalCollectionIds.map(renderCollection)}</details>
      </> : unit ? <>
        <Metadata item={unit} />
        <h4>Raccolte collegate</h4>{unit.collectionIds.length ? unit.collectionIds.map(renderCollection) : <p role="status">Nessuna raccolta collegata a questa unità.</p>}
      </> : <>
        <ul className="pathway-index">{path.units.map(item => <li key={item.id}><a href={destination(path.id, item.id)} onClick={navigate}>{item.id} · {item.title}</a><span>{item.questionCount.toLocaleString("it-IT")} quesiti · {item.familyCount} famiglie</span></li>)}</ul>
        <Metadata item={path} />
      </>}
    </>}
    <details className="pathway-identity"><summary>Identità e provenienza</summary><p><code>{data.id} · v{data.version}</code><br />SHA-256 composizione: <code>{data.sha256}</code><br /><code>{data.bankRef.bankId} · v{data.bankRef.bankVersion}</code><br />SHA-256 banca: <code>{data.bankRef.bankSha256}</code></p><p className="fine-print">Quantità e metadati derivati dai record verificati del Core. Completezza didattica e validazione scientifica non attestate.</p></details>
  </div>;
}
