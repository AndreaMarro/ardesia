"""Consistent paired backup; no access tokens, sessions or unreferenced blobs."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.operations import backup_data as backup

if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit('Usage: backup.py SOURCE_DATA_DIR NEW_BACKUP_DIR')
    print(json.dumps(backup(Path(sys.argv[1]),Path(sys.argv[2]))))
