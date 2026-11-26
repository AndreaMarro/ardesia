"""Compose the frozen request collector for four acquired negative replays.
No source authoring, runtime edit, acceptance or historical retag.
"""
from pathlib import Path
import hashlib
import json
import sys
from fractions import Fraction

APP=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v

BASE=Path(__file__).resolve().parent
REQUEST=APP/'editorial/reviews/experiment-visibility-macro-proposal-20261126/request-example.json'
CHOICES={'SIM-C2-L005-05':[8],'SIM-C4-L02-01':[1,4,8],'SIM-C4-L09-02':[0,5,90,175,180],'SIM-C6-L01-01':[1,20]}

def main():
    parent=Path(sys.argv[1]);output=Path(sys.argv[2]);output.mkdir(exist_ok=False)
    request,request_sha=v.validate(REQUEST)
    prepared=v.load(parent)
    assert prepared['sourceCommit']==request['candidateRef']=='47984189654c7e3ce62e22265a1e54f5b4af8ad7'
    assert prepared['runtimeFingerprint']['sha256']==request['runtimeSha256']
    original=[]
    for course in v.COURSES:original+=json.loads(v.git_bytes(v.ORIGINAL,'officina-di-fisica/content/esperienze-'+course+'.json'))
    inventory={x['id']:x for x in v.load(v.safe(v.REPO,request['inventoryPath']))['records']}
    old={}
    for name in request['installedEvidencePaths']:
        data=v.load(v.safe(v.REPO,name));rows=data['records']if'records'in data else[{'id':k,**value}for k,value in data.items()]
        for row in rows:
            assert row['id']not in old;old[row['id']]=row
    records=[]
    for row in original:
        key=row['id']
        if key not in CHOICES:continue
        frozen=inventory[key];source=old[key];assert v.digest(row)==frozen['sourceSha256']
        questions=[]
        for i,q in enumerate(frozen['actualAssignedTasks']):
            literal=q.get('manualNumericLiteral')
            if literal is None:literal=v.numeric_literal(q.get('requiredByDeliveredQuestion',q.get('independentExact')))
            questions.append({'input':literal,'expectedAccepted':True,'sourceManualReadiness':not(frozen['sourceManualityFailure']or frozen['manualSupportGap']),'prompt':q.get('actualPrompt',q.get('prompt'))})
        values=[]
        for x in CHOICES[key]:
            cases=[c for c in source['cases']if c['x']==x];assert len(cases)==1
            values.append((cases[0].get('solve')or cases[0].get('output'))['y'])
        records.append({'id':key,'course':row['course'],'variant':'published','record':row,'sourceSha256':v.digest(row),'candidateSha256':None,'grid':CHOICES[key],'expectedValues':values,'clockCases':[],'auxiliaryCases':[],'questions':questions,'originalJudgment':frozen,'sourcePrediction':source['prediction']['correct'],'clockInput':bool((source.get('clock')or{}).get('input')),'hasClock':bool(source.get('clock'))})
    assert len(records)==4
    prepared.update({'scope':'INDEPENDENT_FOUR_CORRECTED_CANARIES_NOT_FULL_17_OR_139_ACCEPTANCE','parentPreparedSha256':v.sha(parent.read_bytes()),'requestSha256':request_sha,'records':records,'course':'FOUR_COURSE_CANARY','expectedOriginalGridInputs':11,'expectedDraftGridInputs':0,'expectedClockInteractions':0,'activityCredit':0})
    keys=[]
    for r in records:
        for p in prepared['profiles']:
            stem='|'.join((r['id'],r['variant'],str(p['width']),p['view']));keys.append(stem+'|setup');keys +=[stem+'|grid|'+str(i)for i in range(len(r['grid']))]
    assert len(keys)==120 and len(set(keys))==120
    prepared['expectedCaseKeys']=keys
    (output/'prepared.json').write_bytes(v.canonical(prepared)+b'\n')
    app=Path(prepared['packageFiles'][0]).parents[2]
    info={'candidateApp':str(app),'prepared':str(output/'prepared.json'),'output':str(output),'course':'FOUR_COURSE_CANARY','requestSha256':request_sha,'scope':prepared['scope']}
    (output/'prepared-info.json').write_bytes(v.canonical(info)+b'\n')
    v.run_prepared(output/'prepared-info.json')

if __name__=='__main__':main()
