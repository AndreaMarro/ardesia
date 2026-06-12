#!/usr/bin/env python3
"""Ultimo gradino della review ladder: kimi-k2.6 (stesso brain di HERMES-2 =
correlazione parziale ACCETTATA come fallback — meglio di self-review).
Uso: printf "%s" "$prompt" | review-kimi.py   (prompt su stdin, review su stdout)"""
import json
import re
import sys
import urllib.error
import urllib.request

cfg = open(__import__("os").path.expanduser("~/.hermes/config.yaml"), encoding="utf-8").read()
m = re.search(r"api_key:\s*(\S+)", cfg)
if not m:
    print("review-kimi: api_key non trovata in ~/.hermes/config.yaml", file=sys.stderr)
    sys.exit(2)
key = m.group(1).strip("\"'")

prompt = sys.stdin.read()
if not prompt.strip():
    print("review-kimi: prompt vuoto", file=sys.stderr)
    sys.exit(2)

# kimi-k2.6 e' un reasoning model: max_tokens piccolo = budget bruciato nel thinking.
req = urllib.request.Request(
    "https://api.moonshot.ai/v1/chat/completions",
    data=json.dumps({
        "model": "kimi-k2.6",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 8192,
            }).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
)
try:
    with urllib.request.urlopen(req, timeout=340) as r:
        body = json.load(r)
except urllib.error.HTTPError as e:
    print(f"review-kimi: HTTP {e.code}: {e.read()[:300]}", file=sys.stderr)
    sys.exit(2)
msg = body["choices"][0]["message"]
out = (msg.get("content") or "").strip()
if not out:
    print("review-kimi: risposta vuota (thinking ha bruciato il budget?)", file=sys.stderr)
    sys.exit(2)
print(out)
