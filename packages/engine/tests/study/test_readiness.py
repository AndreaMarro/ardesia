
def test_local_checks_never_convert_drafts_or_missing_human_proof_into_launch():
    from lessonos.study.readiness import assess_readiness
    from lessonos.study.coursepack import load_coursepack,review_manifest
    result=assess_readiness(review_manifest(load_coursepack()),{}, {'tests':'PASS','browser':'PASS','restore':'PASS','review':'PASS'})
    assert result['localPrepared'] is True
    assert result['launchAllowed'] is False
    assert 'scientific_review' in result['humanGatesOpen']
    assert result['apiSpendUsd']==0
    # A boolean is not a human evidence record; owner/date/artifact are required.
    spoofed=assess_readiness({'scientificApproval':'APPROVED'}, {'scientific_review':True}, {})
    assert 'scientific_review' in spoofed['humanGatesOpen']
    assert spoofed['localPrepared'] is False and spoofed['launchAllowed'] is False
