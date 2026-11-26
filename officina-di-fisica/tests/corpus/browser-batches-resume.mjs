// Evidence validation only: a report cannot establish that its process exited.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const widths=Object.freeze([1440,768,320]);
const finite=value=>typeof value==='number'&&Number.isFinite(value);

export function validateBatchSpec(pkg,spec){
 assert.ok(Array.isArray(pkg.records)&&pkg.records.length>0,'Nonempty package records');
 const ids=pkg.records.map(row=>row.id);
 assert.ok(ids.every(id=>typeof id==='string'&&id.length>0)&&new Set(ids).size===ids.length,'Unique package record IDs');
 const declared=spec.activityIds??spec.questionIds;
 assert.ok(Array.isArray(declared)&&declared.length>0&&declared.every(id=>typeof id==='string'&&id.length>0)&&new Set(declared).size===declared.length,'Unique declared registry IDs');
 if(spec.activityIds){
  const allowed=new Set(declared);
  assert.ok(ids.every(id=>allowed.has(id)),'Every revision candidate belongs to its declared activity IDs');
 }else{
  assert.deepEqual([...ids].sort(),[...declared].sort(),'Question package and registry IDs must match exactly');
 }
}

export function validateReport(report,pkg,inputs){
 assert.equal(pkg.schema,'astra/1');
 assert.ok(Array.isArray(pkg.records)&&pkg.records.length>0,'Nonempty package records');
 const records=new Map();
 for(const row of pkg.records){
  assert.ok(typeof row.id==='string'&&row.id.length>0&&!records.has(row.id),'Unique package record IDs');
  records.set(row.id,row);
 }
 assert.equal(report.schemaVersion,'1.0.0');
 assert.equal(report.batch,inputs.batch);
 assert.equal(report.previewOnly,true);
 assert.equal(report.packageFileSha256,inputs.packageFileSha256);
 assert.equal(report.testSha256,inputs.protocolSha256);
 assert.deepEqual(report.runtimeFingerprint,inputs.runtimeFingerprint);
 assert.ok(typeof report.browserVersion==='string'&&report.browserVersion.trim().length>0);
 assert.ok(Array.isArray(pkg.assets)&&Array.isArray(report.protectedAssets));
 const assets=pkg.assets.map(asset=>asset.id);
 assert.equal(new Set(assets).size,assets.length,'Unique package asset IDs');
 assert.equal(new Set(report.protectedAssets).size,report.protectedAssets.length,'Unique protected asset checks');
 assert.deepEqual([...report.protectedAssets].sort(),[...assets].sort());
 assert.ok(Array.isArray(report.records));
 assert.equal(report.records.length,records.size*widths.length,'Complete viewport coverage');
 const seen=new Set();
 for(const result of report.records){
  assert.ok(records.has(result.id)&&widths.includes(result.width),'Known record and viewport');
  const key=JSON.stringify([result.id,result.width]);
  assert.ok(!seen.has(key),'Unique record and viewport');seen.add(key);
  const row=records.get(result.id);
  const blocks=[...(row.blocks||[]),...(row.promptBlocks||[])];
  assert.ok(Number.isInteger(result.figureCount)&&result.figureCount>=blocks.filter(b=>b.type==='figure').length,'Every authored figure is rendered');
  assert.ok(Array.isArray(result.violations)&&result.violations.length===0,'No accessibility violations');
  assert.ok(finite(result.overflow)&&result.overflow<=1,'No page overflow');
  assert.ok(Array.isArray(result.formulas)&&result.formulas.length>=blocks.filter(b=>b.type==='formula').length,'Every authored formula is rendered');
  for(const formula of result.formulas){
   assert.ok(finite(formula.width)&&formula.width>0&&finite(formula.scroll)&&formula.scroll>=0&&finite(formula.typeset)&&formula.typeset>0,'Finite rendered formula dimensions');
   assert.ok(formula.scroll<=formula.width+1&&formula.typeset<=formula.width+1,'No formula overflow');
  }
 }
 return seen.size;
}

export function completion(inputs,reportBytes,caseCount){
 return {schemaVersion:'1.0.0',batch:inputs.batch,terminalExitCode:0,signal:null,
  packageFileSha256:inputs.packageFileSha256,protocolSha256:inputs.protocolSha256,
  runtimeSha256:inputs.runtimeFingerprint.sha256,runtimeProtocolSha256:inputs.runtimeFingerprint.protocolSha256,
  runnerSha256:inputs.runnerSha256,helperSha256:inputs.helperSha256,
  reportSha256:sha256(reportBytes),caseCount};
}

export function validateCompletion(marker,reportBytes,pkg,inputs){
 const caseCount=validateReport(JSON.parse(reportBytes),pkg,inputs);
 assert.deepEqual(marker,completion(inputs,reportBytes,caseCount),'Terminal marker and evidence must match all current inputs');
}
