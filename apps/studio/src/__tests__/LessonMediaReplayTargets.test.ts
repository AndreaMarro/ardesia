import {expect,test} from 'vitest';
import {resolveReplayTarget} from '../store/replayTimeline';
import {replayAt} from '../../../web/src/features/lesson-media/model';
import {source} from '../../../web/src/features/lesson-media/fixture';
import {readLessonPassage} from '../../../web/src/components/lessonPassageReference';

// The canonical Studio resolver belongs to this workspace: importing it from
// a Web test pulls WorkspaceStore/lessonBundle and Studio-only dependencies
// into Web's clean-install typecheck even though those imports are type-only.
test('media cues seek earlier audio without weakening historical object version checks',()=>{
  const a=source(),d=readLessonPassage(a)!.descriptor;
  const timeline={events:[{type:'element.add' as const,t:5000,element:{id:'formula',version:1}}],firstEventTime:1000,lastEventTime:11000,audioChunks:[],
    recordings:[{v:1 as const,recordingId:d.recordingId,assetPath:`raw/${d.lessonId}/${d.sessionId}/audio/take.wav`,mimeType:'audio/wav',sha256:d.sha256,bytes:100,durationMs:10000,startEpoch:d.startEpoch,endEpoch:d.endEpoch,objectRefs:d.objectRefs,availability:'available' as const}]};
  expect(resolveReplayTarget(timeline,new URL(d.replayUrl).search).objectId).toBe('formula');
  const invalidEarlier=new URL(d.replayUrl);invalidEarlier.searchParams.set('at','1000');
  expect(()=>resolveReplayTarget(timeline,invalidEarlier.search)).toThrow(/versione collegata/);
  const earlier=resolveReplayTarget(timeline,new URL(replayAt(a,0)!).search);
  expect(earlier).toEqual({epoch:1000,recordingId:'take-one',objectId:null});
  expect(resolveReplayTarget(timeline,new URL(replayAt(a,10000)!).search).objectId).toBe('formula');
});
