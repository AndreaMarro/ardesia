# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lab.spec.ts >> keyboard and touch select nodes and reconnect branches through accessible controls
- Location: tests/lab.spec.ts:38:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('answer')
Expected substring: "12 V"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByTestId('answer')

```

```yaml
- main:
  - link "ardesia.":
    - /url: /?view=courses
  - text: LABORATORIO / ELETTROTECNICA
  - link "Torna ai corsi ↗":
    - /url: /?view=courses
  - paragraph: 01 — NODI E CORRENTI
  - heading "Il circuito, passo dopo passo." [level=1]
  - paragraph: Prevedi una grandezza. Scrivi il bilancio delle correnti. Verifica il tuo ragionamento sul circuito che hai costruito.
  - complementary:
    - text: DC · LEZIONE IN REVISIONE
    - paragraph: Resistori e generatori ideali indipendenti. Valori in unità SI, calcolo esatto.
    - button "Affronta un circuito nuovo ↗"
  - heading "1. Esplora e modifica" [level=2]
  - text: 2 nodi · 3 rami
  - paragraph: Ogni collegamento è un componente. La freccia indica il verso di riferimento; nodi uguali hanno lo stesso potenziale.
  - application:
    - img:
      - group "Ramo V1, da b a 0": ⊕ V1 · 12 V
    - img:
      - group "Ramo R1, da b a 0": ▱ R1 · 100 Ω
    - img:
      - group "Ramo R2, da b a 0": ▱ R2 · 200 Ω
    - group "Nodo b"
    - group "Nodo 0": 0 · riferimento
    - img
    - button "Zoom In":
      - img
    - button "Zoom Out":
      - img
    - button "Fit View":
      - img
    - link "React Flow attribution":
      - /url: https://reactflow.dev
      - text: React Flow
    - text: "Moved selected node right. New position, x: 350, y: 250"
  - text: Ramo
  - combobox "Ramo":
    - option "V1"
    - option "R1"
    - option "R2" [selected]
  - text: Valore (Ω)
  - textbox "Valore componente": "200"
  - text: Dal nodo
  - combobox "Dal nodo":
    - option "b" [selected]
    - option "0"
  - text: Al nodo
  - combobox "Al nodo":
    - option "b"
    - option "0" [selected]
  - paragraph: Trascina un nodo o un estremo del ramo. Per tastiera e touch puoi anche scegliere i morsetti qui sopra. Collegare due maniglie aggiunge un resistore da 100 Ω.
  - group: Netlist e riferimenti
  - heading "2. Prima di calcolare" [level=2]
  - text: Grandezza
  - combobox "Grandezza":
    - option "Tensione (V)" [selected]
    - option "Corrente (A)"
  - text: Componente
  - combobox "Componente richiesto":
    - option "V1"
    - option "R1"
    - option "R2" [selected]
  - text: La tua previsione, con il verso
  - textbox "Previsione":
    - /placeholder: "Per esempio: positiva, tra 0 e 12 V…"
  - button "Calcola e mostra le equazioni"
  - separator
  - heading "3. Scrivi un passaggio" [level=2]
  - paragraph: "KCL al nodo a: indica i rami con segno, per esempio −R1,+R2. La prosa libera non viene interpretata automaticamente."
  - text: Operazione
  - combobox "Operazione":
    - option "KCL · bilancio delle correnti" [selected]
    - option "Valore di una tensione"
    - option "Valore di una corrente"
    - option "Ohm · tensione = corrente × R"
    - option "Resistori in serie"
    - option "Resistori in parallelo"
    - option "Altro metodo · non valutabile"
  - text: Nodo o primo componente
  - textbox "Primo riferimento": a
  - text: Rami con segno o riferimento
  - textbox "Secondo riferimento": "-R1,+R2"
  - text: Valore esatto, se richiesto
  - textbox "Valore del passaggio":
    - /placeholder: 8 oppure 1/25
  - text: Il passaggio che vuoi controllare
  - textbox "Trascrizione": Bilancio delle correnti al nodo a
  - button "Verifica il passaggio"
  - status: "Controlla valori, morsetti e procedimento: i dati non sono accettati."
  - heading "5. Conserva e consegna" [level=2]
  - paragraph: Le revisioni vivono nel tuo spazio Ardesia. La consegna invia al Core la fonte esatta e i controlli ricalcolati.
  - text: Note sul ragionamento
  - textbox "Note"
  - button "Salva revisione Core"
  - button "Consegna al docente" [disabled]
  - button "Esporta input JSON"
  - button "SPICE DC"
  - button "CircuitikZ"
  - text: Riapri input JSON
  - button "Importa circuito JSON"
  - paragraph: Una nuova domanda richiede una nuova verifica. AC e Laplace hanno percorsi separati nel motore e non sono inclusi in questa lezione.
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import fs from 'node:fs';
  3  | const sessions=JSON.parse(fs.readFileSync(process.env.S19_SESSION_FILE!,'utf8'));
  4  | const start='/s19/circuit-lab/?edition=s19-dc';
  5  | test.beforeEach(async({page},info)=>{await page.request.post('/study/session',{data:{token:sessions[info.project.name]}});await page.goto(start);await expect(page.getByRole('heading',{name:'Il circuito, passo dopo passo.'})).toBeVisible();});
  6  |
  7  | test('DC prediction, supported and unsupported steps, mutation and Core cold reopen',async({page},info)=>{
  8  |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  9  |  await page.getByLabel('Previsione',{exact:true}).fill('Positiva, circa 8 V nel verso a → 0');
  10 |  await page.getByRole('button',{name:'Verifica il passaggio',exact:true}).click();
  11 |  await expect(page.getByText('Passaggi supportati corretti fin qui',{exact:true})).toBeVisible();
  12 |  await expect(page.getByTestId('answer')).toContainText('8 V');
  13 |  await page.getByLabel('Secondo riferimento',{exact:true}).fill('+R1,+R2');
  14 |  await expect(page.getByTestId('answer')).toHaveCount(0);
  15 |  await page.getByRole('button',{name:'Verifica il passaggio',exact:true}).click();
  16 |  await expect(page.getByText('Un passaggio richiede una correzione',{exact:true})).toBeVisible();
  17 |  await page.getByLabel('Operazione',{exact:true}).selectOption('altro');
  18 |  await page.getByRole('button',{name:'Verifica il passaggio',exact:true}).click();
  19 |  await expect(page.getByText('Passaggio non valutabile',{exact:true})).toBeVisible();
  20 |  await page.getByLabel('Valore componente',{exact:true}).fill('300');
  21 |  await expect(page.getByTestId('answer')).toHaveCount(0);
  22 |  await page.getByRole('button',{name:'Calcola e mostra le equazioni'}).click();
  23 |  await expect(page.getByTestId('answer')).toContainText('9 V');
  24 |  await page.getByRole('button',{name:'Salva revisione Core',exact:true}).click();
  25 |  await expect(page.getByText('Input salvati nella revisione privata Core.',{exact:true})).toBeVisible();
  26 |  const url=page.url();expect(url).toContain('resource=');
  27 |  await page.reload();
  28 |  await expect(page.getByTestId('answer')).toContainText('9 V');
  29 |  await expect(page.getByLabel('Valore componente',{exact:true})).toHaveValue('300');
  30 |  await page.getByRole('button',{name:'Consegna al docente',exact:true}).click();
  31 |  await expect(page.getByTestId('receipt')).toBeVisible();
  32 |  const screenshot=process.env.S19_SCREENSHOT_DIR;
  33 |  if(screenshot){fs.mkdirSync(screenshot,{recursive:true});await page.screenshot({path:`${screenshot}/${info.project.name}-circuit.png`,fullPage:true});}
  34 |  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  35 |  expect(errors).toEqual([]);
  36 | });
  37 |
  38 | test('keyboard and touch select nodes and reconnect branches through accessible controls',async({page},info)=>{
  39 |  const node=page.getByRole('group',{name:'Nodo a',exact:true});
  40 |  await node.focus();await page.keyboard.press('Enter');await page.keyboard.press('ArrowRight');
  41 |  await expect(node).toBeFocused();
  42 |  if(info.project.name==='desktop'){const before=await node.boundingBox();await page.mouse.move(before!.x+22,before!.y+22);await page.mouse.down();await page.mouse.move(before!.x+90,before!.y+50,{steps:8});await page.mouse.up();const after=await node.boundingBox();expect(after!.x).not.toBe(before!.x);}
  43 |  const editor=page.getByLabel('Ramo',{exact:true});await editor.selectOption('R1');
  44 |  if(info.project.name==='touch')await page.getByLabel('Al nodo',{exact:true}).tap();
  45 |  await page.getByLabel('Al nodo',{exact:true}).selectOption('0');
  46 |  await editor.selectOption('R2');await page.getByLabel('Dal nodo',{exact:true}).selectOption('b');
  47 |  await page.getByRole('button',{name:'Calcola e mostra le equazioni'}).click();
> 48 |  await expect(page.getByTestId('answer')).toContainText('12 V');
     |                                           ^ Error: expect(locator).toContainText(expected) failed
  49 | });
  50 |
  51 | test('late numerical response cannot survive a changed circuit',async({page})=>{
  52 |  let release!:()=>void;const gate=new Promise<void>(r=>release=r);
  53 |  await page.route('**/study/s19/circuits/solve',async route=>{const response=await route.fetch();await gate;await route.fulfill({response});});
  54 |  await page.getByRole('button',{name:'Calcola e mostra le equazioni'}).click();
  55 |  await page.getByLabel('Valore componente',{exact:true}).fill('400');release();
  56 |  await expect(page.getByRole('button',{name:'Calcola e mostra le equazioni'})).toBeEnabled();
  57 |  await expect(page.getByTestId('answer')).toHaveCount(0);
  58 | });
  59 |
  60 | test('portable JSON contains inputs and import recalculates; forged proof is refused',async({page})=>{
  61 |  const promise=page.waitForEvent('download');await page.getByRole('button',{name:'Esporta input JSON',exact:true}).click();const download=await promise;const file=await download.path();const document=JSON.parse(fs.readFileSync(file!,'utf8'));expect(document.answer).toBeUndefined();
  62 |  document.components[2].value='100';await page.getByLabel('Importa circuito JSON').setInputFiles({name:'circuit.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(document))});
  63 |  await expect(page.getByTestId('answer')).toContainText('6 V');
  64 |  document.answer={exact:'777'};await page.getByLabel('Importa circuito JSON').setInputFiles({name:'forged.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(document))});
  65 |  await expect(page.getByText('Controlla valori, morsetti e procedimento: i dati non sono accettati.',{exact:true})).toBeVisible();
  66 |  await expect(page.getByTestId('answer')).toContainText('6 V');
  67 | });
  68 |
  69 | test('Core session revocation removes the private circuit and result',async({page})=>{
  70 |  await page.getByRole('button',{name:'Calcola e mostra le equazioni'}).click();await expect(page.getByTestId('answer')).toBeVisible();
  71 |  await page.request.post('/study/session/revoke-all');
  72 |  await page.getByRole('button',{name:'Calcola e mostra le equazioni'}).click();
  73 |  await expect(page.getByTestId('answer')).toHaveCount(0);
  74 |  await expect(page.getByText('La sessione è scaduta. Accedi dal tuo spazio Ardesia.',{exact:true})).toBeVisible();
  75 |  // Restore only for other synthetic scenarios; production UI has no login.
  76 |  const fresh=JSON.parse(fs.readFileSync(process.env.S19_SESSION_FILE!,'utf8'));
  77 |  expect(fresh.desktop).toBeTruthy();
  78 | });
  79 |
```