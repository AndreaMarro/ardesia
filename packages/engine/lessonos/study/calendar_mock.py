"""Deterministic in-process test double. No Google API, OAuth or invitations."""
from copy import deepcopy
import threading
from .models import StudyError
from .calendar_port import SyncGone


class MockCalendar:
    provider_id='mock'
    def __init__(self):
        self._lock=threading.RLock();self.events={};self.revisions={};self.expired=set()
        self.lose_next_ack=False;self.reads=0

    def upsert(self,scope,event_id,body,expected_etag=None):
        with self._lock:
            events=self.events.setdefault(scope,{})
            previous=events.get(event_id)
            if previous and previous['body']==body:return deepcopy(previous)
            if previous and previous['etag']!=expected_etag or not previous and expected_etag is not None:
                raise StudyError('calendar_external_conflict',409)
            revision=self.revisions.get(scope,0)+1;self.revisions[scope]=revision
            result={'id':event_id,'etag':str(revision),'body':deepcopy(body)}
            events[event_id]=result
            if self.lose_next_ack:
                self.lose_next_ack=False
                raise TimeoutError('mock applied event; acknowledgement lost')
            return deepcopy(result)

    def snapshot(self,scope,cursor=None):
        with self._lock:
            self.reads+=1
            if (scope,cursor) in self.expired:
                self.expired.remove((scope,cursor));raise SyncGone()
            # Full bounded state each time is the mock contract. This does not
            # claim Google incremental pagination or watch compatibility.
            return deepcopy(list(self.events.get(scope,{}).values())),str(self.revisions.get(scope,0))

    def external_change(self,scope,event_id,**changes):
        with self._lock:
            item=self.events[scope][event_id]
            item['body'].update(deepcopy(changes))
            revision=self.revisions.get(scope,0)+1;self.revisions[scope]=revision;item['etag']=str(revision)

    def expire_cursor(self,scope,cursor):
        with self._lock:self.expired.add((scope,cursor))
