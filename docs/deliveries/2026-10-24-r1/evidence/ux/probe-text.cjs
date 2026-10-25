const {chromium}=require('../../ardesia-r1/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
let browser;
(async()=>{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:360,height:1000},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5414/esperienza/');
 const counterfactual=process.env.UX_COUNTERFACTUAL==='1',counterfactual2=process.env.UX_COUNTERFACTUAL2==='1';
 if(counterfactual)await page.addStyleTag({content:'.flow-measures{display:flex;flex-wrap:wrap}.flow-measures>div{flex:1 1 max-content}.experience-next a{white-space:normal;text-align:center}'+(counterfactual2?'.experience-next h2{overflow-wrap:anywhere}':'')});
 await page.getByLabel('Rapporto previsto',{exact:true}).fill('16');
 await page.getByRole('button',{name:'Metti alla prova',exact:true}).click();
 await page.getByTestId('physics-ratio').waitFor();
 const doubled=await page.evaluate(()=>{
  const elements=[...document.querySelectorAll('h1,h2,h3,p,span,a,button,label,input,select,summary,strong,blockquote,output,li,svg text')];
  const sizes=elements.map(e=>parseFloat(getComputedStyle(e).fontSize));
  elements.forEach((e,i)=>e.style.fontSize=(sizes[i]*2)+'px');
  return elements.length;
 });
 await page.getByTestId('flow-measures').scrollIntoViewIfNeeded();
 const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,className:typeof e.className==='string'?e.className:'SVG',right:e.getBoundingClientRect().right,text:e.textContent.slice(0,70)})).filter(x=>x.right>innerWidth+1),quantities:[...document.querySelectorAll('.flow-measures > div')].map(e=>{const parent=e.getBoundingClientRect(),text=e.querySelector('strong').getBoundingClientRect();return {text:e.textContent,columnRight:parent.right,textRight:text.right,overflowsColumn:text.right>parent.right+1};})}));
 const prefix=counterfactual?(counterfactual2?'counterfactual2-text200':'counterfactual-text200'):'baseline-text200';
 await page.screenshot({path:path.join(__dirname,prefix+'-360.png'),fullPage:true});
 fs.writeFileSync(path.join(__dirname,counterfactual?prefix+'.json':'baseline-text200-red.json'),JSON.stringify({doubled,state,checks:[{name:'text200 has no horizontal page overflow',pass:state.scrollWidth<=state.width},{name:'text200 quantities fit their columns',pass:state.quantities.every(x=>!x.overflowsColumn)}],method:'Browser computed text sizes doubled through inline style in an isolated anonymous context; no source edit. This is a CSS text-resize simulation, not a browser preference or physical-device measure.',counterfactual:counterfactual?'CSS rules injected into immutable299 for an isolated causal check; not the final candidate build':false},null,2));
 if(state.scrollWidth>state.width||state.quantities.some(x=>x.overflowsColumn))throw Error('Text200: page overflow or overlapping quantities');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>browser?.close());
