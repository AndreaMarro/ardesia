#!/usr/bin/env python3
"""Create a private short-lived capability and public-hash worker configuration.

This performs no provider/API request and grants no authority by itself.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import time
import uuid

URL='https://gavfmrynhsdxdqbmdkxq.supabase.co/functions/v1/closure1-upload-recovery'


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--private-dir',type=Path,required=True)
    parser.add_argument('--ttl-seconds',type=int,default=2700)
    args=parser.parse_args()
    if not 60<=args.ttl_seconds<=3300:parser.error('ttl must be 60..3300 seconds')
    args.private_dir.mkdir(parents=True,mode=0o700,exist_ok=True)
    info=args.private_dir.stat()
    if info.st_uid!=os.getuid() or info.st_mode&0o077:parser.error('private-dir must be owned by this user with mode0700')
    capability=secrets.token_hex(32)
    expires=int(time.time())+args.ttl_seconds
    stem='upload-recovery-'+uuid.uuid4().hex
    operator=args.private_dir/(stem+'.json');config=args.private_dir/(stem+'-config.ts')
    for path,text in ((operator,json.dumps({'URL':URL,'CAPABILITY':capability})),
                      (config,'export const operatorConfig = '+json.dumps({'capabilitySha256':hashlib.sha256(capability.encode()).hexdigest(),'expiresAt':expires})+';\n')):
        with os.fdopen(os.open(path,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600),'w') as output:output.write(text)
    print(json.dumps({'operatorFile':str(operator),'workerConfigFile':str(config),'expiresAt':expires}))


if __name__=='__main__':main()
