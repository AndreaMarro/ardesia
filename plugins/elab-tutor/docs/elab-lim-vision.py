#!/usr/bin/env python3
"""PDF: ELAB Tutor sulla LIM — Visione per insegnanti inesperti."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from datetime import datetime

# Colori
NAVY = HexColor("#1E4D8C")
DARK = HexColor("#202124")
GRAY = HexColor("#5f6368")
LGRAY = HexColor("#f1f3f4")
TEAL = HexColor("#00796b")
BLUE = HexColor("#1a73e8")
WHITE = HexColor("#ffffff")
ORANGE = HexColor("#E65100")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle('BigTitle', fontSize=32, leading=38, textColor=NAVY, spaceAfter=2, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Subtitle', fontSize=14, leading=18, textColor=GRAY, spaceAfter=24))
styles.add(ParagraphStyle('Sec', fontSize=20, leading=25, textColor=NAVY, spaceBefore=24, spaceAfter=8, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Sub', fontSize=13, leading=17, textColor=DARK, spaceBefore=16, spaceAfter=4, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Body', fontSize=10.5, leading=15.5, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=10))
styles.add(ParagraphStyle('Visione', fontSize=11, leading=16, textColor=NAVY, spaceAfter=14,
                           leftIndent=14, borderLeftWidth=3, borderLeftColor=NAVY, borderPadding=10))
styles.add(ParagraphStyle('Scenario', fontSize=10.5, leading=15.5, textColor=DARK, spaceAfter=8,
                           leftIndent=14, borderLeftWidth=2, borderLeftColor=TEAL, borderPadding=8))
styles.add(ParagraphStyle('Spunto', fontSize=10.2, leading=14.5, textColor=DARK, spaceAfter=5, leftIndent=16))
styles.add(ParagraphStyle('Nota', fontSize=9.5, leading=13, textColor=TEAL, spaceAfter=12, leftIndent=16, fontName='Helvetica-Oblique'))
styles.add(ParagraphStyle('Small', fontSize=8, leading=10, textColor=GRAY, alignment=TA_CENTER))
styles.add(ParagraphStyle('Emphasis', fontSize=10.5, leading=15.5, textColor=ORANGE, spaceAfter=10, fontName='Helvetica-Bold'))

def pn(c, d):
    c.saveState()
    c.setFont('Helvetica', 8)
    c.setFillColor(GRAY)
    c.drawCentredString(A4[0]/2, 1.2*cm, f"ELAB Tutor — LIM Vision — {d.page}")
    c.restoreState()

def dot(story, text):
    story.append(Paragraph(f"<font color='#1a73e8'><b>&#x2022;</b></font>  {text}", styles['Spunto']))

def nota(story, text):
    story.append(Paragraph(text, styles['Nota']))

def scenario(story, text):
    story.append(Paragraph(text, styles['Scenario']))

def build():
    path = "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/ELAB-LIM-Vision-2026-03-18.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=2.2*cm, rightMargin=2.2*cm, topMargin=2.5*cm, bottomMargin=2.2*cm)
    s = []

    # ═══════════════════════════════════════════
    # COPERTINA
    # ═══════════════════════════════════════════
    s.append(Spacer(1, 3*cm))
    s.append(Paragraph("ELAB Tutor", styles['BigTitle']))
    s.append(Paragraph("L'applicativo per LIM che permette a chiunque<br/>di insegnare elettronica e Arduino", styles['Subtitle']))
    s.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    s.append(Spacer(1, 1.5*cm))

    s.append(Paragraph(
        "Questo documento descrive la visione di ELAB Tutor come strumento per LIM: "
        "un applicativo pensato per mettere un insegnante completamente inesperto "
        "nella condizione di condurre una lezione di elettronica e programmazione Arduino "
        "senza alcuna preparazione tecnica preliminare.",
        styles['Body']
    ))

    s.append(Paragraph(
        "L'obiettivo non e' insegnare elettronica agli insegnanti. "
        "E' fare in modo che non ne abbiano bisogno.",
        styles['Visione']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # IL PROBLEMA
    # ═══════════════════════════════════════════
    s.append(Paragraph("Il problema reale", styles['Sec']))

    s.append(Paragraph(
        "Nelle scuole italiane, l'insegnamento di tecnologia e STEM e' affidato a docenti "
        "che spesso non hanno formazione specifica in elettronica o programmazione. "
        "Molti sono laureati in architettura, design o discipline tecniche generali. "
        "Non e' colpa loro: il sistema non li ha preparati per questo.",
        styles['Body']
    ))

    s.append(Paragraph(
        "Il risultato e' prevedibile. I kit Arduino restano nelle scatole. I manuali di "
        "elettronica restano sugli scaffali. Le LIM vengono usate per proiettare slide, "
        "non per simulare circuiti. E i bambini perdono l'opportunita' di imparare "
        "facendo — che e' l'unico modo in cui l'elettronica si impara davvero.",
        styles['Body']
    ))

    s.append(Paragraph(
        "Il problema non e' la mancanza di strumenti. E' la mancanza di strumenti "
        "che non richiedono competenza per essere usati.",
        styles['Visione']
    ))

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph("Lo scenario tipico oggi", styles['Sub']))
    scenario(s,
        "<b>Ore 9:00</b> — L'insegnante di tecnologia deve fare una lezione su \"i circuiti elettrici\". "
        "Ha una LIM, 25 studenti, un manuale generico e nessuna idea di come collegare un LED "
        "a una resistenza. Apre YouTube, cerca \"circuito LED spiegazione\", trova un video di 40 minuti "
        "in inglese con un tizio che parla troppo veloce. Chiude tutto. Fa leggere il paragrafo dal libro. "
        "I bambini si annoiano. Fine della lezione."
    )

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph("Lo scenario con ELAB Tutor", styles['Sub']))
    scenario(s,
        "<b>Ore 9:00</b> — L'insegnante apre ELAB Tutor sulla LIM. Seleziona \"Volume 1, Esperimento 3: "
        "Il primo LED\". Lo schermo mostra la breadboard, i componenti, e le istruzioni passo-passo. "
        "L'insegnante legge ad alta voce: \"Prendi il LED rosso e inseriscilo nella riga E\". "
        "Tocca il componente sulla LIM, lo trascina. Il simulatore reagisce. I bambini vedono il circuito "
        "prendere forma. Quando e' completo, premono \"Simula\" e il LED si accende. "
        "Galileo dice: \"Bravi! Sapete perche' serve la resistenza?\". "
        "L'insegnante non ha dovuto sapere nulla. Il software sapeva tutto per lei."
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # LA LIM COME CENTRO
    # ═══════════════════════════════════════════
    s.append(Paragraph("La LIM come centro dell'esperienza", styles['Sec']))

    s.append(Paragraph(
        "ELAB Tutor non e' un software che l'insegnante studia a casa e poi usa in classe. "
        "E' un software che l'insegnante scopre insieme ai bambini, in diretta, sulla LIM. "
        "La LIM diventa il banco di lavoro condiviso: grande, visibile a tutti, interattivo.",
        styles['Body']
    ))

    s.append(Paragraph("Cosa succede sulla LIM", styles['Sub']))

    dot(s, "La <b>breadboard gigante</b> occupa meta' dello schermo — ogni bambino dall'ultimo banco vede dove va il filo")
    dot(s, "I <b>componenti si trascinano col dito</b> o col pennino — l'insegnante (o un bambino chiamato alla lavagna) costruisce il circuito dal vivo")
    dot(s, "Le <b>istruzioni passo-passo</b> appaiono a lato: \"Passo 1: collega il filo rosso da +5V alla riga A1\" — nessuna ambiguita'")
    dot(s, "<b>Galileo parla</b>: il tutor AI spiega cosa sta succedendo con voce naturale in italiano, adatta a bambini di 8-14 anni")
    dot(s, "Quando il circuito e' completo, la <b>simulazione parte</b>: il LED si accende, il motore gira, il buzzer suona — feedback immediato")
    dot(s, "Se qualcosa e' sbagliato, Galileo lo dice: <b>\"Il LED e' al contrario — prova a girarlo\"</b> — non un messaggio d'errore, un suggerimento")
    dot(s, "Il <b>codice Arduino</b> appare nell'editor integrato — l'insegnante puo' mostrare come un programma controlla il circuito, riga per riga")

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph("Cosa NON deve fare l'insegnante", styles['Sub']))

    dot(s, "Non deve sapere cos'e' una resistenza, un condensatore o un transistor — <b>il software lo spiega</b>")
    dot(s, "Non deve preparare la lezione — <b>ogni esperimento e' una lezione pronta</b>, con obiettivi, materiali e tempi")
    dot(s, "Non deve saper programmare — <b>il codice e' gia' scritto</b>, e Galileo lo spiega riga per riga")
    dot(s, "Non deve risolvere problemi tecnici — <b>Galileo diagnostica gli errori</b> e suggerisce la correzione")
    dot(s, "Non deve inventare esercizi — <b>ci sono 138 quiz e 53 sfide</b> gia' calibrate per difficolta'")
    dot(s, "Non deve valutare manualmente — <b>il sistema traccia i progressi</b> di ogni studente")

    s.append(Paragraph(
        "L'insegnante diventa il facilitatore, non l'esperto. "
        "E' la persona che dice \"proviamo insieme\" — non quella che deve sapere gia' tutto.",
        styles['Visione']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # I 69 ESPERIMENTI
    # ═══════════════════════════════════════════
    s.append(Paragraph("69 lezioni pronte, zero preparazione", styles['Sec']))

    s.append(Paragraph(
        "ELAB Tutor contiene 69 esperimenti organizzati in 3 volumi progressivi. "
        "Ogni esperimento e' una lezione autocontenuta: ha un obiettivo didattico, "
        "una sequenza di passi guidati, un circuito da costruire, una simulazione "
        "da osservare, e quiz per verificare la comprensione.",
        styles['Body']
    ))

    # Tabella volumi
    vol_data = [
        ["Volume", "Tema", "Esperimenti", "Livello"],
        ["Volume 1", "Elettronica di base", "23", "Eta' 8-10, nessun prerequisito"],
        ["Volume 2", "Elettronica intermedia", "23", "Eta' 10-12, dopo Volume 1"],
        ["Volume 3", "Arduino e programmazione", "23", "Eta' 11-14, dopo Volume 2"],
    ]
    t = Table(vol_data, colWidths=[2.5*cm, 4.5*cm, 2.5*cm, 6.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('BACKGROUND', (0, 1), (-1, -1), LGRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    s.append(t)
    s.append(Spacer(1, 0.5*cm))

    s.append(Paragraph(
        "L'insegnante non sceglie cosa insegnare — sceglie solo da quale esperimento partire. "
        "La progressione e' gia' costruita: dal LED alla stazione meteo, dal pulsante al robot.",
        styles['Body']
    ))

    s.append(Paragraph("Esempio: come funziona un esperimento sulla LIM", styles['Sub']))

    scenario(s,
        "<b>Esperimento V1-03: Il primo LED</b><br/><br/>"
        "Obiettivo: capire che un circuito deve essere chiuso perche' la corrente scorra.<br/><br/>"
        "Passo 1: \"Trascina il LED rosso nella riga E della breadboard\" — il componente appare, "
        "l'insegnante o un bambino lo posiziona toccando la LIM.<br/><br/>"
        "Passo 2: \"Collega una resistenza da 220 ohm\" — Galileo spiega: \"La resistenza protegge il LED, "
        "come un rubinetto che regola quanta acqua passa\".<br/><br/>"
        "Passo 3: \"Collega i fili all'alimentazione\" — il circuito si completa.<br/><br/>"
        "Passo 4: \"Premi Simula\" — il LED si accende con un bagliore. I bambini applaudono.<br/><br/>"
        "Quiz: \"Cosa succede se togli la resistenza?\" — tre opzioni. Se scelgono \"il LED si brucia\", "
        "Galileo conferma e mostra l'animazione."
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # GALILEO
    # ═══════════════════════════════════════════
    s.append(Paragraph("Galileo: il tutor che sa quello che l'insegnante non sa", styles['Sec']))

    s.append(Paragraph(
        "Galileo e' l'intelligenza artificiale integrata in ELAB Tutor. Non e' un chatbot generico: "
        "e' un tutor specializzato in elettronica per bambini, addestrato su 86.000 esempi di "
        "conversazioni reali in italiano, calibrato per spiegare concetti complessi con metafore semplici.",
        styles['Body']
    ))

    s.append(Paragraph("Cosa fa Galileo durante la lezione sulla LIM", styles['Sub']))

    dot(s, "<b>Risponde alle domande dei bambini</b> — \"Perche' il LED ha due gambine diverse?\" \"Cos'e' la corrente?\"")
    dot(s, "<b>Diagnostica errori nel circuito</b> — \"Il filo rosso non e' collegato — prova a spostarlo nella riga A\"")
    dot(s, "<b>Spiega il codice Arduino</b> — \"digitalWrite(13, HIGH) significa: accendi il pin numero 13\"")
    dot(s, "<b>Suggerisce cosa provare dopo</b> — \"Ora che il LED funziona, prova a farlo lampeggiare!\"")
    dot(s, "<b>Parla ad alta voce</b> — con sintesi vocale naturale in italiano, udibile da tutta la classe")
    dot(s, "<b>Si adatta al livello</b> — risposte piu' semplici per il Volume 1, piu' tecniche per il Volume 3")

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph(
        "Galileo non sostituisce l'insegnante. Lo libera dall'ansia di non sapere. "
        "L'insegnante puo' dire: \"Bella domanda — chiediamolo a Galileo!\" e il tutor AI risponde. "
        "Nessuno perde la faccia. Tutti imparano.",
        styles['Visione']
    ))

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph("100% locale, zero dipendenze cloud", styles['Sub']))

    s.append(Paragraph(
        "Galileo gira interamente sul computer della scuola. Non servono account, non servono "
        "abbonamenti, non servono connessioni internet. Un Mac con 8GB di RAM e' sufficiente. "
        "Questo significa: nessun problema di privacy (i dati dei bambini non escono dalla scuola), "
        "nessun costo ricorrente, nessuna dipendenza da servizi esterni che possono chiudere o cambiare prezzo.",
        styles['Body']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # OLTRE IL SOFTWARE: IL KIT
    # ═══════════════════════════════════════════
    s.append(Paragraph("Oltre il software: i manuali e i kit ELAB", styles['Sec']))

    s.append(Paragraph(
        "ELAB Tutor non e' solo un simulatore. E' l'ingresso a un ecosistema completo: "
        "software, manuali cartacei e kit fisici. Il software sulla LIM prepara la lezione. "
        "I manuali la strutturano. I kit la rendono tangibile.",
        styles['Body']
    ))

    s.append(Paragraph("Il flusso di una lezione completa", styles['Sub']))

    scenario(s,
        "<b>Fase 1 — LIM (15 min)</b>: L'insegnante apre l'esperimento sulla LIM. "
        "I bambini vedono il circuito costruirsi passo dopo passo. Galileo spiega. "
        "La classe fa il quiz insieme, discutendo le risposte.<br/><br/>"
        "<b>Fase 2 — Manuale (5 min)</b>: I bambini aprono il manuale ELAB alla pagina "
        "corrispondente. Trovano lo schema del circuito, la spiegazione scritta, "
        "lo spazio per gli appunti. Il manuale e' il loro riferimento personale.<br/><br/>"
        "<b>Fase 3 — Kit fisico (25 min)</b>: A coppie, i bambini costruiscono il circuito "
        "vero con il kit ELAB. Seguono lo schema del manuale. Se si bloccano, guardano la LIM "
        "dove il simulatore mostra ancora il circuito completato. Quando funziona, il LED si accende "
        "per davvero. L'emozione e' incomparabile."
    )

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph(
        "Il software prepara, il manuale struttura, il kit fisico emoziona. "
        "Nessuno dei tre funziona bene da solo. Insieme, sono una lezione che funziona.",
        styles['Visione']
    ))

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph("Perche' anche il kit fisico non richiede competenza", styles['Sub']))

    dot(s, "Ogni kit e' <b>pre-organizzato per esperimento</b>: i componenti sono in buste numerate, non in un sacchetto unico")
    dot(s, "I componenti hanno <b>etichette colorate</b> che corrispondono ai colori nel simulatore — il bambino sa cosa cercare")
    dot(s, "Il manuale ha <b>foto reali</b> accanto agli schemi — \"questo oggetto cilindrico a strisce e' la resistenza\"")
    dot(s, "Se un componente si brucia o si perde, la <b>lista di ricambio</b> e' nel manuale con i link per acquistare")
    dot(s, "Non servono saldature, non servono strumenti speciali — tutto si monta <b>a incastro sulla breadboard</b>")

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # SETUP
    # ═══════════════════════════════════════════
    s.append(Paragraph("Installazione: 5 minuti, un click", styles['Sec']))

    s.append(Paragraph(
        "Se l'installazione richiede piu' di 5 minuti o piu' di 3 passaggi, il docente non la fara'. "
        "Questo e' un vincolo di design non negoziabile.",
        styles['Emphasis']
    ))

    s.append(Paragraph("Come funziona l'installazione", styles['Sub']))

    dot(s, "<b>Passo 1</b>: Scarica ELAB Tutor dal sito (un file .dmg su Mac, .exe su Windows)")
    dot(s, "<b>Passo 2</b>: Doppio click per installare — trascina nella cartella Applicazioni")
    dot(s, "<b>Passo 3</b>: Apri ELAB Tutor — al primo avvio scarica i modelli AI (~3 GB, una volta sola)")
    dot(s, "<b>Fine</b>: il software e' pronto. Nessun account, nessuna password, nessuna configurazione")

    nota(s, "Lo script di setup automatico gestisce tutto: installazione Ollama, download modelli, configurazione. "
            "Il docente vede solo una barra di progresso e poi la schermata principale.")

    s.append(Spacer(1, 0.5*cm))

    s.append(Paragraph("Requisiti minimi", styles['Sub']))

    req_data = [
        ["", "Minimo", "Consigliato"],
        ["Computer", "Mac M1 / PC Windows 10", "Mac M2+ / PC Windows 11"],
        ["RAM", "8 GB", "16 GB"],
        ["Spazio disco", "5 GB liberi", "10 GB liberi"],
        ["Schermo LIM", "1280x800", "1920x1080"],
        ["Internet", "Solo per installazione", "Non necessario dopo"],
    ]
    t = Table(req_data, colWidths=[3*cm, 5*cm, 5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('BACKGROUND', (0, 1), (0, -1), LGRAY),
        ('BACKGROUND', (1, 1), (-1, -1), WHITE),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    s.append(t)

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # SCALABILITA'
    # ═══════════════════════════════════════════
    s.append(Paragraph("Un insegnante, una LIM, venticinque bambini", styles['Sec']))

    s.append(Paragraph(
        "Il modello d'uso primario e' il piu' semplice possibile: una LIM in aula, "
        "un insegnante che guida, venticinque bambini che guardano, partecipano, e poi "
        "costruiscono. Non servono computer per ogni studente. Non servono tablet individuali. "
        "La LIM e' il punto focale.",
        styles['Body']
    ))

    s.append(Paragraph("Ma il sistema scala", styles['Sub']))

    dot(s, "<b>Modalita' classe</b>: la LIM proietta, i bambini seguono e costruiscono con il kit fisico")
    dot(s, "<b>Modalita' laboratorio</b>: ogni coppia di studenti ha un computer con ELAB Tutor — ognuno procede al proprio ritmo")
    dot(s, "<b>Modalita' compiti</b>: lo studente usa ELAB Tutor a casa per ripassare — Galileo risponde alle domande anche senza l'insegnante")
    dot(s, "<b>Modalita' formazione docenti</b>: l'insegnante usa ELAB Tutor da solo per prepararsi — impara facendo, come i bambini")

    s.append(Spacer(1, 0.5*cm))

    s.append(Paragraph("La vista docente (in sviluppo)", styles['Sub']))

    s.append(Paragraph(
        "In modalita' laboratorio, l'insegnante avra' una dashboard che mostra "
        "lo stato di ogni studente in tempo reale:",
        styles['Body']
    ))

    dot(s, "Chi e' al passo, chi e' avanti, chi e' bloccato")
    dot(s, "Quale errore sta facendo ogni studente")
    dot(s, "Quanti quiz ha completato, con quale punteggio")
    dot(s, "Suggerimenti per l'insegnante: \"Marco e' bloccato al passo 3 — il problema e' la polarita' del LED\"")

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # IMPATTO
    # ═══════════════════════════════════════════
    s.append(Paragraph("L'impatto potenziale", styles['Sec']))

    s.append(Paragraph(
        "In Italia ci sono circa 7.600 scuole secondarie di primo grado. "
        "Quasi tutte hanno almeno una LIM. Quasi nessuna insegna elettronica pratica. "
        "Il motivo non e' la mancanza di programmi ministeriali — le indicazioni nazionali "
        "includono esplicitamente la tecnologia applicata. Il motivo e' che nessuno ha dato "
        "agli insegnanti uno strumento che possano usare senza essere ingegneri.",
        styles['Body']
    ))

    dot(s, "<b>Un insegnante di lettere</b> con ELAB Tutor puo' condurre una lezione di elettronica. Non perfetta, ma reale")
    dot(s, "<b>Un supplente</b> al primo giorno puo' aprire un esperimento e coinvolgere la classe per un'ora intera")
    dot(s, "<b>Un genitore a casa</b> puo' guidare il figlio attraverso un esperimento senza sapere nulla di circuiti")
    dot(s, "<b>Un educatore in un doposcuola</b> puo' proporre un'attivita' STEM strutturata senza formazione")
    dot(s, "<b>Un bambino da solo</b>, con Galileo come compagno, puo' esplorare l'elettronica in autonomia")

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph(
        "Non si tratta di sostituire l'insegnante esperto. Si tratta di dare a chi non e' esperto "
        "la possibilita' di iniziare. Perche' un insegnante che inizia e' infinitamente "
        "meglio di un insegnante che rinuncia.",
        styles['Visione']
    ))

    s.append(Spacer(1, 0.5*cm))

    s.append(Paragraph("I numeri attuali del progetto", styles['Sub']))

    num_data = [
        ["Componente", "Stato attuale"],
        ["Esperimenti", "69 completi su 3 volumi"],
        ["Componenti simulati", "22 (LED, resistore, motore, buzzer, sensori...)"],
        ["Quiz e sfide", "138 quiz + 53 sfide"],
        ["Lingue", "4 (italiano, inglese, tedesco, spagnolo)"],
        ["Dataset AI", "86.000 esempi di training"],
        ["Emulatore Arduino", "ATmega328p completo nel browser"],
        ["Modalita'", "Passo-passo, sandbox, Scratch, Arduino C++"],
    ]
    t = Table(num_data, colWidths=[4*cm, 12*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('BACKGROUND', (0, 1), (0, -1), LGRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    s.append(t)

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # CHIUSURA
    # ═══════════════════════════════════════════
    s.append(Paragraph("La promessa", styles['Sec']))

    s.append(Paragraph(
        "ELAB Tutor fa una promessa semplice: se hai una LIM e 45 minuti, "
        "puoi insegnare elettronica. Anche se non sai cosa sia un catodo. "
        "Anche se non hai mai visto una breadboard. Anche se Arduino per te "
        "e' solo un nome proprio.",
        styles['Body']
    ))

    s.append(Paragraph(
        "Non perche' il software sia intelligente al posto tuo. "
        "Ma perche' il software sa esattamente quello che serve sapere "
        "in quel momento, per quell'esperimento, per quel bambino. "
        "E lo dice — in italiano, con voce chiara, con pazienza infinita.",
        styles['Body']
    ))

    s.append(Paragraph(
        "L'insegnante resta la persona piu' importante nella stanza. "
        "ELAB Tutor gli toglie l'ansia e gli restituisce il piacere di scoprire "
        "qualcosa di nuovo insieme ai suoi studenti.",
        styles['Body']
    ))

    s.append(Spacer(1, 1*cm))

    s.append(Paragraph(
        "Apri il software. Scegli un esperimento. Tocca la LIM. Insegna.",
        styles['Visione']
    ))

    s.append(Spacer(1, 2*cm))
    s.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    s.append(Spacer(1, 0.3*cm))
    s.append(Paragraph(
        f"ELAB Tutor — {datetime.now().strftime('%d/%m/%Y')} — Andrea Marro — www.elabtutor.school",
        styles['Small']
    ))

    doc.build(s, onFirstPage=pn, onLaterPages=pn)
    print(f"PDF: {path}")

if __name__ == "__main__":
    build()
