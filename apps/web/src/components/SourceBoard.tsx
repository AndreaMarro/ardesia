import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type {
  PostitReference,
  StudyMe,
  StudyResource,
  Workspace,
} from "../api";
import { ErrorNotice } from "./Feedback";
import { SourceViewer } from "./SourceViewer";
import { SourceLibrary } from "./SourceLibrary";
import { useSourceBoard } from "./useSourceBoard";
import {
  BOARD_LIMIT,
  changeBounds,
  duplicateView,
  openSource,
  refreshReference,
  type PostitBounds,
  type StudyPostitView,
} from "./sourceBoardModel";
type Props = {
  me: StudyMe;
  data: Workspace;
  onUpdate: () => Promise<void>;
  onUse: (reference: PostitReference) => void;
};
export function SourceBoard({ me, data, onUpdate, onUse }: Props) {
  const board = useSourceBoard(data, onUpdate);
  const [mode, setMode] = useState<"reading" | "table">("reading");
  const [selected, setSelected] = useState<string | null>(
    board.views[0]?.instanceId ?? null,
  );
  const [discard, setDiscard] = useState(false);
  const active = board.views.find((view) => view.instanceId === selected);
  const canvasWidth = Math.max(
    1100,
    ...board.views.map((view) => view.bounds.x + view.bounds.width + 48),
  );
  const canvasHeight = Math.max(
    640,
    ...board.views.map((view) => view.bounds.y + view.bounds.height + 48),
  );
  function alter(id: string, patch: Partial<PostitBounds>) {
    board.change((views) =>
      views.map((view) =>
        view.instanceId === id ? changeBounds(view, patch) : view,
      ),
    );
  }
  function add(resource: StudyResource) {
    if (board.views.length >= BOARD_LIMIT) return;
    const view = openSource(resource, board.views.length);
    board.change((views) =>
      views.length < BOARD_LIMIT ? [...views, view] : views,
    );
    setSelected(view.instanceId);
  }
  function duplicate(view: StudyPostitView) {
    if (board.views.length >= BOARD_LIMIT) return;
    const copy = duplicateView(view);
    board.change((views) => [...views, copy]);
    setSelected(copy.instanceId);
  }
  function detach(view: StudyPostitView) {
    board.change((views) =>
      views.filter((item) => item.instanceId !== view.instanceId),
    );
    if (selected === view.instanceId) setSelected(null);
  }
  function refresh(view: StudyPostitView, resource: StudyResource) {
    board.change((views) =>
      views.map((item) =>
        item.instanceId === view.instanceId
          ? refreshReference(item, resource)
          : item,
      ),
    );
  }
  return (
    <section className="source-board" aria-labelledby="source-board-title">
      <header className="source-board-heading">
        <div>
          <p className="section-meta">Fonti e passaggi · {data.edition.id}</p>
          <h2 id="source-board-title">Il tavolo delle fonti.</h2>
          <p>
            Una fonte, più viste. La versione citata rimane riconoscibile in
            ogni disposizione.
          </p>
        </div>
        <nav className="board-lenses" aria-label="Rappresentazione delle fonti">
          <button
            aria-pressed={mode === "reading"}
            onClick={() => setMode("reading")}
          >
            Lettura
          </button>
          <button
            aria-pressed={mode === "table"}
            onClick={() => setMode("table")}
          >
            Tavolo
          </button>
        </nav>
      </header>
      <div className="board-savebar">
        <p role="status" data-testid="board-save-state">
          {board.busy
            ? "Salvataggio in corso…"
            : board.dirty
              ? "Modifiche alla disposizione non salvate."
              : board.notice ||
                (data.layoutSaved
                  ? "Disposizione ripresa dal server."
                  : "Apri una fonte per iniziare.")}
        </p>
        <span>
          {board.views.length} / {BOARD_LIMIT} viste
        </span>
        <button
          className="button-primary"
          onClick={() => void board.save()}
          disabled={
            !board.dirty ||
            board.busy ||
            board.conflict ||
            !board.versionAvailable
          }
        >
          {board.error ? "Riprova salvataggio" : "Salva disposizione"}
        </button>
      </div>
      {!board.versionAvailable && (
        <ErrorNotice
          message="La versione della disposizione non è disponibile. Ricarica il corso prima di salvare."
          onRetry={() => void onUpdate()}
        />
      )}
      {board.error && <ErrorNotice message={board.error} />}
      {board.conflict && (
        <div className="board-conflict" role="alert">
          <h3>Una disposizione più recente è sul server.</h3>
          <p>
            Le tue modifiche sono ancora qui. Puoi conservarle mentre controlli
            l’altra versione.
          </p>
          {discard ? (
            <>
              <p>
                Ricaricando perderai le modifiche alla disposizione non ancora
                salvate. Le fonti rimangono intatte.
              </p>
              <div className="button-row">
                <button
                  disabled={board.busy}
                  onClick={() => {
                    setDiscard(false);
                    void board.reloadServer();
                  }}
                >
                  Ricarica e scarta le modifiche locali
                </button>
                <button onClick={() => setDiscard(false)}>
                  Conserva le mie modifiche
                </button>
              </div>
            </>
          ) : (
            <button onClick={() => setDiscard(true)}>
              Ricarica disposizione del server
            </button>
          )}
        </div>
      )}
      <div className="source-board-layout">
        <SourceLibrary
          data={data}
          full={board.views.length >= BOARD_LIMIT}
          onOpen={add}
        />
        <div className="board-workspace">
          {mode === "table" && (
            <p className="board-instructions">
              Trascina l’intestazione o usa le frecce quando è a fuoco. Maiusc +
              frecce ridimensiona. Le misure precise sono sotto il tavolo.
            </p>
          )}
          {!board.views.length ? (
            <div className="board-empty">
              <span aria-hidden="true">↗</span>
              <h3>
                {data.layoutSaved
                  ? "Le viste sono staccate. Le fonti restano nella biblioteca."
                  : "Un tavolo da comporre."}
              </h3>
              <p>
                Apri una fonte, affiancane un’altra e scegli il passaggio da cui
                ripartire.
              </p>
            </div>
          ) : (
            <div
              className={"board-viewport board-" + mode}
              role="region"
              aria-label={
                mode === "table" ? "Tavolo delle fonti" : "Lettura delle fonti"
              }
            >
              <div
                className="board-surface"
                style={
                  mode === "table"
                    ? { width: canvasWidth, height: canvasHeight }
                    : undefined
                }
              >
                {board.views.map((view, index) => (
                  <BoardView
                    key={view.instanceId}
                    view={view}
                    index={index}
                    mode={mode}
                    active={view.instanceId === selected}
                    head={data.resources.find(
                      (resource) => resource.id === view.pluginState.resourceId,
                    )}
                    allowUse={me.role === "student"}
                    canDuplicate={board.views.length < BOARD_LIMIT}
                    onSelect={() => setSelected(view.instanceId)}
                    onBounds={(patch) => alter(view.instanceId, patch)}
                    onDuplicate={() => duplicate(view)}
                    onDetach={() => detach(view)}
                    onRefresh={(resource) => refresh(view, resource)}
                    onUse={onUse}
                  />
                ))}
              </div>
            </div>
          )}
          {active && (
            <BoardInspector
              view={active}
              onBounds={(patch) => alter(active.instanceId, patch)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
function BoardView({
  view,
  index,
  mode,
  active,
  head,
  allowUse,
  canDuplicate,
  onSelect,
  onBounds,
  onDuplicate,
  onDetach,
  onRefresh,
  onUse,
}: {
  view: StudyPostitView;
  index: number;
  mode: "reading" | "table";
  active: boolean;
  head?: StudyResource;
  allowUse: boolean;
  canDuplicate: boolean;
  onSelect: () => void;
  onBounds: (patch: Partial<PostitBounds>) => void;
  onDuplicate: () => void;
  onDetach: () => void;
  onRefresh: (resource: StudyResource) => void;
  onUse: (reference: PostitReference) => void;
}) {
  const [loaded, setLoaded] = useState<StudyResource | null>(null);
  useEffect(
    () => setLoaded(null),
    [view.pluginState.resourceId, view.pluginState.revisionId],
  );
  const gesture = useRef<{
    pointerId: number;
    x: number;
    y: number;
    bounds: PostitBounds;
    resize: boolean;
  } | null>(null);
  const updated = Boolean(
    head && head.revisionId !== view.pluginState.revisionId,
  );
  const coherent =
    loaded?.id === view.pluginState.resourceId &&
    loaded.revisionId === view.pluginState.revisionId &&
    loaded.contextId === view.pluginState.contextId;
  const current = coherent && head?.revisionId === view.pluginState.revisionId;
  function start(event: PointerEvent<HTMLButtonElement>, resize: boolean) {
    if (mode !== "table" || event.button !== 0) return;
    onSelect();
    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      bounds: { ...view.bounds },
      resize,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const from = gesture.current;
    if (!from || from.pointerId !== event.pointerId) return;
    const x = Math.round((event.clientX - from.x) / 8) * 8,
      y = Math.round((event.clientY - from.y) / 8) * 8;
    onBounds(
      from.resize
        ? { width: from.bounds.width + x, height: from.bounds.height + y }
        : { x: from.bounds.x + x, y: from.bounds.y + y },
    );
  }
  function stop(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, resize = false) {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    onSelect();
    const dx =
        event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" ? 16 : 0,
      dy = event.key === "ArrowUp" ? -16 : event.key === "ArrowDown" ? 16 : 0;
    onBounds(
      event.shiftKey || resize
        ? { width: view.bounds.width + dx, height: view.bounds.height + dy }
        : { x: view.bounds.x + dx, y: view.bounds.y + dy },
    );
  }
  const pointerEvents = {
    onPointerMove: move,
    onPointerUp: stop,
    onPointerCancel: stop,
  };
  return (
    <article
      className={"source-board-view" + (active ? " is-active" : "")}
      data-instance-id={view.instanceId}
      aria-label={`Vista della fonte ${index + 1}`}
      onFocusCapture={onSelect}
      style={
        mode === "table"
          ? {
              left: view.bounds.x,
              top: view.bounds.y,
              width: view.bounds.width,
              height: view.bounds.height,
              zIndex: active ? 100 : view.zIndex,
            }
          : undefined
      }
    >
      <header>
        <button
          className="board-view-handle"
          onClick={onSelect}
          onPointerDown={(event) => start(event, false)}
          onKeyDown={(event) => keyboard(event)}
          {...pointerEvents}
          title="Sposta la vista con le frecce. Maiusc + frecce ridimensiona."
        >
          <span aria-hidden="true">⠿</span>
          <span>Fonte {String(index + 1).padStart(2, "0")}</span>{" "}
          <small>rev. {view.pluginState.revisionId.slice(0, 8)}</small>
        </button>
        <button
          className="board-detach"
          onClick={onDetach}
          aria-label={`Stacca vista ${index + 1}`}
          title="Stacca questa vista. La fonte resta nella biblioteca."
        >
          ×
        </button>
      </header>
      <div className="board-view-content">
        {updated && (
          <div className="board-revision">
            <p>
              Esiste una versione più recente. Questa vista conserva l’originale
              citato.
            </p>
            <button onClick={() => head && onRefresh(head)}>
              Aggiorna questa vista
            </button>
          </div>
        )}
        <SourceViewer reference={view.pluginState} onLoaded={setLoaded} />
        {loaded && !coherent && (
          <p className="source-warning" role="alert">
            Il contesto della vista non coincide con la fonte. Riaprila dalla
            biblioteca.
          </p>
        )}
      </div>
      <footer>
        <button
          disabled={!canDuplicate}
          onClick={onDuplicate}
          aria-label={`Altra vista: fonte ${index + 1}`}
        >
          Altra vista
        </button>
        {allowUse && (
          <button
            disabled={!current}
            onClick={() => onUse(view.pluginState)}
            title={
              updated
                ? "Aggiorna questa vista prima di collegarla alla consegna."
                : undefined
            }
          >
            Usa nella consegna
          </button>
        )}
        {mode === "table" && (
          <button
            className="board-resize"
            aria-label={`Ridimensiona vista ${index + 1}`}
            onPointerDown={(event) => start(event, true)}
            onKeyDown={(event) => keyboard(event, true)}
            {...pointerEvents}
          >
            <span aria-hidden="true">↘</span>
          </button>
        )}
      </footer>
    </article>
  );
}
function BoardInspector({
  view,
  onBounds,
}: {
  view: StudyPostitView;
  onBounds: (patch: Partial<PostitBounds>) => void;
}) {
  return (
    <details className="board-inspector">
      <summary>Posizione e dimensioni della vista selezionata</summary>
      <div className="board-measures">
        {(
          [
            ["x", "Orizzontale", 0, 8192],
            ["y", "Verticale", 0, 8192],
            ["width", "Larghezza", 280, 960],
            ["height", "Altezza", 220, 900],
          ] as const
        ).map(([key, label, min, max]) => (
          <label key={key}>
            {label}
            <span>
              <input
                type="number"
                min={min}
                max={max}
                step={8}
                value={view.bounds[key]}
                onChange={(event) => {
                  const number = Number(event.target.value);
                  if (event.target.value && Number.isFinite(number))
                    onBounds({ [key]: number });
                }}
                aria-label={`${label} della vista selezionata`}
              />
              px
            </span>
          </label>
        ))}
      </div>
      <p className="fine-print">
        Muovere o ridimensionare cambia questa vista. La fonte e le altre viste
        rimangono intatte.
      </p>
    </details>
  );
}
