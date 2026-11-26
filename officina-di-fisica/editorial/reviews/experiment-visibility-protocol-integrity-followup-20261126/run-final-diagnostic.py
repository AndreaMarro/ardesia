"""One bounded new-epoch replay: four acquired cases, nine drafts and pilot.
Composes the frozen request collector; no ETL or publication.
"""
from pathlib import Path
import json
import sys

APP=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiment_visibility_request as v
BASE=Path(__file__).resolve().parent
SOURCE_CHOICES={'SIM-C2-L005-05':[8],'SIM-C4-L02-01':[1,4,8],'SIM-C4-L09-02':[0,5,90,175,180],'SIM-C6-L01-01':[1,20],'SIM-C4-L10-02':[-4,0,4]}

def main():
    parent=Path(sys.argv[1]);output=Path(sys.argv[2]);output.mkdir(exist_ok=False)
    request,request_sha=v.validate(BASE/'request-example.json');prepared=v.load(parent)
    assert prepared['sourceCommit']==request['candidateRef']=='b939b6dd7a230e9357426bb1a982bc5d44faaf86'
    assert prepared['runtimeFingerprint']['sha256']==request['runtimeSha256']
    sources=[]
    for course in v.COURSES:sources+=json.loads(v.git_bytes(v.ORIGINAL,'officina-di-fisica/content/esperienze-'+course+'.json'))
    inventory={x['id']:x for x in v.load(v.safe(v.REPO,request['inventoryPath']))['records']};old={}
    for name in request['installedEvidencePaths']:
        data=v.load(v.safe(v.REPO,name));rows=data['records']if'records'in data else[{'id':k,**value}for k,value in data.items()]
        for row in rows:assert row['id']not in old;old[row['id']]=row
    primary={x['id']:x for x in v.load(v.safe(v.REPO,request['manualPrimaryPath']))['records']}
    primary['SIM-C2-L002-01']={'inputPoints':['2','1.5'],'finiteNumberExamples':['19.62','14.715']}
    source_map={x['id']:x for x in sources};drafts={x['id']:x for x in prepared['draftRecords']};records=[]
    for key,variant in [(k,'published')for k in SOURCE_CHOICES]+[(k,'draft')for k in drafts]:
        source=source_map[key];row=source if variant=='published'else drafts[key];frozen=inventory[key];legacy=old[key];assert v.digest(source)==frozen['sourceSha256']
        chosen=SOURCE_CHOICES[key]if variant=='published'else list(map(float,primary[key]['inputPoints']))
        if variant=='draft':assert chosen==row['assessmentSelection']['points']
        values=[]
        for x in chosen:
            sample=[c for c in legacy['cases']if c['x']==x];assert len(sample)==1
            values.append((sample[0].get('solve')or sample[0].get('output'))['y'])
        questions=[]
        if variant=='draft':questions=[{'input':value,'expectedAccepted':True,'sourceManualReadiness':'SEPARATE_FROZEN_DRAFT_REVIEW','prompt':None}for value in primary[key]['finiteNumberExamples']]
        else:
            for q in frozen['actualAssignedTasks']:
                literal=q.get('manualNumericLiteral')
                if literal is None:literal=v.numeric_literal(q.get('requiredByDeliveredQuestion',q.get('independentExact')))
                questions.append({'input':literal,'expectedAccepted':True,'sourceManualReadiness':not(frozen['sourceManualityFailure']or frozen['manualSupportGap']),'prompt':q.get('actualPrompt',q.get('prompt'))})
        if key=='SIM-C4-L10-02':questions +=[{'input':'2','expectedAccepted':True,'sourceManualReadiness':True,'prompt':'In 0,2 s il flusso concatenato passa da +0,30 Wb a −0,10 Wb. Quanto vale la fem media con il segno?'},{'input':'-0.5','expectedAccepted':True,'sourceManualReadiness':True,'prompt':'Chiudi una bobina su 8 Ω. Il flusso concatenato cresce di 0,4 Wb in 0,1 s. Qual è la corrente con il segno rispetto al verso positivo?'}]
        clock=[];aux=[]
        if key=='SIM-C4-L10-02':clock=[{'gridIndex':0,'time':t,'duration':2}for t in (0,1,2)];aux=[{'x':-4,'middle':2,'circuit':'closed','time':2},{'x':4,'middle':-2,'circuit':'open','time':0}]
        records.append({'id':key,'course':source['course'],'variant':variant,'record':row,'sourceSha256':v.digest(source),'candidateSha256':v.digest(row)if variant=='draft'else None,'grid':chosen,'expectedValues':values,'clockCases':clock,'auxiliaryCases':aux,'questions':questions,'originalJudgment':frozen,'sourcePrediction':legacy['prediction']['correct'],'clockInput':bool((legacy.get('clock')or{}).get('input')),'hasClock':bool(legacy.get('clock'))or key=='SIM-C4-L10-02'})
    assert len(records)==14
    prepared.update({'scope':'ONE_BOUNDED_C05_INTEGRITY_AND_FOUR_CORRECTIONS_NINE_DRAFTS_PILOT_REPLAY_NOT_FULL_139','parentPreparedSha256':v.sha(parent.read_bytes()),'requestSha256':request_sha,'records':records,'course':'FINAL_DIAGNOSTIC','expectedOriginalGridInputs':14,'expectedDraftGridInputs':18,'expectedClockInteractions':3,'activityCredit':0})
    keys=[]
    for r in records:
        for p in prepared['profiles']:
            stem='|'.join((r['id'],r['variant'],str(p['width']),p['view']));keys.append(stem+'|setup')
            for kind,field in [('grid','grid'),('clock','clockCases'),('auxiliary','auxiliaryCases')]:keys +=[stem+'|'+kind+'|'+str(i)for i in range(len(r[field]))]
    assert len(keys)==408 and len(set(keys))==408
    prepared['expectedCaseKeys']=keys;(output/'prepared.json').write_bytes(v.canonical(prepared)+b'\n')
    app=Path(prepared['packageFiles'][0]).parents[2];info={'candidateApp':str(app),'prepared':str(output/'prepared.json'),'output':str(output),'course':'FINAL_DIAGNOSTIC','requestSha256':request_sha,'scope':prepared['scope']}
    (output/'prepared-info.json').write_bytes(v.canonical(info)+b'\n');v.run_prepared(output/'prepared-info.json')

if __name__=='__main__':main()
