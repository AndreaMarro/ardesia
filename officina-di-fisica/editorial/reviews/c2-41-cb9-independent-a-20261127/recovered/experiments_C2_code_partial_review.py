"""Integrity and code-only comparison for bounded independent C2 reviews.

Each family supplies its own equations, units, domains and geometry checks.
This adapter can never grant complete activity credit without actual UI review.
"""
from pathlib import Path
import hashlib,json,math,subprocess
from fractions import Fraction

APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/esperienze-C2.json'
SOURCE_SHA='33a38d74b953889eccce3281c4413060aa6af14f6a7c022d5049b927137656c1'
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
PROTOCOL='tests/corpus/collect-C2-bounded-code-only.mjs'
WRAPPER='tools/corpus_engineering/collect_C2_code_partial.py'

def sha(raw):return hashlib.sha256(raw).hexdigest()
def digest(value):return sha(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
def near(value,want):
    return type(value) in (int,float) and math.isfinite(value) and math.isclose(value,float(want),rel_tol=1e-10,abs_tol=1e-10)

def source_rows():
    raw=subprocess.check_output(['git','show',SOURCE_REF+':'+SOURCE_PATH],cwd=APP)
    if sha(raw)!=SOURCE_SHA:raise ValueError('Pinned source file changed')
    return {r['id']:r for r in json.loads(raw)}

def compare(module,proof,sources):
    rows=proof.get('records',[]);ids=[r.get('id') for r in rows]
    if len(ids)!=len(module.SPECS) or set(ids)!=set(module.SPECS):raise ValueError('Missing, duplicate or unreviewed IDs')
    results={}
    for row in rows:
        key=row['id'];source=sources[key];lo,hi,step,x0,x1,transfer,unit,prediction=module.SPECS[key]
        errors=[];geometry=[];tasks=[];count=round((hi-lo)/step)+1
        param=row.get('params',[]);choices=getattr(module,'CHOICES',{}).get(key)
        if len(param)!=1 or param[0].get('key')!='x':errors.append('Actual parameter missing')
        elif choices:
            if param[0].get('options')!=[[str(lo+i),v] for i,v in enumerate(choices)] or param[0].get('value')!=str(x0):errors.append('Categorical domain/default differs')
        elif any(not near(param[0].get(k),v) for k,v in [('min',lo),('max',hi),('step',step),('value',x0)]):errors.append('Control grid/default differs')
        if row.get('prediction',{}).get('correct')!=prediction or row['prediction'].get('options')!=['Diminuisce','Resta uguale','Aumenta']:errors.append('Prediction or distractors differ')
        clock=module.CLOCKS.get(key);actualClock=row.get('clock')
        if not clock and actualClock is not None:errors.append('Unexpected clock')
        if clock and (not isinstance(actualClock,dict) or any(actualClock.get(k)!=clock[k] for k in ('clockUnit','unit','label') if k in clock) or actualClock.get('input',False)!=clock.get('input',False)):errors.append('Clock semantics differ')
        cases=row.get('cases',[])
        if len(cases)!=count:errors.append('Control grid incomplete')
        clockFrames=0
        def reading_errors(readings,x):
            issues=[];inputUnit='' if choices or source['control']['unit']=='1' else source['control']['unit']
            inputValue=choices[int(x)-lo] if choices else x
            if len(readings)<3:return ['Readings incomplete']
            firstOk=readings[0][1]==inputValue if choices else near(readings[0][1],inputValue)
            if not firstOk or readings[0][0]!=source['control']['label'] or readings[0][2]!=inputUnit:issues.append('Input reading or unit differs')
            if readings[1][0]!=source['measure']['label'] or not near(readings[1][1],module.exact_value(key,x)) or readings[1][2]!=(unit if unit!='1' else ''):issues.append('Output reading or unit differs')
            special=module.secondary_value(key,x) if hasattr(module,'secondary_value') else None
            label,want,secondaryUnit=special or ('Variazione dal riferimento',module.exact_value(key,x)-module.exact_value(key,x0),unit if unit!='1' else '')
            valueOk=readings[2][1]==want if isinstance(want,str) else near(readings[2][1],want)
            if readings[2][0]!=label or not valueOk or readings[2][2]!=secondaryUnit:issues.append('Secondary physical reading or unit differs')
            return issues
        for index,c in enumerate(cases):
            x=Fraction(str(lo))+index*Fraction(str(step));want=module.exact_value(key,x)
            if not near(c.get('x'),x) or not near(c.get('solve',{}).get('y'),want):errors.append('Installed law differs')
            readings=c.get('readings',[])
            errors.extend(reading_errors(readings,x))
            if len(c.get('steps',[]))!=4:errors.append('Reasoning stages missing')
            gs=c.get('graphs',[]);expectedGraphs=1+bool(clock and clock.get('signal'))
            if len(gs)!=expectedGraphs:errors.append('Graph count differs')
            else:
                expectedY=source['measure']['label']+(' ('+source['measure']['unit']+')' if source['measure']['unit']!='1' else '')
                points=gs[0].get('series',[{}])[0].get('points',[])
                expectedPoints=len(choices) if choices else 101
                if gs[0].get('y')!=expectedY or len(points)!=expectedPoints or any(not near(y,module.exact_value(key,z)) for z,y in points):errors.append('Control graph or units differ')
                if expectedGraphs==2:
                    points=gs[1].get('series',[{}])[0].get('points',[])
                    if len(points)!=161 or any(not near(y,module.clock_value(key,x,t)) for t,y in points):errors.append('Time graph differs')
            samples=c.get('clockSamples',[])
            if clock:
                duration=clock['duration']
                if not near(c.get('duration'),duration) or len(samples)!=5:errors.append('Clock sample coverage differs')
                for number,frame in enumerate(samples):
                    t=Fraction(duration*number,4);inputValue=t if clock.get('input') else x
                    if not near(frame.get('time'),t) or not near(frame.get('input'),inputValue) or not near(frame.get('solve',{}).get('y'),module.exact_value(key,inputValue)):errors.append('Actual clock input/state differs')
                    if clock.get('signal') and not near(frame.get('signal'),module.clock_value(key,inputValue,t)):errors.append('Clock physical signal differs')
                    frameReadings=frame.get('readings',[])
                    errors.extend(reading_errors(frameReadings,inputValue))
                    if len(frameReadings)!=(4 if clock.get('signal') else 3) or not near(frameReadings[1][1],module.exact_value(key,inputValue)):errors.append('Clock-frame instrument state differs')
                    if clock.get('signal') and (frameReadings[-1][0]!=clock['label'] or not near(frameReadings[-1][1],module.clock_value(key,inputValue,t)) or frameReadings[-1][2]!=clock['unit']):errors.append('Clock-frame readout or unit differs')
                    geometry.extend('clock@'+str(x)+','+str(t)+': '+e for e in module.geometry_errors(key,inputValue,frame['elements'],t))
                    clockFrames+=1
            elif samples or c.get('duration') is not None:errors.append('Unexpected temporal states')
            geometry.extend('grid@'+str(x)+': '+e for e in module.geometry_errors(key,x,c.get('elements',[]),None))
        assessment=row.get('assessment',[])
        if len(assessment)!=2:errors.append('Two assigned tasks missing')
        for i,task in enumerate(assessment[:2]):
            x=(x1,transfer)[i];want=module.exact_value(key,x);fmt=module.TASK_FORMAT[key][i]
            prompt=source['transferPrompt'].replace('{x}',fmt) if i else 'Imposta «'+source['control']['label']+'» su '+fmt+'. Quale valore ottieni per «'+source['measure']['label']+'»?'
            good=near(task.get('value'),want) and task.get('unit')==('numero puro' if unit=='1' else unit) and task.get('prompt')==prompt
            if not good:errors.append('Generated task prompt/key/unit differs')
            tasks.append({'actualPrompt':task.get('prompt'),'input':x,'independentExact':str(want),'actualAnswer':task.get('value'),'actualWorked':task.get('worked'),'unit':unit,'ok':good})
        for item in row.get('assessmentFormat',[]):
            value=item.get('value');parsed=item.get('parsed')
            if not isinstance(value,(int,float)) or not isinstance(parsed,(int,float)) or abs(value-parsed)>max(1e-6,abs(value)*.005):errors.append('Displayed answer does not roundtrip within actual numeric grading rule')
        if hasattr(module,'cross_case_geometry_errors'):geometry.extend(module.cross_case_geometry_errors(key,row))
        results[key]={'installedScalarTasksAndClocksOk':not errors,'errors':sorted(set(errors)),'geometryCodeOk':not geometry,'geometryErrors':geometry,
                      'caseCount':len(cases),'clockFrameCount':clockFrames,'actualAssignedTasks':tasks}
    return results

def report(module):
    from .runtime_fingerprint import runtime_fingerprint
    if runtime_fingerprint(APP)['sha256']!=RUNTIME:raise ValueError('Unknown current runtime')
    if sha((APP/module.PRIMARY_PATH).read_bytes())!=module.PRIMARY_SHA256:raise ValueError('Frozen disclosed prompt primary changed')
    sources=source_rows();file=APP/module.PROOF;raw=file.read_bytes()
    if sha(raw)!=module.PROOF_SHA256:raise ValueError('Consumer collection changed')
    proof=json.loads(raw)
    if proof.get('group')!=module.GROUP or any(proof.get(k)!=RUNTIME for k in ('runtimeProfileBefore','runtimeProfileAfter')) or proof.get('protocolSha256')!=sha((APP/PROTOCOL).read_bytes()) or proof.get('collectorWrapperSha256')!=sha((APP/WRAPPER).read_bytes()):raise ValueError('Stale protocol or epoch')
    if proof.get('terminalStatus')!='COMPLETED_CODE_COLLECTION_ONLY' or proof.get('UI')!='NOT_RUN' or proof.get('scientificApproval') is not False:raise ValueError('Invalid collection disposition')
    exact=module.exact_checks();actual=compare(module,proof,sources)
    deps={Path(__file__).name:sha(Path(__file__).read_bytes()),Path(module.__file__).name:sha(Path(module.__file__).read_bytes()),PROTOCOL:sha((APP/PROTOCOL).read_bytes()),WRAPPER:sha((APP/WRAPPER).read_bytes())}
    return {'phase':'SOURCE_MATH_INSTALLED_CODE_PARTIAL_NOT_REGISTRABLE','sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,'sourceFileSha256':SOURCE_SHA,
            'runtimeSha256':RUNTIME,'proofSha256':sha(raw),'exactCheckCount':sum(len(v) for v in exact.values()),
            'promptPrimaryPath':module.PRIMARY_PATH,'promptPrimarySha256':module.PRIMARY_SHA256,
            'installedStates':sum(v['caseCount'] for v in actual.values()),'clockFrames':sum(v['clockFrameCount'] for v in actual.values()),
            'records':[{'id':key,'sourceVersion':sources[key]['version'],'sourceSha256':digest(sources[key]),'mathOk':all(c['ok'] for c in exact[key]),
                        'exactChecks':exact[key],'installedConsumerCode':actual[key],'manualArithmetic':module.MANUAL[key],
                        'physicalAssumptionsAndDomain':module.ASSUMPTIONS[key],'pedagogicalReview':module.PEDAGOGY[key],
                        'sourceFirstPrimaryDisclosure':'Prompt-only primary persisted; shared C2.js had previously been incidentally visible; not claimed blinded.',
                        'reviewDependencySha256':deps,'UI':'NOT_RUN','visualReview':'NOT_RUN','ok':False,'overallComplete':False,'activityCredit':0,
                        'humanApproval':'NOT_RUN','publicationAction':'NONE'} for key in module.SPECS],
            'overallComplete':False,'acceptedCount':0,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
