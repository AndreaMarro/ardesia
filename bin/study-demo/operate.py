#!/usr/bin/env python3
"""Private local operator CLI. Never points at a remote host."""
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.operations import check_data,restore_data,erase_student,resume_erasures

parser=argparse.ArgumentParser()
sub=parser.add_subparsers(dest='operation',required=True)
health=sub.add_parser('health');health.add_argument('data',type=Path)
restore=sub.add_parser('restore');restore.add_argument('backup',type=Path);restore.add_argument('destination',type=Path);restore.add_argument('--current-erasure-ledger',type=Path,required=True)
erase=sub.add_parser('erase');erase.add_argument('data',type=Path);erase.add_argument('actor');erase.add_argument('--apply',action='store_true');erase.add_argument('--confirm-actor')
resume=sub.add_parser('resume-erasures');resume.add_argument('data',type=Path)
args=parser.parse_args()
if args.operation=='health':result=check_data(args.data)
elif args.operation=='restore':result=restore_data(args.backup,args.destination,args.current_erasure_ledger)
elif args.operation=='resume-erasures':result=resume_erasures(args.data)
else:
    if args.apply and args.confirm_actor!=args.actor:parser.error('--apply requires --confirm-actor matching the exact opaque actor')
    result=erase_student(args.data,args.actor,apply=args.apply)
print(json.dumps(result))
if result.get('ok') is False:raise SystemExit(1)
