/** Real UI + authenticated Core assertion shared by full and targeted runners. */
export async function createAndVerifyExactNote(page, context, expect, title, text) {
  await page.getByRole('button',{name:'Nuova idea',exact:true}).click();
  await page.getByLabel('Titolo',{exact:true}).fill(title);
  await page.getByLabel('La tua nota',{exact:true}).fill(text);
  const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/study/memory/notes'&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Salva nel quaderno',exact:true}).click();
  const saved=await response;expect(saved.status()).toBe(200);
  const created=await saved.json();expect(typeof created.id).toBe('string');expect(created.id.length).toBeGreaterThan(0);
  expect(created.title).toBe(title);expect(created.text).toBe(text);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Apri '+title,exact:true}).click();
  const detail=page.getByRole('complementary',{name:'Dettaglio del collegamento'});
  await expect(detail.getByRole('heading',{name:title,level:2,exact:true})).toBeVisible();
  await expect.poll(()=>detail.locator('p.original-text').first().textContent()).toBe(text);
  const read=await context.request.get('/study/memory/notes/'+encodeURIComponent(created.id));expect(read.status()).toBe(200);
  const exact=await read.json();expect(exact.id).toBe(created.id);expect(exact.title).toBe(title);expect(exact.text).toBe(text);
  const projection=await (await context.request.get('/study/memory')).json();
  const rows=projection.notes.filter(n=>n.id===created.id);expect(rows).toHaveLength(1);expect(rows[0].title).toBe(title);expect(rows[0].text).toBe(text);
  return created.id;
}
