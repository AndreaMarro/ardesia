"""Rehearse product coexistence from Git objects in a temporary directory, without moving any ref."""
import argparse
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile

APP = Path(__file__).resolve().parents[1]
PRODUCT = APP.name
ROOT = APP.parent
CORE = ("app.py", "server", "migrations", "content", "contracts", "policies", "examples", "static/lab-models.json")
PROTECTED = ("editorial/", "tools/corpus_engineering/", "tests/corpus/", "materials/", "static/figures/")
HISTORY = """
import hashlib,json
from server import store
store.initialize()
with store.connect() as db:
    if not db.execute("SELECT 1 FROM users WHERE id='rehearsal'").fetchone():
        db.execute("INSERT INTO users VALUES('rehearsal','rehearsal@example.test','!','lettore',0)")
        db.execute("INSERT INTO reads VALUES('rehearsal','C1-L001',1,190)")
        db.execute("INSERT INTO attempts VALUES('rehearsal-run',0,'rehearsal','C1-Q001',1,'C1-L001','rehearsal',1,0,191)")
    result={}
    for table in ('heads','versions','reads','attempts','runs','access','reading_preferences'):
        rows=[tuple(r) for r in db.execute('SELECT * FROM '+table+' ORDER BY rowid')]
        result[table]={'count':len(rows),'sha256':hashlib.sha256(store.encode(rows).encode()).hexdigest()}
    result['publishedExamItems']=sum(r['kind']=='question' and bool(r.get('exam')) for r in store.published(db))
    result['schema']=db.execute('PRAGMA user_version').fetchone()[0]
    print(json.dumps(result))
"""


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def changes(base, head):
    paths = git("diff", "--no-renames", "--name-only", "-z", base, head).decode().split("\0")
    return {p for p in paths if p}


def local_command(folder, database, *command):
    env = dict(os.environ, ASTRA_DATA=str(database), ASTRA_HOSTED="0", PYTHONDONTWRITEBYTECODE="1")
    return subprocess.check_output([sys.executable, *command], cwd=folder, env=env, text=True)


def rehearse(base, platform, scientific):
    base, platform, scientific = [git("rev-parse","--verify",ref+"^{commit}").decode().strip()
                                  for ref in (base,platform,scientific)]
    prefix = PRODUCT + "/"
    own, other = changes(base, platform), changes(base, scientific)
    shared = own & other
    same = {p for p in shared if git("ls-tree",platform,"--",p)==git("ls-tree",scientific,"--",p)}
    unrelated = [p for p in own if not p.startswith(prefix)]
    guarded = [p for p in own if p.startswith(prefix) and p[len(prefix):].startswith(PROTECTED)]
    conflicts = sorted(shared - same)
    if unrelated or guarded or conflicts:
        raise SystemExit(json.dumps({"sharedChanges":conflicts,"outsideProduct":unrelated,"protected":guarded},indent=2))
    report={"base":base,"platform":platform,"scientific":scientific,"platformPaths":len(own),
            "scientificProductPaths":sum(p.startswith(prefix) for p in other),"identicalOverlaps":sorted(same),"incompatiblePaths":[]}
    with tempfile.TemporaryDirectory(prefix="cric-convergenza-") as tmp:
        tmp = Path(tmp).resolve()
        # Only the executable product surface is needed to exercise the old notebook;
        # no scientific draft, working tree, unpublished figure or source archive is copied.
        archive = git("archive",scientific, *[prefix+component for component in CORE])
        for name in ("old","composed"):
            destination=tmp/name; destination.mkdir()
            with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
                for entry in tar:
                    target = destination / entry.name
                    if entry.isfile() and target.resolve().is_relative_to(destination):
                        target.parent.mkdir(parents=True,exist_ok=True)
                        target.write_bytes(tar.extractfile(entry).read())
        old, composed, database = tmp/"old"/PRODUCT, tmp/"composed"/PRODUCT, tmp/"notebook"
        before=json.loads(local_command(old,database,"-c",HISTORY))
        for record in sorted(own):
            target=tmp/"composed"/record
            if not git("ls-tree",platform,"--",record):
                target.unlink(missing_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(git("show",platform+":"+record))
        for _ in range(2):
            install=json.loads(local_command(composed,database,"app.py","install-discipline","examples/discipline/catalog.json"))
            if install["changed"] != (_ == 0):
                raise RuntimeError("Replay del pacchetto incoerente.")
        current=json.loads(local_command(composed,database,"-c",HISTORY))
        reopened=json.loads(local_command(old,database,"-c",HISTORY))
        if before != current or current != reopened:
            raise RuntimeError("Lo storico differisce dopo aggiornamento o riapertura con il vecchio lettore.")
        tx="""from server import store,discipline_study as s
with store.connect() as db:
 db.execute('BEGIN IMMEDIATE')
 u=db.execute("SELECT * FROM users WHERE id='rehearsal'").fetchone()
 d=dict(kind='answer',requestId='first',unitId='tessere',version='1',activityId='griglia',optionId='a')
 r=s.route(db,u,['misure','events'],d,True,True)
 assert r['correct'] and not r['assisted']
 assert s.route(db,u,['misure','me'],{},False,True)['skills']['area']['independent']==1
 assert len(s.route(db,u,[],{},False,True)['disciplines'])==2
"""
        local_command(composed,database,"-c",tx)
        # A subsequent legacy startup must also leave the newly recorded attempt untouched.
        local_command(old,database,"-c",HISTORY)
        local_command(composed,database,"-c",tx)
        report.update(legacy=before,installReplay="identical",oldReader="identical",newAttemptAfterLegacyRestart="identical")
    return report


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", required=True)
    parser.add_argument("--platform", default="HEAD")
    parser.add_argument("--scientific",required=True)
    args=parser.parse_args()
    print(json.dumps(rehearse(args.base,args.platform,args.scientific),indent=2))
