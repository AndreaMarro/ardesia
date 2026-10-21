"""Local operator tools. Logical erasure is not forensic SSD/snapshot erasure.

Only study students without foreign CRM enrollment are supported. Run with the
service stopped for erasure/restore. Keep the CURRENT erasure ledger separately
from backups and always supply it when restoring an older snapshot.
"""
import json,os,re,shutil,tempfile,sqlite3
from pathlib import Path
from .store import StudyStore,canonical,digest
from .lock import data_lock


def _ledger(path):
    data=json.loads(path.read_text())
    if data.get('version')!=1 or not isinstance(data.get('actors'),list):raise ValueError('invalid_erasure_ledger')
    if any(not isinstance(actor,str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}',actor) for actor in data['actors']):raise ValueError('invalid_erasure_ledger')
    return sorted(set(data['actors']))


def _write_ledger(path,actors):
    temporary=path.with_name(path.name+'.pending')
    with temporary.open('w') as stream:
        os.chmod(temporary,0o600)
        stream.write(canonical({'version':1,'actors':sorted(set(actors))}))
        stream.flush();os.fsync(stream.fileno())
    temporary.replace(path)
    descriptor=os.open(path.parent,os.O_RDONLY)
    try:os.fsync(descriptor)
    finally:os.close(descriptor)


def _blob_path(directory,ref):
    if not isinstance(ref,str) or not re.fullmatch(r'[a-f0-9]{32}',ref):raise ValueError('blob_integrity_path')
    path=directory/'blobs'/ref
    if path.is_symlink() or (directory/'blobs').is_symlink():raise ValueError('blob_integrity_symlink')
    return path


def check_data(directory):
    """Operator-only report: no identity/content/path returned to HTTP clients."""
    directory=Path(directory)
    if not (directory/'study.sqlite').is_file():return {'ok':False,'databaseIntegrity':'missing','verifiedBlobs':0}
    try:
        with data_lock(directory/'study.sqlite'):
            connection=_existing_database(directory)
            try:
                count=0
                for row in connection.execute('SELECT blob_ref,sha256 FROM study_assets WHERE deleted=0'):
                    if digest(_blob_path(directory,row['blob_ref']).read_bytes())!=row['sha256']:raise ValueError('blob_integrity')
                    count+=1
                return {'ok':True,'databaseIntegrity':'ok','verifiedBlobs':count}
            finally:connection.close()
    except (OSError,ValueError,sqlite3.Error):return {'ok':False,'databaseIntegrity':'failed','verifiedBlobs':0}


def _existing_database(directory, *, allow_legacy_catalog=False):
    """Read-only, non-migrating inspection: never repair loss into emptiness."""
    path=Path(directory)/'study.sqlite'
    if path.is_symlink() or not path.is_file():raise ValueError('database_integrity_path')
    with path.open('rb') as stream:
        if stream.read(16)!=b'SQLite format 3\x00':raise ValueError('database_integrity_header')
    connection=sqlite3.connect(path.resolve().as_uri()+'?mode=ro',uri=True)
    connection.row_factory=sqlite3.Row
    try:
        if connection.execute('PRAGMA integrity_check').fetchone()[0]!='ok' or connection.execute('PRAGMA foreign_key_check').fetchone():raise ValueError('database_integrity')
        schema=connection.execute('SELECT version FROM study_schema').fetchall()
        if len(schema)!=1:raise ValueError('database_integrity_schema')
        required=set(re.findall(r'CREATE TABLE IF NOT EXISTS (\w+)',Path(__file__).with_name('schema.sql').read_text()))
        present={row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        missing=required-present
        legacy_missing={name for name in required if name.startswith('study_calendar_')} if schema[0][0]==2 else set()
        if allow_legacy_catalog and schema[0][0]==2:legacy_missing.add('study_edition_packs')
        if schema[0][0] in (1,2,3,4):
            from .schema_contract import ADMIN_COLUMNS
            legacy_missing.update(ADMIN_COLUMNS)
        from .scientific_notebook import NOTEBOOK_COLUMNS
        if schema[0][0] in (1,2,3,4,5):
            legacy_missing.update(NOTEBOOK_COLUMNS)
        from .schema_contract import (validate_schema, ADMIN_COLUMNS, APPROVAL_COLUMNS, EXAM_COLUMNS)
        if schema[0][0] in (1,2,3,4,5,6,7):
            legacy_missing.update(APPROVAL_COLUMNS)
        if schema[0][0] in (1,2,3,4,5,6,7):
            legacy_missing.update(EXAM_COLUMNS)
        if missing-legacy_missing:raise ValueError('database_integrity_schema')
        from .models import StudyError
        try:validate_schema(schema[0][0],present,{row[1] for row in connection.execute('PRAGMA table_info(study_editions)')},{row[1] for row in connection.execute('PRAGMA table_info(study_holds)')},allow_upgrade=True,admin_columns={table:{row[1] for row in connection.execute(f'PRAGMA table_info({table})')} for table in ADMIN_COLUMNS},
            notebook_columns={table:{row[1] for row in connection.execute(f'PRAGMA table_info({table})')} for table in NOTEBOOK_COLUMNS},
            approval_columns={table:{row[1] for row in connection.execute(f'PRAGMA table_info({table})')} for table in APPROVAL_COLUMNS},
            exam_columns={table:{row[1] for row in connection.execute(f'PRAGMA table_info({table})')} for table in EXAM_COLUMNS})
        except StudyError:raise ValueError('database_integrity_schema') from None
        return connection
    except BaseException:
        connection.close();raise


def backup_data(source,destination):
    source,destination=Path(source),Path(destination)
    if destination.exists():raise ValueError('destination_exists')
    if not (source/'study.sqlite').is_file():raise ValueError('source_missing')
    if not check_data(source)['ok']:raise ValueError('backup_database_integrity_failure')
    resume_erasures(source)
    os.umask(0o077)
    store=StudyStore(source/'study.sqlite')
    destination.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix='.study-backup-',dir=destination.parent))
    try:
        with data_lock(store.path):
            ledger=source/'erasure-ledger.json'
            if not ledger.exists():_write_ledger(ledger,[])
            store.backup(stage/'study.sqlite')
            copy=StudyStore(stage/'study.sqlite')
            try:
                with copy.transaction() as c:
                    c.execute('DELETE FROM study_sessions');c.execute('DELETE FROM study_invitations')
                (stage/'blobs').mkdir(mode=0o700)
                for row in copy.connection.execute('SELECT blob_ref,sha256 FROM study_assets WHERE deleted=0'):
                    original=_blob_path(source,row['blob_ref'])
                    if digest(original.read_bytes())!=row['sha256']:raise ValueError('backup_blob_integrity_failure')
                    shutil.copyfile(original,_blob_path(stage,row['blob_ref']))
                submissions=copy.connection.execute('SELECT COUNT(*) FROM study_submissions').fetchone()[0]
            finally:copy.close()
            _write_ledger(stage/'erasure-ledger.json',_ledger(ledger))
            result=check_data(stage)
            if not result['ok']:raise ValueError('backup_integrity_failure')
            hashes={str(file.relative_to(stage)):digest(file.read_bytes()) for file in stage.rglob('*') if file.is_file() and file.name!='.study.lock'}
            result|={'submissions':submissions,'rawAccessTokensIncluded':False,'sessionsIncluded':False,'files':hashes,'version':2}
            (stage/'backup-manifest.json').write_text(canonical(result))
            stage.rename(destination)
            return result
    finally:
        store.close()
        if stage.exists():shutil.rmtree(stage)


def _preview(store,actor):
    c=store.connection
    # Check legacy ownership even if no Study principal exists. A missing Study
    # identity must never make a legacy-only identity eligible for erasure.
    if c.execute('SELECT 1 FROM enrollments WHERE student_id=? AND class_id NOT IN (SELECT id FROM study_editions)',(actor,)).fetchone():raise ValueError('legacy_scope_requires_manual_review')
    row=store.connection.execute('SELECT role FROM study_principals WHERE id=?',(actor,)).fetchone()
    if row is None:
        if c.execute('SELECT 1 FROM students WHERE student_id=?',(actor,)).fetchone():raise ValueError('legacy_scope_requires_manual_review')
        return {'resources':0,'submissions':0,'assets':0,'attendanceRecords':0,'manualPaymentRecords':0,'examAttempts':0}
    if row['role']!='student':raise ValueError('student_only')
    return {label:store.connection.execute(f'SELECT COUNT(*) FROM {table} WHERE {column}=?',(actor,)).fetchone()[0] for label,table,column in [('resources','study_resources','owner_id'),('submissions','study_submissions','student_id'),('assets','study_assets','owner_id'),('attendanceRecords','study_attendance_records','student_id'),('manualPaymentRecords','study_manual_payment_records','student_id'),('examAttempts','study_exam_attempts','student_id')]}


def _erase_rows(store,actor):
    c=store.connection
    resources={row[0] for row in c.execute('SELECT id FROM study_resources WHERE owner_id=?',(actor,))}
    submissions={row[0] for row in c.execute('SELECT id FROM study_submissions WHERE student_id=?',(actor,))}
    reviews={row[0] for row in c.execute('SELECT r.id FROM study_reviews r JOIN study_feedback f ON f.id=r.candidate_id JOIN study_submissions s ON s.id=f.submission_id WHERE s.student_id=?',(actor,))}
    receipts=set()
    for table in ('study_attendance_records','study_manual_payment_records'):
        receipts.update(row[0] for row in c.execute(f'SELECT receipt_id FROM {table} WHERE student_id=?',(actor,)))
        c.execute(f'DELETE FROM {table} WHERE student_id=?',(actor,))
    related_ids=resources|submissions|reviews|{actor}
    def references(value,ids):
        if isinstance(value,str):return value in ids
        if isinstance(value,dict):return any(references(item,ids) for item in value.values())
        if isinstance(value,list):return any(references(item,ids) for item in value)
        return False
    for row in c.execute('SELECT id,actor_id,body FROM study_receipts'):
        body=json.loads(row['body'])
        if row['actor_id']==actor or references(body,related_ids):receipts.add(row['id'])
    for row in c.execute('SELECT id,actor_id,resource_id,payload FROM study_events').fetchall():
        if row['actor_id']==actor or row['resource_id'] in resources or references(json.loads(row['payload']),related_ids|receipts):
            c.execute('DELETE FROM study_events WHERE id=?',(row['id'],))
    for receipt in receipts:c.execute('DELETE FROM study_receipts WHERE id=?',(receipt,))
    for review in reviews:
        lesson='study-review-'+review
        for table in ('moments','capsules','cost_ledger','nodes','edges','evidence','segments'):
            c.execute(f'DELETE FROM {table} WHERE lesson_id=?',(lesson,))
        c.execute('DELETE FROM lessons WHERE lesson_id=?',(lesson,))
        c.execute('DELETE FROM sources WHERE source_id=?',('study-source-'+review,))
        for path in c.execute('SELECT path_id,lesson_ids FROM paths WHERE path_id LIKE ?',('study-path-%',)).fetchall():
            c.execute('UPDATE paths SET lesson_ids=? WHERE path_id=?',(canonical([item for item in json.loads(path['lesson_ids']) if item!=lesson]),path['path_id']))
    c.execute('DELETE FROM study_observations WHERE student_id=?',(actor,))
    for submission in submissions:
        c.execute('DELETE FROM study_reviews WHERE candidate_id IN (SELECT id FROM study_feedback WHERE submission_id=?)',(submission,))
        c.execute('DELETE FROM study_feedback WHERE submission_id=?',(submission,))
    c.execute('UPDATE study_submissions SET parent_id=NULL WHERE student_id=?',(actor,))
    c.execute('DELETE FROM study_submissions WHERE student_id=?',(actor,))
    for resource in resources:c.execute('DELETE FROM study_revisions WHERE resource_id=?',(resource,))
    c.execute('DELETE FROM study_resources WHERE owner_id=?',(actor,))
    c.execute('DELETE FROM study_assets WHERE owner_id=?',(actor,))
    c.execute('DELETE FROM study_upload_intents WHERE owner_id=?',(actor,))
    for layout in c.execute('SELECT * FROM study_layouts').fetchall():
        if layout['actor_id']==actor:c.execute('DELETE FROM study_layouts WHERE actor_id=?',(actor,))
        else:
            views=[view for view in json.loads(layout['data']) if view.get('pluginState',{}).get('resourceId') not in resources]
            c.execute('UPDATE study_layouts SET data=? WHERE actor_id=? AND edition_id=?',(canonical(views),layout['actor_id'],layout['edition_id']))
    for table,column in [('study_sessions','actor_id'),('study_invitations','actor_id'),('study_members','student_id'),('study_holds','student_id'),('study_waitlist','student_id'),('enrollments','student_id'),('study_principals','id'),('students','student_id')]:c.execute(f'DELETE FROM {table} WHERE {column}=?',(actor,))
    c.execute('INSERT OR IGNORE INTO study_erased_actors VALUES(?)',(actor,))


def erase_student(source,actor,*,apply=False,initialize=True):
    source=Path(source)
    _validate_blob_directory(source)
    existing=_existing_database(source);existing.close()
    store=StudyStore(source/'study.sqlite',initialize=initialize)
    try:
        with data_lock(store.path):
            _validate_blob_directory(source)
            # Validation before durable intent: never schedule unsupported deletion.
            if not re.fullmatch(r'[A-Za-z0-9_-]{1,128}',actor):raise ValueError('invalid_actor')
            preview=_preview(store,actor)
            if not apply:return preview|{'applied':False}
            ledger=source/'erasure-ledger.json'
            actors=_ledger(ledger) if ledger.exists() else []
            _write_ledger(ledger,actors+[actor])
            # Intent is durable before rows/files change. If interrupted, replay
            # cleans orphan UUID blobs as well as still-present database rows.
            with store.transaction() as c:
                c.execute('PRAGMA secure_delete=ON')
                _erase_rows(store,actor)
            live={row[0] for row in store.connection.execute('SELECT blob_ref FROM study_assets WHERE deleted=0')}
            for path in (source/'blobs').glob('*'):
                if path.name not in live and re.fullmatch(r'[a-f0-9]{32}',path.name):path.unlink()
            store.connection.execute('PRAGMA wal_checkpoint(TRUNCATE)')
            store.connection.execute('VACUUM')
            store.connection.execute('PRAGMA wal_checkpoint(TRUNCATE)')
            return preview|{'applied':True,'scope':'study-student','externalCopiesErased':False}
    finally:store.close()


def _validate_blob_directory(source):
    directory=source/'blobs'
    if directory.is_symlink() or (directory.exists() and not directory.is_dir()):raise ValueError('blob_integrity_path')
    for path in directory.glob('*'):
        if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(directory.resolve()):raise ValueError('blob_integrity_path')


def resume_erasures(source,*,initialize=True):
    source=Path(source);ledger=source/'erasure-ledger.json'
    actors=_ledger(ledger) if ledger.exists() else []
    for actor in actors:erase_student(source,actor,apply=True,initialize=initialize)
    return {'replayed':len(actors)}


def restore_data(backup,destination,current_ledger):
    backup,destination=Path(backup),Path(destination)
    if destination.exists():raise ValueError('destination_exists')
    actors=_ledger(Path(current_ledger)) # required current operator ledger, never optional
    manifest=json.loads((backup/'backup-manifest.json').read_text())
    if manifest.get('version')!=2:raise ValueError('unsupported_backup')
    for ref,expected in manifest['files'].items():
        path=backup/ref
        if Path(ref).is_absolute() or '..' in Path(ref).parts or not path.resolve().is_relative_to(backup.resolve()) or path.is_symlink() or not path.is_file() or digest(path.read_bytes())!=expected:raise ValueError('backup_integrity_failure')
    if 'study.sqlite' not in manifest['files']:raise ValueError('backup_integrity_missing_database')
    destination.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix='.study-restore-',dir=destination.parent))
    try:
        for ref in manifest['files']:
            path=stage/ref;path.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(backup/ref,path);os.chmod(path,0o600)
        # Validate recognized v2 metadata before additive bootstrap. Missing
        # canonical tables or v3 Calendar tables remain corruption.
        existing=_existing_database(stage,allow_legacy_catalog=True);existing.close()
        upgraded=StudyStore(stage/'study.sqlite');upgraded.close()
        _write_ledger(stage/'erasure-ledger.json',sorted(set(actors+_ledger(stage/'erasure-ledger.json'))))
        resume_erasures(stage)
        store=StudyStore(stage/'study.sqlite')
        try:
            with store.transaction() as c:c.execute('DELETE FROM study_sessions');c.execute('DELETE FROM study_invitations')
        finally:store.close()
        result=check_data(stage)
        if not result['ok']:raise ValueError('restore_integrity_failure')
        stage.rename(destination)
        return result|{'restored':True,'sessionsRevoked':True,'erasureReplay':len(actors)}
    finally:
        if stage.exists():shutil.rmtree(stage)
