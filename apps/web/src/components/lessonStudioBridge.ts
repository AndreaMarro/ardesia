import {readPassageDescriptor, type LessonPassageDescriptor} from "./lessonPassageReference";

/** An installed same-origin surface, or the two explicitly paired dev servers. */
export function studioBridgeTarget(current: URL): string {
  if (current.protocol === "http:" && current.port === "5320" && ["127.0.0.1", "localhost"].includes(current.hostname))
    return `http://${current.hostname}:5197/`;
  return new URL("/studio/", current).href;
}

export function openLessonStudioBridge({room, onPassage, onState, channel = crypto.randomUUID()}: {
  room: string;
  onPassage: (descriptor: LessonPassageDescriptor) => void;
  onState?: (state: "waiting" | "connected" | "closed" | "blocked") => void;
  channel?: string;
}) {
  const endpoint = new URL(studioBridgeTarget(new URL(location.href)));
  endpoint.searchParams.set("courseBridge", channel);
  endpoint.hash = room;
  // Opener is required by this bounded handshake. No arbitrary URL/origin is accepted.
  const popup = window.open(endpoint.href, "_blank", "popup,width=1280,height=900");
  let disposed = false, connected = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  function dispose() {
    disposed = true;
    window.removeEventListener("message", receive);
    if (timer) clearInterval(timer);
  }
  function receive(event: MessageEvent) {
    if (disposed || !popup || popup.closed || event.source !== popup || event.origin !== endpoint.origin) return;
    const value = event.data;
    if (!value || typeof value !== "object" || value.channel !== channel) return;
    if (value.type === "ardesia.lesson-passage.ready.v1" && Object.keys(value).length === 2) {
      connected = true;
      popup.postMessage({type: "ardesia.lesson-passage.connect.v1", channel}, endpoint.origin);
      onState?.("connected");
    } else if (connected && value.type === "ardesia.lesson-passage.proposed.v1" && Object.keys(value).length === 3) {
      let descriptor: LessonPassageDescriptor | null;
      try {descriptor = readPassageDescriptor(JSON.stringify(value.descriptor));}
      catch {return;}
      if (!descriptor || descriptor.lessonId !== room) return;
      const replay = new URL(descriptor.replayUrl);
      if (replay.origin !== endpoint.origin || replay.pathname !== endpoint.pathname) return;
      onPassage(descriptor);
    }
  }
  if (!popup) onState?.("blocked");
  else {
    window.addEventListener("message", receive);
    onState?.("waiting");
    timer = setInterval(() => {
      if (popup.closed) {dispose(); onState?.("closed");}
    }, 500);
  }
  return {dispose};
}
