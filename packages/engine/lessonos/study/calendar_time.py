"""Bounded UTC/ICS projection; explicit-offset Core dates remain authoritative."""
from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from .models import StudyError
from .store import digest, canonical


def zone(value):
    if not isinstance(value,str) or not 1<=len(value)<=128:raise StudyError('invalid_calendar_timezone')
    try:return ZoneInfo(value)
    except (ZoneInfoNotFoundError,ValueError):raise StudyError('invalid_calendar_timezone') from None


def utc(value):
    return value.astimezone(timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')


def instant(value,iana=None):
    try:
        if not isinstance(value,str) or not 1<=len(value)<=64:raise ValueError()
        parsed=datetime.fromisoformat(value)
        if parsed.utcoffset() is None or parsed.microsecond:raise ValueError()
        if iana is not None:
            local=parsed.astimezone(iana)
            # Roundtrip rejects DST gaps and an offset inconsistent with the
            # zone. An explicit offset disambiguates a fall-back wall time.
            if local.replace(tzinfo=None)!=parsed.replace(tzinfo=None) or local.utcoffset()!=parsed.utcoffset():raise ValueError()
        return parsed.astimezone(timezone.utc)
    except (ValueError,TypeError,OverflowError):raise StudyError('invalid_calendar') from None


def normalize_sessions(edition_id,sessions,timezone_name):
    iana=zone(timezone_name)
    if not isinstance(sessions,list) or len(sessions)!=4:raise StudyError('four_sessions_required')
    result=[];intervals=[]
    for index,item in enumerate(sessions):
        if not isinstance(item,dict):raise StudyError('invalid_calendar')
        start=instant(item.get('start'),iana);end=instant(item.get('end'),iana)
        if (end-start).total_seconds()!=5400:raise StudyError('invalid_calendar')
        if any(start<old_end and end>old_start for old_start,old_end in intervals):raise StudyError('calendar_conflict',409)
        intervals.append((start,end))
        result.append({'sessionId':digest(canonical({'editionId':edition_id,'slot':index+1}))[:32],
            'ordinal':index+1,'startUtc':utc(start),'endUtc':utc(end)})
    return result


def display_sessions(sessions,timezone_name):
    iana=zone(timezone_name)
    return [{**item,'startLocal':instant(item['startUtc']).astimezone(iana).isoformat(),
        'endLocal':instant(item['endUtc']).astimezone(iana).isoformat(),'displayTimezone':timezone_name} for item in sessions]


def _text(value):
    return value.replace('\\','\\\\').replace('\r\n','\n').replace('\r','\n').replace('\n','\\n').replace(';','\\;').replace(',','\\,')


def _fold(line):
    parts=[];current='';size=0
    for character in line:
        width=len(character.encode('utf-8'))
        if size+width>75:
            parts.append(current);current=' ';size=1
        current+=character;size+=width
    parts.append(current)
    return '\r\n'.join(parts)


def _ics_time(value):
    return instant(value).strftime('%Y%m%dT%H%M%SZ')


def render_ics(plan):
    lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Ardesia//Study Calendar v1//EN','CALSCALE:GREGORIAN']
    for item in plan['sessions']:
        lines+=['BEGIN:VEVENT','UID:'+item['sessionId']+'@ardesia.invalid',
            'DTSTAMP:'+_ics_time(plan['stampUtc']),'SEQUENCE:'+str(plan['sequence']),
            'DTSTART:'+_ics_time(item['startUtc']),'DTEND:'+_ics_time(item['endUtc']),
            'SUMMARY:'+_text(plan['title']),
            'DESCRIPTION:'+_text('Canonical course timezone: '+plan['timezone']+'. Explicit UTC projection; no invitations.'),
            'STATUS:'+plan['status'],'END:VEVENT']
    lines+=['END:VCALENDAR']
    return ('\r\n'.join(_fold(line) for line in lines)+'\r\n').encode('utf-8')
