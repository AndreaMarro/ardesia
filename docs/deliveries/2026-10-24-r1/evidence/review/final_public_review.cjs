// Independent functional/visual oracle, public local candidate only. Never sends a contact message.
const {chromium, expect} = require('/Users/andreamarro/Documents/Codex/2026-10-24/esegui-il-prossimo-mandato-operativo-di/work/ardesia-r1/node_modules/@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const OUT = process.env.REVIEW_OUT || __dirname;
fs.mkdirSync(OUT,{recursive:true});
const base = new URL(process.argv[2] || 'http://127.0.0.1:5416/');
if (!['127.0.0.1', 'localhost'].includes(base.hostname)) throw Error('Local public candidate required');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const report = {base: base.origin, scope:'Independent local browser; synthetic predictions; no WhatsApp opened/sent, no account, no external requests permitted.', checks:[], screenshots:[], humanApproval:'PENDING', providerValidation:'NOT_RUN'};
function assert(name, value, detail = null) {report.checks.push({name,pass:Boolean(value),detail}); if (!value) throw Error(name);}
async function screenshot(page, name, locator = null) {
  const target = path.join(OUT, name + '.png');
  if (locator) await locator.screenshot({path:target}); else await page.screenshot({path:target,fullPage:true});
  report.screenshots.push({file:name+'.png',sha256:sha(fs.readFileSync(target))});
}
async function main() {
  const browser = await chromium.launch({headless:true,executablePath:'/Users/andreamarro/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
  try {
    for (const width of [360,390,820,1440]) {
      const context = await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
      const page = await context.newPage();
      const errors = [], external = [], violations = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === base.origin || ['data:','blob:'].includes(url.protocol)) await route.continue();
        else {external.push({origin:url.origin,path:url.pathname}); await route.abort();}
      });
      await page.exposeFunction('independentCspViolation', value => violations.push(value));
      await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => window.independentCspViolation({directive:event.effectiveDirective,blockedURI:event.blockedURI})));
      const response = await page.goto(base.href, {waitUntil:'networkidle'});
      const headers = response.headers();
      assert(`${width}:public HTTP and noindex`, response.status() === 200 && /noindex/i.test(headers['x-robots-tag']||''));
      assert(`${width}:exported policy allows local audio`, (headers['content-security-policy']||'').includes("media-src 'self'"));
      await screenshot(page, `r1-landing-${width}`);
      const privacyDetails = page.locator('details').filter({hasText:/non conclude un[’']iscrizione/});
      if (await privacyDetails.count() && !await privacyDetails.evaluate(el=>el.open)) await privacyDetails.locator('summary').click();
      const landingText = await page.locator('body').innerText();
      assert(`${width}:contact remains interest`, /non conclude un[’']iscrizione/.test(landingText));
      const teaser = page.getByRole('link',{name:/Entra nella lezione interattiva/});
      await expect(teaser).toBeVisible();
      await teaser.click();
      await expect(page.getByRole('heading',{name:/Un tubo più largo/})).toBeVisible();
      assert(`${width}:funnel preserves course`, new URL(page.url()).searchParams.get('percorso') === 'fluidi-termodinamica');
      const input = page.getByRole('textbox',{name:'Rapporto previsto'});
      const compute = page.getByRole('button',{name:'Metti alla prova',exact:true});
      assert(`${width}:pre-answer numeric details hidden`, await page.getByTestId('physics-ratio').count() === 0 && await page.getByTestId('flow-measures').count() === 0 && await page.locator('.flow-tracer').count() === 0 && await compute.isDisabled());
      await page.getByText('Modello e limiti',{exact:true}).click();
      assert(`${width}:domain before result`, /orizzontale/.test(await page.locator('details').innerText()) && /senza scorrimento/.test(await page.locator('details').innerText()));
      await screenshot(page, `r1-experience-before-${width}`);
      await input.fill('16'); await input.press('Enter');
      await expect(page.getByTestId('physics-ratio')).toContainText('16');
      assert(`${width}:pressure r2 mean transport Q16 speed4`, await page.getByTestId('flow-measures').getAttribute('data-speed-ratio') === '4');
      const tracer = page.locator('.pipe-comparison .flow-tracer').first();
      const transform = () => tracer.evaluate(el=>getComputedStyle(el).transform);
      const first = await transform(); await page.waitForTimeout(170); const second = await transform();
      assert(`${width}:motion present`, first !== second);
      await page.getByRole('button',{name:'Ferma il flusso',exact:true}).click();
      await expect(page.getByRole('button',{name:'Anima il flusso',exact:true})).toHaveAttribute('aria-pressed','true');
      await tracer.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.ready)));
      const paused = await transform(); await page.waitForTimeout(170);
      const afterPause = await transform();
      assert(`${width}:pause freezes animation`, paused === afterPause,{paused,afterPause});
      await page.getByRole('button',{name:'Anima il flusso',exact:true}).press('Enter');
      await page.getByRole('button',{name:'Un problema diverso',exact:true}).press('Enter');
      await expect(input).toBeFocused();
      assert(`${width}:transfer starts without result`, await input.inputValue() === '' && await page.getByTestId('physics-ratio').count() === 0);
      assert(`${width}:nontrivial transfer parameters visible`, /η\/η₀ = 2 · L\/L₀ = 2/.test(await page.locator('.model-key').innerText()));
      await input.fill('4'); await input.press('Enter');
      await expect(page.getByTestId('physics-ratio')).toContainText('4');
      const measures = await page.getByTestId('flow-measures').innerText();
      assert(`${width}:transfer exact ratios Q1 pressure4 speed1`, measures.includes('Q/Q₀ = 1') && measures.includes('Δp/Δp₀ = 4') && measures.includes('v/v₀ = 1'));
      assert(`${width}:transfer length drawn twice reference`, await page.locator('.pipe-comparison .tube-body').getAttribute('width') === String(Number(await page.locator('.pipe-reference .tube-body').getAttribute('width'))*2));
      await page.getByRole('button',{name:'Riprendi il vincolo',exact:true}).click();
      assert(`${width}:audio transcript matches new task`, /raddoppia viscosità e lunghezza/.test(await page.locator('blockquote').innerText()));
      await page.getByRole('button',{name:'Ascolta il passaggio',exact:true}).click();
      await page.waitForFunction(() => {const audio=document.querySelector('audio');return audio && audio.currentTime>0 && !audio.paused;});
      const audioState = await page.locator('audio').evaluate(el=>({currentTime:el.currentTime,error:el.error?.code??null,readyState:el.readyState,src:new URL(el.currentSrc).pathname}));
      assert(`${width}:native audio plays under candidate policy`, audioState.error === null && audioState.currentTime > 0, audioState);
      await page.getByRole('button',{name:'Pausa audio',exact:true}).click();
      await screenshot(page, `r1-transfer-help-${width}`, page.locator('.physics-lab'));
      const overflow = await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert(`${width}:no horizontal document overflow`, overflow.document <= overflow.viewport, overflow);
      await page.getByRole('button',{name:'Ascolta il passaggio',exact:true}).click();
      await page.waitForFunction(() => !document.querySelector('audio').paused);
      const retiredAudio = await page.locator('audio').elementHandle();
      await page.getByRole('button',{name:'Ricomincia l’esperimento',exact:true}).click();
      await expect(input).toBeFocused();
      assert(`${width}:restart hides answer and transfer`, await page.getByTestId('physics-ratio').count()===0 && await page.locator('.transfer-prompt').count()===0 && await page.locator('audio').count()===0);
      assert(`${width}:restart stops detached playing audio`, await retiredAudio.evaluate(el=>el.paused));
      await page.getByRole('link',{name:'Torna al percorso',exact:true}).click();
      await page.waitForLoadState('load');
      assert(`${width}:return contact preserves course`, new URL(page.url()).hash==='#contatto' && new URL(page.url()).searchParams.get('percorso')==='fluidi-termodinamica');
      const checkedCourse = await page.locator('input[name="course"]:checked').inputValue();
      assert(`${width}:return selects intended course`, checkedCourse==='fluidi-termodinamica');
      assert(`${width}:no external request/page error/CSP violation`, !errors.length && !external.length && !violations.length, {errors,external,violations});
      await context.close();
    }
    const context = await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});
    const page = await context.newPage();
    await page.goto(new URL('/esperienza/',base).href);
    await page.getByRole('textbox',{name:'Rapporto previsto'}).fill('16');
    await page.getByRole('button',{name:'Metti alla prova',exact:true}).click();
    await expect(page.getByTestId('physics-ratio')).toBeVisible();
    const motion = await page.locator('.flow-tracer').first().evaluate(el=>({name:getComputedStyle(el).animationName,duration:getComputedStyle(el).animationDuration}));
    assert('reduced motion disables tracer animation', motion.name==='none',motion);
    await screenshot(page,'r1-reduced-motion-390',page.locator('.physics-lab'));
    await context.close();
    report.status='PASS';
  } catch(error) {report.status='FAIL';report.error=error.stack;process.exitCode=1;}
  finally {await browser.close();fs.writeFileSync(path.join(OUT,'final-public-review.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks.length,screenshots:report.screenshots.length,error:report.error||null},null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
