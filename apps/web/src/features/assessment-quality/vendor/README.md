# Cortex Compute Engine 0.152.0

The three `.js` files are unchanged official npm ESM distribution bytes. The
entrypoint and two imported chunks supply the mature CAS used by this feature.
Source, immutable gitHead, npm integrity and SHA-256 of every file are recorded in
`handoffs/swarm-v2/S04/2026-10-26-rea-cas/vendor-manifest.json`.

MIT license is retained in `LICENSE` and the consumer's downloadable
`../THIRD_PARTY_NOTICES.txt`; declared package dependency provenance and limitations
are recorded there too. No upstream code is attributed to Ardesia.

`compute-engine.d.ts` is the original narrow Ardesia boundary for the public
methods actually used, checked against upstream declarations and real-library
tests. It does not expose the full upstream API. Update the pin, hashes, closure,
notices, boundary, discriminating tests and worker E2E together. Do not hand-edit
the JavaScript. The consumer admits a bounded pure arithmetic language and does
not call assignment, compilation, random, integration or provider APIs.

The ESM closure was tested without the npm package installed in the consumer.
The worker is lazy and terminated after each job; this does not shrink the
roughly 4.1 MB uncompressed CAS payload. Changing packaging requires fresh build,
runtime and license evidence. Remove the lazy workbench and this namespace to
roll back; persisted private Core worksheets remain historical resources.
