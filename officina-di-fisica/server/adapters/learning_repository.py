from .. import learning
from ..domain.catalog import in_course
from ..domain.errors import require
from ..store import entitled


class SQLiteLearningRepository:
    def __init__(self, db, user, published):
        self.db, self.user, self.published = db, user, published

    def objects(self, course):
        require(entitled(self.db, self.user, self.published, course), "Apri il quaderno del corso.", 403)
        return in_course(self.published, course)

    def observations(self):
        return learning.evidence(self.db, self.user["id"])
