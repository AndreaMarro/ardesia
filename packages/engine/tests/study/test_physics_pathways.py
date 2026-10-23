import json
import pytest
from lessonos.study import curriculum_inventory, question_bank
from lessonos.study.models import StudyError


def test_four_pathways_cover_real_records_once_and_preserve_pins():
    bank = question_bank.load_bank()
    result = curriculum_inventory.build_pathways()
    assert [p['questionCount'] for p in result['items']] == [1088, 1472, 800, 640]
    assert result['coverage']['questionCount'] == 4000
    assert result['coverage']['familyCount'] == 250
    assert result['coverage']['unitIds'] == [f'U{i}' for i in range(1, 8)]
    assert result['bankRef']['bankSha256'] == bank.sha256
    assert sum(p['questionCount'] for p in result['items']) == 4000
    assert all(not p['creatable'] and p['editorialStatus'] == 'DRAFT' for p in result['items'])
    assert len(result['transversalCollectionIds']) == 1
    assert all(len(u['collectionIds']) == 1 for p in result['items'] for u in p['units'])
    for forbidden in ('"answer":', '"solution":', 'correctOptionId', 'solutionSteps', 'authoringFormula'):
        assert forbidden not in json.dumps(result)
    again = curriculum_inventory.build_pathways()
    result['items'][0]['units'].clear()
    assert len(again['items'][0]['units']) == 2


def test_three_blocks_use_same_contract_without_corpus_changes():
    config = curriculum_inventory.load_pathways_config()
    before = question_bank.load_bank().sha256
    config['version'] += 1
    config['paths'][2]['unitIds'] += config['paths'].pop()['unitIds']
    result = curriculum_inventory.build_pathways(config)
    assert len(result['items']) == 3
    assert [p['questionCount'] for p in result['items']] == [1088, 1472, 1440]
    assert result['coverage']['questionCount'] == 4000
    assert result['bankRef']['bankSha256'] == before


@pytest.mark.parametrize('mutation', ['bank', 'version', 'digest', 'unit', 'duplicate', 'missing', 'id', 'transversal'])
def test_invalid_or_obsolete_configuration_never_selects_fallback(mutation):
    config = curriculum_inventory.load_pathways_config()
    if mutation == 'bank': config['bankRef']['bankId'] = 'missing'
    elif mutation == 'version': config['bankRef']['bankVersion'] = 999
    elif mutation == 'digest': config['bankRef']['bankSha256'] = '0' * 64
    elif mutation == 'unit': config['paths'][0]['unitIds'][0] = 'U99'
    elif mutation == 'duplicate': config['paths'][1]['unitIds'].append('U1')
    elif mutation == 'missing': config['paths'].pop()
    elif mutation == 'id': config['paths'][1]['id'] = config['paths'][0]['id']
    elif mutation == 'transversal': config['transversalCollectionIds'] = ['unknown']
    with pytest.raises(StudyError, match='curriculum_pathways_unavailable'):
        curriculum_inventory.build_pathways(config)


def test_warm_inventory_does_not_rescan_records(monkeypatch):
    bank = question_bank.load_bank()
    curriculum_inventory.build_pathways()
    monkeypatch.setattr(type(bank), 'inventory_collections', lambda _: (_ for _ in ()).throw(AssertionError('rescan')))
    result = curriculum_inventory.build_pathways()
    assert result['coverage']['questionCount'] == 4000
