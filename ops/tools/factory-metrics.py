#!/usr/bin/env python3
"""factory-metrics.py — READ-ONLY instrumentation collector per la fabbrica ARDESIA.
Parsa SOLO ciò che il loop GIA' emette → ZERO modifica al driver, zero rischio hot-path.
Fonti: ~/maestro-logs/RESEARCH-{lessonos,studio}.md (per-tick) + ~/<repo>/log.jsonl (per-task) + ~/<repo>/.iters_today.
Emette: ~/maestro-logs/factory-metrics.jsonl (rigenerato, fuori-repo) + report KPI (default) | digest TG compatto (--digest).
Onesto: cost_usd=SELF-REPORTED in log.jsonl (NON metered); cache-hit%=N/A (serve --output-format json / LiteLLM cutover)."""
import json, re, sys, os, collections
H = os.path.expanduser("~")
REPOS = ["lessonos", "studio"]
RES = {"lessonos": f"{H}/maestro-logs/RESEARCH-lessonos.md", "studio": f"{H}/maestro-logs/RESEARCH-studio.md"}
OUT = f"{H}/maestro-logs/factory-metrics.jsonl"
DUR = re.compile(r"(\d+)s"); REG = re.compile(r"passed (\d+)->(\d+)"); EXIT = re.compile(r"exit=(\d+)")

def parse_res():
    recs = []
    for repo, path in RES.items():
        if not os.path.exists(path): continue
        for line in open(path, encoding="utf-8", errors="replace"):
            if not line.startswith("| "): continue
            f = [x.strip() for x in line.strip().strip("|").split("|")]
            if len(f) < 7: continue
            ts, it, h, gp, ok, status, note = f[:7]
            if not re.match(r"\d{4}-\d\d-\d\dT", ts): continue
            d = DUR.search(note); rg = REG.search(note); ex = EXIT.search(note)
            recs.append({"repo": repo, "ts": ts, "day": ts[:10], "iter": it, "hash": h,
                "gate_passed": int(gp) if gp.isdigit() else None, "gate_ok": ok == "y", "status": status,
                "dur_s": int(d.group(1)) if d else None,
                "gate_before": int(rg.group(1)) if rg else None, "gate_after": int(rg.group(2)) if rg else None,
                "exit": int(ex.group(1)) if ex else None})
    return recs

def load_tasks():
    by = collections.defaultdict(list)
    p = f"{H}/lessonos/log.jsonl"
    if os.path.exists(p):
        for line in open(p, encoding="utf-8", errors="replace"):
            line = line.strip()
            if not line.startswith("{"): continue
            try: j = json.loads(line)
            except Exception: continue
            if j.get("ts", "")[:10]: by[j["ts"][:10]].append(j)
    return by

def report(recs, tasks, days=5):
    rec_days = sorted({r["day"] for r in recs})[-days:]
    print(f"=== FACTORY-METRICS — ultimi {days} giorni (read-only) ===")
    print(f"{'day':10} {'repo':9} {'tick':>4} {'pass':>4} {'noop':>4} {'REV':>4} {'avg_s':>6} {'max_s':>6} {'gate':>16}")
    for day in rec_days:
        for repo in REPOS:
            rr = [r for r in recs if r["day"] == day and r["repo"] == repo]
            if not rr: continue
            np_ = sum(1 for r in rr if r["status"] == "pass"); nn = sum(1 for r in rr if "noop" in r["status"]); nr = sum(1 for r in rr if r["status"] == "REVERT")
            durs = [r["dur_s"] for r in rr if r["dur_s"]]; gates = [r["gate_passed"] for r in rr if r["gate_passed"] is not None]
            gate = f"{gates[0]}->{gates[-1]}" if gates else "-"
            print(f"{day:10} {repo:9} {len(rr):>4} {np_:>4} {nn:>4} {nr:>4} {(sum(durs)//len(durs)) if durs else 0:>6} {(max(durs) if durs else 0):>6} {gate:>16}")
    builds = [r for r in recs if r["status"] in ("pass", "REVERT")]; rev = sum(1 for r in builds if r["status"] == "REVERT")
    print(f"\nregression-rate lifetime: {rev}/{len(builds)} = {(100*rev/len(builds) if builds else 0):.1f}%")
    print("CAVEAT: cost_usd=self-reported (NON metered); cache-hit%=N/A.")

def litellm_spend():
    import subprocess
    sh = f"{H}/litellm/spend-report.sh"
    if not os.path.exists(sh): return None
    try:
        out = subprocess.run(["bash", sh], capture_output=True, text=True, timeout=20).stdout
    except Exception:
        return None
    lines = out.splitlines()
    for i, l in enumerate(lines):
        if "month-to-date" in l and i + 1 < len(lines):
            return lines[i + 1].strip()
    return None


def digest(recs, tasks):
    days = sorted({r["day"] for r in recs}); today = days[-1] if days else "?"
    lines = [f"Fabbrica digest {today}"]; stall = True
    for repo in REPOS:
        rr = [r for r in recs if r["day"] == today and r["repo"] == repo]
        if not rr: continue
        p = sum(1 for r in rr if r["status"] == "pass"); n = sum(1 for r in rr if "noop" in r["status"]); rv = sum(1 for r in rr if r["status"] == "REVERT")
        g = [r["gate_passed"] for r in rr if r["gate_passed"] is not None]
        if p > 0: stall = False
        lines.append(f"{repo}: tick{len(rr)} pass{p} noop{n} REV{rv} gate {g[0] if g else '-'}->{g[-1] if g else '-'}")
    if stall:
        zero = 0
        for d in reversed(days):
            if sum(1 for r in recs if r["day"] == d and r["status"] == "pass") == 0: zero += 1
            else: break
        lines.append(f"ALLERTA: 0 build-pass oggi (giorno {zero} di stallo) — coda/pin vuoti?")
    builds = [r for r in recs if r["status"] in ("pass", "REVERT")]; rev = sum(1 for r in builds if r["status"] == "REVERT")
    lines.append(f"regression-rate {rev}/{len(builds)}={(100*rev/len(builds) if builds else 0):.1f}%")
    tt = tasks.get(today, []); cost = sum(float(t.get("cost_usd", 0) or 0) for t in tt)
    lines.append(f"task oggi(log.jsonl)={len(tt)} cost_self=${cost:.2f} (self-reported)")
    sp = litellm_spend()
    if sp is not None:
        lines.append(f"LiteLLM cheap MTD: ${sp} | opus-direct NON metered (gap mossa-2)")
    return "\n".join(lines)

def main():
    recs = parse_res()
    with open(OUT, "w", encoding="utf-8") as fh:
        for r in recs: fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    tasks = load_tasks()
    if "--digest" in sys.argv: print(digest(recs, tasks))
    else:
        print(f"[factory-metrics] {len(recs)} record -> {OUT}\n")
        report(recs, tasks, days=int(sys.argv[sys.argv.index("--days")+1]) if "--days" in sys.argv else 5)

main()
