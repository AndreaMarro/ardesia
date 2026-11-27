"""Read the immutable shared archive; extract only declared selected evidence."""
from pathlib import Path,PurePosixPath
from fractions import Fraction
import sys,zipfile,json,hashlib,shutil,math
ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica');OUT=Path(__file__).resolve().parent;ZIP=Path('/private/tmp/cric-cb9-45917299096-C3-original.zip')
sys.path.insert(0,str(ROOT))
from tools.corpus_engineering import experiments_C3_code_partial_verifier as O
assert ZIP.stat().st_size==189611995
h=hashlib.sha256()
with ZIP.open('rb')as f:
 for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
assert h.hexdigest()=='99b4b78118a753b464453169a3c6c9cc93142320b1580a24db7b5278647258cf'
with zipfile.ZipFile(ZIP)as z:
 entries=z.infolist();names=[i.filename for i in entries];assert len(names)==len(set(names));assert all(not PurePosixPath(n).is_absolute()and'..'not in PurePosixPath(n).parts for n in names)
 assert all((i.external_attr>>16)&0o170000!=0o120000 for i in entries)
 match=[n for n in names if n.endswith('/experiment-C3/evidence/report.json')];assert len(match)==1,match
 prefix=match[0][:-len('report.json')];report_raw=z.read(prefix+'report.json');plan_raw=z.read(prefix+'prepared.json');report=json.loads(report_raw);plan=json.loads(plan_raw)
 assert report['sourceCommit']==plan['sourceCommit']=='cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc';assert plan['runtimeFingerprint']['sha256']==report['runtimeFingerprint']['sha256']=='cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49';assert len(report['cases'])==len(plan['expectedCaseKeys'])==11808
 assert report['technicalStatus']=='ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED';assert report['activityCredit']==0 and report['humanApproval']=='NOT_RUN'and report['publicationAction']=='NONE'
 bykey={c['caseKey']:c for c in report['cases']};assert len(bykey)==11808 and set(bykey)==set(plan['expectedCaseKeys'])
 priorities=json.loads((OUT.parent/'C3-36-cb9-independent-20261127/priority-census-summary.json').read_bytes());wanted={k for r in priorities['nonzeroOmissions']for k in r['caseKeysInCurrentMacro']};assert len(wanted)==56 and wanted<=set(bykey)
 for row in plan['records']:
  first=row['record']['references'][0][0];index=next(i for i,x in enumerate(row['grid'])if O.close(x,first))
  for view in ('side','fixed_projection'):
   stem=f"{row['id']}|{row['variant']}|320|{view}|";wanted.add(stem+'setup');wanted.add(stem+'grid|'+str(index))
 for key in ('SIM-C3-L01-04','SIM-C3-L09-01','SIM-C3-L09-02'):
  row=next(r for r in plan['records']if r['id']==key and r['variant']=='published')
  for i in (0,1,len(row['grid'])-1):
   for view in ('orbit','side','fixed_projection'):wanted.add(f'{key}|published|320|{view}|grid|{i}')
 selected=[];missing=[];photos={};mathchecks=[];bytes_written=0
 def write(name,raw):
  nonlocal_dummy=None
  p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True)
  if shutil.disk_usage(OUT).free<2*1024**3+len(raw):raise ValueError('No safe disk reserve')
  if p.exists():assert p.read_bytes()==raw
  else:p.write_bytes(raw)
 for name,raw in [('actual-report.json',report_raw),('actual-prepared.json',plan_raw)]:write(name,raw)
 for key in sorted(wanted):
  item=bykey[key];raw=z.read(prefix+item['file']);assert hashlib.sha256(raw).hexdigest()==item['sha256'];case=json.loads(raw);assert case['caseKey']==key and case['technicalOk']is True;assert case['runtimeSha256']==plan['runtimeFingerprint']['sha256']
  write(item['file'],raw);selected.append({'caseKey':key,'file':item['file'],'sha256':item['sha256']})
  for image in case['screenshots']:
   content=z.read(prefix+image['file']);assert hashlib.sha256(content).hexdigest()==image['sha256'];write(image['file'],content);photos[image['file']]=image['sha256']
  if '|setup'not in key:
   short=case['id'][7:];x=case['sourceReplayedX'];expected=O.exact(short,Fraction(str(x)));assert O.close(case['model']['y'],expected);mathchecks.append({'caseKey':key,'independentExpectedExact':str(expected),'sourceReplayedX':x,'actualY':case['model']['y']})
  if key in {k for r in priorities['nonzeroOmissions']for k in r['caseKeysInCurrentMacro']}:
   color=0xb94f48 if case['id']=='SIM-C3-L04-03'else 0x7350b0;actual=[e for e in case['elements']if e['kind']=='arrow'and e['c']==color];assert actual==[]
   missing.append({'caseKey':key,'expectedNonzeroTransferColor':hex(color),'sourceReplayArrowsOfThisRole':0,'screenshots':case['screenshots'],'scope':'actual browser record with source replay; raster interpretation is separate'})
 result={'schemaVersion':'1.0.0','runId':45917299096,'headSha':'0dbfa07c4d8abe6d80bc827d0f08a40b62075059','artifactId':15165577346,'artifactZipSha256':h.hexdigest(),'artifactZipBytes':189611995,'archiveUncompressedBytes':sum(i.file_size for i in entries),'archiveEntryCount':len(entries),'plannedTechnicalCases':11808,'selectedCases':selected,'selectedPngFiles':[{'file':k,'sha256':v}for k,v in sorted(photos.items())],'priority56Cases':missing,'independentMathematicalCrossChecks':mathchecks,'currentOriginalSourceProseNegative':'SIM-C3-L03-02','originalRadicalManualSupportGapRetained':True,'rasterReview':'PENDING_READER_SELECTION','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
 write('archive-reading-receipt.json',(json.dumps(result,ensure_ascii=False,indent=2)+'\n').encode());print(json.dumps({'plannedTechnicalCases':11808,'selectedCases':len(selected),'selectedPngFiles':len(photos),'priorityCasesWithAbsentSourceGlyph':len(missing),'independentMathChecks':len(mathchecks),'uncompressedTotal':result['archiveUncompressedBytes']}))
