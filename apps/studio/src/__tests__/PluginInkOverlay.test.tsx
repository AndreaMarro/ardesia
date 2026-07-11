// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PluginInkOverlay,
  emptyPluginAnnotations,
  type PluginAnnotationDocument,
} from "../toolhost/PluginInkOverlay";
import {
  createArduinoToolchainEmbedElement,
  createElabTutorLinkedEmbedElement,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
} from "../toolhost/ToolCanvasEmbeddable";
import { InMemoryEventLog, type LessonOsEvent } from "../lessonos/eventlog";

afterEach(cleanup);

function renderOverlay(value: PluginAnnotationDocument = emptyPluginAnnotations()) {
  const onChange = vi.fn<(next: PluginAnnotationDocument) => void>();
  const emitLessonEvent = vi.fn<(event: LessonOsEvent) => void>();
  const rendered = render(
    <PluginInkOverlay
      instanceId="sim-a"
      pluginId="io.ardesia.simulation"
      value={value}
      onChange={onChange}
      emitLessonEvent={emitLessonEvent}
    >
      <div style={{ width: 200, height: 100 }}>Runtime live</div>
    </PluginInkOverlay>,
  );
  const stage = screen.getByTestId("plugin-ink-stage");
  vi.spyOn(stage, "getBoundingClientRect").mockReturnValue({
    x: 10,
    y: 20,
    left: 10,
    top: 20,
    right: 210,
    bottom: 120,
    width: 200,
    height: 100,
    toJSON: () => ({}),
  });
  return { ...rendered, stage, onChange, emitLessonEvent };
}

describe("PluginInkOverlay", () => {
  it("stores pen strokes in post-it-local normalized coordinates and emits a typed mutation", async () => {
    const { stage, onChange, emitLessonEvent } = renderOverlay();
    fireEvent.click(screen.getByRole("button", { name: "Penna" }));
    fireEvent.pointerDown(stage, { pointerId: 4, pointerType: "pen", clientX: 20, clientY: 30 });
    fireEvent.pointerMove(stage, { pointerId: 4, pointerType: "pen", clientX: 110, clientY: 70 });
    fireEvent.pointerUp(stage, { pointerId: 4, pointerType: "pen", clientX: 210, clientY: 120 });

    const next = onChange.mock.calls.at(-1)?.[0];
    expect(next?.items).toEqual([
      expect.objectContaining({
        kind: "stroke",
        tool: "pen",
        points: [
          { x: 0.05, y: 0.1 },
          { x: 0.5, y: 0.5 },
          { x: 1, y: 1 },
        ],
      }),
    ]);
    expect(emitLessonEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: "plugin.annotation.changed",
      instanceId: "sim-a",
      pluginId: "io.ardesia.simulation",
      operation: "add",
      authorRole: "teacher",
      evidence: ["plugin:io.ardesia.simulation@sim-a"],
      provenance: expect.objectContaining({ surface: "overlay" }),
    }));

    const log = new InMemoryEventLog();
    for (const event of emitLessonEvent.mock.calls.map(([event]) => event)) await log.append(event);
    expect((await log.readAll()).map((event) => event.seq)).toEqual([1]);
  });

  it("lets a pencil write immediately but requires an explicit annotation tool for mouse and touch", () => {
    const mouse = renderOverlay();
    fireEvent.pointerDown(mouse.stage, { pointerId: 1, pointerType: "mouse", clientX: 20, clientY: 30 });
    fireEvent.pointerUp(mouse.stage, { pointerId: 1, pointerType: "mouse", clientX: 80, clientY: 60 });
    expect(mouse.onChange).not.toHaveBeenCalled();
    mouse.unmount();

    const pencil = renderOverlay();
    fireEvent.pointerDown(pencil.stage, { pointerId: 2, pointerType: "pen", clientX: 20, clientY: 30 });
    fireEvent.pointerUp(pencil.stage, { pointerId: 2, pointerType: "pen", clientX: 80, clientY: 60 });
    expect(pencil.onChange.mock.calls.at(-1)?.[0].items[0]).toMatchObject({ kind: "stroke", tool: "pen" });
  });

  it("creates highlighter, arrow, and short accessible text vectors", () => {
    const highlighter = renderOverlay();
    fireEvent.click(screen.getByRole("button", { name: "Evidenziatore" }));
    fireEvent.pointerDown(highlighter.stage, { pointerId: 3, pointerType: "mouse", clientX: 30, clientY: 40 });
    fireEvent.pointerUp(highlighter.stage, { pointerId: 3, pointerType: "mouse", clientX: 90, clientY: 50 });
    expect(highlighter.onChange.mock.calls.at(-1)?.[0].items[0]).toMatchObject({ kind: "stroke", tool: "highlighter" });
    highlighter.unmount();

    const arrow = renderOverlay();
    fireEvent.click(screen.getByRole("button", { name: "Freccia" }));
    fireEvent.pointerDown(arrow.stage, { pointerId: 5, pointerType: "touch", clientX: 30, clientY: 40 });
    fireEvent.pointerUp(arrow.stage, { pointerId: 5, pointerType: "touch", clientX: 110, clientY: 70 });
    expect(arrow.onChange.mock.calls.at(-1)?.[0].items[0]).toMatchObject({
      kind: "arrow",
      from: { x: 0.1, y: 0.2 },
      to: { x: 0.5, y: 0.5 },
    });
    arrow.unmount();

    const text = renderOverlay();
    fireEvent.click(screen.getByRole("button", { name: "Testo" }));
    fireEvent.pointerDown(text.stage, { pointerId: 6, pointerType: "mouse", clientX: 60, clientY: 50 });
    const dialog = screen.getByRole("dialog", { name: "Aggiungi annotazione testuale" });
    fireEvent.change(within(dialog).getByLabelText("Testo breve"), { target: { value: "R = 220 Ohm" } });
    fireEvent.change(within(dialog).getByLabelText("Testo alternativo"), { target: { value: "Valore del resistore" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Aggiungi testo" }));
    expect(text.onChange.mock.calls.at(-1)?.[0].items[0]).toMatchObject({
      kind: "text",
      at: { x: 0.25, y: 0.3 },
      text: "R = 220 Ohm",
      alternativeText: "Valore del resistore",
    });
  });

  it("supports selection, erasing, undo, redo, visibility, locking, and confirmed clear", () => {
    const item = {
      id: "sim-a:annotation:1",
      kind: "stroke" as const,
      tool: "pen" as const,
      points: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }],
      color: "#173f73",
      width: 0.008,
      authorRole: "teacher" as const,
    };
    const value: PluginAnnotationDocument = {
      ...emptyPluginAnnotations(),
      items: [item],
      undo: [[]],
    };
    const emitLessonEvent = vi.fn<(event: LessonOsEvent) => void>();
    const { rerender } = render(
      <PluginInkOverlay instanceId="sim-a" pluginId="io.ardesia.simulation" value={value} onChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Seleziona" }));
    fireEvent.pointerDown(screen.getByTestId("plugin-annotation-sim-a:annotation:1"), { pointerId: 7, pointerType: "mouse" });
    expect(screen.getByTestId("plugin-annotation-sim-a:annotation:1").getAttribute("data-selected")).toBe("true");

    const change = vi.fn<(next: PluginAnnotationDocument) => void>();
    rerender(
      <PluginInkOverlay
        instanceId="sim-a"
        pluginId="io.ardesia.simulation"
        value={value}
        onChange={change}
        emitLessonEvent={emitLessonEvent}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Gomma" }));
    fireEvent.pointerDown(screen.getByTestId("plugin-annotation-sim-a:annotation:1"), { pointerId: 8, pointerType: "mouse" });
    const erased = change.mock.calls.at(-1)![0];
    expect(erased.items).toEqual([]);

    rerender(
      <PluginInkOverlay instanceId="sim-a" pluginId="io.ardesia.simulation" value={erased} onChange={change} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Annulla" }));
    const undone = change.mock.calls.at(-1)![0];
    expect(undone.items).toEqual([item]);
    rerender(
      <PluginInkOverlay instanceId="sim-a" pluginId="io.ardesia.simulation" value={undone} onChange={change} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ripristina" }));
    const redone = change.mock.calls.at(-1)![0];
    expect(redone.items).toEqual([]);

    rerender(
      <PluginInkOverlay instanceId="sim-a" pluginId="io.ardesia.simulation" value={value} onChange={change} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Nascondi annotazioni" }));
    const hidden = change.mock.calls.at(-1)![0];
    expect(hidden.visible).toBe(false);
    rerender(
      <PluginInkOverlay instanceId="sim-a" pluginId="io.ardesia.simulation" value={hidden} onChange={change} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Blocca annotazioni" }));
    const locked = change.mock.calls.at(-1)![0];
    expect(locked.locked).toBe(true);
    rerender(
      <PluginInkOverlay instanceId="sim-a" pluginId="io.ardesia.simulation" value={locked} onChange={change} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Sblocca annotazioni" }));
    const unlocked = change.mock.calls.at(-1)![0];
    rerender(
      <PluginInkOverlay instanceId="sim-a" pluginId="io.ardesia.simulation" value={unlocked} onChange={change} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancella annotazioni" }));
    const clearDialog = screen.getByRole("dialog", { name: "Conferma cancellazione annotazioni" });
    fireEvent.click(within(clearDialog).getByRole("button", { name: "Conferma cancellazione" }));
    expect(change.mock.calls.at(-1)?.[0].items).toEqual([]);
  });

  it("moves a selected vector and emits an update operation", () => {
    const item = {
      id: "sim-a:annotation:1",
      kind: "stroke" as const,
      tool: "pen" as const,
      points: [{ x: 0.1, y: 0.1 }, { x: 0.4, y: 0.4 }],
      color: "#173f73",
      width: 0.008,
      authorRole: "teacher" as const,
    };
    const overlay = renderOverlay({ ...emptyPluginAnnotations(), items: [item] });
    fireEvent.click(screen.getByRole("button", { name: "Seleziona" }));
    const vector = screen.getByTestId("plugin-annotation-sim-a:annotation:1");
    fireEvent.pointerDown(vector, { pointerId: 12, pointerType: "mouse", clientX: 30, clientY: 30 });
    fireEvent.pointerMove(overlay.stage, { pointerId: 12, pointerType: "mouse", clientX: 50, clientY: 40 });
    fireEvent.pointerUp(overlay.stage, { pointerId: 12, pointerType: "mouse", clientX: 50, clientY: 40 });

    expect(overlay.onChange.mock.calls.at(-1)?.[0].items[0]).toMatchObject({
      id: item.id,
      points: [{ x: 0.2, y: 0.2 }, { x: 0.5, y: 0.5 }],
    });
    expect(overlay.emitLessonEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: "plugin.annotation.changed",
      operation: "update",
      annotationId: item.id,
    }));
  });

  it("exposes keyboard-accessible controls with a 44px minimum target", () => {
    renderOverlay();
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button.style.minWidth).toBe("44px");
      expect(button.style.minHeight).toBe("44px");
    }
    const pen = screen.getByRole("button", { name: "Penna" });
    pen.focus();
    fireEvent.keyDown(pen, { key: "Enter" });
    fireEvent.click(pen);
    expect(pen.getAttribute("aria-pressed")).toBe("true");
  });

  it("preserves annotations through each plugin state transition and across compact and expanded surfaces", () => {
    const persisted: unknown[] = [];
    const emitted: LessonOsEvent[] = [];
    const rendered = render(renderToolCanvasEmbeddable(createToolEmbedElement(), {
      persistEmbedState: (_embedId, state) => persisted.push(state),
      emitLessonEvent: (event) => emitted.push(event),
    })!);

    const compactStage = rendered.getByTestId("plugin-ink-stage");
    fireEvent.click(rendered.getByRole("button", { name: "Penna" }));
    fireEvent.pointerDown(compactStage, { pointerId: 9, pointerType: "pen", clientX: 10, clientY: 10 });
    fireEvent.pointerUp(compactStage, { pointerId: 9, pointerType: "pen", clientX: 80, clientY: 80 });
    expect(persisted.at(-1)).toMatchObject({
      kind: "simulation-scene-v1",
      annotations: { v: 1, items: [expect.objectContaining({ kind: "stroke" })] },
    });
    expect(emitted.at(-1)).toMatchObject({ kind: "plugin.annotation.changed", operation: "add" });

    fireEvent.click(rendered.getByRole("button", { name: /^Espandi / }));
    expect(document.querySelectorAll(`[data-plugin-annotation-surface]`).length).toBeGreaterThanOrEqual(2);
    expect(document.querySelectorAll('[data-plugin-runtime-surface="simulation"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-plugin-annotation-id]').length).toBeGreaterThanOrEqual(2);

    fireEvent.click(document.body.querySelector<HTMLButtonElement>("[data-plugin-runtime-surface=\"simulation\"] button[data-sim-break]")!);
    expect(persisted.at(-1)).toMatchObject({
      kind: "simulation-scene-v1",
      annotations: { items: [expect.objectContaining({ kind: "stroke" })] },
    });
    rendered.unmount();

    const arduinoPersisted: unknown[] = [];
    const arduino = render(renderToolCanvasEmbeddable(createArduinoToolchainEmbedElement(), {
      persistEmbedState: (_embedId, state) => arduinoPersisted.push(state),
    })!);
    const arduinoStage = arduino.getByTestId("plugin-ink-stage");
    fireEvent.click(arduino.getByRole("button", { name: "Penna" }));
    fireEvent.pointerDown(arduinoStage, { pointerId: 10, pointerType: "pen", clientX: 10, clientY: 10 });
    fireEvent.pointerUp(arduinoStage, { pointerId: 10, pointerType: "pen", clientX: 80, clientY: 80 });
    fireEvent.click(arduino.getByRole("button", { name: "Compila" }));
    expect(arduinoPersisted.at(-1)).toMatchObject({
      kind: "arduino-toolchain-v1",
      annotations: { items: [expect.objectContaining({ kind: "stroke" })] },
    });
    fireEvent.click(arduino.getByRole("button", { name: /^Espandi / }));
    expect(document.querySelectorAll('[data-plugin-runtime-surface="arduino-toolchain"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-plugin-annotation-id]').length).toBeGreaterThanOrEqual(2);
    arduino.unmount();

    const tutorPersisted: unknown[] = [];
    const tutor = render(renderToolCanvasEmbeddable(createElabTutorLinkedEmbedElement(), {
      persistEmbedState: (_embedId, state) => tutorPersisted.push(state),
    })!);
    const tutorStage = tutor.getByTestId("plugin-ink-stage");
    fireEvent.click(tutor.getByRole("button", { name: "Penna" }));
    fireEvent.pointerDown(tutorStage, { pointerId: 11, pointerType: "pen", clientX: 10, clientY: 10 });
    fireEvent.pointerUp(tutorStage, { pointerId: 11, pointerType: "pen", clientX: 80, clientY: 80 });
    fireEvent.click(tutor.getByRole("button", { name: "Invia comando alla simulazione" }));
    expect(tutorPersisted.at(-1)).toMatchObject({
      kind: "elabtutor-linked-v1",
      annotations: { items: [expect.objectContaining({ kind: "stroke" })] },
      lastCommand: expect.objectContaining({ status: "issued" }),
    });
    fireEvent.click(tutor.getByRole("button", { name: /^Espandi / }));
    expect(document.querySelectorAll('[data-plugin-runtime-surface="elabtutor"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-plugin-annotation-id]').length).toBeGreaterThanOrEqual(2);
  });
});
