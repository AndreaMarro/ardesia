"""Versioned editorial composition; no edition, publication or practice authority.

Only content-derived metadata is cached by immutable verified bank identity and
configuration bytes. Callers authorize before entering this projection.
"""
from collections import Counter
from copy import deepcopy
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re

from . import question_bank
from .models import StudyError


def load_pathways_config():
    return json.loads((Path(__file__).parent / 'content/physics-pathways-v1.json').read_text())


@lru_cache(maxsize=4)
def _collections(bank):
    return question_bank._freeze(bank.inventory_collections())


def inventory_collections(bank):
    return deepcopy(_collections(bank))


def _summary(bank, records):
    """Allowlist metadata only; internal question/family IDs never leave here."""
    statuses = dict(sorted(Counter(q['status'] for q in records).items()))
    prerequisites = sorted({label for q in records for label in q['descriptors'].get('prerequisites', ())
                            if isinstance(label, str) and label})
    return {
        'questionCount': len(records), 'familyCount': len({q['familyId'] for q in records}),
        'unitIds': sorted({q['taxonomy']['unitId'] for q in records}),
        'prerequisites': prerequisites,
        'learningObjectives': sorted({q['descriptors']['learningObjective'] for q in records
                                     if q['descriptors'].get('learningObjective')}),
        'microareas': sorted({q['taxonomy']['microarea'] for q in records}),
        'countsByAuthoringStatus': statuses,
        'editorialStatus': next(iter(statuses)) if len(statuses) == 1 else 'MIXED' if statuses else 'UNKNOWN',
        'scientificReview': 'NOT_ATTESTED', 'publicationStatus': 'EDITION_SCOPED', 'creatable': False,
        'gaps': ['Composizione editoriale iniziale: sequenza, prerequisiti e durata da deliberare.',
                 'Copertura dei quesiti osservata; completezza didattica non attestata.',
                 'Revisione e pubblicazione da verificare per edizione, quesito e revisione.']
                + ([] if prerequisites else ['Prerequisiti non documentati nei record selezionati.']),
    }


@lru_cache(maxsize=4)
def _compose(bank, canonical):
    config = json.loads(canonical)
    definitions = config['paths']
    if not isinstance(definitions, list) or not 1 <= len(definitions) <= 20:
        raise ValueError('paths')
    by_unit = {}
    for q in bank._questions:
        by_unit.setdefault(q['taxonomy']['unitId'], []).append(q)
    collections = _collections(bank)
    declared = {c['selection']['miniCourseId']: c for c in collections}
    transversal = config['transversalCollectionIds']
    if (not isinstance(transversal, list) or len(transversal) != len(set(transversal))
            or any(ref not in declared for ref in transversal)):
        raise ValueError('transversal')
    unit_titles = {u['id']: u.get('name', u['id']) for u in bank.manifest.get('taxonomy', ())}
    seen_ids, seen_units, items = set(), set(), []
    for definition in definitions:
        path_id, title, unit_ids = definition['id'], definition['title'], definition['unitIds']
        if (not isinstance(path_id, str) or not re.fullmatch(r'[a-z][a-z0-9-]{0,79}', path_id)
                or path_id in seen_ids or not isinstance(title, str) or not title.strip()
                or not isinstance(unit_ids, list) or not unit_ids
                or any(not isinstance(u, str) or u not in by_unit or u in seen_units for u in unit_ids)
                or len(unit_ids) != len(set(unit_ids))):
            raise ValueError('path identity or unit reference')
        seen_ids.add(path_id)
        seen_units.update(unit_ids)
        units = []
        for unit_id in unit_ids:
            units.append({'id': unit_id, 'title': unit_titles.get(unit_id, unit_id),
                          'collectionIds': [c['id'] for c in collections
                                            if tuple(c['unitIds']) == (unit_id,)
                                            and c['selection']['miniCourseId'] not in transversal],
                          **_summary(bank, by_unit[unit_id])})
        # Each bank record has exactly one canonical taxonomy unit. Disjoint
        # units therefore partition record identities, while families use a set.
        records = [q for u in unit_ids for q in by_unit[u]]
        items.append({'id': path_id, 'title': title, 'units': units, **_summary(bank, records)})
    if seen_units != set(by_unit):
        raise ValueError('incomplete unit coverage')
    return question_bank._freeze({
        'id': config['id'], 'version': config['version'],
        'sha256': hashlib.sha256(canonical.encode()).hexdigest(), 'bankRef': config['bankRef'],
        'items': items, 'coverage': _summary(bank, bank._questions),
        'transversalCollectionIds': [declared[ref]['id'] for ref in transversal],
        'provenance': {'kind': 'bundled-bank-snapshot', 'scientificValidation': 'NOT_ATTESTED',
                       'sources': [{k: s[k] for k in ('title', 'url', 'scope') if k in s}
                                   for s in bank.manifest.get('sources', ())]},
    })


def build_pathways(config=None):
    try:
        config = load_pathways_config() if config is None else config
        if (not isinstance(config['id'], str) or not config['id']
                or type(config['version']) is not int or config['version'] < 1):
            raise ValueError('composition identity')
        ref = config['bankRef']
        bank = question_bank.load_bank(ref['bankId'])
        if (type(ref['bankVersion']) is not int or ref['bankVersion'] != bank.manifest['version']
                or ref['bankSha256'] != bank.sha256):
            raise ValueError('bank pin')
        canonical = json.dumps(config, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)
        return deepcopy(_compose(bank, canonical))
    except (OSError, ValueError, KeyError, TypeError):
        raise StudyError('curriculum_pathways_unavailable', 409) from None
