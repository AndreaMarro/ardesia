#!/usr/bin/env python3
"""Run the recovery authority/lock proof on a fresh local TLS PostgreSQL17.

No remote connection is accepted. No host service is registered. The temporary
server and database are removed in finally; only the named Deno test runs.
"""
import argparse
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[2]


def main():
    import psycopg
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--postgres-bin',type=Path,default=Path('/opt/homebrew/opt/postgresql@17/bin'))
    args=parser.parse_args()
    deno=shutil.which('deno')
    if not deno:parser.error('Deno is required')
    with socket.socket() as address:
        address.bind(('127.0.0.1',0));port=address.getsockname()[1]
    with tempfile.TemporaryDirectory(prefix='ardesia-upload-recovery-') as directory:
        private=Path(directory);private.chmod(0o700);data=private/'data';started=False
        with (private/'setup.log').open('w') as log:
            os.chmod(log.name,0o600)
            def run(command):subprocess.run(command,stdout=log,stderr=log,check=True,timeout=30)
            try:
                run([str(args.postgres_bin/'initdb'),'-D',str(data),'--username=postgres','--auth=trust','--no-locale','--encoding=UTF8'])
                run(['openssl','req','-new','-x509','-days','1','-nodes','-subj','/CN=localhost','-keyout',str(data/'server.key'),'-out',str(data/'server.crt')])
                (data/'server.key').chmod(0o600)
                with (data/'postgresql.conf').open('a') as config:
                    config.write(f"\nlisten_addresses='127.0.0.1'\nport={port}\nunix_socket_directories='{private}'\nssl=on\nssl_cert_file='server.crt'\nssl_key_file='server.key'\n")
                run([str(args.postgres_bin/'pg_ctl'),'-D',str(data),'-l',str(private/'server.log'),'-w','-t','20','start']);started=True
                url=f'postgresql://postgres@127.0.0.1:{port}/postgres?sslmode=require'
                with psycopg.connect(url,autocommit=True) as connection:
                    connection.execute('''CREATE ROLE ardesia_app NOLOGIN;
                        CREATE ROLE ardesia_test_runtime LOGIN NOINHERIT NOBYPASSRLS;
                        GRANT ardesia_app TO ardesia_test_runtime;
                        CREATE TABLE study_assets(id TEXT PRIMARY KEY,marker TEXT);
                        CREATE TABLE study_upload_intents(id TEXT PRIMARY KEY,edition_id TEXT,owner_id TEXT,state TEXT CHECK(state IN ('pending','committed','cleanup_required')),expires_at DOUBLE PRECISION,created_at DOUBLE PRECISION);
                        CREATE TABLE study_upload_requests(actor_id TEXT,request_key TEXT,payload_hash TEXT,asset_id TEXT UNIQUE REFERENCES study_upload_intents(id) ON DELETE CASCADE,PRIMARY KEY(actor_id,request_key));
                        ALTER TABLE study_assets ENABLE ROW LEVEL SECURITY;
                        ALTER TABLE study_upload_intents ENABLE ROW LEVEL SECURITY;
                        ALTER TABLE study_upload_requests ENABLE ROW LEVEL SECURITY;
                        GRANT SELECT,INSERT,UPDATE,DELETE ON study_assets,study_upload_intents,study_upload_requests TO ardesia_app;
                        CREATE POLICY unavailable_actor_assets ON study_assets TO ardesia_app USING(false) WITH CHECK(false);
                        CREATE POLICY unavailable_actor_intents ON study_upload_intents TO ardesia_app USING(false) WITH CHECK(false);''')
                    connection.execute((ROOT/'supabase/functions/closure1-upload-recovery/operator-review.sql').read_text())
                env={**os.environ,'ARDESIA_TEST_RECOVERY_DB':url,'PGPASSWORD':'','PGTARGETSESSIONATTRS':''}
                return subprocess.run([deno,'test','--allow-env',f'--allow-net=127.0.0.1:{port}',
                    '--config','supabase/functions/closure1-upload-recovery/deno.json','--lock','supabase/functions/closure1-upload-recovery/deno.lock',
                    'supabase/functions/closure1-upload-recovery/postgres_test.ts'],cwd=ROOT,env=env,check=False,timeout=45).returncode
            finally:
                if started:run([str(args.postgres_bin/'pg_ctl'),'-D',str(data),'-w','-t','20','stop'])


if __name__=='__main__':raise SystemExit(main())
