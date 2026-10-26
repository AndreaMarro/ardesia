# Composizione esplicita di Room — contratto S07

La Room non costruisce un'identità da URL e non sceglie un provider. L'host autenticato risolve sorgente immutabile, permessi e geometrie delle immagini della pagina. Nessun documento Yjs unico con ACL client.

```tsx
import Room from './Room'
import { InkSession } from './collaboration-v2/session'
import { readInkCheckpoint } from './collaboration-v2/persistence'
import type { RoomInkAdapter } from './collaboration-v2/RoomCollaboration'

// verifiedRoomId/verifiedActorId/source provengono dalla risoluzione Core.
// pageGeometry è riferita alle immagini esatte del PDF, prima di zoom/scroll.
const personalScope = {
  v: 1 as const, roomId: verifiedRoomId, ownerId: verifiedActorId,
  source, audience: 'personal' as const,
}
const sharedScope = { ...personalScope, audience: 'shared' as const }
const personal = new InkSession(personalScope,
  (await readInkCheckpoint(store, personalScope)) ?? undefined)
const shared = new InkSession(sharedScope,
  (await readInkCheckpoint(store, sharedScope)) ?? undefined)
const adapter: RoomInkAdapter = {
  roomId: verifiedRoomId, sessions: { personal, shared }, pages: pageGeometry,
  signal: coreSessionAbortSignal,
  // peers: solo snapshot shared già autorizzati dal trasporto, stesso source/room.
  // transport: adapter Core reale; assente mantiene pending e stato remoto non attivo.
}
<Room store={store} collaboration={adapter} />
```

Il codice è contratto di composizione, non un endpoint o grant già disponibile. La lista peers deve escludere l'autore locale, ricevere update per-scope validati e causare una nuova prop quando cambia. L'host conserva/distrugge gli InkLayer alla fine della sessione. La Room si limita a staccare i listener che possiede. `AbortSignal` chiude scritture e layer; nessuna riapertura automatica.

Il server futuro verifica prima sessione Core, accesso alla lezione, audience, proprietario e revisione della fonte, anche al retry/ack e a connessione aperta. `validateLayerUpdate` controlla strutture binarie/campo autore/source/limiti; **non autentica**. Gli aggiornamenti incompleti richiedono un retry con snapshot completo, nessuna applicazione parziale alla replica live. La ricevuta della porta attuale conferma esattamente requestId/scope/update ricevuti; nessuna autorità derivata dal campo actorId browser.

Revoke/freeze server, consegna e retention sono contratti separati da completare con S10. Nessuna API o persistenza remota simulata. Media S08 usa id/author/source/page/revision nei customData dei tratti proiettati e lo stesso journal/session authority; nessun secondo microfono.
