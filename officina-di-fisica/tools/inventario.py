#!/usr/bin/env python3
"""Inventario di una edizione Astra. Le corrispondenze MUR sono curate, non inferite da similarità."""

import argparse
import csv
import hashlib
import json
import sqlite3
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server.learning import assessment
from server.store import catalog_seed, courses_for

# Punto ufficiale | obiettivo osservabile | lezione | esempi o altri svolgimenti puntuali |
# prove per quel preciso obiettivo | collegamenti aggiuntivi in C6 (Q o E) | laboratorio.
# Nei campi ridotti E/Q e numero sono del modulo della lezione, salvo l'ultima colonna C6.
MAP = """
1.1|Scrivere e confrontare quantità in notazione scientifica|C1-L001|E002|Q004 Q005|Q076|
1.2|Associare grandezze, dimensioni e unità SI omogenee|C1-L001|E001 E002|Q002 Q008|Q076|
1.2|Convertire unità, compresi potenze e prefissi, e stimare ordini di grandezza|C1-L001|E001 E002|Q001 Q004 Q005 Q007 Q009|Q002 Q076|
1.2|Distinguere proprietà estensive e intensive|C1-L001|E021 Q003|Q010 Q003|Q034 Q044|
1.2|Distinguere uno scalare da un vettore attraverso modulo, direzione e verso|C1-L001|C1-E003|Q006 C1-Q012|Q018|
1.3|Scegliere seno, coseno e tangente rispetto all’angolo effettivamente indicato|C1-L002|E003 E004|Q011 Q016 Q018 Q020|Q093|
1.4|Definire e scomporre un vettore in componenti e ricostruirne il modulo|C1-L002|E003 E004|Q011 Q016 Q020|Q018|
1.4|Sommare e sottrarre vettori, trattando i segni delle componenti|C1-L002|E003|Q012 Q013 Q017|Q018|
1.4|Calcolare e interpretare i prodotti scalare e vettoriale|C1-L002|C1-E013 C4-E018|Q014 Q015 Q019|Q065 Q093|
2.1|Descrivere posizione, spostamento, traiettoria e legge oraria|C1-L003|E005|Q021 Q025 Q026 Q027 Q030|Q013|
2.1|Ricavare velocità media e istantanea da dati o dal grafico x–t|C1-L003|E005|Q022 Q024 C1-Q040|Q013|
2.1|Ricavare accelerazione media e istantanea dalla variazione di velocità|C1-L003|E006|Q023 Q029 C6-Q096|Q096|
2.1|Risolvere moti rettilinei uniformi e uniformemente accelerati|C1-L003 C1-L004|E005 E006|Q021 Q026 Q031 Q040|Q047|
2.1|Riconoscere caduta libera e moto parabolico e trattare gli assi separatamente|C1-L004|E007|Q032 Q033 Q034 Q035|Q047|
2.1|Collegare moto circolare uniforme, periodo, velocità e accelerazione centripeta|C1-L004|E008|Q036 Q037 Q038 Q039|Q054|
2.2|Individuare l’inerzia e l’equilibrio traslazionale in un riferimento inerziale|C1-L005|E022 Q042|Q041 Q042 Q045|Q090|C1
2.2|Applicare il secondo principio alla risultante delle forze|C1-L005|E009 E010|Q044 Q046 Q047 Q050|Q085|C1
2.2|Individuare azione e reazione sui due corpi corretti|C1-L005|E023 Q043|Q043 Q047|Q040|
2.2|Distinguere forza peso e gravitazione universale e valutare la distanza dal centro|C1-L005 C1-L006|E010 Q055|Q048 Q054 Q055|Q085|
2.2|Rappresentare contatto, reazione normale e tensione|C1-L005|E009 E010|Q042 Q044 Q049 Q050|Q019 Q085|C1
2.2|Confrontare attrito statico e dinamico, soglia e segno|C1-L006|E011|Q051 Q052 Q053 Q058|Q064 Q090|C1
2.2|Applicare la legge di Hooke a una molla ideale|C1-L006|E012|Q056 Q057 Q059 Q060|Q101|
2.3|Calcolare il lavoro di una forza, incluso il segno o l’area sottesa|C1-L007|E013 E014|Q061 Q062 Q063 Q064|Q093|
2.3|Collegare lavoro, velocità e potenza in uno stesso intervallo|C1-L007|E013|Q067 Q069|Q051 Q070 E002|
2.3|Usare il lavoro della risultante per ricavare la variazione di energia cinetica|C1-L007|E014|Q065 Q066 Q070|Q023|
2.3|Distinguere forze conservative e non conservative attraverso il lavoro lungo il cammino|C1-L008|E015|Q071 Q075 Q078 Q079|Q005|
2.3|Scegliere gli zeri e calcolare energie potenziali gravitazionale ed elastica|C1-L008|E015 E016|Q072 Q073 Q074|Q023 Q101|
2.3|Conservare l’energia meccanica o aggiungere il lavoro delle forze non conservative|C1-L008|E015 E016|Q075 Q076 Q077 Q079 Q080|Q005 Q023|
2.4|Cambiare quantità di moto con un impulso, anche da una curva forza–tempo|C1-L009|E017|Q081 Q082 Q087 Q089 Q090|Q032|
2.4|Scegliere un sistema isolato e conservare la quantità di moto in urti o separazioni|C1-L009|E018|Q083 Q084 Q085 Q086 Q088|Q061|
2.5|Determinare il centro di massa e descriverne il moto sotto forze esterne|C1-L010|E020|Q091 Q096|Q080|
2.5|Definire corpo rigido, braccio e momento torcente, valutando il verso|C1-L010|E019|Q092 Q093 Q094 Q097 Q100|Q027|
2.5|Applicare simultaneamente equilibrio traslazionale e rotazionale a leve, anche anatomiche|C1-L010|E019|Q095 Q098 Q099|Q027|
3.1|Distinguere solidi, liquidi e gas e definire densità e pressione normale|C2-L001|E001 E002|Q001 Q002 Q003 Q005 Q008 Q009 Q010|Q002 Q044|
3.2|Applicare Stevino alla profondità e distinguere pressione assoluta e relativa|C2-L001 C2-L002|E002 E004|Q004 Q006 Q011 Q012 Q014 Q019|Q010 Q014 Q035|
3.2|Leggere il barometro di Torricelli e il manometro, misurando il dislivello verticale|C2-L002|E003 Q013|Q013 Q016 Q017 Q018 Q020|Q078 Q097|
3.2|Usare il principio di Pascal in liquidi confinati e nei pistoni|C2-L003|E005 E006|Q021 Q022 Q023 Q025 Q026 Q030|Q049|
3.2|Calcolare la spinta di Archimede dal fluido spostato|C2-L004|E007 E008|Q031 Q032 Q033 Q037|Q019 Q066 AE01|
3.2|Decidere il galleggiamento, la sospensione o la frazione immersa|C2-L004|E007 E008|Q034 Q035 Q036 Q038 Q039 Q040|Q083 AE01|
3.3|Distinguere flusso, portata di massa e portata volumetrica|C2-L005|E009 E010|Q041 Q043 Q046 Q048|Q003 E002 AQ01|
3.3|Distinguere regime stazionario, laminare e turbolento|C2-L005 C2-L007|E021 Q045 Q061|Q045 Q061 Q069|Q055 Q102|C2
3.3|Usare la continuità e la conservazione della massa nelle sezioni e alle biforcazioni|C2-L005|E009 E010|Q042 Q044 Q047 Q049 Q050|Q003 Q059|
3.3|Applicare Bernoulli dichiarando stazionarietà, incomprimibilità e perdite trascurabili|C2-L006|E011 E012|Q053 Q054 Q055 Q057 Q059 Q060|Q029|
3.3|Confrontare restringimento e dilatazione di un vaso nel modello ideale e discuterne i limiti|C2-L006|E011 Q058|Q051 Q052 Q055 Q056 Q058|Q029|C2
3.4|Interpretare viscosità, gradiente di velocità e profilo parabolico laminare|C2-L007|E013 E014|Q062 Q063 Q064 Q065 Q066 Q067 Q068|Q055 Q071 Q102|C2
3.4|Applicare Poiseuille a un tubo cilindrico e valutarne ipotesi e dipendenza da raggio, viscosità e lunghezza|C2-L008|E015 E016|Q071 Q072 Q073 Q074 Q075 Q076 Q078|Q007|C2
3.4|Comporre resistenze idrauliche in serie e parallelo e interpretare portate e pressioni nei rami|C2-L009|E017 E018|Q081 Q082 Q083 Q084 Q085 Q089 Q090|Q024|
3.5|Spiegare la tensione superficiale di una piccola quantità di liquido e il costo di nuova area|C2-L010|E020 Q092|Q091 Q092 Q093 Q099|Q039 Q088|
3.5|Interpretare capillarità, bagnabilità, interfacce piane o curve e pressione di Laplace|C2-L010|E019 E020|Q094 Q095 Q096 Q097 Q098 Q100|Q039 Q088 Q092|
4.1|Descrivere l’oscillatore armonico e leggere ampiezza, periodo, frequenza e pulsazione|C5-L01|E001 E002|Q001 Q002 Q003 Q004 Q005 Q007 Q008 Q009|Q037 AE01|
4.1|Distinguere propagazione di energia e perturbazione dal moto del mezzo, compresi esempi trasversali e longitudinali|C5-L02|E003 Q018|Q012 Q013 Q018 Q020|Q069|
4.1|Collegare velocità di propagazione, lunghezza d’onda e frequenza e leggere una semplice onda armonica|C5-L02|E003 E004|Q011 Q014 Q015 Q016 Q017 Q019|Q048 Q069|
4.2|Sovrapporre onde e prevedere interferenza costruttiva, distruttiva o parziale|C5-L03|E005 E006|Q021 Q022 Q023 Q024 Q025 Q028 Q030|Q017|
4.3|Ricavare energia, potenza e intensità attraverso un’area in un mezzo elastico|C5-L04|E007 E008|Q031 Q034 Q035 Q037 Q038 Q039|E006 Q058|
4.3|Applicare la legge dell’inverso del quadrato alla propagazione isotropa senza perdite|C5-L04|E007|Q032 Q033 Q036 Q040|Q008 Q058 E004|
4.4|Confrontare velocità del suono nei mezzi e ricavare tempi di propagazione o eco|C5-L05|E009|Q045 Q048|Q001 Q048|
4.4|Distinguere intensità, percezione e livello sonoro in decibel|C5-L05|E010|Q041 Q042 Q043 Q044 Q049 Q050||
4.5|Prevedere qualitativamente l’effetto Doppler per sorgente o ricevitore in moto|C5-L05|E021 Q046|Q046 Q047|Q105|
5.1|Fissare sistema, ambiente, confini e scambi e identificare uno stato di equilibrio|C3-L01|E002|Q001 Q004 Q006 Q009 Q010||
5.1|Distinguere funzioni di stato e convertire temperature assolute e differenze di temperatura|C3-L01|E001|Q002 Q003 Q005 Q007 Q008|Q043 Q103|
5.1|Usare p, V, n e T assoluti nell’equazione di stato del gas perfetto|C3-L02|E003 E004|Q011 Q012 Q013 Q014 Q015 Q016 Q017 Q018 Q019 Q020|Q046 Q103|C3
5.2|Collegare calore, capacità termica, calore specifico e calorimetria di equilibrio|C3-L03|E005 E006|Q021 Q022 Q023 Q024 Q025 Q026 Q029 Q030|Q033 Q067 E003 AQ01|
5.2|Distinguere capacità termiche dei gas ideali a volume o pressione costanti|C3-L03|E021 Q027|Q027 Q028 Q065|Q038|
5.2|Seguire fusione, evaporazione, condensazione e calore latente, anche con bilanci a tratti|C3-L04|E007 E008|Q031 Q032 Q033 Q034 Q035 Q036 Q037 Q039 Q040|Q021 Q086|
5.3|Usare conduzione, conducibilità e geometria in regime stazionario|C3-L05|E009 E010|Q042 Q044 Q045 Q047 Q049|Q075|
5.3|Riconoscere convezione naturale e forzata nel trasporto termico|C3-L05|E022 Q041|Q041 Q048|Q098|
5.3|Distinguere emissione radiativa, assorbimento e scambio netto, anche attraverso il vuoto|C3-L05|E023 Q046|Q043 Q046 Q050|Q052|
5.4|Distinguere calore, lavoro ed energia interna e impostare il primo principio con i segni|C3-L06|E011 E012|Q051 Q052 Q053 Q054 Q055 Q056 Q057 Q058 Q060|Q015 E005|C3
5.4|Distinguere reversibilità, quasi staticità e irreversibilità|C3-L07|E014|Q064 Q068 Q070|Q081|
5.4|Confrontare isocora, isobara, isoterma e adiabatica nel piano p–V e nei bilanci|C3-L07|E013 E014|Q061 Q062 Q063 Q065 Q066 Q067 Q068 Q069 Q070|Q038 Q072 Q081|C3
5.5|Enunciare i vincoli del secondo principio e distinguere verso spontaneo e processo azionato|C3-L09 C3-L10|E017 E018|Q082 Q085 Q087 Q099||
5.5|Definire ciclo, chiudere i bilanci e interpretare il verso nel piano p–V|C3-L08|E015 E016|Q071 Q072 Q073 Q074 Q075 Q076 Q077 Q078 Q079 Q080|Q006 Q057|
5.5|Calcolare rendimento di una macchina e limite di Carnot, identificando i tratti del ciclo reversibile|C3-L09|E017|Q081 Q083 Q084 Q086 Q087 Q088 Q089|Q006 Q028|
5.5|Usare l’entropia di sistema e ambiente e interpretarne il significato statistico|C3-L10|E019 E020|Q091 Q092 Q093 Q094 Q095 Q096 Q097 Q098 Q099 Q100|Q043 Q062|
6.1|Definire carica in coulomb e conservarne la somma algebrica|C4-L01|E002|Q001 Q003 Q005 Q009||
6.1|Applicare la legge di Coulomb e determinare modulo e verso delle interazioni fra cariche puntiformi|C4-L01|E001|Q002 Q004 Q006 Q007 Q008 Q010|Q050|
6.1|Distinguere campo e forza e rappresentare le linee elettriche|C4-L02|E003|Q011 Q012 Q013 Q015 Q017|Q042 Q087|
6.1|Sommare vettorialmente campi di cariche puntiformi e individuare cancellazioni|C4-L02|E003|Q014 Q018|Q050|
6.1|Prevedere accelerazione e traiettoria in un campo elettrico uniforme|C4-L02|E004|Q016 Q019 Q020|Q087|
6.2|Calcolare energia potenziale di coppie o distribuzioni e sommare i potenziali|C4-L03|E006|Q021 Q025 Q030||
6.2|Fissare un riferimento per V, usare ΔV e conservare K+U in un campo elettrostatico|C4-L03|E005|Q022 Q023 Q024 Q026 Q027 Q028 Q029|Q016|
6.3|Seguire ridistribuzione di carica, messa a terra e induzione elettrostatica nei conduttori|C4-L04|E007|Q031 Q033 Q034 Q035 Q036 Q037 Q038||
6.3|Descrivere la polarizzazione dei dielettrici e distinguerla dalla conduzione|C4-L04|E008|Q032 Q039 Q040|Q068|
6.4|Ricavare una corrente continua da carica e tempo e interpretare il generatore ideale|C4-L05|E009 Q043|Q041 Q042 Q043 Q044 Q050|Q004 Q009 Q036|
6.4|Interpretare la conduzione ohmica e ricavare resistenza o resistività da misure e geometria|C4-L05|E009 E010|Q045 Q046 Q047 Q048 Q049|Q045 Q060|C4
6.4|Confrontare potenza elettrica e calore dissipato per effetto Joule|C4-L06|E011|Q052 Q054 Q057 Q060|Q004 Q060 E003|C4
6.4|Ridurre resistori in serie e in parallelo riconoscendo i nodi|C4-L06|E011 E012|Q051 Q053 Q055 Q056 Q058 Q059|Q020 Q095|C4
6.5|Definire capacità, applicare il modello piano e discutere l’inserimento di un dielettrico|C4-L07|E013 E014|Q061 Q062 Q063 Q064 Q067 Q068 Q069|Q030 Q077 Q104|
6.5|Calcolare l’energia del condensatore e considerare i vincoli Q oppure V costante|C4-L07|E013 E014|Q065 Q066 Q068 Q070|Q030|
6.5|Comporre condensatori in serie e in parallelo conservando la carica dei nodi isolati|C4-L08|E015 E016|Q071 Q072 Q073 Q074 Q075 Q076 Q077 Q078 Q079 Q080|Q082|
6.6|Collegare l’esperimento di Oersted alla direzione del campo di una corrente|C4-L09|E021 Q081|Q081|Q099|
6.6|Prevedere forza di Lorentz su una carica e forza su un filo percorso da corrente|C4-L09|E017 E018|Q082 Q083 Q084 Q085 Q088 Q090|Q056|
6.6|Descrivere e quantificare il moto circolare uniforme di una carica in campo magnetico|C4-L09|E017|Q086 Q087 Q088 Q089||
6.7|Valutare il flusso magnetico e la f.e.m. prodotta da una sua variazione|C4-L10|E019|Q091 Q092 Q094 Q096 Q097 Q098 Q100|Q026 Q091|
6.7|Applicare Faraday–Neumann–Lenz e stabilire il verso delle correnti indotte|C4-L10|E019 E020|Q093 Q095 Q099|Q073 Q091|
7.1|Identificare campi E e B ortogonali e la relazione fra frequenza, lunghezza d’onda, velocità, ampiezza e intensità|C5-L06|E011 E012|Q051 Q052 Q053 Q056 Q057 Q058|Q084|
7.2|Ordinare per frequenza e lunghezza d’onda radio, microonde, IR, visibile, UV, X e gamma|C5-L06|E022 Q055|Q054 Q055 Q060|Q100|
7.3|Usare il fotone come quanto e legarne energia e frequenza|C5-L07|E013|Q061 Q063 Q068|Q011 Q031 Q063|
7.4|Interpretare l’attenuazione di un fascio tramite la legge di Lambert–Beer|C5-L07|E014|Q064 Q065 Q066 Q067 Q069|Q041 Q089 E004|
7.5|Definire nucleo instabile e isotopi radioattivi distinguendo singolo evento e popolazione|C5-L08|E015 Q071|Q071 Q078 Q080|Q022|
7.5|Calcolare attività, decadimento esponenziale e tempo di dimezzamento|C5-L08|E015|Q075 Q076 Q077 Q079 Q080|Q008 Q022 Q074|
7.5|Seguire i cambiamenti di A e Z nei decadimenti alfa, beta e gamma|C5-L08|E016|Q072 Q073 Q074|Q094|
7.6|Distinguere radiazioni ionizzanti e non ionizzanti confrontando energia del fotone e soglia del materiale|C5-L07|E013 Q062|Q062 Q068 Q070|Q063|
7.7|Applicare le leggi della riflessione e della rifrazione rispetto alla normale e usare l’indice di rifrazione|C5-L09|E017 E018|Q081 Q082 Q083 Q084 Q085 Q086 Q087 Q089|Q025 Q079 E001|
7.7|Costruire l’immagine di una lente convergente sottile e usare la legge dei punti coniugati|C5-L10|E019 E020|Q091 Q092 Q093 Q094 Q095 Q096 Q097 Q098 Q099 Q100|Q053|C5
""".strip()

UNIT_NAMES = {
    1: "Introduzione ai metodi della fisica",
    2: "Meccanica",
    3: "Meccanica dei fluidi",
    4: "Onde meccaniche",
    5: "Termodinamica",
    6: "Elettricità e magnetismo",
    7: "Fisica delle radiazioni",
}
EXPECTED = {1: 4, 2: 5, 3: 5, 4: 5, 5: 5, 6: 7, 7: 7}
SOURCE_PAGES = {1: "2", 2: "2–3", 3: "3", 4: "3–4", 5: "4", 6: "4–5", 7: "5"}
KIND = {
    "course": "corso",
    "lesson": "lezione",
    "example": "esempio svolto",
    "question": "quesito",
    "lab": "laboratorio",
    "bench": "banco 3D di approfondimento",
    "experiment": "simulazione di lezione",
    "section": "sezione",
    "method": "attività di metodo",
}
ANSWER = {"numeric": "numerica", "choice": "scelta multipla", "text": "completamento"}


def fields(line):
    point, objective, lessons, examples, questions, cumulative, lab = line.split("|")
    course = lessons.split()[0].split("-")[0]

    def ids(values, prefix):
        return [v if "-" in v else prefix + "-" + v for v in values.split()]

    return (
        point,
        objective,
        lessons.split(),
        ids(examples, course),
        ids(questions, course),
        ids(cumulative, "C6"),
        lab,
    )


def paper_files(record):
    c = record["course"]
    if record.get("exam"):
        return c + "-simulazioni.pdf"
    return c + (
        "-dispensa.pdf"
        if record["kind"] in ("lesson", "example", "lab")
        else "-esercizi.pdf"
    )


def figure_paths(record):
    out = []
    for field in ("promptBlocks", "blocks"):
        for b in record.get(field, []):
            if b.get("type") == "figure" and b.get("src") and b["src"] not in out:
                out.append(b["src"])
    return out


def fingerprint(r):
    data = json.dumps(
        r, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode()
    return hashlib.sha256(data).hexdigest()


def csv_out(path, head, values):
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(head)
        w.writerows(values)


def restore_published(path):
    from server.store import published

    with sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True) as db:
        return published(db)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--database",
        type=Path,
        help="catalogo pubblicato SQLite da leggere in sola lettura",
    )
    p.add_argument(
        "--out", type=Path, default=ROOT / "docs", help="cartella dei tre file prodotti"
    )
    args = p.parse_args()
    rows = restore_published(args.database) if args.database else list(catalog_seed())
    originali = {r["id"]: r for r in (catalog_seed() if args.database else rows)}
    source = (
        "catalogo pubblicato nel database indicato"
        if args.database
        else "manoscritto iniziale distribuito nei file content/*.json"
    )
    args.out.mkdir(parents=True, exist_ok=True)
    index = {r["id"]: r for r in rows}
    assert len(index) == len(rows), "ID duplicati nel catalogo"
    courses = sorted(r["id"] for r in rows if r["kind"] == "course")
    checks = {}
    membership = defaultdict(list)
    for course in courses:
        for name, mode, part in (
            ("Intermedia 1", "mid", 1),
            ("Intermedia 2", "mid", 2),
            ("Finale", "final", 1),
        ):
            checkids = {r["id"] for r in assessment(rows, course, mode, part)}
            checks[course, name] = checkids
            for q in checkids:
                membership[q].append(course + " " + name)
    for r in rows:
        if r.get("exam"):
            membership[r["id"]].append(f"C6 simulazione {r['exam']}")
    stats = defaultdict(Counter)
    figures = defaultdict(set)
    families = defaultdict(set)
    exfamilies = defaultdict(set)
    stock = []
    for r in sorted(
        rows, key=lambda r: (r["course"], r["kind"], r.get("order", 0), r["id"])
    ):
        c, k = r["course"], r["kind"]
        a = r.get("answer", {})
        fgs = figure_paths(r)
        stats[c][k] += 1
        if k == "question":
            stats[c]["sim" if r.get("exam") else "banca"] += 1
            stats[c][a["type"]] += 1
            if r.get("family"):
                families[c].add(r["family"])
            if r.get("hints") and r.get("error", {}).get("target"):
                stats[c]["feedback"] += 1
            if any(b.get("type") == "figure" for b in r.get("promptBlocks", [])):
                stats[c]["promptFigure"] += 1
        if k == "example" and r.get("family"):
            exfamilies[c].add(r["family"])
        figures[c].update(fgs)
        review = r.get("review", "edizione Astra · controlli automatici")
        status = "pubblicato" if args.database else "pubblicato nell’edizione iniziale"
        stock.append(
            [
                r["id"],
                r["version"],
                KIND.get(k, k),
                c,
                " ".join(sorted(courses_for(rows, r))),
                r["section"],
                r["title"],
                r.get("skill", ""),
                " ".join(r.get("prerequisites", [])),
                r.get("family", ""),
                r.get("difficulty", ""),
                ANSWER.get(a.get("type"), ""),
                r.get("prompt", ""),
                len(r.get("hints", [])),
                r.get("error", {}).get("category", ""),
                r.get("error", {}).get("target", ""),
                len(r.get("blocks", [])),
                sum(b.get("type") == "formula" for b in r.get("blocks", [])),
                " ".join(
                    b["src"]
                    for b in r.get("promptBlocks", [])
                    if b.get("type") == "figure"
                ),
                " ".join(
                    b["src"] for b in r.get("blocks", []) if b.get("type") == "figure"
                ),
                " · ".join(membership.get(r["id"], [])),
                r.get("exam", ""),
                paper_files(r) if k in ("lesson", "example", "question", "lab") else "",
                "edizione originale assistita da modelli"
                if r["id"] in originali and r.get("version") == 1
                else "revisione o aggiunta locale, consultare lo storico",
                review,
                status,
                fingerprint(r),
            ]
        )
    csv_out(
        args.out / "inventario-record.csv",
        [
            "id",
            "versione",
            "tipo",
            "modulo_origine",
            "percorsi_che_usano_il_record",
            "sezione",
            "titolo",
            "competenza",
            "prerequisiti",
            "famiglia",
            "difficoltà",
            "forma_risposta",
            "consegna",
            "numero_indizi",
            "categoria_errore_previsto",
            "attività_recupero",
            "blocchi_spiegazione",
            "formule_nello_svolgimento",
            "figure_in_consegna",
            "figure_nel_contenuto",
            "prove_che_lo_includono",
            "simulazione",
            "fascicolo_origine",
            "provenienza_editoriale",
            "revisione_dichiarata",
            "stato",
            "sha256_record",
        ],
        stock,
    )
    seen = defaultdict(set)
    topics = Counter()
    matrix = []
    issues = []
    changed = set()

    def title(ref):
        if ref not in index:
            issues.append("Riferimento assente · " + ref)
            return ref + " [assente]"
        r = index[ref]
        label = r.get("prompt", "") if r.get("exam") else r["title"]
        return f"{ref} · {label}"

    def describe(references):
        return " | ".join(title(ref) for ref in references)

    for line in MAP.splitlines():
        point, obj, lessons, examples, qs, c6, lab = fields(line)
        u, bullet = map(int, point.split("."))
        seen[u].add(bullet)
        topics[u] += 1
        direct = lessons[0].split("-")[0]
        labid = "LAB-" + lab if lab else None
        worked = [r for r in examples if index.get(r, {}).get("kind") == "example"]
        solved = [r for r in examples if index.get(r, {}).get("kind") == "question"]
        syms = [r for r in c6 if index.get(r, {}).get("exam")]
        mixed = [r for r in c6 if r not in syms]
        included = {
            cid
            for ref in lessons
            if ref in index
            for cid in courses_for(rows, index[ref])
        }
        if "C6" not in included:
            issues.append(point + " · C6 non include " + ",".join(lessons))
        for ref in lessons + examples + qs + c6 + ([labid] if labid else []):
            if ref not in index:
                issues.append(point + " · Assente " + ref)
            elif index[ref].get("version", 1) != 1:
                changed.add(ref)
        if not args.database:
            assert worked, (point, obj)
            assert all(index[r]["kind"] == "lesson" for r in lessons)
            assert all(index[r]["kind"] == "question" for r in qs)
            assert all(index[r]["kind"] in ("example", "question") for r in examples)
            assert all(index[r]["course"] == "C6" for r in c6)
        dedicated = [x for x in qs if x in index]

        def part(typ):
            sample = checks.get((direct, typ), set())
            return describe([r for r in dedicated if r in sample])

        matrix.append(
            [
                f"UD{u}",
                UNIT_NAMES[u],
                point,
                SOURCE_PAGES[u],
                obj,
                direct,
                describe(lessons),
                describe(worked),
                describe(solved),
                describe(qs),
                describe(qs[:2]),
                part("Intermedia 1"),
                part("Intermedia 2"),
                part("Finale"),
                title(labid) if labid else "",
                " ".join(lessons) if "C6" in included else "",
                describe(mixed),
                " | ".join(f"S{index[r]['exam']} / {title(r)}" for r in syms),
            ]
        )
    assert all(seen[u] == set(range(1, n + 1)) for u, n in EXPECTED.items()), seen
    if not args.database:
        assert not issues, issues
    csv_out(
        args.out / "inventario-copertura.csv",
        [
            "unità_MUR",
            "titolo_unità_MUR",
            "punto_nel_syllabus",
            "pagina_PDF",
            "obiettivo_osservabile",
            "microcorso",
            "lezioni",
            "esempi_guidati_autonomi",
            "applicazioni_svolte_nelle_soluzioni",
            "quesiti_pertinenti",
            "verifica_mirata_dal_banco",
            "intermedia_1_sottocompetenza",
            "intermedia_2_sottocompetenza",
            "finale_sottocompetenza",
            "laboratorio_pertinente",
            "stessi_id_nel_percorso_C6",
            "raccordi_e_problemi_misti_C6",
            "quesiti_specifici_delle_simulazioni",
        ],
        matrix,
    )
    inventory = [
        "# Inventario editoriale e copertura MUR",
        "",
        f"Questa fotografia riguarda il {source}. Comprende {len(rows)} record con identificatori stabili. C6 riutilizza i cinque microcorsi mediante gli stessi identificatori e aggiunge materiali propri. I conteggi seguono il modulo di origine. Ogni record è contato una sola volta.",
        "",
        "Fonti ministeriali consultate il 21 novembre 2026 per l’anno accademico 2026/27. I collegamenti ai documenti archiviati sono sotto la matrice.",
        "",
        "## Banca pubblicata",
        "",
        "| Origine | Lezioni | Esempi guidati | Famiglie di esempi | Quesiti di studio | Quesiti di simulazione | Famiglie di quesiti | Scelta / numerica / completamento | Tavole SVG distinte usate | Quesiti con figura nella consegna | Laboratori guidati | Banchi 3D | Simulazioni di lezione | Attività di metodo |",
        "|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|",
    ]
    for c in courses:
        s = stats[c]
        inventory.append(
            f"| {c} · {index[c]['title']} | {s['lesson']} | {s['example']} | {len(exfamilies[c])} | {s['banca']} | {s['sim']} | {len(families[c])} | {s['choice']} / {s['numeric']} / {s['text']} | {len(figures[c])} | {s['promptFigure']} | {s['lab']} | {s['bench']} | {s['experiment']} | {s['method']} |"
        )
    inventory += [
        "",
        "## Verifiche dei microcorsi",
        "",
        "| Modulo | Prima intermedia | Seconda intermedia | Finale | Quesiti con suggerimento e recupero |",
        "|---|---:|---:|---:|---:|",
    ]
    for c in ("C1", "C2", "C3", "C4", "C5"):
        if c not in index:
            continue
        a, b, f = (
            len(checks[c, t]) for t in ("Intermedia 1", "Intermedia 2", "Finale")
        )
        inventory.append(f"| {c} | {a} | {b} | {f} | {stats[c]['feedback']} |")
    inventory.extend(
        [
            "",
            "Le famiglie sono quelle registrate con un identificatore editoriale. I valori numerici appartengono alla consegna salvata. Ripetere lo stesso quesito mantiene la medesima famiglia. Il conteggio delle figure usa il percorso dell’asset e include le tavole nella consegna e nello svolgimento. Una figura citata in più moduli compare in ciascuna riga interessata. Le ultime colonne distinguono i laboratori guidati, i banchi 3D di approfondimento, le simulazioni delle singole voci e le attività di metodo. [Mappa delle simulazioni di lezione](laboratori-3d/voci.md)",
            "",
            "## Matrice del programma",
            "",
            f"I {sum(EXPECTED.values())} punti elenco del syllabus MUR sono scomposti in {len(matrix)} obiettivi osservabili. La numerazione dopo il punto indica la posizione dell’elenco nell’unità ufficiale. Le pagine si riferiscono al PDF ministeriale di cinque pagine. Le sigle C1–C6 identificano i percorsi editoriali di Andrea Marro.",
            "",
            "| Unità | Titolo del syllabus | Punti elenco | Obiettivi mappati | Moduli di studio |",
            "|---|---|---:|---:|---|",
        ]
    )
    for u in sorted(EXPECTED):
        cs = sorted({row[5] for row in matrix if row[0] == f"UD{u}"})
        inventory.append(
            f"| UD{u} | {UNIT_NAMES[u]} | {EXPECTED[u]} | {topics[u]} | {', '.join(cs)} + C6 |"
        )
    inventory.extend(
        [
            "",
            "La matrice indica esempi guidati, soluzioni utilizzabili come esempi supplementari e verifiche mirate per ogni obiettivo. Per verificare un singolo punto si possono aprire nel banco i quesiti indicati. Le colonne delle due intermedie e della finale contengono l’intersezione fra i quesiti pertinenti selezionati e quelli effettivamente usati dal motore. Una cella vuota indica che quella prova non campiona direttamente i quesiti elencati per il punto. Le simulazioni C6 hanno fascicoli fissi. I riferimenti alle simulazioni indicano la prova e la traccia che affronta il punto. Per ritrovare le tracce complete usa gli identificatori nell’inventario dei record.",
            "",
            "- [Matrice di copertura](inventario-copertura.csv)",
            "- [Inventario dei singoli record](inventario-record.csv)",
            "- [Syllabus MUR, Fisica 2026/27](sources/MUR-syllabus-fisica-2026.pdf)",
            "- [Regole ministeriali delle prove, allegato 2 al DM 941/2026](sources/MUR-DM941-allegato2.pdf)",
            "",
            "## Stato e manutenzione",
            "",
            "I contenuti iniziali sono stati redatti con assistenza di modelli. La revisione scientifica ed editoriale assistita ha controllato testi, ipotesi e soluzioni. La verifica automatica controlla struttura e riferimenti. I controlli numerici rieseguono i calcoli previsti dai rispettivi script. Lo stato pubblicato indica la visibilità nel catalogo. La revisione umana e la misurazione di efficacia con studenti reali restano distinte da queste verifiche.",
            "",
            "Per riprodurre gli elenchi dell’edizione distribuita eseguire dalla cartella del repository",
            "",
            "    python3 tools/inventario.py",
            "",
            "Per fotografare l’edizione aggiornata dopo pubblicazioni nell’area autore si può leggere il catalogo SQLite in sola lettura e scegliere dove salvare i tre file.",
            "",
            "    python3 tools/inventario.py --database /percorso/officina.sqlite3 --out /cartella/inventario",
            "",
            "L’impronta SHA-256 di ogni record consente il confronto tra esportazioni. La tabella MAP dello script contiene le corrispondenze curate. Dopo una modifica sostanziale o l’aggiunta di materiali, rivedere le associazioni con i punti MUR prima di distribuire la nuova matrice. I nuovi record compaiono subito nell’inventario.",
        ]
    )
    if issues or changed:
        inventory += ["", "## Riferimenti da ricontrollare", ""]
        inventory += ["- " + i for i in sorted(set(issues))]
        if changed:
            inventory.append(
                "- Versione successiva al manoscritto mappato · "
                + ", ".join(sorted(changed))
            )
    (args.out / "inventario.md").write_text("\n".join(inventory) + "\n")
    print(
        f"{len(rows)} record, {len(matrix)} obiettivi, {sum(EXPECTED.values())} punti MUR, {len(set(issues))} riferimenti assenti."
    )


if __name__ == "__main__":
    main()
