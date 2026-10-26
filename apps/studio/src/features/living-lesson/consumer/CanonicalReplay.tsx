import ReplayView from '../../../ReplayView'
import type { WorkspaceStore } from '../../../store/WorkspaceStore'
import type { ReactNode } from 'react'
import type { ReplayCursor } from '../replayCursor'
/** Runtime extension is the exact SHA-pinned patch in canonical-patch.mjs, applied by the proof config.
 * This narrow cast keeps the untouched main consumer typechecked. S00 applies the supplied patch. */
export default ReplayView as unknown as (props:{store:WorkspaceStore;room:string;selectedRecordingId:string;replayFiles:Record<string,unknown>;range:{start:number;end:number};renderExtension:(cursor:ReplayCursor)=>ReactNode})=>ReactNode
