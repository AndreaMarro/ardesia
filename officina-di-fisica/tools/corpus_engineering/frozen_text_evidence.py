"""Read exact frozen text from its ordinary path or a verified transport ZIP.

Only two explicitly named historical Markdown files may be absent. Existing
altered files are rejected; a matching archive never masks their drift.
No extraction, source modification, model execution, approval or publication.
"""
from pathlib import Path,PurePosixPath
from io import BytesIO
import hashlib,json,re,zipfile
DIRECTORY='editorial/reviews/C2-C3-frozen-raw-evidence-20261125'
SIDECAR=DIRECTORY+'/raw-frozen-documents.json'
ARCHIVE=DIRECTORY+'/raw-frozen-documents.zip'
SIDECAR_SHA='7bc2e4423d7e8f4b061e1e54bdc4fb077bda8b4139baeab791026787e56f5e7a'
ARCHIVE_SHA='2984d8fe2f3ea635ffd505f8db8ad4fcd744592e83375132e0b256d39df69f4e'
ALLOWLIST={
 'editorial/reviews/C2-remaining26-code-partial-20261125/independent-review.md':'600c8af1de627891d1db22a94be755fb6804155356caa3f60d8b5c1e8a1d5a98',
 'editorial/reviews/independent-C3-36-source-only-primary-20261125.md':'f79bf7dce43ac234c4681ad511e7bd3659117d024dcb5191a98d0a0414332933'}

def sha(data):return hashlib.sha256(data).hexdigest()
def transport_metadata(app):
    app=Path(app);raw=(app/SIDECAR).read_bytes()
    if sha(raw)!=SIDECAR_SHA:raise ValueError('Frozen text sidecar changed')
    sidecar=json.loads(raw)
    if sidecar.get('files')!=ALLOWLIST or sidecar.get('archiveSha256')!=ARCHIVE_SHA:raise ValueError('Frozen text allowlist changed')
    if sha((app/ARCHIVE).read_bytes())!=ARCHIVE_SHA:raise ValueError('Frozen text archive changed')
    return {'sidecar':SIDECAR,'sidecarSha256':SIDECAR_SHA,'archive':ARCHIVE,'archiveSha256':ARCHIVE_SHA,
            'files':ALLOWLIST,'mode':'NORMAL_FILE_IF_PRESENT_OTHERWISE_VERIFIED_ARCHIVE_BYTES','extractionPerformed':False}

def verified_frozen_bytes(app,name,expected):
    app=Path(app);part=PurePosixPath(name)
    if part.is_absolute() or '..' in part.parts or not re.fullmatch(r'[0-9a-f]{64}',expected):raise ValueError('Expected safe relative frozen file and SHA256')
    normal=app/name
    if not normal.resolve().is_relative_to(app.resolve()):raise ValueError('Frozen file escapes application root')
    if normal.exists() or normal.is_symlink():
        if not normal.is_file():raise ValueError('Present frozen path is not a regular file: '+name)
        data=normal.read_bytes()
        if sha(data)!=expected:raise ValueError('Present frozen file changed; archive cannot mask drift: '+name)
        return data
    if name not in ALLOWLIST:raise FileNotFoundError(name)
    if expected!=ALLOWLIST[name]:raise ValueError('Frozen archive entry expected checksum differs')
    transport_metadata(app)
    zipped=(app/ARCHIVE).read_bytes()
    if sha(zipped)!=ARCHIVE_SHA:raise ValueError('Frozen text archive changed before read')
    with zipfile.ZipFile(BytesIO(zipped)) as archive:
        names=archive.namelist()
        if len(names)!=len(set(names)) or set(names)!=set(ALLOWLIST):raise ValueError('Frozen archive member set differs')
        info=archive.getinfo(name)
        if info.is_dir() or info.file_size>2*1024**2:raise ValueError('Unexpected frozen text member')
        data=archive.read(name)
    if sha(data)!=expected:raise ValueError('Frozen archive entry changed')
    return data
