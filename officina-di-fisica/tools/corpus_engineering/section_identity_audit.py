"""Pure section-only identity guard and read-only correction planner.

This module neither assembles candidates nor imports drafts, refreshes science
signatures, changes registries or grants scientific/publication approval.
A canonical integration bridge must separately rerun the historical verifier
against its exact historical package and bindings before using this guard.
"""
import hashlib
import json
import re


def _encoded(value):
    try:
        return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
    except (TypeError,ValueError) as error:
        raise ValueError('Invalid exact JSON payload') from error


def _digest(value):
    return hashlib.sha256(_encoded(value)).hexdigest()


def _validated(package,bindings,originals,source_ref):
    if not isinstance(source_ref,str) or not re.fullmatch('[a-f0-9]{40}',source_ref):
        raise ValueError('Immutable full source commit required')
    if type(package)is not dict or package.get('schema')!='astra/1':
        raise ValueError('Expected astra/1 package')
    rows=package.get('records')
    if type(rows)is not list or not 1<=len(rows)<=100 or any(type(row)is not dict for row in rows):
        raise ValueError('Complete bounded question records required')
    if type(bindings)is not list or any(type(binding)is not dict for binding in bindings):
        raise ValueError('Complete source bindings required')
    _encoded(package);_encoded(bindings)
    ids=[row.get('id')for row in rows]
    if any(not isinstance(key,str)or not key for key in ids)or len(set(ids))!=len(ids):
        raise ValueError('Missing or duplicate candidate IDs')
    if [binding.get('id')for binding in bindings]!=ids:
        raise ValueError('Binding identity or order differs from the package')
    for row,binding in zip(rows,bindings):
        key=row['id'];original=originals.get(key);provenance=binding.get('provenance')
        if (type(original)is not dict or original.get('id')!=key or original.get('kind')!='question'
                or type(original.get('version'))is not int or original['version']<1):
            raise ValueError('Pinned original question missing: '+key)
        if (binding.get('sourceId')!=key or binding.get('sourceRef')!=source_ref
                or binding.get('sourceSha256')!=_digest(original)
                or binding.get('candidateSha256')!=_digest(row)):
            raise ValueError('Candidate or immutable source binding mismatch: '+key)
        if (type(provenance)is not dict or provenance.get('sourceRef')!=source_ref
                or provenance.get('sourceId')!=key or provenance.get('sourceOrigin')!='cric'
                or provenance.get('sourceVersion')!=original['version']
                or type(provenance.get('sourceVersion'))is not int
                or binding.get('provenanceSha256')!=_digest(provenance)):
            raise ValueError('Pinned source provenance mismatch: '+key)
        if (type(row.get('baseVersion'))is not int or row['baseVersion']!=original['version']
                or type(row.get('version'))is not int or row['version']!=original['version']+1):
            raise ValueError('Individual draft version or baseVersion mismatch: '+key)
    return rows


def assert_section_only(before_package,before_bindings,after_package,after_bindings,originals,*,source_ref):
    """Recompute all identities; exclude exactly the top-level record section."""
    before=_validated(before_package,before_bindings,originals,source_ref)
    after=_validated(after_package,after_bindings,originals,source_ref)
    ids=[row['id']for row in before]
    if [row['id']for row in after]!=ids:
        raise ValueError('Candidate identity or order changed')
    if _encoded({k:v for k,v in before_package.items()if k!='records'})!=_encoded({k:v for k,v in after_package.items()if k!='records'}):
        raise ValueError('Package envelope or asset bytes changed')
    records=[];changed=[];unchanged=[]
    for old,new,old_binding,new_binding in zip(before,after,before_bindings,after_bindings):
        key=old['id'];section=originals[key].get('section')
        if not isinstance(section,str)or not section.strip()or new.get('section')!=section:
            raise ValueError('New section differs from the pinned original: '+key)
        old_rest={k:v for k,v in old.items()if k!='section'}
        new_rest={k:v for k,v in new.items()if k!='section'}
        if _encoded(old_rest)!=_encoded(new_rest):
            raise ValueError('A non-section candidate field changed: '+key)
        if _encoded({k:v for k,v in old_binding.items()if k!='candidateSha256'})!=_encoded({k:v for k,v in new_binding.items()if k!='candidateSha256'}):
            raise ValueError('A non-candidate-checksum binding field changed: '+key)
        (changed if old.get('section')!=section else unchanged).append(key)
        records.append({'id':key,'oldCandidateSha256':_digest(old),'newCandidateSha256':_digest(new),
                        'nonSectionPayloadSha256':_digest(old_rest),'sourceSha256':old_binding['sourceSha256'],
                        'oldSection':old.get('section'),'newSection':section})
    return {'schemaVersion':'1.0.0','kind':'section-only-identity-check','sourceRef':source_ref,
            'checkedIds':ids,'changedIds':changed,'unchangedIds':unchanged,'records':records,
            'scientificApproval':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE'}


def plan_section_corrections(audit,packages,bindings,originals):
    """Group existing C1–C5 packages; emit metadata only, with no repartition."""
    rows=audit.get('rows');source_ref=audit.get('sourceRef')
    if type(rows)is not list:raise ValueError('Versioned audit rows required')
    groups={};seen=set();selected=0
    for row in rows:
        if type(row)is not dict:raise ValueError('Invalid audit row')
        key=row.get('id')
        if not isinstance(key,str):raise ValueError('Audit question ID required')
        if key.split('-')[0]not in {'C1','C2','C3','C4','C5'}:continue
        if type(row.get('registered'))is not bool:raise ValueError('Typed registered flag required')
        if not row['registered']:continue
        batch=row.get('batch')
        if not isinstance(batch,str)or not re.fullmatch('[a-z][a-z0-9-]{0,63}',batch):
            raise ValueError('Unsafe batch identity')
        if key in seen:raise ValueError('Duplicate audit question identity')
        seen.add(key);selected+=1;groups.setdefault(batch,[]).append(row)
    planned=[]
    for batch,edits in sorted(groups.items()):
        raw=packages.get(batch);binding_raw=bindings.get(batch)
        if type(raw)is not bytes or type(binding_raw)is not bytes:raise ValueError('Missing immutable package or bindings: '+batch)
        raw_sha=hashlib.sha256(raw).hexdigest()
        if any(edit.get('packageFileSha256')!=raw_sha for edit in edits):raise ValueError('Stale audited package: '+batch)
        try:package=json.loads(raw);links=json.loads(binding_raw)
        except (ValueError,UnicodeDecodeError) as error:raise ValueError('Malformed package or binding JSON') from error
        candidates=_validated(package,links,originals,source_ref);by_id={r['id']:r for r in candidates}
        actual_deltas={r['id']for r in candidates if r.get('section')!=originals[r['id']].get('section')}
        if actual_deltas!={edit['id']for edit in edits}:raise ValueError('Audit does not cover every actual section delta: '+batch)
        changes=[]
        for edit in edits:
            key=edit['id'];old=by_id[key];wanted=originals[key].get('section')
            if (not isinstance(wanted,str)or not wanted.strip()or edit.get('sourceSection')!=wanted
                    or edit.get('draftSection')!=old.get('section')or wanted==old.get('section')):
                raise ValueError('Audit section differs from actual candidate or pinned source: '+key)
            changes.append({'id':key,'oldSection':old['section'],'newSection':wanted,
                            'oldCandidateSha256':_digest(old),
                            'nonSectionPayloadSha256':_digest({k:v for k,v in old.items()if k!='section'})})
        planned.append({'batch':batch,'packagePath':'editorial/batches/'+batch+'.json',
                        'bindingPath':'editorial/batches/'+batch+'-bindings.json',
                        'oldPackageFileSha256':raw_sha,'oldBindingsFileSha256':hashlib.sha256(binding_raw).hexdigest(),
                        'changes':changes})
    return {'schemaVersion':'1.0.0','sourceRef':source_ref,'questionCount':selected,'packageCount':len(planned),
            'packages':planned,'excludedRows':len(rows)-selected,'writesPerformed':0,
            'scientificApproval':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE'}
