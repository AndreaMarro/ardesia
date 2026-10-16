"""Small harmless archives exercise budgets before any authoritative effect."""
from types import SimpleNamespace
import io
import struct
import zipfile
import zlib

import pytest

from lessonos.ingest import bundle


def limits(monkeypatch, **changes):
    values = dict(max_archive_bytes=100_000, max_directory_bytes=20_000,
                  max_members=20, max_member_bytes=2_000,
                  max_text_bytes=2_000, max_manifest_bytes=2_000,
                  max_total_bytes=10_000, chunk_bytes=16)
    values.update(changes)
    monkeypatch.setattr(bundle, 'DEFAULT_BUNDLE_LIMITS', SimpleNamespace(**values), raising=False)


def archive(tmp_path, payloads):
    path = tmp_path / 'small.lesson'
    with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for name, data in payloads:
            zf.writestr(name, data)
    return str(path)


@pytest.mark.parametrize('name', ['raw/events.jsonl', 'raw/board.excalidraw', 'raw/audio/a.webm'])
def test_legacy_member_budget_applies_to_every_kind(tmp_path, monkeypatch, name):
    limits(monkeypatch, max_member_bytes=32)
    payloads = [('raw/events.jsonl', b'{}'), ('raw/session.yaml', b'audioConsent: true')]
    payloads = [(n, b'x' * 33 if n == name else d) for n, d in payloads]
    if name != 'raw/events.jsonl': payloads.append((name, b'x' * 33))
    with pytest.raises(ValueError, match='budget'):
        bundle.read_bundle(archive(tmp_path, payloads))


@pytest.mark.parametrize('changes,payloads', [
    ({'max_members': 2}, [('raw/events.jsonl', b'{}'), ('raw/a', b''), ('raw/b', b'')]),
    ({'max_total_bytes': 10}, [('raw/events.jsonl', b'123456'), ('raw/board.excalidraw', b'123456')]),
    ({'max_text_bytes': 4}, [('raw/events.jsonl', b'12345')]),
    ({'max_archive_bytes': 20}, [('raw/events.jsonl', b'{}')]),
    ({'max_directory_bytes': 20}, [('raw/events.jsonl', b'{}')]),
])
def test_metadata_budgets_reject_before_opening_payload(tmp_path, monkeypatch, changes, payloads):
    limits(monkeypatch, **changes)
    path = archive(tmp_path, payloads)
    def forbidden(*args, **kwargs):
        pytest.fail('resource metadata was not validated before payload read')
    monkeypatch.setattr(zipfile.ZipFile, 'open', forbidden)
    with pytest.raises(ValueError, match='budget'):
        bundle.read_bundle(path)


def test_actual_bytes_are_limited_and_all_reads_have_a_size(tmp_path, monkeypatch):
    limits(monkeypatch, max_member_bytes=32)
    path = archive(tmp_path, [('raw/events.jsonl', b'{}')])
    class LargerThanMetadata(io.BytesIO):
        def read(self, size=-1):
            assert 0 < size <= 16
            return super().read(size)
    monkeypatch.setattr(zipfile.ZipFile, 'open', lambda *a, **k: LargerThanMetadata(b'x' * 33))
    with pytest.raises(ValueError, match='budget'):
        bundle.read_bundle(path)


def test_rejected_bundle_has_no_store_or_router_effect(tmp_path, monkeypatch):
    limits(monkeypatch, max_member_bytes=4)
    path = archive(tmp_path, [('raw/events.jsonl', b'12345')])
    class NoEffects:
        def __getattr__(self, name):
            pytest.fail(f'rejected bundle reached {name}')
    with pytest.raises(ValueError, match='budget'):
        bundle.ingest_bundle(path, NoEffects(), 'synthetic', router=NoEffects())


def test_legacy_small_archive_still_reads(tmp_path, monkeypatch):
    limits(monkeypatch)
    result = bundle.read_bundle(archive(tmp_path, [('raw/events.jsonl', b'{}')]))
    assert result.events_jsonl == '{}'


def test_actual_total_budget_is_independent_of_member_metadata(tmp_path, monkeypatch):
    limits(monkeypatch, max_total_bytes=10)
    path = archive(tmp_path, [('raw/events.jsonl', b'{}')])
    monkeypatch.setattr(zipfile.ZipFile, 'open', lambda *a, **k: io.BytesIO(b'x' * 11))
    with pytest.raises(ValueError, match='actual byte budget'):
        bundle.read_bundle(path)


def test_directory_entries_also_count_towards_budget(tmp_path, monkeypatch):
    limits(monkeypatch, max_members=2)
    path = archive(tmp_path, [('raw/events.jsonl', b'{}'), ('raw/a/', b''), ('raw/b/', b'')])
    with pytest.raises(ValueError, match='member count budget'):
        bundle.read_bundle(path)


def test_zip_comment_is_accepted(tmp_path, monkeypatch):
    limits(monkeypatch)
    path = archive(tmp_path, [('raw/events.jsonl', b'{}')])
    with zipfile.ZipFile(path, 'a') as zf:
        zf.comment = b'a normal ZIP comment'
    assert bundle.read_bundle(path).events_jsonl == '{}'


def test_ambiguous_zip_comment_is_rejected_explicitly(tmp_path, monkeypatch):
    # Python ZipFile itself rejects an EOCD signature embedded in the comment.
    # Keep this explicit limitation instead of implementing another ZIP parser.
    limits(monkeypatch)
    path = archive(tmp_path, [('raw/events.jsonl', b'{}')])
    with zipfile.ZipFile(path, 'a') as zf:
        zf.comment = b'a comment with PK\x05\x06 inside'
    with pytest.raises(ValueError, match='ZIP malformed'):
        bundle.read_bundle(path)


@pytest.mark.parametrize('field,value', [('max_members', 0), ('max_text_bytes', True), ('chunk_bytes', -1)])
def test_invalid_budget_configuration_is_rejected(field, value):
    from lessonos.ingest.bundle_resources import BundleLimits
    with pytest.raises(ValueError, match='positive integers'):
        BundleLimits(**{field: value})


@pytest.mark.parametrize('cap,value,files', [
    ('MAX_PDF_BYTES', 4, [('raw/documents/a.pdf', b'12345')]),
    ('MAX_PDFS', 1, [('raw/documents/a.pdf', b'1234'), ('raw/documents/b.pdf', b'1234')]),
    ('MAX_TOTAL_PDF_BYTES', 7, [('raw/documents/a.pdf', b'1234'), ('raw/documents/b.pdf', b'1234')]),
])
def test_pdf_quotas_are_checked_before_payload_reads(tmp_path, monkeypatch, cap, value, files):
    from lessonos.ingest import bundle_resources
    limits(monkeypatch)
    path = archive(tmp_path, [('raw/events.jsonl', b'{}'), *files])
    monkeypatch.setattr(bundle_resources, cap, value, raising=False)
    monkeypatch.setattr(zipfile.ZipFile, 'open', lambda *a, **k: pytest.fail('over-quota PDF read'))
    with pytest.raises(ValueError, match='PDF.*budget'):
        bundle.read_bundle(path)


def test_zip64_locator_before_maximum_comment_rejected_before_zip_parser(tmp_path, monkeypatch):
    limits(monkeypatch)
    path = archive(tmp_path, [('raw/events.jsonl', b'{}')])
    with zipfile.ZipFile(path, 'a') as zf:
        zf.comment = b'x' * 65_535
    data = open(path, 'rb').read()
    eocd = data.index(b'PK\x05\x06')
    with open(path, 'wb') as output:
        output.write(data[:eocd] + b'PK\x06\x07' + b'\x00' * 16 + data[eocd:])
    monkeypatch.setattr(zipfile, 'ZipFile', lambda *a, **k: pytest.fail('ZIP64 reached parser'))
    with pytest.raises(ValueError, match='ZIP64'):
        bundle.read_bundle(path)


def test_preflight_uses_the_same_last_end_record_as_zipfile(tmp_path, monkeypatch):
    limits(monkeypatch, max_directory_bytes=100, max_members=2)
    path = tmp_path / 'two-end-records.lesson'
    fake = struct.pack('<4s4H2LH', b'PK\x05\x06', 0, 0, 1, 1, 1, 0, 23)
    with zipfile.ZipFile(path, 'w') as zf:
        zf.writestr('raw/events.jsonl', '{}')
        for i in range(10): zf.writestr(f'raw/unused{i}', '')
        last = zipfile.ZipInfo('raw/last/')
        last.comment = fake
        zf.writestr(last, '')
    path.write_bytes(path.read_bytes() + b'x')
    monkeypatch.setattr(zipfile, 'ZipFile', lambda *a, **k: pytest.fail('preflight used a different end record'))
    with pytest.raises(ValueError, match='ZIP malformed'):
        bundle.read_bundle(path)


@pytest.mark.parametrize('compression', [zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED])
def test_real_zip_cannot_hide_oversize_tail_with_small_file_size(tmp_path, monkeypatch, compression):
    limits(monkeypatch, max_member_bytes=4, max_total_bytes=4)
    path = tmp_path / 'undersized.lesson'
    with zipfile.ZipFile(path, 'w', compression=compression) as zf:
        zf.writestr('raw/events.jsonl', b'{}' + b'x' * 100)
    data = bytearray(path.read_bytes())
    central = data.index(b'PK\x01\x02')
    struct.pack_into('<L', data, central + 16, zlib.crc32(b'{}'))
    struct.pack_into('<L', data, central + 24, 2)
    path.write_bytes(data)
    with pytest.raises(ValueError):
        bundle.read_bundle(path)


@pytest.mark.parametrize('compression', [zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED])
@pytest.mark.parametrize('payload', [b'', b'{}', b'1234'])
def test_real_zip_empty_and_exact_budget_payloads_remain_readable(tmp_path, monkeypatch, compression, payload):
    limits(monkeypatch, max_member_bytes=4, max_total_bytes=4)
    path = tmp_path / 'boundary.lesson'
    with zipfile.ZipFile(path, 'w', compression=compression) as zf:
        zf.writestr('raw/events.jsonl', payload)
    assert bundle.read_bundle(path).events_jsonl.encode() == payload


@pytest.mark.parametrize('compression', [zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED])
def test_real_zip_false_high_size_is_rejected(tmp_path, monkeypatch, compression):
    limits(monkeypatch, max_member_bytes=4)
    path = tmp_path / 'high-size.lesson'
    with zipfile.ZipFile(path, 'w', compression=compression) as zf:
        zf.writestr('raw/events.jsonl', b'{}')
    data = bytearray(path.read_bytes())
    struct.pack_into('<L', data, data.index(b'PK\x01\x02') + 24, 3)
    path.write_bytes(data)
    with pytest.raises(ValueError, match='member size mismatch'):
        bundle.read_bundle(path)


@pytest.mark.parametrize('compression', [zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED])
def test_actual_size_check_does_not_depend_on_crc_difference(tmp_path, monkeypatch, compression):
    limits(monkeypatch, max_member_bytes=16)
    # CRC of four NULs is the standard residue; appending its little-endian
    # CRC keeps that residue. Both prefix and complete payload pass the CRC.
    prefix = b'\x00' * 4
    payload = prefix + struct.pack('<L', zlib.crc32(prefix))
    assert zlib.crc32(payload) == zlib.crc32(prefix)
    path = tmp_path / 'same-crc.lesson'
    with zipfile.ZipFile(path, 'w', compression=compression) as zf:
        zf.writestr('raw/events.jsonl', payload)
    data = bytearray(path.read_bytes())
    struct.pack_into('<L', data, data.index(b'PK\x01\x02') + 24, len(prefix))
    path.write_bytes(data)
    with pytest.raises(ValueError, match='member size mismatch'):
        bundle.read_bundle(path)
