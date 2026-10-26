/** The same minimal Materials seam supplied as a patch to S00; never edit the shared file here. */
export function materialsPatch(source:string):string{
  const needle='      <div className="materials-layout">';
  if(!source.includes(needle))throw Error('materials_seam_changed');
  return source.replace('(r) => r.visibility === \"group\" || r.ownerId === me.id,', '(r) => r.kind !== \"living-source\" && r.kind !== \"living-annotation\" && (r.visibility === \"group\" || r.ownerId === me.id),').replace('import { useState } from "react";', 'import { lazy, Suspense, useState } from "react";\nconst LivingSources = lazy(() => import("./living-sources/LivingSources").then(m => ({default:m.LivingSources})));')
    .replace(needle,'      <Suspense fallback={<p>Preparazione delle fonti…</p>}><LivingSources me={me} data={data} onUpdate={onUpdate} /></Suspense>\n'+needle);
}

export function sourceViewerPatch(source:string):string {
  const needle='  const passage = readLessonPassage(resource);';
  if(!source.includes(needle))throw Error('source_viewer_seam_changed');
  return source.replace('import { useEffect, useRef, useState } from "react";', 'import { lazy, Suspense, useEffect, useRef, useState } from "react";\nconst LivingSourceReference = lazy(() => import("../features/living-sources/LivingSourceReference").then(m => ({default:m.LivingSourceReference})));')
    .replace(needle,'  if (resource.kind === "living-source" || resource.kind === "living-annotation")\n    return <Suspense fallback={<p>Apertura della fonte…</p>}><LivingSourceReference reference={reference} kind={resource.kind} /></Suspense>;\n'+needle);
}
