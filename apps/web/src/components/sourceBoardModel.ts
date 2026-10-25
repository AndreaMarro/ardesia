import {
  createStudyPostit,
  moveStudyPostit,
  type StudyPostitView,
} from "../../../studio/src/study/postit";
import {
  restorePluginPostitObject,
  serializePluginPostitObject,
  type PostitBounds,
} from "../../../studio/src/toolhost/postitObject";
import type { PostitReference, StudyResource } from "../api";
export type { StudyPostitView, PostitBounds };
export const BOARD_LIMIT = 50;
export function restoreViews(views: StudyPostitView[]) {
  const restored = views.map((view) =>
    restorePluginPostitObject<PostitReference>(view),
  );
  if (
    restored.length > BOARD_LIMIT ||
    new Set(restored.map((view) => view.instanceId)).size !== restored.length ||
    restored.some(
      (view) =>
        view.pluginId !== "ardesia.study" ||
        ![
          view.pluginState?.resourceId,
          view.pluginState?.revisionId,
          view.pluginState?.contextId,
        ].every((value) => typeof value === "string" && value.length > 0),
    )
  )
    throw Error("invalid_source_board");
  return restored;
}
export function viewSnapshot(views: StudyPostitView[]) {
  return JSON.stringify(views.map(serializePluginPostitObject));
}
function instanceId() {
  return "view-" + crypto.randomUUID();
}
export function openSource(resource: StudyResource, count: number) {
  return createStudyPostit(instanceId(), resource, {
    x: 24 + (count % 3) * 400,
    y: 24 + Math.floor(count / 3) * 344,
    width: 360,
    height: 300,
  });
}
export function duplicateView(view: StudyPostitView): StudyPostitView {
  return restorePluginPostitObject<PostitReference>({
    ...view,
    instanceId: instanceId(),
    selected: false,
    hovered: false,
    proximity: "far",
    bounds: {
      ...view.bounds,
      x: Math.min(8192, view.bounds.x + 24),
      y: Math.min(8192, view.bounds.y + 24),
    },
  });
}
export function changeBounds(
  view: StudyPostitView,
  patch: Partial<PostitBounds>,
) {
  const next = { ...view.bounds, ...patch };
  return moveStudyPostit(view, {
    x: Math.max(0, Math.min(8192, next.x)),
    y: Math.max(0, Math.min(8192, next.y)),
    width: Math.max(280, Math.min(960, next.width)),
    height: Math.max(220, Math.min(900, next.height)),
  });
}
export function refreshReference(
  view: StudyPostitView,
  resource: StudyResource,
): StudyPostitView {
  if (resource.id !== view.pluginState.resourceId)
    throw Error("resource_identity_mismatch");
  return {
    ...view,
    pluginState: {
      resourceId: resource.id,
      revisionId: resource.revisionId,
      contextId: resource.contextId,
    },
  };
}
