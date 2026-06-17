#!/usr/bin/env python3
"""
ELAB Tutor — Collaborator Deck PDF
Beautiful PDF explaining the project, vision, and collaboration opportunity.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ─── Colors ────────────────────────────────────────────────
NAVY = HexColor("#1E4D8C")
LIME = HexColor("#7CB342")
VOL1_GREEN = HexColor("#7CB342")
VOL2_ORANGE = HexColor("#E8941C")
VOL3_RED = HexColor("#E54B3D")
DARK = HexColor("#1a1a2e")
LIGHT_BG = HexColor("#F8F9FA")
ACCENT = HexColor("#3498db")
SOFT_GRAY = HexColor("#6c757d")
WHITE = white

W, H = A4

# ─── Styles ────────────────────────────────────────────────
def make_styles():
    s = {}
    s['title'] = ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=28,
        textColor=NAVY, alignment=TA_LEFT, spaceAfter=6*mm, leading=34)
    s['subtitle'] = ParagraphStyle('Subtitle', fontName='Helvetica', fontSize=14,
        textColor=SOFT_GRAY, alignment=TA_LEFT, spaceAfter=8*mm, leading=18)
    s['h1'] = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=20,
        textColor=NAVY, spaceBefore=10*mm, spaceAfter=5*mm, leading=24)
    s['h2'] = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=14,
        textColor=VOL3_RED, spaceBefore=6*mm, spaceAfter=3*mm, leading=18)
    s['h3'] = ParagraphStyle('H3', fontName='Helvetica-Bold', fontSize=12,
        textColor=VOL2_ORANGE, spaceBefore=4*mm, spaceAfter=2*mm, leading=15)
    s['body'] = ParagraphStyle('Body', fontName='Helvetica', fontSize=10,
        textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=3*mm, leading=14)
    s['body_bold'] = ParagraphStyle('BodyBold', fontName='Helvetica-Bold', fontSize=10,
        textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=3*mm, leading=14)
    s['quote'] = ParagraphStyle('Quote', fontName='Helvetica-Oblique', fontSize=11,
        textColor=NAVY, alignment=TA_CENTER, spaceBefore=4*mm, spaceAfter=4*mm,
        leading=15, leftIndent=15*mm, rightIndent=15*mm)
    s['small'] = ParagraphStyle('Small', fontName='Helvetica', fontSize=8,
        textColor=SOFT_GRAY, alignment=TA_LEFT, spaceAfter=2*mm, leading=10)
    s['bullet'] = ParagraphStyle('Bullet', fontName='Helvetica', fontSize=10,
        textColor=DARK, alignment=TA_LEFT, spaceAfter=2*mm, leading=14,
        leftIndent=8*mm, bulletIndent=3*mm)
    s['center'] = ParagraphStyle('Center', fontName='Helvetica', fontSize=10,
        textColor=DARK, alignment=TA_CENTER, spaceAfter=3*mm, leading=14)
    s['big_number'] = ParagraphStyle('BigNum', fontName='Helvetica-Bold', fontSize=36,
        textColor=NAVY, alignment=TA_CENTER, leading=40)
    s['stat_label'] = ParagraphStyle('StatLabel', fontName='Helvetica', fontSize=9,
        textColor=SOFT_GRAY, alignment=TA_CENTER, leading=12)
    s['footer'] = ParagraphStyle('Footer', fontName='Helvetica', fontSize=7,
        textColor=SOFT_GRAY, alignment=TA_CENTER)
    return s

# ─── Page decorations ──────────────────────────────────────
def first_page(canvas, doc):
    canvas.saveState()
    # Top bar
    canvas.setFillColor(NAVY)
    canvas.rect(0, H - 8*mm, W, 8*mm, fill=1, stroke=0)
    # Three colored dots (volumes)
    for i, color in enumerate([VOL1_GREEN, VOL2_ORANGE, VOL3_RED]):
        canvas.setFillColor(color)
        canvas.circle(20*mm + i*12*mm, H - 4*mm, 2.5*mm, fill=1, stroke=0)
    # Bottom bar
    canvas.setFillColor(LIME)
    canvas.rect(0, 0, W, 3*mm, fill=1, stroke=0)
    canvas.restoreState()

def later_pages(canvas, doc):
    canvas.saveState()
    # Top thin line
    canvas.setStrokeColor(NAVY)
    canvas.setLineWidth(0.5)
    canvas.line(15*mm, H - 10*mm, W - 15*mm, H - 10*mm)
    # Header text
    canvas.setFillColor(SOFT_GRAY)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(15*mm, H - 9*mm, "ELAB Tutor — Collaborator Deck")
    canvas.drawRightString(W - 15*mm, H - 9*mm, f"Pagina {doc.page}")
    # Bottom bar
    canvas.setFillColor(LIME)
    canvas.rect(0, 0, W, 2*mm, fill=1, stroke=0)
    canvas.restoreState()

# ─── Helpers ───────────────────────────────────────────────
def colored_hr():
    return HRFlowable(width="100%", thickness=1, color=NAVY, spaceBefore=3*mm, spaceAfter=3*mm)

def bullet(text, styles):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", styles['bullet'])

def stat_box(number, label, color, styles):
    """Create a stat box for the metrics table."""
    num_style = ParagraphStyle('sn', fontName='Helvetica-Bold', fontSize=28,
        textColor=color, alignment=TA_CENTER, leading=32)
    lab_style = ParagraphStyle('sl', fontName='Helvetica', fontSize=8,
        textColor=SOFT_GRAY, alignment=TA_CENTER, leading=10)
    return [Paragraph(number, num_style), Paragraph(label, lab_style)]

# ─── Build document ────────────────────────────────────────
def build_pdf():
    output_path = os.path.join(os.path.dirname(__file__), "..", "ELAB-Collaborator-Deck.pdf")
    output_path = os.path.abspath(output_path)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        topMargin=18*mm,
        bottomMargin=15*mm,
        leftMargin=18*mm,
        rightMargin=18*mm,
    )

    S = make_styles()
    story = []

    # ════════════════════════════════════════════════════════
    # PAGE 1: COVER
    # ════════════════════════════════════════════════════════
    story.append(Spacer(1, 30*mm))
    story.append(Paragraph("ELAB Tutor", S['title']))
    story.append(Paragraph(
        "Un progetto coinvolgente di elettronica per le scuole.<br/>"
        "Ti spiego cos'e', a che punto siamo, e perche' dovresti darci un'occhiata.",
        S['subtitle']))

    story.append(Spacer(1, 8*mm))
    story.append(colored_hr())

    story.append(Paragraph(
        "<i>\"La corrente e' come l'acqua in un tubo. Il resistore e' una strettoia. "
        "Il LED? Un rubinetto magico che quando l'acqua passa... si accende una luce!\"</i>",
        S['quote']))

    story.append(Spacer(1, 15*mm))

    story.append(Paragraph(
        "Omaric Elettronica — Strambino (TO)<br/>Marzo 2026",
        S['center']))

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        "Scusa se non te l'ho mandato prima, ero impegnato<br/>"
        "a insegnare all'AI a capire le parolacce in napoletano.",
        ParagraphStyle('joke', fontName='Helvetica-Oblique', fontSize=9,
            textColor=SOFT_GRAY, alignment=TA_CENTER, leading=12, spaceBefore=3*mm)))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # PAGE 2: COS'E'
    # ════════════════════════════════════════════════════════
    story.append(Paragraph("Ok, ma cos'e'?", S['h1']))
    story.append(colored_hr())

    story.append(Paragraph(
        "ELAB e' un simulatore di elettronica per ragazzi di 10-14 anni. "
        "Ci sono 3 volumi con 69 esperimenti — dal primo LED fino a circuiti con Arduino. "
        "I volumi si comprano su Amazon insieme al kit di componenti veri.",
        S['body']))

    story.append(Paragraph(
        "Il punto non e' il ragazzino che lavora da solo. Il punto e' il <b>prof</b>. "
        "Pensa a un prof di italiano che deve fare supplenza di tecnologia. "
        "Apre ELAB alla LIM, chiede all'AI \"spiegami cos'e' un LED come se fossi un ragazzino\", "
        "e l'AI gli da' le parole giuste, le analogie, il prossimo passo. "
        "Il prof fa la lezione, i ragazzi si divertono, nessuno si sente incompetente.",
        S['body']))

    story.append(Paragraph(
        "L'AI non sostituisce il prof — gli da' le armi per fare bella figura.",
        S['body_bold']))

    story.append(Paragraph("In pratica dentro c'e':", S['h2']))
    story.append(bullet("Un simulatore dove costruisci circuiti su una breadboard virtuale", S))
    story.append(bullet("Puoi scrivere codice Arduino C++ o usare i blocchi (tipo Scratch)", S))
    story.append(bullet("Un assistente AI che capisce cosa vuoi e agisce — "
        "carica esperimenti, piazza componenti, fa diagnosi, spiega concetti", S))
    story.append(bullet("L'AI puo' anche guardare il circuito con la camera e dirti cosa non va", S))
    story.append(bullet("Giochi: Trova il Guasto, Circuito Misterioso, Reverse Engineering", S))

    story.append(Paragraph(
        "Il linguaggio e' quello dei volumi — analogie tipo \"la corrente e' come l'acqua\", "
        "niente paroloni, niente formule. Deve essere divertente.",
        S['body']))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # PAGE 3: CHI SIAMO
    # ════════════════════════════════════════════════════════
    story.append(Paragraph("Chi c'e' dietro", S['h1']))
    story.append(colored_hr())

    story.append(Paragraph(
        "<b>Riccardo Franzoso</b> ha creato i volumi ELAB e l'idea del progetto. "
        "L'azienda e' <b>Omaric Elettronica</b>, Strambino (TO) — producono schede elettroniche "
        "e i kit che i ragazzi usano a scuola.",
        S['body']))

    story.append(Paragraph(
        "<b>Giovanni Fagherazzi</b> si occupa della parte commerciale. "
        "Prima faceva il Global Sales Director ad Arduino — si', quella Arduino.",
        S['body']))

    story.append(Paragraph(
        "<b>Io sono Andrea</b>. Ho scritto tutto il software: il simulatore, l'AI, il sito, "
        "i deploy, il fine-tuning dei modelli. Non vengo pagato — gli accordi sono su royalties "
        "e proprieta' intellettuale, il che al momento significa che ci guadagno "
        "esperienza e la soddisfazione di aver fatto una cosa che funziona.",
        S['body']))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # PAGE 4: A CHE PUNTO SIAMO
    # ════════════════════════════════════════════════════════
    story.append(Paragraph("A che punto siamo (onestamente)", S['h1']))
    story.append(colored_hr())

    story.append(Paragraph("Cosa funziona", S['h2']))
    story.append(bullet("Il simulatore c'e' e funziona: 21 componenti, 69 esperimenti, "
        "editor codice, editor a blocchi. Il codice Arduino gira per davvero, non e' finto", S))
    story.append(bullet("L'AI risponde, capisce cosa vuoi, piazza componenti, fa diagnosi, "
        "spiega le cose. Puo' guardare il circuito con la camera", S))
    story.append(bullet("Tutto e' online e deployato: sito su Netlify, piattaforma su Vercel, "
        "AI su Render", S))
    story.append(bullet("Su iPad va. Non benissimo, ma va", S))

    story.append(Paragraph("Cosa non va", S['h2']))
    story.append(bullet("L'AI dipende al 100% dal cloud — senza internet non funziona. "
        "E i servizi che usiamo (DeepSeek, Groq, Google) possono cambiare prezzi o sparire", S))
    story.append(bullet("Il routing dell'AI e' fatto con 200+ regex. "
        "Funziona, ma e' un incubo da mantenere e ogni tanto sbaglia", S))
    story.append(bullet("La grafica del simulatore e' funzionale ma non bella. "
        "CSS inconsistente, qualche pezzo non e' responsive come dovrebbe", S))
    story.append(bullet("Il server AI su Render si spegne dopo inattivita'. "
        "Quando si risveglia ci mette 30 secondi. Non ideale", S))
    story.append(bullet("La fisica dei circuiti e' semplificata — "
        "i circuiti DC funzionano bene, ma non simula condensatori o transitori", S))
    story.append(bullet("Nessun ricavo. Zero. Il progetto non guadagna ancora niente", S))

    story.append(Paragraph("Cosa stiamo provando", S['h2']))
    story.append(Paragraph(
        "Abbiamo iniziato ad addestrare un modello AI nostro (piccolo, 4 miliardi di parametri) "
        "per gestire il routing senza cloud. Il proof of concept funziona, "
        "ma servono piu' dati e un training piu' serio. L'obiettivo e' che la maggior parte "
        "delle richieste non debba mai uscire dal PC.",
        S['body']))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # PAGE 5: DOVE VOGLIAMO ANDARE
    # ════════════════════════════════════════════════════════
    story.append(Paragraph("Dove vorremmo andare", S['h1']))
    story.append(colored_hr())

    story.append(Paragraph(
        "Il sogno e' che un prof accenda il PC a scuola, apra ELAB, "
        "e faccia lezione di elettronica senza internet, senza cloud, senza niente. "
        "Tutto locale. Per ora e' un sogno, ma ci stiamo lavorando.",
        S['body']))

    story.append(Paragraph("Le cose concrete da fare:", S['h2']))
    story.append(bullet("Addestrare l'AI a gestire il contesto ELAB senza cloud", S))
    story.append(bullet("Farlo girare su PC normali (senza GPU costose)", S))
    story.append(bullet("Dare memoria all'AI — che si ricordi il prof, le sue preferenze, "
        "dove era rimasto", S))
    story.append(bullet("Fare in modo che il prof possa dire \"fammi una lezione sul LED\" "
        "e l'AI prepari tutto", S))
    story.append(bullet("Rendere il simulatore piu' bello, non solo funzionale", S))

    story.append(Paragraph("E poi, chissa':", S['h2']))
    story.append(bullet("Collegare il kit vero al simulatore via USB", S))
    story.append(bullet("Vendere licenze alle scuole", S))
    story.append(bullet("Usare la stessa architettura per chimica, fisica, biologia", S))

    story.append(Paragraph(
        "Magari non succede niente di tutto questo. Ma magari si'. "
        "In ogni caso, il progetto e' gia' interessante cosi' com'e'.",
        S['body']))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # PAGE 6: VUOI DARE UNA MANO?
    # ════════════════════════════════════════════════════════
    story.append(Paragraph("Vuoi dare una mano?", S['h1']))
    story.append(colored_hr())

    story.append(Paragraph(
        "Non ci sono soldi. Io non vengo pagato, nessuno viene pagato. "
        "Il progetto non genera ricavi. Se cerchi uno stipendio, non e' il posto giusto.",
        S['body']))

    story.append(Paragraph(
        "Pero' e' un progetto figo su cui lavorare.",
        S['body_bold']))

    story.append(Paragraph(
        "Se contribuisci in modo significativo, ci sono accordi seri: "
        "royalties sulla proprieta' intellettuale, contratti veri, "
        "tutto scritto e firmato. Non promesse a voce — "
        "roba che se un giorno il progetto funziona, ci guadagni anche tu.",
        S['body']))

    story.append(Paragraph(
        "Non ti dico che diventerai ricco. Ti dico che lavorerai su roba vera "
        "(AI, simulazione, deploy) per un progetto che ha senso. "
        "E che potrai metterlo sul CV senza vergognarti.",
        S['body']))

    story.append(Paragraph("Cosa potresti fare:", S['h2']))
    story.append(bullet("AI — addestrare modelli, generare dati di training, integrare memoria", S))
    story.append(bullet("Frontend — migliorare il simulatore, farlo piu' bello e usabile", S))
    story.append(bullet("Backend — server, deploy, infrastruttura", S))
    story.append(bullet("Design — interfaccia per bambini, animazioni", S))
    story.append(bullet("Contenuti — esperimenti, spiegazioni, quiz", S))
    story.append(bullet("Quello che sai fare tu e che a me serve — dimmi", S))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # PAGE 7: CONTATTI
    # ════════════════════════════════════════════════════════
    story.append(Paragraph("Provalo", S['h1']))
    story.append(colored_hr())

    story.append(bullet("<b>Piattaforma</b>: https://www.elabtutor.school", S))
    story.append(bullet("<b>Sito</b>: https://funny-pika-3d1029.netlify.app", S))

    story.append(Spacer(1, 10*mm))
    story.append(Paragraph(
        "Se ti interessa, scrivimi. Anche solo per curiosita'.",
        S['body']))

    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        "<b>Andrea</b> — 346 165 3930",
        S['body']))

    story.append(Spacer(1, 25*mm))
    story.append(colored_hr())
    story.append(Paragraph(
        "Andrea Marro — Marzo 2026",
        S['footer']))

    # Build
    doc.build(story, onFirstPage=first_page, onLaterPages=later_pages)
    print(f"PDF creato: {output_path}")
    return output_path

if __name__ == "__main__":
    build_pdf()
