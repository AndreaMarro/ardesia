import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = process.env.ASTRA_RESULTS || path.join(root, 'var/arch/browser/continuita-banchi');
const data = await mkdtemp(path.join(tmpdir(),'officina-continuita-'));
const boot = "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const server = spawn('python3', ['-uc',boot], {cwd:root, env:{...process.env,ASTRA_DATA:data},stdio:['ignore','pipe','inherit']});
const reports = [];
const stage = '.bench-stage';
const canvas = stage + ' canvas';
const diagram = '[data-drawing]:not([hidden]) svg';
const button = (page, view) => page.locator('[data-view="'+view+'"]');
const selected = (page, view) => page.waitForFunction(view =>
  document.querySelector('[data-view="'+view+'"]')?.getAttribute('aria-pressed') === 'true', view);

function changed(a, b) {
  const left = PNG.sync.read(a), right = PNG.sync.read(b);
  assert.deepEqual([left.width,left.height], [right.width,right.height]);
  let count = 0;
  for (let i = 0; i < left.data.length; i += 4) {
    // Exclude only the keyboard outline; focus is asserted separately.
    const x = (i / 4) % left.width, y = Math.floor(i / 4 / left.width);
    if (x < 6 || y < 6 || x >= left.width-6 || y >= left.height-6) continue;
    const delta = Math.max(...[0,1,2].map(j => Math.abs(left.data[i+j]-right.data[i+j])));
    if (delta > 12) count++;
  }
  return count / (left.width*left.height);
}

async function predict(page, base, id) {
  await page.goto(base+'/#banco/'+id);
  await page.locator('[name=prediction]').first().check();
  await page.locator('[data-predict] button').press('Enter');
  await page.locator('[data-guide]').waitFor();
}

async function lose(page) {
  await page.locator(canvas).evaluate(el => {
    const gl = el.getContext('webgl2');
    const extension = gl.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('WEBGL_lose_context unavailable');
    window.lossProbe = {events:[], restore:() => extension.restoreContext()};
    for (const event of ['webglcontextlost','webglcontextrestored'])
      el.addEventListener(event, () => window.lossProbe.events.push(event), {once:true});
    extension.loseContext();
  });
  await page.locator(diagram).waitFor();
  await page.waitForFunction(() => window.lossProbe.events.includes('webglcontextlost'));
}

async function restore(page) {
  await page.evaluate(() => window.lossProbe.restore());
  await page.waitForFunction(() => window.lossProbe.events.includes('webglcontextrestored'));
}

async function audit(page) {
  const result = await page.evaluate(async () => {
    const {violations,incomplete} = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']}});
    return {overflow:document.documentElement.scrollWidth-innerWidth,violations:violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),incomplete:incomplete.map(v=>v.id)};
  });
  assert.ok(result.overflow <= 1, 'page overflow '+result.overflow);
  assert.deepEqual(result.violations,[]);
  return result;
}
async function capture(page, name) {
  const figure = page.locator(stage);
  await figure.scrollIntoViewIfNeeded();
  await figure.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  return figure.screenshot({scale:'css', path:name ? path.join(output,name+'.png') : undefined});
}
const focusOn = (page, selector) => page.locator(selector).evaluate(el=>document.activeElement===el);
const timeAndSpeed = (page) => page.locator('[data-readings]').innerText();
async function seek(page,value) {
  const time = page.locator('[data-instant]');
  await time.fill(String(value));
  await time.press('Enter');
  await page.waitForFunction(value => Number(document.querySelector('[data-scrub]').value)===value,value);
}

async function continuity(page, base, profile) {
  await predict(page,base,'SIM-C1-L003-06');
  await selected(page,'orbit');
  await page.locator('[data-next]').press('Enter');
  await page.locator('[data-pin]').press('Enter');
  const first = await page.locator('.measure-pair figure').first().innerText();
  const name = profile.name;
  const screen = page.locator(canvas);
  await button(page,'side').press('Enter');
  await selected(page,'side');
  await page.evaluate(()=>document.fonts.ready);
  await screen.focus();
  const original = await capture(page,name+'-laterale');
  if (profile.width>500) {
    const box = await screen.boundingBox();
    const x = box.x+box.width/2, y = box.y+box.height/2;
    await page.mouse.move(x,y);
    await page.mouse.down({button:'right'});
    await page.mouse.move(x+40,y+20,{steps:4});
    await page.mouse.up({button:'right'});
    assert.ok(changed(original,await capture(page))>0.008,'mouse pan');
    await screen.press('Home');
  }
  await screen.press('Shift+ArrowRight');
  const pan = changed(original,await capture(page));
  assert.ok(pan>0.008, 'keyboard pan '+pan);
  for (let i=0;i<12;i++) await screen.press('Shift+ArrowRight');
  const limit = await capture(page);
  await screen.press('Shift+ArrowRight');
  assert.ok(changed(limit,await capture(page))<0.002,'pan limit');
  await screen.press('Home');
  const resetDifference = changed(original,await capture(page,name+'-home'));
  assert.ok(resetDifference<0.008, 'Home did not restore selected projection '+resetDifference);
  await screen.press('ArrowLeft');
  await screen.press('=');
  await screen.press('Shift+ArrowUp');
  const pose = await capture(page,name+'-prima');
  assert.ok(changed(original,pose)>0.02);
  const before = await timeAndSpeed(page);
  assert.match(before,/2 m\/s/);
  const oldDraws = await screen.evaluate(el=>el.testDraws);
  const started = performance.now();
  await lose(page);
  const fallbackMs = Math.round(performance.now()-started);
  assert.ok(await focusOn(page,'[data-view=diagram]'), 'canvas lost keyboard focus');
  assert.equal(await timeAndSpeed(page),before);
  const during = await audit(page);
  const labels = await page.locator(diagram+' text').evaluateAll(nodes => nodes.map(el =>
    parseFloat(getComputedStyle(el).fontSize) * el.getScreenCTM().a));
  assert.ok(labels.length && labels.every(px => px >= 11.95),'SVG label sizes '+labels.join(', '));
  await capture(page,name+'-tavola');
  await page.locator('.bench-strip').evaluate(el=>el.scrollIntoView({block:'start'}));
  await page.screenshot({path:path.join(output,name+'-misura.png')});
  const resuming = performance.now();
  await restore(page);
  await selected(page,'side');
  await page.waitForFunction(n=>document.querySelector('.bench-stage canvas').testDraws>n,oldDraws);
  const restoredMs = Math.round(performance.now()-resuming);
  const recovered = changed(pose,await capture(page,name+'-ripresa'));
  assert.ok(recovered<0.008,'custom projection changed on restore '+recovered);
  assert.ok(await focusOn(page,'[data-view=diagram]'), 'restore moved the keyboard');
  assert.equal(await timeAndSpeed(page),before);

  if (profile.width<500) {
    const touch = page.locator('[data-touch]');
    await touch.waitFor();
    assert.equal(await screen.evaluate(el=>el.style.touchAction),'pan-y');
    await touch.press('Enter');
    assert.equal(await screen.evaluate(el=>el.style.touchAction),'none');
    await touch.press('Enter');
    assert.equal(await screen.evaluate(el=>el.style.touchAction),'pan-y');
  }
  // The SVG is a measuring instrument while the GPU is unavailable.
  await page.getByText('Regola il tempo',{exact:true}).press('Enter');
  await page.locator('[data-instant]').focus();
  assert.ok(await focusOn(page,'[data-instant]'));
  await lose(page);
  assert.ok(await focusOn(page,'[data-instant]'));
  await seek(page,3);
  const afterSeek = await timeAndSpeed(page);
  assert.match(afterSeek,/3 s/);
  assert.match(afterSeek,/2 m\s+Velocità\s+[−-]2 m\/s/);
  assert.equal(await page.locator('.measure-pair figure').first().innerText(),first);
  assert.match(await page.locator('.measure-pair figure').last().innerText(),/3 s/);
  await button(page,'diagram').press('Enter');
  await restore(page);
  await page.waitForFunction(()=>!document.querySelector('[data-view=side]').disabled);
  await selected(page,'diagram');
  assert.equal(await timeAndSpeed(page),afterSeek);
  await lose(page);
  await restore(page);
  await selected(page,'diagram');
  await button(page,'top').press('Enter');
  await selected(page,'top');
  assert.equal(await timeAndSpeed(page),afterSeek);
  const after = await audit(page);
  const buffer = await screen.evaluate(el=>({w:el.width,h:el.height,cssW:el.clientWidth,cssH:el.clientHeight}));
  assert.ok(buffer.w*buffer.h<=1_000_000 && buffer.w<=buffer.cssW*1.5+1);

  if (profile.width>500) {
    await page.locator('[data-focus]').press('Enter');
    await page.locator('dialog[open]').waitFor();
    await page.waitForFunction(() => {
      const c = document.querySelector('.bench-stage canvas');
      return c.width*c.height > 990_000 && c.width*c.height <= 1_000_000;
    });
    buffer.concentration = await screen.evaluate(c => ({w:c.width,h:c.height,cssW:c.clientWidth,cssH:c.clientHeight,dpr:devicePixelRatio}));
    await page.keyboard.press('Escape');
    await page.locator('dialog[open]').waitFor({state:'hidden'});
  }
  await lose(page);
  // Keep the reference to the old native context while its room is being retired.
  await page.goto(base+'/#banco/SIM-C5-L06-02');
  await page.locator('[data-bench="SIM-C5-L06-02"]').waitFor();
  await selected(page,'orbit');
  await restore(page);
  await selected(page,'orbit');
  assert.equal(await page.locator('[data-bench]').count(),1);
  return {profile:name,pan,recovered,fallbackMs,restoredMs,buffer,during,after};
}

async function interruptFirstLoad(browser, base) {
  const ctx = await browser.newContext({reducedMotion:'reduce'});
  try {
    await ctx.request.post(base+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}});
    const page = await ctx.newPage();
    let unblock;
    const delay = new Promise(done => {unblock=done;});
    const imported = page.waitForRequest('**/banchi/scena.js');
    await page.route('**/banchi/scena.js',async route => {
      await delay;
      await route.continue();
    });
    try {
      await page.goto(base+'/#banco/SIM-C1-L003-06',{waitUntil:'domcontentloaded'});
      await imported;
      await lose(page);
      await button(page,'diagram').press('Enter');
      await restore(page);
    } finally { unblock(); }
    await page.waitForFunction(()=>!document.querySelector('[data-view=side]').disabled);
    await selected(page,'diagram');
    await button(page,'side').press('Enter');
    await selected(page,'side');
    await page.locator(canvas).waitFor();
  } finally { await ctx.close(); }
}

async function withoutGPU(browser, base) {
  const ctx = await browser.newContext({viewport:{width:390,height:844}, reducedMotion:'reduce'});
  try {
    await ctx.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type,...args) {
        return type.includes('webgl') ? null : get.call(this,type,...args);
      };
    });
    await ctx.request.post(base+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}});
    const page = await ctx.newPage();
    await predict(page,base,'SIM-C5-L06-02');
    await selected(page,'diagram');
    await page.locator('[name=x]').press('Home');
    await page.locator(diagram).getByText('E = 0 · B = 0').waitFor();
    assert.match(await timeAndSpeed(page), /0 V\/m/);
    assert.ok(!await button(page,'side').isEnabled());
    await capture(page,browser.browserType().name()+'-campi-nulli');
    return true;
  } finally { await ctx.close(); }
}

try {
  await mkdir(output,{recursive:true});
  const base = 'http://127.0.0.1:'+String((await once(server.stdout,'data'))[0]).trim();
  for (const engine of [chromium,webkit]) {
    const browser = await engine.launch(engine===chromium ? {channel:'chrome',args:['--enable-unsafe-swiftshader']} : {});
    try {
      for (const [width,height] of [[1440,900],engine===chromium?[320,740]:[390,844]]) {
        const ctx = await browser.newContext({viewport:{width,height},deviceScaleFactor:width>500?2:1,hasTouch:width<500,isMobile:width<500,reducedMotion:'reduce'});
        try {
          await ctx.addInitScript({path:path.join(root,'node_modules/axe-core/axe.min.js')});
          await ctx.addInitScript(() => {
            const get = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type,...args) {
              const gl = get.call(this,type,...args);
              if (gl && type==='webgl2' && this.testDraws===undefined) {
                this.testDraws = 0;
                for (const name of ['drawArrays','drawElements']) {
                  const draw = gl[name].bind(gl);
                  gl[name] = (...values) => {this.testDraws++; return draw(...values);};
                }
              }
              return gl;
            };
          });
          await ctx.request.post(base+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}});
          const page = await ctx.newPage();
          page.setDefaultTimeout(10000);
          const errors = [];
          page.on('pageerror',e=>errors.push(String(e)));
          reports.push(await continuity(page,base,{name:engine.name()+'-'+width,width}));
          assert.deepEqual(errors,[]);
          console.log('PASS',engine.name(),width);
        } finally { await ctx.close(); }
      }
      await interruptFirstLoad(browser,base);
      await withoutGPU(browser,base);
    } finally { await browser.close(); }
  }
  const sha = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  await writeFile(path.join(output,'continuita.json'),JSON.stringify({sha,reports},null,2)+'\n');
} finally {
  const exited = once(server,'exit');
  server.kill();
  await exited;
  await rm(data,{recursive:true,force:true});
}
