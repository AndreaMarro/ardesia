# Arduino support matrix — verità congelata (2026-07-12)

Fonte: audit `docs/ops/CODEX-ARDUINO-COMPILE-UPLOAD-AUDIT-2026-07-11.md` (PKT-CODEX-2),
riverificato firsthand su `origin/main` `12d61081` con sweep statico.
Enforcement: `apps/studio/src/__tests__/ArduinoSupportMatrix.test.ts` (suite CI).

Regola prodotto: **la UI non vende supporto a board non end-to-end.** Ogni riga
di questa matrice o è provata da un test/artefatto, o è dichiarata rotta.

## Compile in-browser (subset ATmega328P bounded)

**5/23** sketch Vol.3 compilano col compiler in-browser (`inBrowserAvrCompiler.js`):

`v3-cap5-esp2` · `v3-cap6-esp2` · `v3-cap6-esp3` · `v3-cap6-esp4` · `v3-cap6-esp5`

Gli altri 18 usano costrutti fuori subset (`Serial.*`, `digitalRead`, `analogRead`,
`analogWrite`, `if/while/for`, `map`, ternari, …). Non è un bug: il compiler è
bounded per contratto. Il drift guard M2 arrossisce se il subset cambia in
QUALUNQUE direzione, così la matrice resta onesta.

## Board registry (11 board)

| Board | FQBN | Compile in-browser | Upload dichiarato | End-to-end oggi |
|---|---|---|---|---|
| nano (old bootloader) | `arduino:avr:nano:cpu=atmega328old` | SÌ (subset) | Web Serial STK500v1 | candidato (manca UAT hardware) |
| nano-optiboot | `arduino:avr:nano:cpu=atmega328` | SÌ (subset) | Web Serial STK500v1 | candidato |
| uno | `arduino:avr:uno` | SÌ (subset) | Web Serial STK500v1 | candidato |
| nano-r4 | `arduino:renesas_uno:nanor4` | no | WebUSB DFU (verified:false) / agent locale | NO: descrittori USB non riconciliati, no read-back verify |
| uno-r4-minima / wifi | `arduino:renesas_uno:*` | no | DFU non verificato | NO |
| mega | `arduino:avr:mega:cpu=atmega2560` | **no** (flag falso corretto: il compiler rifiuta atmega2560) | STK500v2 non testato | NO |
| leonardo / nano33iot / nano33ble / nano-esp32 | varie | no | bossa/esptool non implementati | NO |

## Riferimenti HEX rotti noti (quarantena, test M4/M4b)

| Esperimento | Riferimento | Problema |
|---|---|---|
| `v3-cap6-esp5` | `/hex/v3-cap6-esp5.hex` | file ASSENTE in `public/hex` |
| `v3-cap8-esp3` | `/hex/v3-cap8-esp3.hex` | file ASSENTE in `public/hex` |
| `v3-cap6-esp4` | `/hex/v3-cap6-sirena.hex` | punta a sirena.hex mentre esiste anche `v3-cap6-esp4.hex`: quale sia giusto va verificato col libro (gate umano) |

Ratchet: riparare un riferimento richiede togliere la voce dalla quarantena nel
test, che a quel punto pretende il file su disco. Nessuna riparazione silenziosa.

## Contratti divergenti (da riparare, ordine audit §9)

1. `CompileUploadButton` fallback può passare SORGENTE dove serve Intel HEX (P0-1).
2. `CompileButton` IDE manda `{source}` ma l'API accetta `{sketchCode|code}` (P1-1).
3. Upload agent locale richiede `jobId` da compile precedente; il facade vecchio posta raw hex (P0-1).
4. Cloud compile può etichettare `.bin/.elf` come `hexBase64` senza `artifactFormat` (P2-1).
5. Descrittori USB Nano R4 in disaccordo tra `arduinoBoards.js`, `R4DfuUploadButton`, board JSON (P1-2).

## Evidenza event-log (da cablare via superficie FABLE, MAI secondo store)

Payload minimo per `tool.compile.*` / `tool.upload.*`:
`experimentId, sourceKind, sourceSha256, boardId, fqbn, compiler, artifactFormat,
artifactSha256, transport, mode(real|simulated), bytesTransferred, verified, durationMs`.

"Trasferito" ≠ "verificato in esecuzione sulla board": la UI deve distinguere
sempre (`verified:false` oggi su tutta la via DFU R4).
