"""Paired SQLite+blob backup; excludes raw access tokens and public distribution."""
import hashlib,json,os,shutil,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.store import StudyStore,digest


def backup(source:Path,destination:Path):
    os.umask(0o077);destination.mkdir(mode=0o700,parents=True,exist_ok=False)
    store=StudyStore(source/'study.sqlite');store.backup(destination/'study.sqlite')
    if (source/'blobs').exists():shutil.copytree(source/'blobs',destination/'blobs')
    verified=StudyStore(destination/'study.sqlite');count=0
    for row in verified.connection.execute('SELECT blob_ref,sha256 FROM study_assets WHERE deleted=0'):
        if digest((destination/'blobs'/row['blob_ref']).read_bytes())!=row['sha256']:raise ValueError('backup_blob_integrity_failure')
        count+=1
    if verified.connection.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise ValueError('backup_database_integrity_failure')
    result={'databaseIntegrity':'ok','verifiedBlobs':count,'submissions':verified.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0],'rawAccessTokensIncluded':False}
    (destination/'backup-manifest.json').write_text(json.dumps(result,indent=2));verified.close();store.close();return result

if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit('Usage: backup.py SOURCE_DATA_DIR NEW_BACKUP_DIR')
    print(json.dumps(backup(Path(sys.argv[1]),Path(sys.argv[2]))))
