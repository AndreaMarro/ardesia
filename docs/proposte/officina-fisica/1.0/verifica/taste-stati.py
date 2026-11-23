"""Esegue l'inspector ufficiale sui DOM raggiunti dai gesti del collaudo comparativo."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("lavoro", type=Path)
parser.add_argument("skill", type=Path, help="Directory skills/taste-skill del tag v2.1.5")
args = parser.parse_args()
work, skill = args.lavoro.resolve(), args.skill.resolve()
evidence = json.loads((work / "misure.json").read_text())
revision = subprocess.check_output(["git", "-C", skill, "rev-parse", "HEAD"], text=True).strip()
if revision != "12af471f627f866411b4bd785b19646d3672784c":
    raise SystemExit("Per ripetere i rilievi usare il commit di Taste Skill indicato nel dossier.")
jobs = [(state, concept) for state, _ in evidence["states"] for concept in evidence["concepts"]]

def inspect(pair):
    state, concept = pair
    name = f"{state}-{concept}"
    target = work / "taste" / name
    target.mkdir(parents=True, exist_ok=True)
    cmd = ["node", str(skill / "scripts/inspect.mjs"), str(work / "stati" / (name + ".html")),
           "--app", "--widths", "1440,390", "--out", str(target)]
    with (target / "console.log").open("w") as log:
        process = subprocess.run(cmd, stdout=log, stderr=subprocess.STDOUT)
    report = json.loads((target / "report.json").read_text())
    sizes = [[v["width"], v["height"]] for v in report["viewports"]]
    if sizes != [[1440, 900], [390, 844]] or report["allow"]:
        raise ValueError(f"Profilo di misura inatteso per {name}")
    if process.returncode and not any(f["level"] == "FAIL" for f in report["findings"]):
        raise RuntimeError(f"Errore di esecuzione in {target / 'console.log'}")
    return {"state": state, "concept": concept, "sizes": sizes, "allow": report["allow"],
            "exit": process.returncode, "findings": report["findings"]}

with ThreadPoolExecutor(max_workers=2) as pool:
    runs = list(pool.map(inspect, jobs))
result = {"skill": "Taste Skill 2.1.5", "commit": revision, "htmlSHA256": evidence["htmlSHA256"],
          "mode": "--app", "widths": [1440, 390], "runs": runs}
(work / "taste.json").write_text(json.dumps(result, ensure_ascii=False, indent=2)+"\n")
print(f"{len(runs)} stati ispezionati a due risoluzioni. I rilievi sono in taste.json.")
