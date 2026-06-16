#!/usr/bin/env python3
"""factory-metrics.py — READ-ONLY instrumentation collector per la fabbrica ARDESIA.
Parsa SOLO ciò che il loop GIA' emette → ZERO modifica al driver, zero rischio hot-path.
Fonti: ~/maestro-logs/RESEARCH-{lessonos,studio}.md (per-tick) + ~/<repo>/log.jsonl (per-task) + ~/<repo>/.iters_today.
Emette: ~/maestro-logs/factory-metrics.jsonl (per-tick normalizzato, rigenerato da RES) + report KPI su stdout.
Tutti i path FUORI dai repo → sopravvivono a git reset --hard/clean.
Onesto: costo Claude-builder = SELF-REPORTED in log.jsonl (NON metered); cache-hit% NON disponibile da questi log (serve --output-format json / LiteLLM cutover)."""
import json, re, sys, os, glob, subprocess, collections
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
                "gate_passed": int(gp) if gp.isdigit() else None, "gate_ok": ok == "y",
                "status": status, "dur_s": int(d.group(1)) if d else None,
                "gate_before": int(rg.group(1)) if rg else None, "gate_after": int(rg.group(2)) if rg else None,
                "exit": int(ex.group(1)) if ex else None})
    return recs

def load_tasks():
    by = collections.defaultdict(list)
    for repo in ["lessonos"]:  # log.jsonl repo-side
        p = f"{H}/{repo}/log.jsonl"
        if not os.path.exists(p): continue
        for line in open(p, encoding="utf-8", errors="replace"):
            line = line.strip()
            if not line.startswith("{"): continue
            try: j = json.loads(line)
            except Exception: continue
            ts = j.get("ts", ""); 
            if ts[:10]: by[ts[:10]].append(j)
    return by

def report(recs, tasks, days=5):
    rec_days = sorted({r["day"] for r in recs})[-days:]
    print(f"=== FACTORY-METRICS — ultimi {days} giorni (read-only, da RES tables) ===")
    print(f"{'day':10} {'repo':9} {'tick':>4} {'pass':>4} {'noop':>4} {'REVERT':>6} {'avg_s':>6} {'max_s':>6} {'gate':>16}")
    for day in rec_days:
        for repo in REPOS:
            rr = [r for r in recs if r["day"] == day and r["repo"] == repo]
            if not rr: continue
            npass = sum(1 for r in rr if r["status"] == "pass")
            nnoop = sum(1 for r in rr if "noop" in r["status"])
            nrev = sum(1 for r in rr if r["status"] == "REVERT")
            durs = [r["dur_s"] for r in rr if r["dur_s"]]
            gates = [r["gate_passed"] for r in rr if r["gate_passed"] is not None]
            gate = f"{gates[0]}->{gates[-1]}" if gates else "-"
            print(f"{day:10} {repo:9} {len(rr):>4} {npass:>4} {nnoop:>4} {nrev:>6} "
                  f"{(sum(durs)//len(durs)) if durs else 0:>6} {(max(durs) if durs else 0):>6} {gate:>16}")
    print("\n=== KPI auto-miglioramento (lessonos, da log.jsonl per-task) ===")
    for day in sorted(tasks)[-days:]:
        ts = tasks[day]
        cost = sum(float(t.get("cost_usd", 0) or 0) for t in ts)
        tadd = sum(int(t.get("tests_added", 0) or 0) for t in ts)
        ntask = len(ts)
        print(f"  {day}: task={ntask}  test_add={tadd}  cost_self=${cost:.2f}  $/task=${(cost/ntask if ntask else 0):.3f}")
    # regression-rate globale sui build-tick (pass+REVERT)
    builds = [r for r in recs if r["status"] in ("pass", "REVERT")]
    rev = sum(1 for r in builds if r["status"] == "REVERT")
    print(f"\nregression-rate (REVERT / build-tick) lifetime: {rev}/{len(builds)} = {(100*rev/len(builds) if builds else 0):.1f}%")
    # cap oggi
    for repo in ["lessonos"]:
        cf = f"{H}/{repo}/.iters_today"
        if os.path.exists(cf):
            print(f"cap {repo} .iters_today: {open(cf).read().strip().replace(chr(10),' ')}")
    print("CAVEAT: cost_usd=self-reported builder (NON metered); cache-hit%=N/A (gap: serve --output-format json / LiteLLM cutover).")

def main():
    recs = parse_res()
    with open(OUT, "w", encoding="utf-8") as fh:
        for r in recs: fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"[factory-metrics] scritti {len(recs)} record per-tick -> {OUT}\n")
    report(recs, load_tasks(), days=int(sys.argv[sys.argv.index("--days")+1]) if "--days" in sys.argv else 5)

main()
