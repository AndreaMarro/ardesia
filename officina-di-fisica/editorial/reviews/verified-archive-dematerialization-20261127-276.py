from collections import Counter
from hashlib import sha1, sha256
import json, os, re, stat, subprocess, sys
from pathlib import Path

ROOT = Path('/private/tmp/cric-resident-integrator')
HISTORIC = Path('/private/tmp/cric-experiment-contract-fix')
TARGETS = [
    (ROOT, 'feat/cric-experiment-manual-revisions', '93ee5b5acf91de1030dbeb33f962252acb9ba34f'),
    (HISTORIC, 'feat/cric-c1-consumer-visibility', '76edf024abf52865a91ee2c48eeb6e1aa6a20d5f'),
]
REVIEW = 'officina-di-fisica/editorial/reviews'
GENERATIONS = 'officina-di-fisica/editorial/corpus/generations'
OUTPUT = ROOT / REVIEW / 'verified-archive-dematerialization-20261127-276.json'


def run(repo, *args, data=None):
    return subprocess.check_output(['git', '-c', 'gc.auto=0', '-C', str(repo), *args], input=data)


def measures(file):
    metadata = file.stat()
    git_hash = sha1(f'blob {metadata.st_size}\0'.encode())
    file_hash = sha256()
    with file.open('rb') as stream:
        while chunk := stream.read(1024 * 1024):
            git_hash.update(chunk)
            file_hash.update(chunk)
    after = file.stat()
    if (metadata.st_ino, metadata.st_mtime_ns, metadata.st_size) != (after.st_ino, after.st_mtime_ns, after.st_size):
        raise ValueError('File changed during verification: ' + str(file))
    return git_hash.hexdigest(), file_hash.hexdigest(), metadata


def candidate(repo, relative, name, allocated):
    if relative.startswith(GENERATIONS + '/'):
        return allocated >= 16384 and name not in ('checkpoint.json', 'manifest.json')
    if not relative.startswith(REVIEW + '/'):
        return False
    if re.search(r'\.part[-.]?\d+$', name):
        return True
    if name.endswith(('.zip','.tgz','.png','.gz')):
        return allocated >= 16384
    if name.endswith(('.json','.jsonl')) and not name.endswith(('receipt.json','manifest.json','checkpoint.json')) and allocated >= 256*1024:
        return True
    return False


def collect(repo, branch, commit):
    assert repo in (ROOT, HISTORIC) and repo.is_dir()
    assert run(repo, 'rev-parse', 'HEAD').decode().strip() == commit
    assert run(repo, 'rev-parse', '--show-object-format').decode().strip() == 'sha1'
    assert run(repo, 'ls-remote','origin','refs/heads/' + branch).decode().split() == [commit, 'refs/heads/'+branch]
    stalk = dict()
    for row in run(repo,'ls-tree','-rz',commit,'--',REVIEW,GENERATIONS).split(b'\0'):
        if not row:continue
        ident, relative = row.split(b'\t',1)
        mode, kind, oid = ident.split()
        if mode == b'100644' and kind == b'blob':
            stalk[os.fsdecode(relative)] = oid.decode()
    picks = []
    changed = set()
    for entry in run(repo,'diff','--name-only','-z',commit,'--',REVIEW,GENERATIONS).split(b'\0'):
        if entry:changed.add(os.fsdecode(entry))
    for relative,oid in stalk.items():
        file = repo / relative
        if relative in changed or not file.is_file() or file.is_symlink() or repo not in file.resolve().parents:
            continue
        s=file.stat()
        if not stat.S_ISREG(s.st_mode) or not candidate(repo,relative,file.name,s.st_blocks*512):
            continue
        expected,content,verified=measures(file)
        if expected!=oid:
            continue
        picks.append((file,verified,{'path':relative,'gitBlob':oid,'sha256':content,
            'bytes':verified.st_size,'allocatedBefore':verified.st_blocks*512}))
    return picks


def main(apply):
    pairs = [(repo,branch,commit,collect(repo,branch,commit)) for repo,branch,commit in TARGETS]
    for repo,branch,commit,files in pairs:
        print(repo.name,len(files),round(sum(row['allocatedBefore'] for _,_,row in files)/1024**2,1),flush=True)
    if not apply:return
    assert not OUTPUT.exists()
    before=os.statvfs(ROOT).f_bavail*os.statvfs(ROOT).f_frsize
    report=[]
    for repo,branch,commit,files in pairs:
        assert run(repo,'rev-parse','HEAD').decode().strip()==commit
        run(repo,'update-index','--skip-worktree','-z','--stdin',data=b'\0'.join(os.fsencode(row['path']) for _,_,row in files)+b'\0')
        removed=[]
        for path,previous,row in files:
            now=path.stat()
            if (now.st_ino,now.st_mtime_ns,now.st_size)!=(previous.st_ino,previous.st_mtime_ns,previous.st_size):
                run(repo,'update-index','--no-skip-worktree','--',row['path'])
                continue
            path.unlink()
            removed.append(row)
        report.append({'workspace':str(repo),'verifiedRemoteBranch':branch,'verifiedCommit':commit,
                       'dematerializedCount':len(removed),'paths':removed,
                       'rehydrate':'git restore --source='+commit+' --ignore-skip-worktree-bits -- <path>'})
    after=os.statvfs(ROOT).f_bavail*os.statvfs(ROOT).f_frsize
    OUTPUT.write_text(json.dumps({'schemaVersion':'1.0.0','action':'Only exact, existing Git worktree replicas dematerialized.',
        'freeBytesBefore':before,'freeBytesAfter':after,'noGitObjectsRemoved':True,'workspaces':report},indent=2)+'\n')
    print('free bytes',before,after,flush=True)


if __name__ == '__main__':
    main('--apply' in sys.argv)
