"""SQLite implementation of the study port, scoped to the request transaction."""
import json
from .. import store
from .exam_policies import bundled, exam_policy


class SQLiteStudy:
    def __init__(self, connection):
        self.db = connection

    def now(self):
        return store.NOW()

    def entitled(self, user, rows, course):
        return store.entitled(self.db, user, rows, course)

    def published(self):
        return store.published(self.db)

    def record(self, key, version):
        return store.record(self.db, key, version)

    def attempts(self, uid):
        return self.db.execute("SELECT * FROM attempts WHERE user=? ORDER BY stamp,rowid", (uid,))

    def diary_attempts(self, uid):
        return self.db.execute("""
            SELECT a.rowid AS seq, a.run, a.idx, a.id, a.v, a.skill, a.family,
                   a.correct, a.aided, a.stamp, r.course AS run_course, r.mode
            FROM attempts a JOIN runs r ON r.id=a.run AND r.user=a.user
            WHERE a.user=? AND (r.mode NOT IN ('exam','mid','final','diagnosis') OR r.finished IS NOT NULL)
            ORDER BY a.stamp,a.rowid
        """, (uid,))

    def exposures(self, uid):
        return {(r[0], r[1]) for r in self.db.execute("SELECT id,v FROM exposed WHERE user=?", (uid,))}

    def seen(self, uid):
        return {r[0] for r in self.db.execute("SELECT DISTINCT id FROM attempts WHERE user=?", (uid,))}

    def previous_run(self, uid, signature):
        row = self.db.execute("SELECT id FROM runs WHERE user=? AND signature=?", (uid, signature)).fetchone()
        return row[0] if row else None

    def exam_policy(self, rows, key):
        course = next((r for r in rows if r["kind"] == "course" and r["id"] == key), None)
        return exam_policy(course) if course else None

    def run_policy(self, rid, course):
        row = self.db.execute("SELECT policy FROM run_policies WHERE run=?", (rid,)).fetchone()
        return json.loads(row[0]) if row else bundled().get(course)

    def create_run(self, rid, uid, course, mode, stamp, deadline, items, signature, policy):
        self.db.execute("INSERT INTO runs VALUES(?,?,?,?,?,?,?,?,?)",
                        (rid, uid, course, mode, stamp, deadline, None, store.encode(items), signature))

        if policy:
            self.db.execute("INSERT INTO run_policies VALUES(?,?)", (rid, store.encode(policy)))

    def expose(self, uid, key, version):
        return self.db.execute("INSERT OR IGNORE INTO exposed VALUES(?,?,?)", (uid, key, version)).rowcount == 0

    def add_attempt(self, rid, index, uid, question, correct, aided, stamp):
        self.db.execute("INSERT OR IGNORE INTO attempts VALUES(?,?,?,?,?,?,?,?,?,?)",
                        (rid, index, uid, question["id"], question["version"], question["skill"],
                         question["family"], int(correct), int(aided), stamp))

    def run(self, rid, uid):
        return self.db.execute("SELECT * FROM runs WHERE id=? AND user=?", (rid, uid)).fetchone()

    def save_run(self, rid, items, finished):
        self.db.execute("UPDATE runs SET items=?,finished=? WHERE id=?", (store.encode(items), finished, rid))

    def recovery_attempt(self, uid, skill):
        return self.db.execute("SELECT id,v FROM attempts WHERE user=? AND skill=? AND aided=0 "
                               "ORDER BY correct ASC,stamp DESC,rowid DESC LIMIT 1", (uid, skill)).fetchone()

    def observations(self, uid):
        return [{"lab": r["lab"], "stamp": r["stamp"], **json.loads(r["observation"])}
                for r in self.db.execute("SELECT lab,stamp,observation FROM lab_events WHERE user=? "
                                         "ORDER BY stamp DESC,seq DESC LIMIT 8", (uid,))]

    def reads(self, uid):
        return [dict(r) for r in self.db.execute("SELECT id,v,stamp FROM reads WHERE user=? ORDER BY stamp DESC", (uid,))]

    def recent_runs(self, uid):
        return [dict(r) for r in self.db.execute("SELECT id,course,mode,start,deadline,finished FROM runs WHERE user=? "
                                                 "ORDER BY start DESC,rowid DESC LIMIT 40", (uid,))]

    def observation_count(self, uid):
        return self.db.execute("SELECT count(*) FROM lab_events WHERE user=?", (uid,)).fetchone()[0]

    def historical_runs(self, uid):
        return self.db.execute("SELECT course,mode,finished,items FROM runs WHERE user=?", (uid,))
