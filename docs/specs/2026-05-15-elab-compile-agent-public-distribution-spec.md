# SPEC — ELAB Compile Agent Distribuzione Pubblica + Integrazione UI

**Data**: 2026-05-15 PM iter 64 PM finale
**Stato**: PROPOSED — pending Andrea approval HARD-GATE brainstorming
**Mandate Andrea verbatim**: "deve essere proprio disponibile dove ci sono gli esperimenti con arduino e disponibile in generale nella home ide+blockly. Devono poterlo fare tutti, in sicurezza. Documenta tutto. Zero debito tecnico."

---

## 1. Problema

Iter 64 entrance ha shipped ELAB Compile Agent local server (829 LOC + 29 tests + Italian Riccardo guide). MA:

1. **Distribuzione attualmente solo Mac M-series** — Windows + Linux + ChromeOS scuole italiane esclusi
2. **NO UI integration** — agent locale invisibile da ELAB Tutor frontend (HomePage, experiment pages, IDE+Blockly)
3. **Install gate manuale** — utente deve cd + bash script (barriera per docenti non-tecnici)
4. **Security audit non eseguito** per distribuzione pubblica (Riccardo = trusted internal, scuole = public)
5. **Auto-update mancante** — bug fix server.js richiede manual re-clone

**Goal**: rendere "Carica su Nano R4" accessibile a OGNI docente da OGNI punto ELAB Tutor (HomePage + experiment + IDE+Blockly), in sicurezza, zero debito.

---

## 2. Approcci Considerati (3 opzioni)

### Option A: WebUSB-only (browser-direct, NO local agent)

Browser usa WebUSB API → compile server-side (Cloudflare Worker) → download .hex → browser scrive Nano R4 via WebUSB DFU.

- ✅ **Pro**: zero install utente, simple URL, infrastruttura ELAB hosted
- ❌ **Con**: Chrome/Edge ONLY (Safari excluded → escludere ~30% scuole Mac), arduino-cli hosting cost prod (~$10-30/mese), CORS strict, Chrome USB permissions ogni sessione (UX friction)
- ❌ **Risk**: scuole italiane Mac default Safari → esclusione critica, NO supporto
- ⏱ **Time**: ~20-30h infrastructure + 6h frontend integration

### Option B: Native Tauri signed installer

Tauri (Rust + WebView) wrap server.js → desktop app native. Code-signed Apple Dev ID + Microsoft cert.

- ✅ **Pro**: lavora qualsiasi browser, security perception nativa, auto-update Tauri
- ❌ **Con**: $300/anno signing certs (Apple $99 + MS $200), Tauri learning curve Rust, build pipeline complex (cross-compile Mac/Win/Linux), ChromeOS NON supportato
- ❌ **Risk**: Apple notarization workflow lento (settimane primo setup), Andrea NO esperienza Tauri
- ⏱ **Time**: ~40h initial setup + ~8h maintenance ogni release

### Option C: Hybrid bash+PowerShell+browser handshake (**RACCOMANDATO**)

Bash installer Mac (esistente) + PowerShell installer Windows NEW + Linux deb script. Agent run as background service (launchd Mac + Task Scheduler Win + systemd Linux). Browser fetch `http://localhost:17852/health` per auto-detect agent.

- ✅ **Pro**: lavora qualsiasi browser (Safari/Chrome/Firefox/Edge), security loopback only (NO network), install one-time, current architecture preserved, ChromeOS support via PWA fallback simulator-only
- ✅ **Pro**: NO signing certs initial (open-source distribution), Apple Gatekeeper bypass docente-friendly (1 click "Apri comunque")
- ⚠️ **Con**: install required (vs WebUSB zero-install), localhost browser permissions strict alcuni browser
- ⏱ **Time**: ~16h totale (4h Mac install service + 6h Windows installer + 2h Linux + 4h frontend integration)

### Option D: ChromeOS-only path + simulator sufficient

Pure simulator browser (esistente). Upload Nano R4 = opzionale advanced feature solo Omaric customers.

- ✅ **Pro**: zero install, lavora ogni device, simulatore già sufficient per didattica baseline
- ❌ **Con**: limita ELAB Tutor a "simulator only" — perde differenziatore vs Tinkercad (che ha simulator anche)
- ❌ **Con**: triplet Sense 2 (sw ↔ kit ↔ volumi) compromesso — kit fisico Omaric ridotto a "nice to have"

---

## 3. Decisione raccomandata: **Option C HYBRID**

**Rationale**:
1. **Coverage massima**: ogni browser + ogni OS (Mac/Win/Linux) + ChromeOS fallback simulator
2. **Security loopback-only**: server `127.0.0.1` bind preserved, token random per session, NO esposizione rete
3. **Zero infrastructure cost**: NO hosting compile server, NO signing certs $300/anno
4. **Preserve current architecture**: iter 63 P0.5 server.js (663 LOC + 29 tests) riusato 100%
5. **Time-to-ship**: 16h subagent vs 40h Tauri = velocità decisiva per PNRR 2026-06-30 deadline
6. **Reversibilità**: se WebUSB Safari support arriva 2027+, migration path aperto

**Trade-off accettato**: utente fa setup one-time (~5-10 min). Riccardo testing iter 64 dimostra fattibilità.

---

## 4. Architettura dettagliata Option C

### 4.1 Distribution channels (3 OS + Linux + ChromeOS fallback)

| OS | Installer | Service | Update |
|----|-----------|---------|--------|
| **macOS** (Apple Silicon + Intel) | `setup-elab-compile-agent-riccardo.sh` esistente + extend launchd plist | launchd `com.elab.compile-agent.plist` LoadOnLogin | `git pull` from cloned repo OR auto-check version manifest |
| **Windows** (10/11) | PowerShell `Install-Elab-Compile-Agent.ps1` NEW (~150 LOC) | Task Scheduler scheduled task on logon | Same git pull pattern |
| **Linux** (Ubuntu/Fedora) | `install-elab-compile-agent.deb` NEW + systemd unit | systemd user service | apt update OR git pull |
| **ChromeOS** | NON supportato (Crostini Linux required) | Fallback simulator only | N/A |

### 4.2 Browser auto-detect agent

NEW file: `src/services/compileAgentDetect.js` (~100 LOC):

```javascript
// Detect ELAB Compile Agent running localhost
export async function detectCompileAgent(timeout = 1500) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    const res = await fetch('http://localhost:17852/health', {
      signal: ctrl.signal,
      mode: 'cors',
      credentials: 'omit',
    });
    clearTimeout(t);
    if (!res.ok) return { installed: false, reason: `HTTP ${res.status}` };
    const data = await res.json();
    return {
      installed: true,
      arduinoCliVersion: data.arduino_cli_version,
      port: 17852,
    };
  } catch (e) {
    return { installed: false, reason: e.name === 'AbortError' ? 'timeout' : 'connection_refused' };
  }
}

// Singleton state hook
export function useCompileAgentStatus() { /* React hook polls every 30s */ }
```

### 4.3 UI integration 3 punti

#### A. HomePage card NEW

`src/components/HomePage.jsx` add 5° card: "📤 Carica su Nano R4" (visible solo se agent detected OR show "Installa" link).

#### B. Experiment pages

`src/components/lavagna/LavagnaShell.jsx` + experiment-active state: floating button "Carica su Nano R4 reale" (visibility detected).

#### C. IDE+Blockly toolbar

`src/components/lavagna/FloatingToolbar.jsx` add 8° icon "Upload Nano R4" next to "Run in simulator".

### 4.4 Install flow utente public (zero-debito UX)

**HomePage state "Agent NOT installed"**:

```
┌─────────────────────────────────────────┐
│ 📤 Carica Codice su Nano R4 (opzionale) │
│ ─────────────────────────────────────── │
│ Per caricare il codice sulla scheda     │
│ fisica della tua classe, installa ELAB  │
│ Compile Agent una volta sola (~5 min):  │
│                                          │
│ [▶ Mostra istruzioni installazione]     │
│ [💻 Mac] [🪟 Windows] [🐧 Linux]         │
└─────────────────────────────────────────┘
```

Click → modal con 3 tab OS + istruzioni step-by-step Italian (basate su `RICCARDO-UAT-GUIDE.md` esistente).

### 4.5 Auto-update meccanismo

NEW file: `src/services/compileAgentVersion.js`:

```javascript
// Check version manifest hosted on ELAB CDN (Vercel static)
export async function checkAgentUpdate() {
  const local = await fetch('http://localhost:17852/health').then(r => r.json());
  const remote = await fetch('https://elabtutor.school/api/agent-version').then(r => r.json());
  return {
    current: local.version,
    latest: remote.version,
    updateAvailable: local.version !== remote.version,
    changelog: remote.changelog,
  };
}
```

Banner non-invasivo "Aggiornamento disponibile" in HomePage settings (NOT modal blocking).

### 4.6 Security hardening per distribuzione pubblica

**Requisiti security** pre-public distribution (mandate Andrea "in sicurezza"):

1. **Token rotation**: token openssl rand 16-hex ad ogni server start (NON persisted). Browser ottiene token via handshake `/auth/init` (CORS preflight) only same-origin.
2. **Origin allowlist**: server.js CORS allowlist HARDENING — `localhost:5173` (dev) + `elabtutor.school` prod + `127.0.0.1` only. NO wildcard origin.
3. **Rate limit per IP**: 60 req/min preserved (current). Lower 30 req/min for distrib public.
4. **No external network calls** from agent: server.js verify NO `fetch()` to non-loopback hosts (security audit subagent).
5. **Sandboxed temp dir**: job uuid temp dir `os.tmpdir()/elab-arduino/<uuid>/` isolated (current). Audit per uuid leak.
6. **No code execution untrusted code**: arduino-cli stdout only logs (NO shell injection — current `spawn` array args).
7. **Update mechanism signed**: version manifest ELAB CDN signed HMAC (server.js verifies signature).
8. **Telemetry OFF default**: no usage data sent ELAB (privacy respect Italian docenti).
9. **GDPR compliance**: ZERO student data collected da agent (only arduino-cli output + Flash/SRAM bytes — non personal data).
10. **Code signing path future**: Apple Dev ID + Microsoft cert iter 65+ (NOT this iter, reversibility preserved).

### 4.7 Distribution mechanism

- **Repo pubblico** GitHub: `elab-tutor/compile-agent` (Andrea action: crea repo open-source MIT license)
- **Landing page**: `elabtutor.school/agent` con 3 OS install buttons + RICCARDO-UAT-GUIDE.md Italian
- **CDN version manifest**: `elabtutor.school/api/agent-version` (Cloudflare Worker static OR Vercel API)
- **Update push**: notification "Aggiornamento disponibile" non-invasivo

---

## 5. Roadmap atomization (16h subagent + 4h frontend)

| Atom | Owner | LOC stima | Time | Dependency |
|------|-------|-----------|------|------------|
| **R1**: Windows PowerShell installer (`Install-Elab-Compile-Agent.ps1`) | subagent | 150 | 4h | None |
| **R2**: Linux .deb + systemd installer | subagent | 100 | 2h | None |
| **R3**: launchd plist Mac service (background autostart) | subagent | 50 | 2h | R1 |
| **R4**: `compileAgentDetect.js` browser auto-detect helper | subagent | 100 | 1h | None |
| **R5**: HomePage "Carica Nano R4" card | subagent | 150 | 2h | R4 |
| **R6**: LavagnaShell experiment-active upload button | subagent | 80 | 2h | R4 |
| **R7**: FloatingToolbar IDE+Blockly upload icon | subagent | 60 | 1h | R4 |
| **R8**: Install modal 3 OS tab + instructions | subagent | 200 | 2h | R5 |
| **R9**: Version manifest endpoint + check | subagent | 80 | 2h | R3 |
| **R10**: Security audit subagent (READ-ONLY) | subagent | 0 (docs only) | 3h | None |
| **R11**: Tech-debt audit subagent (READ-ONLY) | subagent | 0 (docs only) | 3h | None |
| **R12**: Integration tests E2E (HomePage detect + experiment upload) | subagent | 200 | 2h | R5-R7 |

**Total**: ~1170 LOC + audits, ~22h dev cascade iter 65-66.

---

## 6. Acceptance criteria

1. ✅ Docente Mac OS Safari → HomePage rileva agent installato + "Carica Nano R4" button visibile
2. ✅ Docente Windows 11 Chrome → idem
3. ✅ Docente Linux Firefox → idem
4. ✅ Docente ChromeOS → simulator-only (no upload), graceful "Hardware upload non supportato su ChromeOS"
5. ✅ Agent install via single command per OS (~5 min utente azione)
6. ✅ Auto-update notification non-invasiva quando nuova versione disponibile
7. ✅ Vitest baseline preserved + 200+ NEW tests (R12 E2E)
8. ✅ Build PASS exit 0
9. ✅ Security audit shipped + 0 critical vulnerabilities trovate
10. ✅ Tech-debt audit shipped + roadmap iter 66+ cleanup
11. ✅ PRINCIPIO ZERO + MORFISMO 8/8 PASS (Italian copy + plurale "Ragazzi" + kit fisico protagonista)
12. ✅ ZERO `--no-verify` bypass + ZERO push origin (Andrea PR gate)

---

## 7. PRINCIPIO ZERO + MORFISMO compliance

- ✅ **Linguaggio plurale "Ragazzi"**: install modal copy + experiment upload button labels Italian docente-friendly
- ✅ **Vol/pag verbatim**: NOT applicable (UI distribution, NO content)
- ✅ **Kit fisico Omaric SEMPRE protagonista**: feature ELEVATA dimensione (current iter 63 sempre simulator-first, ora upload reale SEMPRE PRIMA opzione utente)
- ✅ **NOT Galileo**: UNLIM canonical preserved
- ✅ **Mascotte UNLIM**: install modal può includere ElabMascotte SVG "Riccardo style" friendly guide
- ✅ **Triplet Sense 2 RINFORZATO**: software ↔ kit ↔ volumi triplet — questa feature è MORFISMO Sense 2 LIVE EXECUTION (sw connette direttamente al kit hardware)
- ✅ **Multimodale**: NOT applicable
- ✅ **Aggiornabile coerentemente**: auto-update meccanismo iter 66 + version manifest CDN

---

## 8. Honesty caveats critical

1. **Windows/Linux NOT tested** by Andrea — script logical reasoning only, real-world clean-state test deferred iter 66+ via volontari (cercare 2-3 docenti pilot Windows + Linux)
2. **ChromeOS gap accettato**: simulator-only fallback, NO upload reale. Differentiatore vs Tinkercad preservato (kit fisico+volumi Sense 2)
3. **Code signing NOT this iter**: Apple Dev ID $99/anno + Microsoft cert ~$200/anno DEFER iter 67+ post pilot success. Apple Gatekeeper bypass "Apri comunque" workflow utente accettato iter 65-66 (vedi RICCARDO-UAT-GUIDE.md Italian instructions).
4. **Auto-update telemetry**: version check fetch CDN = minimal telemetry (1 GET request, no user data). OFF by default opt-in iter 67+ se GDPR audit conferma.
5. **Repo pubblico TBD**: Andrea action crea `github.com/elab-tutor/compile-agent` repo open-source iter 65 entrance.

---

## 9. Cascade rationale (perché 16h subagent NOW vs DEFER)

- **PNRR deadline 2026-06-30**: 6 settimane residue (iter 64 PM). Feature distribuzione pubblica = differentiatore commerciale critico vs Tinkercad/Wokwi.
- **Riccardo iter 64 P0.1**: pacchetto distribuibile SHIPPED iter 64 → estensione public-ready logico next step iter 65-66.
- **Andrea mandate verbatim**: "deve essere proprio disponibile dove ci sono gli esperimenti" + "Devono poterlo fare tutti, in sicurezza" — clear scope expansion.
- **Zero debito tecnico**: design Option C preserva current arch + extend platforms (NO rewrite). Audit-first (R10+R11) prima implementation = security/tech-debt zero-gap path.

---

## 10. Out of scope (defer iter 67+)

- Code signing Apple Dev ID + Microsoft cert
- Auto-update telemetry advanced (only basic version check iter 66)
- ChromeOS Crostini support (rare ELAB usage scuole italiane)
- iOS Safari support (NO USB upload mobile, scuole desktop-first)
- Browser WebUSB fallback (deferred 2027+ se Safari support arriva)
- Update push notification system (current = banner non-invasivo in HomePage)
- Multi-board support oltre Nano R4 (deferred iter 70+ se Omaric espande kit hardware)

---

## 11. Andrea ratify gate iter 65 entrance

Andrea decisione necessaria PRIMA dispatch implementation:

1. **Option C HYBRID ratify** SI/MODIFY/RICERCA-A-D-alternative
2. **Repo pubblico GitHub**: crea `elab-tutor/compile-agent` MIT license SI/NO/PRIVATE-instead
3. **Pilot Windows/Linux volontari**: cerca 2-3 docenti pilot iter 66 SI/DEFER/NO-pilot-needed
4. **Security audit + tech-debt audit DISPATCH NOW**: SI subagent parallel iter 64 entrance OR DEFER iter 65+

---

**End spec. Total LOC 1170 + audits. Time 22h subagent. Score iter 65+ target lift +0.3 ONESTO conditional implementation + pilot success.**
