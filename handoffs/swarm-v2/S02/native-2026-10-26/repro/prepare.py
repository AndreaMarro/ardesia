"""Materialize the exact private QA composition; never edit the source checkout."""
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, tarfile

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--git-dir',type=Path,required=True)
parser.add_argument('--target',type=Path,required=True)
parser.add_argument('--node-modules',type=Path,required=True)
parser.add_argument('--python',required=True)
args=parser.parse_args()
root=args.target.resolve()
if root.exists():raise SystemExit('Target must be absent; existing work is never overwritten.')
if not args.node_modules.is_dir():raise SystemExit('Use the existing installed dependency tree; no installation is performed.')
root.mkdir(parents=True)
ref='b6cba73dfec35a243da3e4c322ba58546b1ca3fb'
paths=['apps/web','apps/studio','services/study-api','packages/engine','bin']
git=['git','--git-dir='+str(args.git_dir.resolve())]
p=subprocess.Popen([*git,'archive',ref,*paths],stdout=subprocess.PIPE)
with tarfile.open(fileobj=p.stdout,mode='r|') as archive:archive.extractall(root,filter='data')
if p.wait():raise SystemExit('Archive failed; preserve the partial QA directory for diagnosis.')
app=root/'apps/web/src/App.tsx';original=app.read_bytes();text=original.decode()
old='          view={view}\n          onView={navigate}'
assert text.count(old)==1
text=text.replace(old,'          view={view}\n          enabledViews={views}\n          onView={navigate}')
old='    history.replaceState({}, "", url);'
assert text.count(old)==1
text=text.replace(old,'    if (next === view) history.replaceState({}, "", url);\n    else history.pushState({}, "", url);')
app.write_text(text)
(root/'node_modules').symlink_to(args.node_modules.resolve(),target_is_directory=True)
qa=root/'qa';qa.mkdir()
repro=Path(__file__).resolve().parent
for name in ['verify.mjs','verify-exact-session.mjs','exact-note.mjs','serve.py','vite.config.ts']:shutil.copy2(repro/name,qa/name)
shutil.copy2(repro/'s02-native.html',root/'apps/web/s02-native.html')
shutil.copy2(repro/'s02-native-fixture.tsx',root/'apps/web/src/features/product-shell/s02-native-fixture.tsx')
(qa/'composition.json').write_text(json.dumps({'source':ref,'shellSource':'3326ac2e30624248c01b67f2ac876671e5ed3886','privateOnly':True,'appBeforeSha256':hashlib.sha256(original).hexdigest(),'appAfterSha256':hashlib.sha256(app.read_bytes()).hexdigest()},indent=2)+'\n')
subprocess.run([args.python,str(root/'bin/study-demo/seed_course_capabilities.py'),'--data-dir',str(qa/'data')],cwd=root,check=True)
print('Private QA prepared:',root)
