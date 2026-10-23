#!/usr/bin/env python3
import argparse,os,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path[:0]=[str(ROOT/'packages/engine'),str(ROOT/'services/study-api')]
from seed import seed
from study_api.app import create_app
import uvicorn
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--data-dir',type=Path,default=ROOT/'.study-demo');parser.add_argument('--port',type=int,default=5208);parser.add_argument('--no-seed',action='store_true');parser.add_argument('--no-frontend',action='store_true');args=parser.parse_args()
    os.umask(0o077)
    if args.no_seed:
        if not (args.data_dir/'study.sqlite').is_file():parser.error('--no-seed requires an existing database')
    else:seed(args.data_dir)
    app=create_app(args.data_dir/'study.sqlite',demo=True,frontend=None if args.no_frontend else ROOT/'apps/studio/dist')
    print(f'Ardesia synthetic demo: http://127.0.0.1:{args.port}/?vista=fisica',flush=True)
    uvicorn.run(app,host='127.0.0.1',port=args.port,access_log=False,log_level='warning')
