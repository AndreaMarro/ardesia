// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { AnnotationLayer } from "../integrations/notebook/AnnotationLayer";
import type { PdfFrame } from "../integrations/notebook/renderPdfPage";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
test("placing a resized annotation centers its actual dimensions on the chosen PDF point", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  const frame = {
    number: 1, geometry: {
      width: 600, height: 800, viewBox: [0, 0, 600, 800],
      convertToPdfPoint: (x: number, y: number) => [x, 800 - y],
      convertToViewportPoint: (x: number, y: number) => [x, 800 - y],
    },
  } as PdfFrame;
  const placed = vi.fn();
  const view = render(<AnnotationLayer frame={frame} annotations={[]} placing placingSize={[.1, .1]} onPlace={placed} />);
  const layer = view.container.firstElementChild as HTMLElement;
  vi.spyOn(layer, "getBoundingClientRect").mockReturnValue({ x: 20, y: 30, left: 20, top: 30, width: 600, height: 800, right: 620, bottom: 830, toJSON() {} });
  fireEvent.pointerDown(layer, { clientX: 320, clientY: 430 });
  expect(placed).toHaveBeenCalledWith([.45, .45, .1, .1]);
});
