"""Tavole delle consegne. Nessun risultato o passaggio risolutivo è incorporato nelle figure."""

from c34_figures import *
from c34_base import fig


def graph(name, heading, description, xlab, ylab, xs, ys, series):
    left, right, top, bot = 103, 507, 48, 191
    xmax = max(x[0] for x in xs) * 1.07
    ymax = max(y[0] for y in ys) * 1.10
    X = lambda x: left + (right - left) * x / xmax
    Y = lambda y: bot - (bot - top) * y / ymax
    parts = [
        title(319, heading),
        arrow(left, bot, right + 13, bot, ink, 1.7),
        arrow(left, bot, left, top - 9, ink, 1.7),
        label(537, bot + 6, xlab, ink, 16, "start"),
        label(left - 9, top - 15, ylab, ink, 16, "end"),
    ]
    for x, t in xs:
        parts.extend(
            [
                line(X(x), bot, X(x), bot + 5, guide, 1.2),
                label(X(x), bot + 24, t, ink, 15),
            ]
        )
    for y, t in ys:
        if y > 0:
            parts.extend(
                [
                    line(left - 5, Y(y), left, Y(y), guide, 1.2),
                    label(left - 10, Y(y) + 5, t, ink, 15, "end"),
                    line(left + 1, Y(y), right, Y(y), guide, 0.8, "2 6"),
                ]
            )
    for vertices, c, n, arrowed in series:
        coords = [(X(x), Y(y)) for x, y in vertices]
        parts.append(curve(coords, c, 3))
        if arrowed:
            for (x, y), (X2, Y2) in zip(coords, coords[1:]):
                parts.append(
                    arrow(
                        x + 0.34 * (X2 - x),
                        y + 0.34 * (Y2 - y),
                        x + 0.58 * (X2 - x),
                        y + 0.58 * (Y2 - y),
                        c,
                        2.2,
                    )
                )
        if n:
            x, y = coords[-1]
            parts.append(label(x + 12, y + 2, n, c, 17, "start"))
    save(name, heading, description, *parts)


graph(
    "C3-prova-rette",
    "Due campioni, la stessa potenza",
    "Due curve lineari partono dalla stessa temperatura; A sale più rapidamente di B.",
    "t",
    "T",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [
        ([(0, 0.18), (0.81, 0.95)], red, "A", False),
        ([(0, 0.18), (0.81, 0.55)], teal, "B", False),
    ],
)
graph(
    "C3-prova-pT",
    "Due prove a volume bloccato",
    "Su assi T e p assoluti, due rette partono dall’origine con diverse pendenze. Le rette sono anonime.",
    "T (K)",
    "p",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [
        ([(0, 0), (0.83, 0.93)], teal, "", False),
        ([(0, 0), (0.83, 0.465)], red, "", False),
    ],
)
graph(
    "C3-prova-fusione",
    "La temperatura registrata",
    "Due segmenti inclinati sono collegati da un tratto orizzontale.",
    "Q",
    "T",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [([(0, 0.08), (0.26, 0.52), (0.67, 0.52), (0.95, 0.89)], teal, "", False)],
)
graph(
    "C3-prova-plateau",
    "Il plateau nella registrazione",
    "La temperatura è costante fra il secondo 50 e il secondo 200. L’asse orizzontale misura il tempo in secondi.",
    "t (s)",
    "T",
    [(0, "0"), (50, "50"), (125, "125"), (200, "200"), (250, "250")],
    [(0, ""), (1, "")],
    [([(0, 0.1), (50, 0.55), (200, 0.55), (250, 0.9)], teal, "", False)],
)
graph(
    "C3-prova-trapezio",
    "Il percorso fra due stati",
    "Il tratto rettilineo parte da 1 L, 200 kPa e arriva a 4 L, 100 kPa. Le frecce vanno verso destra.",
    "V (L)",
    "p (kPa)",
    [(0, "0"), (1, "1"), (2, "2"), (3, "3"), (4, "4")],
    [(0, ""), (100, "100"), (200, "200")],
    [([(1, 200), (4, 100)], red, "", True)],
)
graph(
    "C3-prova-cammini",
    "Due cammini tra gli stessi stati",
    "Due percorsi collegano i medesimi punti con forme differenti nel piano p–V.",
    "V",
    "p",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [
        ([(0.17, 0.84), (0.83, 0.84), (0.83, 0.40)], teal, "", True),
        ([(0.17, 0.84), (0.17, 0.4), (0.83, 0.4)], red, "", True),
    ],
)
graph(
    "C3-prova-verticale",
    "Sequenza di stati osservata",
    "La freccia punta verso l’alto lungo un segmento verticale. Gli assi sono volume e pressione.",
    "V",
    "p",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [([(0.5, 0.2), (0.5, 0.9)], teal, "", True)],
)
graph(
    "C3-prova-orizzontale",
    "Il pistone si muove",
    "La freccia punta verso destra lungo un segmento orizzontale nel piano p–V.",
    "V",
    "p",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [([(0.18, 0.62), (0.88, 0.62)], teal, "", True)],
)
graph(
    "C3-prova-triangolo",
    "Il ciclo misurato",
    "Il ciclo orario va da 1 L e 160 kPa a 5 L e 100 kPa, quindi a 1 L e 100 kPa, e infine al punto iniziale.",
    "V (L)",
    "p (kPa)",
    [(0, "0"), (1, "1"), (3, "3"), (5, "5")],
    [(0, ""), (100, "100"), (160, "160")],
    [([(1, 160), (5, 100), (1, 100), (1, 160)], teal, "", True)],
)
graph(
    "C3-prova-ciclo",
    "Un percorso chiuso fra quattro stati",
    "Un percorso da pressione alta in espansione e pressione bassa in compressione; le frecce mostrano il verso.",
    "V",
    "p",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [
        (
            [(0.20, 0.85), (0.86, 0.85), (0.86, 0.3), (0.2, 0.3), (0.2, 0.85)],
            teal,
            "",
            True,
        )
    ],
)
save(
    "C3-prova-scambi",
    "Due componenti a contatto",
    "Due corpi inizialmente a temperature diverse sono racchiusi in un recipiente isolato.",
    title(320, "Il sistema considerato"),
    rect(88, 64, 461, 101, paper, ink, 3, 8),
    rect(102, 77, 209, 76, "#f2d8c7", "none", 0),
    rect(319, 77, 216, 76, blue, "none", 0),
    label(207, 121, "campione", red, 20),
    label(428, 121, "acqua", teal, 20),
    label(320, 201, "recipiente isolato", ink, 17),
)
save(
    "C4-prova-campo",
    "Un punto fra le armature",
    "Le piastre positive e negative creano un campo uniforme verso destra. Una carica di prova negativa è posta vicino al centro. Non sono disegnate forze.",
    plates,
    array(arrow(117, y, 513, y, teal, 2) for y in (72, 119, 163)),
    dot(316, 119, 15, paper, ink),
    label(316, 125, "−", ink, 20),
    label(317, 218, "linee del campo esterno", ink, 17),
)
save(
    "C4-prova-campo-nullo",
    "Due sorgenti sulla stessa retta",
    "Due cariche positive +q e +4q sono distanti 30 cm. P è un candidato punto intermedio, a distanza x dalla prima.",
    title(320, "Punto di osservazione fra le sorgenti"),
    line(116, 109, 521, 109, guide, 1.5, "4 5"),
    dot(116, 109, 14, "#f2d8c7", red),
    dot(521, 109, 14, "#f2d8c7", red),
    dot(281, 109, 4, ink),
    label(116, 81, "+q"),
    label(521, 81, "+4q"),
    label(281, 85, "P"),
    line(116, 146, 281, 146, ink, 1.4),
    line(116, 138, 116, 155, ink, 1.4),
    line(281, 138, 281, 155, ink, 1.4),
    label(198, 171, "x"),
    line(116, 192, 521, 192, ink, 1.4),
    line(116, 185, 116, 200, ink, 1.4),
    line(521, 185, 521, 200, ink, 1.4),
    label(320, 222, "30 cm"),
)
save(
    "C4-prova-proiettile",
    "Ingresso nel campo",
    "Una carica positiva entra da sinistra con velocità iniziale orizzontale. Il campo e l’accelerazione sono verticali verso l’alto. La traiettoria è da determinare.",
    title(320, "La regione attiva"),
    rect(181, 62, 348, 125, pale, "none", 0),
    array(arrow(x, 166, x, 86, teal, 2) for x in (229, 307, 385, 462)),
    dot(177, 154, 10, paper, red),
    label(177, 159, "+", red, 15),
    arrow(95, 154, 162, 154, ink, 3),
    label(120, 137, "vₓ"),
    label(484, 102, "E", teal, 17),
    line(180, 201, 526, 201, guide, 1.2),
    line(180, 196, 180, 207, guide, 1.2),
    line(526, 196, 526, 207, guide, 1.2),
    label(351, 228, "0,80 m"),
)
save(
    "C4-prova-componenti",
    "I contributi al campo in P",
    "Due frecce perpendicolari partono da P. Il contributo verso est misura 300 N/C, quello verso nord 400 N/C.",
    dot(248, 169, 4),
    arrow(248, 169, 392, 169, red),
    arrow(248, 169, 248, 42, teal),
    label(235, 190, "P"),
    label(346, 194, "300 N/C · est", red, 17),
    label(265, 57, "400 N/C · nord", teal, 17, "start"),
)
save(
    "C4-prova-dipolo",
    "Sorgenti uguali e opposte",
    "La sorgente +q e la sorgente −q sono equidistanti dal punto P. Nessuna freccia di campo è disegnata.",
    title(320, "Il punto medio P"),
    line(119, 120, 523, 120, guide, 1.7, "5 5"),
    dot(119, 120, 20, "#f2d8c7", red),
    dot(523, 120, 20, blue, teal),
    label(119, 127, "+", red, 24),
    label(523, 127, "−", teal, 24),
    dot(321, 120, 5),
    label(321, 100, "P"),
    label(221, 152, "r"),
    label(422, 152, "r"),
    label(120, 177, "+q", red),
    label(522, 177, "−q", teal),
)
save(
    "C4-prova-equipot",
    "Potenziale a intervalli uguali",
    "Su due mappe compaiono le stesse quattro equipotenziali. Le distanze sono minori nel primo gruppo.",
    title(168, "Regione A"),
    title(474, "Regione B"),
    array(
        line(x, 67, x, 161, teal, 2, "5 4") + label(x, 182, str(v) + " V", ink, 13)
        for x, v in zip((96, 142, 188, 234), (12, 9, 6, 3))
    ),
    array(
        line(x, 67, x, 161, teal, 2, "5 4") + label(x, 182, str(v) + " V", ink, 13)
        for x, v in zip((348, 430, 512, 594), (12, 9, 6, 3))
    ),
    label(320, 223, "Mappe disegnate alla stessa scala", ink, 16),
)
graph(
    "C4-prova-crono",
    "Corrente attraverso la sezione",
    "La corrente resta a 3 mA fino a 4 s e passa a 1 mA fino a 10 s.",
    "t (s)",
    "I (mA)",
    [(0, "0"), (4, "4"), (10, "10")],
    [(0, ""), (1, "1"), (3, "3")],
    [([(0, 3), (4, 3), (4, 1), (10, 1)], teal, "", False)],
)
graph(
    "C4-prova-IV",
    "Due resistori alla stessa temperatura",
    "Due rette di pendenze differenti passano per l’origine. L’asse verticale riporta corrente, quello orizzontale tensione.",
    "V",
    "I",
    [(0, "0"), (1, "")],
    [(0, ""), (1, "")],
    [
        ([(0, 0), (0.85, 0.95)], teal, "A", False),
        ([(0, 0), (0.85, 0.45)], red, "B", False),
    ],
)


def branch(kind, location):
    x, y = location
    return resistor(x - 24, y, 48) if kind == "R" else cap(x, y)


def parallel_simple(n, kind="R", serial=False, switch=False):
    R = kind == "R"
    h = 24 if R else 4
    ys = [81, 168] if n == 2 else [60, 115, 170]
    left, right, ctr = (240, 460, 349) if serial else (176, 475, 324)
    parts = [
        line(left, ys[0], left, ys[-1]),
        line(right, ys[0], right, ys[-1]),
        line(right, 116, 568, 116),
        dot(568, 116),
        label(567, 147, "B"),
    ]
    if serial:
        parts += [
            line(71, 116, 148 - h, 116),
            branch(kind, (148, 116)),
            line(148 + h, 116, left, 116),
            label(148, 90, kind + "₃", ink, 17),
        ]
    else:
        parts.append(line(71, 116, left, 116))
    parts += [dot(71, 116), label(71, 147, "A"), dot(left, 116, 3), dot(right, 116, 3)]
    for i, y in enumerate(ys):
        parts += [
            line(left, y, ctr - h, y),
            branch(kind, (ctr, y)),
            label(
                ctr + (40 if n == 3 else 0),
                y - (11 if n == 3 else 22),
                kind + ("₁", "₂", "₃")[i],
                ink,
                17,
            ),
        ]
        if switch and i == 1:
            parts.extend(
                [
                    line(ctr + h, y, 395, y),
                    dot(395, y, 3),
                    line(395, y, 419, y - 12),
                    dot(425, y, 3),
                    line(425, y, right, y),
                ]
            )
        else:
            parts.append(line(ctr + h, y, right, y))
    return array(parts)


save(
    "C4-prova-Rmista",
    "Resistori e nodi",
    "Un resistore in serie con un parallelo di due rami, fra A e B.",
    title(320, "Collegamenti fra i morsetti A e B"),
    parallel_simple(2, serial=True),
    label(320, 222, "R₁ = 30 Ω    R₂ = 60 Ω    R₃ = 10 Ω", ink, 17),
)
save(
    "C4-prova-Rpar",
    "Due rami fra A e B",
    "Fra i morsetti A e B si possono seguire due percorsi distinti, ciascuno con un resistore.",
    title(320, "Morsetti e collegamenti"),
    parallel_simple(2),
    label(320, 219, "Ogni tratto continuo rappresenta un filo ideale.", ink, 15),
)
save(
    "C4-prova-switch",
    "Un ramo con interruttore",
    "Due resistori fra A e B, con interruttore aperto sul secondo ramo. Il generatore mantiene la tensione ai morsetti.",
    title(320, "Il circuito dopo l’apertura"),
    parallel_simple(2, switch=True),
    label(320, 222, "A e B restano collegati al generatore ideale.", ink, 16),
)
save(
    "C4-prova-serie",
    "Un tratto senza diramazioni",
    "Tra i morsetti A e B sono connessi due resistori in serie, con il nodo intermedio M.",
    title(320, "I tre nodi del partitore"),
    line(81, 123, 176, 123),
    resistor(176, 123, 60),
    line(236, 123, 390, 123),
    resistor(390, 123, 60),
    line(450, 123, 551, 123),
    dot(81, 123),
    dot(311, 123),
    dot(551, 123),
    label(81, 154, "A"),
    label(311, 154, "M"),
    label(551, 154, "B"),
    label(206, 96, "R₁"),
    label(417, 96, "R₂"),
)
save(
    "C4-prova-Ctre",
    "Tre condensatori fra due morsetti",
    "Tre distinti condensatori sono ciascuno collegati da un lato ad A e dall’altro a B.",
    title(320, "Tre elementi collegati"),
    parallel_simple(3, "C"),
)
save(
    "C4-prova-Cmista",
    "Rete composta di condensatori",
    "Fra A e B un condensatore è in serie con un gruppo formato da altri due in parallelo.",
    title(320, "Seguire i nodi"),
    parallel_simple(2, "C", serial=True),
    label(320, 225, "C₁ = 3 μF    C₂ = 6 μF    C₃ = 9 μF", ink, 17),
)
save(
    "C4-prova-Bneg",
    "Ingresso in campo magnetico",
    "Una particella negativa si muove verso destra e il campo magnetico entra nel foglio. La forza è da determinare.",
    title(320, "Vista frontale"),
    array(
        field(x, y, 5)
        for x in (140, 185, 230, 275, 320, 365, 410, 455, 500)
        for y in (72, 111, 150, 189)
    ),
    dot(255, 133, 15, paper, red),
    label(255, 139, "−", red, 20),
    arrow(274, 133, 362, 133, ink, 3),
    label(388, 137, "v"),
    label(320, 228, "×   B entrante", teal, 16),
)
save(
    "C4-prova-obliquo",
    "Un filo obliquo rispetto al campo",
    "La direzione della corrente nel filo forma un angolo di 30 gradi con un campo magnetico orientato verso destra.",
    title(320, "Segmento percorso da corrente"),
    array(arrow(100, y, 536, y, teal, 1.8) for y in (59, 104, 140)),
    line(198, 179, 394, 66, ink, 4),
    arrow(276, 134, 338, 98, ink, 2),
    label(361, 73, "I"),
    label(531, 59, "B", teal),
    line(198, 179, 305, 179, guide, 1.4, "4 5"),
    path("M251 179 A53 53 0 0 0 244 152", red, 1.7),
    label(266, 168, "30°", red, 16),
)
graph(
    "C4-prova-flussot",
    "Flusso concatenato con la spira",
    "Il flusso sale linearmente da zero a 8 mWb nei primi 4 ms e rimane a 8 mWb da 4 a 8 ms.",
    "t (ms)",
    "Φ (mWb)",
    [(0, "0"), (4, "4"), (8, "8")],
    [(0, ""), (4, "4"), (8, "8")],
    [([(0, 0), (4, 8), (8, 8)], teal, "", False)],
)

LINKS = {
    "C3": {
        "prova-pT": (
            [19],
            "Due pendenze nello stesso sistema di assi. I volumi delle due prove sono da associare.",
        ),
        "prova-rette": (
            [22],
            "Le due rette riportano i dati dei campioni A e B a uguale potenza fornita.",
        ),
        "prova-scambi": (
            [25],
            "Il campione e l’acqua sono inclusi nel sistema isolato.",
        ),
        "prova-fusione": (
            [32],
            "Il tratto a temperatura costante è compreso fra due tratti inclinati.",
        ),
        "prova-plateau": (
            [36],
            "Il grafico riporta l’intervallo temporale della fusione.",
        ),
        "prova-trapezio": (
            [55],
            "I due stati sono uniti dal segmento rettilineo registrato durante l’espansione.",
        ),
        "prova-cammini": (
            [56],
            "Gli estremi coincidono e i due percorsi passano per stati intermedi diversi.",
        ),
        "prova-verticale": ([61], "Segui la freccia dello stato nel piano p–V."),
        "prova-orizzontale": ([63], "Segui la sequenza di punti sul diagramma."),
        "percorsi": (
            [68],
            "I due percorsi curvi partono da A. Confrontali fino allo stesso volume di arrivo.",
        ),
        "prova-triangolo": (
            [71],
            "Il grafico indica le coordinate degli stati e l’ordine dei passaggi.",
        ),
        "prova-ciclo": (
            [72, 77, 78],
            "Le frecce mostrano il verso di percorrenza del ciclo. Le grandezze sono riportate nel testo.",
        ),
    },
    "C4": {
        "prova-campo": (
            [11, 19],
            "Lo schema fissa il verso del campo e mostra la carica di prova negativa.",
        ),
        "prova-campo-nullo": (
            [14],
            "La posizione di P è incognita; il disegno è schematico.",
        ),
        "prova-proiettile": (
            [16],
            "È illustrato il caso di una prova positiva nel campo diretto in alto. L’asse x cresce verso destra, y verso l’alto.",
        ),
        "prova-componenti": ([18], "Le due frecce indicano i singoli contributi in P."),
        "potenziale": (
            [22],
            "Puoi seguire una singola linea verticale equipotenziale.",
        ),
        "prova-dipolo": ([25], "Le due distanze da P sono uguali."),
        "prova-equipot": ([29], "Le due regioni hanno la stessa scala spaziale."),
        "prova-crono": (
            [41],
            "Il tracciato riporta intensità e durata di ciascun intervallo.",
        ),
        "prova-IV": ([45], "La corrente è in ordinata e la tensione in ascissa."),
        "prova-Rmista": ([51], "A e B sono i morsetti del generatore."),
        "prova-Rpar": (
            [52, 55, 59],
            "Segui i fili tra A e B prima di scegliere il modello.",
        ),
        "prova-switch": ([56], "L’interruttore è disegnato dopo l’apertura."),
        "prova-serie": ([58], "Il punto M è il collegamento fra i due resistori."),
        "prova-Ctre": ([71], "Sono disegnati i due nodi A e B dei tre condensatori."),
        "prova-Cmista": (
            [76],
            "Le etichette identificano i tre elementi del circuito.",
        ),
        "prova-Bneg": (
            [85],
            "Le croci indicano la direzione del campo; la freccia indica la velocità.",
        ),
        "prova-obliquo": (
            [84],
            "L’angolo è misurato fra la direzione di corrente e il campo.",
        ),
        "prova-flussot": (
            [100],
            "Gli estremi dei due intervalli sono segnati sull’asse dei tempi.",
        ),
    },
}


def attach(rows):
    index = {r["id"]: r for r in rows}
    for course, entries in LINKS.items():
        for suffix, (numbers, caption) in entries.items():
            for n in numbers:
                record = index[f"{course}-Q{n:03d}"]
                record["promptBlocks"] = [fig(f"{course}-{suffix}", caption)]
