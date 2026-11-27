// Execute the exact installed numeric grader block; no DOM/browser assertion.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {esperienza} from './consumer/static/js/banchi/voci/esperimento.js';
const D=new URL('.',import.meta.url),pack=JSON.parse(readFileSync(new URL('package.json',D)));
const source=readFileSync(new URL('consumer/static/js/banchi/banco.js',D),'utf8'),start=source.indexOf('const a = r.assessment[Number(form.dataset.check)]'),end=source.indexOf("let hint = 'Rivedi il calcolo. ';",start);assert.ok(start>0&&end>start);const block=source.slice(start,end);writeFileSync(new URL('actual-grader-block.js.txt',D),block);const grade=new Function('r','activity','form',block+';return {answer,ok};');
const inputs=[['13','14'],['-2','1'],['40','100'],['20','5'],['-10','5']];const results=[];
for(const [i,r]of pack.records.entries()){
 const a=await esperienza(r),positives=inputs[i].map((text,j)=>({input:text,...grade(a.record,a,{dataset:{check:String(j)},elements:{answer:{value:text}}})})),negatives=['','Infinity','NaN'].map(text=>({input:text,...grade(a.record,a,{dataset:{check:'0'},elements:{answer:{value:text}}})}));
 assert.ok(positives.every(g=>g.ok));assert.ok(negatives.every(g=>!g.ok));results.push({id:r.id,positives,negatives});
}
console.log(JSON.stringify({phase:'UNCHANGED_GRADER_BLOCK_CPU_ONLY',graderBlockSha256:createHash('sha256').update(block).digest('hex'),positiveManualInputs:10,negativeInputs:15,existingToleranceWindow:'UNCHANGED_SOURCE_BLOCK;NOT_NEW_REVIEW_TOLERANCE',results}));
