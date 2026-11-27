"""Reproduce all independently reviewed reader groups on the staging runtime."""

import json
from pathlib import Path

from tools.corpus_engineering import readers_renewal_cb9_verifier as reviewer
from tools.corpus_engineering.pipeline import canonical, digest, git_bytes, load_checkpoint, sha


def main():
    app = Path.cwd()
    _, inventory, _ = load_checkpoint(app/'editorial/corpus')
    by_id = {row['id']: row for row in inventory}
    registry = json.loads((app/'editorial/batches/registry.json').read_bytes())
    specs = {row['id']: row for row in registry['activityBatches']}
    files, output, seen = {}, [], set()
    for path in sorted((reviewer.BASE/'group-reports').glob('*.json')):
        raw_report = path.read_bytes()
        report = json.loads(raw_report)
        group = report['batch'].removesuffix('-renewal-cb9')
        spec = specs[group]
        sources = {}
        for key in spec['activityIds']:
            source = by_id[key]
            data = source['provenance']
            file = (data['commit'],data['path'])
            if file not in files:
                raw = git_bytes(app.parent,*file)
                assert sha(raw) == data['fileSha256']
                files[file] = {row['id']:row for row in json.loads(raw)}
            sources[key] = files[file][key]
            assert digest(sources[key]) == source['sourceSha256']
        package_id = spec.get('revisionPackage')
        if package_id:
            folder = app/'editorial/batches'
            assets = json.loads((folder/(package_id+'.json')).read_bytes())
            bindings = json.loads((folder/(package_id+'-bindings.json')).read_bytes())
            fresh = reviewer.report(sources,assets,bindings,app=app)
        else:
            fresh = reviewer.report(sources,app=app)
        assert fresh == report and all(row['ok'] is True for row in fresh['records']), group
        assert path.read_bytes() == raw_report
        ids = sorted(sources)
        assert seen.isdisjoint(ids)
        seen.update(ids)
        output.append({'id':group,'recordIds':ids,'reportSha256':sha(raw_report)})
        print(group,len(ids),'actual fresh matches',flush=True)
    assert len(output) == 33 and len(seen) == 189
    receipt = {'runtimeSha256':reviewer.RUNTIME,'groups':output,'positiveGroups':33,'uniqueIds':189,
               'acceptedCurrentRecords':sum(len(group['recordIds']) for group in output),
               'newRegisteredActivityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    (app/'editorial/reviews/readers-33-current-root-replay-20261127.json').write_text(canonical(receipt)+'\n')


if __name__ == '__main__':
    main()
