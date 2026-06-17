#!/usr/bin/env python3
"""
ELAB Business Case PDF Generator
Genera un PDF professionale di 7 pagine per il business case ELAB.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
import os

# ── Colors ──
NAVY = HexColor('#1E4D8C')
LIME = HexColor('#4A7A25')
ORANGE = HexColor('#E8941C')
RED = HexColor('#E54B3D')
LIGHT_GRAY = HexColor('#F5F5F5')
DARK_GRAY = HexColor('#333333')
MID_GRAY = HexColor('#666666')
WHITE = white
LIGHT_NAVY = HexColor('#E8EDF5')
LIGHT_LIME = HexColor('#EFF5E8')

WIDTH, HEIGHT = A4

# ── Styles ──
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'ELABTitle', parent=styles['Title'],
    fontName='Helvetica-Bold', fontSize=28, leading=34,
    textColor=NAVY, spaceAfter=6*mm, alignment=TA_LEFT
)

subtitle_style = ParagraphStyle(
    'ELABSubtitle', parent=styles['Normal'],
    fontName='Helvetica', fontSize=14, leading=18,
    textColor=MID_GRAY, spaceAfter=10*mm, alignment=TA_LEFT
)

h1_style = ParagraphStyle(
    'ELABH1', parent=styles['Heading1'],
    fontName='Helvetica-Bold', fontSize=20, leading=24,
    textColor=NAVY, spaceBefore=8*mm, spaceAfter=4*mm
)

h2_style = ParagraphStyle(
    'ELABH2', parent=styles['Heading2'],
    fontName='Helvetica-Bold', fontSize=14, leading=18,
    textColor=NAVY, spaceBefore=5*mm, spaceAfter=3*mm
)

body_style = ParagraphStyle(
    'ELABBody', parent=styles['Normal'],
    fontName='Helvetica', fontSize=10.5, leading=15,
    textColor=DARK_GRAY, spaceAfter=3*mm, alignment=TA_JUSTIFY
)

bullet_style = ParagraphStyle(
    'ELABBullet', parent=body_style,
    leftIndent=8*mm, bulletIndent=3*mm,
    spaceBefore=1*mm, spaceAfter=1*mm
)

small_style = ParagraphStyle(
    'ELABSmall', parent=body_style,
    fontSize=9, leading=12, textColor=MID_GRAY
)

bold_body = ParagraphStyle(
    'ELABBoldBody', parent=body_style,
    fontName='Helvetica-Bold'
)

center_style = ParagraphStyle(
    'ELABCenter', parent=body_style,
    alignment=TA_CENTER
)

highlight_style = ParagraphStyle(
    'ELABHighlight', parent=body_style,
    fontName='Helvetica-Bold', fontSize=16, leading=20,
    textColor=LIME, alignment=TA_CENTER, spaceBefore=4*mm, spaceAfter=4*mm
)

def make_table_style(has_header=True):
    """Standard ELAB table style"""
    cmds = [
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('LEADING', (0, 0), (-1, -1), 13),
        ('TEXTCOLOR', (0, 0), (-1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
    ]
    if has_header:
        cmds += [
            ('BACKGROUND', (0, 0), (-1, 0), NAVY),
            ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
        ]
    # Alternate row colors
    cmds.append(('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]))
    return TableStyle(cmds)


def add_page_number(canvas_obj, doc):
    """Footer with page number and branding"""
    canvas_obj.saveState()
    # Footer line
    canvas_obj.setStrokeColor(NAVY)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(20*mm, 15*mm, WIDTH - 20*mm, 15*mm)
    # Page number
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(MID_GRAY)
    canvas_obj.drawCentredString(WIDTH / 2, 10*mm, f"ELAB Business Case  |  Pagina {doc.page}")
    # Date
    canvas_obj.drawString(20*mm, 10*mm, "Aprile 2026")
    canvas_obj.drawRightString(WIDTH - 20*mm, 10*mm, "Confidenziale")
    canvas_obj.restoreState()


def build_cover_page():
    """Page 1: Cover + Executive Summary"""
    elements = []
    elements.append(Spacer(1, 25*mm))

    # Title block
    elements.append(Paragraph("ELAB Tutor", title_style))
    elements.append(Paragraph(
        "Business Case: Modello AI-as-a-Service per Scuole",
        subtitle_style
    ))
    elements.append(Spacer(1, 5*mm))

    # Colored bar
    bar_data = [['', '', '']]
    bar = Table(bar_data, colWidths=[56*mm, 56*mm, 56*mm], rowHeights=[3*mm])
    bar.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), LIME),
        ('BACKGROUND', (1, 0), (1, 0), ORANGE),
        ('BACKGROUND', (2, 0), (2, 0), RED),
        ('LINEBELOW', (0, 0), (-1, 0), 0, WHITE),
    ]))
    elements.append(bar)
    elements.append(Spacer(1, 8*mm))

    # Executive Summary
    elements.append(Paragraph("Executive Summary", h1_style))
    elements.append(Paragraph(
        "<b>ELAB Tutor</b> e' il primo simulatore di elettronica con tutor AI integrato "
        "progettato specificamente per le scuole secondarie italiane (10-14 anni). "
        "Combina un kit fisico con un simulatore digitale e un assistente AI pedagogico "
        "chiamato <b>UNLIM</b>.",
        body_style
    ))
    elements.append(Spacer(1, 3*mm))

    # Key metrics boxes
    metrics = [
        ['Prezzo', 'Costo reale', 'Margine'],
        ['20 EUR/classe/mese', '0.50-3.30 EUR/classe/mese', '82-96%'],
    ]
    metrics_table = Table(metrics, colWidths=[56*mm, 56*mm, 56*mm], rowHeights=[8*mm, 14*mm])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (0, 1), LIGHT_LIME),
        ('BACKGROUND', (1, 1), (1, 1), LIGHT_NAVY),
        ('BACKGROUND', (2, 1), (2, 1), LIGHT_LIME),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, 1), 14),
        ('TEXTCOLOR', (0, 1), (-1, 1), NAVY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, WHITE),
        ('BOX', (0, 0), (-1, -1), 1, NAVY),
    ]))
    elements.append(metrics_table)
    elements.append(Spacer(1, 6*mm))

    elements.append(Paragraph(
        "<b>Il modello:</b> La scuola paga un abbonamento mensile a ELAB che include "
        "l'accesso completo al tutor AI. ELAB utilizza le API Gemini di Google nel backend, "
        "con un sistema di routing intelligente che ottimizza i costi mantenendo la massima "
        "qualita' pedagogica. La scuola non interagisce mai direttamente con Google o altri "
        "provider AI.",
        body_style
    ))
    elements.append(Paragraph(
        "Questo modello e' identico a quello di <b>Cursor</b>, <b>Replit</b> e <b>Windsurf</b>: "
        "il cliente paga il prodotto, non l'AI. L'AI e' un ingrediente invisibile.",
        body_style
    ))

    # Risks - ONESTI
    elements.append(Spacer(1, 4*mm))
    elements.append(Paragraph("Rischi e Limiti (onesti)", h2_style))
    risks_data = [
        ['Rischio', 'Probabilita\'', 'Impatto', 'Mitigazione'],
        ['Google cambia pricing\nGemini', 'Media', 'Alto', 'Switch a Claude API in 1 giorno\n(stessa architettura)'],
        ['Teacher Dashboard\nancora senza Supabase', 'Reale (oggi)', 'Alto', 'Schema SQL pronto.\nServono 2h per configurare.'],
        ['1 solo sviluppatore\n(Andrea)', 'Alta', 'Critico', 'Codice documentato.\nBus factor = 1.'],
        ['Competitor (Arduino\nEducation)', 'Bassa\n(12-18 mesi)', 'Medio', 'Giovanni conosce i tempi\ndi Arduino dall\'interno.'],
        ['Cold start Edge\nFunctions (~19s)', 'Certa', 'Basso', 'Warmup cron ogni 14 min.\nSolo prima chiamata.'],
        ['UNLIM hallucina\nsu contenuti volumi', 'Media', 'Medio', 'RAG dai PDF + prompt\n"usa stesse parole volume"'],
    ]
    risks_table = Table(risks_data, colWidths=[34*mm, 22*mm, 18*mm, 68*mm])
    rts = make_table_style()
    rts.add('FONTSIZE', (0, 0), (-1, -1), 8.5)
    rts.add('LEADING', (0, 0), (-1, -1), 10.5)
    rts.add('VALIGN', (0, 0), (-1, -1), 'TOP')
    risks_table.setStyle(rts)
    elements.append(risks_table)

    # Team
    elements.append(Spacer(1, 4*mm))
    elements.append(Paragraph("Il Team", h2_style))
    team_data = [
        ['Ruolo', 'Persona', 'Background'],
        ['Strategia commerciale', 'Giovanni Fagherazzi', 'Ex Global Sales Director, Arduino'],
        ['Produzione hardware', 'Omaric Elettronica (Strambino/TO)', 'Filiera storica Arduino Italia'],
        ['Procurement PA (MePA)', 'Davide Fagherazzi', 'Acquisti pubblici'],
        ['Sviluppo software + AI', 'Andrea Marro', 'Full-stack developer'],
        ['Implementazione tecnica', 'Kirill Pilipchuk', 'Arduino specialist'],
        ['Strategia', 'Giuseppe Ferrara', 'Ex CFO'],
        ['Iniziativa AI', 'Lino Moretto', 'Driver progetto AI'],
    ]
    team_table = Table(team_data, colWidths=[42*mm, 52*mm, 74*mm])
    team_table.setStyle(make_table_style())
    elements.append(team_table)

    return elements


def build_page2():
    """Page 2: Analisi Alternative AI"""
    elements = [PageBreak()]
    elements.append(Paragraph("Analisi Alternative AI", h1_style))
    elements.append(Paragraph(
        "Abbiamo valutato 5 approcci per fornire AI tutoring alle scuole. "
        "L'obiettivo: massima qualita' pedagogica al minimo costo ricorrente, "
        "con scalabilita' da 1 a 1.000 classi.",
        body_style
    ))
    elements.append(Spacer(1, 3*mm))

    data = [
        ['Alternativa', 'Costo mensile', 'Pro', 'Contro', ''],
        [
            'Modello custom\n(fine-tuning)',
            '5.000-50.000 EUR\nsetup + 500 EUR/mese',
            'Controllo totale',
            'Costo proibitivo,\nmanutenzione continua,\nqualita\' < Gemini',
            'SCARTATO'
        ],
        [
            'Modello locale\n(Ollama/vLLM)',
            '10-40 EUR/mese\nVPS',
            'Zero costi API,\nprivacy totale',
            'Qualita\' 10x inferiore,\nGPU costosa,\nmanutenzione',
            'SOLO\nFALLBACK'
        ],
        [
            'Cluster GPU\ndedicato',
            '1.000-5.000 EUR\n/mese',
            'Performance\ngarantita',
            'Costo fisso enorme,\noverprovisioning',
            'SCARTATO'
        ],
        [
            'Server dedicato\n(A100/H100)',
            '2.000-10.000 EUR\n/mese',
            'Latenza minima',
            'Insostenibile\nper startup',
            'SCARTATO'
        ],
        [
            'API pay-per-use\n(Gemini)',
            '0.50-3.30 EUR\n/classe/mese',
            'Scalabile,\nzero infrastruttura,\nqualita\' top',
            'Dipendenza\nda Google',
            'SCELTO'
        ],
    ]

    col_widths = [32*mm, 32*mm, 32*mm, 38*mm, 24*mm]
    table = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('LEADING', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (-1, -1), DARK_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        # SCELTO row highlight
        ('BACKGROUND', (0, -1), (-1, -1), LIGHT_LIME),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        # Verdict column
        ('ALIGN', (-1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (-1, 1), (-1, -2), 'Helvetica-Bold'),
        ('TEXTCOLOR', (-1, 1), (-1, -2), RED),
        ('TEXTCOLOR', (-1, -1), (-1, -1), LIME),
        ('FONTSIZE', (-1, 1), (-1, -1), 9),
    ]
    table.setStyle(TableStyle(style_cmds))
    elements.append(table)
    elements.append(Spacer(1, 6*mm))

    # Why Gemini section
    elements.append(Paragraph("Perche' Gemini e non Claude o GPT?", h2_style))
    reasons = [
        "<b>Costo:</b> Gemini Flash-Lite costa 0.25 USD/1M token input — 10x meno di GPT-4o mini, 4x meno di Claude Haiku.",
        "<b>Qualita':</b> Gemini 3 Flash e Pro sono competitivi con GPT-4o e Claude Sonnet per task educativi.",
        "<b>Vision:</b> Gemini supporta nativamente immagini (foto circuiti reali) a costo quasi zero.",
        "<b>Multilingua:</b> Italiano eccellente — critico per target 10-14 anni.",
        "<b>Scaling:</b> 15 RPM free tier, poi pay-per-use. Nessun commitment minimo.",
        "<b>Fallback:</b> Se Google cambia pricing, switch a Claude API in 1 giorno (stessa architettura).",
    ]
    for r in reasons:
        elements.append(Paragraph(r, bullet_style, bulletText='\xe2\x80\xa2'))

    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph("Principio Zero: Mitigazione Rischio", h2_style))
    elements.append(Paragraph(
        "Solo il <b>docente</b> interagisce con UNLIM (non gli studenti direttamente). "
        "Questo riduce il volume di chiamate API da ~2.000 msg/mese/classe a ~300 msg/mese/classe, "
        "riducendo i costi del 85% e eliminando rischi di uso improprio da parte dei minori.",
        body_style
    ))

    return elements


def build_page3():
    """Page 3: Costi Dettagliati"""
    elements = [PageBreak()]
    elements.append(Paragraph("Costi Dettagliati del Modello Scelto", h1_style))

    # Routing breakdown
    elements.append(Paragraph("Sistema di Routing Intelligente", h2_style))
    elements.append(Paragraph(
        "UNLIM instrada automaticamente ogni domanda al modello AI ottimale "
        "in base alla complessita'. Il 70% delle domande usa il modello piu' economico.",
        body_style
    ))

    routing_data = [
        ['Modello', 'Quota', 'Costo Input\n(USD/1M tok)', 'Costo Output\n(USD/1M tok)', 'Uso tipico'],
        ['Gemini 3.1\nFlash-Lite', '70%', '$0.25', '$1.50', 'Saluti, quiz, azioni\nsemplici, conferme'],
        ['Gemini 3\nFlash', '25%', '$0.50', '$3.00', 'Spiegazioni, ragionamento,\nperche\', confronti'],
        ['Gemini 3.1\nPro', '5%', '$2.00', '$12.00', 'Analisi circuiti complessi,\ndebug, diagnosi'],
    ]
    routing_table = Table(routing_data, colWidths=[28*mm, 16*mm, 24*mm, 24*mm, 50*mm])
    routing_table.setStyle(make_table_style())
    elements.append(routing_table)
    elements.append(Spacer(1, 5*mm))

    # Cost calculation
    elements.append(Paragraph("Calcolo Costo per Classe", h2_style))
    elements.append(Paragraph(
        "Ipotesi: 300 messaggi/mese per classe (solo docente), ~200 token/messaggio medio.",
        body_style
    ))

    cost_data = [
        ['Voce', 'Calcolo', 'Costo/mese'],
        ['API Gemini\n(media ponderata)', '300 msg x 200 tok x blend rate', '0.50 - 1.10 EUR'],
        ['Voxtral TTS\n(VPS condiviso)', '10 EUR fisso / N classi', '0.10 - 1.00 EUR'],
        ['Supabase\n(free tier)', 'Database + Edge Functions', '0.00 EUR'],
        ['Brain fallback\n(VPS condiviso)', 'Incluso nel VPS Voxtral', '0.00 EUR'],
        ['', '', ''],
        ['TOTALE per classe', '', '0.60 - 2.10 EUR'],
    ]
    cost_table = Table(cost_data, colWidths=[42*mm, 62*mm, 38*mm])
    ts = make_table_style()
    ts.add('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold')
    ts.add('BACKGROUND', (0, -1), (-1, -1), LIGHT_LIME)
    ts.add('SPAN', (0, -2), (-1, -2))
    ts.add('BACKGROUND', (0, -2), (-1, -2), WHITE)
    ts.add('LINEBELOW', (0, -2), (-1, -2), 0, WHITE)
    cost_table.setStyle(ts)
    elements.append(cost_table)
    elements.append(Spacer(1, 5*mm))

    # Infrastructure
    elements.append(Paragraph("Infrastruttura Fissa", h2_style))
    infra_data = [
        ['Servizio', 'Costo/mese', 'Note'],
        ['Supabase (free tier)', '0 EUR', 'Database + 5 Edge Functions + auth'],
        ['VPS (Voxtral + Brain)', '10-25 EUR', 'TTS voce naturale + AI fallback'],
        ['Vercel (free tier)', '0 EUR', 'Frontend hosting + CDN'],
        ['Dominio', '~1 EUR', 'elab-tutor.it'],
        ['TOTALE fisso', '11-27 EUR', 'Coperto dalla prima classe'],
    ]
    infra_table = Table(infra_data, colWidths=[42*mm, 28*mm, 72*mm])
    ts2 = make_table_style()
    ts2.add('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold')
    ts2.add('BACKGROUND', (0, -1), (-1, -1), LIGHT_NAVY)
    infra_table.setStyle(ts2)
    elements.append(infra_table)

    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph(
        "<b>Break-even:</b> Con 1 sola classe abbonata (20 EUR/mese), tutti i costi fissi "
        "sono gia' coperti. Dalla seconda classe in poi, e' puro margine.",
        bold_body
    ))

    return elements


def build_page4():
    """Page 4: Modelli di Ammortamento"""
    elements = [PageBreak()]
    elements.append(Paragraph("Modelli di Ammortamento", h1_style))
    elements.append(Paragraph(
        "Cinque strategie di pricing valutate. Il modello consigliato e' l'abbonamento "
        "mensile per classe, che bilancia semplicita', revenue ricorrente e scalabilita'.",
        body_style
    ))
    elements.append(Spacer(1, 3*mm))

    pricing_data = [
        ['Modello', 'Prezzo', 'Margine', 'Revenue\nricorrente', 'Complessita\'', 'Consigliato'],
        [
            'Kit + licenza inclusa\n(una tantum)',
            '300 EUR\nuna tantum',
            '0%\nricorrente',
            'No',
            'Bassa',
            'No'
        ],
        [
            'Abbonamento\nmensile per classe',
            '20 EUR\n/classe/mese',
            '82-96%',
            'Si\'',
            'Bassa',
            'SI\''
        ],
        [
            'Freemium\n(base + premium)',
            'Base gratis\nPremium 20 EUR',
            '82-96%\n(su premium)',
            'Si\'',
            'Media',
            'Futuro'
        ],
        [
            'Per-studente',
            '2 EUR\n/studente/mese',
            '~80%',
            'Si\'',
            'Alta',
            'No'
        ],
        [
            'Licenza annuale\n(sconto 25%)',
            '180 EUR\n/classe/anno',
            '82%',
            'Si\'\n(annuale)',
            'Bassa',
            'Opzione'
        ],
    ]
    pricing_table = Table(pricing_data, colWidths=[30*mm, 24*mm, 20*mm, 22*mm, 24*mm, 24*mm])
    ts = make_table_style()
    # Highlight recommended row
    ts.add('BACKGROUND', (0, 2), (-1, 2), LIGHT_LIME)
    ts.add('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold')
    pricing_table.setStyle(ts)
    elements.append(pricing_table)
    elements.append(Spacer(1, 6*mm))

    # Rationale
    elements.append(Paragraph("Perche' l'Abbonamento Mensile per Classe", h2_style))
    rationale = [
        "<b>Semplicita':</b> Un prezzo, una fattura. Il dirigente scolastico capisce subito.",
        "<b>MePA-ready:</b> Abbonamento software e' una categoria standard su MePA.",
        "<b>PNRR-compatibile:</b> Rientra nel 60% budget obbligatorio per dotazioni digitali.",
        "<b>Revenue ricorrente:</b> Prevedibile, scalabile, con margini crescenti.",
        "<b>Upsell naturale:</b> Da 1 classe a tutte le classi dell'istituto.",
        "<b>Nessun lock-in hardware:</b> Il kit funziona anche senza abbonamento (solo senza AI).",
        "<b>Integrabile con altri contenuti:</b> L'abbonamento e' una piattaforma. "
        "Nuovi volumi, nuove materie (scienze, coding), contenuti di terze parti "
        "possono essere aggiunti senza cambiare il modello di pricing.",
    ]
    for r in rationale:
        elements.append(Paragraph(r, bullet_style, bulletText='\xe2\x80\xa2'))

    elements.append(Spacer(1, 5*mm))
    elements.append(Paragraph("Compatibilita' PNRR Scuola 4.0", h2_style))
    elements.append(Paragraph(
        "Il Piano Nazionale di Ripresa e Resilienza (PNRR) Scuola 4.0 ha stanziato "
        "<b>2,1 miliardi di euro</b> per 100.000 classi. La deadline di rendicontazione "
        "e' il <b>30 giugno 2026</b>. Il 60% del budget deve essere speso in dotazioni digitali "
        "(software incluso). Una licenza ELAB rientra perfettamente in questa categoria.",
        body_style
    ))
    elements.append(Paragraph(
        "<b>Finestra commerciale:</b> Le scuole hanno budget allocato ma non speso. "
        "ELAB deve essere acquistabile su MePA entro maggio 2026 per catturare "
        "gli acquisti dell'ultimo momento.",
        bold_body
    ))

    return elements


def build_page5():
    """Page 5: Proiezioni Finanziarie"""
    elements = [PageBreak()]
    elements.append(Paragraph("Proiezioni Finanziarie", h1_style))
    elements.append(Paragraph(
        "Proiezioni conservative basate su un prezzo di 20 EUR/classe/mese "
        "e un costo medio di 1.10 EUR/classe/mese (API + infrastruttura pro-rata).",
        body_style
    ))
    elements.append(Spacer(1, 3*mm))

    # 3-year projection
    elements.append(Paragraph("Proiezione a 3 Anni", h2_style))
    proj_data = [
        ['', 'Anno 1', 'Anno 2', 'Anno 3'],
        ['Classi attive', '50', '200', '500'],
        ['Ricavo annuo', '12.000 EUR', '48.000 EUR', '120.000 EUR'],
        ['Costi API (variabili)', '660 EUR', '2.640 EUR', '6.600 EUR'],
        ['Costi fissi (VPS+dominio)', '300 EUR', '500 EUR', '1.000 EUR'],
        ['Costi totali', '960 EUR', '3.140 EUR', '7.600 EUR'],
        ['Margine lordo', '11.040 EUR', '44.860 EUR', '112.400 EUR'],
        ['Margine %', '92%', '93.5%', '93.7%'],
    ]
    proj_table = Table(proj_data, colWidths=[38*mm, 36*mm, 36*mm, 36*mm])
    ts = make_table_style()
    ts.add('FONTNAME', (0, -2), (-1, -2), 'Helvetica-Bold')
    ts.add('BACKGROUND', (0, -2), (-1, -2), LIGHT_LIME)
    ts.add('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold')
    ts.add('BACKGROUND', (0, -1), (-1, -1), LIGHT_LIME)
    ts.add('ALIGN', (1, 0), (-1, -1), 'CENTER')
    proj_table.setStyle(ts)
    elements.append(proj_table)
    elements.append(Spacer(1, 6*mm))

    # Scaling
    elements.append(Paragraph("Effetto Scala", h2_style))
    scale_data = [
        ['Classi', 'Ricavo/mese', 'Costo/mese', 'Margine/mese', 'Margine %'],
        ['1', '20 EUR', '12 EUR', '8 EUR', '40%'],
        ['10', '200 EUR', '22 EUR', '178 EUR', '89%'],
        ['50', '1.000 EUR', '66 EUR', '934 EUR', '93.4%'],
        ['100', '2.000 EUR', '121 EUR', '1.879 EUR', '94%'],
        ['500', '10.000 EUR', '561 EUR', '9.439 EUR', '94.4%'],
        ['1.000', '20.000 EUR', '1.111 EUR', '18.889 EUR', '94.4%'],
    ]
    scale_table = Table(scale_data, colWidths=[20*mm, 28*mm, 28*mm, 30*mm, 24*mm])
    ts2 = make_table_style()
    ts2.add('ALIGN', (1, 0), (-1, -1), 'CENTER')
    scale_table.setStyle(ts2)
    elements.append(scale_table)
    elements.append(Spacer(1, 5*mm))

    elements.append(Paragraph(
        "<b>Nota:</b> I costi fissi (VPS, dominio) non crescono linearmente. "
        "Fino a ~200 classi, il VPS da 10 EUR/mese e' sufficiente. "
        "Il free tier di Supabase supporta fino a 500 classi senza costi aggiuntivi. "
        "Il break-even e' raggiunto dal <b>primo mese</b> con una sola classe.",
        body_style
    ))

    elements.append(Spacer(1, 4*mm))
    elements.append(Paragraph(
        "Margine operativo medio atteso: 92-94%",
        highlight_style
    ))

    return elements


def build_page6():
    """Page 6: Vantaggi Competitivi"""
    elements = [PageBreak()]
    elements.append(Paragraph("Vantaggi Competitivi", h1_style))

    comp_data = [
        ['Feature', 'ELAB', 'Tinkercad', 'Wokwi', 'Arduino CTC'],
        ['Simulatore circuiti', 'SI\'', 'SI\'', 'SI\'', 'NO'],
        ['AI Tutor pedagogico', 'UNLIM\n(14 azioni)', 'NO', 'NO', 'NO'],
        ['Voce naturale (TTS)', 'Voxtral\n(GDPR-safe)', 'NO', 'NO', 'NO'],
        ['Kit fisico integrato', 'SI\'\n(Omaric)', 'NO', 'NO', 'SI\'\n(1.830 EUR)'],
        ['Curriculum italiano', 'SI\'\n(62 esperimenti)', 'NO', 'NO', 'Parziale'],
        ['Target 10-14 anni', 'SI\'', 'Generico', '18+', '14+'],
        ['Prezzo/classe/mese', '20 EUR', 'Gratis', '7-25 USD', '76 EUR\n/studente'],
        ['Offline support', 'SI\'\n(HEX precompilati)', 'NO', 'NO', 'NO'],
        ['GDPR minori', 'SI\'\n(art. 8)', 'No\n(US)', 'No\n(US)', 'Parziale'],
        ['Scratch/Blockly', 'SI\'', 'NO', 'NO', 'NO'],
    ]
    comp_table = Table(comp_data, colWidths=[32*mm, 30*mm, 24*mm, 24*mm, 28*mm])
    ts = make_table_style()
    ts.add('FONTSIZE', (0, 0), (-1, -1), 8)
    ts.add('LEADING', (0, 0), (-1, -1), 10)
    comp_table.setStyle(ts)
    elements.append(comp_table)
    elements.append(Spacer(1, 6*mm))

    # Moat
    elements.append(Paragraph("Moat Competitivo", h2_style))
    moats = [
        "<b>UNLIM Onnipotente:</b> L'AI non si limita a rispondere — controlla il simulatore. "
        "Puo' aggiungere componenti, compilare codice, caricare esperimenti, evidenziare errori. "
        "14 azioni + sistema INTENT. Nessun competitor ha questo.",
        "<b>Kit + Digitale = Un Prodotto:</b> Il kit fisico (Omaric, Strambino) e il software "
        "sono un unico prodotto inscindibile. Il bambino tocca i componenti reali E li simula.",
        "<b>Filiera Arduino:</b> Giovanni Fagherazzi (ex Global Sales Director Arduino) porta "
        "la rete di contatti globale. Omaric produce nella stessa filiera delle schede Arduino originali.",
        "<b>Voce GDPR-Safe:</b> Voxtral TTS gira su VPS europeo. Nessun dato audio di minori "
        "esce dall'UE. Competitor USA non possono garantire questo.",
        "<b>62 Percorsi Guidati:</b> Non un sandbox generico — 62 esperimenti strutturati con "
        "percorso pedagogico, progressione di difficolta', e valutazione integrata.",
    ]
    for m in moats:
        elements.append(Paragraph(m, bullet_style, bulletText='\xe2\x80\xa2'))
        elements.append(Spacer(1, 1*mm))

    return elements


def build_page_gdpr():
    """Page 7: GDPR e Conformita' Minori"""
    elements = [PageBreak()]
    elements.append(Paragraph("GDPR e Conformita' per Minori", h1_style))
    elements.append(Paragraph(
        "ELAB tratta dati di minori (10-14 anni). La conformita' al GDPR e al "
        "Regolamento EU 2016/679 non e' opzionale — e' un requisito legale "
        "e un vantaggio competitivo rispetto ai competitor USA.",
        body_style
    ))
    elements.append(Spacer(1, 3*mm))

    # GDPR Architecture
    elements.append(Paragraph("Architettura Privacy-by-Design", h2_style))
    gdpr_data = [
        ['Principio GDPR', 'Implementazione ELAB', 'Stato'],
        [
            'Art. 8 — Consenso minori\n(eta\' < 16 anni)',
            'Consenso genitoriale obbligatorio.\n'
            'Tabella parental_consent in Supabase.\n'
            'Nessuna funzionalita\' AI senza consenso.',
            'Implementato'
        ],
        [
            'Art. 5 — Minimizzazione dati',
            'MAI inviati dati personali a Gemini API.\n'
            'Solo contesto circuito (componenti, connessioni).\n'
            'Nessun nome, cognome, email studente nelle query AI.',
            'Implementato'
        ],
        [
            'Art. 17 — Diritto alla\ncancellazione',
            'API DELETE /unlim-gdpr per cancellazione.\n'
            'Rimuove sessioni, progressi, contesti.\n'
            'Audit log della cancellazione.',
            'Implementato'
        ],
        [
            'Art. 20 — Portabilita\' dati',
            'API GET /unlim-gdpr/export.\n'
            'Export JSON di tutti i dati studente.\n'
            'Formato machine-readable.',
            'Implementato'
        ],
        [
            'Art. 25 — Privacy by design',
            'RLS (Row Level Security) su tutte le tabelle.\n'
            'Docente vede solo la sua classe.\n'
            'Studente vede solo i suoi dati.',
            'Implementato'
        ],
        [
            'Art. 5(1)(e) — Limitazione\nconservazione',
            'Data retention automatica.\n'
            'Sessioni scadono dopo 365 giorni.\n'
            'Trigger auto-expire in Supabase.',
            'Implementato'
        ],
    ]
    gdpr_table = Table(gdpr_data, colWidths=[35*mm, 68*mm, 25*mm])
    ts = make_table_style()
    ts.add('VALIGN', (0, 0), (-1, -1), 'TOP')
    ts.add('FONTSIZE', (0, 0), (-1, -1), 8.5)
    ts.add('LEADING', (0, 0), (-1, -1), 11)
    gdpr_table.setStyle(ts)
    elements.append(gdpr_table)
    elements.append(Spacer(1, 5*mm))

    # Data flow
    elements.append(Paragraph("Flusso Dati e Localizzazione", h2_style))
    flow_items = [
        "<b>Frontend (Vercel):</b> CDN globale, nessun dato personale. Solo asset statici.",
        "<b>Backend (Supabase):</b> Server EU (AWS eu-central-1). Tutti i dati restano in UE.",
        "<b>AI (Gemini API):</b> Riceve SOLO contesto circuito. Nessun dato identificativo. "
        "Google non usa i dati API per training (Terms of Service confermato).",
        "<b>TTS (Voxtral VPS):</b> Server europeo. L'audio e' generato, non registrato. "
        "Nessun dato vocale di minori transita verso servizi terzi.",
        "<b>STT (Web Speech API):</b> Elaborazione locale nel browser. "
        "Nessun audio trasmesso a server esterni.",
    ]
    for item in flow_items:
        elements.append(Paragraph(item, bullet_style, bulletText='\xe2\x80\xa2'))
        elements.append(Spacer(1, 1*mm))

    elements.append(Spacer(1, 4*mm))

    # Comparison
    elements.append(Paragraph("Confronto GDPR con Competitor", h2_style))
    comp_gdpr = [
        ['', 'ELAB', 'Tinkercad', 'Wokwi', 'Arduino Cloud'],
        ['Server in UE', 'SI\'', 'NO (USA)', 'NO (USA)', 'Parziale'],
        ['Consenso genitori', 'SI\'', 'NO', 'NO', 'NO'],
        ['Cancellazione dati', 'API dedicata', 'Email support', 'Email', 'Settings'],
        ['Export dati', 'API JSON', 'NO', 'NO', 'Parziale'],
        ['Audit log', 'SI\'', 'NO', 'NO', 'NO'],
        ['Data retention', 'Auto-expire', 'Indefinito', 'Indefinito', 'Indefinito'],
        ['DPA disponibile', 'SI\'', 'Su richiesta', 'NO', 'Su richiesta'],
    ]
    comp_table = Table(comp_gdpr, colWidths=[30*mm, 28*mm, 28*mm, 28*mm, 28*mm])
    ts2 = make_table_style()
    ts2.add('FONTSIZE', (0, 0), (-1, -1), 8.5)
    ts2.add('ALIGN', (1, 0), (-1, -1), 'CENTER')
    comp_table.setStyle(ts2)
    elements.append(comp_table)

    elements.append(Spacer(1, 4*mm))
    elements.append(Paragraph(
        "<b>ELAB e' l'unico prodotto nella categoria con conformita' GDPR completa "
        "per dati di minori.</b> Questo e' un requisito non negoziabile per le scuole "
        "italiane e un differenziatore competitivo decisivo.",
        bold_body
    ))

    return elements


def build_page7():
    """Page 8: Roadmap e Next Steps"""
    elements = [PageBreak()]
    elements.append(Paragraph("Roadmap e Next Steps", h1_style))

    # Timeline
    elements.append(Paragraph("Timeline Commerciale", h2_style))
    timeline_data = [
        ['Periodo', 'Milestone', 'Dettaglio'],
        ['Aprile 2026', 'Beta chiusa',
         'Backend Nanobot V2 live su Supabase\n'
         'RAG completo dai 3 volumi\n'
         'UNLIM onnipotente (14 azioni)\n'
         'Teacher Dashboard con Supabase'],
        ['Maggio 2026', 'Pilota 5 scuole',
         'Test con classi reali (Giovanni coordina)\n'
         'Feedback docenti e studenti\n'
         'Registrazione MePA (Davide)'],
        ['Giugno 2026', 'Launch MePA',
         'Prodotto acquistabile su MePA\n'
         'Deadline PNRR 30/06 — finestra acquisti\n'
         'Target: 10-20 classi'],
        ['Set-Dic 2026', 'Espansione',
         'Target: 50+ classi\n'
         'Marketing diretto (Giovanni)\n'
         'Iterazione su feedback reale'],
        ['2027', 'Scala europea',
         'Gemini multilingua (EN, DE, FR, ES)\n'
         'Partnership distributori EU\n'
         'Target: 200+ classi'],
    ]
    timeline_table = Table(timeline_data, colWidths=[28*mm, 32*mm, 82*mm])
    ts = make_table_style()
    ts.add('VALIGN', (0, 0), (-1, -1), 'TOP')
    timeline_table.setStyle(ts)
    elements.append(timeline_table)
    elements.append(Spacer(1, 6*mm))

    # Next steps
    elements.append(Paragraph("Prossimi Passi Immediati", h2_style))
    steps = [
        "<b>1. Configurare Supabase production</b> — Account reale, RLS policies, backup automatico.",
        "<b>2. RAG dai volumi Tres Jolie</b> — UNLIM deve conoscere ogni parola dei 3 manuali.",
        "<b>3. CORS e sicurezza</b> — Restringere origini, API key nell'header, rate limiting per scuola.",
        "<b>4. Test con docente reale</b> — 1 insegnante, 1 classe, 1 settimana. Misurare usage.",
        "<b>5. Registrazione MePA</b> — Davide Fagherazzi avvia il processo (Camera di Commercio + P.IVA).",
        "<b>6. Landing page scuole</b> — /scuole con pricing, demo interattiva, modulo contatto.",
    ]
    for s in steps:
        elements.append(Paragraph(s, bullet_style, bulletText='\xe2\x80\xa2'))
        elements.append(Spacer(1, 1*mm))

    elements.append(Spacer(1, 8*mm))

    # Final CTA
    elements.append(Paragraph(
        "ELAB e' pronto per il mercato. Il team c'e'. La tecnologia c'e'. "
        "La finestra PNRR si chiude il 30 giugno 2026.",
        highlight_style
    ))
    elements.append(Spacer(1, 4*mm))

    # Contact
    contact_data = [
        ['Contatti'],
        ['Andrea Marro — Sviluppo: andrea@elab-tutor.it'],
        ['Giovanni Fagherazzi — Commerciale: giovanni@raasimpact.com'],
        ['Omaric Elettronica — Hardware: ufficiotecnico@omaricelettronica.com'],
    ]
    contact_table = Table(contact_data, colWidths=[140*mm])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('LEADING', (0, 0), (-1, -1), 14),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_NAVY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    elements.append(contact_table)

    return elements


def main():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(output_dir)
    output_path = os.path.join(project_root, "docs", "ELAB-Business-Case.pdf")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=22*mm,
        title="ELAB Business Case - Modello AI-as-a-Service",
        author="Andrea Marro / ELAB Team",
        subject="Business Case per il modello di revenue AI-as-a-Service di ELAB Tutor",
    )

    elements = []
    elements += build_cover_page()
    elements += build_page2()
    elements += build_page3()
    elements += build_page4()
    elements += build_page5()
    elements += build_page6()
    elements += build_page_gdpr()
    elements += build_page7()

    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF generato: {output_path}")
    print(f"Dimensione: {os.path.getsize(output_path) / 1024:.1f} KB")


if __name__ == '__main__':
    main()
