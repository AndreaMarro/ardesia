#!/usr/bin/env python3
"""md2jsonl: trascrizione prosa .md -> ASR-style JSONL (schema speech.segment).
Timing sintetico ~2.4 parole/sec. Salta header fino al primo "---" isolato.
Usage: md2jsonl.py <in.md> <out.jsonl>"""
import json, re, sys

src, dst = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8").read()
# corpo = dopo il primo separatore --- su riga propria (header provenienza escluso)
parts = re.split(r"^---\s*$", text, maxsplit=1, flags=re.M)
body = parts[1] if len(parts) == 2 else text
paras = [p.strip() for p in body.split("\n\n") if p.strip() and not p.strip().startswith("#")]
sents = []
for p in paras:
    p = re.sub(r"\s+", " ", p)
    for s in re.split(r"(?<=[.!?…])\s+(?=[A-ZÈÉÀ«\"D])", p):
        s = s.strip()
        if s:
            sents.append(s)
t = 0.0
with open(dst, "w", encoding="utf-8") as f:
    for s in sents:
        dur = max(1.5, len(s.split()) / 2.4)
        f.write(json.dumps({"start": round(t, 2), "end": round(t + dur, 2),
                            "text": s, "confidence": 0.99, "speaker": None},
                           ensure_ascii=False) + "\n")
        t += dur
print(f"{len(sents)} segmenti, {t/60:.1f} min sintetici -> {dst}")
