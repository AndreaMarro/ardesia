from .. import store


class SQLiteOrders:
    def __init__(self, db):
        self.db = db

    def config(self):
        return store.config(self.db)

    def courses(self):
        return store.published(self.db)

    def set_config(self, settings):
        self.db.execute("UPDATE settings SET value=? WHERE key='commerce'", (store.encode(settings),))

    def entitled(self, user, rows, course):
        return store.entitled(self.db, user, rows, course)

    def course_title(self, course):
        return store.record(self.db, course)["title"]

    def existing(self, user, course, offer, mode):
        return self.db.execute("SELECT * FROM orders WHERE user=? AND course=? AND offer=? AND mode=? "
                               "AND state IN ('in attesa','confermato') ORDER BY stamp DESC",
                               (user, course, offer, mode)).fetchone()

    def get(self, key):
        return self.db.execute("SELECT * FROM orders WHERE id=?", (key,)).fetchone()

    def create(self, key, uid, course, offer, mode, cents, snapshot):
        self.db.execute("INSERT INTO orders VALUES(?,?,?,?,?,?,?,?,?,?)",
                        (key, uid, course, offer, mode, cents, store.encode(snapshot), "in attesa", None, store.NOW()))

    def cancel(self, key):
        self.db.execute("UPDATE orders SET state='annullato' WHERE id=?", (key,))

    def receive(self, key, received):
        self.db.execute("UPDATE orders SET received=? WHERE id=?", (received, key))

    def confirm(self, key, received):
        self.db.execute("UPDATE orders SET state='confermato',received=? WHERE id=?", (received, key))

    def grant(self, uid, course, mode):
        self.db.execute("INSERT OR IGNORE INTO access VALUES(?,?,?)", (uid, course, mode))

    def audit(self, actor, event, target, detail=""):
        store.audit(self.db, actor, event, target, detail)
