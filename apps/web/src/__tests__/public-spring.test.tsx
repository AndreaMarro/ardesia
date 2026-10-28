// @vitest-environment jsdom
import {afterEach, beforeEach, expect, test, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {PublicExperience} from "../features/PublicExperience";
import {installPublicBrowserStorage} from "./public-storage-fixture";

const initialUrl = location.href;
beforeEach(installPublicBrowserStorage);
afterEach(() => {cleanup(); localStorage.clear(); history.replaceState(null, "", initialUrl); vi.unstubAllGlobals(); vi.restoreAllMocks();});

function spring() {
  render(<PublicExperience />);
  fireEvent.click(screen.getByRole("button", {name: "Molla e forza"}));
}

test("the third public lab requires a prediction, shows Core metres and joules, and invalidates its graph on edits", () => {
  const fetch = vi.fn(() => Promise.reject(new Error("No public API")));
  vi.stubGlobal("fetch", fetch);
  spring();
  expect(screen.getAllByRole("button", {pressed: true})).toHaveLength(1);
  expect(screen.queryByTestId("spring-result")).toBeNull();
  expect(screen.queryByTestId("spring-graph")).toBeNull();
  const prediction = screen.getByLabelText("Allungamento previsto in m");
  const compare = screen.getByRole("button", {name: "Confronta l’allungamento"});
  expect((compare as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(prediction, {target: {value: "-1"}});
  expect((compare as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(prediction, {target: {value: "0,2"}});
  fireEvent.click(compare);
  expect(screen.getByTestId("spring-result").textContent).toBe("0,2 m");
  expect(screen.getByTestId("spring-energy").textContent).toContain("0,4 J");
  expect(screen.getByTestId("spring-graph")).toBeTruthy();
  expect(screen.getByText(/La previsione coincide/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Rigidità della molla"), {target: {value: "40"}});
  expect(screen.queryByTestId("spring-result")).toBeNull();
  expect(screen.queryByTestId("spring-graph")).toBeNull();
  expect((prediction as HTMLInputElement).value).toBe("");
  fireEvent.change(prediction, {target: {value: "0,1"}});
  fireEvent.click(compare);
  expect(screen.getByTestId("spring-result").textContent).toBe("0,1 m");
  expect(fetch).not.toHaveBeenCalled();
});

test("progressive hints and a different spring problem preserve focus and require a fresh prediction", () => {
  spring();
  const hint = screen.getByRole("button", {name: "Un indizio sulla molla"});
  hint.focus(); fireEvent.click(hint); fireEvent.click(hint);
  expect(hint.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(hint);
  fireEvent.change(screen.getByLabelText("Allungamento previsto in m"), {target: {value: "0,2"}});
  fireEvent.click(screen.getByRole("button", {name: "Confronta l’allungamento"}));
  fireEvent.click(screen.getByRole("button", {name: "Una molla diversa: nuova prova"}));
  expect((screen.getByLabelText("Forza applicata") as HTMLInputElement).value).toBe("6");
  expect((screen.getByLabelText("Rigidità della molla") as HTMLSelectElement).value).toBe("80");
  expect(screen.queryByTestId("spring-result")).toBeNull();
  expect(document.activeElement).toBe(screen.getByLabelText("Allungamento previsto in m"));
  fireEvent.change(screen.getByLabelText("Allungamento previsto in m"), {target: {value: "0,075"}});
  fireEvent.click(screen.getByRole("button", {name: "Confronta l’allungamento"}));
  expect(screen.getByTestId("spring-result").textContent).toBe("0,075 m");
  fireEvent.change(screen.getByLabelText("Forza applicata"), {target: {value: "5"}});
  expect(screen.queryByText(/Nuova prova: forza/)).toBeNull();
  expect(screen.queryByTestId("spring-result")).toBeNull();
});

test.each(["Molla e forza", "Pressione e profondità", "Flusso e raggio"])("an explicit local draft reopens %s without revealing a result and can be erased", model => {
  const view = render(<PublicExperience />);
  fireEvent.click(screen.getByRole("button", {name: model}));
  const label = model === "Molla e forza" ? "Allungamento previsto in m" : model === "Pressione e profondità" ? "Pressione prevista in Pa" : "Rapporto previsto";
  const value = model === "Molla e forza" ? "0,12" : model === "Pressione e profondità" ? "12345" : "3,2";
  fireEvent.change(screen.getByLabelText(label), {target: {value}});
  expect(localStorage.length).toBe(0);
  fireEvent.click(screen.getByRole("button", {name: "Salva una bozza in questo browser"}));
  expect(screen.getByText(/Bozza salvata solo in questo browser/)).toBeTruthy();
  view.unmount();
  render(<PublicExperience />);
  fireEvent.click(screen.getByRole("button", {name: model}));
  expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe(value);
  expect(screen.queryByTestId("spring-result")).toBeNull();
  expect(screen.queryByTestId("hydrostatic-result")).toBeNull();
  expect(screen.queryByTestId("physics-ratio")).toBeNull();
  fireEvent.click(screen.getByRole("button", {name: "Cancella la bozza locale"}));
  expect(localStorage.length).toBe(0);
  expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe(value);
});

test("blocked storage leaves a useful experiment and an explicit unsaved status", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {throw new Error("blocked");});
  spring();
  fireEvent.change(screen.getByLabelText("Allungamento previsto in m"), {target: {value: "0,2"}});
  fireEvent.click(screen.getByRole("button", {name: "Salva una bozza in questo browser"}));
  expect(screen.getByText(/Il browser non consente il salvataggio/).getAttribute("role")).toBe("status");
  fireEvent.click(screen.getByRole("button", {name: "Confronta l’allungamento"}));
  expect(screen.getByTestId("spring-result").textContent).toBe("0,2 m");
});

test("a direct spring link and model switch select the related course when no origin course was supplied", () => {
  history.replaceState(null, "", "/esperienza/?modello=molla");
  render(<PublicExperience />);
  expect(screen.getByRole("button", {name: "Molla e forza"}).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("link", {name: "Apri il microcorso"}).getAttribute("href")).toBe("/corsi/strumenti-meccanica/");
  fireEvent.click(screen.getByRole("button", {name: "Pressione e profondità"}));
  expect(screen.getByRole("link", {name: "Apri il microcorso"}).getAttribute("href")).toBe("/corsi/fluidi-termodinamica/");
});

test("an explicitly selected course remains the origin even when the experiment changes", () => {
  history.replaceState(null, "", "/esperienza/?percorso=elettricita-magnetismo&modello=molla");
  render(<PublicExperience />);
  expect(screen.getByRole("link", {name: "Apri il microcorso"}).getAttribute("href")).toBe("/corsi/elettricita-magnetismo/");
  fireEvent.click(screen.getByRole("button", {name: "Flusso e raggio"}));
  expect(screen.getByRole("link", {name: "Apri il microcorso"}).getAttribute("href")).toBe("/corsi/elettricita-magnetismo/");
});

test("choosing a different model updates the URL and reopens that model and its local prediction without a second switch", () => {
  history.replaceState(null, "", "/esperienza/?percorso=fluidi-termodinamica&modello=poiseuille");
  const view = render(<PublicExperience />);
  fireEvent.click(screen.getByRole("button", {name: "Molla e forza"}));
  const query = new URLSearchParams(location.search);
  expect(query.get("modello")).toBe("molla");
  expect(query.get("percorso")).toBe("fluidi-termodinamica");
  fireEvent.change(screen.getByLabelText("Allungamento previsto in m"), {target: {value: "0,12"}});
  fireEvent.click(screen.getByRole("button", {name: "Salva una bozza in questo browser"}));
  view.unmount();
  render(<PublicExperience />);
  expect(screen.getByRole("button", {name: "Molla e forza"}).getAttribute("aria-pressed")).toBe("true");
  expect((screen.getByLabelText("Allungamento previsto in m") as HTMLInputElement).value).toBe("0,12");
  expect(screen.queryByTestId("spring-result")).toBeNull();
});
