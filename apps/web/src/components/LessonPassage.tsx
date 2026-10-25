import { useEffect, useRef, useState } from "react";
import { describeError, requestKey, studyRequest, type StudyResource } from "../api";
import { ErrorNotice, Loading } from "./Feedback";
import { readLessonPassage, readPassageDescriptor } from "./lessonPassageReference";
import {openLessonStudioBridge} from "./lessonStudioBridge";
import {validateRoomId} from "../../../studio/src/store/roomPaths";
import {readResourceDraft, writeResourceDraft} from "./sessionDraftCache";

export function LessonPassageAuthoring({ editionId, onUpdate }: {
  editionId: string; onUpdate: () => Promise<void>;
}) {
  const [descriptorText, setDescriptorText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [bridgeMessage, setBridgeMessage] = useState("");
  const bridge = useRef<{dispose: () => void} | null>(null);
  useEffect(() => () => bridge.current?.dispose(), []);
  const pending = useRef<{ key: string; text: string } | null>(null);
  const descriptor = readPassageDescriptor(descriptorText);
  function openStudio() {
    bridge.current?.dispose();
    const key = JSON.stringify(["studio-room", editionId]);
    let room = readResourceDraft(key)?.text || "aula-" + editionId;
    try {validateRoomId(room);} catch {room = "aula-" + crypto.randomUUID();}
    writeResourceDraft(key, {text: room, key: requestKey()});
    bridge.current = openLessonStudioBridge({room,
      onPassage: value => {
        if (pending.current) return;
        setDescriptorText(JSON.stringify(value));
        setBridgeMessage("Passaggio ricevuto dalla lavagna. Scrivi la spiegazione e conferma la condivisione con il gruppo.");
      },
      onState: state => setBridgeMessage({waiting: "La lavagna si sta aprendo…", connected: "Lavagna collegata. Registra e scegli “Invia passaggio all’Aula”.",
        closed: "La lavagna è stata chiusa. Il passaggio ricevuto resta in bozza qui.", blocked: "Il browser ha bloccato la nuova finestra. Consenti l’apertura della lavagna e riprova."}[state]),
    });
  }
  async function share() {
    if (busy || !descriptor || !transcript.trim()) return;
    const attempt = pending.current ?? {
      key: requestKey(),
      text: JSON.stringify({ schema: "ardesia.lesson-passage-source.v1", descriptor, transcript: transcript.trim() }),
    };
    pending.current = attempt;
    setBusy(true); setError(""); setMessage("");
    try {
      await studyRequest("/resources", { editionId, kind: "lesson-passage", visibility: "group", text: attempt.text },
        { headers: { "Idempotency-Key": attempt.key } });
      pending.current = null;
      setDescriptorText(""); setTranscript("");
      setMessage("Passaggio condiviso con il gruppo nella sua versione salvata.");
      try { await onUpdate(); }
      catch { setMessage("Passaggio condiviso. Aggiorna il corso per rileggerlo."); }
    } catch (failure) { setError(describeError(failure, "Condivisione non confermata. Riprova lo stesso passaggio.")); }
    finally { setBusy(false); }
  }
  return <section className="lesson-passage-authoring" aria-labelledby="passage-authoring-title">
    <h3 id="passage-authoring-title">Collega la spiegazione della lezione</h3>
    <p>Apri la lavagna, annota il vincolo e registra la spiegazione. Riporta il passaggio nell’Aula e scegli cosa condividere con questo gruppo.</p>
    <button type="button" disabled={busy || Boolean(pending.current)} onClick={openStudio}>Apri la lavagna</button>
    <p role="status">{bridgeMessage}</p>
    <details><summary>Usa un riferimento copiato</summary><label>Riferimento copiato dalla lavagna
      <textarea rows={4} value={descriptorText} disabled={busy || Boolean(pending.current)} maxLength={12000}
        onChange={e => { setDescriptorText(e.target.value); setError(""); }} />
    </label></details>
    {descriptorText && !descriptor && <p role="status">Il riferimento non è valido: servono sessione, registrazione, oggetto, tempi e collegamento coerenti.</p>}
    <label>Trascrizione e spiegazione del passaggio
      <textarea rows={4} maxLength={8000} value={transcript} disabled={busy || Boolean(pending.current)}
        onChange={e => setTranscript(e.target.value)} />
    </label>
    {descriptor && <div className="entry-explanation">
      <strong>{descriptor.objectRefs.map(ref => ref.label).join(" · ")}</strong>
      <p>Segmento di {((descriptor.endEpoch - descriptor.startEpoch) / 1000).toLocaleString("it-IT")} secondi. La trascrizione resta leggibile anche se l’audio locale non è disponibile.</p>
      <p className="fine-print">Il riferimento dichiara un collegamento alla lavagna locale; la disponibilità dei byte sarà verificata dal replay. Questo gesto condivide la fonte, senza attestare una revisione scientifica.</p>
    </div>}
    <button className="button-primary" disabled={busy || !descriptor || !transcript.trim()} onClick={() => void share()}>
      {busy ? "Condivisione…" : "Condividi passaggio con il gruppo"}
    </button>
    {error && <ErrorNotice message={error} />}
    <p role="status">{message}</p>
  </section>;
}

export function LessonPassageRecovery({ reference }: {reference: {resourceId: string; revisionId: string}}) {
  const [source, setSource] = useState<StudyResource | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setSource(null); setError("");
    void studyRequest<StudyResource>(`/resources/${encodeURIComponent(reference.resourceId)}/revisions/${encodeURIComponent(reference.revisionId)}`,
      undefined, {signal: controller.signal}).then(value => {
        if (!active) return;
        if (value.id !== reference.resourceId || value.revisionId !== reference.revisionId || !readLessonPassage(value))
          throw new Error("invalid_lesson_passage");
        setSource(value);
      }).catch(failure => { if (active) setError(describeError(failure, "Il passaggio collegato non è disponibile. Non è stato sostituito con un’altra fonte.")); });
    return () => { active = false; controller.abort(); };
  }, [reference.resourceId, reference.revisionId]);
  if (error) return <ErrorNotice message={error} />;
  if (!source) return <Loading>Apro la versione collegata…</Loading>;
  const passage = readLessonPassage(source)!;
  return <div className="entry-explanation lesson-passage-recovery">
    <h4>Il passaggio del tutor</h4>
    <blockquote>{passage.transcript}</blockquote>
    <p>{passage.descriptor.objectRefs.map(ref => ref.label).join(" · ")}</p>
    <a className="button-primary" href={passage.descriptor.replayUrl} target="_blank" rel="noopener noreferrer">Torna al passaggio nella lavagna</a>
    <p className="fine-print">Si apre la lavagna locale in una nuova scheda. Occorrono lo stesso browser e lo spazio locale che conserva la lezione; il collegamento non trasferisce l’audio e non concede accesso.</p>
    <details><summary>Fonte e passaggio collegati</summary>
      <dl><dt>Fonte e revisione</dt><dd>{source.id} · {source.revisionId}</dd>
        <dt>Spazio / lezione / sessione</dt><dd>{passage.descriptor.workspaceId} / {passage.descriptor.lessonId} / {passage.descriptor.sessionId}</dd>
        <dt>Registrazione / intervallo</dt><dd>{passage.descriptor.recordingId} / {passage.descriptor.startEpoch}–{passage.descriptor.endEpoch}</dd>
        <dt>Digest dichiarato dei byte audio</dt><dd>{passage.descriptor.sha256}</dd></dl>
    </details>
  </div>;
}
