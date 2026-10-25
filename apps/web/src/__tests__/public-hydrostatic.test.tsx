// @vitest-environment jsdom
import {afterEach, expect, test, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {PublicExperience} from "../features/PublicExperience";

afterEach(() => {cleanup(); vi.unstubAllGlobals();});

test("a second public physics model preserves the prediction on error, uses Core values and clears the old result when the reference changes", async () => {
  const fetch = vi.fn(() => Promise.reject(new Error("No API in the public artifact")));
  vi.stubGlobal("fetch", fetch);
  render(<PublicExperience />);
  fireEvent.click(screen.getByRole("button", {name: "Pressione e profondità"}));
  expect(screen.queryByTestId("hydrostatic-result")).toBeNull();
  expect(screen.queryByTestId("hydrostatic-graph")).toBeNull();
  const prediction = screen.getByLabelText("Pressione prevista in Pa");
  const submit = screen.getByRole("button", {name: "Confronta la pressione"});
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(prediction, {target: {value: "2000"}});
  fireEvent.click(submit);
  expect((await screen.findByTestId("hydrostatic-result")).textContent).toContain("19.620");
  expect((prediction as HTMLInputElement).value).toBe("2000");
  expect(screen.getByText(/La previsione differisce/)).toBeTruthy();
  expect(screen.getByTestId("hydrostatic-graph")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Riferimento della pressione"), {target: {value: "absolute"}});
  expect(screen.queryByTestId("hydrostatic-result")).toBeNull();
  expect(screen.queryByTestId("hydrostatic-graph")).toBeNull();
  expect((prediction as HTMLInputElement).value).toBe("");
  fireEvent.change(prediction, {target: {value: "120945"}});
  fireEvent.click(submit);
  expect((await screen.findByTestId("hydrostatic-result")).textContent).toContain("120.945");
  expect(screen.getByText(/La previsione coincide/)).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});

test("a different hydrostatic problem changes density as well as depth, hides the solution and focuses a fresh prediction", async () => {
  render(<PublicExperience />);
  fireEvent.click(screen.getByRole("button", {name: "Pressione e profondità"}));
  fireEvent.change(screen.getByLabelText("Pressione prevista in Pa"), {target: {value: "19620"}});
  fireEvent.click(screen.getByRole("button", {name: "Confronta la pressione"}));
  await screen.findByTestId("hydrostatic-result");
  fireEvent.click(screen.getByRole("button", {name: "Cambia fluido: una nuova prova"}));
  expect((screen.getByLabelText("Densità del liquido") as HTMLSelectElement).value).toBe("800");
  expect((screen.getByLabelText("Profondità della sonda") as HTMLInputElement).value).toBe("3");
  expect(screen.queryByTestId("hydrostatic-result")).toBeNull();
  expect(document.activeElement).toBe(screen.getByLabelText("Pressione prevista in Pa"));
  fireEvent.change(screen.getByLabelText("Pressione prevista in Pa"), {target: {value: "23544"}});
  fireEvent.click(screen.getByRole("button", {name: "Confronta la pressione"}));
  expect((await screen.findByTestId("hydrostatic-result")).textContent).toContain("23.544");
  fireEvent.click(screen.getByRole("button", {name: "Cambia fluido: una nuova prova"}));
  expect((screen.getByLabelText("Densità del liquido") as HTMLSelectElement).value).toBe("1000");
  expect((screen.getByLabelText("Profondità della sonda") as HTMLInputElement).value).toBe("1.5");
  expect((screen.getByLabelText("Riferimento della pressione") as HTMLSelectElement).value).toBe("absolute");
  expect(screen.queryByTestId("hydrostatic-result")).toBeNull();
  fireEvent.change(screen.getByLabelText("Pressione prevista in Pa"), {target: {value: "116040"}});
  fireEvent.click(screen.getByRole("button", {name: "Confronta la pressione"}));
  expect((await screen.findByTestId("hydrostatic-result")).textContent).toContain("116.040");
  fireEvent.change(screen.getByLabelText("Profondità della sonda"), {target: {value: "2.5"}});
  expect(screen.queryByText(/Nuova prova: liquido/)).toBeNull();
  expect(screen.queryByTestId("hydrostatic-result")).toBeNull();
});

test("the final public hint keeps its focused trigger while reporting completion", () => {
  render(<PublicExperience />);
  fireEvent.click(screen.getByRole("button", {name: "Pressione e profondità"}));
  const trigger = screen.getByRole("button", {name: "Un indizio sul riferimento"});
  trigger.focus(); fireEvent.click(trigger); fireEvent.click(trigger);
  expect((trigger as HTMLButtonElement).disabled).toBe(false);
  expect(trigger.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(trigger);
});
