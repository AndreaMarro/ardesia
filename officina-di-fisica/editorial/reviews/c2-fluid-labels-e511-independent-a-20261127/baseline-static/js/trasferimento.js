// Transport large editorial documents without changing the astra/1 import/export format.
async function hash(bytes) {
  const result = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(result)].map(value => value.toString(16).padStart(2, '0')).join('');
}
function base64(bytes) {
  const pieces = [];
  for (let i=0; i<bytes.length; i+=16384)
    pieces.push(String.fromCharCode(...bytes.subarray(i,i+16384)));
  return btoa(pieces.join(''));
}
export async function inviaLotto(call, action, bytes) {
  const transfer = await call('/author/transfer', {phase:'open', action, size:bytes.length, sha:await hash(bytes)});
  for (let offset=0; offset<bytes.length; offset+=transfer.partSize) {
    const part=offset/transfer.partSize;
    await call('/author/transfer', {phase:'part',id:transfer.id,part,data:base64(bytes.subarray(offset,offset+transfer.partSize))});
  }
  return call('/author/transfer', {phase:'complete',id:transfer.id});
}
export async function riceviArchivio(call) {
  const first = await call('/author/export-part?part=0');
  const bytes = new Uint8Array(first.size);
  function append(chunk) {
    if (chunk.sha!==first.sha || chunk.size!==first.size) throw new Error('Il catalogo è cambiato. Ripeti l’esportazione.');
    const value=atob(chunk.data), offset=chunk.part*first.partSize;
    for (let i=0;i<value.length;i++) bytes[offset+i]=value.charCodeAt(i);
  }
  append(first);
  for (let part=1;part*first.partSize<bytes.length;part++)
    append(await call('/author/export-part?part='+part+'&sha='+first.sha));
  if (await hash(bytes)!==first.sha) throw new Error('Archivio incompleto. Ripeti l’esportazione.');
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
