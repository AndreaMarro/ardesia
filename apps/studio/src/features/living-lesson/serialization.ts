import { attachEditorial, parseEditorial, type SceneEnvelope } from './model'
/** Preserve only the validated public editorial extension after the canonical serializer.
 * Never copy projected/private ink or arbitrary source-envelope fields. */
export function preserveEditorial(serialized:string,previous:SceneEnvelope,lessonId:string):string {
 const current=JSON.parse(serialized) as SceneEnvelope
 if(previous.livingLesson===undefined)return serialized
 return JSON.stringify(attachEditorial(current,parseEditorial(previous,lessonId)))
}
