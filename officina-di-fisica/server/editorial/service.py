"""Read-only editorial workspace. No learner database, network, shell or publishing port."""
import re
import unicodedata
from collections import Counter
from copy import deepcopy
from typing import Protocol

from ..domain.errors import require


def words(text):
    ascii_text = "".join(c for c in unicodedata.normalize("NFKD", text.casefold()) if not unicodedata.combining(c))
    return set(re.findall(r"[a-z0-9]{3,}", ascii_text)) - {"che", "con", "una", "del", "della", "per", "nel", "dei"}


class ProposalProvider(Protocol):
    def propose(self, source: dict, contract: dict) -> dict: ...


class EditorialWorkspace:
    def __init__(self, records, courses, aliases, permissions):
        require(courses and set(permissions) <= {"search", "read", "propose"}, "Ambito editoriale non valido.")
        self.permissions = frozenset(permissions)
        self.rows = {r["id"]: r for r in records if r["course"] in courses and r["kind"] == "lesson"}
        self.aliases = [(words(c), [words(p) for p in phrases]) for c, phrases in aliases.items()]
        self.tokens = {}
        self.concepts = {}
        for key, row in self.rows.items():
            self.tokens[key] = words(row["title"] + " " + " ".join(row.get("coverage", [])))
            passage_words = words(" ".join(b["text"] for b in row["blocks"] if b["type"] == "text"))
            self.concepts[key] = self._concepts(self.tokens[key] | passage_words)

    def _concepts(self, tokens):
        return {tuple(sorted(concept)) for concept, phrases in self.aliases
                if concept <= tokens or any(phrase and phrase <= tokens for phrase in phrases)}

    def allow(self, permission):
        require(permission in self.permissions, "Capacità editoriale non concessa.", 403)

    def search(self, query, limit=5):
        self.allow("search")
        require(isinstance(query, str) and 0 < len(query.strip()) <= 240 and type(limit) is int and 1 <= limit <= 10,
                "Ricerca editoriale non valida.")
        q = words(query)
        concepts = self._concepts(q)
        scores = Counter({key: len(q & tokens) + 5 * len(concepts & self.concepts[key])
                          for key, tokens in self.tokens.items()})
        matches = [key for key, score in scores.items() if score > 0]
        for key in matches:
            for p in self.rows[key].get("prerequisites", ()):
                if p in self.rows and not scores[p]:
                    scores[p] = .25
        return [{"id": key, "version": self.rows[key]["version"], "title": self.rows[key]["title"]}
                for key in sorted(scores, key=lambda k: (-scores[k], k))[:limit] if scores[key] > 0]

    def object(self, key):
        require(isinstance(key, str) and key in self.rows, "Oggetto fuori dall’ambito editoriale.", 404)
        row = self.rows[key]
        # Only approved passage choices are visible, never raw files, answer keys, drafts or learner information.
        passages = [b["text"][:1600] for b in row["blocks"] if b["type"] == "text" and b["text"].strip()][:6]
        require(passages, "La lezione non contiene passaggi citabili.")
        return {"id": key, "version": row["version"], "title": row["title"], "passages": passages}

    def read(self, key):
        self.allow("read")
        return self.object(key)

    def validate_proposal(self, proposal, validate):
        self.allow("propose")
        validate(proposal)
        key = proposal["objectId"]
        source = self.object(key)
        require(proposal["version"] == source["version"] and proposal["passage"] < len(source["passages"]),
                "Passaggio inesistente o versione cambiata.", 409)
        return {"status": "da revisionare", "proposal": deepcopy(proposal), "citation": source["passages"][proposal["passage"]]}

    def suggest(self, key, provider, contract, validate):
        self.allow("propose")
        source = self.read(key)
        result = provider.propose(source, contract)
        require(isinstance(result, dict) and result.get("objectId") == key,
                "Il provider ha cambiato l’oggetto richiesto.")
        return self.validate_proposal(result, validate)
