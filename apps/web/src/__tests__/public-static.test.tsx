// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Public } from "../features/Public";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("the static preview opens the course and both physical cases without a backend", async () => {
  const fetch = vi.fn(() => Promise.reject(new Error("No API on a static host")));
  vi.stubGlobal("fetch", fetch);
  render(<Public publicPreview />);
  await screen.findByText("Quattro incontri proposti");
  fireEvent.change(screen.getByLabelText("Rapporto dei raggi"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("La tua previsione"), {
    target: { value: "Una previsione privata, senza valutazione automatica" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  expect((await screen.findByTestId("physics-ratio")).textContent).toContain("16");
  fireEvent.change(screen.getByLabelText("Grandezza fissata"), {
    target: { value: "flow" },
  });
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Metti alla prova" }));
  expect((await screen.findByTestId("physics-ratio")).textContent).toContain("0,0625");
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.queryByRole("textbox", { name: "Contatto sintetico" })).toBeNull();
  expect(screen.queryByText(/Accedi al tuo spazio/)).toBeNull();
});
