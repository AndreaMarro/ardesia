"""Offline independent oracle for retained REA captures (no target execution)."""
import hashlib,json,pathlib,re
HERE=pathlib.Path(__file__).resolve().parent
before=json.loads((HERE/'baseline-evidence.json').read_text())
after=json.loads((HERE/'replay-evidence.json').read_text())
checks=[]
def check(name,condition):
    checks.append({'name':name,'pass':bool(condition)})
    assert condition,name
def doms(evidence):
    for step in evidence['normalized_result']['steps']:
        value=step['artifacts']['dom'].get('value')
        if value:
            check('DOM digest '+step['step_id'],hashlib.sha256(value['text'].encode()).hexdigest()==value['sha256'])
            yield step['step_id'],value['text']
b=dict(doms(before));a=dict(doms(after))
check('baseline Room has ordinary navigation', 'Viste Ardesia' in b['room-ready'])
check('baseline has no recording action','Registra audio' not in b['room-ready'])
check('every declared REA replay action completed',all(step['status']=='completed' for step in after['normalized_result']['steps']))
check('replay provides an audio element','<audio' in a['replay-ready'])
check('replay exposes two independent take controls', 'Poiseuille: qui la differenza di pressione resta fissata.' in a['replay-ready'] and 'A portata fissata isoliamo la differenza di pressione.' in a['replay-ready'])
check('room B is absent from replay DOM','Questa annotazione appartiene soltanto alla lezione B.' not in a['replay-ready'])
slider=re.search(r'<input[^>]*aria-label="linea del tempo della lezione"[^>]*>',a['last-event']).group()
maximum=re.search(r' max="(\d+)"',slider).group(1);value=re.search(r' value="(\d+)"',slider).group(1)
check('keyboard End reaches the actual final instant',maximum==value)
check('explicit native playback control exists',"Ascolta registrazione dall'inizio" in a['listen-real-take'])
check('mobile and reduced motion capture',after['parameters']['environment']['viewport']['width']==390 and after['parameters']['environment']['reduced_motion']=='reduce')
check('provider owned browser cleaned up',after['normalized_result']['browser']['cleanup']=='terminated-owned-process')
result={'evidenceIds':[before['evidence_id'],after['evidence_id']],'checks':checks,'pass':True,'limits':'Observed UI and declared seeded synthetic recordings; actual decoding and storage round-trip are separate native/UI proofs. Artifact identity was not supplied by REA. No total economic saving inferred.'}
(HERE/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(checks)}/{len(checks)} PASS')
