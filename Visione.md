# Visione

Fonte: `~/maestro-docs/PLATFORM-MAESTRO.md` (v2 canonico, 11/06), `~/maestro-docs/MAESTRO-VISIONE.md` (10/06), `~/ardesia-wiki/Architettura/ARDESIA-ALIGNMENT.md` (carta 13/06).

## Tesi
**Apprendimento orizzontale.** Chi insegna impara e viceversa: docente/discente e una proprieta della RELAZIONE, non della persona. La piattaforma si personalizza su chi ha davanti, si adatta agli sviluppi tecnologici, fa guadagnare i tutor capaci, e punta a superare la dicotomia istruzione pubblica/privata. Estetica come prodotto, non cosmesi.

## La catena del prodotto
Lavagna che registra -> grafo del "come spieghi" (NON training del modello) -> dispense/contenuti verificati nel tuo stile -> vetrina + marketplace di tool didattici.

| # | Blocco | Cosa fa | Stato |
|---|---|---|---|
| 1 | Lavagna che registra (Studio) | cattura scritto + audio docente opzionale; video = fase futura | M0 (T0-T3) |
| 2 | Motore semantico (LessonOS) | ASR locale -> capsule -> grafo per-docente (concetti, prerequisiti, evidenze verbatim) | M0-M1 |
| 3 | Riepilogo per lezione | markdown grounded, citazioni verificate claim-per-claim | M0 |
| 4 | Contenuti nello stile | dopo N lezioni: dispense/libri generati dallo stile+contenuto del docente, verificati | M1-4 in corso |
| 5 | Vetrina social (cloud sottile) | profili, scoperta, pagamento al prezzo del tutor, recensioni | M2-M3 |
| 6 | Tool didattici (ToolHost) | plugin visuali/interattivi creati/venduti da terzi o dal docente | M2 |
| 7 | Videochiamata | NON integrata: Meet esterno, link-out | deciso (Jitsi rimosso) |

## Principi non negoziabili
- **Local-first / GDPR Mode A strutturale**: contenuti e lezioni sul PC del docente; il cloud ha solo la vetrina. Audio mai in cloud, zero voci studenti by-design (la voce e dato biometrico). E il moat: NotebookLM Enterprise ammette feature non EU-ML-compliant; TeachFX manda voci studenti in cloud.
- **AI metodologica, non sostitutiva**: mappa il metodo del docente (grafo concetti, ricorrenze, betweenness), non addestra un modello sui suoi dati.
- **Niente addestramento del modello**: solo memoria formalizzata del modo di spiegare.
- **Tool comprati immutabili** (solo settings, mai fork; coerente con firma ed25519). Vedi [[Sicurezza]].
- **Recensioni a due pesi**: il docente vota l usabilita del tool; lo studente vota l efficacia della lezione. Minori solo in aggregato anonimo.
- **Business**: zero fee sulle lezioni (il docente trattiene il 100%); ricavi = abbonamento SaaS docente + vendita plugin del marketplace + piani a potenza (piu paghi, piu compute/verifiche/lunghezza).

## Persona e go-to-market
- **Motion 1 — Tutor (subito)**: B2C/prosumer, ~15 euro/mese; i 10 piloti sono questo segmento; zero procurement.
- **Motion 2 — Scuole (dopo)**: per-istituto via Privacy Pack + MePA (canale Davide). Qui vive anche ELAB. Motore identico, cambiano linguaggio/pricing/copy.

## ELAB Tutor = sottoinsieme a massima importanza
ELAB deve raggiungere la forma piu completa COME tool della piattaforma. Due binari che NON violano la separazione dei repo:
1. Harvest unidirezionale (continuo): componenti Ardesia maturi portati dentro elab-tutor in sessioni separate.
2. ELAB-as-Tool (gated M2): ELAB si aggancia come primo grande tool first-party, dietro il bus ToolHost. Zero codice ELAB nel core. T4 fatto: sim Arduino come tool firmato, demo Blink.

## Anti-derive
Niente marketplace/recensioni prima dei gate M4. Niente claim "supera la scuola" prima delle prove (blind-test M1, vendite reali M2-M3). La filosofia non sostituisce i gate.

Vedi anche: [[Architettura-Sistema]], [[Allineamento-Due-Claude]], [[Glossario]].
