# VOLUME 3 - Large Files And Assets

## Policy
File >20MB non entrano in Git ordinario senza decisione esplicita. Preferire Drive/private storage, release artifact, rigenerazione da script, o Git LFS solo dopo approvazione.

## Sintesi
Totale file >20MB: 109.

Top directory:
- `PRODOTTO`: 53
- `ELAB - TRES JOLIE`: 18
- `ARCHIVIO`: 15
- `CONTENUTI`: 8
- `ardesia`: 5
- `.stversions`: 3
- `VOLUMI pdf e MD`: 2
- `elab-builder`: 2
- `ELAB-Vol1-Libro-vs-Simulatore.pdf
`: 1
- `galileo-brain-v13-training-20260321T200342Z-3-001.zip
`: 1
- `lezioni-ingest`: 1

## File trovati
| Path | Size | Type | Put in Git? | Alternative | Reason |
|---|---:|---|---|---|---|
| `./.stversions/PRODOTTO/elab-builder-graph-mhT32/dist-test/volumes/volume1~20260618-004323.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./.stversions/PRODOTTO/elab-builder-graph-mhT32/public/volumes/volume1~20260618-004326.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./.stversions/PRODOTTO/elab-builder-graph-mhT32/public/volumes/volume3~20260618-004323.pdf` | 20M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./ARCHIVIO/notebook-colab/elab-ai/elab_lora_extracted/elab_lora/tokenizer.json` | 33M | dataset/model data | No | Private storage; sanitized fixture if needed | Possibile corpus/dataset; non committare grezzo. |
| `./ARCHIVIO/notebook-colab/elab-ai/venv/lib/python3.13/site-packages/pymupdf/libmupdf.dylib` | 30M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./ARCHIVIO/progetti-deprecati/TOBIA/deploy-1770115390561-6e9014ef-b91a-453d-b2e6-1714526ef15b.zip` | 36M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/TOBIA/deploy-1770115454412-b0cd1c82-2e98-4d7e-9d7f-d9ba76529609.zip` | 36M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/TOBIA/deploy-1770243954706-2fd99550-1346-4bb3-97dc-d7572db3d197.zip` | 41M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/elab-website/deploy-1770115390561-6e9014ef-b91a-453d-b2e6-1714526ef15b.zip` | 36M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/elab-website/deploy-1770115454412-b0cd1c82-2e98-4d7e-9d7f-d9ba76529609.zip` | 36M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/elab-website/deploy-1770207202885-5cb7def5-7dce-4a5d-811f-b7d466498192.zip` | 41M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/elab-website/deploy-1770207480351-58f98791-611f-4456-a4ec-995bb0f7fe94.zip` | 41M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/elab-website/deploy-1770219059469-a6d1c0f6-6a56-4c12-bc44-abd74cd6d667.zip` | 41M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/elab-website/deploy-1770221276263-9aba0a28-205a-4606-a452-46cb0b46615d.zip` | 41M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/progetti-deprecati/elab-website/deploy-1770225235526-348990f3-0f0f-4542-ad61-615ffc5dffe1.zip` | 41M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/zip/TOBIA.zip` | 36M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ARCHIVIO/zip/vecchi/ziZEpIa9` | 27M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./ARCHIVIO/zip/vecchi/zidVmxeB` | 38M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./CONTENUTI/foto-volumi/foto-extra/AMAZON/KIT2/ITA/fustellati.jpg` | 20M | image/design asset | No | Optimize/sanitize or Git LFS only after decision | Asset >20MB; serve review uso/licenza. |
| `./CONTENUTI/foto-volumi/foto-extra/AMAZON/MANUALI E FUSTELLE/VOL1_ENG_COMPLETO  V.04 copyright.pdf` | 27M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./CONTENUTI/foto-volumi/foto-extra/AMAZON/MANUALI E FUSTELLE/VOL1_ITA_ COMPLETO  V.04 copyright.pdf` | 23M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./CONTENUTI/foto-volumi/foto-extra/logo/Senza titolo-1.jpg` | 20M | image/design asset | No | Optimize/sanitize or Git LFS only after decision | Asset >20MB; serve review uso/licenza. |
| `./CONTENUTI/foto-volumi/foto-extra/video/I condensatori..mp4` | 21M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./CONTENUTI/foto-volumi/foto-extra/video/Led RGB.mp4` | 21M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./CONTENUTI/foto-volumi/foto-extra/video/Legge di Ohm.mp4` | 24M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf` | 24M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./ELAB - TRES JOLIE/DOCUMENTI/MARCHIO REGISTRATO/MyRec_0211_1638.m4a` | 40M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/3 FOTO VOL. 3/CAPITOLO 7/Capitolo 7.6_upscayl_4x_upscayl-lite-4x.png` | 27M | image/design asset | No | Optimize/sanitize or Git LFS only after decision | Asset >20MB; serve review uso/licenza. |
| `./ELAB - TRES JOLIE/FOTO/3 FOTO VOL. 3/cartoncino da stampare/PIN DIGITALI_upscayl_4x_upscayl-lite-4x.png` | 21M | image/design asset | No | Optimize/sanitize or Git LFS only after decision | Asset >20MB; serve review uso/licenza. |
| `./ELAB - TRES JOLIE/FOTO/Maker fair roma/20251016_191119.mp4` | 46M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/Maker fair roma/20251017_092317.mp4` | 25M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/Maker fair roma/20251017_155915.mp4` | 29M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/Maker fair roma/20251017_155941.mp4` | 44M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/PUBBLICITA/Video WhatsApp 2025-02-22 ore 12.06.26_d88e6a87.mp4` | 62M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/video/I condensatori..mp4` | 21M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/video/Led RGB.mp4` | 21M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/FOTO/video/Legge di Ohm.mp4` | 24M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/Giovanni/ELAB/rendering/kit esplosi/kit_2.psd` | 28M | image/design asset | No | Optimize/sanitize or Git LFS only after decision | Asset >20MB; serve review uso/licenza. |
| `./ELAB - TRES JOLIE/Giovanni/ELAB/rendering/tutti i volumi retro.psd` | 42M | image/design asset | No | Optimize/sanitize or Git LFS only after decision | Asset >20MB; serve review uso/licenza. |
| `./ELAB - TRES JOLIE/Giovanni/ELAB/website/ver_02.zip` | 22M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./ELAB - TRES JOLIE/Video/08a748843dc13c28d67b482874d24c36 (1).mp4` | 25M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/Video/9a1bad45387519cd09891aed4b246abd.mp4` | 30M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB - TRES JOLIE/Video/Video WhatsApp 2025-02-22 ore 12.06.26_d88e6a87 (1).mp4` | 62M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./ELAB-Vol1-Libro-vs-Simulatore.pdf` | 28M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-blockly-definitivo/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-blockly-definitivo/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-cc-libfix/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-cc-libfix/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-ci-unblock/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-ci-unblock/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-ci-unblock/public/volumes/volume3.pdf` | 20M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-demo25/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-demo25/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-iter83-fumetto/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-iter83-fumetto/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-iter83-percorso-morfica/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-iter83-percorso-morfica/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-percorso-rescue/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-percorso-rescue/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-percorso-rt/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-percorso-rt/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-percorso-visible/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-percorso-visible/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-pr129/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-pr129/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-shared-infra/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-shared-infra/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-shared-infra/public/volumes/volume3.pdf` | 20M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-shrink/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-shrink/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-slice1a/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-slice1a/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-student-sessions-400/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-student-sessions-400/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-volume2/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-volume2/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-volume3/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder-volume3/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/.claude/worktrees/agent-a985cce2/datasets/galileo-brain-v6.jsonl` | 99M | dataset/model data | No | Private storage; sanitized fixture if needed | Possibile corpus/dataset; non committare grezzo. |
| `./PRODOTTO/elab-builder/.claude/worktrees/agent-a985cce2/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/.claude/worktrees/agent-a985cce2/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/.claude/worktrees/agent-ab62b741f58c03587/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/.claude/worktrees/agent-ab62b741f58c03587/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/.serena/cache/typescript/document_symbols.pkl` | 171M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./PRODOTTO/elab-builder/.serena/cache/typescript/raw_document_symbols.pkl` | 39M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./PRODOTTO/elab-builder/.vercel/output/static/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/datasets/galileo-brain-extreme-10k.jsonl` | 27M | dataset/model data | No | Private storage; sanitized fixture if needed | Possibile corpus/dataset; non committare grezzo. |
| `./PRODOTTO/elab-builder/datasets/output/galileo-brain-v5-extreme-25k.jsonl` | 47M | dataset/model data | No | Private storage; sanitized fixture if needed | Possibile corpus/dataset; non committare grezzo. |
| `./PRODOTTO/elab-builder/datasets/output/galileo-brain-v8.jsonl` | 40M | dataset/model data | No | Private storage; sanitized fixture if needed | Possibile corpus/dataset; non committare grezzo. |
| `./PRODOTTO/elab-builder/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-builder/public/volumes/volume3.pdf` | 20M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./PRODOTTO/elab-presentation/out/elab-presentation-final.mp4` | 46M | media | No | Drive/private storage; link in docs after license review | Asset pesante e potenzialmente personale/copyright. |
| `./PRODOTTO/galileo-backend/venv/lib/python3.13/site-packages/pymupdf/libmupdf.dylib` | 30M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./PRODOTTO/newcartella/_archivio/deploy-1770115390561-6e9014ef-b91a-453d-b2e6-1714526ef15b.zip` | 36M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./PRODOTTO/newcartella/_archivio/deploy-1770115454412-b0cd1c82-2e98-4d7e-9d7f-d9ba76529609.zip` | 36M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./PRODOTTO/newcartella/_archivio/deploy-1770243954706-2fd99550-1346-4bb3-97dc-d7572db3d197.zip` | 41M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./VOLUMI pdf e MD/MANUALE VOLUME 1 ITALIANO.pdf` | 24M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./VOLUMI pdf e MD/Manuale vol 3 versione 0.16.pdf` | 20M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./ardesia/packages/engine/.venv/lib/python3.13/site-packages/onnxruntime/capi/libonnxruntime.1.26.0.dylib` | 27M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./ardesia/packages/engine/.venv/lib/python3.13/site-packages/onnxruntime/capi/onnxruntime_pybind11_state.so` | 34M | large file | No | Ignore/private storage | File >20MB senza decisione esplicita. |
| `./ardesia/plugins/elab-tutor/dist-test/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./ardesia/plugins/elab-tutor/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./ardesia/plugins/elab-tutor/public/volumes/volume3.pdf` | 20M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./elab-builder/public/volumes/volume1.pdf` | 26M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./elab-builder/public/volumes/volume3.pdf` | 20M | PDF/manuale | No | Drive/private storage or license-reviewed artifact | Materiale didattico o copyright; non entra in Git senza licenza. |
| `./galileo-brain-v13-training-20260321T200342Z-3-001.zip` | 1.8G | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |
| `./lezioni-ingest/Lezioni_Storia_contemporanea_1.zip` | 800M | archive/export | No | Release artifact or private archive | Archivio generato o deploy/export; Git renderebbe il repo ingestibile. |

## COV
- Path: `/Users/andreamarro/VOLUME 3`
- Timestamp: 2026-07-02 CEST
- Repos found: 19
- Dirs mapped: 265
- Files mapped at maxdepth 4: 18962
- Important-file candidates: 123601
- Large files >20MB: 109
- Sensitive filename matches: 1090
- Sensitive content path matches, redacted/path-only: 13045
- Keyword hits, bounded/path+line file only: 1159634
- Raw scan artifacts: `/tmp/volume3-*.txt`, `/tmp/volume3-sensitive-content.tsv`
- Interrupted scans: two overly broad Python content scans were stopped by this agent; no runtime/service process was killed.
