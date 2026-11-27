"""Find recorded whole-glyph containment to prioritize full PNG reading."""

from collections import Counter
import argparse
import hashlib
from io import BytesIO
import json
from pathlib import Path
import subprocess
from zipfile import ZipFile

from tools.corpus_engineering.c2_41_actual_ui_cb9_review_a import glyph_evidence, point_in_box, project


def checked_archive(folder, commit):
    receipt = json.loads((folder/'receipt.json').read_bytes())
    assert receipt['fullCanonicalTechnicalVerification'] and receipt['activityCredit'] == 0
    joined = BytesIO()
    for part in receipt['parts']:
        location = (folder/part['file']).relative_to(Path.cwd())
        raw = subprocess.check_output(['git', 'cat-file', 'blob', f'{commit}:officina-di-fisica/{location}'])
        assert len(raw) == part['bytes'] and hashlib.sha256(raw).hexdigest() == part['sha256']
        joined.write(raw)
    assert joined.tell() == receipt['upstreamBytes']
    assert hashlib.sha256(joined.getbuffer()).hexdigest() == receipt['upstreamSha256']
    joined.seek(0)
    return joined, receipt


def is_candidate(case, glyph, box):
    # Exclude a direction displayed end-on in the chosen orthographic view.
    start, end = (project(glyph[key],case) for key in ('tail','tip'))
    length = ((end[0]-start[0])**2+(end[1]-start[1])**2)**0.5
    return length > 1.3 and point_in_box(start,box) and point_in_box(end,box)


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('course', choices=['C3','C4','C5','C6'])
    parser.add_argument('--archive-commit', required=True)
    args = parser.parse_args()
    reviews = Path.cwd()/'editorial/reviews'
    folder = reviews/'visibility139-cb9-run45917299096-20261127'/args.course
    archive, receipt = checked_archive(folder, args.archive_commit)
    prefix = f'_temp/experiment-{args.course}/evidence/'
    results, counts = {}, Counter()
    native = 0
    output = reviews/'geometry-candidates-45917299096-20261127'/args.course
    output.mkdir(parents=True,exist_ok=True)
    with ZipFile(archive) as source:
        report = json.loads(source.read(prefix+'report.json'))
        for item in report['cases']:
            raw = source.read(prefix+item['file'])
            assert hashlib.sha256(raw).hexdigest() == item['sha256']
            case = json.loads(raw)
            if not case.get('interaction') or case['profile']['fallback'] or case['profile']['width'] != 320:
                continue
            native += 1
            for label in case['labels']:
                for glyph in case['nativeGlyphs']:
                    if not is_candidate(case,glyph,label['box']):
                        continue
                    witness = glyph_evidence(case,glyph['elementIndex'],label['text'])
                    if not witness['allVerticesInside']:
                        continue
                    key = (case['id'],label['text'],case['profile']['view'])
                    counts[key] += 1
                    if key not in results or witness['projectedAxisLengthPixels'] > results[key]['geometry']['projectedAxisLengthPixels']:
                        results[key] = {'id':case['id'],'label':label['text'],'view':case['profile']['view'],
                                        'caseKey':case['caseKey'],'geometry':witness,'png':case['screenshots'][0]}
        for key, witness in results.items():
            image = witness['png']
            raw = source.read(prefix+image['file'])
            assert hashlib.sha256(raw).hexdigest() == image['sha256']
            (output/(image['sha256']+'.png')).write_bytes(raw)
            witness['matchingCases'] = counts[key]
    result = {'course':args.course,'sourceArtifactSha256':receipt['upstreamSha256'],'native320States':native,
              'recordedFullContainmentCandidates':list(results.values()),'distinctCandidateIds':len({key[0] for key in results}),
              'scope':'Recorded orthographic CPU geometry only. A separate reading of each full PNG is required to judge actual visibility.',
              'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    (output/'screen.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    print(args.course,native,'native states;',len(results),'candidate label and view pairs')


if __name__ == '__main__':
    main()
