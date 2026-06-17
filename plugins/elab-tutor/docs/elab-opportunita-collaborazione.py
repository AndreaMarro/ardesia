#!/usr/bin/env python3
"""PDF: cosa potrebbe fare qualcuno che lavora con Andrea su ELAB Tutor."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from datetime import datetime

NAVY = HexColor("#1E4D8C")
DARK = HexColor("#202124")
GRAY = HexColor("#5f6368")
LGRAY = HexColor("#f8f9fa")
GREEN = HexColor("#0d904f")
ORANGE = HexColor("#e37400")
RED = HexColor("#c5221f")
BLUE = HexColor("#1a73e8")
TEAL = HexColor("#00796b")
PURPLE = HexColor("#7b1fa2")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle('Title1', fontSize=26, leading=32, textColor=NAVY, spaceAfter=4, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Sub1', fontSize=12, leading=16, textColor=GRAY, spaceAfter=20))
styles.add(ParagraphStyle('Sec', fontSize=16, leading=21, textColor=NAVY, spaceBefore=22, spaceAfter=8, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('RoleTitle', fontSize=13, leading=17, textColor=white, spaceBefore=0, spaceAfter=0, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Body', fontSize=10.5, leading=15, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=8))
styles.add(ParagraphStyle('Task', fontSize=10, leading=14, textColor=DARK, spaceAfter=3, leftIndent=8))
styles.add(ParagraphStyle('Impact', fontSize=9.5, leading=13, textColor=TEAL, spaceAfter=10, leftIndent=8, fontName='Helvetica-Oblique'))
styles.add(ParagraphStyle('Small', fontSize=8, leading=10, textColor=GRAY, alignment=TA_CENTER))
styles.add(ParagraphStyle('Intro', fontSize=10.5, leading=15, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=10,
                           leftIndent=12, borderLeftWidth=3, borderLeftColor=NAVY, borderPadding=8))

def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRAY)
    canvas.drawCentredString(A4[0]/2, 1.2*cm, f"ELAB Tutor — Opportunita' di Collaborazione — Pagina {doc.page}")
    canvas.restoreState()

def role_block(story, color, icon, title, description, tasks, impact, W):
    """Crea un blocco ruolo con header colorato, task list e impatto."""
    # Header
    header_data = [[Paragraph(f"{icon}  {title}", styles['RoleTitle'])]]
    header = Table(header_data, colWidths=[W])
    header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('ROUNDEDCORNERS', [6, 6, 0, 0]),
    ]))
    story.append(header)

    # Descrizione
    story.append(Spacer(1, 6))
    story.append(Paragraph(description, styles['Body']))

    # Task list
    for task in tasks:
        story.append(Paragraph(f"<b>→</b>  {task}", styles['Task']))

    # Impatto
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"<b>Impatto:</b> {impact}", styles['Impact']))
    story.append(Spacer(1, 12))

def build():
    path = "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/ELAB-Opportunita-Collaborazione-2026-03-18.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=2.2*cm, rightMargin=2.2*cm, topMargin=2.5*cm, bottomMargin=2.2*cm)
    s = []
    W = doc.width

    # ═══════════════════════════════════════════
    # COPERTINA
    # ═══════════════════════════════════════════
    s.append(Spacer(1, 2*cm))
    s.append(Paragraph("ELAB Tutor", styles['Title1']))
    s.append(Paragraph("Cosa potresti fare lavorando con noi", styles['Sub1']))
    s.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    s.append(Spacer(1, 1*cm))

    s.append(Paragraph(
        "ELAB Tutor e' un simulatore di circuiti con tutor AI per bambini 8-14 anni. "
        "E' un progetto sviluppato da una persona sola, con 69 esperimenti, 22 componenti, "
        "un emulatore Arduino nel browser, e un'intelligenza artificiale che parla italiano. "
        "Funziona, ma ha bisogno di persone per crescere.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Questo documento elenca tutto quello che qualcuno potrebbe fare "
        "lavorando su questo progetto — dal codice al marketing, dalla didattica al design. "
        "Non serve saper fare tutto. Anche una sola di queste aree farebbe la differenza.",
        styles['Intro']
    ))

    s.append(Spacer(1, 0.5*cm))
    meta = [
        ["Progetto", "ELAB Tutor — www.elabtutor.school"],
        ["Stato", "v5.4.0 in produzione, stack AI locale in sviluppo"],
        ["Tech stack", "React 19, FastAPI, Ollama, Vite, Vercel"],
        ["Data", "18 Marzo 2026"],
    ]
    t = Table(meta, colWidths=[3.5*cm, W - 3.5*cm])
    t.setStyle(TableStyle([
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), GRAY),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, HexColor("#e0e0e0")),
    ]))
    s.append(t)

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # RUOLI TECNICI
    # ═══════════════════════════════════════════
    s.append(Paragraph("Ruoli tecnici", styles['Sec']))

    role_block(s, BLUE, "01", "SVILUPPATORE FRONTEND (React)",
        "Il frontend e' una SPA React 19 con ~181 componenti. Il simulatore funziona, "
        "ma ci sono aree che beneficerebbero di mani esperte.",
        [
            "Migliorare il supporto iPad/tablet (touch drag, gesti zoom, responsive canvas)",
            "Ottimizzare le performance del rendering SVG con molti componenti sulla breadboard",
            "Implementare un sistema di temi (dark mode, high contrast per accessibilita')",
            "Creare animazioni fluide per il montaggio guidato passo-passo",
            "Migliorare l'editor di codice (autocompletamento Arduino, snippet, error hints inline)",
            "Aggiungere il salvataggio/caricamento dei circuiti dell'utente (localStorage o cloud)",
            "Scrivere test Vitest per i componenti che ne sono sprovvisti",
            "Refactoring del componente principale NewElabSimulator.jsx (1900+ righe)",
        ],
        "L'esperienza utente e' il fattore che decide se un bambino torna domani o abbandona.",
        W
    )

    role_block(s, BLUE, "02", "SVILUPPATORE BACKEND / ML ENGINEER",
        "Il backend AI sta passando da cloud a locale. Servono competenze Python, FastAPI e ML.",
        [
            "Costruire nanobot-local/server.py (FastAPI, orchestrazione Ollama, streaming)",
            "Ottimizzare il budget RAM su M1 8GB (profiling, gestione modelli, swap intelligente)",
            "Migliorare il dataset Brain v8 (oversampling intent rari, nuovi strati)",
            "Implementare eval automatica post-training (accuracy, latenza, parse errors)",
            "Integrare Kokoro TTS (text-to-speech italiano) con endpoint FastAPI",
            "Integrare Whisper STT (speech-to-text) o Web Speech API",
            "Creare un sistema di caching risposte frequenti (il 70% sono azioni ripetitive)",
            "Scrivere benchmark automatizzati: latenza per scenario, uso RAM, qualita' risposte",
            "Esplorare il fine-tuning del Text LLM (Qwen3.5-4B) su risposte educative italiane",
        ],
        "Un backend locale solido elimina costi, privacy issues e latenza — i 3 blocchi alla distribuzione nelle scuole.",
        W
    )

    role_block(s, BLUE, "03", "DEVOPS / INFRASTRUTTURA",
        "Il deploy e' su Vercel (frontend) e Render (backend cloud). Il locale cambia tutto.",
        [
            "Creare lo script setup one-click per Mac (installa Ollama, scarica modelli, avvia tutto)",
            "Creare una versione Docker/Docker Compose per il deploy in laboratori scolastici",
            "Configurare CI/CD con test automatici (Vitest + eval Brain) su ogni push",
            "Creare un installer .dmg o .pkg per distribuzione semplice ai docenti",
            "Esplorare la distribuzione via USB pre-configurata (laboratori offline)",
            "Monitoraggio: dashboard locale con status modelli, RAM, latenza",
            "Gestire gli aggiornamenti modelli senza rompere le installazioni esistenti",
        ],
        "Se un docente non riesce a installarlo in 5 minuti, non lo usera'. Mai.",
        W
    )

    s.append(PageBreak())

    role_block(s, BLUE, "04", "SVILUPPATORE ELETTRONICA / SIMULAZIONE",
        "Il CircuitSolver usa KVL/KCL/MNA. Funziona per circuiti resistivi ma ha limiti.",
        [
            "Aggiungere simulazione transitori RC (condensatore che si carica nel tempo)",
            "Implementare la simulazione di transistor in regione attiva (non solo switch)",
            "Aggiungere nuovi componenti: relay, encoder rotativo, display 7 segmenti, sensore ultrasuoni",
            "Migliorare il modello fisico del buzzer (frequenze, duty cycle PWM)",
            "Implementare la simulazione analogica del potenziometro (partitore continuo)",
            "Creare un oscilloscopio virtuale per visualizzare segnali PWM e analogici",
            "Validare la correttezza fisica dei 69 esperimenti con misure reali",
            "Aggiungere il supporto per circuiti con piu' breadboard collegate",
        ],
        "Ogni nuovo componente simulato e' un esperimento in piu' che possiamo offrire.",
        W
    )

    role_block(s, BLUE, "05", "COMPILATORE / EMULATORE AVR",
        "L'emulatore AVR (avr8js) esegue codice Arduino reale nel browser, ma ha limiti.",
        [
            "Implementare un compilatore remoto per librerie complesse (Servo.h, LiquidCrystal.h, Wire.h)",
            "Aggiungere il supporto per interrupt esterni (INT0, INT1) nell'emulatore",
            "Implementare I2C/SPI virtuale per sensori simulati",
            "Migliorare il debugger: breakpoint, step-by-step, watch variabili",
            "Aggiungere il supporto per Arduino Mega (piu' pin, piu' timer)",
            "Creare un bridge USB per collegare un Arduino fisico al simulatore",
        ],
        "Un emulatore completo trasforma ELAB da giocattolo educativo a strumento professionale.",
        W
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # RUOLI EDUCATIVI
    # ═══════════════════════════════════════════
    s.append(Paragraph("Ruoli educativi e di contenuto", styles['Sec']))

    role_block(s, GREEN, "06", "ESPERTO DI DIDATTICA / PEDAGOGISTA",
        "Il progetto ha 69 esperimenti ma nessun pedagogista li ha mai validati con bambini reali.",
        [
            "Testare gli esperimenti con classi reali (bambini 8-14) e raccogliere feedback",
            "Validare la progressione didattica: i concetti sono introdotti nell'ordine giusto?",
            "Valutare le spiegazioni di Galileo: sono adatte all'eta'? Usano il linguaggio giusto?",
            "Progettare percorsi differenziati per eta' (8-10 vs 11-14)",
            "Creare guide per docenti: come usare ELAB in classe, obiettivi per lezione, valutazione",
            "Definire criteri di valutazione dell'apprendimento (non solo quiz, ma comprensione reale)",
            "Identificare misconcezioni comuni nell'elettronica e creare contenuti mirati",
            "Proporre nuovi esperimenti allineati ai programmi ministeriali STEM",
        ],
        "Senza validazione pedagogica, rischiamo di costruire qualcosa che piace agli ingegneri ma non insegna ai bambini.",
        W
    )

    role_block(s, GREEN, "07", "CREATORE DI CONTENUTI DIDATTICI",
        "Servono piu' esperimenti, quiz, sfide e giochi. Il framework c'e' — servono i contenuti.",
        [
            "Scrivere nuovi esperimenti per Volume 4 (elettronica digitale, logica, IoT)",
            "Creare quiz piu' ricchi: non solo domande a risposta multipla, ma drag-and-drop, simulazioni",
            "Progettare nuovi giochi educativi (Circuito Misterioso, Sfida a Tempo, Progetta Libero)",
            "Scrivere le spiegazioni \"Galileo dice\" per ogni esperimento (tono amichevole, italiano semplice)",
            "Creare video tutorial brevi (1-2 min) per accompagnare ogni esperimento",
            "Tradurre e adattare i contenuti per inglese, tedesco, spagnolo (le 4 lingue supportate)",
            "Creare schede stampabili per laboratorio (il digitale non sostituisce la carta per tutto)",
        ],
        "69 esperimenti sono tanti. 200 sarebbero un curriculum completo che copre 3 anni scolastici.",
        W
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # RUOLI DESIGN
    # ═══════════════════════════════════════════
    s.append(Paragraph("Ruoli di design e UX", styles['Sec']))

    role_block(s, PURPLE, "08", "UX/UI DESIGNER",
        "L'interfaccia e' funzionale ma non e' stata disegnata da un designer. Si vede.",
        [
            "Ridisegnare l'interfaccia con focus su bambini 8-14 (piu' giocosa, meno tecnica)",
            "Creare un sistema di icone coerente per tutti i 22 componenti e le azioni",
            "Progettare l'onboarding: il primo minuto decide se il bambino resta o se ne va",
            "Migliorare il feedback visivo: animazioni quando un circuito funziona, effetti quando qualcosa e' sbagliato",
            "Ripensare il layout per tablet/iPad (il 50%+ degli studenti usa tablet)",
            "Progettare la modalita' \"docente\" (vista classe, progresso studenti, assegnazione esperimenti)",
            "Creare un sistema di achievement/badge per motivare il progresso",
            "Fare test di usabilita' con bambini veri (non adulti che immaginano di essere bambini)",
        ],
        "Un bambino di 10 anni non legge manuali. Se non capisce l'interfaccia in 30 secondi, ha gia' chiuso il browser.",
        W
    )

    role_block(s, PURPLE, "09", "GRAPHIC DESIGNER / ILLUSTRATORE",
        "I componenti SVG sono funzionali ma essenziali. Servirebbero illustrazioni piu' ricche.",
        [
            "Ridisegnare i 22 componenti SVG con uno stile piu' accattivante ma chiaro",
            "Creare illustrazioni per le spiegazioni teoriche (legge di Ohm, corrente, tensione)",
            "Progettare il personaggio Galileo (avatar, espressioni, animazioni)",
            "Creare assets per i giochi educativi (sfondi, card, badge, achievement)",
            "Progettare la landing page del sito con illustrazioni custom",
            "Creare materiale promozionale (brochure PDF per scuole, social media assets)",
            "Animazioni Lottie per transizioni e feedback (circuito completato, quiz superato)",
        ],
        "Un buon design visivo comunica professionalita' e affidabilita' — cruciale per convincere le scuole.",
        W
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # RUOLI BUSINESS
    # ═══════════════════════════════════════════
    s.append(Paragraph("Ruoli business e go-to-market", styles['Sec']))

    role_block(s, ORANGE, "10", "BUSINESS DEVELOPMENT / VENDITE SCUOLE",
        "Il prodotto esiste ma non e' mai stato venduto. Nessun contatto con scuole reali.",
        [
            "Identificare le scuole target: medie con laboratorio STEM, istituti tecnici, dopo-scuola",
            "Costruire relazioni con dirigenti scolastici e responsabili acquisti",
            "Definire il pricing: licenza scuola, licenza classe, freemium, abbonamento annuale?",
            "Candidare ELAB a bandi PNRR/PON per digitalizzazione scolastica",
            "Partecipare a fiere didattiche (Didacta, Maker Faire, ABCD Genova)",
            "Creare un programma pilota: 5-10 scuole che testano gratis in cambio di feedback",
            "Valutare partnership con editori scolastici (il libro di testo fisico gia' esiste)",
            "Esplorare il mercato internazionale (il software supporta gia' 4 lingue)",
        ],
        "Il miglior software del mondo non serve a nulla se nessuna scuola sa che esiste.",
        W
    )

    role_block(s, ORANGE, "11", "MARKETING / COMUNICAZIONE",
        "Il sito esiste (elabtutor.school) ma non c'e' nessuna strategia di comunicazione.",
        [
            "Creare e gestire i canali social (Instagram, TikTok, YouTube — dove stanno i docenti e i genitori)",
            "Produrre video dimostrativi: bambino che costruisce un circuito, reazione quando funziona",
            "Scrivere articoli/blog su didattica STEM e innovazione scolastica",
            "Creare una newsletter per docenti (novita', esperimenti del mese, tips)",
            "Gestire le PR: contatti con giornalisti tech/education, podcast, interviste",
            "Creare case study dai programmi pilota (prima/dopo con dati reali)",
            "SEO: posizionare il sito per \"simulatore Arduino scuola\", \"elettronica bambini\"",
            "Community: creare un forum/Discord per docenti che usano ELAB",
        ],
        "Un docente scopre strumenti nuovi dal passaparola e dai social, non dai cataloghi.",
        W
    )

    role_block(s, ORANGE, "12", "FUNDRAISING / BUSINESS PLAN",
        "Il progetto e' autofinanziato. Per crescere servono risorse.",
        [
            "Scrivere un business plan solido con proiezioni finanziarie realistiche",
            "Identificare bandi e finanziamenti per EdTech (europei, nazionali, regionali)",
            "Preparare un pitch deck per investitori angel/VC specializzati in education",
            "Valutare l'opportunita' di un crowdfunding (Kickstarter/Indiegogo per education)",
            "Calcolare il CAC (costo acquisizione cliente) e il LTV per il modello scuola",
            "Esplorare revenue streams alternativi: formazione docenti, contenuti premium, hardware kit",
        ],
        "Senza un modello economico sostenibile, il progetto dipende dalla passione di una persona — e la passione ha una scadenza.",
        W
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # RUOLI SUPPORTO
    # ═══════════════════════════════════════════
    s.append(Paragraph("Ruoli di supporto e qualita'", styles['Sec']))

    role_block(s, TEAL, "13", "QA / TESTER",
        "Il progetto ha test automatici ma manca il testing manuale strutturato.",
        [
            "Testare tutti i 69 esperimenti end-to-end su diversi browser (Chrome, Safari, Firefox, Edge)",
            "Testare su dispositivi reali: iPad, tablet Android, Chromebook (quello che usano le scuole)",
            "Trovare edge case nel simulatore: circuiti impossibili, input assurdi, combinazioni rare",
            "Testare Galileo con input reali di bambini (grammatica imperfetta, dialetti, abbreviazioni)",
            "Creare una suite di test di regressione per ogni release",
            "Testare l'accessibilita' (screen reader, navigazione tastiera, contrasto colori)",
            "Testare le performance su dispositivi vecchi (le scuole non hanno hardware recente)",
            "Documentare ogni bug con screenshot, passi per riprodurre, e gravita'",
        ],
        "Un bug trovato prima del rilascio costa 10 minuti. Un bug trovato da un bambino in classe costa la credibilita'.",
        W
    )

    role_block(s, TEAL, "14", "DOCUMENTATORE TECNICO",
        "Ci sono 116 documenti tecnici ma sono scritti per l'AI, non per umani.",
        [
            "Riscrivere la documentazione per sviluppatori umani (onboarding, architettura, contribuire)",
            "Creare una guida \"Come aggiungere un nuovo componente\" (passo per passo)",
            "Creare una guida \"Come creare un nuovo esperimento\" (per chi non e' programmatore)",
            "Documentare le API del nanobot (OpenAPI/Swagger) per integrazioni di terze parti",
            "Creare un wiki o un sito di documentazione (Docusaurus, GitBook)",
            "Scrivere il manuale utente per docenti (PDF stampabile + versione web)",
            "Documentare le decisioni architetturali (ADR) per chi arriva dopo",
        ],
        "Senza documentazione leggibile, nessun nuovo sviluppatore puo' contribuire — il progetto muore con il suo creatore.",
        W
    )

    role_block(s, TEAL, "15", "COMMUNITY MANAGER / SUPPORTO",
        "Quando gli utenti arriveranno, qualcuno dovra' rispondere alle loro domande.",
        [
            "Gestire il supporto email/chat per docenti (setup, troubleshooting, richieste)",
            "Creare FAQ e knowledge base (i docenti fanno tutti le stesse domande)",
            "Moderare il forum/community dei docenti",
            "Raccogliere feedback strutturato e trasformarlo in feature request prioritizzate",
            "Organizzare webinar mensili per docenti (\"Come usare ELAB per insegnare i LED\")",
            "Creare template di lezione pronti all'uso (\"Lezione 1: Il primo circuito, 45 min\")",
        ],
        "Il supporto e' il prodotto. Un docente che si sente seguito rinnova la licenza e lo consiglia ai colleghi.",
        W
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # RUOLI SPECIALI
    # ═══════════════════════════════════════════
    s.append(Paragraph("Ruoli speciali", styles['Sec']))

    role_block(s, RED, "16", "ESPERTO LEGALE / PRIVACY (GDPR)",
        "Il prodotto e' per minori. La compliance legale non e' opzionale.",
        [
            "Verificare la conformita' GDPR per dati di minori (consenso genitoriale, DPO)",
            "Redigere i termini di servizio e la privacy policy per il contesto scolastico",
            "Verificare la conformita' alle linee guida AGID per software nella PA",
            "Gestire il contratto tipo per le scuole (licenza, responsabilita', SLA)",
            "Valutare le implicazioni legali dell'AI che interagisce con minori",
            "Certificazione: ISO 27001, certificazione AGID, marchio CE (se hardware kit)",
        ],
        "Un singolo problema legale con dati di minori puo' distruggere il progetto. Non e' un rischio accettabile.",
        W
    )

    role_block(s, RED, "17", "ESPERTO HARDWARE / KIT FISICO",
        "ELAB simula circuiti, ma il vero obiettivo e' che i bambini costruiscano circuiti reali.",
        [
            "Progettare un kit fisico ELAB: componenti selezionati, breadboard, Arduino, custodia",
            "Negoziare con fornitori per produzione kit a costi accessibili per le scuole",
            "Creare un bridge USB: Arduino fisico collegato al simulatore (verifica automatica)",
            "Progettare PCB custom per esperimenti avanzati (shield ELAB per Arduino)",
            "Creare un sistema di verifica: il simulatore confronta il circuito fisico con quello virtuale",
            "Valutare la logistica: magazzino, spedizioni, gestione resi per le scuole",
        ],
        "Il kit fisico trasforma ELAB da software a prodotto educativo completo — e giustifica un prezzo piu' alto.",
        W
    )

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # RIEPILOGO
    # ═══════════════════════════════════════════
    s.append(Paragraph("Riepilogo: cosa serve di piu'?", styles['Sec']))

    s.append(Paragraph(
        "Se dovessi scegliere le 5 figure piu' urgenti per far fare il salto al progetto, sarebbero queste — "
        "in ordine di impatto:",
        styles['Body']
    ))

    priority = [
        ["1", "Pedagogista / Tester con bambini", "CRITICA", "Senza validazione reale, tutto il resto e' teoria"],
        ["2", "Business dev / Vendite scuole", "CRITICA", "Il prodotto deve arrivare nelle scuole, non restare su GitHub"],
        ["3", "UX Designer", "ALTA", "L'interfaccia deve parlare ai bambini, non agli ingegneri"],
        ["4", "ML Engineer / Backend", "ALTA", "Lo stack locale e' la chiave per distribuzione e privacy"],
        ["5", "Documentatore tecnico", "ALTA", "Senza docs, nessun altro sviluppatore puo' contribuire"],
    ]
    hc = [Paragraph(f"<b>{h}</b>", ParagraphStyle('th', fontSize=9, textColor=white, alignment=TA_CENTER))
          for h in ["#", "Ruolo", "Urgenza", "Perche'"]]
    data = [hc] + [[Paragraph(c, ParagraphStyle('td', fontSize=10, leading=13, textColor=DARK)) for c in r] for r in priority]
    t = Table(data, colWidths=[0.8*cm, 4.5*cm, 2*cm, W - 7.3*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('GRID', (0,0), (-1,-1), 0.5, HexColor("#dadce0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, LGRAY]),
    ]))
    s.append(t)

    s.append(Spacer(1, 1*cm))
    s.append(Paragraph(
        "Il bello di questo progetto e' che qualsiasi contributo fa la differenza. "
        "Non serve fare tutto — serve fare qualcosa. E farlo bene.",
        styles['Intro']
    ))

    s.append(Spacer(1, 1*cm))
    s.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    s.append(Spacer(1, 0.3*cm))
    s.append(Paragraph(
        f"Documento generato il {datetime.now().strftime('%d/%m/%Y alle %H:%M')} — "
        "ELAB Tutor — Andrea Marro",
        styles['Small']
    ))

    doc.build(s, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF generato: {path}")

if __name__ == "__main__":
    build()
