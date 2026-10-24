// @vitest-environment jsdom
import {afterEach, expect, test, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {PublicExperience} from "../features/PublicExperience";
import {PoiseuilleModel} from "../components/PoiseuilleVisual";
afterEach(() => {cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks();});
test("public experience hides the solution and flow response until a prediction, then supports retry and a new constraint", async () => {
  const fetch = vi.fn(() => Promise.reject(new Error("Public artifact has no API")));
  vi.stubGlobal("fetch", fetch);
  render(<PublicExperience />);
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect(screen.queryByTestId("poiseuille-graph")).toBeNull();
  expect(screen.queryByTestId("flow-measures")).toBeNull();
  expect(screen.queryByTestId("lesson-demo")).toBeNull();
  const button = screen.getByRole("button", {name: "Metti alla prova"});
  expect((button as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "4"}});
  fireEvent.click(button);
  expect((await screen.findByTestId("physics-ratio")).textContent).toContain("16");
  expect(screen.getByText(/Il raggio entra alla quarta potenza/)).toBeTruthy();
  expect(screen.getByTestId("flow-measures").textContent).toContain("16");
  fireEvent.click(screen.getByRole("button", {name: "Guarda il grafico"}));
  expect(screen.getByTestId("poiseuille-graph")).toBeTruthy();
  expect(screen.queryByTestId("lesson-demo")).toBeNull();
  fireEvent.click(screen.getByRole("button", {name: "Riprendi il vincolo"}));
  expect(screen.getByTestId("lesson-demo").textContent).toContain("Voce sintetica dimostrativa");
  expect(screen.getByLabelText("Ascolta il passaggio sul vincolo").getAttribute("preload")).toBe("none");
  fireEvent.click(screen.getByRole("link", {name: "Ritrova la formula collegata"}));
  expect(document.getElementById("poiseuille-formula")!.closest("details")!.open).toBe(true);
  fireEvent.change(screen.getByLabelText("Grandezza fissata"), {target: {value: "flow"}});
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "0,0625"}});
  fireEvent.click(button);
  expect((await screen.findByTestId("physics-ratio")).textContent).toContain("0,0625");
  expect(screen.getByTestId("flow-measures").textContent).toContain("Q/Q₀ = 1");
  fireEvent.click(screen.getByRole("button", {name: "Un problema diverso"}));
  expect((screen.getByLabelText("Rapporto dei raggi") as HTMLInputElement).value).toBe("1");
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect((screen.getByLabelText("Rapporto previsto") as HTMLInputElement).value).toBe("");
  expect(fetch).not.toHaveBeenCalled();
});

test("the authored audio requires a manual gesture and its failure leaves the full transcript available", async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new Error("Missing local asset"));
  render(<PublicExperience />);
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "4"}});
  fireEvent.click(screen.getByRole("button", {name: "Metti alla prova"}));
  await screen.findByTestId("physics-ratio");
  fireEvent.click(screen.getByRole("button", {name: "Riprendi il vincolo"}));
  expect(play).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", {name: "Ascolta il passaggio"}));
  expect((await screen.findByRole("alert")).textContent).toContain("L’audio locale non è disponibile");
  expect(screen.getByTestId("lesson-demo").textContent).toContain("Ora mantieni la portata e il raggio, ma raddoppia viscosità e lunghezza.");
  expect(play).toHaveBeenCalledTimes(1);
});

test.each(["Prova di nuovo", "Ricomincia l’esperimento"])("%s returns to a focused prediction and closes the previous recovery", async action => {
  render(<PublicExperience />);
  const prediction = screen.getByLabelText("Rapporto previsto");
  fireEvent.change(prediction, {target: {value: "4"}});
  fireEvent.click(screen.getByRole("button", {name: "Metti alla prova"}));
  await screen.findByTestId("physics-ratio");
  fireEvent.click(screen.getByRole("button", {name: "Guarda il grafico"}));
  fireEvent.click(screen.getByRole("button", {name: "Riprendi il vincolo"}));
  const restart = screen.getByRole("button", {name: action});
  restart.focus();
  fireEvent.click(restart);
  expect(document.activeElement).toBe(prediction);
  expect((prediction as HTMLInputElement).value).toBe("");
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect(screen.queryByTestId("poiseuille-graph")).toBeNull();
  expect(screen.queryByTestId("lesson-demo")).toBeNull();
});

test.each(["radius", "boundary"])("changing %s leaves the prescribed task instead of retaining a contradictory instruction", async parameter => {
  render(<PublicExperience />);
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "4"}});
  fireEvent.click(screen.getByRole("button", {name: "Metti alla prova"}));
  await screen.findByTestId("physics-ratio");
  fireEvent.click(screen.getByRole("button", {name: "Un problema diverso"}));
  const task = "Nuovo problema: Q e raggio restano costanti; viscosità e lunghezza raddoppiano.";
  expect(screen.getByText(task)).toBeTruthy();
  if (parameter === "radius") fireEvent.change(screen.getByLabelText("Rapporto dei raggi"), {target: {value: "0.55"}});
  else fireEvent.change(screen.getByLabelText("Grandezza fissata"), {target: {value: "pressure"}});
  expect(screen.queryByText(task)).toBeNull();
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect(screen.getByText("Parametri cambiati. Metti di nuovo alla prova la previsione.")).toBeTruthy();
});

test("the public transfer keeps radius and flow fixed while viscosity and length change, with no exploration graph", async () => {
  render(<PublicExperience />);
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "16"}});
  fireEvent.click(screen.getByRole("button", {name: "Metti alla prova"}));
  await screen.findByTestId("physics-ratio");
  fireEvent.click(screen.getByRole("button", {name: "Un problema diverso"}));
  expect((screen.getByLabelText("Rapporto dei raggi") as HTMLInputElement).value).toBe("1");
  expect(screen.getByText(/viscosità e lunghezza raddoppiano/)).toBeTruthy();
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  fireEvent.change(screen.getByLabelText("Rapporto previsto"), {target: {value: "4"}});
  fireEvent.click(screen.getByRole("button", {name: "Metti alla prova"}));
  expect((await screen.findByTestId("physics-ratio")).textContent).toBe("Δp/Δp0 = 4");
  expect(screen.getByTestId("flow-measures").textContent).toContain("Δp/Δp₀ = 4");
  expect(screen.getByTestId("flow-measures").getAttribute("data-speed-ratio")).toBe("1");
  expect(screen.queryByRole("button", {name: "Guarda il grafico"})).toBeNull();
});

test.each([
  [2, "flow", 4, 227.5, 455],
  [.5, "pressure", 1, 455, 227.5],
])("the view uses supplied Core quantities and relative tube lengths at L/L0=%s", (lengthRatio, boundary, pressureRatio, referenceWidth, comparisonWidth) => {
  const props = {radius: 1, boundary: String(boundary), lengthRatio: Number(lengthRatio), viscosityRatio: 2,
    visualState: {flowRatio: 1, pressureRatio: Number(pressureRatio), meanSpeedRatio: 1}, graph: true};
  const {container, rerender} = render(<PoiseuilleModel {...props} />);
  expect(screen.queryByTestId("flow-measures")).toBeNull();
  rerender(<PoiseuilleModel {...props} revealed />);
  expect(container.querySelector(".pipe-reference .tube-body")!.getAttribute("width")).toBe(String(referenceWidth));
  expect(container.querySelector(".pipe-comparison .tube-body")!.getAttribute("width")).toBe(String(comparisonWidth));
  expect(screen.getByTestId("flow-measures").textContent).toContain(`Δp/Δp₀ = ${pressureRatio}`);
  expect(screen.queryByTestId("poiseuille-graph")).toBeNull();
});

test("the full canonical assumptions are readable before revealing a result", () => {
  render(<PublicExperience />);
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  expect(screen.getByText(/Fluido newtoniano incomprimibile, moto laminare stazionario e sviluppato/).textContent).toContain("senza scorrimento alla parete");
  expect(screen.getByText(/Il regime laminare deve essere verificato dai valori assoluti/)).toBeTruthy();
  expect(screen.getByText(/Tutti i parametri sono rapporti adimensionali/)).toBeTruthy();
});
