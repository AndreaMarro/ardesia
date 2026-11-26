"""Supplementary separate review of immutable cbc64655, never activity approval.

Reuses only independently derived pure math/figure functions of the earlier
reviewer. Does not call, patch, or change the old runtime1a verify/report.
"""
from pathlib import Path
import json
import math
from . import experiments_manual_support_revision_verifier as previous
from .pipeline import digest, sha
from .review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]
DIR='editorial/reviews/independent-guide-runtime-d9d1-20261126'
BASE=APP/DIR
REF='cbc64655906e0a3c990c74cdd7fe613d57e130e9'
PROFILE='d9d1bbf4a269a9a7b0e3a9cd4f5595f8dc45a85b77d3337b241b7dfa62968927'
PACKAGE_SHA='ecd99ef570fe1756980243b80e0877cfc58454dbcae562c8837d8390a7ff75b3'
BINDINGS_SHA='a846124d0aa4b160236658f231e8925af3bb283894dd73da60452cb42872acce'
INTERFERENCE='SIM-C5-L03-02'
SPLIT_FORMULAS=(r'|\cos(\pi/2)|=0',r'A_{\rm risultante}(1/2)=4\cdot0\,\mathrm{cm}',
                r'A_{\rm risultante}(1/2)=0\,\mathrm{cm}',r'|\cos\pi|=1',
                r'A_{\rm risultante}(1)=4\cdot1\,\mathrm{cm}',r'A_{\rm risultante}(1)=4\,\mathrm{cm}')


def inputs():
    folder=BASE/'candidate-input-snapshot/editorial/batches'
    p=(folder/(previous.BATCH+'.json')).read_bytes()
    b=(folder/(previous.BATCH+'-bindings.json')).read_bytes()
    if sha(p)!=PACKAGE_SHA or sha(b)!=BINDINGS_SHA:raise ValueError('Immutable candidate input bytes changed')
    return json.loads(p),json.loads(b)


def split_checks(row):
    text=[b['text']for b in row['blocks']if b.get('type')=='formula']
    return [{'claim':'independently read interference line '+f,'ok':f in text}for f in SPLIT_FORMULAS]


def execution_errors(execution):
    expected={'sourceCommit':REF,'actualRuntimeSha256':PROFILE,'observedExitCode':0,
              'terminalStatus':'PASS','runtimeBeforeAndAfterIdentical':True}
    return [k for k,v in expected.items()if execution.get(k)!=v]


def guide_delivery_errors(proof, execution):
    errors=execution_errors(execution)
    package,_=inputs()
    formula_counts={r['id']:sum(b.get('type')=='formula'for b in r['blocks'])for r in package['records']}
    if proof.get('terminalStatus')!='PASS' or proof.get('errors')!=[]:errors.append('Nonterminal/failed browser proof')
    if proof.get('runtimeFingerprint',{}).get('sha256')!=PROFILE:errors.append('Browser epoch mismatch')
    cases=proof.get('cases',[])
    expected={(key,width,fallback)for key in previous.IDS for width in (320,1440)for fallback in (False,True)}
    if len(cases)!=32 or {(c['id'],c['width'],c['noWebGL'])for c in cases}!=expected:errors.append('Incomplete bounded consumer matrix')
    for c in cases:
        if c.get('actualRenderer')!=('Tavola di misura'if c['noWebGL']else'3D interattivo'):errors.append('Wrong actual renderer')
        guides=c.get('guideCases',[])
        if [g['guide']['step-title']for g in guides]!=['Controlla il calcolo','Osserva la lettura del modello','Controlla il calcolo']:
            errors.append('Wrong actual guide branch')
        if len(guides)==3 and 'Sostituisci i dati'in guides[1]['guide']['explain']:errors.append('Unsupported manual instruction remains')
        if len(c.get('manualEntries',[]))!=2 or not all(q['feedback'].startswith('Corretto. ')for q in c.get('manualEntries',[])):
            errors.append('Missing actual Number submissions')
        if c['id']in ('SIM-C5-L01-01','SIM-C5-L02-03','SIM-C5-L08-02'):
            if [t['guide']['step-title']for t in c['clockTransitions']]!=['Osserva la lettura del modello','Controlla il calcolo']:
                errors.append('Clock guide transition incomplete')
        audit=c.get('audit',{})
        if len(audit.get('formulas',[]))!=formula_counts.get(c['id']):errors.append('Incomplete actual formula rendering')
        if audit.get('violations')!=[] or audit.get('overflow',2)>1:errors.append('Reading accessibility/overflow defect')
        if not all(f['scroll']<=f['width']+1 and f['typeset']<=f['width']+1 for f in audit.get('formulas',[])):
            errors.append('Formula overflow')
    return errors


def verify():
    package,bindings=inputs()
    sources=previous.source_records()
    _,primary=previous.primary_inputs()
    signatures=json.loads((BASE/'reviewed-candidate-signatures.json').read_bytes())
    asset_root=APP/previous.REVIEW_DIR/'final-input-snapshot/editorial/assets'
    rows=reviewed_rows(package,bindings,signatures,previous.IDS,asset_root)
    before=json.loads((APP/previous.REVIEW_DIR/'final-input-snapshot/editorial/batches'/ (previous.BATCH+'.json')).read_bytes())
    if package['assets']!=before['assets']:raise ValueError('Eight actually read SVG assets changed')
    old_by={r['id']:r for r in before['records']}
    math_checks=previous.independent_checks();figures=previous.figure_checks(asset_root)
    original_raw=(APP/previous.PRIMARY_DIR/'derivations.json').read_bytes()
    if sha(original_raw)!='76041919b432f7936491e0593cf6fddf9e113b80ed28d4543a540a093ffcbe02':
        raise ValueError('Original judgments changed')
    frozen_originals=json.loads(original_raw)
    native_raw=(APP/previous.REVIEW_DIR/'native-render.json').read_bytes()
    if sha(native_raw)!=previous.READ_NATIVE_RENDER_SHA:raise ValueError('Actually read SVG proof changed')
    for case in json.loads(native_raw)['cases']:
        if sha((APP/case['png']).read_bytes())!=case['pngSha256']:raise ValueError('Actually read native PNG changed')
    original_by={r['id']:r for r in frozen_originals['records']}
    probe=json.loads((BASE/'code-probe.json').read_bytes())
    execution=json.loads((BASE/'code-execution-receipt.json').read_bytes())
    if execution_errors(execution):
        raise ValueError('No actual matching proposed-epoch execution')
    if probe['sourceCommit']!=REF or probe['openTimelineTransitions']!=0 or len(probe['mutationTransitions'])!=6:
        raise ValueError('Incomplete transition proof')
    for relative,key in [('static/js/banchi/banco.js','bancoSha256'),('static/js/banchi/voci/esperimento.js','producerSha256')]:
        if sha((BASE/'proposed-epoch-source'/relative).read_bytes())!=probe[key]:raise ValueError('Probe/source mismatch')
    questions={r['id']:r for r in probe['records']}
    if set(questions)!=previous.IDS:raise ValueError('Incomplete actual Number question set')
    names=['tools/corpus_engineering/manual_support_d9d1_review.py',
           'tools/corpus_engineering/experiments_manual_support_revision_verifier.py',
           'tools/corpus_engineering/review_contract.py',
           previous.PRIMARY_DIR+'/input-projection.json',previous.PRIMARY_DIR+'/exact-primary.json',
           previous.PRIMARY_DIR+'/derivations.json',previous.REVIEW_DIR+'/native-render.json',
           DIR+'/reviewed-candidate-signatures.json',DIR+'/probe-epoch.mjs',DIR+'/code-probe.json',
           DIR+'/code-execution-receipt.json',DIR+'/actual-reconstructed-runtime-fingerprint.json',
           DIR+'/run-immutable-review.py',DIR+'/protocol-private-consumer-reading.mjs',
           DIR+'/browser-execution-receipt.json',DIR+'/browser-reading/report.json',
           DIR+'/durable-screenshot-map.json',
           'tests/corpus/test_manual_support_d9d1_review.py']
    dependencies={n:sha((APP/n).read_bytes())for n in names}
    browser=json.loads((BASE/'browser-reading/report.json').read_bytes())
    browser_execution=json.loads((BASE/'browser-execution-receipt.json').read_bytes())
    screenshots=json.loads((BASE/'durable-screenshot-map.json').read_bytes())['cases']
    if len(screenshots)!=32 or {(c['id'],c['width'],c['noWebGL'])for c in screenshots}!={(c['id'],c['width'],c['noWebGL'])for c in browser['cases']}:
        raise ValueError('Incomplete durable screenshot map')
    for image in screenshots:
        if sha((APP/image['file']).read_bytes())!=image['sha256']:raise ValueError('Actual consumer screenshot changed')
    delivery_errors=guide_delivery_errors(browser,browser_execution)
    records=[]
    for row,binding,signature,assets,errors in rows:
        errors=list(errors);key=row['id'];old=old_by[key]
        if key!=INTERFERENCE and row!=old:errors.append('Previously read seven rows changed')
        if key==INTERFERENCE and {k:v for k,v in row.items()if k!='blocks'}!={k:v for k,v in old.items()if k!='blocks'}:
            errors.append('Interference change exceeds explicitly reread formula blocks')
        if (row.get('version'),row.get('baseVersion'))!=(2,1):errors.append('Additive v2/base1 required')
        if binding.get('sourceRef')!=previous.REF or binding.get('sourceId')!=key or binding.get('sourceSha256')!=digest(sources[key]):
            errors.append('Original provenance changed')
        if row['assessmentSelection']!={'schemaVersion':'1.0.0','points':[float(x)for x in previous.SPECS[key][1]]}:
            errors.append('Pair differs from source-first primary')
        checks=math_checks[key]+previous.supplied_support_checks(row)+figures[key]
        if key==INTERFERENCE:checks+=split_checks(row)
        if not all(c['ok']for c in checks):errors.append('Independent mathematics/manual/figure check failed')
        q=questions[key]
        if q['unitsDuplicatedInPrompt'] or len(q['numberChecks'])!=2:errors.append('Actual question completeness/unit defect')
        for i,(item,number) in enumerate(zip(q['assessments'],q['numberChecks'])):
            expected=float(previous.exact_value(key,previous.SPECS[key][1][i]))
            if not math.isfinite(item['value']) or abs(item['value']-expected)>1e-10*max(1,abs(expected)):
                errors.append('Actual question differs from independent exact law')
            if not all(number[k]for k in ('finiteManualEntryAccepted','commaEntryAccepted','displayNumberRoundtripAccepted','blankRejected','infiniteRejected')):
                errors.append('Actual Number/format behavior differs')
        records.append({'id':key,'sourceRef':previous.REF,'sourceSha256':digest(sources[key]),
                        'sourceVersion':1,'candidateVersion':2,'baseVersion':1,'candidateSha256':digest(row),
                        'reviewedSignature':signature,'assetChecksums':assets,'runtimeProfileSha256':PROFILE,
                        'reviewDependencySha256':dependencies,'mode':'EXACT_ORACLE',
                        'candidateTextMathManualReview':{'ok':not errors,'checks':checks,'errors':errors},
                        'actualGeneratedQuestionReview':q,
                        'limitedGuideAndReadingDeliveryReview':{'ok':not delivery_errors,'errors':delivery_errors,
                                                                'matrix':'8 records ×320/1440×actual native/fallback; 32 cases, not full scene acceptance'},
                        'originalPublishedEditionJudgmentPreserved':original_by[key]['originalJudgmentPreserved'],
                        'nativeSvgBytesUnchangedFromIndividuallyReadOriginalReview':True,
                        'fullSceneUiReview':'NOT_RUN','existingConsumerGeometryGates':'OPEN_UNCHANGED',
                        'candidateState':'DRAFT','ok':False,'activityCredit':0,
                        'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return records


def report():
    rows=verify()
    return {'schemaVersion':'1.0.0','phase':'LIMITED_INDEPENDENT_DRAFT_TEXT_MATH_MANUAL_REVIEW_NEW_GUIDE_EPOCH',
            'sourceCommit':REF,'runtimeProfileSha256':PROFILE,'records':rows,
            'candidateTextMathManualPassCount':sum(r['candidateTextMathManualReview']['ok']for r in rows),
            'limitedGuideAndReadingCases':32,
            'fullActivityAcceptances':0,'activityCredit':0,'original139PartialInventoryNotPromoted':True,
            'humanApproval':'NOT_RUN','publicationAction':'NONE'}
