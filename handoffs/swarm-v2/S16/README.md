# S16 — original scientific GLB assets, pending S13 consumer

Bounded acquisition on `8e0737b114f147735ef4daf062285e1dbe4064e3`, branch
`codex/rea-acquisition-s14-s16`, 26 October 2026. Files belong only to S16 and
`assets/scientific3d/`. S13 retains ownership of the renderer and integration.
No renderer, runtime package, route, shared registry, package manifest or lockfile
was added or edited. No GitHub write, merge, deployment, approval or S13 acceptance
is claimed. **The product capability is not complete: integration is pending.**

## Contract found

No 3D loader, scene consumer or S13 handoff was observed in Web/Studio source on
this base, the tracked tree or the nine open PRs read during reconnaissance.
`apps/web/e2e-public/public-three-models.spec.ts` tests three 2D physics exercises;
its name does not identify Three.js. No glTF assets were already present.
Root AGENTS, registry/TARGETS.json, registry/ASSET_PROPRI.md, project orientation,
canons and memory were read. The registry has no dedicated glTF/model asset target;
its GeoGebra, Desmos and PhET rights do not authorize their asset reuse.
The generated CURRENT snapshot was dated `2026-10-26T01:36:12+01:00`. Shared state
and RUNLOG/NEXT writes remain with the parent integrator.

Consequently [manifest.json](../../../assets/scientific3d/manifest.json) is a
**proposed asset boundary**, `PENDING_S13_CONSUMER`, with `approved=false` and
`consumerVerified=false`. It does not register a capability or invent a runtime
consumer. GLB is the standard container; the small adjacent catalog only describes
the assets. It is not a second scene engine, physics model or product authority.

## Delivered assets

| Asset | Dimensions in meters | Triangles | Primitives | GLB bytes |
| --- | --- | ---: | ---: | ---: |
| Calibrated vessel, 90° cutaway | 0.086 × 0.124 × 0.086 | 704 | 7 | 29,116 |
| Piston and cylinder, 90° cutaway | 0.056 × 0.108 × 0.056 initially | 1,156 | 4 | 39,240 |
| Spherical biconvex lens | 0.050 × 0.050 × 0.010 | 4,096 | 1 | 79,028 |

Total: **147,384 bytes**, 5,956 triangles. All are glTF 2.0 core GLBs, right-handed,
Y-up, meters, front +Z. The lens optical axis is +Z. Each file has one default
scene, semantic node names and float32 POSITION/NORMAL attributes, uint16 indices,
opaque metallic-roughness materials, and no required extensions, textures,
external URI resources, skins or animations. No Draco/KTX decoder is needed.
Origin: vessel and cylinder base center at Y=0; lens at its optical center.
Anchors, parameters, proposed controls and scientific limits are in the catalog.

Vessel: ideal bore radius 0.04 m, cavity floor Y=0.004 m, height 0.12 m. The five
graduation nodes `graduation-100ml` through `graduation-500ml` locate the exact
ideal-cylinder levels. Bars have no numeral textures; labels must come from the
consumer/catalog. The open wall is deliberately illustrative, not a real vessel.

Piston: radius 0.0245 m inside a 0.025 m bore. `piston-moving` is the parent of
`piston-disc` and `piston-rod`; its initial Y is 0.055 m. The proposed center Y
range 0.012–0.082 m keeps the disc clear of the floor/rim. S13 must decide whether
and how its existing scene state controls this transform. The catalog does not
execute controls or calculate gas laws.

Lens: aperture radius 0.025 m, curvature radius 0.10 m on each spherical face,
center thickness 0.010 m, 16 radial rings/64 angular segments. Its opaque blue
material keeps the baseline free of transmission extensions. Optical behavior
must be implemented and validated separately by the canonical scientific consumer.

## Acquisition and rights

[candidates.json](candidates.json) records five concrete asset candidates and
three exporter candidates, primary URLs, rights and decisions. Poly Haven
Chemistry Set and Magnifying Glass are CC0 but exceed this lot's static mesh
budget as listed and provide no verified calibrated scientific dimensions. The
Khronos Box is CC BY 4.0, a format fixture rather than useful scientific equipment.
Kenney Space Kit is CC0 but serves a different visual subject. Sketchfab access
returned 403, so its rights were not established and no asset was adopted.
No external asset binaries or screenshots were downloaded.

The result uses original parametric geometry, not shapes copied from those
candidates. [RIGHTS.md](../../../assets/scientific3d/RIGHTS.md) explicitly records
original authorship for Ardesia and keeps external distribution licensing with
the owner. This does not silently apply MIT or CC0 to the new project assets.

Exporter selected: **@gltf-transform/core 4.5.1**, MIT, with exactly
**property-graph 4.1.0**, MIT. Independent conformance check:
**gltf-validator 2.0.0-dev.3.10**, Apache-2.0. Node 22.14.0 and Python 3.13.2 were
used. Tarball SHA-512 pins and source inspection are in
[toolchain-receipt.json](toolchain-receipt.json); full software notices are retained
in [third-party/](third-party/). Only 533,057 bytes were downloaded for this
toolchain; its unpacked ignored directory is about 2.4 MiB. No package lifecycle
script runs, and there is no npm install, global dependency or product import.

The available complete TypeScript exporter source was read, including
`src/io/platform-io.ts:159–196`: `writeBinary` delegates scene serialization,
produces the standard GLB2 JSON/BIN container and pads chunks. The pinned source
digest is retained. REA was considered using the installed
`reverse-engineer-anything` skill, whose routing says to skip REA for ordinary
complete-source analysis. No claim depended on a closed shipped artifact or
unobserved runtime, so no REA provider/active-target session was opened. No
reverse-engineering runtime evidence or provider cost saving is claimed.

## Reproduce and verify

Run from the repository root with system curl, Python 3 and Node 22:

```sh
python3 handoffs/swarm-v2/S16/bootstrap.py
node handoffs/swarm-v2/S16/build-assets.mjs --check
node handoffs/swarm-v2/S16/verify-assets.mjs --write-report
```

Bootstrap is needed once; it refuses an already existing toolchain. It verifies
three hardcoded SHA-512 pins before unpacking regular files into its own ignored
directory. It rejects links, traversal, and packages/downloads over 8 MB. Curl
retains TLS verification. For intentional regeneration, run `build-assets.mjs`
without `--check`; the default check compares exact GLB/catalog bytes without
writing them. The verification report is deterministic and contains output hashes.

Fresh results: [verification.json](verification.json), [verification.log](verification.log)
and [regeneration.log](regeneration.log). Khronos validator: **0 errors, 0 warnings,
0 infos** for all three files. The checks examine committed/output bytes, digest,
container, accessor types, index ranges, finite/unit normals, nondegenerate
triangles, winding, per-mesh welded edge manifold closure and positive volume.
They independently inspect dimensions, bore/piston/rod radii, five ideal-cylinder
graduation levels and geometric stroke clearance. The lens's exported vertices
lie on the specified spherical surfaces; tessellated solid volume differs from
the analytic geometric integral by **0.2229%**, below the 0.5% test limit.
This is a geometric approximation bound, not optical or physics validation.

Static budgets pass: ≤256 KiB, ≤6,000 triangles and ≤8 primitives per asset;
≤512 KiB for all GLBs. These are explicitly chosen resource ceilings, **not measured
browser/mobile performance**. No WebGL/browser, Safari, physical device, visual
review, accessibility workflow or runtime memory/frame rate test was run.

The first bootstrap attempt used Python urllib and failed because this Python
installation lacked a working CA trust path. It wrote no package. The correction
uses system curl's verified HTTPS trust path; TLS was never disabled. No asset
generation or conformance check failed. No existing test/gate was weakened.

## Remaining handoff

1. S13 first reads this proposed boundary and maps the stable IDs/nodes to its
   actual canonical scene/load/state contract. Acceptance is an explicit consumer
   integration decision with a concrete reachable scene, not this catalog alone.
2. S13/S00 integrate one asset through the existing loader, exact revision/source
   reference and persistence path; verify load failure, reopen, transform state,
   scope/revocation and fallback using their real consumer. No new engine/registry.
3. S13 then verifies appearance and budgets in desktop/mobile browsers, and a
   scientific owner checks the intended labels/model interpretation. Keep geometry,
   physical model and human approval as separate evidence. External publication
   also needs the owner's asset-license decision.

S00 owns common memory and final integration. The acquisition chat publishes
this branch/PR and delivers an append-only memory proposal to S00. This pack is ready for
that decision; the requested end-to-end scientific3D capability remains pending.


## Correzione del perimetro di osservazione — 26 ottobre 2026

Un git-grep sul partial clone ha innescato fetch di blob non necessari: interrotto il solo scan proprio e i suoi processi figli. Non si usa quella scansione interrotta per sostenere assenza globale di un consumer. Il manifest indica ora correttamente «non osservato nei percorsi/PR esaminati». Nessun file o processo di altre chat toccato. La chat parent non è S00: S00 conserva integrazione e memoria comune; il parent consegna questo batch.
