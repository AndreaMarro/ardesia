"""Produce le tavole originali come geometria vettoriale annotata."""

from html import escape
from math import cos, sin, pi
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "static" / "figures"
ink, red, teal, pale, blue, paper, guide = (
    "#123c39",
    "#ac3825",
    "#16736b",
    "#e7eadd",
    "#d5e7df",
    "#faf7ee",
    "#7d8981",
)


def line(x, y, X, Y, color=ink, w=2, dash=None, arrow=False):
    att = (f' stroke-dasharray="{dash}"' if dash else "") + (
        f' marker-end="url(#a{color[1:]})"' if arrow else ""
    )
    return f'<line x1="{x}" y1="{y}" x2="{X}" y2="{Y}" stroke="{color}" stroke-width="{w}"{att}/>'


def path(d, color=ink, w=2, fill="none", dash=None, arrow=False):
    att = (f' stroke-dasharray="{dash}"' if dash else "") + (
        f' marker-end="url(#a{color[1:]})"' if arrow else ""
    )
    return f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{w}"{att}/>'


def rect(x, y, w, h, fill="none", edge=ink, sw=2, rx=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{edge}" stroke-width="{sw}"/>'


def dot(x, y, r=4, fill=ink, edge="none", sw=2):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{edge}" stroke-width="{sw}"/>'


def label(x, y, s, color=ink, sz=17, anchor="middle", bold=False):
    return f'<text x="{x}" y="{y}" font-size="{sz}" text-anchor="{anchor}" fill="{color}" font-weight="{700 if bold else 500}">{escape(s)}</text>'


def array(parts):
    return "".join(parts)


def title(x, s):
    return label(x, 30, s, ink, 19, "middle", True)


def arrow(x, y, X, Y, color=red, w=3):
    return line(x, y, X, Y, color, w, arrow=True)


def note(x, y, s):
    return label(x, y, s, guide, 15)


def axes(x=80, y=200, X=530, Y=38, h="V", v="p"):
    return array(
        [
            arrow(x, y, X, y, ink, 2),
            arrow(x, y, x, Y, ink, 2),
            label(X + 14, y + 7, h),
            label(x - 14, Y, v),
        ]
    )


def field(x, y, s=5, c=teal):
    return line(x - s, y - s, x + s, y + s, c, 1.8) + line(
        x + s, y - s, x - s, y + s, c, 1.8
    )


def curve(points, c=red, w=3):
    return path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in points), c, w)


def save(n, title_, desc, *els):
    styles = 'font-family="Arial, Helvetica, sans-serif" stroke-linejoin="round" stroke-linecap="round"'
    markers = "".join(
        f'<marker id="a{co[1:]}" markerWidth="6" markerHeight="6" refX="5.6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6 L1.4,3 Z" fill="{co}"/></marker>'
        for co in (ink, red, teal, guide)
    )
    (OUT / (n + ".svg")).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="250" viewBox="0 0 640 250" role="img" aria-labelledby="title desc" {styles}><title id="title">{escape(title_)}</title><desc id="desc">{escape(desc)}</desc><defs>{markers}</defs>{rect(0, 0, 640, 250, paper, "none", 0)}{"".join(els)}</svg>\n'
    )


OUT.mkdir(parents=True, exist_ok=True)
save(
    "C3-confine",
    "Sistema, ambiente e confine mobile",
    "Gas in un cilindro con pistone; il calore può attraversare la parete e il lavoro può uscire dal pistone.",
    title(310, "Un confine attorno al gas"),
    rect(137, 77, 258, 94, blue, "none", 0),
    path("M414 72 H130 V177 H414", ink, 7),
    rect(385, 76, 12, 97, pale, ink, 2),
    line(397, 123, 496, 123, ink, 7),
    path("M145 85 H379 V163 H145 Z", teal, 2, dash="6 6"),
    label(258, 131, "gas", ink, 24),
    arrow(54, 123, 127, 123, red),
    label(63, 103, "calore Q", red),
    arrow(469, 98, 534, 98, red),
    label(503, 78, "lavoro W", red),
    line(205, 162, 177, 204, teal, 1.5),
    label(168, 224, "confine del sistema", teal),
    label(484, 196, "ambiente"),
)
pts = [(72 + v * 78, 211 - 126 / v) for v in [1 + i / 30 for i in range(119)]]
save(
    "C3-isoterma",
    "Confrontare due stati sulla stessa isoterma",
    "Pressione e volume variano inversamente. Le proiezioni di A e B sugli assi evidenziano i due prodotti p per V.",
    axes(72, 211, 528, 35),
    curve(pts),
    line(150, 85, 150, 211, guide, 1.5, "4 5"),
    line(72, 85, 150, 85, guide, 1.5, "4 5"),
    line(306, 169, 306, 211, guide, 1.5, "4 5"),
    line(72, 169, 306, 169, guide, 1.5, "4 5"),
    dot(150, 85),
    dot(306, 169),
    label(169, 75, "A"),
    label(323, 158, "B"),
    label(149, 232, "V₁"),
    label(307, 232, "V₂"),
    label(50, 89, "p₁"),
    label(50, 174, "p₂"),
    label(465, 93, "T costante", red, 19),
    label(467, 120, "p₁V₁ = p₂V₂", ink, 18),
)
save(
    "C3-scambi",
    "Calorimetro isolato",
    "Dentro un involucro isolante due corpi posti a contatto scambiano energia fino all’equilibrio termico.",
    title(320, "Il bilancio si chiude sul sistema complessivo"),
    rect(85, 62, 471, 113, paper, ink, 4, 8),
    rect(102, 76, 214, 85, "#f2d8c7", "none", 0),
    rect(321, 76, 217, 85, blue, "none", 0),
    label(186, 110, "corpo caldo", red, 21),
    label(441, 110, "corpo freddo", teal, 21),
    arrow(252, 130, 389, 130, red),
    label(319, 201, "involucro isolante"),
    label(320, 229, "Qcaldo + Qfreddo = 0", ink, 18),
)
save(
    "C3-fasi",
    "Curva di riscaldamento alla fusione",
    "Temperatura in ordinata e calore assorbito in ascissa. Il segmento orizzontale corrisponde alla coesistenza solido-liquido.",
    axes(77, 203, 540, 33, "Q", "T"),
    path("M98 185 L196 125 H364 L479 62", red, 3.5),
    line(77, 125, 196, 125, guide, 1.4, "4 5"),
    label(49, 129, "T fus"),
    dot(196, 125),
    dot(364, 125),
    label(148, 186, "solido"),
    label(279, 102, "solido + liquido", teal, 18),
    label(472, 47, "liquido"),
    label(323, 233, "calore fornito →", ink, 15),
)
save(
    "C3-parete",
    "Conduzione attraverso una parete",
    "La lastra di spessore s separa una faccia calda e una fredda. Il flusso termico è diretto dalla calda alla fredda.",
    title(320, "Conduzione stazionaria"),
    rect(215, 60, 205, 112, pale, ink, 2),
    line(215, 60, 215, 172, red, 5),
    line(420, 60, 420, 172, teal, 5),
    label(140, 111, "T calda", red, 20),
    label(503, 111, "T fredda", teal, 20),
    arrow(257, 118, 377, 118, red),
    label(318, 98, "potenza P"),
    line(215, 184, 215, 206),
    line(420, 184, 420, 206),
    line(215, 195, 420, 195, ink, 1.5),
    label(317, 222, "spessore s"),
)
save(
    "C3-bilancio",
    "Segni del primo principio",
    "Un ingresso di calore positivo entra da sinistra nel sistema. Il lavoro positivo lascia il sistema verso destra.",
    title(320, "Convenzione dei segni"),
    rect(225, 73, 190, 89, blue, ink, 2, 4),
    label(320, 125, "sistema · U", ink, 24),
    arrow(75, 120, 216, 120, teal),
    label(139, 97, "Q entrante", teal, 19),
    arrow(423, 120, 566, 120, red),
    label(500, 97, "W uscente", red, 19),
    label(320, 207, "ΔU = Q − W", ink, 24),
)
pa = [(76 + v * 91, 205 - 119 / (v**1.4)) for v in [1 + i / 44 for i in range(153)]]
pt = [(76 + v * 91, 205 - 119 / v) for v in [1 + i / 44 for i in range(153)]]
save(
    "C3-percorsi",
    "Quattro trasformazioni da A",
    "Isocora verticale, isobara orizzontale, isoterma decrescente e adiabatica reversibile più ripida per l’espansione di un gas perfetto.",
    axes(76, 205, 518, 29),
    line(167, 86, 167, 38, teal, 3),
    label(209, 44, "isocora", teal),
    line(167, 86, 482, 86, ink, 2.8),
    label(524, 90, "isobara"),
    curve(pt),
    curve(pa, teal),
    dot(167, 86, 5),
    label(152, 76, "A"),
    label(535, 166, "isoterma", red),
    label(550, 195, "adiabatica", teal),
    label(272, 235, "Stesso stato iniziale, vincoli diversi", ink, 16),
)
save(
    "C3-ciclo",
    "Ciclo rettangolare orario",
    "Successione A in alto a sinistra, B in alto a destra, C in basso a destra, D in basso a sinistra. Il lavoro è l’area del rettangolo.",
    axes(85, 202, 535, 30),
    rect(172, 65, 246, 91, blue, teal, 2),
    label(292, 118, "W netto", ink, 22),
    arrow(252, 65, 329, 65),
    arrow(418, 85, 418, 129),
    arrow(334, 156, 258, 156),
    arrow(172, 139, 172, 93),
    label(147, 62, "A"),
    label(436, 60, "B"),
    label(436, 173, "C"),
    label(151, 173, "D"),
    label(320, 232, "Volume crescente verso destra", ink, 16),
)
save(
    "C3-macchina",
    "Bilancio di una macchina termica",
    "Il motore riceve Qh dalla sorgente calda, cede Qc a quella fredda e fornisce lavoro W.",
    rect(25, 73, 144, 91, "#f2d8c7", red, 2, 4),
    label(97, 111, "sorgente", red),
    label(97, 136, "calda · Th", red, 19),
    rect(251, 73, 125, 91, pale, ink, 2, 4),
    label(314, 124, "motore", ink, 22),
    rect(468, 73, 147, 91, blue, teal, 2, 4),
    label(542, 111, "sorgente", teal),
    label(542, 136, "fredda · Tc", teal, 19),
    arrow(174, 118, 245, 118, red),
    label(209, 97, "Qh", red, 19),
    arrow(382, 118, 462, 118, teal),
    label(422, 97, "Qc", teal, 19),
    arrow(314, 169, 314, 215, ink),
    label(393, 211, "lavoro W", ink, 19),
)
save(
    "C3-entropia",
    "Entropia di due serbatoi",
    "Un serbatoio caldo cede Q, quello freddo lo riceve. I due cambiamenti di entropia hanno segni opposti.",
    title(320, "Uno scambio, due temperature"),
    rect(58, 72, 182, 88, "#f2d8c7", red, 2, 4),
    rect(401, 72, 182, 88, blue, teal, 2, 4),
    label(149, 111, "serbatoio caldo", red, 19),
    label(149, 141, "Th", red, 20),
    label(492, 111, "serbatoio freddo", teal, 19),
    label(492, 141, "Tc", teal, 20),
    arrow(249, 117, 390, 117),
    label(320, 96, "Q", red, 20),
    label(149, 202, "ΔSh = −Q / Th", ink, 18),
    label(490, 202, "ΔSc = +Q / Tc", ink, 18),
)
save(
    "C4-coulomb",
    "Forze di Coulomb su cariche opposte",
    "Le frecce sulla carica positiva e su quella negativa puntano una verso l’altra; in basso è quotata la distanza r tra i centri.",
    title(320, "Una forza su ciascuna carica"),
    dot(152, 110, 24, "#f2d8c7", red),
    dot(483, 110, 24, blue, teal),
    label(152, 118, "+", red, 28),
    label(483, 118, "−", teal, 28),
    arrow(179, 110, 285, 110, red),
    arrow(456, 110, 350, 110, teal),
    label(230, 85, "F su q₁", red),
    label(406, 85, "F su q₂", teal),
    line(152, 147, 152, 186, guide, 1.5),
    line(483, 147, 483, 186, guide, 1.5),
    line(152, 177, 483, 177, guide, 1.5),
    label(318, 203, "r"),
)
plates = array(
    [
        rect(92, 49, 12, 141, red, "none", 0),
        rect(527, 49, 12, 141, teal, "none", 0),
        label(98, 33, "+", red, 23),
        label(535, 33, "−", teal, 23),
    ]
)
save(
    "C4-campo",
    "Campo uniforme e forza su una carica negativa",
    "Il campo tra le armature va dalla positiva alla negativa. Una carica di prova negativa subisce una forza opposta.",
    plates,
    array(arrow(111, y, 515, y, teal, 2) for y in (69, 160)),
    label(422, 148, "campo E", teal, 17),
    dot(326, 111, 14, paper, ink),
    label(326, 117, "−", ink, 19),
    arrow(308, 111, 191, 111, red),
    label(244, 101, "forza F", red, 17),
    label(320, 221, "F = qE   con q < 0", ink, 19),
)
save(
    "C4-dipolo",
    "Sovrapposizione nel punto medio di un dipolo",
    "A sinistra una sorgente positiva, a destra una negativa. I due contributi al campo in P sono orientati verso destra.",
    title(320, "I due contributi in P"),
    line(119, 112, 523, 112, guide, 1.7, "5 5"),
    dot(112, 112, 20, "#f2d8c7", red),
    dot(528, 112, 20, blue, teal),
    label(112, 119, "+", red, 24),
    label(528, 119, "−", teal, 24),
    dot(320, 112, 5),
    label(320, 93, "P"),
    arrow(320, 133, 397, 133, red),
    arrow(320, 163, 397, 163, teal),
    label(424, 140, "E₊", red),
    label(424, 170, "E₋", teal),
    label(320, 217, "Frecce sfalsate per leggerle separatamente", ink, 15),
)
save(
    "C4-potenziale",
    "Campo e linee equipotenziali",
    "Il campo uniforme punta verso destra. Attraversando in quel verso le linee verticali, il potenziale decresce.",
    title(320, "Attraversare le equipotenziali"),
    array(line(x, 67, x, 176, guide, 2, "5 6") for x in (147, 261, 375, 489)),
    array(
        label(x, 199, s, ink)
        for x, s in ((147, "60 V"), (261, "40 V"), (375, "20 V"), (489, "0 V"))
    ),
    arrow(98, 117, 548, 117, teal, 3),
    label(553, 100, "E", teal, 20),
    label(320, 231, "Spostamento lungo E  →  potenziale decrescente", ink, 15),
)
save(
    "C4-materiali",
    "Separazione delle cariche nei materiali",
    "Il campo esterno è verso destra. In un conduttore isolato neutro le cariche mobili si ridistribuiscono alle superfici; in un isolante i dipoli sono legati.",
    title(167, "Conduttore"),
    title(461, "Dielettrico"),
    rect(54, 77, 220, 96, pale, ink, 2, 25),
    rect(348, 77, 229, 96, pale, ink, 2, 25),
    array(
        label(76, y, "−", teal, 22) + label(250, y, "+", red, 20)
        for y in (103, 132, 157)
    ),
    label(165, 131, "Eint = 0"),
    array(
        label(x, y, "−", teal, 18)
        + line(x + 10, y - 5, x + 23, y - 5, ink, 1.3)
        + label(x + 34, y, "+", red, 18)
        for x in (372, 434, 496)
        for y in (110, 148)
    ),
    arrow(209, 206, 426, 206, ink, 2),
    label(320, 234, "campo esterno applicato", ink, 16),
)
save(
    "C4-ohm",
    "Pendenza voltamperometrica di un resistore ohmico",
    "Su assi lineari V in ordinata e I in ascissa la retta passa per l’origine. La pendenza è R.",
    axes(85, 199, 533, 30, "I", "V"),
    line(85, 199, 445, 48, teal, 3.2),
    line(219, 143, 376, 143, red, 1.8, "5 5"),
    line(376, 143, 376, 77, red, 1.8, "5 5"),
    dot(219, 143, 4),
    dot(376, 77, 4),
    label(298, 164, "ΔI", red),
    label(397, 117, "ΔV", red),
    label(482, 171, "R = ΔV / ΔI", ink, 18),
    label(84, 221, "0"),
)


def resistor(x, y, w=51):
    return rect(x, y - 8, w, 16, pale, ink, 2)


def cap(x, y):
    return line(x - 4, y - 16, x - 4, y + 16, ink, 3) + line(
        x + 4, y - 16, x + 4, y + 16, ink, 3
    )


for kind in ("res", "cap"):
    e = lambda x, y: resistor(x - 24, y, 48) if kind == "res" else cap(x, y)
    h = 24 if kind == "res" else 4
    s1, s2 = ("R₁", "R₂") if kind == "res" else ("C₁", "C₂")
    parts = [
        title(151, "Serie"),
        title(474, "Parallelo"),
        dot(31, 117),
        dot(287, 117),
        line(31, 117, 102 - h, 117),
        e(102, 117),
        line(102 + h, 117, 213 - h, 117),
        e(213, 117),
        line(213 + h, 117, 287, 117),
        label(102, 88, s1),
        label(213, 88, s2),
        label(31, 147, "A"),
        label(287, 147, "B"),
        line(350, 117, 382, 117),
        line(382, 71, 382, 160),
        line(562, 71, 562, 160),
        line(562, 117, 601, 117),
        dot(350, 117),
        dot(382, 117, 3),
        dot(562, 117, 3),
        dot(601, 117),
        label(350, 145, "A"),
        label(603, 145, "B"),
    ]
    for y, s in ((71, s1), (160, s2)):
        parts.extend(
            [
                line(382, y, 471 - h, y),
                e(471, y),
                line(471 + h, y, 562, y),
                label(477, y + (33 if y == 160 else -21), s),
            ]
        )
    parts += [
        label(158, 214, "un solo percorso", ink, 16),
        label(473, 217, "stessa coppia di nodi", ink, 16),
    ]
    save(
        "C4-reti" if kind == "res" else "C4-reti-c",
        "Serie e parallelo di " + ("resistori" if kind == "res" else "condensatori"),
        "Due elementi collegati in serie fra A e B a sinistra; due elementi collegati in parallelo fra A e B a destra.",
        *parts,
    )
save(
    "C4-condensatore",
    "Condensatore piano in sezione",
    "Due armature parallele portano cariche opposte; nel mezzo isolante il campo è uniforme lontano dai bordi.",
    title(320, "Sezione delle armature"),
    rect(130, 72, 371, 10, red, "none", 0),
    rect(130, 165, 371, 10, teal, "none", 0),
    array(arrow(x, 88, x, 155, teal, 2) for x in (173, 243, 313, 383, 453)),
    label(96, 82, "+Q", red, 19),
    label(96, 176, "−Q", teal, 19),
    line(526, 79, 526, 169, ink, 1.4),
    line(518, 79, 534, 79, ink, 1.4),
    line(518, 169, 534, 169, ink, 1.4),
    label(547, 130, "d"),
    label(318, 214, "Area affacciata A  ·  distanza d", ink, 17),
)
save(
    "C4-filo-b",
    "Campo di un filo percorso da corrente",
    "La corrente esce dal foglio. La circonferenza di campo è antioraria; nel punto P a destra del filo B è verso l’alto.",
    dot(291, 119, 79, "none", teal, 2.5),
    dot(291, 119, 17, paper, ink),
    dot(291, 119, 5, ink),
    dot(370, 119, 4),
    arrow(370, 117, 370, 50, teal, 3),
    label(391, 67, "B", teal, 20),
    label(394, 130, "P"),
    label(162, 166, "I uscente", ink, 17),
    label(
        320, 231, "Il punto indica la punta di una freccia verso chi guarda.", ink, 15
    ),
)
save(
    "C4-orbita",
    "Incurvamento di una carica positiva",
    "Campo uniforme entrante, carica positiva nel punto basso della circonferenza, velocità verso destra, forza verso l’alto.",
    array(
        field(x, y)
        for x in (115, 165, 215, 265, 315, 365, 415, 465, 515)
        for y in (45, 83, 121, 159, 197)
    ),
    dot(279, 110, 66, "none", ink, 1.8),
    dot(279, 110, 3, ink),
    dot(279, 176, 9, paper, red),
    label(279, 181, "+", red, 14),
    arrow(291, 176, 379, 176, ink, 3),
    label(395, 184, "v"),
    arrow(279, 165, 279, 122, red, 3),
    label(300, 144, "F", red),
    label(320, 232, "×  campo B entrante nel foglio", teal, 17),
)
save(
    "C4-flusso",
    "Angolo fra B e normale alla spira",
    "La spira piana è vista di taglio come una linea orizzontale; la normale è verticale, e θ è compreso fra B e la normale.",
    title(320, "La spira vista di taglio"),
    line(124, 172, 495, 172, ink, 4),
    label(474, 199, "piano"),
    arrow(278, 171, 278, 54, ink, 2.5),
    label(260, 60, "n"),
    arrow(278, 172, 396, 75, teal, 3),
    label(413, 78, "B", teal, 20),
    path("M278 122 A50 50 0 0 1 317 140", red, 2),
    label(303, 114, "θ", red, 21),
    label(320, 230, "Φ = BA cos θ", ink, 19),
)
save(
    "C4-lenz",
    "Legge di Lenz per un campo entrante crescente",
    "Croci per il campo entrante esterno; una corrente antioraria, disegnata sulla spira, produce al centro un campo indotto uscente.",
    array(
        field(x, y, 4, teal)
        for x in (141, 179, 217, 255, 293, 331, 369, 407, 445, 483)
        for y in (50, 83, 116, 149, 182)
    ),
    dot(310, 116, 72, "none", ink, 3),
    path("M375 147 A72 72 0 0 0 373 81", red, 3.8, arrow=True),
    dot(310, 116, 14, paper, red, 2),
    dot(310, 116, 4, red),
    label(405, 108, "I", red, 21),
    label(320, 221, "×  B esterno crescente    ·    ⊙  B indotto", ink, 16),
)
save(
    "C3-rigido",
    "Un gas nel recipiente rigido",
    "Un recipiente sigillato e indeformabile è immerso in un bagno caldo. Il calore entra nel gas e le pareti restano ferme.",
    title(320, "Un volume bloccato, due temperature"),
    path("M66 74 V193 H564 V74", ink, 3),
    rect(69, 100, 492, 90, "#f2d8c7", "none", 0),
    line(69, 99, 561, 99, red, 1.5),
    rect(253, 67, 172, 92, blue, ink, 4, 9),
    rect(291, 60, 97, 10, pale, ink, 2, 3),
    label(339, 113, "gas chiuso", ink, 19),
    label(339, 139, "V costante", teal, 16),
    arrow(153, 130, 243, 130, red, 3),
    label(171, 119, "Q", red, 18),
    label(325, 223, "bagno più caldo del gas all’inizio", ink, 16),
)
save(
    "C3-compressione",
    "Calore ceduto durante una compressione",
    "Il gas cede 50 J al lato sinistro e riceve 160 J dall’ambiente come lavoro sul lato destro.",
    title(320, "Gli scambi effettivi durante la prova"),
    rect(236, 77, 169, 79, blue, ink, 2, 5),
    label(320, 123, "gas", ink, 23),
    arrow(229, 119, 73, 119, teal, 3),
    label(149, 98, "calore · 50 J", teal, 17),
    arrow(563, 119, 414, 119, red, 3),
    label(485, 98, "lavoro · 160 J", red, 17),
    label(321, 206, "Segni riferiti a calore entrante e lavoro uscente.", ink, 16),
)
save(
    "C3-espansione-libera",
    "Espansione libera in un compartimento evacuato",
    "A sinistra il gas è confinato dietro una parete, con il vuoto nell’altra metà. A destra il separatore è stato rimosso e il gas riempie entrambi i compartimenti.",
    title(157, "Prima"),
    title(479, "Dopo"),
    rect(48, 70, 226, 102, paper, ink, 3),
    line(161, 71, 161, 170, ink, 3),
    rect(363, 70, 226, 102, paper, ink, 3),
    array(
        dot(x, y, 4, teal)
        for x, y in (
            (68, 88),
            (104, 88),
            (135, 94),
            (76, 120),
            (114, 125),
            (95, 154),
            (145, 148),
            (68, 151),
        )
    ),
    label(216, 127, "vuoto", ink, 18),
    array(
        dot(x, y, 4, teal)
        for x, y in (
            (389, 92),
            (447, 92),
            (500, 99),
            (554, 91),
            (395, 146),
            (446, 135),
            (503, 152),
            (560, 139),
        )
    ),
    arrow(288, 122, 346, 122, red, 2),
    label(319, 211, "Le pareti esterne sono rigide e adiabatiche.", ink, 16),
)
save(
    "C4-lenz-decrescente",
    "Risposta alla diminuzione di un campo entrante",
    "Le croci rappresentano il campo esterno entrante che si riduce. La corrente nella spira fluisce in senso orario, generando un campo entrante che contrasta la diminuzione.",
    array(
        field(x, y, 4, teal)
        for x in (128, 172, 216, 260, 304, 348, 392, 436, 480, 524)
        for y in (50, 84, 118, 152, 186)
        if (x - 304) ** 2 + (y - 118) ** 2 > 18**2
    ),
    dot(304, 118, 72, "none", ink, 3),
    path("M367 83 A72 72 0 0 1 369 150", red, 3.8, arrow=True),
    dot(304, 118, 14, paper, red, 2),
    field(304, 118, 5, red),
    label(405, 124, "I", red, 21),
    label(320, 222, "B esterno entrante, in diminuzione", teal, 17),
)
save(
    "C4-induzione-terra",
    "Caricare un conduttore per induzione",
    "A sinistra la bacchetta positiva è vicina e la sfera è collegata a terra; una freccia indica elettroni diretti dalla terra alla sfera. A destra, scollegata la terra e rimossa la bacchetta, rimane una sfera con carica negativa.",
    title(165, "Contatto a terra"),
    title(481, "Dopo il distacco"),
    rect(38, 76, 33, 77, "#f2d8c7", red, 2, 8),
    array(label(54, y, "+", red, 18) for y in (101, 122, 143)),
    dot(155, 115, 42, pale, ink),
    line(156, 157, 156, 195, ink, 2),
    line(138, 195, 174, 195),
    line(144, 201, 168, 201),
    line(150, 207, 162, 207),
    arrow(184, 191, 184, 157, teal, 2),
    label(209, 184, "e⁻", teal, 18),
    array(label(129, y, "−", teal, 17) for y in (101, 123, 141)),
    arrow(266, 117, 348, 117, red, 2),
    dot(477, 115, 43, pale, ink),
    array(
        label(x, y, "−", teal, 17)
        for x, y in (
            (478, 88),
            (503, 104),
            (505, 135),
            (479, 151),
            (451, 133),
            (450, 103),
        )
    ),
    label(477, 197, "sfera isolata", ink, 16),
)
save(
    "C4-dipolo-indotto",
    "Un dielettrico neutro in un campo non uniforme",
    "Una bacchetta positiva induce una polarizzazione nel piccolo corpo neutro. La regione negativa è sul lato vicino alla bacchetta e subisce una forza più intensa.",
    title(320, "Un campo più intenso vicino alla bacchetta"),
    rect(95, 76, 45, 91, "#f2d8c7", red, 2, 8),
    array(label(117, y, "+", red, 20) for y in (103, 130, 156)),
    rect(275, 87, 145, 64, pale, ink, 2, 27),
    label(296, 127, "−", teal, 23),
    label(399, 126, "+", red, 22),
    arrow(272, 119, 176, 119, teal, 2.7),
    arrow(423, 119, 476, 119, red, 2.7),
    label(347, 178, "corpo neutro polarizzato", ink, 17),
    label(320, 217, "Le frecce confrontano i contributi alla forza.", ink, 15),
)
