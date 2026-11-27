"""Prepare bounded C4 evidence from the frozen source-first review and real consumer samples."""

import argparse
from fractions import Fraction
import json
from pathlib import Path

from scoped_replay import CANDIDATE, COLLECTOR, RUNTIME, freeze, git_blob, pin, profile, write
from tools.corpus_engineering.experiment_visibility_request import planned_interactions
from tools.corpus_engineering.pipeline import digest


PEER = 'f08c7dc294ca9aee0ba70a576c1076617f76b31b'
FOLDER = 'officina-di-fisica/editorial/reviews/c4-matter-circuits-draft-independent-b-20261127'
BATCH = 'experiment-c4-matter-circuits-reading-20261127'
ORIGINAL = '5d1dc8dc7b601aef959d10d564c75462be74708d'


def entries(app, policy, minimum_only=False):
    sources = {row['id']: row for row in json.loads((app/'content/esperienze-C4.json').read_bytes())}
    review, consumer, package, bindings = [json.loads(policy[key]) for key in ('review','consumer','package','bindings')]
    manuals = {row['id']: row for row in review['perId']}
    actual = {row['id']: row for row in consumer['results'] if row['variant']=='draft'}
    bound = {row['id']: row for row in bindings}
    out = []
    drafts = package['records'][:2] if minimum_only else package['records']
    for draft in drafts:
        key = draft['id']
        source, proof, model, binding = sources[key], manuals[key], actual[key], bound[key]
        assert digest(draft)==proof['candidateSha256']==binding['candidateSha256']
        assert digest(source)==proof['sourceSha256']==binding['sourceSha256']
        assert source['version']==draft['baseVersion'] and binding['sourceRef']==ORIGINAL
        assert proof['manualArithmetic']==proof['pedagogicalReading']=='PASS'
        approved_pairs = dict(zip(map(Fraction,proof['inputs']), map(Fraction,proof['independentExactResults']), strict=True))
        assert set(approved_pairs)=={Fraction(str(value)) for value in draft['assessmentSelection']['points']}
        grid = list(draft['assessmentSelection']['points'])
        for value in (source['control']['min'],source['control']['max']):
            if value not in grid:
                grid.append(value)
        samples = {row['x']:row for row in model['states']}
        expected = [samples[x]['solve']['y'] for x in grid]
        questions = []
        for x, q in zip(grid[:2],model['questions'],strict=True):
            exact = approved_pairs[Fraction(str(x))]
            assert abs(float(exact)-q['value'])<=1e-12
            entry = str(exact.numerator) if exact.denominator==1 else str(float(exact))
            assert Fraction(entry)==exact
            questions.append({'input':entry,'prompt':q['prompt'],'expectedAccepted':True,
                              'sourceManualReadiness':'INDEPENDENT_MANUAL_C4_53BD_REPLAY'})
        if minimum_only:
            control = source['control']
            assert control['min'] == 0 and control['step'] > 0
            grid = [control['step']]
            expected = [samples[grid[0]]['solve']['y']]
        clocks = []
        if model['clock']:
            assert key=='SIM-C4-L05-01' and not model['clock']['input']
            samples_end = {row['time']:row['signal'] for row in samples[4]['clock']}
            for t in (0,2,4):
                assert samples_end[t]==2*t
                clocks.append({'gridIndex':grid.index(4),'time':t,'duration':4})
        out.append({'id':key,'course':'C4','variant':'draft','sourceSha256':digest(source),
                    'candidateSha256':digest(draft),'record':draft,'grid':grid,'expectedValues':expected,
                    'clockCases':clocks,'auxiliaryCases':[],'hasClock':bool(model['clock']),'clockInput':False,
                    'questions':questions,'sourcePrediction':model['prediction'],'originalJudgment':'SEE_DISTINCT_FROZEN_PEER_REVIEW'})
    assert len(out)==(2 if minimum_only else 7)
    return out


def prepare(app, repo, staging, directory, width, part, candidate=CANDIDATE, runtime=RUNTIME):
    fingerprint,_=profile(app,runtime)
    directory.mkdir(parents=True,exist_ok=True)
    inputs=directory/'inputs'
    inputs.mkdir(exist_ok=True)
    package_name=BATCH+'.json'
    bindings_name=BATCH+'-bindings.json'
    commit='8856555c00ec81dc093858346bc8ce57c11a2451'
    prefix='officina-di-fisica/editorial/batches/'
    policy={'review':git_blob(repo,PEER,FOLDER+'/independent-review.json'),
            'consumer':git_blob(repo,PEER,FOLDER+'/actual-code.json'),
            'package':git_blob(staging,commit,prefix+package_name),
            'bindings':git_blob(staging,commit,prefix+bindings_name)}
    review=json.loads(policy['review'])
    assert review['rawPackageSha256']==pin(policy['package']) and review['bindingsSha256']==pin(policy['bindings'])
    rows=entries(app,policy,minimum_only=part == 'minimum')
    if part == 'matter':
        rows = rows[:3]
    elif part == 'circuits':
        rows = rows[3:]
    files={str(inputs/package_name):freeze(inputs/package_name,policy['package']),
           str(inputs/bindings_name):freeze(inputs/bindings_name,policy['bindings'])}
    authority={key:freeze(directory/f'frozen-{key}.json',raw) for key,raw in policy.items() if key in ('review','consumer')}
    request={'schemaVersion':'1.0.0','scope':f'C4_FIRST_SEVEN_DRAFTS_{part.upper()}_{width}','runtimeSha256':runtime,
             'runtimeCommit':candidate,'collectorSha256':COLLECTOR,'independentPeerCommit':PEER,
             'authoritySha256':authority,'inputFiles':files,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    views = ('top','fixed_projection') if part == 'minimum' else ('orbit','side','top','fixed_projection')
    profiles=[{'width':width,'view':view,'fallback':view=='fixed_projection'} for view in views]
    keys=[]
    for row in rows:
        for p in profiles:
            start='|'.join((row['id'], 'draft', str(width), p['view']))
            keys.extend([start+'|setup',*(start+f'|grid|{index}' for index in range(len(row['grid']))),
                         *(start+f'|clock|{index}' for index in range(len(row['clockCases'])))])
    plan={'schemaVersion':'1.0.0','scope':request['scope'],'course':'C4','originalRef':ORIGINAL,
          'runtimeFingerprint':fingerprint,'sourceCommit':candidate,'requestSha256':write(directory/'request.json',request),
          'records':rows,'draftRecords':json.loads(policy['package'])['records'],'profiles':profiles,
          'expectedCaseKeys':keys,'inputFiles':files,'packageFiles':[str(inputs/package_name)],
          'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    planned_interactions(plan)
    prepared=directory/'prepared.json'
    write(prepared,plan)
    write(directory/'browser-info.json',{'candidateApp':str(app),'prepared':str(prepared),'output':str(directory/'actual')})
    print(width,len(keys),pin(prepared.read_bytes()))


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('app',type=Path)
    parser.add_argument('peer',type=Path)
    parser.add_argument('staging',type=Path)
    parser.add_argument('output',type=Path)
    parser.add_argument('width',type=int,choices=(320,1280))
    parser.add_argument('part',choices=('matter','circuits','minimum'))
    parser.add_argument('--runtime-ref', default=CANDIDATE)
    parser.add_argument('--runtime-sha256', default=RUNTIME)
    args=parser.parse_args()
    prepare(args.app.resolve(),args.peer.resolve(),args.staging.resolve(),args.output.resolve(),args.width,args.part,
            args.runtime_ref,args.runtime_sha256)
