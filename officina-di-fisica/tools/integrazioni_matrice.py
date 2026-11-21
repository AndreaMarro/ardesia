"""Dieci esempi autonomi scelti dalla matrice di copertura. Ricostruisce seed e tavole."""

import json
from pathlib import Path
from c12_figures import (
    INK,
    GREEN,
    RED,
    FAINT,
    BLUE,
    line,
    path,
    rect,
    circle,
    txt,
    dot,
    plot,
)
from c34_base import txt as text, eq, fig, slug

ROOT = Path(__file__).resolve().parents[1]
records = []


def add(course, no, skill, title, prompt, level, *content):
    module = json.loads((ROOT / "content" / f"{course}.json").read_text())
    unit = next(r for r in module if r["id"] == skill and r["kind"] == "lesson")
    records.append(
        dict(
            id=f"{course}-E{no:03}",
            version=1,
            kind="example",
            course=course,
            section=unit["section"],
            order=no,
            title=title,
            skill=skill,
            prerequisites=unit["prerequisites"],
            family=slug(title),
            difficulty=level,
            prompt=prompt,
            blocks=[text(b) if isinstance(b, str) else b for b in content],
            review="revisione scientifica ed editoriale assistita, riscontro indipendente del lotto di copertura",
        )
    )


def figures():
    paper = "#f8f6eb"
    warm = "#f4e0d2"

    def beaker(x, height, caption):
        return (
            rect(x, 60, 73, 105, paper)
            + rect(x + 2, 163 - height, 69, height, BLUE, col=GREEN)
            + txt(x + 36, 190, caption, INK, "middle", 16)
        )

    plot(
        "C1-porzioni",
        "Due aliquote dello stesso liquido alla medesima temperatura prima della riunione",
        beaker(67, 30, "30 mL"),
        beaker(223, 70, "70 mL"),
        line(322, 110, 390, 110, RED, 2, arrow=True),
        beaker(415, 100, "volume finale"),
        txt(291, 38, "Stessa sostanza, stessa temperatura iniziale", INK, "middle", 17),
    )
    plot(
        "C1-pattino-inerziale",
        "Due trazioni orizzontali opposte di uguale modulo su un pattino in moto",
        txt(290, 32, "Vista laterale · componenti orizzontali", INK, "middle", 17),
        line(77, 141, 495, 141, INK, 3),
        rect(246, 96, 89, 42, BLUE),
        line(242, 115, 137, 115, RED, 3, arrow=True),
        line(339, 115, 444, 115, GREEN, 3, arrow=True),
        txt(185, 100, "4,0 N", RED, "middle"),
        txt(390, 100, "4,0 N", GREEN, "middle"),
        line(411, 169, 511, 169, INK, 1.8, arrow=True),
        txt(486, 194, "asse x", INK, "middle", 15),
    )
    plot(
        "C1-pattinatori",
        "Le forze reciproche applicate ai due pattinatori su una guida ideale, viste dall’alto",
        txt(290, 32, "Due sistemi, due forze reciproche", INK, "middle", 17),
        rect(177, 82, 68, 58, BLUE),
        rect(333, 82, 68, 58, warm),
        txt(211, 117, "A", INK, "middle", 22),
        txt(367, 117, "B", INK, "middle", 22),
        line(173, 109, 78, 109, GREEN, 3, arrow=True),
        line(405, 109, 500, 109, RED, 3, arrow=True),
        txt(120, 85, "B su A", GREEN, "middle", 16),
        txt(456, 85, "A su B", RED, "middle", 16),
        txt(211, 166, "40 kg", INK, "middle"),
        txt(367, 166, "60 kg", INK, "middle"),
        txt(290, 200, "Il verso positivo è verso destra.", INK, "middle", 16),
    )
    plot(
        "C2-traccianti",
        "Due osservazioni di un tracciante in tubi: fila sottile e regolare in A, rapida dispersione in volute in B",
        txt(150, 36, "Tubo A", INK, "middle", 19),
        txt(429, 36, "Tubo B", INK, "middle", 19),
        rect(35, 75, 230, 74, paper),
        rect(312, 75, 230, 74, paper),
        path("M42 111 C85 110 120 113 165 111 S225 109 258 112", col=GREEN, w=3),
        path(
            "M318 111 C344 107 357 117 367 112 S394 89 408 102 S395 133 426 123 S469 83 484 107 S498 136 534 109",
            col=RED,
            w=2.5,
        ),
        path("M372 110 Q402 133 413 110 Q428 91 452 111 T529 129", col=RED, w=1.6),
        path("M399 104 Q416 88 432 100 T464 101 T499 94", col=RED, w=1.4),
        txt(150, 183, "filamento ordinato", GREEN, "middle", 16),
        txt(429, 183, "rimescolamento irregolare", RED, "middle", 16),
    )
    plot(
        "C3-due-cilindri",
        "Due campioni identici ricevono lo stesso calore: nel cilindro A il pistone è bloccato, in B è mobile a pressione esterna costante",
        txt(146, 30, "A · volume bloccato", INK, "middle", 18),
        txt(425, 30, "B · pressione costante", INK, "middle", 18),
        rect(92, 98, 110, 61, BLUE),
        path("M89 52 V163 H205 V52", col=INK, w=3),
        rect(94, 91, 106, 9, paper),
        line(147, 90, 147, 59, INK, 4),
        line(124, 59, 170, 59, INK, 4),
        line(136, 50, 136, 58, INK, 2),
        line(158, 50, 158, 58, INK, 2),
        rect(367, 79, 110, 80, BLUE),
        path("M365 51 V163 H480 V51", col=INK, w=3),
        rect(369, 70, 107, 9, paper),
        line(424, 69, 424, 47, INK, 4),
        line(369, 96, 478, 96, FAINT, 1.5, True),
        line(492, 91, 492, 57, GREEN, 2, arrow=True),
        line(146, 208, 146, 168, RED, 2, arrow=True),
        line(423, 208, 423, 168, RED, 2, arrow=True),
        txt(197, 201, "100 J", RED, "middle", 16),
        txt(474, 201, "100 J", RED, "middle", 16),
    )
    plot(
        "C3-convezione",
        "Porzione di liquido più calda circondata da liquido più denso, con spinta e peso verticali",
        txt(289, 32, "Forze su una piccola porzione calda", INK, "middle", 18),
        rect(101, 62, 370, 126, BLUE),
        circle(286, 124, 26, warm, RED),
        txt(286, 129, "V", INK, "middle", 16),
        line(287, 96, 287, 59.89, GREEN, 2.8, arrow=True),
        line(287, 151, 287, 187, RED, 2.8, arrow=True),
        txt(305, 83, "spinta", GREEN, "start", 16),
        txt(306, 176, "peso", RED, "start", 16),
        txt(
            288,
            214,
            "A questa scala i due moduli sono quasi uguali.",
            INK,
            "middle",
            15,
        ),
    )
    plot(
        "C3-scambio-radiante",
        "Una piastra emette verso la cavità e riceve radiazione dalla parete circostante più fredda",
        txt(290, 32, "Scambio radiativo nel vuoto", INK, "middle", 18),
        rect(60, 67, 20, 87, warm, RED),
        rect(497, 67, 20, 87, BLUE, GREEN),
        line(89, 93, 482, 93, RED, 2.8, arrow=True),
        line(484, 136, 90, 136, GREEN, 2.8, arrow=True),
        txt(283, 80, "emissione della piastra", RED, "middle", 16),
        txt(283, 160, "assorbimento dalla cavità", GREEN, "middle", 16),
        txt(70, 190, "310 K", INK, "middle", 17),
        txt(506, 190, "300 K", INK, "middle", 17),
    )
    plot(
        "C4-bussola-nord",
        "Filo uscente al centro, punto P a nord del filo. Nel secondo schema dal punto P il campo di fondo è diretto a nord e il contributo del filo a ovest",
        txt(132, 31, "Vista dall’alto", INK, "middle", 18),
        txt(417, 31, "Vettori nel punto P", INK, "middle", 18),
        circle(139, 141, 13, paper),
        dot(139, 141, 3),
        dot(139, 78, 4),
        line(138, 85, 138, 121, FAINT, 1.3, True),
        txt(156, 82, "P", INK, "start"),
        txt(139, 184, "corrente uscente", INK, "middle", 16),
        line(65, 132, 65, 83, INK, 1.5, arrow=True),
        txt(65, 71, "N", INK, "middle", 16),
        dot(408, 159, 4),
        line(408, 158, 408, 78, GREEN, 2.5, arrow=True),
        line(407, 159, 349, 159, RED, 2.5, arrow=True),
        line(408, 159, 349, 79, INK, 2.7, arrow=True),
        line(348, 78, 408, 78, FAINT, 1, True),
        line(348, 78, 348, 159, FAINT, 1, True),
        txt(427, 85, "20 μT · N", GREEN, "start", 15),
        txt(353, 188, "15 μT · O", RED, "middle", 15),
        txt(330, 68, "B totale", INK, "middle", 15),
    )

    plot(
        "C5-due-fronti",
        "Alla seconda emissione il primo impulso ha raggiunto i due fronti a 6,80 m dalla posizione iniziale. La sorgente si è spostata di 0,34 m verso destra: le distanze da essa ai fronti sono 7,14 m a sinistra e 6,46 m a destra",
        txt(290, 30, "Al momento della seconda emissione", INK, "middle", 18),
        line(68, 101, 505, 101, FAINT, 1.2),
        line(115, 81, 115, 119, GREEN, 3),
        line(455, 81, 455, 119, GREEN, 3),
        line(285, 81, 285, 129, FAINT, 1.3, True),
        dot(293.5, 101, 4, RED),
        txt(117, 69, "primo fronte", GREEN, "middle", 15),
        txt(454, 69, "primo fronte", GREEN, "middle", 15),
        line(115, 147, 293.5, 147, GREEN, 1.6),
        line(293.5, 147, 455, 147, RED, 1.6),
        line(115, 139, 115, 155, GREEN, 1.6),
        line(293.5, 133, 293.5, 155, INK, 1.6),
        line(455, 139, 455, 155, RED, 1.6),
        txt(203, 174, "dietro · 7,14 m", GREEN, "middle", 16),
        txt(375, 174, "davanti · 6,46 m", RED, "middle", 16),
        txt(
            290,
            205,
            "Il punto indica la nuova posizione della sorgente.",
            INK,
            "middle",
            15,
        ),
    )


def build():
    add(
        "C1",
        21,
        "C1-L001",
        "Riunire due aliquote senza cambiare sostanza",
        "Due bicchieri contengono 30 mL e 70 mL dello stesso liquido omogeneo, entrambi a 22 °C. La densità è 0,80 g/mL. Versiamo tutto nello stesso recipiente senza perdite né scambi di energia apprezzabili. Prevedi massa, volume, densità e temperatura finali.",
        1,
        fig(
            "C1-porzioni",
            "I due bicchieri contengono lo stesso liquido nelle stesse condizioni. Consideriamo additivi i due volumi.",
        ),
        "La massa si calcola moltiplicando la densità per il volume di ciascuna aliquota. I millilitri si semplificano e rimangono grammi.",
        eq(r"m_A=0{,}80\cdot30=24\ \mathrm g,\qquad m_B=0{,}80\cdot70=56\ \mathrm g"),
        eq(
            r"m_f=24+56=80\ \mathrm g,\quad V_f=30+70=100\ \mathrm{mL},\quad\rho_f=80/100=0{,}80\ \mathrm{g/mL}"
        ),
        "Massa e volume crescono riunendo le aliquote: in queste condizioni sono grandezze estensive. La densità, rapporto fra due quantità che crescono insieme, resta 0,80 g/mL. Anche il termometro resta a 22 °C perché le aliquote erano già in equilibrio termico tra loro. Densità e temperatura sono intensive. Sommare le due letture del termometro darebbe una previsione incompatibile con l’assenza di riscaldamento.",
    )
    add(
        "C1",
        22,
        "C1-L005",
        "Forze equilibrate su un pattino già in moto",
        "Un pattino su una guida orizzontale ha velocità iniziale +0,80 m/s nel riferimento inerziale del laboratorio. Per 3,0 s due fili lo tirano in versi opposti lungo la guida con 4,0 N ciascuno. Trascuriamo l’attrito. Trova velocità finale e spostamento. Che cosa accadrebbe partendo da fermo?",
        1,
        fig(
            "C1-pattino-inerziale",
            "L’asse x cresce verso destra. Le due trazioni sono forze applicate allo stesso pattino. Peso e normale si equilibrano verticalmente.",
        ),
        "Scegliamo il pattino come sistema. Componiamo le forze con i segni lungo x. Una risultante nulla impone accelerazione nulla per una massa positiva.",
        eq(r"\sum F_x=+4{,}0-4{,}0=0\ \mathrm N,\qquad a_x=\frac{\sum F_x}{m}=0"),
        eq(
            r"v_f=v_i+a_xt=+0{,}80\ \mathrm{m/s},\qquad\Delta x=v_it=0{,}80\cdot3{,}0=+2{,}4\ \mathrm m"
        ),
        "La velocità si conserva e il pattino percorre 2,4 m nel verso positivo. Con la medesima risultante ma velocità iniziale zero rimarrebbe fermo. L’equilibrio delle forze stabilisce come varia la velocità; il moto effettivo dipende anche dalla condizione iniziale.",
    )
    add(
        "C1",
        23,
        "C1-L005",
        "A chi appartengono le due forze?",
        "Due pattinatori, A di 40 kg e B di 60 kg, sono inizialmente fermi su ghiaccio con attrito trascurabile. Si spingono per 0,20 s. La forza media di A su B vale 120 N verso destra. Identifica la reazione e determina entrambe le velocità subito dopo il contatto.",
        2,
        fig(
            "C1-pattinatori",
            "Per ogni freccia il primo nome indica chi esercita la forza, il secondo chi la riceve. Si considerano le componenti orizzontali.",
        ),
        "Il terzo principio determina la forza media di B su A. Le due forze appartengono a corpi distinti. Per ciascun corpo possiamo calcolare separatamente l’impulso esterno durante lo stesso intervallo.",
        eq(
            r"F_{A\to B}=+120\ \mathrm N,\quad F_{B\to A}=-120\ \mathrm N,\quad |J|=120\cdot0{,}20=24\ \mathrm{N\,s}"
        ),
        eq(
            r"v_A=\frac{-24}{40}=-0{,}60\ \mathrm{m/s},\qquad v_B=\frac{+24}{60}=+0{,}40\ \mathrm{m/s}"
        ),
        "Il pattinatore meno massiccio acquista la velocità di modulo maggiore. Se allarghiamo il sistema a entrambi, le due forze diventano interne. Le quantità di moto finali sono −24 e +24 kg·m/s e ricostruiscono lo zero iniziale.",
    )
    add(
        "C2",
        21,
        "C2-L007",
        "Che cosa osservano il tracciante e la sonda",
        "Nel tubo A un filamento di colorante resta sottile e ordinato. Una sonda ferma al centro misura una velocità che varia lentamente da 0,18 a 0,30 m/s in 3,0 s durante l’avvio della pompa. Nel tubo B il colorante si disperde rapidamente in volute irregolari e la velocità locale fluttua; la sua media su intervalli lunghi resta 0,24 m/s. Come descriveresti i due moti?",
        2,
        fig(
            "C2-traccianti",
            "I disegni riassumono l’aspetto osservato del tracciante. La sonda, mantenuta nello stesso punto, aggiunge una misura temporale.",
        ),
        "Per valutare la stazionarietà osserviamo cosa accade nel tempo a posizione fissata. Per distinguere un moto laminare da uno turbolento consideriamo anche la regolarità degli strati, le fluttuazioni e il rimescolamento. Sono due domande sperimentali distinte.",
        eq(
            r"\left.\frac{\Delta v}{\Delta t}\right|_{A,\,\mathrm{sonda}}=\frac{0{,}30-0{,}18}{3{,}0}=0{,}040\ \mathrm{m/s^2}"
        ),
        "Nel tubo A la velocità locale cambia durante l’avvio: il moto è non stazionario. Il filamento ordinato è compatibile con moto laminare nel tratto osservato. Il rapporto calcolato descrive la variazione temporale locale media misurata dalla sonda.",
        "Nel tubo B le fluttuazioni irregolari e le volute indicano moto turbolento. Una media temporale stabile può rendere il moto statisticamente stazionario, pur con fluttuazioni istantanee. Leggere soltanto 0,24 m/s su uno strumento che media nel tempo farebbe perdere questa informazione.",
    )
    add(
        "C3",
        21,
        "C3-L03",
        "Stessa energia, due termometri diversi",
        "Due cilindri contengono ciascuno 0,20 mol dello stesso gas perfetto, inizialmente alla stessa temperatura. Ciascuno riceve 100 J. Nel primo il pistone è bloccato, nel secondo scorre a pressione costante. Usa capacità molari costanti Cᵥ = 12,5 e Cₚ = 20,8 J/(mol·K). Quale gas si scalda di più e dove va il lavoro nel secondo cilindro?",
        2,
        fig(
            "C3-due-cilindri",
            "In A il pistone è fermo. In B la linea tratteggiata indica la vecchia posizione del pistone che ora si è alzato. Le due frecce di calore hanno la stessa etichetta.",
        ),
        "Nel primo cilindro il calore aumenta solo l’energia interna. Nel secondo il gas spende parte dell’energia ricevuta per spostare il pistone. Per calcolare le due temperature scegliamo la capacità molare che corrisponde al vincolo del rispettivo cilindro.",
        eq(
            r"\Delta T_A=\frac{Q}{nC_V}=\frac{100}{0{,}20\cdot12{,}5}=40\ \mathrm K,\qquad\Delta T_B=\frac{100}{0{,}20\cdot20{,}8}\simeq24{,}0\ \mathrm K"
        ),
        "Per il gas perfetto ΔU dipende dalla variazione di temperatura e vale nCᵥΔT anche quando il pistone si muove. Conserviamo qualche cifra nel calcolo intermedio.",
        eq(
            r"\Delta U_B=100\frac{C_V}{C_p}=100\frac{12{,}5}{20{,}8}\simeq60{,}1\ \mathrm J,\qquad W_B=100-60{,}1=39{,}9\ \mathrm J"
        ),
        "Il gas nel cilindro bloccato si scalda di più. In B i circa 60 J accumulati e 40 J trasferiti al pistone ricostruiscono i 100 J entranti.",
    )
    add(
        "C3",
        22,
        "C3-L05",
        "Perché parte una corrente nel bagno caldo",
        "In acqua sopra i 20 °C, una piccola porzione riscaldata dal basso ha volume 20 cm³ e densità 995 kg/m³. Il liquido circostante è inizialmente quasi fermo, con densità 998 kg/m³. Stima la risultante verticale iniziale della pressione e del peso su quella porzione con g = 9,81 m/s². Come cambierebbe l’origine del moto se intervenisse una pompa?",
        2,
        fig(
            "C3-convezione",
            "La spinta dipende dalla densità del liquido circostante. Il peso dipende dalla massa della porzione calda.",
        ),
        "Nel modello iniziale idrostatico il fluido circostante esercita una spinta uguale al peso del volume di liquido circostante spostato. Scegliamo l’alto positivo e convertiamo 20 cm³ in 20 × 10⁻⁶ m³.",
        eq(
            r"F_y=\rho_{\rm circ}gV-\rho_{\rm calda}gV=(998-995)\cdot9{,}81\cdot20\cdot10^{-6}\ \mathrm N"
        ),
        eq(r"F_y=+5{,}89\cdot10^{-4}\ \mathrm N\simeq+0{,}59\ \mathrm{mN}"),
        "La piccola risultante iniziale è diretta verso l’alto. Il moto del liquido trasporta energia con sé e può avviare una circolazione per convezione naturale; la velocità successiva dipenderà anche dalla viscosità e dal mescolamento. Se una pompa mette in movimento il liquido, si ha un contributo di convezione forzata anche senza differenza di densità.",
    )
    add(
        "C3",
        23,
        "C3-L05",
        "Emissione e assorbimento nella cavità",
        "Una faccia piana grigia di area 0,010 m² a 310 K è rivolta, attraverso il vuoto, a una grande cavità nera isoterma a 300 K. La faccia ha emissività e assorbività 0,80. Trascuriamo supporti e altri scambi. Calcola la potenza emessa, quella assorbita e la perdita netta della faccia. Usa σ = 5,67 × 10⁻⁸ W/(m²·K⁴).",
        3,
        fig(
            "C3-scambio-radiante",
            "La radiazione può attraversare il vuoto in entrambi i versi. La piastra emette alla sua temperatura e assorbe una parte della radiazione della cavità.",
        ),
        "Il meccanismo è l’irraggiamento. Per quantificarlo, applichiamo il modello di corpo grigio a una sola faccia completamente esposta alla cavità. La temperatura in ogni quarta potenza è una temperatura assoluta in kelvin.",
        eq(
            r"P_{\rm em}=\varepsilon\sigma A T_{\rm p}^4=0{,}80\cdot5{,}67\cdot10^{-8}\cdot0{,}010\cdot310^4\simeq4{,}189\ \mathrm W"
        ),
        eq(
            r"P_{\rm ass}=\varepsilon\sigma A T_{\rm cav}^4\simeq3{,}674\ \mathrm W,\qquad P_{\rm usc,netta}=4{,}189-3{,}674\simeq0{,}515\ \mathrm W"
        ),
        "La piastra perde per irraggiamento circa mezzo joule ogni secondo in queste condizioni. Se scendesse anch’essa a 300 K, i due contributi avrebbero uguale valore e il saldo si annullerebbe. Entrambe le superfici continuerebbero a scambiare radiazione.",
    )
    add(
        "C4",
        21,
        "C4-L09",
        "Come ruota l’ago di Oersted",
        "Una bussola orizzontale è posta a nord di un filo rettilineo verticale. A corrente nulla il campo orizzontale di fondo vale 20 μT verso nord. Una corrente diretta verso l’alto produce nel punto della bussola un contributo di 15 μT. Prevedi direzione e modulo del campo letto dall’ago e l’effetto dell’inversione della corrente.",
        2,
        fig(
            "C4-bussola-nord",
            "Da sopra, la corrente esce dal foglio. La bussola si trova in P, a nord del filo. Il diagramma a destra usa la stessa origine per i due contributi al campo.",
        ),
        "Metti il pollice destro nel verso della corrente, cioè verso chi guarda il foglio. Le dita seguono linee antiorarie. Nel punto a nord del filo la tangente alla circonferenza punta a ovest. Si devono sommare questo contributo orizzontale e il campo di fondo verso nord.",
        eq(
            r"|\vec B|=\sqrt{(20\ \mu\mathrm T)^2+(15\ \mu\mathrm T)^2}=25\ \mu\mathrm T"
        ),
        eq(r"\tan\alpha=15/20=0{,}75\quad\Longrightarrow\quad\alpha\simeq36{,}9^\circ"),
        "Il polo nord dell’ago si orienta di circa 37° a ovest del nord. Invertendo la corrente, il campo del filo punta a est: l’ago devia di circa 37° a est del nord, con lo stesso modulo risultante. Spegnendo il filo resta il campo di fondo. È il confronto fra queste letture a rivelare l’effetto magnetico della corrente.",
    )
    add(
        "C5",
        21,
        "C5-L05",
        "Due fronti successivi, prima e dopo il passaggio",
        "Una sorgente si muove verso destra a 17 m/s in aria ferma e genera un impulso ogni 0,020 s. Il suono si propaga a 340 m/s. Due ricevitori fermi, uno davanti alla sorgente e uno dietro lungo la stessa retta, registrano gli impulsi. Quale li riceve più ravvicinati nel tempo? Verifica la previsione usando i primi due fronti.",
        2,
        fig(
            "C5-due-fronti",
            "Il primo impulso si è propagato nelle due direzioni. Il secondo nasce nel punto rosso, a destra della posizione iniziale tratteggiata. Le distanze sul segmento sono in scala.",
        ),
        "Fra due emissioni il primo fronte viaggia di 340 × 0,020 = 6,80 m rispetto all’aria. Nello stesso tempo la sorgente avanza di 17 × 0,020 = 0,34 m. Il nuovo fronte nasce più vicino alla posizione raggiunta dal primo fronte sul lato anteriore.",
        eq(
            r"d_{\rm avanti}=6{,}80-0{,}34=6{,}46\ \mathrm m,\qquad d_{\rm dietro}=6{,}80+0{,}34=7{,}14\ \mathrm m"
        ),
        "Ai due ricevitori fermi i fronti arrivano con la stessa velocità di propagazione c. Il tempo fra arrivi successivi è distanza fra fronti divisa per c.",
        eq(
            r"\Delta t_{\rm avanti}=6{,}46/340=0{,}0190\ \mathrm s,\qquad \Delta t_{\rm dietro}=7{,}14/340=0{,}0210\ \mathrm s"
        ),
        "Davanti gli arrivi sono più ravvicinati, quindi la frequenza ricevuta è maggiore di quella emessa; dietro gli arrivi sono più distanziati e la frequenza ricevuta è minore. Il ragionamento qualitativo nasce dal moto relativo lungo la linea di vista. Ogni fronte continua a propagarsi a 340 m/s nell’aria ferma.",
    )
    add(
        "C5",
        22,
        "C5-L06",
        "Riordinare sette segnali descritti in unità diverse",
        "Un archivio mescola un’onda radio di 100 MHz, microonde a 2,4 GHz e cinque segnali descritti dalla lunghezza d’onda nel vuoto: 10 μm, 500 nm, 300 nm, 0,10 nm di origine elettronica, 1,0 pm da transizione nucleare. Mettili in ordine di frequenza crescente e assegna le regioni dello spettro.",
        2,
        "Portiamo tutti i dati sulla stessa scala usando c = 3,00 × 10⁸ m/s nel vuoto. Un megahertz vale 10⁶ Hz, un gigahertz 10⁹ Hz. I primi due valori diventano 1,00 × 10⁸ Hz e 2,4 × 10⁹ Hz.",
        eq(
            r"f=\frac{c}{\lambda},\quad f_{10\,\mu\mathrm m}=\frac{3{,}00\cdot10^8}{10\cdot10^{-6}}=3{,}00\cdot10^{13}\ \mathrm{Hz}"
        ),
        eq(
            r"f_{500\,\mathrm{nm}}=6{,}00\cdot10^{14}\ \mathrm{Hz},\quad f_{300\,\mathrm{nm}}=1{,}00\cdot10^{15}\ \mathrm{Hz}"
        ),
        eq(
            r"f_{0{,}10\,\mathrm{nm}}=3{,}00\cdot10^{18}\ \mathrm{Hz},\quad f_{1{,}0\,\mathrm{pm}}=3{,}00\cdot10^{20}\ \mathrm{Hz}"
        ),
        fig(
            "C5-spettro",
            "Si legge la tavola nel verso della frequenza crescente. La lunghezza d’onda nel vuoto diminuisce nello stesso verso.",
        ),
        "Nell’ordine si incontrano radio, microonde, infrarosso, visibile, ultravioletto, raggi X e raggi gamma. Le microonde appartengono in senso ampio alle radiofrequenze; il programma le distingue come banda. Alle energie elevate le bande X e gamma possono sovrapporsi: in questo esempio l’origine elettronica o nucleare dei fotoni rende esplicita la denominazione.",
    )
    dst = ROOT / "content" / "esempi-di-copertura.json"
    temp = dst.with_suffix(".tmp")
    temp.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    temp.replace(dst)


if __name__ == "__main__":
    figures()
    build()
