import { createHash } from 'node:crypto'
export const REPLAY_SHA256='668412d9ae790f1b4c68a04f0939d52fe41b231b821511fa87742ac40ef72950'
export function patchCanonicalReplay(source){
 if(createHash('sha256').update(source).digest('hex')!==REPLAY_SHA256)throw Error('S17 ReplayView patch: source SHA mismatch; S00 must revalidate the patch')
 const replace=(a,b)=>{if(!source.includes(a))throw Error('S17 patch hunk absent');source=source.replace(a,b)}
 replace('type ChangeEvent }','type ChangeEvent, useCallback }')
 replace('interface ReplayViewProps {','import type { ReactNode } from "react"\nimport type { ReplayCursor } from "./features/living-lesson/replayCursor"\n\ninterface ReplayViewProps {\n  renderExtension?: (cursor: ReplayCursor) => ReactNode\n  replayFiles?: Record<string, any>\n  selectedRecordingId?: string\n  range?: { start: number; end: number }')
 replace('function ReplayView({ store, room }: ReplayViewProps)','function ReplayView({ store, room, renderExtension, replayFiles, range, selectedRecordingId }: ReplayViewProps)')
 replace('  const audioRef = useRef<HTMLAudioElement>(null)','  const audioRef = useRef<HTMLAudioElement>(null)\n  const [mediaElement, setMediaElement] = useState<HTMLAudioElement | null>(null)\n  const attachMedia = useCallback((value: HTMLAudioElement | null) => { audioRef.current = value; setMediaElement(value) }, [])')
 replace('recordingAtTime(timeline.recordings, t) : null', '(selectedRecordingId ? timeline.recordings.find(r => r.recordingId === selectedRecordingId && t >= r.startEpoch && t <= r.endEpoch) ?? null : recordingAtTime(timeline.recordings, t)) : null')
 replace('  useEffect(() => {\n    let cancelled = false', '  const recordingKey = canonicalRecording ? JSON.stringify([room, canonicalRecording.assetPath, canonicalRecording.recordingId, canonicalRecording.sha256, canonicalRecording.startEpoch, canonicalRecording.endEpoch]) : ""\n  const activeKey = useRef(recordingKey)\n  activeKey.current = recordingKey\n  useEffect(() => () => { activeKey.current = "" }, [])\n\n  useEffect(() => {\n    let cancelled = false')
 replace('  /** Scrub manuale:', '  function seekEpoch(epoch: number) {\n    if (!recordingKey || activeKey.current !== recordingKey) return\n    if (!Number.isFinite(epoch) || epoch < (range?.start ?? timeline?.firstEventTime ?? 0) || epoch > (range?.end ?? timeline?.lastEventTime ?? 0)) return\n    const next = epoch\n    setT(next)\n    const media = audioRef.current, start = audioStartEpochRef.current\n    if (media && start !== null) {\n      const seconds = Math.max(0, (next - start) / 1000)\n      if (media.readyState === 0) pendingSeekSecRef.current = seconds\n      else { pendingSeekSecRef.current = null; media.currentTime = seconds }\n    }\n  }\n\n  /** Scrub manuale:')
 replace('const next = Number(e.target.value)','const next = Math.max(range?.start ?? 0, Math.min(range?.end ?? Infinity, Number(e.target.value)))')
 replace('initialData={{ elements: scene as any, appState:', 'initialData={{ elements: scene as any, files: replayFiles, appState:')
 replace('min={timeline.firstEventTime!}', 'min={range?.start ?? timeline.firstEventTime!}')
 replace('max={timeline.lastEventTime!}', 'max={range?.end ?? timeline.lastEventTime!}')
 replace('ref={audioRef}', 'ref={attachMedia}')
 replace('{timeline.recordings.length > 0 && <div className="st-replay-passages">','{renderExtension?.({ media: mediaElement, recording: canonicalRecording, timeline, epoch: t, seekEpoch })}\n          {!renderExtension && timeline.recordings.length > 0 && <div className="st-replay-passages">')
 return source
}
