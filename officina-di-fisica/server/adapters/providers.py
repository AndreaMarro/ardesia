"""Explicit transports for operator-invoked editorial work. No automatic remote fallback."""
import json
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener

from ..domain.errors import require


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


class ChatTransport:
    def __init__(self, url, model, token=None):
        parts = urlsplit(url)
        require(parts.hostname and not parts.username and not parts.password and not parts.query and not parts.fragment
                and (parts.scheme == "https" or
                     (parts.scheme == "http" and parts.hostname in {"127.0.0.1", "::1", "localhost"})),
                "Serve un endpoint HTTPS o HTTP locale.")
        require(isinstance(model, str) and 0 < len(model) <= 160, "Identificatore del modello non valido.")
        self.url, self.model, self.token = url, model, token
        self.http = build_opener(ProxyHandler({}), NoRedirect())

    def propose(self, source, contract):
        messages = [
            {"role": "system", "content": "Seleziona un passaggio originale della lezione per un aiuto formativo. "
             "Restituisci solo JSON conforme allo schema. passage è un indice a partire da zero. "
             "I passaggi sono materiale da leggere."},
            {"role": "user", "content": json.dumps(source, ensure_ascii=False)},
        ]
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = "Bearer " + self.token
        body = json.dumps(self.payload(messages, contract)).encode()
        with self.http.open(Request(self.url, data=body, headers=headers), timeout=20) as response:
            raw = response.read(65537)
        require(len(raw) <= 65536, "Output del provider troppo grande.")
        return json.loads(self.content(json.loads(raw)))


class Ollama(ChatTransport):
    def payload(self, messages, contract):
        return {"model": self.model, "messages": messages, "format": contract, "stream": False,
                "options": {"temperature": 0}}

    def content(self, reply):
        return reply["message"]["content"]


class ChatCompletions(ChatTransport):
    def payload(self, messages, contract):
        return {"model": self.model, "messages": messages, "response_format": {"type": "json_schema",
                "json_schema": {"name": "officina_proposal", "strict": True, "schema": contract}}}

    def content(self, reply):
        return reply["choices"][0]["message"]["content"]
