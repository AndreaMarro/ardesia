import type { ReplayTimeline } from '../../store/replayTimeline'
import type { ReplayRecording } from '../../store/audioRecording'
/** Projection of ReplayView's one media element and one epoch cursor. */
export interface ReplayCursor {
  media:HTMLAudioElement|null
  recording:ReplayRecording|null
  timeline:ReplayTimeline
  epoch:number|null
  seekEpoch(epoch:number):void
}
