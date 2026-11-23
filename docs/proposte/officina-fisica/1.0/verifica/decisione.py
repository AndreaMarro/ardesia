"""Ricalcola i punteggi ordinali e i costi di scenario del dossier."""
import json
from pathlib import Path

model = json.loads(Path(__file__).with_name("matrice.json").read_text())
concepts, criteria = model["concepts"], model["criteria"]
for label, weights in model["scenarios"].items():
    assert len(weights) == len(criteria) and sum(weights) == 100
    values = [sum(weight * row["scores"][i] for weight, row in zip(weights, criteria)) / 100 for i in range(len(concepts))]
    print(label, dict(zip(concepts, values)))
c = model["cost"]
for sessions in [c["sessions"] // 2, c["sessions"], c["sessions"] * 2]:
    print("sessioni", sessions)
    for i, name in enumerate(concepts):
        fixed = c["objects"] * c["minutes"][i] * c["authorEURh"] / 60
        total = fixed + sessions * c["variableEUR"][i]
        print(name, f"{total/(sessions*c['completion'][i]):.3f} EUR/esito")
