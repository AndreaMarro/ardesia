from .. import store


class SQLitePublication:
    def __init__(self, db, validate_record):
        self.db, self.validate_record = db, validate_record

    def published(self):
        return store.published(self.db)

    def draft(self, key, version):
        row = self.db.execute("SELECT draft FROM heads WHERE id=?", (key,)).fetchone()
        store.require(row and row[0] and row[0] == version, "La bozza è cambiata o è assente: " + key, 409)
        return store.record(self.db, key, version)

    def validate(self, record, graph):
        self.validate_record(self.db, record, graph)

    def promote(self, key, version, author):
        self.db.execute("UPDATE heads SET live=?,draft=NULL WHERE id=?", (version, key))
        store.audit(self.db, author, "pubblicazione", key, str(version))
