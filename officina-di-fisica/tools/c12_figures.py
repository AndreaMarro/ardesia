"""Tavole vettoriali originali. Coordinate in uno spazio di 580 × 226 punti."""

import math
from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / "static" / "figures"
INK = "#25382f"
GREEN = "#176b53"
RED = "#ac442e"
FAINT = "#7a8980"
BLUE = "#c8e3db"


def line(x1, y1, x2, y2, col=INK, w=2, dash=False, arrow=False):
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{w}"'
        + (' stroke-dasharray="5 5"' if dash else "")
        + (f' marker-end="url(#a{col[1:]})"' if arrow else "")
        + "/>"
    )


def path(d, fill="none", col=INK, w=2):
    return f'<path d="{d}" fill="{fill}" stroke="{col}" stroke-width="{w}" stroke-linejoin="round"/>'


def rect(x, y, w, h, fill, rad=0, col=INK):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rad}" fill="{fill}" stroke="{col}" stroke-width="2"/>'


def circle(x, y, r, fill=GREEN, col=INK):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{col}" stroke-width="2"/>'


def txt(x, y, s, col=INK, a="start", sze=17):
    return f'<text x="{x}" y="{y}" fill="{col}" font-family="Arial, sans-serif" font-size="{sze}" text-anchor="{a}">{escape(s)}</text>'


def dot(x, y, r=4, col=INK):
    return circle(x, y, r, col, col)


def axes(x=66, y=180, xe=512, yt=30, xl="t", yl="x"):
    return (
        line(x, y, xe, y, arrow=True)
        + line(x, y, x, yt, arrow=True)
        + txt(xe + 5, y + 5, xl)
        + txt(x - 11, yt, yl, a="end")
    )


def plot(name, title, *parts):
    markers = "".join(
        f'<marker id="a{c[1:]}" markerWidth="7" markerHeight="7" refX="6.4" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 z" fill="{c}"/></marker>'
        for c in [INK, GREEN, RED, FAINT]
    )
    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 226" role="img" aria-labelledby="t"><title id="t">{escape(title)}</title><defs>{markers}</defs><rect width="580" height="226" fill="#f8f6eb"/>'
        + "".join(parts)
        + "</svg>"
    )
    (OUT / (name + ".svg")).write_text(out)


def generate():
    plot(
        "C1-scala",
        "Un centimetro quadrato suddiviso in cento millimetri quadrati",
        rect(74, 26, 156, 156, "#e5eee6"),
        "".join(
            line(74 + i * 15.6, 26, 74 + i * 15.6, 182, FAINT, 1)
            + line(74, 26 + i * 15.6, 230, 26 + i * 15.6, FAINT, 1)
            for i in range(1, 10)
        ),
        rect(74, 26, 15.6, 15.6, RED),
        txt(152, 207, "10 mm = 1 cm", a="middle"),
        txt(286, 79, "Una riga contiene 10 celle."),
        txt(286, 108, "Le righe sono 10."),
        txt(286, 154, "1 cm² = 100 mm²", GREEN),
    )
    plot(
        "C1-vettore",
        "Scomposizione di uno spostamento nel primo quadrante",
        axes(88, 174, 503, 24, "x", "y"),
        line(88, 174, 328, 54, GREEN, 3, arrow=True),
        line(328, 54, 328, 174, FAINT, dash=True),
        line(88, 54, 328, 54, FAINT, dash=True),
        path("M125 174 A37 37 0 0 0 121 157", col=RED),
        txt(138, 157, "θ", RED),
        txt(204, 203, "componente x", a="middle"),
        txt(337, 113, "componente y"),
        dot(328, 54),
        txt(344, 58, "punta"),
    )
    plot(
        "C1-posizione",
        "Posizione lungo una corsia in tre intervalli",
        axes(76, 170, 509, 24, "t (s)", "x (m)"),
        path("M76 170 L204 59 L332 59 L460 133", col=GREEN, w=4),
        "".join(
            line(x, 170, x, y, FAINT, 1, True) + txt(x, 196, s, a="middle")
            for x, y, s in [(204, 59, "2"), (332, 59, "4"), (460, 133, "6")]
        ),
        txt(64, 174, "0", a="end"),
        line(76, 59, 204, 59, FAINT, 1, True),
        txt(64, 65, "6", a="end"),
        line(76, 133, 460, 133, FAINT, 1, True),
        txt(64, 139, "2", a="end"),
    )
    plot(
        "C1-velocita",
        "Grafico velocità-tempo a tratti lineari",
        axes(80, 167, 508, 26, "t (s)", "v (m/s)"),
        path("M80 166 L260 47 L440 166 Z", BLUE, GREEN, 3),
        line(260, 47, 260, 166, FAINT, 1, True),
        txt(69, 173, "0", a="end"),
        txt(260, 193, "3", a="middle"),
        txt(440, 193, "6", a="middle"),
        line(80, 47, 254, 47, FAINT, 1, True),
        txt(69, 52, "6", a="end"),
    )
    plot(
        "C1-parabola",
        "Velocità tangente e accelerazione verticale nel moto parabolico",
        axes(72, 175, 504, 23, "x", "y"),
        path("M85 169 Q276 -97 467 169", col=GREEN, w=3),
        dot(276, 36),
        line(276, 36, 358, 36, GREEN, 2.5, arrow=True),
        txt(369, 42, "v"),
        line(276, 40, 276, 99, RED, 2.5, arrow=True),
        txt(287, 91, "g", RED),
        txt(87, 199, "lancio"),
        txt(422, 199, "ritorno"),
    )
    plot(
        "C1-circolo",
        "Il vettore velocità è tangente e l’accelerazione è rivolta al centro",
        circle(235, 111, 76, "none", FAINT),
        dot(235, 111),
        dot(311, 111),
        line(307, 111, 245, 111, RED, 3, arrow=True),
        line(311, 108, 311, 31, GREEN, 3, arrow=True),
        txt(322, 45, "v", GREEN),
        txt(249, 138, "a centripeta", RED),
        txt(146, 116, "centro", a="end"),
    )
    plot(
        "C1-forze",
        "Diagramma delle forze sul blocco in moto verso destra",
        line(65, 143, 510, 143, FAINT, 3),
        rect(215, 94, 104, 49, "#d9e7d8", 3),
        dot(267, 118),
        line(267, 115, 267, 35, GREEN, 2.6, arrow=True),
        line(267, 121, 267, 201, RED, 2.6, arrow=True),
        line(268, 118, 408, 118, GREEN, 2.6, arrow=True),
        line(266, 118, 187, 118, RED, 2.6, arrow=True),
        txt(277, 43, "N", GREEN),
        txt(278, 198, "mg", RED),
        txt(417, 121, "trazione", GREEN),
        txt(176, 122, "attrito", RED, "end"),
    )
    plot(
        "C1-energia",
        "Discesa dal punto A al punto B lungo un piano",
        path("M103 62 L458 167 L103 167 Z", "#e1e9db", FAINT),
        circle(119, 53, 9),
        dot(458, 167),
        line(76, 62, 76, 166, RED, 2),
        line(69, 63, 84, 63, RED),
        line(69, 166, 84, 166, RED),
        txt(62, 122, "h", RED, "end"),
        txt(122, 36, "A"),
        txt(473, 169, "B"),
        line(104, 167, 508, 167, FAINT, 1, True),
        txt(467, 198, "z = 0"),
    )
    plot(
        "C1-impulso",
        "Una forza cambia linearmente durante un urto",
        axes(83, 167, 505, 26, "t (s)", "F (N)"),
        path("M84 165 L260 49 L436 165 Z", BLUE, GREEN, 3),
        line(83, 49, 259, 49, FAINT, 1, True),
        txt(74, 54, "40", a="end"),
        txt(84, 192, "0", a="middle"),
        txt(260, 192, "0,10", a="middle"),
        txt(436, 192, "0,20", a="middle"),
        txt(259, 139, "impulso", GREEN, "middle"),
    )
    plot(
        "C1-leva",
        "Modello dell’avambraccio orizzontale in equilibrio",
        path("M91 137 l-14 25 h28 Z", "#e9dbc5"),
        line(91, 135, 477, 135, INK, 9),
        dot(91, 135, 6),
        line(153, 130, 153, 46, GREEN, 3, arrow=True),
        line(465, 138, 465, 197, RED, 3, arrow=True),
        txt(164, 51, "forza muscolare", GREEN),
        txt(450, 196, "carico", RED, "end"),
        line(93, 104, 151, 104, FAINT, 1),
        line(93, 99, 93, 109, FAINT),
        line(152, 99, 152, 109, FAINT),
        txt(123, 91, "b₁", a="middle"),
        line(93, 171, 439, 171, FAINT, 1, True),
        txt(298, 197, "braccio del carico b₂", a="middle"),
        txt(81, 126, "O", a="end"),
    )
    plot(
        "C1-molla",
        "La freccia di richiamo è diretta verso la lunghezza di riposo",
        line(69, 49, 69, 177, INK, 5),
        path(
            "M69 83 H93 l8 -13 l12 26 l12 -26 l12 26 l12 -26 l12 26 l8 -13 H220",
            col=INK,
        ),
        rect(220, 63, 50, 40, "#e4e9db"),
        path(
            "M69 151 H99 l12 -13 l24 26 l24 -26 l24 26 l24 -26 l24 26 l12 -13 H317",
            col=INK,
        ),
        rect(317, 131, 50, 40, "#e4e9db"),
        line(243, 110, 243, 186, FAINT, 1, True),
        line(341, 173, 341, 187, FAINT, 1, True),
        line(244, 187, 337, 187, GREEN, 2, arrow=True),
        txt(289, 210, "x", GREEN, "middle"),
        line(317, 120, 263, 120, RED, 2, arrow=True),
        txt(380, 90, "riposo"),
        txt(380, 155, "allungata"),
    )
    plot(
        "C2-colonna",
        "Profondità misurata dalla superficie libera",
        path("M95 28 V179 H406 V28", col=INK, w=4),
        rect(98, 60, 305, 117, BLUE, col=GREEN),
        line(104, 61, 390, 61, GREEN, 2),
        txt(421, 66, "p₀"),
        dot(283, 126),
        txt(297, 132, "A"),
        line(171, 62, 171, 125, RED, 2, arrow=True),
        txt(182, 99, "h", RED),
        line(113, 126, 355, 126, FAINT, 1, True),
        txt(105, 204, "Liquido omogeneo in quiete"),
    )
    plot(
        "C2-manometro",
        "Manometro a U aperto all’atmosfera con un gas a sinistra",
        path("M123 38 V143 Q123 180 163 180 H338 Q378 180 378 143 V38", col=INK, w=3),
        path("M151 38 V139 Q151 151 166 152 H334 Q349 152 349 139 V38", col=INK, w=3),
        path(
            "M125 104 V142 Q125 177 163 177 H338 Q375 177 375 142 V64 H352 V138 Q352 154 334 155 H165 Q149 154 149 139 V104 Z",
            BLUE,
            GREEN,
            1,
        ),
        line(131, 104, 466, 104, FAINT, 1, True),
        line(363, 64, 466, 64, FAINT, 1, True),
        line(453, 66, 453, 101, RED, 1.8),
        txt(464, 91, "Δh", RED),
        txt(137, 27, "gas", a="middle"),
        txt(365, 27, "atmosfera", a="middle"),
        txt(247, 205, "Stesso liquido nei due rami", a="middle"),
    )
    plot(
        "C2-pressa",
        "Due pistoni alla stessa quota comunicano attraverso un liquido",
        path("M83 64 V178 H456 V64 M144 64 V147 H309 V64", col=INK, w=3),
        path("M86 95 H141 V150 H312 V95 H453 V175 H86 Z", BLUE, GREEN, 1),
        rect(82, 87, 63, 9, "#665c4e"),
        rect(309, 87, 148, 9, "#665c4e"),
        line(113, 33, 113, 82, RED, 2.3, arrow=True),
        line(380, 84, 380, 32, GREEN, 2.3, arrow=True),
        txt(123, 53, "F₁", RED),
        txt(392, 51, "F₂", GREEN),
        txt(113, 203, "A₁", a="middle"),
        txt(379, 203, "A₂", a="middle"),
    )
    plot(
        "C2-spinta",
        "Un blocco galleggiante sposta il volume tratteggiato in acqua",
        rect(64, 106, 227, 81, BLUE, col=GREEN),
        rect(135, 72, 76, 94, "#e5ccae"),
        line(66, 106, 288, 106, GREEN, 2, True),
        line(173, 118, 173, 41, GREEN, 2.5, arrow=True),
        line(173, 124, 173, 201, RED, 2.5, arrow=True),
        txt(186, 48, "S", GREEN),
        txt(187, 201, "P", RED),
        txt(322, 86, "Parte emersa"),
        txt(322, 134, "Parte immersa"),
        line(221, 88, 305, 82, FAINT, 1, True),
        line(222, 142, 305, 131, FAINT, 1, True),
    )
    plot(
        "C2-condotto",
        "Sezioni di controllo attraverso un restringimento orizzontale",
        path(
            "M54 54 H216 Q267 54 304 83 H527 V144 H304 Q267 171 216 171 H54 Z",
            BLUE,
            INK,
            2,
        ),
        line(160, 56, 160, 169, RED, 2, True),
        line(390, 84, 390, 143, RED, 2, True),
        line(81, 111, 135, 111, GREEN, 2, arrow=True),
        line(310, 111, 421, 111, GREEN, 2, arrow=True),
        txt(159, 199, "A₁, v₁", a="middle"),
        txt(390, 170, "A₂, v₂", a="middle"),
    )
    plot(
        "C2-bernoulli",
        "Piezometri aperti in un tubo ideale orizzontale",
        path(
            "M51 110 H173 V43 H189 V110 H204 Q248 110 285 127 H377 V75 H393 V127 H529 V162 H284 Q250 181 203 181 H51 Z",
            BLUE,
            INK,
            2,
        ),
        line(174, 44, 188, 44, GREEN),
        line(378, 76, 392, 76, GREEN),
        line(181, 44, 462, 44, FAINT, 1, True),
        line(386, 76, 462, 76, FAINT, 1, True),
        txt(475, 65, "Δh", RED),
        line(455, 46, 455, 74, RED),
        txt(78, 207, "1 · larga"),
        txt(369, 199, "2 · stretta"),
        line(79, 146, 136, 146, GREEN, 2, arrow=True),
    )
    plot(
        "C2-profilo",
        "Profilo parabolico della velocità in un condotto diritto",
        line(64, 48, 520, 48, INK, 4),
        line(64, 172, 520, 172, INK, 4),
        line(104, 110, 504, 110, FAINT, 1, True),
        "".join(
            line(
                151,
                y,
                151 + int(186 * (1 - ((y - 110) / 62) ** 2)),
                y,
                GREEN,
                2,
                arrow=True,
            )
            for y in [60, 78, 94, 110, 126, 142, 160]
        ),
        path("M151 48 Q523 110 151 172", col=RED, w=2),
        txt(351, 103, "v massima", GREEN),
        txt(90, 202, "Pareti ferme · aderenza alla parete"),
    )
    plot(
        "C2-raggio",
        "Due condotti confrontati alla stessa differenza di pressione, lunghezza e viscosità",
        circle(159, 104, 66, BLUE, GREEN),
        circle(404, 104, 33, BLUE, GREEN),
        dot(159, 104),
        dot(404, 104),
        line(160, 104, 221, 104, RED, 2, arrow=True),
        line(405, 104, 434, 104, RED, 2, arrow=True),
        txt(189, 94, "r₁", RED, "middle"),
        txt(427, 94, "r₂", RED, "middle"),
        txt(159, 195, "condotto 1", a="middle"),
        txt(404, 195, "condotto 2 · r₂ = r₁/2", a="middle"),
    )
    plot(
        "C2-reti",
        "Una rete in serie e una in parallelo",
        txt(70, 55, "Serie"),
        line(166, 50, 500, 50, GREEN, 3),
        rect(229, 36, 63, 28, "#f8f6eb"),
        rect(357, 36, 63, 28, "#f8f6eb"),
        txt(260, 56, "R₁", a="middle"),
        txt(388, 56, "R₂", a="middle"),
        txt(70, 151, "Parallelo"),
        line(166, 145, 214, 145, GREEN, 3),
        path("M214 145 V111 H434 V145 M214 145 V179 H434 V145", col=GREEN, w=3),
        line(434, 145, 500, 145, GREEN, 3),
        rect(292, 97, 63, 28, "#f8f6eb"),
        rect(292, 165, 63, 28, "#f8f6eb"),
        txt(323, 117, "R₁", a="middle"),
        txt(323, 185, "R₂", a="middle"),
        dot(214, 145),
        dot(434, 145),
    )
    plot(
        "C2-capillare",
        "Risalita di un liquido bagnante in un capillare",
        path("M82 94 V183 H376 V94", col=INK, w=3),
        path("M84 129 H194 V53 Q211 69 228 53 V129 H374 V181 H84 Z", BLUE, GREEN, 1),
        line(193, 28, 193, 154, INK, 2),
        line(229, 28, 229, 154, INK, 2),
        line(229, 59, 426, 59, FAINT, 1, True),
        line(230, 129, 426, 129, FAINT, 1, True),
        line(404, 62, 404, 127, RED, 2),
        txt(417, 99, "h", RED),
        txt(72, 208, "Stessa atmosfera sopra le superfici"),
    )


if __name__ == "__main__":
    generate()
