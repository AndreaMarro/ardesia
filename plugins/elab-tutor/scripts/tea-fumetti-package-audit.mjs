import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import EXPERIMENTS_VOL1 from '../src/data/experiments-vol1.js';
import EXPERIMENTS_VOL2 from '../src/data/experiments-vol2.js';
import EXPERIMENTS_VOL3 from '../src/data/experiments-vol3.js';
import VOLUME_REFERENCES from '../src/data/volume-references.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(projectRoot, '..', '..');
const teaRoot = process.env.ELAB_TEA_PACKAGE_DIR || path.join(workspaceRoot, 'elab-fumetti-consegna-v2');
const nanobotRoot = process.env.ELAB_NANOBOT_DIR || '/tmp/elab-galileo-nanobot';
const outDir = process.env.ELAB_AUDIT_OUT || path.join(projectRoot, 'docs/audits/2026-05-09-unlim-superlativo-tea-fumetti');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(teaRoot, relativePath), 'utf8'));
}

function listFiles(relativeDir, predicate = () => true) {
  const dir = path.join(teaRoot, relativeDir);
  return fs.readdirSync(dir)
    .filter(predicate)
    .sort()
    .map((file) => ({ file, path: path.join(dir, file), bytes: fs.statSync(path.join(dir, file)).size }));
}

function getNarrativeExperiments(narrativeMap) {
  const rows = [];
  const chapters = [];
  const arcs = [];
  for (const [volumeKey, volume] of Object.entries(narrativeMap)) {
    for (const arc of volume.story_arcs || []) arcs.push({ volumeKey, ...arc });
    for (const [chapterKey, chapter] of Object.entries(volume.chapters || {})) {
      chapters.push({
        volumeKey,
        chapterKey,
        chapterNumber: chapter.chapter_number,
        chapterTitle: chapter.chapter_title,
        chapterTitleOrigin: chapter.chapter_title_origin,
        storyArc: chapter.story_arc,
        experiments: chapter.experiments?.length || 0,
      });
      for (const experiment of chapter.experiments || []) rows.push({ volumeKey, chapterKey, chapter, experiment });
    }
  }
  return { rows, chapters, arcs };
}

function experimentIdFromFumettoFile(file) {
  const normalized = file
    .replace(/^fumetto_/, '')
    .replace(/\.pdf$/i, '');
  return normalized;
}

function payloadIdFromFile(file) {
  return file.replace(/\.json$/i, '');
}

function safeReadJson(filePath) {
  try {
    return { ok: true, json: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

function countPdfPagesWithPdfInfo(filePath) {
  return null; // Keep audit portable; visual/page QA is tracked as manual/editorial follow-up.
}

const narrativeMap = readJson('05-Punto-2-Mapping-Narrativo/narrative_map.json');
const metadata94 = readJson('05-Punto-2-Mapping-Narrativo/narrative_metadata_94.json');
const cliffhangerTable = readJson('05-Punto-2-Mapping-Narrativo/cliffhanger_table.json');
const point2Audit = readJson('05-Punto-2-Mapping-Narrativo/punto2_audit_dettagliato.json');
const { rows, chapters, arcs } = getNarrativeExperiments(narrativeMap);

const repoExperiments = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];
const repoIds = repoExperiments.map((experiment) => experiment.id).sort();
const narrativeIds = [...new Set(rows.map(({ experiment }) => experiment.id))].sort();
const metadataIds = Object.keys(metadata94).sort();
const volumeRefIds = Object.keys(VOLUME_REFERENCES).sort();

const idSet = new Set(narrativeIds);
const capstones = rows.filter(({ experiment }) => experiment.next_id === null).map(({ experiment }) => experiment.id).sort();
const pageMismatches = rows
  .filter(({ experiment }) => VOLUME_REFERENCES[experiment.id]?.bookPage !== experiment.page)
  .map(({ experiment }) => ({ id: experiment.id, narrativePage: experiment.page, volumeReferencePage: VOLUME_REFERENCES[experiment.id]?.bookPage ?? null }));
const metadataPageMismatches = narrativeIds
  .filter((id) => metadata94[id]?.bookPage !== VOLUME_REFERENCES[id]?.bookPage)
  .map((id) => ({ id, metadataPage: metadata94[id]?.bookPage ?? null, volumeReferencePage: VOLUME_REFERENCES[id]?.bookPage ?? null }));

const volumes = [
  { key: 'v1', dir: '01-Volume-1', payloadDir: '01-Volume-1/payloads_vol1' },
  { key: 'v2', dir: '02-Volume-2', payloadDir: '02-Volume-2/payloads_vol2' },
  { key: 'v3', dir: '03-Volume-3', payloadDir: '03-Volume-3/payloads_vol3' },
];

const pdfCatalog = [];
const payloadCatalog = [];
for (const volume of volumes) {
  for (const pdf of listFiles(volume.dir, (file) => file.endsWith('.pdf'))) {
    const id = experimentIdFromFumettoFile(pdf.file);
    pdfCatalog.push({
      volume: volume.key,
      id,
      file: pdf.file,
      path: pdf.path,
      bytes: pdf.bytes,
      readable: pdf.bytes > 0,
      canonicalExperimentId: idSet.has(id),
      canonicalName: /^fumetto_v[1-3]-cap\d+-esp\d+\.pdf$/.test(pdf.file),
      pageCount: countPdfPagesWithPdfInfo(pdf.path),
    });
  }
  for (const payload of listFiles(volume.payloadDir, (file) => file.endsWith('.json'))) {
    const parsed = safeReadJson(payload.path);
    payloadCatalog.push({
      volume: volume.key,
      id: payloadIdFromFile(payload.file),
      file: payload.file,
      path: payload.path,
      bytes: payload.bytes,
      readable: payload.bytes > 0 && parsed.ok,
      canonicalExperimentId: idSet.has(payloadIdFromFile(payload.file)),
      parseError: parsed.ok ? null : parsed.error,
    });
  }
}

const pdfIds = pdfCatalog.map((item) => item.id).sort();
const payloadIds = payloadCatalog.map((item) => item.id).sort();
const missingPdfAssets = narrativeIds.filter((id) => !pdfIds.includes(id));
const extraPdfAssets = pdfIds.filter((id) => !idSet.has(id));
const missingPayloads = narrativeIds.filter((id) => !payloadIds.includes(id));
const extraPayloads = payloadIds.filter((id) => !idSet.has(id));

const rootReadable = [
  'README.md',
  '00-Pilot-e-Documentazione/fumetto_schema.json',
  '00-Pilot-e-Documentazione/fumetto_payload_esempio.json',
  '05-Punto-2-Mapping-Narrativo/narrative_map.json',
  '05-Punto-2-Mapping-Narrativo/narrative_metadata_94.json',
  '06-Punto-6e-Album-Studente/album_studente_spec.html',
  '06-Punto-6e-Album-Studente/album_studente_spec.pdf',
  '99-Pipeline/README-pipeline.md',
].map((relativePath) => {
  const filePath = path.join(teaRoot, relativePath);
  return {
    relativePath,
    exists: fs.existsSync(filePath),
    readable: fs.existsSync(filePath) && fs.statSync(filePath).size > 0,
    bytes: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
  };
});

let nanobotSummary = { available: false };
if (fs.existsSync(nanobotRoot)) {
  const nanobotYaml = fs.existsSync(path.join(nanobotRoot, 'nanobot.yml'))
    ? fs.readFileSync(path.join(nanobotRoot, 'nanobot.yml'), 'utf8')
    : '';
  nanobotSummary = {
    available: true,
    root: nanobotRoot,
    hasBrainRouter: fs.existsSync(path.join(nanobotRoot, 'brain.py')),
    hasSpecialistPrompts: fs.existsSync(path.join(nanobotRoot, 'prompts/circuit.yml')),
    catalogMentions69: /CATALOGO 69 ESPERIMENTI/.test(nanobotYaml),
    mentionsLegacyIds: /v1-cap6-primo-circuito|v3-cap6-led-blink/.test(nanobotYaml),
    finding: 'Policy/router utili; catalogo esperimenti non allineato ai 94 ID canonici Tea/repo.',
  };
}

const audit = {
  generatedAt: new Date().toISOString(),
  teaRoot,
  projectRoot,
  readability: rootReadable,
  narrative: {
    experimentCount: narrativeIds.length,
    metadataCount: metadataIds.length,
    repoExperimentCount: repoIds.length,
    volumeReferenceCount: volumeRefIds.length,
    chapterCount: chapters.length,
    storyArcCount: arcs.length,
    capstoneCount: capstones.length,
    inferredChapterTitleCount: chapters.filter((chapter) => chapter.chapterTitleOrigin === 'tea-inferred').length,
    missingInRepo: narrativeIds.filter((id) => !repoIds.includes(id)),
    missingInNarrativeMap: repoIds.filter((id) => !narrativeIds.includes(id)),
    missingVolumeReferences: narrativeIds.filter((id) => !volumeRefIds.includes(id)),
    pageMismatches,
    metadataPageMismatches,
    capstones,
    chapters,
    point2AuditKeys: Object.keys(point2Audit),
    cliffhangerRows: Array.isArray(cliffhangerTable) ? cliffhangerTable.length : Object.keys(cliffhangerTable).length,
  },
  fumetti: {
    pdfCount: pdfCatalog.length,
    payloadCount: payloadCatalog.length,
    pdfCanonicalExperimentCount: pdfCatalog.filter((item) => item.canonicalExperimentId).length,
    payloadCanonicalExperimentCount: payloadCatalog.filter((item) => item.canonicalExperimentId).length,
    canonicalFilenameCount: pdfCatalog.filter((item) => item.canonicalName).length,
    missingPdfAssets,
    extraPdfAssets,
    missingPayloads,
    extraPayloads,
    nonCanonicalPdfFilenames: pdfCatalog.filter((item) => !item.canonicalName).map((item) => item.file),
    unreadablePayloads: payloadCatalog.filter((item) => !item.readable),
    catalog: pdfCatalog,
    payloadCatalog,
  },
  storageDecision: {
    decision: 'Prefer Supabase Storage for first implementation; Vercel Blob/S3-like remains acceptable fallback.',
    reason: 'Supabase is already the project data plane and supports stable per-student/experiment metadata with RLS; runtime must read stable pre-generated URLs only.',
    runtimePolicy: 'no on-demand regeneration at experiment completion; admin/editorial pipeline may generate with Leonardo AI.',
  },
  nanobot: nanobotSummary,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tea-fumetti-audit.json'), JSON.stringify(audit, null, 2));
fs.writeFileSync(path.join(outDir, 'debug-mismatch-tea-repo.json'), JSON.stringify({
  generatedAt: audit.generatedAt,
  missingInRepo: audit.narrative.missingInRepo,
  missingInNarrativeMap: audit.narrative.missingInNarrativeMap,
  missingVolumeReferences: audit.narrative.missingVolumeReferences,
  pageMismatches: audit.narrative.pageMismatches,
  metadataPageMismatches: audit.narrative.metadataPageMismatches,
  teaInferredChapterTitles: audit.narrative.chapters.filter((chapter) => chapter.chapterTitleOrigin === 'tea-inferred'),
  fumettiMissingPdfAssets: audit.fumetti.missingPdfAssets,
  fumettiExtraPdfAssets: audit.fumetti.extraPdfAssets,
  fumettiNonCanonicalPdfFilenames: audit.fumetti.nonCanonicalPdfFilenames,
  nanobot: audit.nanobot,
}, null, 2));

console.log(JSON.stringify({
  outDir,
  narrative: audit.narrative,
  fumetti: {
    pdfCount: audit.fumetti.pdfCount,
    payloadCount: audit.fumetti.payloadCount,
    missingPdfAssets: audit.fumetti.missingPdfAssets,
    extraPdfAssets: audit.fumetti.extraPdfAssets,
    nonCanonicalPdfFilenames: audit.fumetti.nonCanonicalPdfFilenames,
  },
  nanobot: audit.nanobot,
}, null, 2));
