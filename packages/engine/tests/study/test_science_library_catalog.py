import importlib

from lessonos.study.science_library import evaluate


def catalog():
    return importlib.import_module('lessonos.study.science_library.catalog').get_catalog()


def test_catalog_supplies_units_and_bounds_without_answers_or_results():
    result = catalog()
    assert result['schemaVersion'] == 1
    assert len(result['capabilities']) == 4
    assert len({r['id'] for r in result['capabilities']}) == 4
    for item in result['capabilities']:
        assert item['version'] == 1 and item['editorialStatus'] == 'DRAFT'
        assert item['distribution'] == 'BUNDLED_FIRST_PARTY'
        defaults = {p['key']: p['default'] for p in item['parameters']}
        expected = evaluate(item['id'], defaults)
        assert defaults == expected['parameters']
        assert item['primaryOutput']['unit'] == expected['unit']
        assert all(p['label'] and p['unit'] and p['minimum'] <= p['default'] <= p['maximum'] for p in item['parameters'])
        assert not {'result', 'value', 'answer', 'plots', 'observables'} & item.keys()


def test_same_capability_definition_is_referenced_from_two_courses_without_copying_it():
    data = catalog()
    fluid = next(c for c in data['courses'] if c['id'] == 'fluidi-termodinamica')
    mechanics = next(c for c in data['courses'] if c['id'] == 'strumenti-meccanica')
    assert 'bernoulli-v1' in fluid['capabilityIds'] and 'bernoulli-v1' in mechanics['capabilityIds']
    assert sum(c['id'] == 'bernoulli-v1' for c in data['capabilities']) == 1
    # These are definition references, not permission to reuse an edition-scoped Core resource.
    assert data['referenceScope'] == 'capability-definition; Core resource access remains edition-scoped'


def test_catalog_mutation_cannot_change_core_defaults():
    a = catalog()
    a['capabilities'][0]['parameters'][0]['default'] = -999
    b = catalog()
    assert b['capabilities'][0]['parameters'][0]['default'] > 0
