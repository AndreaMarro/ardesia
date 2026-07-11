// @vitest-environment jsdom
import { existsSync } from "node:fs";
import { join } from "node:path";

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";

import { EMBED_DATA_KEY } from "../toolhost/caps/board";
import {
  ELAB_BREADBOARD_POINT_COUNT,
  areBreadboardRefsContinuous,
  breadboardGeometry,
  generateBreadboardPoints,
  pointForBreadboardRef,
} from "../../sim/breadboard/simulationBreadboard";
import {
  ARDUINO_TOOLCHAIN_TOOL_ID,
  createArduinoToolchainEmbedElement,
  createElabTutorLinkedEmbedElement,
  ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
  ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
  ELABTUTOR_LINKED_TOOL_ID,
  ELAB_V1_FIRST_LED_EXPERIMENT_ID,
  REFERENCE_SIM_EMBED_ID,
  REFERENCE_SIM_LINK,
  REFERENCE_SIM_TOOL_ID,
  createReferenceSimulationScene,
  createToolEmbedElement,
  parseToolLink,
  renderToolCanvasEmbeddable,
  validateBookLayoutScene,
} from "../toolhost/ToolCanvasEmbeddable";
import {
  applyElabCanvasComponentAdd,
  applyElabCanvasConnectionAdd,
  applyElabCanvasLayoutChange,
  applyElabCanvasWireDelete,
  applyElabCanvasWireUpdate,
  elabCanvasComponentAddOperation,
  elabCanvasComponentForAdd,
  elabCanvasConnectionAddOperation,
  elabCanvasLayoutChangeOperation,
  elabCanvasNextComponentId,
  elabCanvasWireDeleteOperation,
  elabCanvasWireUpdateOperation,
  simulationSceneToElabCanvasState,
} from "../../sim/elab/elabCanvasAdapter";

afterEach(cleanup);

describe("ToolCanvasEmbeddable", () => {
  it("parses maestro-tool links into tool and embed identity", () => {
    expect(parseToolLink(REFERENCE_SIM_LINK)).toEqual({
      toolId: REFERENCE_SIM_TOOL_ID,
      embedId: REFERENCE_SIM_EMBED_ID,
    });
    expect(parseToolLink("https://example.test/not-a-tool")).toBeNull();
  });

  it("creates a full Excalidraw embeddable with own-embed metadata", () => {
    const element = createToolEmbedElement();
    const metadata = element.customData[EMBED_DATA_KEY] as {
      owner: string;
      state: {
        kind: "simulation-scene-v1";
        scene: ReturnType<typeof createReferenceSimulationScene>;
      };
    };
    const state = metadata.state;

    expect(element.type).toBe("embeddable");
    expect(element.link).toBe(REFERENCE_SIM_LINK);
    expect(element.width).toBeGreaterThan(0);
    expect(element.height).toBeGreaterThan(0);
    expect(metadata.owner).toBe(REFERENCE_SIM_TOOL_ID);
    expect(state.kind).toBe("simulation-scene-v1");
    expect(state.scene.experimentId).toBe(ELAB_V1_FIRST_LED_EXPERIMENT_ID);
    expect(state.scene.manual).toMatchObject({
      volume: 1,
      page: 29,
      label: "Vol.1 pag.29-31 - ESPERIMENTO",
    });
    expect(state.scene.provenance.status).toBe("draft");
    expect(state.scene.bookLayout).toMatchObject({
      v: 1,
      experimentId: ELAB_V1_FIRST_LED_EXPERIMENT_ID,
      volume: 1,
      page: 29,
      status: "draft",
      manualSource: {
        pdfPage: 29,
        figurePage: 30,
        crop: ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
        finalCrop: ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
      },
    });
    expect(existsSync(join(process.cwd(), "public", ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE.replace(/^\//, "")))).toBe(true);
    expect(existsSync(join(process.cwd(), "public", ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE.replace(/^\//, "")))).toBe(true);
    expect(state.scene.bookLayout.pins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ref: "r1:pin1",
          target: "bb1:bus-top-plus-9",
          targetKind: "breadboard-hole",
        }),
        expect.objectContaining({
          ref: "led1:anode",
          target: "bb1:f9",
          targetKind: "breadboard-hole",
        }),
      ]),
    );
    expect(validateBookLayoutScene(state.scene)).toEqual({ ok: true, errors: [] });
  });

  it("renderizza Arduino Toolchain come post-it autonomo e compila con provider reale browser-avr", async () => {
    const element = createArduinoToolchainEmbedElement();
    const persisted: unknown[] = [];
    const emitted: unknown[] = [];
    const view = renderToolCanvasEmbeddable(element, {
      persistEmbedState: (_embedId, state) => persisted.push(state),
      emitLessonEvent: (event) => emitted.push(event),
    });
    expect(view).not.toBeNull();

    const { container, getByText } = render(view!);
    expect(container.querySelector("[data-plugin-postit-kind='arduino-toolchain']")).not.toBeNull();
    expect(container.querySelector("[data-arduino-fqbn]")?.getAttribute("data-arduino-fqbn")).toBe("arduino:avr:nano:cpu=atmega328old");

    fireEvent.click(getByText("Compila"));

    await waitFor(() => {
      expect(container.querySelector("[data-arduino-compile-status]")?.getAttribute("data-arduino-compile-status")).toBe("success");
      expect(persisted.length).toBeGreaterThan(0);
      expect(emitted).toHaveLength(1);
    });
    const next = persisted.at(-1) as { artifact: { artifactFormat: string; sizeBytes: number } | null; diagnostics: { status: string } };
    expect(next.diagnostics.status).toBe("success");
    expect(next.artifact).toMatchObject({ artifactFormat: "intel-hex" });
    expect(next.artifact!.sizeBytes).toBeGreaterThan(0);
    expect(emitted[0]).toMatchObject({
      kind: "arduino.compile.completed",
      pluginId: ARDUINO_TOOLCHAIN_TOOL_ID,
      provider: "browser-avr",
      ok: true,
      artifactFormat: "intel-hex",
    });
  });

  it("renderizza ElabTutor come post-it collegato e invia un comando LessonOS grounded", () => {
    const element = createElabTutorLinkedEmbedElement();
    const emitted: unknown[] = [];
    const persisted: unknown[] = [];
    const view = renderToolCanvasEmbeddable(element, {
      persistEmbedState: (_embedId, state) => persisted.push(state),
      emitLessonEvent: (event) => emitted.push(event),
    });
    expect(view).not.toBeNull();

    const { container, getByRole } = render(view!);
    const postit = container.querySelector('[data-plugin-postit-kind="elabtutor"]');
    expect(postit).not.toBeNull();
    expect(postit?.getAttribute("data-elabtutor-simulation-instance")).toBe(REFERENCE_SIM_EMBED_ID);
    expect(postit?.getAttribute("data-elabtutor-toolchain-instance")).toBe("arduino-toolchain-postit");
    expect(container.textContent).toContain("simulation.scene.read");
    expect(container.textContent).toContain("arduino.compile");

    fireEvent.click(getByRole("button", { name: "Invia fix a Simulation" }));

    expect(persisted.at(-1)).toMatchObject({
      kind: "elabtutor-linked-v1",
      lastCommand: { targetInstanceId: REFERENCE_SIM_EMBED_ID, status: "issued" },
    });
    expect(emitted.at(-1)).toMatchObject({
      kind: "elabtutor.command.issued",
      pluginId: ELABTUTOR_LINKED_TOOL_ID,
      command: "simulation.command",
      targetInstanceId: REFERENCE_SIM_EMBED_ID,
      toolchainInstanceId: "arduino-toolchain-postit",
      grounded: true,
    });
  });

  it("keeps the ELABTutor breadboard topology electrically falsifiable", () => {
    const points = generateBreadboardPoints("bb1");
    const bottomMinus28 = pointForBreadboardRef("bb1:bus-bot-minus-28");

    expect(points).toHaveLength(ELAB_BREADBOARD_POINT_COUNT);
    expect(areBreadboardRefsContinuous("bb1:j2", "bb1:i2")).toBe(true);
    expect(areBreadboardRefsContinuous("bb1:f9", "bb1:e9")).toBe(false);
    expect(bottomMinus28).toMatchObject({
      kind: "rail",
      x: expect.any(Number),
      y: breadboardGeometry.railY["bus-bot-minus"],
    });
  });

  it("makes ELAB bookLayout pin, coordinate, relation, and wire drift falsifiable", () => {
    const scene = createReferenceSimulationScene();
    const drifted = {
      ...scene,
      pinAssignments: { ...scene.pinAssignments, "led1:anode": "bb1:f8" },
      connections: scene.connections.map((connection, index) =>
        index === 1 ? { ...connection, color: "blue" } : connection,
      ),
      layout: {
        ...scene.layout,
        led1: { ...scene.layout.led1, x: 320 },
      },
    };

    // Scena bridgata: wires bookLayout = wire-w1/wire-w2 (id fixture); nessuna
    // regola spaziale autorata dal libro, quindi nessun errore spatial.
    // Ricolorare una connessione crea DUE drift: il filo del libro non trova più
    // corrispondenza (wire drift) e la connessione ricolorata non è più dichiarata
    // dal libro (extra wire — parità numero cavi).
    expect(validateBookLayoutScene(drifted as never)).toEqual({
      ok: false,
      errors: [
        "layout drift led1",
        "pin target drift led1:anode",
        "wire drift wire-w2",
        "extra wire bat1:negative->bb1:a9",
      ],
    });
  });

  it("rifiuta un filo in più non previsto dal libro (numero cavi perfect)", () => {
    const scene = createReferenceSimulationScene();
    const withExtraWire = {
      ...scene,
      connections: [
        ...scene.connections,
        { from: "bb1:a1", to: "bb1:a2", color: "green", kind: "wire" as const },
      ],
    };
    const result = validateBookLayoutScene(withExtraWire as never);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("extra wire bb1:a1->bb1:a2");
  });

  it("rifiuta un componente in più non previsto dal libro (numero componenti perfect)", () => {
    const scene = createReferenceSimulationScene();
    const withExtraComponent = {
      ...scene,
      components: [...scene.components, { ...scene.components[0], id: "resistor-extra-1" }],
    };
    const result = validateBookLayoutScene(withExtraComponent as never);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("extra component resistor-extra-1");
  });

  it("verifica la curvatura del filo quando il libro la dichiara (curvatura cavi perfect)", () => {
    const scene = createReferenceSimulationScene();
    const firstWireId = scene.bookLayout.wires[0].id;
    const withBookCurvature = {
      ...scene,
      bookLayout: {
        ...scene.bookLayout,
        wires: scene.bookLayout.wires.map((wire, index) =>
          index === 0
            ? { ...wire, path: { kind: "polyline" as const, points: [{ x: 0, y: 0 }, { x: 50, y: 50 }] } }
            : wire,
        ),
      },
      // La connessione della scena non riproduce quella polyline → curvature drift.
    };
    const result = validateBookLayoutScene(withBookCurvature as never);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`wire curvature drift ${firstWireId}`);
  });

  it("blocks verified status until a reviewed manual crop is attached", () => {
    const scene = createReferenceSimulationScene();
    const verifiedWithoutCrop = {
      ...scene,
      bookLayout: {
        ...scene.bookLayout,
        status: "verified",
        manualSource: { ...scene.bookLayout.manualSource, crop: null, finalCrop: null },
      },
    };

    expect(validateBookLayoutScene(verifiedWithoutCrop as never)).toEqual({
      ok: false,
      errors: ["verified requires manual crop evidence", "verified requires final manual page evidence"],
    });
  });

  it("renders the Volume 1 reference simulation with real manual pages", () => {
    const element = createToolEmbedElement();
    const view = renderToolCanvasEmbeddable(element);
    expect(view).not.toBeNull();
    const html = renderToStaticMarkup(view);

    expect(html).toContain("Accendi il LED sulla breadboard");
    expect(html).toContain("Post-it interattivo");
    expect(html).not.toContain("Simulation Plugin Canvas");
    expect(html).toContain("simulation plugin: canvas ELABTutor core montato su SimulationScene canonica");
    expect(html).toContain('data-simulation-surface="elab-core-canvas"');
    expect(html).toContain('data-elab-core-canvas-mounted="true"');
    expect(html).toContain('data-elab-canvas-source-of-truth="simulation-scene"');
    expect(html).toContain('data-elab-canvas-build-mode="complete"');
    expect(html).toContain('data-elab-canvas-projection-mode="gia-montato"');
    expect(html).toContain("Proiezione tecnica scena");
    expect(html).toContain("Vol.1 pag.29-31 - ESPERIMENTO");
    expect(html).toContain("draft");
    // La scena bridgata non ha regole spaziali autorate dal libro (lista vuota onesta).
    expect(html).toContain("2 wire guard, 0 layout guard");
    expect(html).toContain("PDF p.29 - crop presente");
    expect(html).toContain("ON");
    // D4 gate-Andrea aperto: Vf red=1.8 dalla tabella engine (il manuale non
    // dichiara alcun valore in mA); (9-1.8)/470 = 15.3 mA. Se Andrea sceglie
    // Vf=2.0 cambia la tabella engine, non questa scena.
    expect(html).toContain("15.3 mA");
    expect(html).toContain('alt="Pagina reale del manuale ELAB Volume 1 pagina 30"');
    expect(html).toContain('alt="Pagina reale del manuale ELAB Volume 1 pagina 31 circuito montato"');
    expect(html).toContain('alt="Zoom reale sulla pagina passo passo del manuale ELAB Volume 1"');
    expect(html).toContain(">Mostra montato</button>");
    expect(html).toContain(">Reset</button>");
  });

  it("adatta SimulationScene canonica al canvas ELABTutor senza usare lo SVG come fonte dati", () => {
    const scene = createReferenceSimulationScene();
    const canvas = simulationSceneToElabCanvasState(scene);
    const breadboardState = canvas.componentStates.bb1 as { activeHoles?: Record<string, string> };
    const ledState = canvas.componentStates.led1 as { brightness?: number };

    expect(canvas.sourceOfTruth).toBe("simulation-scene");
    expect(canvas.projectionMode).toBe("gia-montato");
    expect(canvas.experiment).toMatchObject({
      id: scene.experimentId,
      title: scene.title,
      buildMode: "complete",
      pinAssignments: scene.pinAssignments,
    });
    expect(canvas.experiment.components.map((component) => component.id).sort()).toEqual(
      scene.components.map((component) => component.id).sort(),
    );
    expect(canvas.experiment.layout).toEqual(scene.layout);
    expect(canvas.experiment.layout).not.toBe(scene.layout);
    expect(canvas.experiment.connections[0]).toMatchObject({
      from: scene.connections[0].from,
      to: scene.connections[0].to,
      color: scene.connections[0].color,
    });
    expect(breadboardState.activeHoles?.["bus-top-plus-9"]).toBeDefined();
    expect(ledState.brightness).toBeGreaterThan(0);

    const sandboxCanvas = simulationSceneToElabCanvasState(scene, {
      projectionMode: "monta-tu",
    });
    expect(sandboxCanvas.projectionMode).toBe("monta-tu");
    expect(sandboxCanvas.experiment.buildMode).toBe("sandbox");
    expect(sandboxCanvas.experiment.pinAssignments).toEqual(scene.pinAssignments);
  });

  it("transposes persisted legacy free assembly state into the ELAB core canvas projection", () => {
    const scene = createReferenceSimulationScene();
    const element = createToolEmbedElement({
      state: {
        kind: "simulation-scene-v1",
        scene,
        montaggio: {
          placements: [
            { id: "r-libero-1", type: "resistor", holes: ["bb1:c3", "bb1:c4"] },
          ],
        },
      },
    });
    const view = renderToolCanvasEmbeddable(element);
    expect(view).not.toBeNull();
    const html = renderToStaticMarkup(view);

    expect(html).toContain('data-elab-canvas-build-mode="sandbox"');
    expect(html).toContain('data-elab-canvas-projection-mode="monta-tu"');
    expect(html).toContain(`data-elab-canvas-components="${scene.components.length + 1}"`);
  });

  it("converte eventi layout del canvas ELAB in operazioni SimulationOperation e patch scena", () => {
    const scene = createReferenceSimulationScene();
    const next = applyElabCanvasLayoutChange(scene, "led1", { x: 333, y: 222, rotation: 90 });
    const op = elabCanvasLayoutChangeOperation({
      id: "op-move-led1",
      componentId: "led1",
      pose: { x: 333, y: 222, rotation: 90 },
    });

    expect(scene.layout.led1).not.toEqual(next.layout.led1);
    expect(next.layout.led1).toMatchObject({ x: 333, y: 222, rotation: 90 });
    expect(op).toMatchObject({
      schema: "simulation-operation/1",
      actor: "manual",
      origin: "canvas",
      targetProvider: "local",
      providerMode: "static",
      operation: {
        kind: "move-component",
        componentId: "led1",
        pose: { x: 333, y: 222, rotation: 90 },
      },
    });
  });

  it("converte eventi wire del canvas ELAB in operazioni canoniche e patch scena", () => {
    const scene = createReferenceSimulationScene();
    const firstWire = scene.connections[0]!;
    const updated = applyElabCanvasWireUpdate(scene, 0, {
      ...firstWire,
      color: "red",
      waypoints: [
        { x: 11, y: 12 },
        { x: 77, y: 88 },
        { x: 44, y: 45 },
      ],
    });
    const updateOperation = elabCanvasWireUpdateOperation({
      id: "op-wire-update-0",
      scene,
      wireIndex: 0,
      connection: {
        ...firstWire,
        waypoints: [
          { x: 11, y: 12 },
          { x: 77, y: 88 },
          { x: 44, y: 45 },
        ],
      },
    });

    expect(updated.connections[0]?.path).toEqual({
      kind: "polyline",
      points: [
        { x: 11, y: 12 },
        { x: 77, y: 88 },
        { x: 44, y: 45 },
      ],
    });
    expect(updateOperation).toMatchObject({
      schema: "simulation-operation/1",
      actor: "manual",
      origin: "canvas",
      operation: {
        kind: "edit-wire",
        wireId: "wire-1",
        edit: {
          kind: "replace-path",
          path: {
            kind: "polyline",
            points: [
              { x: 11, y: 12 },
              { x: 77, y: 88 },
              { x: 44, y: 45 },
            ],
          },
        },
      },
    });

    const added = applyElabCanvasConnectionAdd(updated, {
      id: "wire-free-1",
      from: "bb1:j7",
      to: "bb1:f7",
      color: "green",
      waypoints: [
        { x: 120, y: 130 },
        { x: 120, y: 170 },
      ],
    });
    const addOperation = elabCanvasConnectionAddOperation({
      id: "op-wire-add",
      connection: {
        id: "wire-free-1",
        from: "bb1:j7",
        to: "bb1:f7",
        color: "green",
        waypoints: [
          { x: 120, y: 130 },
          { x: 120, y: 170 },
        ],
      },
    });

    expect(added.connections.at(-1)).toMatchObject({
      from: "bb1:j7",
      to: "bb1:f7",
      color: "green",
      kind: "wire",
      path: {
        kind: "polyline",
        points: [
          { x: 120, y: 130 },
          { x: 120, y: 170 },
        ],
      },
    });
    expect(addOperation.operation).toEqual({
      kind: "connect-wire",
      wire: {
        id: "wire-free-1",
        from: "bb1:j7",
        to: "bb1:f7",
        color: "green",
        path: {
          kind: "polyline",
          points: [
            { x: 120, y: 130 },
            { x: 120, y: 170 },
          ],
        },
      },
    });

    const deleted = applyElabCanvasWireDelete(added, added.connections.length - 1);
    const deleteOperation = elabCanvasWireDeleteOperation({
      id: "op-wire-delete",
      scene: added,
      wireIndex: added.connections.length - 1,
    });

    expect(deleted.connections).toHaveLength(updated.connections.length);
    expect(deleteOperation.operation).toEqual({
      kind: "delete",
      target: { kind: "wire", id: "wire-free-1" },
    });
    expect(scene.connections[0]?.path).not.toBe(updated.connections[0]?.path);
  });

  it("converte l'add componente del canvas ELAB in place-component e patch scena (P32 slice 2b)", () => {
    const scene = createReferenceSimulationScene();
    const componentId = elabCanvasNextComponentId(scene.components, "led");
    expect(componentId).toBe("led-libero-1");

    const component = elabCanvasComponentForAdd(componentId, "led");
    expect(component).toMatchObject({ id: "led-libero-1", type: "led", color: "red" });

    const next = applyElabCanvasComponentAdd(scene, component!, { x: 120, y: 96 });
    expect(next.components.at(-1)).toMatchObject({ id: "led-libero-1", type: "led" });
    expect(next.layout["led-libero-1"]).toEqual({ x: 120, y: 96 });
    // immutabilità: la scena originale non è toccata
    expect(scene.components.some((c) => c.id === "led-libero-1")).toBe(false);
    expect(scene.layout["led-libero-1"]).toBeUndefined();
    // componente flottante: pinAssignments INVARIATI (inerte finché non cablato)
    expect(next.pinAssignments).toEqual(scene.pinAssignments);

    // fisica onesta: il circuito del libro NON degrada per un componente flottante
    const projected = simulationSceneToElabCanvasState(next);
    expect(projected.diagnostics).toEqual([]);
    const bookLed = projected.componentStates.led1 as { brightness?: number };
    const freeLed = projected.componentStates["led-libero-1"] as { brightness?: number };
    expect(bookLed.brightness).toBeGreaterThan(0);
    expect(freeLed.brightness).toBe(0);

    const operation = elabCanvasComponentAddOperation({
      id: "op-component-add",
      component: { id: "led-libero-1", type: "led" },
      pose: { x: 120, y: 96 },
    });
    expect(operation).toMatchObject({
      schema: "simulation-operation/1",
      actor: "manual",
      origin: "canvas",
      targetProvider: "local",
      providerMode: "static",
    });
    expect(operation.operation).toEqual({
      kind: "place-component",
      component: { id: "led-libero-1", type: "led" },
      pose: { x: 120, y: 96 },
    });

    // id successivo: conta i -libero- esistenti e salta le collisioni
    expect(elabCanvasNextComponentId(next.components, "led")).toBe("led-libero-2");

    // duplicato: fail-soft, scena invariata
    const duplicated = applyElabCanvasComponentAdd(next, component!, { x: 10, y: 10 });
    expect(duplicated.components.filter((c) => c.id === "led-libero-1")).toHaveLength(1);
    expect(duplicated.layout["led-libero-1"]).toEqual({ x: 120, y: 96 });
  });

  it("nega i tipi non piazzabili dal canvas: battery9v (design multi-sorgente aperto), wire (D6: cavo=connection), breadboard-half, non catalogati", () => {
    expect(elabCanvasComponentForAdd("bat-libero-1", "battery9v")).toBeNull();
    expect(elabCanvasComponentForAdd("cavo-libero-1", "wire")).toBeNull();
    expect(elabCanvasComponentForAdd("bb-libero-1", "breadboard-half")).toBeNull();
    expect(elabCanvasComponentForAdd("x-libero-1", "buzzer")).toBeNull();
    expect(elabCanvasComponentForAdd("resistor-libero-1", "resistor")).toMatchObject({
      id: "resistor-libero-1",
      type: "resistor",
      value: 470,
    });
    expect(elabCanvasComponentForAdd("potentiometer-libero-1", "potentiometer")).toMatchObject({
      id: "potentiometer-libero-1",
      type: "potentiometer",
    });
  });

  it("monta nel post-it il canvas ELABTutor reale via renderEmbeddable", async () => {
    const element = createToolEmbedElement();
    const view = renderToolCanvasEmbeddable(element);
    expect(view).not.toBeNull();

    const { container } = render(view!);
    const mount = await waitFor(
      () => {
        const node = container.querySelector<HTMLElement>(
          '[data-elab-canvas-source-of-truth="simulation-scene"]',
        );
        expect(node).not.toBeNull();
        expect(node!.querySelector("[data-elab-core-canvas-host] svg")).not.toBeNull();
        return node!;
      },
      { timeout: 20000 },
    );
    expect(mount.getAttribute("data-elab-canvas-experiment-id")).toBe(ELAB_V1_FIRST_LED_EXPERIMENT_ID);
    expect(["pending", "true"]).toContain(mount.getAttribute("data-elab-core-canvas-mounted"));
  });

  it("host-observes-solve (G7): emette simulation.circuit.solved al solve del circuito reference", async () => {
    const emitted: { kind: string; currentMa?: number; experimentId?: string }[] = [];
    const scene = createReferenceSimulationScene();
    const element = createToolEmbedElement({ state: { kind: "simulation-scene-v1", scene } });
    const view = renderToolCanvasEmbeddable(element, { emitLessonEvent: (ev) => emitted.push(ev) });
    render(view!);
    await waitFor(
      () => expect(emitted.some((e) => e.kind === "simulation.circuit.solved")).toBe(true),
      { timeout: 8000 },
    );
    const solved = emitted.find((e) => e.kind === "simulation.circuit.solved");
    expect(solved?.currentMa).toBeCloseTo(15.3, 1);
  });

  it("host-observes-solve (G7): emette simulation.error.observed su circuito aperto (break→explain)", async () => {
    const emitted: { kind: string; conceptId?: string; labels?: Record<string, string> }[] = [];
    const scene = createReferenceSimulationScene();
    // Rompi il circuito: togli il filo del negativo → loop aperto, corrente 0.
    scene.connections = scene.connections.filter((connection) => connection.from !== "bat1:negative");
    const element = createToolEmbedElement({ state: { kind: "simulation-scene-v1", scene } });
    const view = renderToolCanvasEmbeddable(element, { emitLessonEvent: (ev) => emitted.push(ev) });
    render(view!);
    await waitFor(
      () => expect(emitted.some((e) => e.kind === "simulation.error.observed")).toBe(true),
      { timeout: 8000 },
    );
    const err = emitted.find((e) => e.kind === "simulation.error.observed");
    expect(err?.conceptId).toBe("circuito_chiuso");
  });

  it("GOLDEN: la corrente reference resta 15.3 mA ma deriva dal traversal del circuito", () => {
    // Discriminante anti-formula: resistore componente 220 Ohm con runtime
    // ancora a 470 → il traversal usa il componente ((9-1.8)/220 = 32.7 mA),
    // una formula pinnata sul runtime avrebbe risposto 15.3 mA.
    const scene = createReferenceSimulationScene();
    scene.components = scene.components.map((component) =>
      component.id === "r1" ? { ...component, value: 220 } : component,
    );
    const element = createToolEmbedElement({ state: { kind: "simulation-scene-v1", scene } });
    const html = renderToStaticMarkup(renderToolCanvasEmbeddable(element)!);
    expect(html).toContain("32.7 mA");
    expect(html).not.toContain("15.3 mA");
  });

  it("circuito aperto (filo negativo assente): corrente 0.0 mA anche con ledOn", () => {
    const scene = createReferenceSimulationScene();
    scene.connections = scene.connections.filter((connection) => connection.from !== "bat1:negative");
    const element = createToolEmbedElement({ state: { kind: "simulation-scene-v1", scene } });
    const html = renderToStaticMarkup(renderToolCanvasEmbeddable(element)!);
    expect(html).toContain("0.0 mA");
    expect(html).not.toContain("15.3 mA");
  });
});
