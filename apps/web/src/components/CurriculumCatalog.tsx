import { useEffect, useMemo, useState } from "react";
import { studyRequest } from "../api";
import { ErrorNotice, Loading } from "./Feedback";
import "./curriculum-catalog.css";

type Source = { title?: string; url?: string; scope?: string };
type Common = {
  id: string; title: string; subject: string; prerequisites: string[];
  learningObjectives: string[]; editorialStatus: string; scientificReview: string;
  solutionCount: number; gaps: string[];
};
type Programme = Common & {
  packId: string; packVersion: number; packSha256: string; scope: string;
  entryActivityId: string | null; activities: { id: string; title: string }[];
  exerciseCount: number; transferCount: number; creatable: true; rights: string; sources: Source[];
};
type Collection = Common & {
  bankId: string; bankVersion: number; bankSha256: string; academicYear: string | null;
  unitIds: string[]; microareas: string[]; topics: string[]; questionCount: number;
  familyCount: number; countsByDifficulty: Record<string, number>; countsByFormat: Record<string, number>;
  selection: { miniCourseId: string }; questionRefs: { id: string; version: number; contentSha256: string }[];
  creatable: false;
};
type Inventory = {
  programmes: Programme[]; collections: Collection[];
  sharedPrerequisites: { label: string; entryIds: string[] }[];
};
const subjects: Record<string, string> = { fisica: "Fisica", analisi: "Analisi matematica" };
const subjectLabel = (value: string) => subjects[value] ?? value;
const reviewLabel = (value: string) => value === "NOT_RUN" ? "Revisione umana da eseguire"
  : value === "NOT_ATTESTED" ? "Revisione umana da attestare" : value;

function TextList({ title, values }: { title: string; values: string[] }) {
  return values.length ? <div><h4>{title}</h4><ul>{values.map((value) => <li key={value}>{value}</li>)}</ul></div> : null;
}

function ProgrammeCard({ item, onOpen }: { item: Programme; onOpen?: () => void }) {
  return <article className="curriculum-card" aria-label={item.title}>
    <div className="curriculum-card-heading"><p className="section-meta">{subjectLabel(item.subject)} · Programma configurato</p><span className="curriculum-status">{item.editorialStatus}</span></div>
    <h3>{item.title}</h3><p>{item.scope}</p>
    <p className="curriculum-counts">{item.activities.length} attività · {item.exerciseCount} esercizi · {item.transferCount} problemi di trasferimento</p>
    <p className="fine-print">{reviewLabel(item.scientificReview)}. {item.solutionCount} soluzioni presenti. Le edizioni restano in modalità di test.</p>
    {onOpen && <button onClick={onOpen}>Apri edizione esistente</button>}
    <details><summary>Contenuti, riferimenti e lacune</summary>
      <TextList title="Obiettivi del modulo" values={item.learningObjectives} />
      <TextList title="Prerequisiti" values={item.prerequisites} />
      <TextList title="Attività collegate" values={item.activities.map((activity) => `${activity.title} · ${activity.id}`)} />
      <TextList title="Prima dell’erogazione" values={item.gaps} />
      <p className="fine-print">{item.rights}</p>
      {item.sources.length > 0 && <div><h4>Fonti dichiarate nel programma</h4><ul>{item.sources.map((source, index) => <li key={`${source.url ?? source.title}:${index}`}>
        {source.url && /^https?:\/\//i.test(source.url) ? <a href={source.url} target="_blank" rel="noreferrer">{source.title ?? source.scope ?? source.url}</a> : source.title ?? source.scope}
      </li>)}</ul></div>}
      <p className="fine-print">Identità del programma: <code>{item.packId} · v{item.packVersion}</code><br />SHA-256: <code>{item.packSha256}</code></p>
    </details>
  </article>;
}

function CollectionCard({ item }: { item: Collection }) {
  return <article className="curriculum-card curriculum-candidate" aria-label={item.title}>
    <div className="curriculum-card-heading"><p className="section-meta">{[subjectLabel(item.subject), item.academicYear, item.unitIds.join(", ")].filter(Boolean).join(" · ")}</p><span className="curriculum-status">{item.editorialStatus}</span></div>
    <h3>{item.title}</h3>
    <p className="curriculum-counts">{item.questionCount.toLocaleString("it-IT")} quesiti · {item.familyCount} famiglie · {item.solutionCount.toLocaleString("it-IT")} soluzioni</p>
    <p>Non è ancora un programma per un’edizione. È una selezione di contenuti da organizzare e revisionare.</p>
    <p className="fine-print">{reviewLabel(item.scientificReview)}. I quesiti delle raccolte possono sovrapporsi.</p>
    <details><summary>Contenuti, riferimenti e lacune</summary>
      <TextList title="Argomenti presenti" values={item.microareas} />
      <details className="curriculum-topics"><summary>Tutti i temi del materiale ({item.topics.length})</summary><TextList title="Temi" values={item.topics} /></details>
      <TextList title="Compiti cognitivi dichiarati" values={item.learningObjectives} />
      <TextList title="Prerequisiti" values={item.prerequisites} />
      <div><h4>Distribuzione dichiarata delle difficoltà</h4><p>{Object.entries(item.countsByDifficulty).map(([level, count]) => `${level}: ${count}`).join(" · ")}</p><p className="fine-print">La difficoltà dichiarata non è una calibrazione su studenti.</p></div>
      <TextList title="Da completare" values={item.gaps} />
      <div><h4>Riferimenti di esempio</h4><ul>{item.questionRefs.map((reference) => <li key={reference.id}><code>{reference.id}</code> · v{reference.version}<br /><span className="fine-print">SHA-256 contenuto: <code>{reference.contentSha256}</code></span></li>)}</ul></div>
      <p className="fine-print">Selezione riutilizzabile: <code>{item.selection.miniCourseId}</code><br />Banca: <code>{item.bankId} · v{item.bankVersion}</code><br />SHA-256: <code>{item.bankSha256}</code></p>
    </details>
  </article>;
}

export function CurriculumCatalog({ availableProgrammeIds = [], onOpenProgramme }: {
  availableProgrammeIds?: string[]; onOpenProgramme?: (packId: string, version: number) => void;
}) {
  const [open, setOpen] = useState(false), [inventory, setInventory] = useState<Inventory | null>(null);
  const [error, setError] = useState(""), [retry, setRetry] = useState(0);
  const [kind, setKind] = useState<"programmes" | "collections">("programmes"), [query, setQuery] = useState("");
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController(); let current = true;
    setError(""); setInventory(null);
    void studyRequest<{ inventory: Inventory }>("/admin/coursepacks?includeInventory=true", undefined, { signal: controller.signal }).then((result) => {
      if (!Array.isArray(result.inventory?.programmes) || !Array.isArray(result.inventory?.collections) || !Array.isArray(result.inventory?.sharedPrerequisites)) throw Error("invalid_inventory");
      if (current) setInventory(result.inventory);
    }).catch(() => { if (current) setError("Il catalogo non è disponibile. Puoi riprovare; le tue edizioni restano accessibili."); });
    return () => { current = false; controller.abort(); };
  }, [open, retry]);
  const visible = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase("it-IT").split(/\s+/).filter(Boolean);
    return (inventory?.[kind] ?? []).filter((item) => {
      const extra = "topics" in item ? [...item.topics, ...item.microareas] : [item.scope];
      const text = [item.title, subjectLabel(item.subject), ...item.prerequisites, ...item.learningObjectives, ...extra].join(" ").toLocaleLowerCase("it-IT");
      return terms.every((term) => text.includes(term));
    });
  }, [inventory, kind, query]);
  return <section className="curriculum-catalog" aria-label="Catalogo privato del docente">
    <div className="section-title"><div><p className="section-meta">Patrimonio didattico</p><h2>Le basi dei tuoi prossimi corsi.</h2></div><button aria-expanded={open} aria-controls="curriculum-content" onClick={() => setOpen((value) => !value)}>{open ? "Chiudi catalogo" : "Apri catalogo e copertura"}</button></div>
    <p>Programmi configurati, contenuti da organizzare e prerequisiti condivisi. Le bozze restano distinte dalle edizioni offerte.</p>
    {open && <div id="curriculum-content">
      {error ? <><ErrorNotice message={error} /><button onClick={() => setRetry((value) => value + 1)}>Riprova a leggere il catalogo</button></> : !inventory ? <Loading>Leggo programmi e materiali…</Loading> : <>
        <div className="curriculum-filters" aria-label="Tipo di materiale"><button aria-pressed={kind === "programmes"} onClick={() => setKind("programmes")}>Programmi configurati ({inventory.programmes.length})</button><button aria-pressed={kind === "collections"} onClick={() => setKind("collections")}>Raccolte da progettare ({inventory.collections.length})</button></div>
        <label>Cerca nel catalogo<input type="search" aria-label="Cerca nel catalogo" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Argomento, obiettivo o prerequisito" /></label>
        <p className="fine-print">Stato del materiale sorgente. Le decisioni scientifiche e di pubblicazione appartengono alla singola edizione. Le raccolte non vengono sommate come corsi o quesiti distinti.</p>
        <p role="status" className="curriculum-result-count">{visible.length ? `${visible.length} risultati nel catalogo` : "Nessun risultato. Prova un argomento o un prerequisito diverso."}</p>
        <div className="curriculum-grid">{visible.map((item) => "packId" in item ? <ProgrammeCard key={item.id} item={item} onOpen={availableProgrammeIds.includes(item.id) && onOpenProgramme ? () => onOpenProgramme(item.packId, item.packVersion) : undefined} /> : <CollectionCard key={item.id} item={item} />)}</div>
        {inventory.sharedPrerequisites.length > 0 && <details className="curriculum-prerequisites"><summary>Prerequisiti condivisi ({inventory.sharedPrerequisites.length})</summary><p className="fine-print">Etichette già presenti in più programmi o raccolte; non attestano che esistano moduli di recupero dedicati.</p><ul>{inventory.sharedPrerequisites.map((item) => <li key={item.label}>{item.label} <span className="fine-print">· {item.entryIds.length} riferimenti</span></li>)}</ul></details>}
      </>}
    </div>}
  </section>;
}
