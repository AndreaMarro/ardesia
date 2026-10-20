"""UTC projection of four canonical explicit-offset sessions, not a scheduler."""
from copy import deepcopy
import pytest
from lessonos.study.models import StudyError
from lessonos.study.calendar_time import normalize_sessions, display_sessions, render_ics


def dates():
    return [{'start':f'2026-{month:02}-{day:02}T18:00:00{offset}','end':f'2026-{month:02}-{day:02}T19:30:00{offset}'}
        for month,day,offset in [(10,20,'+02:00'),(10,27,'+01:00'),(11,3,'+01:00'),(11,10,'+01:00')]]


def test_rome_and_new_york_dst_have_different_transition_dates_and_tokyo_crosses_midnight():
    original=dates();before=deepcopy(original)
    normalized=normalize_sessions('edition',original,'Europe/Rome')
    assert [item['startUtc'][11:16] for item in normalized]==['16:00','17:00','17:00','17:00']
    ny=display_sessions(normalized,'America/New_York')
    assert [item['startLocal'][11:] for item in ny]==['12:00:00-04:00','13:00:00-04:00','12:00:00-05:00','12:00:00-05:00']
    tokyo=display_sessions(normalized,'Asia/Tokyo')
    assert tokyo[0]['startLocal']=='2026-10-21T01:00:00+09:00'
    assert original==before


@pytest.mark.parametrize('zone',[None,'','Not/A_Zone','/etc/passwd'])
def test_invalid_or_missing_iana_zone_is_explicit_error(zone):
    with pytest.raises(StudyError,match='invalid_calendar_timezone'):normalize_sessions('edition',dates(),zone)


@pytest.mark.parametrize('start,end',[
    ('2026-03-29T02:30:00+01:00','2026-03-29T04:00:00+02:00'),
    ('2026-10-25T02:30:00','2026-10-25T04:00:00'),
    ('2026-10-20T18:00:00+01:00','2026-10-20T19:30:00+01:00'),
])
def test_nonexistent_ambiguous_without_offset_and_wrong_zone_offset_fail(start,end):
    sessions=dates();sessions[0]={'start':start,'end':end}
    with pytest.raises(StudyError,match='invalid_calendar'):normalize_sessions('edition',sessions,'Europe/Rome')


def test_ambiguous_wall_time_with_explicit_offset_selects_an_instant():
    sessions=dates();sessions[0]={'start':'2026-10-25T02:30:00+02:00','end':'2026-10-25T03:00:00+01:00'}
    result=normalize_sessions('edition',sessions,'Europe/Rome')
    assert result[0]['startUtc']=='2026-10-25T00:30:00Z' and result[0]['endUtc']=='2026-10-25T02:00:00Z'


def test_ics_crlf_utc_stable_uid_folding_utf8_and_no_attendees():
    sessions=normalize_sessions('edition',dates(),'Europe/Rome')
    plan={'sessions':sessions,'title':'Lezione à\\;comma,\n'+('è'*90),'stampUtc':'2026-10-01T10:00:00Z','sequence':1,'status':'TENTATIVE','timezone':'Europe/Rome'}
    first=render_ics(plan)
    assert first==render_ics(plan) and first.count(b'BEGIN:VEVENT\r\n')==4
    assert b'ATTENDEE' not in first and b'VTIMEZONE' not in first
    assert b'DTSTART:20261020T160000Z' in first and b'STATUS:TENTATIVE' in first
    assert b'SEQUENCE:1' in first and b'DTSTAMP:20261001T100000Z' in first
    assert first.replace(b'\r\n',b'').find(b'\n')==-1
    assert all(len(line)<=75 for line in first.split(b'\r\n'))
    assert all(line.decode('utf-8') is not None for line in first.split(b'\r\n'))
    moved=deepcopy(plan);moved['sessions'][0]['startUtc']='2026-10-20T17:00:00Z'
    second=render_ics(moved)
    assert first!=second
    assert [line for line in first.split(b'\r\n') if line.startswith(b'UID:')]==[line for line in second.split(b'\r\n') if line.startswith(b'UID:')]
    unfolded=first.replace(b'\r\n ',b'').decode()
    assert 'Lezione à\\\\\\;comma\\,\\n' in unfolded
