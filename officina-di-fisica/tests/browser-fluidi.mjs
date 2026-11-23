import assert from 'node:assert/strict';

export async function misuraFluidi(page, base, profile, bench, fallback, {audit,capture}) {
  const pressure=bench.apparatus==='manometro';
  await page.goto(base+'/#materiale/'+bench.skill+'/C2');
  const origin=page.locator('a[href^="#banco/'+bench.id+'/"]');
  assert.ok((await origin.locator('xpath=../..').innerText()).includes(bench.anchor),bench.id);
  await origin.press('Enter');
  await page.getByRole('heading',{level:1,name:bench.title}).waitFor();
  await page.getByText(bench.summary,{exact:true}).waitFor();
  await page.getByLabel('Aumenta',{exact:true}).check();
  await page.locator('[data-predict] button').press('Enter');
  assert.equal(await page.locator('[data-explain]').innerText(),bench.interpretation);
  await page.locator('[data-next]').press('Enter');
  const range=page.locator('#bp-x');
  const readout=page.locator('[data-readings] > div').filter({hasText:bench.measure.label}).locator('strong');
  const pair=page.locator('.measure-pair figure');
  await page.waitForFunction(view=>document.querySelector('[data-view='+view+']')?.getAttribute('aria-pressed')==='true',
    fallback?'diagram':'orbit');
  const settings=pressure?[[-1,-10],[0,0],[1,10]]:[[250,25],[800,80],[1000,100]];
  const observations=[];
  await range.press('Home');
  for(const [input,expected] of settings) {
    while(Number(await range.inputValue())<input) await range.press('ArrowRight');
    assert.equal(Number(await range.inputValue()),input);
    const output=(await readout.innerText()).trim().replace('−','-');
    assert.equal(output,expected+' '+bench.measure.unit);
    assert.equal((await pair.last().locator('p b').innerText()).replace('−','-'),output);
    observations.push({input,output});
    if(input===settings[0][0]) await page.locator('[data-pin]').press('Enter');
  }
  assert.equal((await pair.first().locator('p b').innerText()).replace('−','-'),observations[0].output);
  if(!fallback) await capture(page,page.locator('.bench-stage'),profile+'-'+(pressure?'manometro':'galleggiante')+'-3d');
  await page.locator('[data-view=diagram]').press('Enter');
  await page.locator('[data-drawing]:visible svg').waitFor();
  assert.equal((await readout.innerText()).trim().replace('−','-'),observations.at(-1).output);
  assert.ok((await page.locator('[data-drawing] svg').getAttribute('aria-label')).includes(bench.title));
  if(fallback) await capture(page,page.locator('.bench-stage'),profile+'-'+(pressure?'manometro':'galleggiante')+'-tavola');
  const access=await audit(page);
  await page.getByRole('link',{name:'Torna all’attività'}).press('Enter');
  await origin.waitFor();
  await page.locator('main:not([aria-busy])').waitFor();
  assert.ok(await origin.evaluate(el=>el===document.activeElement),'ritorno a '+bench.skill);
  return {id:bench.id,observations,access};
}
