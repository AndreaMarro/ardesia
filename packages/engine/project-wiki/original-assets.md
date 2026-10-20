# Originali autorizzati e identità binaria

La lettura canonica verifica appartenenza all'edizione e proprietà oppure un
riferimento consegnato al tutor, prima di accedere al repository dei blob
(`lessonos/study/assets.py:95`). Dimensione e SHA-256 devono coincidere con la
riga canonica; il descrittore espone solo id, edizione, MIME, byte, hash, tipo
immutabile e stato dell'estrazione (`lessonos/study/assets.py:108`). La vecchia
API Python read_asset restituisce ancora byte e MIME (`lessonos/study/assets.py:90`).

La route HTTP restituisce descrittore e byte nella stessa risposta autorizzata,
con no-store e Content-Disposition attachment
(`services/study-api/study_api/app.py:406`, percorso dalla root del monorepo).
Il client condiviso verifica stream e hash prima di consegnare il Blob alla UI
(`apps/studio/src/study/originalAsset.ts:50`); studyOriginal conserva il confine di
sessione del trasporto esistente (`apps/studio/src/study/apiClient.ts:54`).

Un fingerprint PDF o l'hash del testo estratto non sostituiscono questa identità.
La distinzione e le prove di integrazione sono registrate in
`docs/ops/rea-deep/TARGET-082/CORE-READER-INTEGRATION.md`.
