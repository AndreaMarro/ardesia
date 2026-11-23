import {createRequire} from 'node:module';
import {performance} from 'node:perf_hooks';
import path from 'node:path';

const [app, baseUrl, proposedUrl] = process.argv.slice(2);
const {chromium} = createRequire(path.resolve(app,'package.json'))('playwright');
const browser = await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});
const samples={base:[],proposta:[]};
async function measure(url) {
  const ctx=await browser.newContext({viewport:{width:1280,height:860},deviceScaleFactor:2,reducedMotion:'reduce'});
  try {
    await ctx.request.post(url+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}});
    const page=await ctx.newPage();
    await page.addInitScript(()=>{
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...args) {
        const gl=get.call(this,type,...args);
        if(gl && type==='webgl2' && !this.instrumented) {
          this.instrumented=true;
          const draw=gl.drawElements.bind(gl);
          gl.drawElements=(...args)=>{
            this.firstDraw ??= performance.now();
            return draw(...args);
          };
        }
        return gl;
      };
    });
    await page.goto(url+'/#home');
    await page.locator('main h1').waitFor();
    const start=await page.evaluate(()=>performance.now());
    await page.goto(url+'/#banco/SIM-C1-L003-06');
    await page.waitForFunction(()=>document.querySelector('.bench-stage canvas')?.firstDraw);
    const before=await page.locator('.bench-stage canvas').evaluate((canvas,start)=>({
      openMs:Math.round(canvas.firstDraw-start),
      scriptBytes:performance.getEntriesByType('resource').filter(e=>e.name.includes('/banchi/') && e.name.endsWith('.js')).reduce((sum,e)=>sum+e.encodedBodySize,0)
    }),start);
    await page.locator('[data-focus]').click();
    await page.locator('dialog[open] canvas').evaluate(el=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
    const size=await page.locator('.bench-stage canvas').evaluate(el=>({width:el.width,height:el.height,cssWidth:el.clientWidth,cssHeight:el.clientHeight,dpr:devicePixelRatio}));
    const lost=performance.now();
    await page.locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.locator('[data-drawing]:visible svg').waitFor();
    return {...before,fallbackMs:Math.round(performance.now()-lost),buffer:size};
  } finally {await ctx.close();}
}
try {
  for(let i=0;i<6;i++) for(const [series,url] of (i%2 ? [['proposta',proposedUrl],['base',baseUrl]] : [['base',baseUrl],['proposta',proposedUrl]]))
    samples[series].push(await measure(url));
  console.log(JSON.stringify({browser:browser.version(),samples},null,2));
} finally {await browser.close();}
