"""Start a new loopback-only synthetic S08 fixture. Never reuses a database."""
import argparse
import json
import os
from pathlib import Path
import uvicorn
from lessonos.study.store import StudyStore
from study_api.app import create_app

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--directory',type=Path,required=True)
parser.add_argument('--port',type=int,default=5481)
args=parser.parse_args()
if args.directory.exists() and any(args.directory.iterdir()):parser.error('Choose an empty directory; existing files are never overwritten.')
args.directory.mkdir(parents=True,exist_ok=True)
db=args.directory/'study.sqlite'
if db.exists():parser.error('Choose a fresh directory; existing databases are never cleared.')
os.umask(0o077)
store=StudyStore(db)
actors={name:store.create_principal(name,role) for name,role in [('tutor-media','teacher'),('student-media','student'),('other-media','student')]}
store.create_edition(actors['tutor-media'],'fluidi',capacity=4,price_minor=0)
store.add_test_member(actors['tutor-media'],'fluidi','student-media')
(args.directory/'access.json').write_text(json.dumps({name:store.issue_session(actor) for name,actor in actors.items()}))
store.close()
uvicorn.run(create_app(db,demo=True),host='127.0.0.1',port=args.port)
