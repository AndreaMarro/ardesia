// @vitest-environment jsdom
import {afterEach, expect, test, vi} from "vitest";
import {openLessonStudioBridge, studioBridgeTarget} from "../components/lessonStudioBridge";

afterEach(() => {vi.unstubAllGlobals(); vi.restoreAllMocks();});
const channel = "11111111-1111-4111-8111-111111111111";
function passage(origin: string, base = "/studio/") {
  return {schema: "ardesia.lesson-passage.v1", workspaceId: "local-default", lessonId: "aula-fluidi", sessionId: "session-one", recordingId: "take-one",
    startEpoch: 1000, endEpoch: 2000, sha256: "a".repeat(64), objectRefs: [{elementId: "formula", version: 1, label: "Il vincolo"}],
    replayUrl: origin + base + "?vista=replay&at=2000&recording=take-one&object=formula&session=session-one&sha=" + "a".repeat(64) + "&objectVersion=1#aula-fluidi"};
}
test("popup origin is derived from the installed surface, never a query string", () => {
  expect(studioBridgeTarget(new URL("http://127.0.0.1:5320/?studioOrigin=https://evil.invalid"))).toBe("http://127.0.0.1:5197/");
  expect(studioBridgeTarget(new URL("http://localhost:8080/"))).toBe("http://localhost:8080/studio/");
});
test("a passage requires exact popup source, origin, live channel and handshake; publication is not a bridge action", () => {
  const popup = {closed: false, postMessage: vi.fn()};
  vi.spyOn(window, "open").mockReturnValue(popup as unknown as Window);
  const received = vi.fn();
  const bridge = openLessonStudioBridge({room: "aula-fluidi", onPassage: received, channel});
  const peer = new URL(studioBridgeTarget(new URL(location.href)));
  const send = (type: string, extra: object = {}, origin = peer.origin, source: unknown = popup) =>
    window.dispatchEvent(new MessageEvent("message", {origin, source: source as Window, data: {type, channel, ...extra}}));
  const descriptor = passage(peer.origin, peer.pathname);
  send("ardesia.lesson-passage.proposed.v1", {descriptor});
  expect(received).not.toHaveBeenCalled();
  send("ardesia.lesson-passage.ready.v1", {}, "https://evil.invalid");
  send("ardesia.lesson-passage.ready.v1", {}, peer.origin, {});
  expect(popup.postMessage).not.toHaveBeenCalled();
  send("ardesia.lesson-passage.ready.v1");
  expect(popup.postMessage).toHaveBeenCalledWith({type: "ardesia.lesson-passage.connect.v1", channel}, peer.origin);
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
  const errors: unknown[] = [];
  const captureError = (event: ErrorEvent) => {errors.push(event.error); event.preventDefault();};
  window.addEventListener("error", captureError);
  try {
    send("ardesia.lesson-passage.proposed.v1", {descriptor: cyclic});
    expect(errors).toEqual([]);
    expect(received).not.toHaveBeenCalled();
  } finally {window.removeEventListener("error", captureError);}
  send("ardesia.lesson-passage.proposed.v1", {descriptor, channel: "stale"});
  send("ardesia.lesson-passage.proposed.v1", {descriptor: {...descriptor, replayUrl: descriptor.replayUrl.replace(peer.origin, "http://127.0.0.1:7777")}});
  expect(received).not.toHaveBeenCalled();
  send("ardesia.lesson-passage.proposed.v1", {descriptor});
  expect(received).toHaveBeenCalledTimes(1);
  bridge.dispose();
  send("ardesia.lesson-passage.proposed.v1", {descriptor});
  expect(received).toHaveBeenCalledTimes(1);
});
