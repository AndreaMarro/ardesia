import importlib.util,json,shutil,tempfile
from pathlib import Path
out=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("old_git_provenance",out/"git-provenance-before.py")
old=importlib.util.module_from_spec(spec);spec.loader.exec_module(old)
data=json.loads((out/"git-inputs.json").read_bytes())
with tempfile.TemporaryDirectory()as tmp:
 root=Path(tmp);shutil.copyfile(out/"git-inputs.json",root/"git-inputs.json")
 for item in data["inputs"]:shutil.copyfile(out/item["snapshot"],root/item["snapshot"])
 actual=old.fixture_commit_refs(root);expected=sorted({i["commit"]for i in data["inputs"]})
 print(json.dumps({"observedOldRefs":actual,"requiredImmutableModelRefs":expected}),flush=True)
 assert actual==expected,"Old discovery omits declared pre-key model commits"
