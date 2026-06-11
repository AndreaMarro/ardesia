#!/usr/bin/env python3
# Misura la qualita delle citazioni nei riepiloghi: conteggio, % excerpt corti
# (<20 char = coriandoli), lunghezza media, marcature (inferito).
# Uso: python3 measure-citations.py <file.md> [<file.md> ...]
import re
import sys

for path in sys.argv[1:]:
    try:
        txt = open(path, encoding="utf-8").read()
    except OSError as e:
        print(f"{path}: ERRORE {e}")
        continue
    cits = re.findall(r"\[([^\]]+)\]\(\w+#s\d+\)", txt)
    short = [c for c in cits if len(c) < 20]
    mid = [c for c in cits if 20 <= len(c) < 40]
    avg = sum(len(c) for c in cits) // max(1, len(cits))
    inf = txt.count("(inferito)")
    name = path.rsplit("/", 2)[-2] + "/" + path.rsplit("/", 1)[-1]
    pct = 100 * len(short) // max(1, len(cits))
    print(f"{name}: {len(cits)} cit | <20: {len(short)} ({pct}%) | "
          f"20-39: {len(mid)} | >=40: {len(cits)-len(short)-len(mid)} | "
          f"avg {avg} char | (inferito): {inf}")
