# SKILL: error-lessons — lezioni dagli errori REALI (notte 10/06, studio)

Applica OGNI item al diff (ognuno deriva da un errore accaduto davvero):
- [ ] **Invarianti downstream**: se il diff tocca path/contratti dello storage (WorkspaceStore, PATHS, formato journal), il REPLAY va rieseguito prima di consegnare — l'hardening T0c ha rotto il kill-test ed è passato perché nessuno l'ha rilanciato. Ora è nel gate, ma il check mentale resta: "cosa consuma questo contratto a valle?"
- [ ] **Script shell**: MAI `kill` di un process-group in script non-interattivi (la cleanup di replay-check.sh ammazzava SE STESSA → exit 255 fantasma). Kill mirato del PID.
- [ ] **Test che possono fallire**: per ogni test nuovo chiediti "quale comportamento SBAGLIATO lo farebbe fallire?" — il test initialLoadDone verificava solo il render condizionale (tautologico, beccato dal red-team).
- [ ] **"Fatto" = accettazione punto-per-punto**: cita il criterio dell'ordine e dimostra ciascun punto; "gate verde" non basta se l'accettazione chiede di più (T1 dichiarato chiuso senza il test a schermo).
- [ ] **Race async**: ogni salvataggio async ripetibile va serializzato (promise-chain/ref) — i salvataggi sovrapposti di Room.tsx potevano scrivere dati stale.
- [ ] **Risorse su unmount**: timer/listener creati nel componente → cleanup in useEffect return.
