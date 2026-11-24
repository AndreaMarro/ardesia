"""Stdlib-only fingerprint of the actual private-preview runtime and audit dependencies."""
import hashlib
import json
from pathlib import Path


def file_sha(file):return hashlib.sha256(file.read_bytes()).hexdigest()


def runtime_fingerprint(app):
    app=app.resolve();files={}
    for folder in ("server","static","content","contracts","migrations"):
        for file in sorted((app/folder).rglob("*")):
            relative=file.relative_to(app)
            if not file.is_file() or any(part.startswith('.') or part=='__pycache__' for part in relative.parts):continue
            if not file.resolve().is_relative_to(app):raise ValueError("Runtime fingerprint cannot follow external symlinks")
            files[relative.as_posix()]=file_sha(file)
    for name in ("package.json","package-lock.json","tools/corpus_engineering/draft_import.py",
                 "node_modules/axe-core/axe.min.js","node_modules/axe-core/package.json","node_modules/playwright/package.json"):
        file=app/name
        if file.is_file():files[name]=file_sha(file)
    payload={"protocolSha256":file_sha(Path(__file__)),"files":files}
    raw=json.dumps(payload,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
    return {"sha256":hashlib.sha256(raw).hexdigest(),**payload}


if __name__=="__main__":
    print(json.dumps(runtime_fingerprint(Path(__file__).resolve().parents[2]),sort_keys=True,separators=(',',':')))
