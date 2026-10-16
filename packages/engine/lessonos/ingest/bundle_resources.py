"""Bounded ZIP reads shared by legacy and manifest lesson bundles.

Only the four requested text members are retained. Every payload is counted
and hashed in chunks, including opaque board, audio and PDF artifacts.
"""
from dataclasses import dataclass
import hashlib
import struct
import zipfile

from lessonos.ingest.bundle_extensions import MAX_PDF_BYTES, MAX_PDFS, MAX_TOTAL_PDF_BYTES


@dataclass(frozen=True)
class BundleLimits:
    max_archive_bytes: int = 256 * 1024 * 1024
    max_directory_bytes: int = 2 * 1024 * 1024
    max_members: int = 1024
    max_member_bytes: int = 64 * 1024 * 1024
    max_text_bytes: int = 16 * 1024 * 1024
    max_manifest_bytes: int = 1024 * 1024
    max_total_bytes: int = 256 * 1024 * 1024
    chunk_bytes: int = 64 * 1024

    def __post_init__(self):
        if any(type(value) is not int or value <= 0 for value in vars(self).values()):
            raise ValueError('bundle resource budgets must be positive integers')


DEFAULT_BUNDLE_LIMITS = BundleLimits()


@dataclass(frozen=True)
class Payload:
    size: int
    sha256: str
    prefix: bytes
    data: bytes | None


def _check_directory(archive, limits):
    """Bound archive and central directory BEFORE ZipFile allocates entries.

    Studio emits single-disk ZIP. ZIP64 and split archives are refused;
    none is needed under the fixed byte/member budgets. Read at most the
    ordinary EOCD + maximum ZIP comment to find the directory declaration.
    """
    archive.seek(0, 2)
    size = archive.tell()
    if size > limits.max_archive_bytes:
        raise ValueError('bundle archive byte budget exceeded')
    archive.seek(max(0, size - 65_557))
    tail = archive.read(65_557)
    end = len(tail)
    while True:
        pos = tail.rfind(b'PK\x05\x06', 0, end)
        if pos < 0:
            raise ValueError('bundle ZIP end record missing or malformed')
        if pos + 22 <= len(tail):
            record = struct.unpack_from('<4s4H2LH', tail, pos)
            if pos + 22 + record[-1] == len(tail):
                break
        end = pos
    _, disk, directory_disk, disk_count, count, directory_size, offset, _ = record
    eocd_offset = size - len(tail) + pos
    archive.seek(max(0, eocd_offset - 20))
    has_zip64_locator = eocd_offset >= 20 and archive.read(4) == b'PK\x06\x07'
    if (disk or directory_disk or disk_count != count or
        count == 0xffff or directory_size == 0xffffffff or offset == 0xffffffff or
        has_zip64_locator):
        raise ValueError('bundle split/ZIP64 archives are unsupported')
    if count > limits.max_members:
        raise ValueError('bundle member count budget exceeded')
    if directory_size > limits.max_directory_bytes:
        raise ValueError('bundle central directory byte budget exceeded')
    if offset + directory_size > eocd_offset:
        raise ValueError('bundle central directory is outside ZIP payload')
    archive.seek(0)


def read_payloads(zip_path, safe_member, text_members, limits):
    """Preflight all metadata, then read each file exactly once, bounded."""
    try:
        with open(zip_path, 'rb') as archive:
            _check_directory(archive, limits)
            with zipfile.ZipFile(archive) as zf:
                infos = zf.infolist()
                if len(infos) > limits.max_members:
                    raise ValueError('bundle member count budget exceeded')
                files = {}
                total, pdf_count, pdf_total = 0, 0, 0
                for info in infos:
                    if info.is_dir():
                        if info.file_size:
                            raise ValueError('bundle directory carries payload')
                        continue
                    name = info.filename
                    if name in files:
                        raise ValueError(f'duplicate bundle member: {name!r}')
                    if not safe_member(name):
                        raise ValueError(f'unsafe bundle member (ZipSlip/out-of-scope): {name!r}')
                    if info.flag_bits & 1 or info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED):
                        raise ValueError('bundle encrypted or unsupported compression')
                    cap = limits.max_member_bytes
                    if name in text_members:
                        cap = min(cap, limits.max_text_bytes)
                    if name == 'manifest.json':
                        cap = min(cap, limits.max_manifest_bytes)
                    if name.endswith('.pdf'):
                        cap = min(cap, MAX_PDF_BYTES)
                        pdf_count += 1
                        pdf_total += info.file_size
                        if (info.file_size > MAX_PDF_BYTES or pdf_count > MAX_PDFS or
                            pdf_total > MAX_TOTAL_PDF_BYTES):
                            raise ValueError('bundle PDF byte/count budget exceeded')
                    total += info.file_size
                    if info.file_size > cap or total > limits.max_total_bytes:
                        raise ValueError(f'bundle payload byte budget exceeded ({name})')
                    files[name] = (info, cap)
                result, actual_total = {}, 0
                for name, (info, cap) in files.items():
                    size, digest, prefix = 0, hashlib.sha256(), b''
                    retained = bytearray() if name in text_members else None
                    with zf.open(info) as member:
                        while True:
                            chunk = member.read(min(limits.chunk_bytes, cap - size + 1,
                                                    limits.max_total_bytes - actual_total + 1))
                            if not chunk:
                                break
                            size += len(chunk)
                            actual_total += len(chunk)
                            if size > cap or actual_total > limits.max_total_bytes:
                                raise ValueError(f'bundle actual byte budget exceeded ({name})')
                            digest.update(chunk)
                            if len(prefix) < 1024:
                                prefix += chunk[:1024 - len(prefix)]
                            if retained is not None:
                                retained.extend(chunk)
                    if size != info.file_size:
                        raise ValueError(f'bundle ZIP member size mismatch ({name})')
                    result[name] = Payload(size, digest.hexdigest(), prefix,
                                           bytes(retained) if retained is not None else None)
                return result
    except (zipfile.BadZipFile, UnicodeDecodeError) as exc:
        raise ValueError(f'bundle ZIP malformed: {exc}') from exc
