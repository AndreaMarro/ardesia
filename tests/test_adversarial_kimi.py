# Test per il fix kimi-k2.6 in adversarial.py.
# FALLISCE col codice vecchio (temperature=1, niente thinking, fallback su reasoning_content)
# e PASSA col fix. Niente rete: monkeypatcha urlopen. Python 3.9.6 + pytest, solo stdlib.
import json
import io
import os
import urllib.request

ADV = os.path.expanduser("~/lessonos/bin/adversarial.py")


class _FakeResp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        self.close()


def _load_kimi(glb):
    # Estrae la funzione _kimi dal sorgente del fix.
    src = open(ADV).read()
    start = src.index("def _kimi(")
    end = src.index("\n\ntry:", start)
    exec(src[start:end], glb)
    return glb["_kimi"]


def test_thinking_disabled_and_temp_06(monkeypatch):
    captured = {}

    def fake_urlopen(req, timeout=None):
        captured["payload"] = json.loads(req.data.decode())
        body = {"choices": [{"finish_reason": "stop",
                             "message": {"content": "REGGE\nUnica debolezza: timeout fisso a 360s.",
                                         "reasoning_content": ""}}]}
        return _FakeResp(json.dumps(body).encode())

    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)
    kimi = _load_kimi({"urllib": urllib, "json": json, "key": "FAKE_KEY"})

    content, reasoning, finish = kimi([{"role": "user", "content": "x"}], max_tokens=16000)

    p = captured["payload"]
    assert p["thinking"] == {"type": "disabled"}, "il fix DEVE disabilitare il thinking"
    assert p["temperature"] == 0.6, "non-thinking richiede temperature 0.6 (1 -> HTTP 400)"
    assert p["max_tokens"] >= 16000, "budget almeno 16000 per non troncare (doc Moonshot)"
    assert content.startswith("REGGE")
    assert finish == "stop"


def test_empty_content_triggers_synthesis_not_raw_reasoning(monkeypatch):
    calls = []

    def fake_urlopen(req, timeout=None):
        calls.append(json.loads(req.data.decode()))
        if len(calls) == 1:
            body = {"choices": [{"finish_reason": "length",
                                 "message": {"content": "",
                                             "reasoning_content": "Forse il timeout... probabilmente il diff... "
                                                                  "controlliamo la riga 50 dove..."}}]}
        else:
            body = {"choices": [{"finish_reason": "stop",
                                 "message": {"content": "2 problemi, di cui 1 CRITICO\n"
                                                        "CRITICO: bin/x.py:50 perdita dati su rename.",
                                             "reasoning_content": ""}}]}
        return _FakeResp(json.dumps(body).encode())

    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)
    kimi = _load_kimi({"urllib": urllib, "json": json, "key": "FAKE_KEY"})

    text, reasoning, finish = kimi([{"role": "user", "content": "prompt"}], max_tokens=16000)
    if not text and reasoning:
        text, _r, _f = kimi([{"role": "user", "content": "sintesi:\n" + reasoning}], max_tokens=4000)
        text = text.strip()

    assert len(calls) == 2, "content vuoto DEVE innescare il 2o passo di sintesi"
    assert text.startswith("2 problemi"), "verdetto strutturato, non reasoning grezzo"
    assert "probabilmente il diff" not in text, "il reasoning grezzo NON deve finire nel report"
    assert "CRITICO:" in text
