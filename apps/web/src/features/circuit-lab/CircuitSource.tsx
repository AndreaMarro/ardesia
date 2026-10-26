import { useEffect, useState } from "react";
import { studyRequest, type StudyResource } from "../../api";
import { circuitSummary } from "./resourceSummary";

export function CircuitLabLink({ editionId, resource }: {
  editionId: string; resource?: Pick<StudyResource, "id" | "revisionId">;
}) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void studyRequest<{ frontendAvailable: boolean }>("/s19/availability", undefined, { signal: controller.signal })
      .then((value) => { if (!controller.signal.aborted) setAvailable(value?.frontendAvailable === true); })
      .catch(() => { if (!controller.signal.aborted) setAvailable(false); });
    return () => controller.abort();
  }, []);
  const query = new URLSearchParams({ edition: editionId });
  if (resource) { query.set("resource", resource.id); query.set("revision", resource.revisionId); }
  return available
    ? <a className="button-secondary" href={`/s19/circuit-lab/?${query}`}>{resource ? "Apri questa revisione nel laboratorio" : "Apri laboratorio circuiti DC"}</a>
    : <p className="fine-print">Il laboratorio circuiti non è disponibile in questo ambiente.</p>;
}

export function CircuitSource({ resource }: { resource: StudyResource }) {
  const source = circuitSummary(resource);
  if (!source) return <p role="alert">Il circuito non è leggibile in questa revisione. Il riferimento non viene sostituito.</p>;
  return <article aria-label="Circuito DC salvato">
    <h3>Circuito DC · {source.quantity === "voltage" ? "tensione" : "corrente"} su {source.target}</h3>
    <p>Input della revisione esatta. I risultati sono ricalcolati nel laboratorio, con i limiti del motore dichiarati.</p>
    <table><caption>Componenti e versi dichiarati</caption><thead><tr><th>Componente</th><th>Da</th><th>A</th><th>Valore SI</th></tr></thead>
      <tbody>{source.components.map((c, i) => <tr key={i}><th>{c.id}</th><td>{c.a}</td><td>{c.b}</td><td>{c.value} {c.kind === "R" ? "Ω" : c.kind === "V" ? "V" : "A"}</td></tr>)}</tbody>
    </table>
    <p><strong>Previsione:</strong> {source.prediction || "Non formulata"}</p>
    {source.notes && <blockquote>{source.notes}</blockquote>}
    <CircuitLabLink editionId={resource.editionId} resource={resource} />
  </article>;
}
