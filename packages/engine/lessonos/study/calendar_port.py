"""Small infrastructure port; implementing it does not configure Google/OAuth."""
from typing import Protocol,runtime_checkable


class SyncGone(Exception):
    """Only this target's external checkpoint requires full reconciliation."""


@runtime_checkable
class CalendarPort(Protocol):
    provider_id:str
    def upsert(self,scope:str,event_id:str,body:dict,expected_etag:str|None=None)->dict:...
    def snapshot(self,scope:str,cursor:str|None=None)->tuple[list[dict],str]:...
