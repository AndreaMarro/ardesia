"""Recover the exact successful runner delivery; uses the existing ETL loader.

Transport/adoption receipt only. Does not generate content or approve publication.
"""
from pathlib import Path, PurePosixPath
import hashlib, json, os, shutil, subprocess, zipfile, fcntl

APP = Path('/private/tmp/cric-resident-integrator/officina-di-fisica')
ZIP = Path('/private/tmp/cric-preintegration-45654876359.zip')
SHA = 'fc359476a908784ba07f96f112dc867a2e502a1878272cde8a667e211fa29cac'
PIN = '46042d7e6b625b7029b31c7a3567f48f5a3f9f37'
DEST = APP / 'editorial/reviews/preintegration-45654876359-root-adoption-20261125'
TMP = APP / 'var/recovered-45654876359'
def sha(b): return hashlib.sha256(b).hexdigest()
def write_json(p,v):
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')

def main():
    from tools.corpus_engineering.pipeline import load_checkpoint
    from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
    assert shutil.disk_usage(APP).free > 2*1024**3
    assert sha(ZIP.read_bytes()) == SHA
    assert runtime_fingerprint(APP)['sha256'] == '1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
    DEST.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(ZIP) as z:
        assert len(z.namelist()) == len(set(z.namelist()))
        for i in z.infolist():
            path=PurePosixPath(i.filename)
            assert not path.is_absolute() and '..' not in path.parts
            assert (i.external_attr>>16)&0o170000 != 0o120000
        for n in z.namelist():
            if n.startswith('preintegration/delivery/') or n.startswith('corpus-preview-evidence/'):
                target=TMP/n; target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(n))
        corpus=TMP/'preintegration/delivery/editorial/corpus'
        checkpoint=json.loads((corpus/'checkpoint.json').read_bytes())
        gen=corpus/checkpoint['generation']
        assert sha((gen/'manifest.json').read_bytes())==checkpoint['manifestSha256']
        for line in (gen/'SHA256SUMS').read_text().splitlines():
            digest,name=line.split('  ',1)
            assert sha((gen/name).read_bytes())==digest, name
        questions,activities,meta=load_checkpoint(corpus)
        counts=(len(questions),len(activities),sum(r['state']=='REVISED_DRAFT' for r in questions),sum(r['state'] in ('REVIEWED_EXISTING_EDITION','REVISED_ACTIVITY_DRAFT') for r in activities))
        assert counts==(4606,385,3312,246),counts
        index=json.loads((TMP/'preintegration/delivery/editorial/reviews/runtime1a3502eb7459-terminal-evidence/index.json').read_bytes())
        assert (index['savedBatches'],index['savedCases'])==(219,9987)
        assert sha((APP/'editorial/batches/registry.json').read_bytes())==index['registrySha256']
        for entry in index['entries']:
            assert sha((APP/'editorial/batches'/(entry['batch']+'.json')).read_bytes())==entry['packageFileSha256']
            for pk,hk in [('reportPath','reportSha256'),('terminalMarkerPath','terminalMarkerSha256')]:
                assert sha((TMP/'preintegration/delivery'/entry[pk]).read_bytes())==entry[hk]
        coexist=json.loads(z.read('preintegration/registry-coexistence.json'))
        assert coexist['beforePublishedCount']==coexist['afterPublishedCount']==991
        assert coexist['beforePublishedSha256']==coexist['afterPublishedSha256'] and coexist['newPublications']==0
        full=z.read('preintegration-full-tests.log'); assert b'Ran 924 tests in 926.610s\n\nOK' in full
        release=z.read('preintegration/officina-release.zip')
        release_sha=sha(release)
        assert release_sha=='cfc7b27f3e87b27b347e74336d25d10f4204d2574b7843363becbaafe14dcb83'
        # Retain the complete exact upstream ZIP, including every original PNG and
        # release, in bounded transport pieces below GitHub's file-size limit.
        pieces=[]
        with ZIP.open('rb') as source:
            for number in range(100):
                blob=source.read(40*1024**2)
                if not blob:break
                target=DEST/f'upstream-artifact.zip.part-{number+1:03d}'
                if target.exists():assert target.read_bytes()==blob
                else:target.write_bytes(blob)
                pieces.append({'path':str(target.relative_to(APP)),'bytes':len(blob),'sha256':sha(blob)})
        old_receipt=DEST/'receipt.json'
        prior={str(p.relative_to(DEST/'prior')):sha(p.read_bytes()) for p in (DEST/'prior').rglob('*') if p.is_file()}
        if old_receipt.exists():
            recorded=json.loads(old_receipt.read_text())['priorChangedFilesArchived']
            assert all(prior.get(p)==h for p,h in recorded.items()), 'Archived prior evidence changed'
        adopted={}
        delivery=TMP/'preintegration/delivery'
        delivery_members=[n for n in z.namelist() if n.startswith('preintegration/delivery/') and not n.endswith('/')]
        expected={Path(n.removeprefix('preintegration/delivery/')) for n in delivery_members}
        present={p.relative_to(delivery) for p in delivery.rglob('*') if p.is_file()}
        assert present==expected, 'Unpinned residual delivery files in reusable staging'
        paths=[delivery/rel for rel in sorted(expected)]
        # The pointer is atomically replaced only after all immutable generation
        # files and all accompanying reports have been verified and installed.
        pointer=delivery/'editorial/corpus/checkpoint.json'
        paths.remove(pointer)
        pointer_target=APP/'editorial/corpus/checkpoint.json'
        if pointer_target.read_bytes()!=pointer.read_bytes():
            rel=pointer.relative_to(delivery);old=pointer_target.read_bytes()
            backup=DEST/'prior'/rel;backup.parent.mkdir(parents=True,exist_ok=True)
            if backup.exists():assert backup.read_bytes()==old
            else:backup.write_bytes(old)
            prior[str(rel)]=sha(old)
        for source in paths:
            rel=source.relative_to(delivery);target=APP/rel;blob=source.read_bytes()
            if target.exists() and target.read_bytes()!=blob:
                old=target.read_bytes();backup=DEST/'prior'/rel;backup.parent.mkdir(parents=True,exist_ok=True)
                if backup.exists():assert backup.read_bytes()==old
                else:backup.write_bytes(old)
                prior[str(rel)]=sha(old)
            target.parent.mkdir(parents=True,exist_ok=True)
            if not target.exists() or target.read_bytes()!=blob:
                temporary=target.with_name(target.name+'.adoption-tmp');temporary.write_bytes(blob);os.replace(temporary,target)
            adopted[str(rel)]=sha(blob)
        for name in ['preintegration-full-tests.log','preintegration-fresh.log','preintegration-incremental.log','preintegration-batches.log','preintegration/scientific-refresh.json','preintegration/preview-producer.json']:
            target=DEST/Path(name).name;target.write_bytes(z.read(name))
        # Standard persistence validates authentic terminal markers against the
        # current registry and the unchanged browser protocols; it renders none.
        env=dict(os.environ,PYTHONPATH='.',PYTHONDONTWRITEBYTECODE='1')
        p=subprocess.run(['node','tools/corpus_engineering/persist_previews.mjs',str(TMP/'corpus-preview-evidence'),index['runtimeSha256']],cwd=APP,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        (DEST/'root-standard-persistence.txt').write_bytes(p.stdout)
        assert p.returncode==0,p.stdout.decode()
        for rel,pin in adopted.items(): assert sha((APP/rel).read_bytes())==pin,rel
        # No failure above can advance the active pointer. A crash after this
        # atomic replacement is recoverable from the immutable generation and
        # the verbatim upstream artifact; rerun preserves the archived prior.
        temporary=pointer_target.with_name(pointer_target.name+'.adoption-tmp')
        temporary.write_bytes(pointer.read_bytes());os.replace(temporary,pointer_target)
        adopted['editorial/corpus/checkpoint.json']=sha(pointer.read_bytes())
        receipt={'schemaVersion':'1.0.0','runId':45654876359,'jobId':139348744931,'headSha':PIN,'conclusion':'SUCCESS','artifactId':15044259884,'artifactSha256':SHA,'artifactBytes':ZIP.stat().st_size,'boundedVerbatimArtifactParts':pieces,'reconstruct':'Concatenate part-001..part-004 in order, then verify artifactSha256 before ZIP extraction.','checkpoint':checkpoint,'actualCounts':dict(zip(['questions','activities','questionDrafts','reviewedActivities'],counts)),'uiBatches':219,'uiCases':9987,'fullTrackedSuite':{'tests':924,'seconds':926.610,'observedExitCode':0},'freshAndIncremental':'PASS_IDENTICAL_BYTES_ON_RUNNER','coexistence':'PASS','releaseSha256':release_sha,'releasePackageVerification':'PASS_ON_EXACT_RUN_TREE','filesAdopted':adopted,'priorChangedFilesArchived':prior,'rootTerminalMarkersRevalidated':True,'requiredPRCIOnCurrentHead':'NOT_RUN_YET','canonicalMerge':'NOT_DONE','laterScientificQuestionsAwaitingRegistration':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        write_json(DEST/'receipt.json',receipt)
        stage=[str((APP/rel).relative_to(APP.parent)) for rel in adopted]
        stage.extend(str(p.relative_to(APP.parent)) for p in DEST.rglob('*') if p.is_file())
        write_json(TMP/'stage-paths.json',stage)
        print(json.dumps({k:receipt[k] for k in ['checkpoint','actualCounts','uiBatches','uiCases','fullTrackedSuite']},indent=2),flush=True)

if __name__=='__main__':
    with open('/private/tmp/cric-bounded-local-work.lock','a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        main()
