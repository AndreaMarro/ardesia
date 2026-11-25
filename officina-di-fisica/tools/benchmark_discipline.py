"""Benchmark isolated SQLite notebooks against the real pack and increasing amounts of history."""
import argparse
import json
import math
from pathlib import Path
from statistics import median
import tempfile
from time import perf_counter

from server import store
from multidiscipline import study
from multidiscipline import editions as ed


def run(catalog_path, sizes, repetitions):
    records = []
    with tempfile.TemporaryDirectory(prefix="cric-benchmark-") as tmp:
        store.DATA = Path(tmp)
        store.initialize()
        with store.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            start = perf_counter()
            imported = ed.install(db, catalog_path)
            import_ms = (perf_counter() - start)*1000
            user = {"id":"benchmark","role":"lettore"}
            db.execute("INSERT INTO users VALUES('benchmark','benchmark@example.test','!','lettore',0)")
        with store.connect() as db:
            pack = ed.current(db,imported["id"])
            courses = {c["id"] for c in pack["courses"]}
            outlines = [u for c in pack["courses"] for u in c["units"]]
            previous = 0
            for size in sizes:
                values = []
                for i in range(previous,size):
                    u=outlines[i%len(outlines)]
                    values.append((user["id"],str(i),pack["id"],pack["version"],u["id"],u["skillId"],"open","{}",i))
                db.executemany("INSERT INTO discipline_events(user,request_id,discipline,version,unit,skill,kind,request,stamp) VALUES(?,?,?,?,?,?,?,?,?)",values)
                db.commit()
                study.notebook(db,user,pack,courses,1000000)
                ticks=[]
                for _ in range(repetitions):
                    start=perf_counter()
                    study.notebook(db,user,pack,courses,1000000)
                    ticks.append((perf_counter()-start)*1000)
                records.append({"events":size,"runs":repetitions,"medianMs":round(median(ticks),2),
                                "p95Ms":round(sorted(ticks)[math.ceil(.95*len(ticks))-1],2)})
                previous=size
    return {"edition":imported["version"],"courses":len(courses),"units":len(outlines),
            "activities":sum(len(u["activityIds"]) for u in outlines),"validationAndImportMs":round(import_ms,2),
            "readPath":"same-process SQLite, warm, simulated open events","notebook":records}


if __name__=="__main__":
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("catalog",type=Path)
    p.add_argument("--events",type=int,nargs="+",default=[0,1000,10000])
    p.add_argument("--repetitions",type=int,default=25)
    a=p.parse_args()
    if sorted(set(a.events))!=a.events or min(a.events)<0 or a.repetitions < 1:
        p.error("Usare dimensioni crescenti non negative e ripetizioni positive.")
    print(json.dumps(run(a.catalog,a.events,a.repetitions), indent=2))
