import { existsSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EMBED_DATA_KEY } from "../toolhost/caps/board";
import {
  ELAB_BREADBOARD_POINT_COUNT,
  areBreadboardRefsContinuous,
  breadboardGeometry,
  generateBreadboardPoints,
  pointForBreadboardRef,
} from "../../sim/breadboard/simulationBreadboard";
import {
  ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
  ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
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
    expect(validateBookLayoutScene(drifted as never)).toEqual({
      ok: false,
      errors: [
        "layout drift led1",
        "pin target drift led1:anode",
        "wire drift wire-w2",
      ],
    });
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

    expect(html).toContain("Accendi il tuo primo LED");
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
