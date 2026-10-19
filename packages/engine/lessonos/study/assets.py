"""Private original assets. Validation does not imply OCR or ASR success."""
from io import BytesIO
import json
import os
from pathlib import Path
import subprocess
import tempfile
import warnings
from .models import StudyError
from .store import identifier,digest

LIMITS={'image/png':10,'image/jpeg':10,'image/webp':10,'application/pdf':20,'audio/mpeg':20,'audio/mp4':20,'audio/webm':20}


def validate_asset(data,mime):
    if mime not in LIMITS:raise StudyError('unsupported_media',415)
    if not data or len(data)>LIMITS[mime]*1024*1024:raise StudyError('asset_too_large_or_empty',413)
    try:
        if mime.startswith('image/'):
            from PIL import Image
            with warnings.catch_warnings():
                warnings.simplefilter('error',Image.DecompressionBombWarning)
                with Image.open(BytesIO(data)) as image:
                    if Image.MIME.get(image.format)!=mime or image.width*image.height>16_000_000:raise ValueError()
                    image.verify()
                with Image.open(BytesIO(data)) as image:image.load()
            return '', 'manual_review'
        if mime=='application/pdf':
            from pypdf import PdfReader
            if not data.startswith(b'%PDF-'):raise ValueError()
            reader=PdfReader(BytesIO(data),strict=True)
            if reader.is_encrypted or not 1<=len(reader.pages)<=20:raise ValueError()
            text='\n'.join(page.extract_text() or '' for page in reader.pages)
            if len(text)>200_000:raise ValueError()
            return text,'native_text' if text.strip() else 'needs_clarification'
        valid_header=(mime=='audio/mpeg' and (data.startswith(b'ID3') or data[:2] in (b'\xff\xfb',b'\xff\xf3',b'\xff\xf2'))) or (mime=='audio/mp4' and data[4:8]==b'ftyp') or (mime=='audio/webm' and data.startswith(b'\x1a\x45\xdf\xa3'))
        if not valid_header:raise ValueError()
        with tempfile.NamedTemporaryFile() as temporary:
            temporary.write(data);temporary.flush()
            result=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type','-of','json','-i',temporary.name],capture_output=True,timeout=5,check=True)
            probe=json.loads(result.stdout)
            duration=float(probe['format']['duration'])
            if not 0<duration<=180 or not probe.get('streams') or any(s['codec_type']!='audio' for s in probe['streams']):raise ValueError()
        return '', 'asr_not_run'
    except FileNotFoundError as error:
        raise StudyError('media_validator_unavailable',503) from error
    except (ValueError,KeyError,TypeError,OSError,subprocess.SubprocessError) as error:
        raise StudyError('malformed_media',415) from error
    except Exception as error:
        # Decoder-specific parser errors are deliberately not exposed to users.
        raise StudyError('malformed_media',415) from error


def upload_asset(store,principal,edition_id,data,mime,blob_dir:Path):
    store._edition_access(principal,edition_id)
    text,status=validate_asset(data,mime)
    asset_id=identifier();blob_dir.mkdir(parents=True,exist_ok=True,mode=0o700)
    path=blob_dir/asset_id
    try:
        with path.open('xb') as output:
            os.chmod(path,0o600);output.write(data);output.flush();os.fsync(output.fileno())
        with store.transaction() as c:
            c.execute('INSERT INTO study_assets(id,edition_id,owner_id,mime,bytes,sha256,blob_ref,native_text,extraction_status) VALUES(?,?,?,?,?,?,?,?,?)', (asset_id,edition_id,principal.id,mime,len(data),digest(data),asset_id,text,status))
    except BaseException:
        path.unlink(missing_ok=True)
        raise
    return {'id':asset_id,'mime':mime,'bytes':len(data),'sha256':digest(data),'nativeText':text,'extractionStatus':status,'private':True}


def read_asset(store,principal,asset_id,blob_dir:Path):
    row=store.connection.execute('SELECT * FROM study_assets WHERE id=? AND deleted=0',(asset_id,)).fetchone()
    if row is None:raise StudyError('not_found',404)
    edition=store._edition_access(principal,row['edition_id'])
    if row['owner_id']!=principal.id and edition['teacherId']!=principal.id:raise StudyError('forbidden',403)
    path=blob_dir/row['blob_ref']
    data=path.read_bytes()
    if digest(data)!=row['sha256']:raise StudyError('asset_integrity_failure',503)
    return data,row['mime']
