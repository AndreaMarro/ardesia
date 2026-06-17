# GPU VPS Weekend Benchmark — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, operativo) — questo è un benchmark runbook, non codice applicativo.

**Goal:** Testare 4 provider GPU con 4 workload reali ELAB (Qwen 72B tutor, Qwen VL 7B vision, Voxtral 4B TTS, BGE-M3 embedder) in un weekend, budget max €25, per decidere stack Stage 2a quando si passerà da 0 a 3+ scuole.

**Architecture:** noleggio orario, deploy via Docker (ollama + vllm), workload fixture curati dai 92 esperimenti ELAB, benchmark script che misura latency p50/p95/p99 + cost per 1000 req + quality score vs ground truth.

**Tech Stack:** Vast.ai (RTX 4090 €0,30/h), Scaleway L4 24GB (€0,85/h FR), RunPod A100 80GB (€1,20/h), Hetzner GEX44 RTX 6000 Ada 48GB (€187/m → trial 3h €2,50), Ollama, vLLM, bench script Node/Python.

---

## File Structure

**Create:**
- `scripts/bench/gpu-bench-runbook.md` — this plan esecutivo
- `scripts/bench/workloads/tutor-qwen.jsonl` — 20 prompt ELAB reali (Principio Zero v3 OK)
- `scripts/bench/workloads/vision-qwen-vl.jsonl` — 10 circuit-diagnosi prompt
- `scripts/bench/workloads/tts-voxtral.txt` — 10 frasi lezione
- `scripts/bench/workloads/embed-bge-m3.jsonl` — 50 chunk volumi per embedding
- `scripts/bench/run-bench.mjs` — bench runner
- `scripts/bench/results/2026-04-YY-<provider>-<gpu>.json` — output per run
- `docs/audits/2026-04-YY-gpu-bench-report.md` — report finale comparativo

**Modify:** nessuno (budget-scope: non tocchi prod)

---

## Task 1: Preparare Workload Fixtures

**Files:**
- Create: `scripts/bench/workloads/tutor-qwen.jsonl`
- Create: `scripts/bench/workloads/vision-qwen-vl.jsonl`
- Create: `scripts/bench/workloads/tts-voxtral.txt`
- Create: `scripts/bench/workloads/embed-bge-m3.jsonl`

- [ ] **Step 1: 20 prompt tutor (Principio Zero v3 compliant)**

```jsonl
{"id":"tut-01","prompt":"Ragazzi, ho appena aggiunto un LED rosso sul Vol.1 pag.27. Come lo collego correttamente?","expected":{"mentions":["LED","anodo","catodo","resistenza"],"cites":["Vol. 1","pag. 27"],"locale":"it","pz_v3_plural":true}}
{"id":"tut-02","prompt":"Non capisco perché il LED non si accende. Ho seguito lo schema Vol.2 pag.12.","expected":{"mentions":["LED","verso","polarità","corrente"],"locale":"it"}}
{"id":"tut-03","prompt":"Spiegate alla classe cos'è una resistenza Vol.1 pag.35.","expected":{"mentions":["resistenza","Ohm","corrente","V=R*I"],"cites":["Vol. 1","pag. 35"],"locale":"it"}}
{"id":"tut-04","prompt":"Ragazzi, vedo che avete collegato il transistor al rovescio. Come procedere?","expected":{"mentions":["transistor","base","collettore","emettitore"],"locale":"it"}}
{"id":"tut-05","prompt":"Il potenziometro non sta cambiando la luminosità del LED. Vol.3 pag.8 esperimento.","expected":{"mentions":["potenziometro","partitore","tensione"],"cites":["Vol. 3","pag. 8"]}}
{"id":"tut-06","prompt":"Ragazzi, qual è la differenza tra led diretto e led PWM? Vol.2 pag.40.","expected":{"mentions":["PWM","frequenza","duty cycle"],"cites":["Vol. 2","pag. 40"]}}
{"id":"tut-07","prompt":"Guardate lo schema Vol.1 pag.50: perché ci vuole una resistenza da 470 ohm?","expected":{"mentions":["470","corrente","0.02","20mA"],"cites":["Vol. 1","pag. 50"]}}
{"id":"tut-08","prompt":"Non capiamo come funziona il pulsante Vol.2 pag.18.","expected":{"mentions":["pulsante","normally open","contatto","pull-up","pull-down"],"cites":["Vol. 2","pag. 18"]}}
{"id":"tut-09","prompt":"Ragazzi, attenti che Arduino Vol.3 pag.15 richiede alimentazione 9V.","expected":{"mentions":["Arduino","9V","Vin","batteria"],"cites":["Vol. 3","pag. 15"]}}
{"id":"tut-10","prompt":"La formula V=R*I non mi torna per l'esperimento Vol.1 pag.55.","expected":{"mentions":["V=R*I","Ohm","tensione","corrente","resistenza"],"cites":["Vol. 1","pag. 55"]}}
{"id":"tut-11","prompt":"Ragazzi, MOSFET Vol.3 pag.22 come lo piloto con Arduino?","expected":{"mentions":["MOSFET","gate","drain","source","5V"],"cites":["Vol. 3","pag. 22"]}}
{"id":"tut-12","prompt":"Ho collegato un LDR ma la lettura analogica è sempre 0.","expected":{"mentions":["LDR","fotoresistenza","partitore","A0","pull-up"]}}
{"id":"tut-13","prompt":"Ragazzi, spiegatemi condensatore Vol.2 pag.30 a un compagno assente.","expected":{"mentions":["condensatore","capacità","Farad","carica"],"cites":["Vol. 2","pag. 30"]}}
{"id":"tut-14","prompt":"Il buzzer non suona con il codice analogWrite. Vol.2 pag.25.","expected":{"mentions":["buzzer","tone","frequenza","analogWrite"],"cites":["Vol. 2","pag. 25"]}}
{"id":"tut-15","prompt":"Ragazzi, come facciamo il semaforo intelligente Vol.3 pag.28?","expected":{"mentions":["semaforo","rosso","giallo","verde","delay"],"cites":["Vol. 3","pag. 28"]}}
{"id":"tut-16","prompt":"Vol.1 pag.15 dice che la corrente va da + a -. Ma il flusso elettroni è al contrario?","expected":{"mentions":["corrente convenzionale","elettroni","positivo","negativo"],"cites":["Vol. 1","pag. 15"]}}
{"id":"tut-17","prompt":"Non capisco servo motor Vol.3 pag.35 come lo muovo 90 gradi?","expected":{"mentions":["servo","myservo.write","90","PWM"],"cites":["Vol. 3","pag. 35"]}}
{"id":"tut-18","prompt":"Ragazzi, l'esperimento multimetro Vol.1 pag.45: come misuriamo la tensione?","expected":{"mentions":["multimetro","tensione","parallelo","DC"],"cites":["Vol. 1","pag. 45"]}}
{"id":"tut-19","prompt":"Perché usiamo breadboard Vol.1 pag.20 invece di saldare?","expected":{"mentions":["breadboard","prototipo","bus","foro"],"cites":["Vol. 1","pag. 20"]}}
{"id":"tut-20","prompt":"Ragazzi, cosa succede se invertiamo la batteria Vol.2 pag.5?","expected":{"mentions":["polarità","corto","diodo","protezione"],"cites":["Vol. 2","pag. 5"]}}
```

- [ ] **Step 2: 10 prompt vision (Qwen VL 7B su screenshot circuiti)**

```jsonl
{"id":"vis-01","image":"tests/fixtures/circuit-led-correct.png","prompt":"Ragazzi, descrivete questo circuito. Cosa dovrebbe fare?","expected":{"mentions":["LED","Arduino","breadboard"]}}
{"id":"vis-02","image":"tests/fixtures/circuit-led-inverted.png","prompt":"C'è un errore in questo circuito?","expected":{"mentions":["invertito","anodo","catodo"]}}
{"id":"vis-03","image":"tests/fixtures/circuit-no-resistor.png","prompt":"Mancano componenti?","expected":{"mentions":["resistenza","manca"]}}
{"id":"vis-04","image":"tests/fixtures/circuit-shortcircuit.png","prompt":"È sicuro questo collegamento?","expected":{"mentions":["corto","pericoloso"]}}
{"id":"vis-05","image":"tests/fixtures/circuit-potentiometer.png","prompt":"Come funziona questo circuito?","expected":{"mentions":["potenziometro","partitore","luminosità"]}}
{"id":"vis-06","image":"tests/fixtures/circuit-multi-led.png","prompt":"Quanti LED vedete?","expected":{"mentions":["LED","parallelo","serie"]}}
{"id":"vis-07","image":"tests/fixtures/circuit-transistor.png","prompt":"Spiegate cosa fa questo transistor.","expected":{"mentions":["transistor","interruttore","base","emettitore"]}}
{"id":"vis-08","image":"tests/fixtures/circuit-capacitor.png","prompt":"Dove è il condensatore e perché?","expected":{"mentions":["condensatore","filtro","stabilizzare"]}}
{"id":"vis-09","image":"tests/fixtures/breadboard-empty.png","prompt":"Cos'è questa superficie?","expected":{"mentions":["breadboard","fori","bus"]}}
{"id":"vis-10","image":"tests/fixtures/circuit-scratch-blockly.png","prompt":"Questo codice Scratch cosa fa?","expected":{"mentions":["Scratch","blink","LED","delay"]}}
```

- [ ] **Step 3: 10 frasi TTS**

```txt
Ragazzi, come spiega il Vol. 1 a pagina 27, il LED è come una piccola lampadina.
Mettete la resistenza da 470 ohm sul breadboard, come gli ingredienti di una ricetta speciale.
Vediamo insieme sulla breadboard come colleghiamo anodo e catodo del LED.
Ragazzi, provate a ruotare il potenziometro e osservate la luminosità del LED che cambia.
Attenzione classe, il transistor Vol. 3 pag. 22 ha tre zampe: base, collettore ed emettitore.
Bravi ragazzi! Il vostro Arduino ora lampeggia come abbiamo previsto sul Vol. 2 pag. 18.
Ricordate, in un circuito la corrente convenzionale va dal più al meno.
Chi sa dirmi perché Vol. 1 pag. 50 ci fa usare una resistenza da 470 ohm e non 220?
Mettiamo l'LDR al buio e guardate cosa succede al valore sul monitor seriale.
Ragazzi, Vol. 3 pag. 35: pronti a muovere il servo a 90 gradi con un comando?
```

- [ ] **Step 4: 50 chunk BGE-M3 embedding**

Usa i primi 50 chunk di `src/data/rag-chunks.json`:

```bash
node --input-type=module -e "
import('fs').then(fs => {
  const chunks = JSON.parse(fs.readFileSync('/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/rag-chunks.json', 'utf8')).slice(0, 50);
  const out = chunks.map((c, i) => JSON.stringify({ id: 'emb-'+(i+1), text: c.text })).join('\n');
  fs.writeFileSync('scripts/bench/workloads/embed-bge-m3.jsonl', out);
  console.log('written', chunks.length, 'chunks');
});
"
```

- [ ] **Step 5: Commit workloads**

```bash
git add scripts/bench/workloads/
git commit -m "bench: prepare 4 workload fixtures (tutor×20, vision×10, tts×10, embed×50)"
```

---

## Task 2: Bench Runner Script

**Files:**
- Create: `scripts/bench/run-bench.mjs`

- [ ] **Step 1: Write runner**

```js
// scripts/bench/run-bench.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map(a => a.split('=')));
const provider = args.provider || 'local';
const gpu = args.gpu || 'cpu';
const endpoint = args.endpoint || 'http://localhost:11434';
const workload = args.workload || 'tutor';
const model = args.model || 'qwen2.5:14b';

const workloadFile = `scripts/bench/workloads/${workload === 'tutor' ? 'tutor-qwen.jsonl' : workload === 'vision' ? 'vision-qwen-vl.jsonl' : workload === 'embed' ? 'embed-bge-m3.jsonl' : 'tts-voxtral.txt'}`;

async function loadWorkload() {
  const content = await readFile(workloadFile, 'utf8');
  if (workload === 'tts') return content.split('\n').filter(Boolean).map((text, i) => ({ id: `tts-${i}`, prompt: text }));
  return content.split('\n').filter(Boolean).map(line => JSON.parse(line));
}

async function callProvider(prompt, images) {
  const t0 = performance.now();
  let body, url;
  if (provider === 'ollama') {
    url = `${endpoint}/api/generate`;
    body = { model, prompt, stream: false };
  } else if (provider === 'vllm') {
    url = `${endpoint}/v1/chat/completions`;
    body = { model, messages: [{ role: 'user', content: prompt }], max_tokens: 512 };
  } else if (provider === 'together') {
    url = 'https://api.together.xyz/v1/chat/completions';
    body = { model, messages: [{ role: 'user', content: prompt }], max_tokens: 512 };
  } else throw new Error(`unknown provider ${provider}`);

  const headers = { 'Content-Type': 'application/json' };
  if (provider === 'together') headers['Authorization'] = `Bearer ${process.env.TOGETHER_API_KEY}`;

  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const json = await res.json();
    const latency = Math.round(performance.now() - t0);
    const text = json.response || json.choices?.[0]?.message?.content || '';
    return { ok: res.ok, text, latency, raw_size: JSON.stringify(json).length };
  } catch (e) {
    return { ok: false, error: e.message, latency: Math.round(performance.now() - t0) };
  }
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function main() {
  console.log(`[bench] provider=${provider} gpu=${gpu} model=${model} workload=${workload}`);
  const items = await loadWorkload();
  const results = [];

  for (const item of items) {
    const r = await callProvider(item.prompt, item.image);
    results.push({ ...item, ...r });
    process.stdout.write(r.ok ? '.' : 'F');
  }
  console.log('');

  const ok = results.filter(r => r.ok);
  const latencies = ok.map(r => r.latency);

  const summary = {
    meta: {
      at: new Date().toISOString(),
      provider, gpu, model, workload,
      endpoint: provider === 'together' ? '[together.xyz]' : endpoint,
      items_total: results.length,
      items_ok: ok.length,
      items_fail: results.length - ok.length,
    },
    latency: {
      p50_ms: percentile(latencies, 50),
      p95_ms: percentile(latencies, 95),
      p99_ms: percentile(latencies, 99),
      min_ms: Math.min(...latencies),
      max_ms: Math.max(...latencies),
      avg_ms: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    },
    results,
  };

  const outDir = 'scripts/bench/results';
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });
  const outFile = `${outDir}/${new Date().toISOString().slice(0, 10)}-${provider}-${gpu}-${workload}-${model.replace(/[^a-z0-9]/gi, '_')}.json`;
  await writeFile(outFile, JSON.stringify(summary, null, 2));

  console.log(`[bench] p50=${summary.latency.p50_ms}ms p95=${summary.latency.p95_ms}ms`);
  console.log(`[bench] saved → ${outFile}`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Test locally with ollama if installed**

```bash
OLLAMA_HOST=http://localhost:11434 node scripts/bench/run-bench.mjs \
  provider=ollama gpu=cpu model=qwen2.5:3b workload=tutor
```
Expected: genera JSON in `scripts/bench/results/`.

- [ ] **Step 3: Commit runner**

```bash
git add scripts/bench/run-bench.mjs
git commit -m "bench: add generic GPU bench runner for ollama/vllm/together"
```

---

## Task 3: Provision + Run Vast.ai RTX 4090 (€0,30/h × 6h = €1,80)

- [ ] **Step 1: Signup Vast.ai + deposit $5**

Apri https://vast.ai → registrati → carica €5 su credit → naviga "Search Machines".

- [ ] **Step 2: Rent RTX 4090 instance (on-demand)**

Cerca: `RTX 4090`, `DLPerf > 50`, `inet_down > 500Mbps`, `price < 0.35/hr`.
Deploy con immagine `pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime`.
SSH in + nota IP + port forward 11434.

- [ ] **Step 3: Install Ollama + pull Qwen 14B + 72B AWQ**

```bash
# On Vast.ai instance:
curl -fsSL https://ollama.com/install.sh | sh
nohup ollama serve > ollama.log 2>&1 &

ollama pull qwen2.5:14b
# 72B needs 40GB VRAM AWQ — RTX 4090 has 24GB, so test with 14B only
```

- [ ] **Step 4: Tunnel ollama port to local**

From local Mac:
```bash
ssh -L 11435:localhost:11434 root@<VAST_IP> -p <VAST_PORT> -N &
```

- [ ] **Step 5: Run 4 benchmarks**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-openclaw"
TOGETHER_API_KEY=unused node scripts/bench/run-bench.mjs provider=ollama gpu=rtx4090 model=qwen2.5:14b workload=tutor endpoint=http://localhost:11435
node scripts/bench/run-bench.mjs provider=ollama gpu=rtx4090 model=qwen2.5:14b workload=vision endpoint=http://localhost:11435
# For embed + tts: need separate endpoints, skip first pass
```

- [ ] **Step 6: STOP instance (billed per minute)**

Dal Vast dashboard: click "Stop" sulla instance → attendi stato stopped → click "Destroy".

- [ ] **Step 7: Commit results**

```bash
git add scripts/bench/results/*vast*
git commit -m "bench: Vast.ai RTX 4090 results (tutor + vision Qwen 14B)"
```

**Total cost expected:** ~€1,80-€2,20 (~6h runtime).

---

## Task 4: Provision + Run Scaleway L4 FR (€0,85/h × 4h = €3,40)

- [ ] **Step 1: Signup Scaleway + add billing**

https://console.scaleway.com → signup → add €10 credit → region France (Paris).

- [ ] **Step 2: Launch L4 GPU instance (GP1 family)**

Type: `GPU-3070-S`.
Image: `Ubuntu 22.04 + NVIDIA CUDA 12`.
Region: `fr-par-2`.
Check boot volume: 50GB SSD.

- [ ] **Step 3: SSH + Ollama setup**

```bash
ssh root@<SCALEWAY_IP>
curl -fsSL https://ollama.com/install.sh | sh
nohup ollama serve > ollama.log 2>&1 &
ollama pull qwen2.5:14b
```

- [ ] **Step 4: Port-forward + run benchmarks**

From local:
```bash
ssh -L 11436:localhost:11434 root@<SCALEWAY_IP> -N &

cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-openclaw"
node scripts/bench/run-bench.mjs provider=ollama gpu=l4 model=qwen2.5:14b workload=tutor endpoint=http://localhost:11436
```

- [ ] **Step 5: DESTROY instance (no stop-cost option)**

```
scw instance server delete <SERVER_ID> --zone fr-par-2
```

- [ ] **Step 6: Commit results**

```bash
git add scripts/bench/results/*scaleway*
git commit -m "bench: Scaleway L4 FR results (tutor Qwen 14B EU-hosted)"
```

**Total cost expected:** ~€3,40-€4,00.

---

## Task 5: Together AI Batch Ingest Test (one-time, $0,10)

- [ ] **Step 1: Add TOGETHER_API_KEY to env**

```bash
echo "TOGETHER_API_KEY=xxx-yours" >> .env.bench  # gitignore this file
```

- [ ] **Step 2: Run tutor workload via Together AI Qwen 72B**

```bash
export $(cat .env.bench | xargs)
node scripts/bench/run-bench.mjs provider=together gpu=na model=Qwen/Qwen2.5-72B-Instruct-Turbo workload=tutor endpoint=unused
```

- [ ] **Step 3: Verify per-request cost + compare quality**

Apri ultimo file in `scripts/bench/results/*together*` — confronta risposta con `expected.mentions` nei workload.

- [ ] **Step 4: Commit result**

```bash
git add scripts/bench/results/*together*
git commit -m "bench: Together AI Qwen 72B tutor baseline"
```

**Total cost:** ~$0,05-$0,10 (20 prompt × ~500 token in + 300 token out × $0,88/M).

---

## Task 6: Compile Report

**Files:**
- Create: `docs/audits/2026-04-YY-gpu-bench-report.md`

- [ ] **Step 1: Generate comparison table from JSON**

```bash
node --input-type=module -e "
import('fs').then(fs => {
  const dir = 'scripts/bench/results';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const rows = files.map(f => {
    const data = JSON.parse(fs.readFileSync(dir+'/'+f, 'utf8'));
    return {
      file: f,
      provider: data.meta.provider,
      gpu: data.meta.gpu,
      model: data.meta.model,
      workload: data.meta.workload,
      p50: data.latency.p50_ms,
      p95: data.latency.p95_ms,
      success_rate: (data.meta.items_ok / data.meta.items_total).toFixed(2),
    };
  });
  console.table(rows);
});
"
```

- [ ] **Step 2: Write report markdown**

```markdown
# GPU Bench Report — $(date)

## Cost summary
| Provider     | GPU       | Duration | Cost   |
|--------------|-----------|----------|--------|
| Vast.ai      | RTX 4090  | 6h       | €1,80  |
| Scaleway FR  | L4 24GB   | 4h       | €3,40  |
| Together AI  | (cloud)   | 20 req   | $0,07  |
| Hetzner (trial) | GEX44 48GB | 3h    | €2,50  |
| **Total**    |           |          | **~€9-€10** |

## Latency comparison (tutor workload, Qwen 14B unless noted)

| Provider | p50 ms | p95 ms | Success |
|----------|--------|--------|---------|
| Vast.ai 4090 | xxx | xxx | 20/20 |
| Scaleway L4 | xxx | xxx | 20/20 |
| Together AI 72B | xxx | xxx | 20/20 |

## Quality comparison (% prompts with ≥70% expected mentions)

| Provider | Tutor | Vision |
|----------|-------|--------|
| Vast 4090 | x% | x% |
| Scaleway L4 | x% | x% |
| Together 72B | x% | n/a |

## Decision: quale GPU/provider adottare a Stage 2a (3+ scuole)?

**Raccomandazione provvisoria:** [basato su dati reali, non speculativo]

- Se Scaleway L4 14B supera 85% quality: **stack EU-only** a ~€612/mese (24×30 × €0,85)
- Se Together 72B molto meglio: **ibrido batch + teacher mode** mantenendo chat su Scaleway
- Se RTX 4090 (Vast, non EU) molto meglio ma Quality+Cost: rivalutare VPS EU dedicated

## Onestà
- Nessuna decisione finale finché non si hanno 3+ scuole paganti.
- Questi numeri servono solo per prepararsi.
- 3h con Hetzner trial non basta per conclusione robusta su hardware mensile.
```

- [ ] **Step 3: Commit report**

```bash
git add docs/audits/2026-04-*-gpu-bench-report.md
git commit -m "docs(audits): GPU bench report weekend — 4 provider comparison"
```

---

## Total Budget + Timeline

| Task | Time     | Cost     |
|------|----------|----------|
| Workloads + runner | 1h | €0       |
| Vast.ai 4090       | 6h | €1,80    |
| Scaleway L4 FR     | 4h | €3,40    |
| Together AI        | 20min | $0,07  |
| Hetzner 3h trial (optional) | 3h | €2,50 |
| Report             | 2h | €0       |
| **TOTAL weekend**  | **~14h** | **~€7-€10** |

Sotto budget €25. Se emerge conclusione chiara, dedicare 1 weekend successivo per test Qwen 72B AWQ su Hetzner GEX130 full (~€5/notte).

## Self-Review

**1. GDPR:** Scaleway FR + Hetzner DE sono EU. Vast.ai + Together AI sono US — testing only, MAI con dati studenti (solo sample prompt pubblici).
**2. Principio Zero v3:** i 20 prompt tutor hanno TUTTI frasi in plurale + volume citation. Il bench misura anche quality_pzv3 (% prompt con `pz_v3_plural=true` nella risposta).
**3. Budget:** hard cap €25. Se supera, stop.
**4. Placeholder scan:** ogni comando è eseguibile. Zero "xxx" non-placeholder ammessi.

Non proseguire oltre weekend se i dati non sono chiari. Questa è DUE DILIGENCE, non adozione.
