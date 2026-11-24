"""Independent review of eight unchanged original C1 worked examples.

The separate reviewer read every block and all seven source figures. Frozen hashes
identify read editions, including two FAILED editions; they do not approve them.
No original/candidate authoring import or alteration. No publication authority.
"""
from fractions import Fraction
import json
from pathlib import Path

import pint
import sympy as sp

from .pipeline import canonical, digest, sha
from .review_contract import reviewed_rows

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = "5d1dc8dc7b601aef959d10d564c75462be74708d"
SOURCE_PATH = "officina-di-fisica/content/C1.json"
READ_SOURCE_SHA256 = {
    "C1-E001": "4a2945c0e9e9c930c9f6b2c6e509ff3d603fb4aaae382c75c44136becd9c2ded",
    "C1-E002": "0c1aafe108d600ccae876e08906feb6f693f0304eaaa2034844d2cc49643b355",
    "C1-E003": "b805a1d40da26cf69788d78379dd7bc98b8a600774718ef6ba6d790106c94be6",
    "C1-E004": "92f89622f3c12353139b0c1a1c7bbb35b8641364710517a275a63b0fde8f5510",
    "C1-E005": "f4c7f9d8231db871695faeaf9e1e031f83de6b0e8003aa3b4cc0825b0816932f",
    "C1-E006": "f012341e646e53c4771bd246cc75e608ca560de73e28c6c1a26967ec7b13e296",
    "C1-E007": "1069956d28e3b52d934c0cb266d43007b10d69fdc9098fc82523880e369e5f0b",
    "C1-E008": "ede583084357d9e47f95bd794609fa024ae8db6263ebf387da321c6fcbd8c8bd",
}
READ_ASSETS = {
    "C1-scala.svg": "6c59566179802d99d4bc34c78f1a5074d2c3c1f0fd273c850631d0992ec19bad",
    "C1-corsie.svg": "994baad429211ba07fb5ef33a83d036fa667e79e251dea36e1fe131cba1fbeb8",
    "C1-tiro30.svg": "1b9ea2f613745a10509b8eea0b943e644f853043859f64b2abb28430338c6cf8",
    "C1-posizione.svg": "60f8e433938fb419332373efd343b8986057bea63c44691770fa8d40454e6d89",
    "C1-velocita.svg": "0983a43aa7f3bb6aeb9493172a1bdc7361ef602887b9bb29c0e4db4e02776d3a",
    "C1-bordo.svg": "97e21bb158e0b3cb3bfa9eebc52f03883fc70d40d2a2c13bc04bd9b1a42e0771",
    "C1-circolo.svg": "158b6a3f5b0614ce90034b870182536612b95171a10fc9cb51ee6d7d749341cf",
}
FIGURE_BY_ID = {
    "C1-E002": "C1-scala.svg", "C1-E003": "C1-corsie.svg", "C1-E004": "C1-tiro30.svg",
    "C1-E005": "C1-posizione.svg", "C1-E006": "C1-velocita.svg", "C1-E007": "C1-bordo.svg",
    "C1-E008": "C1-circolo.svg",
}
SI = pint.UnitRegistry(non_int_type=Fraction)
REVISION_IDS = {"C1-E003", "C1-E008"}
# Separate reviewer read both root-authored candidates and their new scientific figures.
REVIEWED_REVISIONS = {
    "C1-E003": "71e27f74832fa84bb6a8c55ecc4df6a4e5240aad2843c17e73533e3988e871d3",
    "C1-E008": "0e6d83c85c86288c70e92e5207b3880c954a651fbca3004e31be47c6285c0a1b",
}


def check(label, result, printed, unit, relation="exact"):
    residual = sp.simplify(result-printed)
    return {"claim": label, "independentExact": str(result), "printedValue": str(printed),
            "unit": unit, "dimension": {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            "relation": relation, "residual": str(residual), "ok": residual == 0}


def circular_benchmark():
    tau = sp.Symbol("tau", real=True)
    r, T = sp.symbols("r T", positive=True)
    omega = 2*sp.pi/T
    orbit = sp.Matrix([r*sp.cos(omega*tau), r*sp.sin(omega*tau)])
    velocity = orbit.diff(tau)
    acceleration = orbit.diff(tau, 2)
    if sp.simplify(velocity.dot(acceleration)) != 0 or sp.simplify(acceleration+omega**2*orbit) != sp.zeros(2, 1):
        raise ValueError("Independent tangent/radial circle identities failed")
    speed = sp.sqrt(sp.simplify(velocity.dot(velocity))).subs({r: sp.Rational(1, 5), T: 2})
    centripetal = sp.sqrt(sp.simplify(acceleration.dot(acceleration))).subs({r: sp.Rational(1, 5), T: 2})
    doubled_ratio = sp.simplify((r*omega**2).subs(T, 2*T)/(r*omega**2))
    return speed, centripetal, doubled_ratio


def independent_checks():
    Q = SI.Quantity
    mass = (Q(Fraction(21, 20), "gram/centimeter**3")*Q(8, "milliliter")).to("kilogram").magnitude
    area = (Q(25, "millimeter")*Q(12, "millimeter")).to("meter**2").magnitude
    resultant = sp.Matrix([30, 40]).norm()
    theta = sp.atan2(40, 30)
    Fx, Fy = 20*sp.cos(sp.pi/6), 20*sp.sin(sp.pi/6)
    positions = [sp.Integer(v) for v in (0, 6, 6, 2)]
    increments = [right-left for left, right in zip(positions, positions[1:])]
    path = sum(abs(step) for step in increments)
    displacement = positions[-1]-positions[0]
    tau = sp.Symbol("tau", real=True)
    v1, v2 = 2*tau, 12-2*tau
    triangular = sp.integrate(v1, (tau, 0, 3))+sp.integrate(v2, (tau, 3, 6))
    t2 = (2*Q(Fraction(5, 4), "meter")/Q(10, "meter/second**2")).to("second**2").magnitude
    flight = sp.sqrt(sp.Rational(t2))
    reach = Q(2, "meter/second")*Q(Fraction(1, 2), "second")
    speed, centripetal, doubled_ratio = circular_benchmark()
    return {
        "C1-E001": [check("massa del contenuto", sp.Rational(mass), sp.Rational(21, 2500), "kg")],
        "C1-E002": [check("area SI", sp.Rational(area), sp.Rational(3, 10000), "m**2"),
                    check("area in centimetri quadrati", sp.Rational(area)*10000, 3, "cm**2")],
        "C1-E003": [check("norma vettoriale", resultant, 50, "m"), check("direzione esatta", theta, sp.atan(sp.Rational(4, 3)), "rad"),
                    check("distanza camminata", sp.Integer(30+40), 70, "m")],
        "C1-E004": [check("componente orizzontale esatta", Fx, 10*sp.sqrt(3), "N"), check("componente verticale", Fy, 10, "N"),
                    check("ricomposizione", sp.sqrt(Fx*Fx+Fy*Fy), 20, "N")],
        "C1-E005": [check("distanza", path, 10, "m"), check("spostamento", displacement, 2, "m"),
                    check("velocita media orientata", displacement/6, sp.Rational(1, 3), "m/s"),
                    check("rapidita media esatta", path/6, sp.Rational(5, 3), "m/s")],
        "C1-E006": [check("accelerazione prima fase", sp.diff(v1, tau), 2, "m/s**2"),
                    check("accelerazione seconda fase", sp.diff(v2, tau), -2, "m/s**2"),
                    check("integrale velocita", triangular, 18, "m"), check("media complessiva", triangular/6, 3, "m/s")],
        "C1-E007": [check("tempo al quadrato", sp.Rational(t2), sp.Rational(1, 4), "s**2"),
                    check("tempo futuro", flight, sp.Rational(1, 2), "s"),
                    check("gittata orizzontale", sp.Rational(reach.to("meter").magnitude), 1, "m")],
        "C1-E008": [check("velocita indicata come uguaglianza", speed, sp.Rational(157, 250), "m/s"),
                    check("accelerazione indicata come uguaglianza", centripetal, sp.Rational(197, 100), "m/s**2"),
                    check("uguaglianza con velocita gia arrotondata", sp.Rational(157, 250)**2/sp.Rational(1, 5), sp.Rational(197, 100), "m/s**2"),
                    check("raddoppio periodo, rapporto accelerazioni", doubled_ratio, sp.Rational(1, 4), "1")],
    }


MANUAL = {
    "C1-E001": "1,05*8 = 8 + 0,05*8 = 8,4 g; grammi/1000 = 21/2500 kg. mL=cm3 e le unita di volume si cancellano.",
    "C1-E002": "25*(10+2)=250+50=300 mm2; (10^-3 m)^2=10^-6 m2; 300*10^-6=3*10^-4 m2=3 cm2, minore del quadrato da 4 cm2.",
    "C1-E003": "Norma manuale: sqrt(900+1600)=sqrt2500=50 m; direzione esatta atan(4/3), distanza70 m. Il decimale53,1 gradi stampato NON ha una procedura manuale adeguata ai prerequisiti del record; non certificato calculator-free.",
    "C1-E004": "cos30=sqrt3/2, sin30=1/2: Fx=10sqrt3 N, Fy=10 N. Norma sqrt(300+100)=20 N. Per il riferimento17,3: (69/4)^2<300<(347/20)^2, quindi17,25<Fx<17,35 N.",
    "C1-E005": "Incrementi6,0,-4 m: distanza6+0+4=10 m; spostamento2 m; media2/6=1/3 m/s; rapidita10/6=5/3 m/s. Decimali ripetuti0,333... e1,666... arrotondati correttamente.",
    "C1-E006": "Pendenze6/3=2 e-6/3=-2 m/s2. Ogni triangolo di fase ha area3*6/2=9 m; totale18 m, media18/6=3 m/s.",
    "C1-E007": "h=5/4 m:2h/g=(5/2)/10=1/4 s2; radice futura1/2 s;2 m/s per1/2 s =1 m. A pari altezza raddoppiare vx raddoppia la gittata, non il tempo.",
    "C1-E008": "Benchmark indipendente esatto: r=1/5 m,T=2 s danno v=pi/5 m/s e ac=pi^2/5 m/s2. Le uguaglianze decimali originali NON sono esatte; occorre una nuova edizione. Anche0,628^2/0,20=1,97192, non1,97 esatto.",
}
ASSUMPTIONS = {
    "C1-E001": "Liquido uniforme con densita assegnata e volume del contenuto; non massa della provetta; conversioni esatte di unita.",
    "C1-E002": "Rettangolo con lati perpendicolari; entrambe le lunghezze partecipano alla conversione dell'area.",
    "C1-E003": "Est e nord ortogonali, primo quadrante; direzione misurata a nord dell'est; percorso a due tratti distinto dal segmento risultante.",
    "C1-E004": "Trazione20 N a30 gradi sopra+x; componenti positive, seno/coseno di angolo notevole; radicale esatto ammesso.",
    "C1-E005": "I segmenti posizione-tempo specificano tutto il percorso, inclusa sosta; distanza somma i moduli, media usa tempo totale6 s.",
    "C1-E006": "Velocita lineare in ciascuna fase e non negativa; accelerazioni riferite agli interni delle fasi, non all'istante angoloso di raccordo.",
    "C1-E007": "Lancio orizzontale con componente verticale iniziale nulla, aria trascurata e g=10 costante; biglia trattata come punto materiale.",
    "C1-E008": "Moto circolare uniforme a raggio fisso; velocita tangente, accelerazione radiale; valori decimali da distinguere dai risultati esatti.",
}
PEDAGOGY = {
    "C1-E001": "Inversa motivata con moltiplicazione perV e cancellazione delle unita; controllo di scala della massa. Nessuna scelta multipla presente.",
    "C1-E002": "Due fattori lineari diventano fattore quadratico; griglia100 celle e riferimento3 contro4 cm2 appropriati.",
    "C1-E003": "Modulo e direzione simbolica corretti; chiusura con inversa trigonometrica decimale non spiegata senza calcolatrice. FAIL di fattibilita manuale dell'edizione stampata, non errore del triangolo.",
    "C1-E004": "Angolo rispetto all'orizzontale, componenti e ricomposizione distinti; esatto10sqrt3 gia presente, decimale segnato come approssimazione.",
    "C1-E005": "Distanza, spostamento, media orientata e rapidita separati; sosta compresa. Frazioni esatte presenti prima dei decimali dichiarati approssimati.",
    "C1-E006": "Pendenza e area hanno funzioni/unita diverse; segno della seconda accelerazione spiegato e media di controllo coerente.",
    "C1-E007": "Prima il moto verticale determina la durata, poi l'orizzontale la gittata; radice futura motivata e frazioni semplici.",
    "C1-E008": "FAIL: risultati arrotondati sono scritti con uguaglianze; nessuna tappa finale esatta pi/5,pi^2/5. Non approvare questa edizione come catena esatta senza calcolatrice.",
}
FIGURE_REVIEW = {
    "C1-E002": "Griglia quadrata156x156 con10 suddivisioni per lato:100 celle, ciascuna1mm2; 1cm2=100mm2.",
    "C1-E003": "Tratti rossi99px per30m e132px per40m: stessa scala3,3px/m. Risultante dal punto iniziale al vertice opposto, assi ortogonali.",
    "C1-E004": "Freccia con214,8px orizzontali e124px verticali: angolo30 gradi entro precisione del disegno; proiezioni e assi ortogonali, segni positivi.",
    "C1-E005": "Tempi0,2,4,6 a passo128px e posizioni0,6,6,2 con18,5px/m: dati e segmenti corrispondono all'enunciato.",
    "C1-E006": "Picco a3s, durata6s, altezza6m/s; triangolo non negativo. Scarto grafico di1px al basamento ricade nello spessore dei tratti, non cambia i dati etichettati.",
    "C1-E007": "Schema qualitativo parabolico con tangente iniziale orizzontale: ascissa lineare e caduta quadratica nel parametro Bezier. Non dichiara una scala metrica comune: non ricavare misure dal disegno.",
    "C1-E008": "Circonferenza, punto destro e frecce perpendicolari: velocita tangente verso l'alto, accelerazione verso il centro. Le frecce hanno unita diverse e non confrontano moduli su una scala comune.",
}


def verify_originals(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError("Missing read C1 examples: "+",".join(sorted(missing)))
    asset_root = asset_root or APP/"static/figures"
    models = independent_checks()
    results = []
    for key in sorted(READ_SOURCE_SHA256):
        row = sources[key]
        errors = []
        if row.get("kind") != "example" or digest(row) != READ_SOURCE_SHA256[key]:
            errors.append("Source differs from the independently read original example")
        expected_refs = {"/figures/"+FIGURE_BY_ID[key]} if key in FIGURE_BY_ID else set()
        actual_refs = {b["src"] for b in row.get("blocks", []) if b.get("type") == "figure"}
        if actual_refs != expected_refs:
            errors.append("Figure references differ from the read original")
        assets = {}
        for src in expected_refs:
            name = src.removeprefix("/figures/")
            file = asset_root/name
            actual = sha(file.read_bytes()) if file.is_file() else "MISSING"
            assets[src] = actual
            if actual != READ_ASSETS[name]:
                errors.append("Original scientific figure changed or missing")
        checks = models[key]
        for item in checks:
            if not item["ok"]:
                errors.append("Printed exact claim fails: "+item["claim"])
        if key == "C1-E003":
            errors.append("Original decimal inverse-trigonometric direction lacks a suitable calculator-free learning procedure; exact direction is correct")
        if key == "C1-E008":
            errors.append("Original edition presents rounded decimals as exact equalities; new editorial edition required")
        results.append({"id": key, "sourceSha256": digest(row), "sourceVersion": row.get("version", 1),
            "ok": not errors, "errors": errors, "checks": checks,
            "dimension": {c["claim"]: c["dimension"] for c in checks},
            "calculationScope": "EXACT_MANUAL_CALCULATION", "manualArithmetic": MANUAL[key],
            "manualFeasibility": "FAIL_ORIGINAL_EDITION" if key in {"C1-E003", "C1-E008"} else "PASS_AI_EXACT",
            "failedPublishedEdition": key in REVISION_IDS,
            "physicalAssumptions": ASSUMPTIONS[key], "pedagogicalReview": PEDAGOGY[key],
            "assetChecksums": assets, "figureReview": FIGURE_REVIEW.get(key, "No figure in this source record"),
            "verificationMode": "INDEPENDENT_EXISTING_EDITION", "originalEditionRetained": True,
            "humanApproval": "NOT_RUN", "publicationAction": "NONE"})
    return results


def revision_checks():
    vector = sp.Matrix([30, 40])
    norm = vector.norm()
    speed, acceleration, doubled_ratio = circular_benchmark()
    return {
        "C1-E003": [check("modulo esatto", norm, 50, "m"),
                    check("coseno della direzione", vector[0]/norm, sp.Rational(3, 5), "1"),
                    check("seno della direzione", vector[1]/norm, sp.Rational(4, 5), "1"),
                    check("tangente simbolica", vector[1]/vector[0], sp.Rational(4, 3), "1"),
                    check("cammino distinto dal modulo", vector[0]+vector[1], 70, "m")],
        "C1-E008": [check("circonferenza", 2*sp.pi*sp.Rational(1, 5), 2*sp.pi/5, "m"),
                    check("velocita esatta", speed, sp.pi/5, "m/s"),
                    check("accelerazione esatta", acceleration, sp.pi**2/5, "m/s**2"),
                    check("controllo omega r", sp.pi*sp.Rational(1, 5), speed, "m/s"),
                    check("controllo omega quadro r", sp.pi**2*sp.Rational(1, 5), acceleration, "m/s**2"),
                    check("periodo doppio", doubled_ratio, sp.Rational(1, 4), "1")],
    }


def verify(sources, package=None, bindings=None, asset_root=None, original_asset_root=None):
    originals = verify_originals(sources, original_asset_root)
    if package is None:
        if bindings is not None:
            raise ValueError("Bindings require a revision package")
        return originals
    if bindings is None:
        raise ValueError("Revision package requires complete source bindings")
    asset_root = asset_root or APP/"editorial/assets"
    rows = reviewed_rows(package, bindings, REVIEWED_REVISIONS, REVISION_IDS, asset_root)
    by_id = {r["id"]: r for r in originals}
    models = revision_checks()
    for row, binding, signature, assets, errors in rows:
        key = row["id"]
        original = by_id[key]
        if (binding["sourceRef"] != SOURCE_REF or binding["sourceId"] != key
                or binding["sourceSha256"] != original["sourceSha256"]
                or original["sourceSha256"] != READ_SOURCE_SHA256[key]):
            errors.append("Revision not bound to the read original source")
        if (row.get("kind") != "example" or row.get("version") != original["sourceVersion"]+1
                or row.get("baseVersion") != original["sourceVersion"]):
            errors.append("Expected additive next example edition with correct base version")
        for src, checksum in original["assetChecksums"].items():
            if checksum != READ_ASSETS[src.removeprefix("/figures/")]:
                errors.append("Retained historical example asset changed")
        checks = models[key]
        if not all(c["ok"] for c in checks):
            errors.append("Independent revised-example mathematics failed")
        manual = (
            "3-4-5 scalato10: sqrt(900+1600)=50m; cos30/50=3/5, sin40/50=4/5; quadranteI e tan4/3 identificano direzione esatta, nessun decimale richiesto; cammino70m distinto."
            if key == "C1-E003" else
            "r=1/5m,T=2s: circonferenza2pi/5m; dividere per2 cancella2 e da v=pi/5m/s; v²=pi²/25, dividere per1/5 moltiplica5: ac=pi²/5m/s². omega=pi/s ricompone entrambi."
        )
        reviewed = dict(original)
        reviewed.update(ok=not errors, errors=errors, checks=checks,
            dimension={c["claim"]: c["dimension"] for c in checks},
            manualArithmetic=manual, manualFeasibility="PASS_AI_EXACT",
            pedagogicalReview="Nuova edizione letta separatamente: risultati esatti e passaggi manuali espliciti; non certifica la vecchia edizione pubblicata.",
            assetChecksums=assets, candidateSha256=digest(row), reviewedSignature=signature,
            candidateVersion=row["version"], baseVersion=row["baseVersion"],
            failedPublishedEdition=True, publishedEditionReview=original, reviewedEdition="NEW_DRAFT",
            verificationMode="EXACT_ORACLE", publicationAction="DRAFT",
            figureReview=(
                "Tre pannelli alla stessa scala6px/m: cateti180px e240px e diagonale300px; arco nel primo quadrante e cos3/5,sin4/5 corretti."
                if key == "C1-E003" else
                "Tre cerchi di raggio80px; punto destro e velocita verticale tangente, accelerazione radiale verso sinistra; frecce di unita diverse esplicitamente non comparabili per lunghezza."
            ))
        by_id[key] = reviewed
    return [by_id[key] for key in sorted(by_id)]


def report(sources, package=None, bindings=None):
    records = verify(sources, package, bindings)
    return {"schemaVersion": "1.0.0", "batch": "examples-c1-activities-003", "records": records,
            "verifierSha256": sha(Path(__file__).read_bytes()), "sourceRef": SOURCE_REF, "sourcePath": SOURCE_PATH,
            "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
            "acceptedCount": sum(r["ok"] for r in records), "failedCount": sum(not r["ok"] for r in records),
            "draftReviewedCount": sum(r["publicationAction"] == "DRAFT" for r in records),
            "failedPublishedEditionIds": [r["id"] for r in records if r["id"] in REVISION_IDS],
            "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
            "reviewer": "separate_AI_reviewer_not_original_author", "humanApproval": "NOT_RUN", "publicationAction": "NONE"}
