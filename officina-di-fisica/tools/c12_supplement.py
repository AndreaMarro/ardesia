"""Figure che accompagnano i dati delle singole consegne e dei passaggi svolti."""

from c12_figures import (
    plot,
    line,
    path,
    rect,
    txt,
    dot,
    circle,
    axes,
    GREEN,
    RED,
    INK,
    FAINT,
    BLUE,
)


def graph(
    name, title, xLabel, yLabel, xMax, yMax, vertices, xticks, yticks, area=False
):
    x0, y0, dx, dy = 82, 170, 388, 125
    X = lambda x: x0 + dx * x / xMax
    Y = lambda y: y0 - dy * y / yMax
    coords = " ".join(f"{X(x):.3f},{Y(y):.3f}" for x, y in vertices)
    shape = path(
        "M"
        + coords
        + (f" L{X(vertices[-1][0])},{y0} L{X(vertices[0][0])},{y0} Z" if area else ""),
        BLUE if area else "none",
        GREEN,
        3,
    )
    marks = "".join(
        line(X(x), y0 - 4, X(x), y0 + 5, INK, 1) + txt(X(x), y0 + 25, s, a="middle")
        for x, s in xticks
    )
    marks += "".join(
        line(x0 - 4, Y(y), x0 + 5, Y(y), INK, 1) + txt(x0 - 10, Y(y) + 5, s, a="end")
        for y, s in yticks
    )
    plot(
        name,
        title,
        shape,
        line(x0, y0, 523, y0, arrow=True),
        line(x0, y0, x0, 25, arrow=True),
        txt(530, 176, xLabel),
        txt(x0 - 9, 31, yLabel, a="end"),
        marks,
    )


def generate():
    plot(
        "C1-corsie",
        "Spostamento di 30 m a est e 40 m a nord",
        axes(100, 180, 466, 28, "est", "nord"),
        line(100, 180, 199, 180, RED, 3, arrow=True),
        line(199, 180, 199, 48, RED, 3, arrow=True),
        line(100, 180, 196, 51, GREEN, 3, arrow=True),
        line(187, 180, 187, 168, FAINT, 1),
        line(187, 168, 199, 168, FAINT, 1),
        txt(150, 205, "30 m", RED, "middle"),
        txt(211, 120, "40 m", RED),
        txt(250, 54, "arrivo"),
        line(206, 48, 239, 48, FAINT, 1, True),
        txt(38, 201, "partenza"),
    )
    plot(
        "C1-tiro30",
        "Una trazione di 20 N a 30 gradi dall’orizzontale",
        axes(100, 172, 475, 26, "x", "y"),
        line(100, 172, 314.8, 48, GREEN, 3, arrow=True),
        line(314.8, 48, 314.8, 172, FAINT, 1.5, True),
        line(100, 48, 314.8, 48, FAINT, 1.5, True),
        path("M145 172 A45 45 0 0 0 138.97 149.5", col=RED),
        txt(154, 156, "30°", RED),
        txt(323, 53, "20 N", GREEN),
        txt(206, 199, "Fₓ", a="middle"),
        txt(81, 103, "Fᵧ", a="end"),
    )
    plot(
        "C1-bordo",
        "Moto parabolico di una sfera che lascia il piano orizzontalmente",
        path("M63 58 H160 V177", col=INK, w=3),
        line(59, 178, 497, 178, INK, 2),
        path("M160 58 Q282 58 404 178", col=GREEN, w=3),
        dot(160, 58),
        dot(404, 178),
        line(167, 54, 241, 54, GREEN, 2, arrow=True),
        txt(191, 39, "v₀ₓ", GREEN),
        line(109, 62, 109, 174, RED, 2),
        txt(93, 121, "h", RED, "end"),
        txt(142, 201, "bordo"),
        txt(382, 201, "arrivo"),
    )
    plot(
        "C1-ascensore",
        "Forze sulla cassa in un ascensore che accelera verso l’alto",
        rect(161, 92, 90, 61, "#dce5d9"),
        line(100, 155, 337, 155, INK, 3),
        dot(206, 121),
        line(206, 118, 206, 37, GREEN, 3, arrow=True),
        line(206, 122, 206, 192, RED, 3, arrow=True),
        txt(219, 45, "N", GREEN),
        txt(219, 198, "mg", RED),
        line(360, 155, 360, 88, INK, 2, arrow=True),
        txt(374, 122, "a ascensore"),
    )
    plot(
        "C1-aggancio",
        "Carrelli prima del contatto e dopo l’aggancio",
        txt(50, 40, "Prima"),
        rect(123, 43, 85, 40, BLUE),
        rect(367, 43, 59, 40, "#e6c9ac"),
        txt(165, 69, "2 kg", a="middle"),
        txt(396, 69, "1 kg", a="middle"),
        line(212, 64, 276, 64, GREEN, 3, arrow=True),
        line(363, 64, 341, 64, RED, 3, arrow=True),
        txt(240, 44, "+3 m/s", GREEN, "middle"),
        txt(343, 39, "−1 m/s", RED, "middle"),
        line(70, 88, 478, 88, FAINT),
        txt(50, 143, "Dopo"),
        rect(230, 135, 85, 40, BLUE),
        rect(315, 135, 59, 40, "#e6c9ac"),
        txt(303, 203, "un’unica velocità", a="middle"),
        line(70, 180, 478, 180, FAINT),
    )
    plot(
        "C1-cdm",
        "Due masse poste ai lati dell’origine",
        line(75, 129, 503, 129, arrow=True),
        txt(515, 134, "x (m)"),
        circle(146, 108, 19, "#d8e5ce"),
        circle(426, 113, 13, "#e6c9ac"),
        txt(146, 77, "3 kg", a="middle"),
        txt(426, 87, "1 kg", a="middle"),
        "".join(
            line(x, 124, x, 135) + txt(x, 158, s, a="middle")
            for x, s in [(146, "−0,20"), (216, "0"), (426, "+0,60")]
        ),
    )
    plot(
        "C1-vneg",
        "Velocità negativa che cresce verso lo zero",
        line(86, 49, 505, 49, arrow=True),
        line(86, 181, 86, 22, arrow=True),
        txt(515, 56, "t (s)"),
        txt(69, 33, "v (m/s)", a="end"),
        txt(75, 55, "0", a="end"),
        line(94, 158, 444, 80, GREEN, 3),
        line(86, 157, 94, 157, FAINT, 1, True),
        txt(74, 163, "−6", a="end"),
        line(86, 80, 444, 80, FAINT, 1, True),
        txt(74, 86, "−2", a="end"),
    )
    plot(
        "C1-aree",
        "Due tratti di velocità con segni opposti",
        rect(82, 44, 160, 72, BLUE, col=GREEN),
        rect(242, 116, 200, 48, "#ecd6c5", col=RED),
        line(82, 116, 505, 116, arrow=True),
        line(82, 187, 82, 26, arrow=True),
        txt(519, 122, "t (s)"),
        txt(74, 29, "v (m/s)", a="end"),
        txt(72, 49, "+3", a="end"),
        txt(71, 169, "−2", a="end"),
        txt(74, 122, "0", a="end"),
        txt(240, 192, "4", a="middle"),
        txt(443, 192, "9", a="middle"),
        line(242, 168, 242, 174, FAINT),
        line(442, 168, 442, 174, FAINT),
    )
    plot(
        "C1-fermi",
        "Due rette orizzontali in grafici con ordinate diverse",
        axes(69, 162, 255, 39, "t", "x"),
        axes(337, 162, 518, 39, "t", "v"),
        line(78, 81, 228, 81, GREEN, 3),
        line(347, 81, 495, 81, GREEN, 3),
        txt(153, 200, "posizione–tempo", a="middle"),
        txt(428, 200, "velocità–tempo", a="middle"),
    )
    graph(
        "C1-hooke",
        "Modulo del richiamo in funzione dell’allungamento",
        "x",
        "|F|",
        1,
        1,
        [(0, 0), (1, 1)],
        [(0, "0")],
        [],
    )
    graph(
        "C1-trapezio",
        "Forza concorde nello spostamento su 0,40 m",
        "x (m)",
        "F (N)",
        0.4,
        10,
        [(0, 2), (0.4, 10)],
        [(0, "0"), (0.4, "0,40")],
        [(2, "2"), (10, "10")],
        True,
    )
    graph(
        "C1-p-tempo",
        "Quantità di moto orizzontale a crescita lineare",
        "t",
        "pₓ",
        1,
        1,
        [(0, 0), (1, 1)],
        [(0, "0")],
        [],
    )
    plot(
        "C2-membrana",
        "Due camere a pressione uniforme separate da una membrana",
        rect(82, 63, 376, 99, "#e6eadb"),
        rect(270, 65, 186, 95, "#d1e1d8", col="#d1e1d8"),
        line(269, 62, 269, 162, INK, 5),
        txt(173, 96, "104 kPa", a="middle"),
        txt(365, 96, "100 kPa", a="middle"),
        line(170, 126, 247, 126, GREEN, 2.3, arrow=True),
        line(361, 126, 290, 126, RED, 2.3, arrow=True),
        txt(269, 197, "membrana · A = 6,0 cm²", a="middle"),
    )
    plot(
        "C2-strati",
        "Dieci centimetri di olio galleggiano sopra venticinque centimetri d’acqua",
        path("M111 32 V182 H376 V32", col=INK, w=4),
        rect(114, 41, 259, 40, "#e5c79c", col="#ac8552"),
        rect(114, 81, 259, 98, BLUE, col=GREEN),
        txt(178, 68, "olio"),
        txt(178, 137, "acqua"),
        line(393, 41, 393, 81, RED, 2),
        line(393, 81, 393, 179, GREEN, 2),
        txt(403, 67, "10 cm", RED),
        txt(403, 134, "25 cm", GREEN),
    )
    plot(
        "C2-rettangolo",
        "Pressione relativa su uno sportello verticale",
        rect(105, 48, 145, 121, BLUE, col=GREEN),
        line(250, 47, 250, 171, INK, 4),
        "".join(
            line(251, y, 251 + (y - 48) * 0.63, y, GREEN, 2, arrow=True)
            for y in [69, 94, 120, 146, 168]
        ),
        txt(105, 36, "superficie libera"),
        txt(325, 63, "aria esterna"),
        txt(325, 156, "h = 0,20 m"),
        txt(113, 201, "larghezza dello sportello 0,40 m"),
    )
    plot(
        "C2-dirama",
        "Un ingresso si divide in quattro canali",
        line(57, 111, 210, 111, GREEN, 7),
        "".join(
            path(f"M210 111 Q255 111 277 {y} H424", col=GREEN, w=5)
            for y in [44, 87, 136, 178]
        ),
        txt(72, 90, "ingresso"),
        txt(442, 48, "Q₁"),
        txt(442, 91, "Q₂"),
        txt(442, 139, "Q₃"),
        txt(442, 182, "Q₄"),
    )
    plot(
        "C2-efflusso",
        "Efflusso da una piccola apertura sotto il livello libero",
        rect(82, 51, 172, 133, BLUE, col=GREEN),
        path("M80 29 V186 H256 V165 M256 157 V29", col=INK, w=4),
        line(258, 161, 331, 161, GREEN, 3, arrow=True),
        txt(337, 167, "uscita"),
        line(134, 54, 134, 160, RED, 2),
        txt(148, 117, "h", RED),
        txt(87, 31, "superficie libera"),
        line(146, 160, 253, 160, FAINT, 1, True),
    )
    plot(
        "C2-piastre",
        "Flusso di Couette fra una lastra mobile e una fissa",
        rect(91, 61, 340, 97, BLUE, col=BLUE),
        line(87, 60, 439, 60, INK, 5),
        line(87, 161, 439, 161, INK, 5),
        line(188, 42, 277, 42, RED, 2.5, arrow=True),
        txt(291, 47, "lastra mobile", RED),
        txt(275, 190, "lastra fissa"),
        "".join(
            line(159, y, 159 + 0.92 * (161 - y), y, GREEN, 2, arrow=True)
            for y in [71, 91, 113, 139]
        ),
        line(458, 62, 458, 159, FAINT, 2),
        txt(469, 118, "d"),
    )
    plot(
        "C2-gocce",
        "Una goccia con un’interfaccia e un film sferico con due interfacce",
        circle(154, 104, 56, BLUE, GREEN),
        circle(405, 104, 58, BLUE, GREEN),
        circle(405, 104, 50, "#f8f6eb", GREEN),
        txt(154, 111, "liquido", a="middle"),
        txt(405, 111, "aria", a="middle"),
        txt(154, 192, "goccia", a="middle"),
        txt(405, 192, "film · spessore ampliato", a="middle"),
    )
    plot(
        "C2-nodi",
        "Rami idraulici uniti ai nodi A e B",
        line(58, 111, 139, 111, GREEN, 4),
        line(417, 111, 509, 111, GREEN, 4),
        path("M139 111 V64 H417 V111 M139 111 V158 H417 V111", col=GREEN, w=4),
        rect(239, 52, 77, 24, "#f8f6eb"),
        rect(239, 146, 77, 24, "#f8f6eb"),
        txt(277, 70, "R₁", a="middle"),
        txt(277, 164, "R₂", a="middle"),
        dot(139, 111),
        dot(417, 111),
        txt(128, 97, "A", a="end"),
        txt(427, 97, "B"),
    )
    graph(
        "C2-mv",
        "Massa del solo liquido in funzione del volume dosato",
        "V",
        "m",
        1,
        1,
        [(0, 0), (1, 1)],
        [(0, "0")],
        [],
    )
    graph(
        "C2-ph",
        "Incremento di pressione in funzione della profondità",
        "h (m)",
        "Δp (kPa)",
        0.5,
        4.5,
        [(0, 0), (0.5, 4.5)],
        [(0, "0"), (0.5, "0,50")],
        [(4.5, "4,5")],
    )
    graph(
        "C2-dpq",
        "Caduta di pressione in funzione della portata",
        "Q",
        "Δp",
        1,
        1,
        [(0, 0), (1, 1)],
        [(0, "0")],
        [],
    )


def enrich(c):
    fig = lambda name, caption: dict(
        type="figure", src="/figures/" + name + ".svg", text=caption
    )
    examples = {
        "C1-E003": (
            "C1-corsie",
            "Le due frecce rosse seguono le corsie. La freccia verde collega direttamente i due estremi.",
        ),
        "C1-E004": (
            "C1-tiro30",
            "I 30° sono misurati fra asse positivo orizzontale e forza. Le proiezioni tratteggiate sono linee di costruzione.",
        ),
        "C1-E007": (
            "C1-bordo",
            "Al bordo la velocità è orizzontale. Il dislivello h determina quanto tempo la sfera resta in volo.",
        ),
        "C1-E010": (
            "C1-ascensore",
            "La freccia esterna al corpo indica l’accelerazione del riferimento dell’ascensore rispetto al suolo. Le frecce sul corpo sono le forze.",
        ),
        "C1-E018": (
            "C1-aggancio",
            "Nel primo disegno i carrelli convergono. Nel secondo i due corpi sono vincolati a muoversi insieme.",
        ),
        "C1-E020": (
            "C1-cdm",
            "I due pesi hanno bracci diversi rispetto all’origine. Le posizioni sull’asse conservano il loro segno.",
        ),
        "C2-E002": (
            "C2-membrana",
            "Le due camere spingono su facce opposte della stessa area. Le frecce indicano i versi delle spinte.",
        ),
        "C2-E004": (
            "C2-strati",
            "Procedi dalla superficie al fondo. Il percorso attraversa prima l’olio e poi l’acqua.",
        ),
        "C2-E010": (
            "C2-dirama",
            "Il contorno della biforcazione riceve Q in ingresso e la ripartisce fra quattro sezioni di uscita uguali.",
        ),
        "C2-E012": (
            "C2-efflusso",
            "I due punti a pressione atmosferica sono la superficie libera e il getto appena fuori dal foro.",
        ),
        "C2-E013": (
            "C2-piastre",
            "Il gradiente delle velocità attraversa lo spessore d in direzione perpendicolare alle piastre.",
        ),
        "C2-E020": (
            "C2-gocce",
            "Conta le interfacce attraversate dal centro della sfera verso l’esterno. Il film della bolla è ingrandito per distinguerne le facce.",
        ),
    }
    prompts = {
        "C1-Q023": (
            "C1-vneg",
            "Grafico v–t. La retta sale da una velocità negativa verso valori meno negativi, rimanendo sotto l’asse del tempo.",
        ),
        "C1-Q027": (
            "C1-aree",
            "Per i primi 4 s la velocità è +3 m/s. Dal quarto al nono secondo è −2 m/s.",
        ),
        "C1-Q028": (
            "C1-fermi",
            "Il primo grafico riporta posizione e tempo; il secondo riporta velocità e tempo. Le linee colorate sono entrambe orizzontali.",
        ),
        "C1-Q057": (
            "C1-hooke",
            "Il modulo della forza è sull’asse verticale e l’allungamento sull’asse orizzontale.",
        ),
        "C1-Q064": (
            "C1-trapezio",
            "Il grafico riporta F in newton e x in metri. L’intervallo va da x = 0 a x = 0,40 m.",
        ),
        "C1-Q090": (
            "C1-p-tempo",
            "La componente pₓ parte da zero e cresce linearmente con il tempo.",
        ),
        "C2-Q008": (
            "C2-mv",
            "La massa riportata sull’asse verticale è già al netto della tara.",
        ),
        "C2-Q015": (
            "C2-rettangolo",
            "Lo sportello ha il bordo superiore alla superficie libera; lo schema rappresenta i versi delle spinte nette.",
        ),
        "C2-Q019": (
            "C2-ph",
            "La lettura di incremento di pressione è zero in superficie e 4,5 kPa a 0,50 m di profondità.",
        ),
        "C2-Q022": (
            "C2-pressa",
            "I due pistoni sono alla stessa quota. Le loro dimensioni nel disegno sono schematiche.",
        ),
        "C2-Q051": (
            "C2-condotto",
            "Il liquido passa dalla sezione larga a quella stretta. Il tubo è orizzontale.",
        ),
        "C2-Q067": (
            "C2-profilo",
            "Le lunghezze delle frecce verdi rappresentano la velocità locale a distanze diverse dall’asse.",
        ),
        "C2-Q068": (
            "C2-profilo",
            "Il bordo del tubo corrisponde a r = R e l’asse a r = 0.",
        ),
        "C2-Q073": (
            "C2-dpq",
            "L’asse verticale riporta la differenza di pressione ai capi del tubo.",
        ),
        "C2-Q083": (
            "C2-nodi",
            "Le due resistenze collegano i nodi A e B. Immagina di interrompere il ramo inferiore.",
        ),
        "C2-Q084": (
            "C2-nodi",
            "Entrambe le vie sono inizialmente aperte. In questo problema R₁ e R₂ sono uguali.",
        ),
        "C2-Q086": (
            "C2-nodi",
            "Gli estremi a sinistra appartengono al nodo A e quelli a destra al nodo B.",
        ),
        "C2-Q090": (
            "C2-nodi",
            "Un ramo ha raggio r e l’altro 2r; entrambi collegano la stessa coppia di nodi.",
        ),
    }
    for row in c.rows:
        key = row["id"]
        if key in examples:
            new = fig(*examples[key])
            if key in ["C1-E003", "C1-E004"]:
                index = next(
                    i for i, b in enumerate(row["blocks"]) if b["type"] == "figure"
                )
                row["blocks"][index] = new
            else:
                row["blocks"].insert(0, new)
        if key in prompts:
            row["promptBlocks"] = [fig(*prompts[key])]
        if key == "C2-Q086":
            row["prompt"] = (
                "Osserva i collegamenti nello schema: ciascuno dei due condotti parte dal nodo A e arriva al nodo B. Come sono collegati?"
            )
        if key in {"C1-Q044", "C1-Q051", "C1-Q052", "C1-Q058"}:
            row["error"]["target"] = "lab:C1"
        if key in {"C2-Q062", "C2-Q067", "C2-Q071", "C2-Q072", "C2-Q074", "C2-Q080"}:
            row["error"]["target"] = "lab:C2"
