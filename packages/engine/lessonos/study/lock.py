"""Cooperative DB/blob barrier, shared by writers and snapshots on this host."""
from contextlib import contextmanager
from pathlib import Path
import fcntl,os,threading,time

_guard=threading.Lock()
_locks={}
_local=threading.local()


@contextmanager
def data_lock(db_path):
    key=str(Path(db_path).resolve())
    with _guard:lock=_locks.setdefault(key,threading.RLock())
    if not lock.acquire(timeout=5):raise TimeoutError('study_data_busy')
    depths=getattr(_local,'depths',{});_local.depths=depths
    nested=depths.get(key,0);depths[key]=nested+1
    handle=None
    try:
        if not nested:
            lock_path=Path(key).parent/'.study.lock'
            lock_path.parent.mkdir(parents=True,exist_ok=True)
            handle=os.open(lock_path,os.O_CREAT|os.O_RDWR,0o600)
            deadline=time.monotonic()+5
            while True:
                try:fcntl.flock(handle,fcntl.LOCK_EX|fcntl.LOCK_NB);break
                except BlockingIOError:
                    if time.monotonic()>=deadline:raise TimeoutError('study_data_busy')
                    time.sleep(.01)
        yield
    finally:
        depths[key]-=1
        if handle is not None:
            fcntl.flock(handle,fcntl.LOCK_UN);os.close(handle)
        lock.release()
