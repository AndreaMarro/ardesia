// @vitest-environment jsdom
import {afterEach, expect, test, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {LessonPassageAuthoring} from "../components/LessonPassage";
import {clearResourceDrafts} from "../components/sessionDraftCache";

afterEach(() => {cleanup(); clearResourceDrafts(); vi.unstubAllGlobals(); vi.restoreAllMocks();});
test("a real popup proposal stays a draft until the teacher writes the explanation and explicitly shares", async () => {
  const popup = {closed: false, postMessage: vi.fn()};
  const open = vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
  const fetch = vi.fn(async () => new Response(JSON.stringify({id: "canonical-source", revisionId: "canonical-revision"})));
  vi.stubGlobal("fetch", fetch);
  const update = vi.fn(async () => {});
  const view = render(<LessonPassageAuthoring editionId="fluidi" onUpdate={update} />);
  fireEvent.click(screen.getByRole("button", {name: "Apri la lavagna"}));
  const endpoint = new URL(open.mock.calls[0][0] as string);
  expect(endpoint.hash).toBe("#aula-fluidi");
  expect(endpoint.searchParams.size).toBe(1);
  const channel = endpoint.searchParams.get("courseBridge");
  const emit = (type: string, extra = {}) => window.dispatchEvent(new MessageEvent("message", {
    origin: endpoint.origin, source: popup as unknown as Window, data: {type, channel, ...extra},
  }));
  emit("ardesia.lesson-passage.ready.v1");
  const descriptor = {schema: "ardesia.lesson-passage.v1", workspaceId: "local-default", lessonId: "aula-fluidi", sessionId: "session-one", recordingId: "take-one",
    startEpoch: 1000, endEpoch: 2000, sha256: "a".repeat(64), objectRefs: [{elementId: "formula", version: 1, label: "Il vincolo"}],
    replayUrl: endpoint.origin + endpoint.pathname + "?vista=replay&at=2000&recording=take-one&object=formula&session=session-one&sha=" + "a".repeat(64) + "&objectVersion=1#aula-fluidi"};
  emit("ardesia.lesson-passage.proposed.v1", {descriptor});
  expect(await screen.findByText("Il vincolo")).toBeTruthy();
  const share = screen.getByRole("button", {name: "Condividi passaggio con il gruppo"});
  expect((share as HTMLButtonElement).disabled).toBe(true);
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Trascrizione e spiegazione del passaggio"), {target: {value: "Q è costante: isola la differenza di pressione."}});
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(share);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("/study/resources");
  const body = JSON.parse(init.body as string);
  expect(body).toMatchObject({editionId: "fluidi", kind: "lesson-passage", visibility: "group"});
  expect(JSON.parse(body.text)).toEqual({schema: "ardesia.lesson-passage-source.v1", descriptor, transcript: "Q è costante: isola la differenza di pressione."});
  await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
  view.unmount();
  emit("ardesia.lesson-passage.proposed.v1", {descriptor});
  expect(fetch).toHaveBeenCalledTimes(1);
});
