import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = await mkdtemp(path.join(tmpdir(), 'officina-lettore-'));
const out = path.resolve(process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/lettore'));
await mkdir(out, { recursive: true });
const boot = "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const server = spawn('python3', ['-uc', boot], { cwd:root, env:{...process.env, ASTRA_DATA:data}, stdio:['ignore','pipe','inherit'] });
const reports = [];
const headers = {'X-Astra-Request':'1'};

async function allEditions(page, base) {
  const seen = {lesson:0, example:0, formula:0, figure:0};
  for (const file of (await readdir(path.join(root,'content'))).filter(f => f.endsWith('.json') && f !== 'catalog.json')) {
    const rows = JSON.parse(await readFile(path.join(root, 'content', file)));
    for (const r of rows.filter(r => ['lesson','example'].includes(r.kind))) {
      await page.goto(base + '/#materiale/' + r.id + '/' + r.course);
      await page.waitForFunction(id => document.querySelector('.reader .meta')?.textContent.includes('· '+id) &&
        document.querySelector('[data-lettore]') && !document.querySelector('main').hasAttribute('aria-busy'), r.id);
      const actual = await page.locator('[data-lettore] > .copy').evaluate(el => [...el.children].map(b => {
        const math = b.querySelector('math annotation');
        if (math) return ['formula',math.textContent];
        const caption = b.querySelector('figcaption');
        if (caption) return ['figure',caption.textContent];
        const text = b.querySelector('p') || b;
        return ['text', text.textContent];
      }));
      assert.deepEqual(actual, r.blocks.map(b => [b.type,b.text.replaceAll('\n','')]), r.id);
      assert.equal(await page.locator('.lettura-inizia').count(), 1, r.id);
      seen[r.kind]++;
      seen.formula += r.blocks.filter(b => b.type === 'formula').length;
      seen.figure += r.blocks.filter(b => b.type === 'figure').length;
    }
  }
  return seen;
}

async function fallbackAndSession(browser, base) {
  const ctx = await browser.newContext();
  try {
    await ctx.addInitScript(() => {
      const synth = new EventTarget();
      const calls = { pending:null, heard:[], stopped:0 };
      let voices = [{name:'Remota',lang:'it-IT',localService:false}];
      synth.getVoices = () => voices;
      synth.speak = u => { calls.pending = u; calls.heard.push([u.voice.name, u.text]); };
      synth.cancel = () => { calls.pending = null; calls.stopped++; };
      window.readerProbe = {calls,local:() => {
        voices = [...voices,{name:'Locale',lang:'it-IT',localService:true}];
        synth.dispatchEvent(new Event('voiceschanged'));
      }};
      Object.defineProperty(window,'speechSynthesis',{value:synth});
      Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {constructor(text) {this.text=text;}}});
    });
    const p = await ctx.newPage();
    await p.goto(base+'/#materiale/C6-L01/C6');
    await p.getByText('Testo e ascolto',{exact:true}).click();
    assert.ok(await p.locator('[data-play]').isDisabled());
    await p.getByLabel('Spaziatura').selectOption('spacious');
    await p.reload();
    await p.getByText('Testo e ascolto',{exact:true}).click();
    assert.equal(await p.getByLabel('Spaziatura').inputValue(),'spacious');
    await p.evaluate(()=>readerProbe.local());
    await p.locator('[data-play]').click();
    await p.waitForFunction(()=>readerProbe.calls.heard.length===1);
    assert.equal((await p.evaluate(()=>readerProbe.calls.heard[0]))[0],'Locale');
    await p.getByRole('button',{name:'Un passaggio alla volta'}).click();
    assert.equal(await p.evaluate(()=>readerProbe.calls.stopped),1);
    await p.locator('[data-play]').click();
    await p.waitForFunction(()=>readerProbe.calls.heard.length===2);
    await p.locator('.mast nav').getByRole('link',{name:'Il mio studio'}).click();
    await p.getByRole('button',{name:'Apri un quaderno di prova'}).click();
    await p.getByRole('button',{name:'Esci'}).waitFor();
    assert.equal(await p.evaluate(()=>readerProbe.calls.stopped),2);
    await p.goto(base+'/#materiale/C6-L02/C6');
    await p.getByText('Testo e ascolto',{exact:true}).click();
    assert.equal(await p.getByLabel('Spaziatura').inputValue(),'standard');
    const failed = '**/vendor/sre-4.1.5/mathmaps/it.json';
    await p.route(failed,route=>route.fulfill({status:503,body:'Indisponibile'}));
    await p.getByRole('button',{name:'Leggi la trascrizione'}).click();
    await p.getByText(/Trascrizione non disponibile/).waitFor();
    assert.equal(await p.locator('[data-transcript] p').count(),0);
    await p.unroute(failed);
    await p.getByRole('button',{name:'Leggi la trascrizione'}).click();
    await p.locator('[data-transcript] p').first().waitFor();
    await p.evaluate(()=>readerProbe.local());
    await p.locator('[data-play]').click();
    await p.waitForFunction(()=>readerProbe.calls.pending!==null);
    const other = await ctx.newPage();
    await other.goto(base+'/#studio');
    await other.getByRole('button',{name:'Esci'}).click();
    await p.waitForFunction(()=>!document.querySelector('[data-lettore]') && document.querySelector('main h1')?.textContent==='Accesso al materiale');
    await p.goto(base+'/#materiale/C6-L01/C6');
    await p.getByText('Testo e ascolto',{exact:true}).click();
    assert.equal(await p.getByLabel('Spaziatura').inputValue(),'spacious');
    await p.locator('[data-reset]').click();
    assert.equal(await p.getByLabel('Spaziatura').inputValue(),'standard');
    const demo = await ctx.request.post(base+'/api/demo',{data:{},headers});
    assert.ok(demo.ok());
    const exam = await ctx.request.post(base+'/api/runs',{data:{course:'C6',mode:'exam',exam:1,requestId:'lettore-esame-sigillato'},headers});
    assert.ok(exam.ok());
    await p.goto(base+'/#prova/'+(await exam.json()).id);
    await p.locator('.question-shell').waitFor();
    assert.equal(await p.locator('[data-lettore], .feedback, [data-transcript]').count(),0);
    return ['ospite', 'voce remota e tardiva', 'cambio passaggio e navigazione', 'mappe assenti e ripresa', 'logout in seconda scheda', 'esame sigillato'];
  } finally { await ctx.close(); }
}

async function journey(engine, base, width, height, scale) {
  const name = engine.name()+'-'+width;
  const browser = await engine.launch(engine === chromium ? {channel:'chrome'} : {});
  let page;
  try {
    const ctx = await browser.newContext({viewport:{width,height},deviceScaleFactor:scale,locale:'it-IT',
      isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});
    await ctx.addInitScript({path:path.join(root,'node_modules/axe-core/axe.min.js')});
    assert.ok((await ctx.request.post(base+'/api/demo',{data:{},headers})).ok());
    page = await ctx.newPage();
    const errors = [], requests = [], audits = {};
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => requests.push(r.url()));
    async function audit(stage) {
      const report = await page.evaluate(async () => {
        const audit = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']}});
        return {violations:audit.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),manual:audit.incomplete.map(v=>v.id),
          width:innerWidth,scroll:document.documentElement.scrollWidth};
      });
      assert.deepEqual(report.violations,[],name+' '+stage);
      assert.ok(report.scroll<=report.width+1, name+' reflow '+stage);
      audits[stage] = report;
      await page.screenshot({path:path.join(out,name+'-'+stage+'.png'),animations:'disabled'});
    }
    const before = performance.now();
    await page.goto(base+'/#materiale/C6-L01/C6');
    await page.locator('[data-lettore]').waitFor();
    await page.locator('.copy math').waitFor({state:'attached'});
    const openMs = Math.round(performance.now()-before);
    await page.evaluate(()=>document.fonts.ready);
    const choice = page.getByText('Testo e ascolto',{exact:true});
    await audit('lettura');
    assert.equal(requests.filter(url=>url.includes('sre-4.1.5')).length,0);
    await choice.focus(); await choice.press('Enter');
    await page.getByLabel('Spaziatura').selectOption('spacious');
    await page.getByLabel('Contrasto',{exact:true}).selectOption('high');
    await page.getByRole('checkbox',{name:'Modalità concentrazione'}).check();
    await page.getByLabel('All’apertura').selectOption('steps');
    await page.getByText('Passaggio 1 di 4',{exact:true}).waitFor();
    const prefs = page.locator('[data-message]');
    await page.waitForFunction(()=>document.querySelector('[data-message]').textContent.includes('salvata'));
    await page.reload();
    await page.getByText('Passaggio 1 di 4',{exact:true}).waitFor();
    assert.equal(await page.locator('.index').isVisible(),false);
    await page.getByRole('button',{name:'Avanti',exact:true}).press('Enter');
    await page.getByRole('button',{name:'Avanti',exact:true}).press('Enter');
    await page.getByText('Passaggio 3 di 4',{exact:true}).waitFor();
    const editorial = page.locator('.lettura-contenuto > .copy');
    assert.equal(await editorial.locator(':scope > :visible').count(),2);
    assert.equal(await editorial.locator(':scope > :visible math').count(),1);
    await choice.press('Enter');
    await page.getByRole('button',{name:'Leggi la trascrizione'}).press('Enter');
    await page.locator('[data-transcript] p').first().waitFor();
    const phrases = await page.locator('[data-transcript] p').allTextContents();
    assert.equal(phrases.length,2);
    assert.match(phrases[0],/^Per un’eco/);
    assert.match(phrases[1],/velocità di propagazione per il tempo di andata e ritorno.*cammino totale diviso per due/);
    assert.equal(requests.filter(url=>url.includes('sre-4.1.5')).length,0);
    assert.ok(!phrases[0].includes('Laboratori 3D'));
    const separate = await browser.newContext();
    assert.ok((await separate.request.post(base+'/api/demo',{data:{},headers})).ok());
    const secondPage = await separate.newPage();
    secondPage.on('request', r => requests.push(r.url()));
    await secondPage.goto(base+'/#materiale/C6-L02/C6');
    await secondPage.locator('[data-lettore]').waitFor();
    await secondPage.getByText('Testo e ascolto',{exact:true}).click();
    await secondPage.getByRole('button',{name:'Leggi la trascrizione'}).click();
    await secondPage.locator('[data-transcript] p').first().waitFor();
    assert.match(await secondPage.locator('[data-transcript]').innerText(), /inizio frazione.*fine frazione/);
    const rules = await secondPage.evaluate(() => {
      function say(markup) {return SRE.toSpeech('<math xmlns="http://www.w3.org/1998/Math/MathML">'+markup+'</math>');}
      return [say('<mfrac><mn>1</mn><mn>2</mn></mfrac>'),say('<msup><mi>x</mi><mn>2</mn></msup><mo>=</mo><mn>9</mn>'),
        say('<mo>−</mo><mn>2</mn>')];
    });
    await separate.close();
    assert.deepEqual(rules,['un mezzo','x quadrato uguale a 9','meno 2']);
    const assets = [...new Set(requests.filter(url=>url.includes('sre-4.1.5')).map(url=>new URL(url).pathname))].sort();
    assert.deepEqual(assets,['/vendor/sre-4.1.5/mathmaps/base.json','/vendor/sre-4.1.5/mathmaps/it.json','/vendor/sre-4.1.5/sre.js']);
    assert.ok(requests.every(url=>new URL(url).origin===base));
    await audit('trascrizione');
    const voiceInfo = await page.evaluate(()=> (window.speechSynthesis?.getVoices() || []).filter(v=>v.localService&&/^it(?:[-_]|$)/i.test(v.lang)).map(v=>v.name));
    if (voiceInfo.length) {
      await page.getByRole('button',{name:'Ascolta il testo visibile'}).click();
      await page.getByRole('button',{name:'Ferma l’ascolto'}).waitFor();
      await page.getByRole('button',{name:'Ferma l’ascolto'}).press('Enter');
      await page.waitForFunction(()=>document.activeElement.hasAttribute('data-play'));
    } else {
      assert.ok(await page.getByRole('button',{name:'Ascolta il testo visibile'}).isDisabled());
      assert.match(await page.locator('[data-voice]').innerText(),/voce italiana locale/);
    }
    await page.clock.install();
    await page.getByRole('button',{name:'Avvia un timer di 5 minuti'}).click();
    await page.getByRole('timer').waitFor();
    await page.clock.fastForward(300500);
    assert.match(await prefs.innerText(), /cinque minuti sono trascorsi/);
    assert.equal(await page.locator('.lettura-stato').innerText(),'Passaggio 3 di 4');
    await choice.press('Enter');
    await audit('passaggio');
    await page.emulateMedia({media:'print'});
    assert.equal(await editorial.locator(':scope > :visible').count(),5);
    assert.equal(await choice.isVisible(),false);
    await page.emulateMedia({media:'screen'});
    const lab = editorial.locator(':scope > :visible a[href^="#banco/"]').first();
    const origin = await lab.getAttribute('href');
    await lab.press('Enter');
    await page.locator('.bench-room').waitFor();
    await page.getByRole('button',{name:'Tavola 2D',exact:true}).click();
    await page.locator('[data-drawing] svg').waitFor();
    await page.getByRole('link',{name:'Torna all’attività'}).click();
    await page.waitForFunction(href=>document.activeElement.getAttribute('href')===href,origin);
    assert.equal(await page.locator('.lettura-stato').innerText(),'Passaggio 3 di 4');
    await choice.press('Enter');
    await page.getByRole('button',{name:'Ripristina le preferenze'}).press('Enter');
    await page.getByText('Preferenze ripristinate.',{exact:true}).waitFor();
    const all = engine===chromium && width===1440 ? await allEditions(page,base) : undefined;
    const failures = engine===chromium && width===1440 ? await fallbackAndSession(browser,base) : undefined;
    assert.deepEqual(errors,[]);
    reports.push({name,width,height,scale,openMs,audits,localVoices:voiceInfo.length,rules,assets,all,failures});
  } catch (error) {
    console.error(name,page?.url(),await page?.locator('[data-message]').allTextContents());
    throw error;
  } finally { await browser.close(); }
}

try {
  const [chunk] = await once(server.stdout,'data');
  const base = 'http://127.0.0.1:'+Number(String(chunk).trim());
  for (const profile of [[chromium,1440,900,1],[chromium,320,740,1],[webkit,1440,900,1],[webkit,390,844,1],[chromium,640,450,2]])
    await journey(profile[0],base,...profile.slice(1));
  const sha = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  await writeFile(path.join(out,'lettore.json'),JSON.stringify({sha,reports},null,2)+'\n');
  console.log('PASS · 56 lezioni, 117 esempi, cinque configurazioni, quindici stati axe e lettura matematica locale.');
} finally {
  server.kill();
  await once(server,'exit');
  await rm(data,{recursive:true,force:true});
}
