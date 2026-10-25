import pytest
from lessonos.study.four_courses import course_projection
from lessonos.study.catalog import describe_pack

PATHS=('strumenti-meccanica','fluidi-termodinamica','elettricita-magnetismo','onde-ottica-radiazioni')


def test_frozen_denominator_and_no_false_complete_courses():
    projection=course_projection()
    assert sum(c['requiredObjectives'] for c in projection['courses'])==200
    assert [c['pathId'] for c in projection['courses']]==list(PATHS)
    assert [c['requiredObjectives'] for c in projection['courses']]==[52,57,33,58]
    for course in projection['courses']:
        assert course['status']=='INCOMPLETE' and course['completedObjectives']==0
        assert course['editorialStatus']=='DRAFT' and course['humanApproval'] is False
        assert len(course['lessons'])>=1
        assert 'fullReviewOnly' not in course['lessons'][0]
        d=describe_pack(course['packId'],1)
        assert d['courseId']==course['pathId']


def test_public_projection_never_includes_general_drafts_or_bank():
    public=course_projection()
    assert public['releaseScope']=='PUBLIC_DEMONSTRATION'
    assert public['bankIncluded'] is False
    assert all(l['releaseScope']=='PUBLIC_DEMONSTRATION' for c in public['courses'] for l in c['lessons'])
    review=course_projection(review=True)
    assert review['releaseScope']=='PRIVATE_EDITORIAL_REVIEW'


@pytest.mark.parametrize('path',PATHS)
def test_every_public_lesson_has_core_oracle_and_versioned_provenance(path):
    c=next(c for c in course_projection()['courses'] if c['pathId']==path)
    l=c['lessons'][0]
    assert l['lessonRef']['sha256'] and l['lessonRef']['version']==1
    assert l['workedExample']['steps'] and l['explanation'] and l['transcript']
    assert l['practice']['parameters']!=l['transfer']['parameters']
    assert l['practice']['result']['value']==pytest.approx(l['practice']['answer']['value'],rel=1e-10)
    assert l['transfer']['result']['value']==pytest.approx(l['transfer']['answer']['value'],rel=1e-10)
