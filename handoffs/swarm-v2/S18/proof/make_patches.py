from pathlib import Path
from difflib import unified_diff
root=Path(__file__).resolve().parents[4];out=root/'handoffs/swarm-v2/S18'
def patch(path,updated,name):
    old=(root/path).read_text();(out/name).write_text(''.join(unified_diff(old.splitlines(True),updated(old).splitlines(True),fromfile='a/'+path,tofile='b/'+path)))
def materials(s):
    s=s.replace('(r) => r.visibility === \"group\" || r.ownerId === me.id,', '(r) => r.kind !== \"living-source\" && r.kind !== \"living-annotation\" && (r.visibility === \"group\" || r.ownerId === me.id),')
    s=s.replace('import { useState } from "react";','import { lazy, Suspense, useState } from "react";\nconst LivingSources = lazy(() => import("./living-sources/LivingSources").then(m => ({default:m.LivingSources})));')
    return s.replace('      <div className="materials-layout">','      <Suspense fallback={<p>Preparazione delle fonti…</p>}><LivingSources me={me} data={data} onUpdate={onUpdate} /></Suspense>\n      <div className="materials-layout">')
patch('apps/web/src/features/Materials.tsx',materials,'materials-consumer.patch')
def api(s):
    return s.replace('    if studio_frontend:\n',"    from .living_sources import install_living_sources\n    install_living_sources(app, authenticate, store_dependency, Path(db_path).parent/'blobs')\n\n    if studio_frontend:\n")
patch('services/study-api/study_api/app.py',api,'api-composition.patch')
def source(s):
    s=s.replace('import { useEffect, useRef, useState } from "react";','import { lazy, Suspense, useEffect, useRef, useState } from "react";\nconst LivingSourceReference = lazy(() => import("../features/living-sources/LivingSourceReference").then(m => ({default:m.LivingSourceReference})));')
    return s.replace('  const passage = readLessonPassage(resource);','  if (resource.kind === "living-source" || resource.kind === "living-annotation")\n    return <Suspense fallback={<p>Apertura della fonte…</p>}><LivingSourceReference reference={reference} kind={resource.kind} /></Suspense>;\n  const passage = readLessonPassage(resource);')
patch('apps/web/src/components/SourceViewer.tsx',source,'source-viewer-consumer.patch')
