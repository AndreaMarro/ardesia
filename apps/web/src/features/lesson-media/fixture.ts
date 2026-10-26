import type {StudyResource} from "../../api";
export function source(id='source', recording='take-one'): StudyResource {
  const descriptor={schema:'ardesia.lesson-passage.v1',workspaceId:'local-default',lessonId:'aula-fluidi',sessionId:'session-one',recordingId:recording,
    startEpoch:1000,endEpoch:11000,sha256:'a'.repeat(64),objectRefs:[{elementId:'formula',version:1,label:'Il vincolo'}],
    replayUrl:`http://127.0.0.1:5320/studio/?vista=replay&at=11000&recording=${recording}&object=formula&session=session-one&sha=${'a'.repeat(64)}&objectVersion=1#aula-fluidi`};
  return {id,revisionId:'rev-'+id,contextId:'ctx',editionId:'fluidi',ownerId:'tutor',kind:'lesson-passage',visibility:'group',sha256:'b'.repeat(64),
    text:JSON.stringify({schema:'ardesia.lesson-passage-source.v1',descriptor,transcript:'La portata resta fissata.'})};
}
