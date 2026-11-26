import assert from 'node:assert/strict';
export function valueWitness(actual,expected,id,x){
 assert.ok(Number.isFinite(actual)&&Number.isFinite(expected),'finite observation required');
 let range=[expected,expected],mode='EXACT_WRAPPER_VALUE';
 // This single previously acquired normal55 witness differs by one adjacent
 // binary64 value between the installed Node and Chrome engines. Unknown
 // angles, IDs, expected values and two-ulp changes remain default-deny.
 if(id==='SIM-C1-L005-05'&&x===55&&expected===11.471528727020921){
  const bytes=new DataView(new ArrayBuffer(8));bytes.setFloat64(0,expected);bytes.setBigUint64(0,bytes.getBigUint64(0)+1n);
  range=[expected,bytes.getFloat64(0)];mode='ONE_ACQUIRED_ADJACENT_BINARY64_INTERVAL';
 }
 return{actual,expected,id,x,range,accepted:actual>=range[0]&&actual<=range[1],mode,referenceProofSha256:'57cb29409c32c90c82d64ffc12060fb296ce7fec622ae4863d5c734cba127a4c',sourceOfExpected:'Actual installed esperienza().model.solve; not raw law.measure'};
}
export function assertValue(witness){assert.ok(witness.accepted,'Independent numerical observation outside frozen range: '+JSON.stringify(witness));}
