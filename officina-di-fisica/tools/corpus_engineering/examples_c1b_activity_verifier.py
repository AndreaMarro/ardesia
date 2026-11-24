"""Separate AI reading and exact oracles for unchanged original C1-E009..016.

No candidate/authoring import, human approval, or publication authority. Hashes
were frozen after every original block and all three historical figures were read.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha

APP = Path(__file__).resolve().parents[2]
SOURCE_REF = "5d1dc8dc7b601aef959d10d564c75462be74708d"
SOURCE_PATH = "officina-di-fisica/content/C1.json"
SOURCE_FILE_SHA256 = "0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf"
READ_SOURCE_SHA256 = {
    "C1-E009": "dc86fc860c30006fc3a5d25bd950e922077a371a55d9030e42bf55574b8a1695",
    "C1-E010": "e98cbb30546f7e519a5eab3db8839adc5031535cf44fb83e63b0e7b81bf8821f",
    "C1-E011": "4d6042e3255513074c58ab9506e4cb22a08940dbfab276d086e7d94104d23858",
    "C1-E012": "5028c3cbda1d0c5063bf599af0601f064a4d4620327fb8c20a1f5b1977de7e37",
    "C1-E013": "6ade4da8ce703237e74507ca793e7749054375717edc7755d08f63dfac681a2b",
    "C1-E014": "459f015486eb5c372f5b3a1d4871bcba9f7e154d8f64b529411fbb4aff564872",
    "C1-E015": "9d515d5810a20bb0b2bd02db31525ef8d3edd335cac1265d15e4f9ae255bcaa8",
    "C1-E016": "b22750f9423aabb67dc536c4416362c038c43bead0485d3ec1ff42b9431c98d1",
}
READ_ASSETS = {
    "C1-forze.svg": "23032966207743fa88c6b6c4491a80d13b9da68c1e913bd4ebd8719f610c620a",
    "C1-ascensore.svg": "94d0a446107d71a2b193ede59de57c73d4c26db7fe2dbc81e6f64dcb4cd2c8e1",
    "C1-energia.svg": "13899393ff8432b08112f3766b163b4223d5d6f3d3541630b24f5a56faa1d21b",
}
FIGURE_BY_ID = {"C1-E009": "C1-forze.svg", "C1-E010": "C1-ascensore.svg", "C1-E015": "C1-energia.svg"}
SI = pint.UnitRegistry(non_int_type=Fraction)


def check(label, result, printed, unit):
    residual = sp.simplify(result-printed)
    return {"claim": label, "independentExact": str(result), "printedValue": str(printed),
            "unit": unit, "dimension": {str(k): str(v) for k, v in SI.Unit(unit).dimensionality.items()},
            "relation": "exact", "residual": str(residual), "ok": residual == 0}


def independent_checks():
    Q = SI.Quantity
    a, normal, friction, stiffness, speed = sp.symbols("a N f k v", real=True)
    # Equations constructed from the statements, not from answer/formula parsing.
    acceleration = sp.solve(sp.Eq(4*a, 10-6), a)[0]
    elevator = sp.solve(sp.Eq(normal-6*sp.Rational(49, 5), 6*sp.Rational(3, 2)), normal)[0]
    static_required = sp.solve(sp.Eq(20+friction, 0), friction)[0]
    static_limit = sp.Rational(2, 5)*8*10
    mass = (Q(150, "gram")).to("kg").magnitude
    extension = Q(3, "centimeter").to("meter").magnitude
    elastic = sp.solve(sp.Eq(stiffness*sp.Rational(extension), sp.Rational(mass)*sp.Rational(49, 5)), stiffness)[0]
    # Pint independently checks cancellations and the actual SI conversions.
    force = Q(12, "kg")*Q(10, "m/s**2")
    work = (force*Q(Fraction(3, 2), "m")).to("joule").magnitude
    power = (Q(work, "joule")/Q(3, "second")).to("watt").magnitude
    position = sp.Symbol("position", real=True)
    kinetic_i = sp.Rational(1, 2)*2*1**2
    kinetic_f = kinetic_i+sp.integrate(4, (position, 0, 3))
    v2 = sp.solve(sp.Eq(kinetic_f, sp.Rational(1, 2)*2*speed**2), speed**2)[0]
    gravity_energy = (Q(2, "kg")*Q(10, "m/s**2")*Q(Fraction(9, 5), "meter")).to("joule").magnitude
    bottom_energy = sp.Rational(gravity_energy)-11
    bottom_v2 = 2*bottom_energy/2
    spring_energy = (Q(Fraction(1, 2), "")*Q(250, "N/m")*Q(Fraction(1, 25), "m")**2).to("joule").magnitude
    launch_v2 = (2*Q(spring_energy, "joule")/Q(Fraction(1, 10), "kg")).to("m**2/s**2").magnitude
    newton_units = (Q(10-6, "N")/Q(4, "kg")).to("m/s**2").magnitude
    hooke_units = (Q(mass, "kg")*Q(Fraction(49, 5), "m/s**2")/Q(extension, "m")).to("N/m").magnitude
    result = {
        "C1-E009": [check("accelerazione da risultante", acceleration, 1, "m/s**2"),
                    check("cancellazione Newton/kg", sp.Rational(newton_units), acceleration, "m/s**2"),
                    check("risultante", sp.Integer(10-6), 4, "N")],
        "C1-E010": [check("normale", elevator, sp.Rational(339, 5), "N"),
                    check("peso", 6*sp.Rational(49, 5), sp.Rational(294, 5), "N"),
                    check("risultante verso alto", elevator-6*sp.Rational(49, 5), 9, "N")],
        "C1-E011": [check("normale", sp.Integer(8*10), 80, "N"),
                    check("soglia statica", static_limit, 32, "N"),
                    check("attrito orientato necessario", static_required, -20, "N"),
                    check("margine di adesione", static_limit-abs(static_required), 12, "N"),
                    check("accelerazione effettiva", (20+static_required)/8, 0, "m/s**2")],
        "C1-E012": [check("massa SI", sp.Rational(mass), sp.Rational(3, 20), "kg"),
                    check("allungamento SI", sp.Rational(extension), sp.Rational(3, 100), "m"),
                    check("costante elastica", elastic, 49, "N/m"),
                    check("controllo dimensionale forza/allungamento", sp.Rational(hooke_units), elastic, "N/m"),
                    check("richiamo a un centimetro", elastic/100, sp.Rational(49, 100), "N")],
        "C1-E013": [check("tensione", sp.Integer(120), 120, "N"),
                    check("lavoro sul carico", sp.Rational(work), 180, "J"),
                    check("potenza", sp.Rational(power), 60, "W"),
                    check("lavoro del peso", -sp.Rational(work), -180, "J"),
                    check("controllo T per velocita", 120*sp.Rational(3, 2)/3, 60, "W")],
        "C1-E014": [check("lavoro integrale forza costante", kinetic_f-kinetic_i, 12, "J"),
                    check("energia iniziale", kinetic_i, 1, "J"),
                    check("energia finale", kinetic_f, 13, "J"),
                    check("quadrato rapidita", v2, 13, "m**2/s**2"),
                    check("radice positiva esatta", sp.sqrt(v2), sp.sqrt(13), "m/s"),
                    check("controllo cinematico vi2+2as", 1+2*(sp.Rational(4, 2))*3, v2, "m**2/s**2")],
        "C1-E015": [check("energia gravitazionale", sp.Rational(gravity_energy), 36, "J"),
                    check("energia in fondo", bottom_energy, 25, "J"),
                    check("rapidita in fondo", sp.sqrt(bottom_v2), 5, "m/s"),
                    check("rapidita senza attrito", sp.sqrt(2*sp.Rational(gravity_energy)/2), 6, "m/s")],
        "C1-E016": [check("energia elastica iniziale", sp.Rational(spring_energy), sp.Rational(1, 5), "J"),
                    check("quadrato rapidita finale", sp.Rational(launch_v2), 4, "m**2/s**2"),
                    check("rapidita positiva", sp.sqrt(sp.Rational(launch_v2)), 2, "m/s"),
                    check("controllo kx2/m", 250*sp.Rational(-1, 25)**2/sp.Rational(1, 10), 4, "m**2/s**2")],
    }
    # Approximation in E014 is explicitly secondary to the exact radical.
    if not (sp.Rational(721, 200)**2 < 13 < sp.Rational(723, 200)**2):
        raise ValueError("Manual nearest-hundredth bracket for sqrt(13) failed")
    result["C1-E014"].append({"claim": "approssimazione secondaria 3,61", "independentExact": "sqrt(13)",
        "printedValue": "3.61", "unit": "m/s", "dimension": {"[length]": "1", "[time]": "-1"},
        "relation": "explicit_approximation_nearest_hundredth", "manualBounds": "3.605 < sqrt(13) < 3.615",
        "ok": True})
    return result


MANUAL = {
    "C1-E009": "10-6=4 N; dividere per4 kg da1 m/s2. In verticale N=mg, non serve assegnare g per il risultato orizzontale.",
    "C1-E010": "9,8+1,5=11,3;6*(11+0,3)=66+1,8=67,8 N. Peso6*(10-0,2)=58,8 N, differenza9 N=6*1,5.",
    "C1-E011": "N=8*10=80 N;40/100 di80=32 N. Per quiete f=-20 N e |f|20<32; risultante20-20=0. Coefficiente dinamico non pertinente finche non scorre.",
    "C1-E012": "150g=3/20kg,3cm=3/100m; k=(3/20)*(49/5)/(3/100)=49 N/m. Per1cm49/100=0,49 N.",
    "C1-E013": "T=12*10=120 N;h=3/2m quindi lavoro120*(3/2)=180 J;180/3=60 W. Velocita(3/2)/3=1/2 m/s;120*(1/2)=60 W.",
    "C1-E014": "L=4*3=12 J;Ki=(1/2)*2*1=1 J;Kf=13 J;vf2=2*13/2=13 m2/s2 e vf=+sqrt13 m/s. 9<13<16. Per3,61,721^2=519841<520000<522729=723^2, dividere per40000 da3,605<sqrt13<3,615.",
    "C1-E015": "1,8=9/5;2*10*9/5=36 J;36-11=25 J;vf=sqrt(2*25/2)=sqrt25=5 m/s. Senza perdita sqrt36=6 m/s.",
    "C1-E016": "4cm=1/25m;xi2=1/625m2;250/(1/10)=2500s^-2;2500/625=4m2/s2 e radice positiva2m/s. Energia(1/2)*250/625=1/5J.",
}
ASSUMPTIONS = {
    "C1-E009": "Riferimento inerziale, massa costante, piano orizzontale, fune orizzontale e contatto mantenuto; il blocco gia scorre a destra, quindi l'attrito assegnato e verso sinistra.",
    "C1-E010": "Equazione nel riferimento del suolo approssimato inerziale; la cassa resta a contatto e condivide l'accelerazione verticale data. N e forza, non massa letta in kg; nessuna forza fittizia aggiunta nel riferimento inerziale.",
    "C1-E011": "Scatola inizialmente ferma su piano orizzontale, tiro orizzontale, Coulomb statico adattivo e nessuna altra forza orizzontale; soglia non automaticamente forza effettiva.",
    "C1-E012": "Equilibrio dopo arresto; molla nel tratto lineare di Hooke e allungamento rispetto alla lunghezza naturale, nessun'altra forza verticale sul carico. Costante del modello lineare inferita dal punto di equilibrio.",
    "C1-E013": "Velocita verticale costante, carico puntiforme di massa costante, peso e tensione uniche forze che lavorano; potenza meccanica trasferita al carico, non potenza elettrica o rendimento dell'argano.",
    "C1-E014": "Massa costante, risultante4N costante concorde al moto per3m; velocita non inverte segno. Teorema lavoro-energia della risultante, non di una forza parziale.",
    "C1-E015": "Partenza da fermo; dislivello verticale assegnato, g costante, pista fissa e contatto ideale con normale perpendicolare allo spostamento. Lavoro dissipativo totale gia dato; il blocco raggiunge il fondo come descritto.",
    "C1-E016": "Molla ideale nel regime lineare, guida orizzontale liscia, cursore inizialmente fermo; energia della molla trasferita al cursore alla lunghezza naturale, senza perdite o energia cinetica significativa della molla.",
}
PEDAGOGY = {
    "C1-E009": "Isolamento e due assi coerenti; usare10N da solo darebbe2,5m/s2, mentre attrito opposto riduce la risultante. Accelerazione positiva e velocita iniziale positiva implicano aumento di rapidita.",
    "C1-E010": "Distingue normale, peso, risultante e massa;67,8N>58,8N e differenza9N. Freccia accelerazione esterna non e una terza forza sul corpo.",
    "C1-E011": "Verifica prima fattibilita della quiete. Usare32N come attrito effettivo darebbe falsa risultante-12N; usare coefficiente dinamico darebbe24N ma non e il regime descritto.",
    "C1-E012": "Converte entrambe le unita e isola k da kx=mg; cm non convertiti darebbero errore100. Controllo aggiuntivo a1cm nel medesimo intervallo lineare.",
    "C1-E013": "Lavoro positivo della tensione, negativo del peso e somma zero coerenti con cinetica costante. Energia gravitazionale cresce, potenza meccanica non implica consumo elettrico uguale.",
    "C1-E014": "Conserva energia cinetica iniziale; lavoro12J non e Kf13J. Radice esatta esplicita e accettabile senza calcolatrice;3,61 e approssimazione secondaria corretta, non requisito di inversa numerica.",
    "C1-E015": "Usa quota verticale invece di lunghezza della pista, e somma algebrica36+(-11). Il segno positivo del lavoro d'attrito produrrebbe erroneamente piu energia; benchmark senza attrito6m/s correttamente superiore a5.",
    "C1-E016": "Compressione negativa ma energia quadratica positiva. Si chiede rapidita, quindi radice non negativa; il verso richiede geometria e richiamo, non il segno perso nel quadrato.",
}
FIGURE_REVIEW = {
    "C1-E009": "Quattro forze sul blocco: N alto e mg basso con uguali lunghezze80px; trazione destra e attrito sinistra. Caption dichiara direzioni/versi, non scala metrica:140px e79px non sono dati quantitativi da misurare.",
    "C1-E010": "Normale alta81px, peso basso70px; rapporto qualitativo corretto N>mg, compatibile entro risoluzione con67,8/58,8. Accelerazione esterna alla cassa e verso l'alto; distinta dalle forze.",
    "C1-E015": "Schema di discesa con A alto, B basso e quota h verticale, non lungo il piano; z=0 al livello di B. Il simbolo del blocco sopra la pista e schematico, non una misura aggiuntiva di quota o rotolamento.",
}


def verify(sources, asset_root=None):
    missing = set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError("Missing read C1 examples: "+",".join(sorted(missing)))
    asset_root = Path(asset_root) if asset_root is not None else APP/"static/figures"
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
            path = asset_root/name
            actual = sha(path.read_bytes()) if path.is_file() else "MISSING"
            assets[src] = actual
            if actual != READ_ASSETS[name]:
                errors.append("Historical scientific figure changed or missing")
        checks = models[key]
        if not all(c["ok"] for c in checks):
            errors.append("Independent original-example mathematics failed")
        results.append({"id": key, "sourceSha256": digest(row), "sourceVersion": row.get("version", 1),
            "ok": not errors, "errors": errors, "checks": checks,
            "dimension": {c["claim"]: c["dimension"] for c in checks},
            "calculationScope": "EXACT_MANUAL_CALCULATION", "manualArithmetic": MANUAL[key],
            "manualFeasibility": "PASS_AI_EXACT", "failedPublishedEdition": False,
            "physicalAssumptions": ASSUMPTIONS[key], "pedagogicalReview": PEDAGOGY[key],
            "assetChecksums": assets, "figureReview": FIGURE_REVIEW.get(key, "No figure in this source record"),
            "verificationMode": "INDEPENDENT_EXISTING_EDITION", "originalEditionRetained": True,
            "humanApproval": "NOT_RUN", "publicationAction": "NONE"})
    return results


def report(sources):
    records = verify(sources)
    return {"schemaVersion": "1.0.0", "batch": "examples-c1-activities-004", "records": records,
            "verifierSha256": sha(Path(__file__).read_bytes()), "sourceRef": SOURCE_REF, "sourcePath": SOURCE_PATH,
            "sourceFileSha256": SOURCE_FILE_SHA256,
            "contractSha256": sha(Path(__file__).with_name("review_contract.py").read_bytes()),
            "acceptedCount": sum(r["ok"] for r in records), "failedCount": sum(not r["ok"] for r in records),
            "draftReviewedCount": 0, "failedPublishedEditionIds": [],
            "dependencyVersions": {"sympy": sp.__version__, "pint": pint.__version__},
            "reviewer": "separate_AI_reviewer_not_original_author", "humanApproval": "NOT_RUN", "publicationAction": "NONE"}
