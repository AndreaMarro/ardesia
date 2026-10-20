import { createPluginPostitObject, resizePluginPostitObject, type PluginPostitObject, type PostitBounds } from '../toolhost/postitObject'
import type { PostitReference, StudyResource } from './contracts'
export type StudyPostitView = PluginPostitObject<PostitReference>
export function createStudyPostit(instanceId:string,resource:StudyResource,bounds:PostitBounds):StudyPostitView {
  return createPluginPostitObject({instanceId,pluginId:'ardesia.study',bounds,zIndex:0,
    pluginState:{resourceId:resource.id,revisionId:resource.revisionId,contextId:resource.contextId}})
}
export function moveStudyPostit(view:StudyPostitView,bounds:Partial<PostitBounds>):StudyPostitView {
  return resizePluginPostitObject(view,bounds)
}
