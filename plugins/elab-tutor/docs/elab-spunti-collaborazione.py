#!/usr/bin/env python3
"""PDF: Spunti per chi vuole contribuire a ELAB Tutor."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, ListFlowable, ListItem
)
from datetime import datetime

NAVY = HexColor("#1E4D8C")
DARK = HexColor("#202124")
GRAY = HexColor("#5f6368")
LGRAY = HexColor("#f1f3f4")
GREEN = HexColor("#1b7340")
BLUE = HexColor("#1a73e8")
PURPLE = HexColor("#7b1fa2")
TEAL = HexColor("#00796b")
LIME = HexColor("#7CB342")
BULLET = HexColor("#1a73e8")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle('BigTitle', fontSize=30, leading=36, textColor=NAVY, spaceAfter=2, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Tagline', fontSize=13, leading=17, textColor=GRAY, spaceAfter=24))
styles.add(ParagraphStyle('Sec', fontSize=18, leading=23, textColor=NAVY, spaceBefore=20, spaceAfter=6, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('AreaIntro', fontSize=10.5, leading=15, textColor=GRAY, spaceAfter=10, fontName='Helvetica-Oblique'))
styles.add(ParagraphStyle('Sub', fontSize=12, leading=16, textColor=DARK, spaceBefore=14, spaceAfter=4, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Body', fontSize=10.5, leading=15, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=8))
styles.add(ParagraphStyle('Spunto', fontSize=10, leading=14.5, textColor=DARK, spaceAfter=5, leftIndent=16))
styles.add(ParagraphStyle('Nota', fontSize=9.5, leading=13, textColor=TEAL, spaceAfter=12, leftIndent=16, fontName='Helvetica-Oblique'))
styles.add(ParagraphStyle('Visione', fontSize=10.5, leading=15, textColor=NAVY, spaceAfter=12,
                           leftIndent=14, borderLeftWidth=3, borderLeftColor=NAVY, borderPadding=10))
styles.add(ParagraphStyle('Small', fontSize=8, leading=10, textColor=GRAY, alignment=TA_CENTER))

def pn(c, d):
    c.saveState()
    c.setFont('Helvetica', 8)
    c.setFillColor(GRAY)
    c.drawCentredString(A4[0]/2, 1.2*cm, f"ELAB Tutor — Spunti per chi vuole contribuire — {d.page}")
    c.restoreState()

def dot(story, text):
    story.append(Paragraph(f"<font color='#1a73e8'><b>•</b></font>  {text}", styles['Spunto']))

def nota(story, text):
    story.append(Paragraph(text, styles['Nota']))

def build():
    path = "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/ELAB-Spunti-Collaborazione-2026-03-18.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=2.2*cm, rightMargin=2.2*cm, topMargin=2.5*cm, bottomMargin=2.2*cm)
    s = []
    W = doc.width

    # ═══════════════════════════════════════════
    # COPERTINA
    # ═══════════════════════════════════════════
    s.append(Spacer(1, 2.5*cm))
    s.append(Paragraph("ELAB Tutor", styles['BigTitle']))
    s.append(Paragraph("Spunti per chi vuole contribuire", styles['Tagline']))
    s.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    s.append(Spacer(1, 1.5*cm))

    s.append(Paragraph(
        "ELAB Tutor e' un simulatore di circuiti con tutor AI che insegna "
        "elettronica e Arduino a bambini dagli 8 ai 14 anni. Ha 69 esperimenti, "
        "22 componenti simulati, un emulatore Arduino nel browser, e un'intelligenza "
        "artificiale di nome Galileo che parla italiano.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Funziona. E' in produzione su elabtutor.school. Ma e' costruito da una persona sola, "
        "e le cose che si potrebbero fare sono molte piu' di quelle che le mani di uno riescono a toccare.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Questo documento e' una mappa di possibilita'. Non serve saper fare tutto — "
        "anche un singolo punto di questa lista, fatto bene, farebbe la differenza.",
        styles['Visione']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 1. FRONTEND
    # ═══════════════════════════════════════════
    s.append(Paragraph("Sviluppo Software", styles['Sec']))

    s.append(Paragraph("Il frontend: React, canvas SVG, editor di codice", styles['Sub']))
    s.append(Paragraph(
        "Il simulatore e' una SPA React 19 con ~181 componenti. La breadboard, i fili, "
        "i LED — tutto e' SVG renderizzato nel browser. L'editor supporta Arduino C++ e Scratch.",
        styles['AreaIntro']
    ))

    dot(s, "Rendere il <b>drag dei componenti fluido su iPad e tablet</b> — oggi il touch interferisce con zoom e pan, e il 50% degli studenti usa tablet")
    dot(s, "Aggiungere una <b>dark mode</b> e una modalita' ad alto contrasto per accessibilita'")
    dot(s, "Migliorare l'<b>editor Arduino</b>: autocompletamento delle funzioni (digitalWrite, analogRead...), snippet pronti, errori evidenziati inline")
    dot(s, "Implementare il <b>salvataggio dei circuiti</b> dell'utente — oggi se ricarichi la pagina perdi tutto")
    dot(s, "Aggiungere <b>animazioni di montaggio</b>: quando il bambino segue il passo-passo, il componente si posiziona con una transizione fluida")
    dot(s, "Creare una <b>vista docente</b>: l'insegnante vede in tempo reale i circuiti di tutta la classe, chi e' bloccato, chi ha finito")
    dot(s, "<b>Refactoring</b> del componente principale (NewElabSimulator.jsx, 1900+ righe) in sotto-componenti piu' gestibili")
    dot(s, "Scrivere <b>test Vitest</b> per i componenti che ne sono sprovvisti — oggi la copertura e' parziale")
    dot(s, "Ottimizzare il <b>rendering SVG</b> quando ci sono 20+ componenti sulla breadboard — oggi rallenta su dispositivi vecchi")
    dot(s, "Aggiungere un sistema di <b>achievement e badge</b> visivi per motivare il progresso del bambino")

    nota(s, "Stack: React 19, Vite 7, CodeMirror 6, Blockly 12, CSS Modules. Deploy su Vercel.")

    s.append(Spacer(1, 0.3*cm))

    # ═══════════════════════════════════════════
    # 2. BACKEND / AI
    # ═══════════════════════════════════════════
    s.append(Paragraph("Il backend AI: Galileo, il tutor che parla italiano", styles['Sub']))
    s.append(Paragraph(
        "Galileo e' l'assistente AI del progetto. Smista i messaggi (azione, spiegazione, circuito, codice, visione), "
        "genera risposte educative, e sta migrando da cloud a 100% locale su M1 8GB.",
        styles['AreaIntro']
    ))

    dot(s, "Costruire il <b>server FastAPI locale</b> che orchestra 5 modelli AI su Ollama (Brain router + Text LLM + Vision + STT + TTS)")
    dot(s, "Ottimizzare il <b>budget RAM su M1 8GB</b>: profiling reale, gestione swap modelli, mutua esclusione intelligente")
    dot(s, "Migliorare il <b>dataset Brain v8</b>: oversampling degli intent rari (vision 2.9%, code 4.1%), nuovi pattern di confusione")
    dot(s, "Creare una <b>eval suite automatica</b> che gira dopo ogni training e produce un report (accuracy per intent, latenza, parse errors)")
    dot(s, "Integrare <b>Kokoro TTS</b>: Galileo che parla con voce naturale in italiano — non la voce robotica del browser")
    dot(s, "Integrare <b>Whisper STT</b> ottimizzato per italiano parlato da bambini (accenti regionali, vocabolario tecnico)")
    dot(s, "Implementare un <b>sistema di caching</b> per le risposte frequenti — il 70% dei messaggi sono azioni ripetitive che non richiedono un LLM")
    dot(s, "Esplorare il <b>fine-tuning del Text LLM</b> (Qwen3.5-4B) su spiegazioni educative in italiano per bambini")
    dot(s, "Aggiungere una <b>memoria conversazionale</b> locale: Galileo ricorda cosa ha detto 5 messaggi fa senza mandare tutto al modello")
    dot(s, "Creare <b>benchmark automatizzati</b>: latenza per scenario (azione 100ms? spiegazione 3s?), uso RAM reale, qualita' risposte")

    nota(s, "Stack locale: Ollama, Qwen3.5-2B (Brain), Qwen3.5-4B (Text), Qwen3-VL 4B (Vision), Kokoro 82M (TTS), Whisper (STT).")

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 3. SIMULAZIONE
    # ═══════════════════════════════════════════
    s.append(Paragraph("Il motore di simulazione: circuiti e Arduino", styles['Sub']))
    s.append(Paragraph(
        "Il CircuitSolver usa KVL/KCL/MNA per calcolare tensioni e correnti in tempo reale. "
        "L'emulatore AVR esegue codice Arduino vero in un Web Worker. Funzionano, ma hanno limiti.",
        styles['AreaIntro']
    ))

    dot(s, "Aggiungere la <b>simulazione transitori RC</b>: un condensatore che si carica nel tempo, con curva esponenziale visibile")
    dot(s, "Implementare il <b>transistor in regione attiva</b> — oggi funziona solo come switch on/off")
    dot(s, "<b>Nuovi componenti</b>: relay, encoder rotativo, display 7 segmenti, sensore ultrasuoni, sensore temperatura, matrice LED")
    dot(s, "Creare un <b>oscilloscopio virtuale</b> che mostra i segnali PWM e analogici in tempo reale")
    dot(s, "Migliorare il <b>modello fisico del buzzer</b>: frequenze diverse, duty cycle PWM che cambia il tono")
    dot(s, "Aggiungere il supporto per <b>piu' breadboard collegate</b> (esperimenti grandi)")
    dot(s, "Implementare la <b>simulazione I2C/SPI</b> per sensori avanzati (display OLED, accelerometro, barometro)")
    dot(s, "Creare un <b>compilatore remoto</b> per librerie Arduino complesse (Servo.h, LiquidCrystal.h, Wire.h)")
    dot(s, "Aggiungere un <b>debugger visuale</b>: breakpoint nel codice, esecuzione passo-passo, watch variabili, stato registri")
    dot(s, "Implementare un <b>bridge USB</b>: Arduino fisico collegato al computer, il simulatore verifica se il circuito reale corrisponde a quello virtuale")

    nota(s, "Motore: CircuitSolver custom (MNA/Gauss), avr8js (ATmega328p), Web Worker per non bloccare la UI.")

    s.append(Spacer(1, 0.3*cm))

    # ═══════════════════════════════════════════
    # 4. INFRASTRUTTURA
    # ═══════════════════════════════════════════
    s.append(Paragraph("Infrastruttura: setup, deploy, automazione", styles['Sub']))
    s.append(Paragraph(
        "Il deploy e' su Vercel (frontend) e Render (backend cloud). "
        "Lo stack locale cambia le regole: serve che un docente possa installare tutto in 5 minuti.",
        styles['AreaIntro']
    ))

    dot(s, "Creare uno <b>script setup one-click</b> per Mac: installa Ollama, scarica modelli, avvia il server, apre il browser")
    dot(s, "Creare una <b>versione Docker Compose</b> per laboratori scolastici (un comando, tutto parte)")
    dot(s, "Configurare <b>CI/CD</b> con test automatici: Vitest + eval Brain + build check su ogni push")
    dot(s, "Creare un <b>installer .dmg</b> per Mac o .exe per Windows — i docenti non usano il terminale")
    dot(s, "Esplorare la <b>distribuzione via USB</b> pre-configurata per laboratori completamente offline")
    dot(s, "Creare una <b>dashboard di monitoraggio</b> locale: stato modelli, RAM usata, latenza, errori")
    dot(s, "Gestire gli <b>aggiornamenti modelli</b> senza rompere le installazioni esistenti (versioning, rollback)")
    dot(s, "Supportare <b>Windows e Linux</b> oltre a Mac — le scuole italiane hanno di tutto")

    nota(s, "Un docente che non riesce a installarlo in 5 minuti non lo usera'. Mai.")

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 5. DESIGN / UX
    # ═══════════════════════════════════════════
    s.append(Paragraph("Design e UX", styles['Sec']))

    s.append(Paragraph("L'interfaccia: farla parlare ai bambini", styles['Sub']))
    s.append(Paragraph(
        "L'interfaccia funziona ma e' stata costruita da un ingegnere, non da un designer. "
        "I bambini hanno soglie di attenzione brevi e zero pazienza per interfacce confuse.",
        styles['AreaIntro']
    ))

    dot(s, "Ripensare l'<b>onboarding</b>: il primo minuto decide tutto. Tutorial interattivo? Mascotte animata? Circuito guidato?")
    dot(s, "Ridisegnare l'interfaccia con <b>focus bambini 8-14</b>: piu' colore, icone grandi, testo minimo, feedback immediato")
    dot(s, "Progettare il <b>personaggio Galileo</b>: avatar, espressioni, animazioni — il tutor deve avere una personalita' visiva")
    dot(s, "Creare <b>feedback visivi ricchi</b>: il LED si accende con un bagliore, il circuito completato fa scintille, l'errore pulsa rosso")
    dot(s, "Ripensare il <b>layout tablet</b>: il 50%+ degli studenti usa iPad, e oggi l'esperienza non e' ottimale")
    dot(s, "Progettare un <b>sistema di badge e progressi</b> visivamente gratificante (non un elenco noioso)")
    dot(s, "Creare <b>micro-animazioni</b> per ogni interazione: drag, drop, connessione filo, pressione pulsante")
    dot(s, "Fare <b>test di usabilita' con bambini veri</b> — non con adulti che immaginano di essere bambini")

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph("Le illustrazioni e la grafica", styles['Sub']))
    s.append(Paragraph(
        "I 22 componenti SVG sono funzionali ma essenziali. Il progetto beneficerebbe "
        "di un'identita' visiva piu' forte e accattivante.",
        styles['AreaIntro']
    ))

    dot(s, "Ridisegnare i <b>22 componenti SVG</b> con uno stile coerente: realistico ma chiaro, con ombre morbide e colori vivaci")
    dot(s, "Creare <b>illustrazioni per le spiegazioni</b>: la legge di Ohm disegnata, non solo scritta. La corrente come acqua in un tubo")
    dot(s, "Progettare <b>sfondi tematici</b> per i diversi volumi (elettronica base, intermedio, Arduino)")
    dot(s, "Creare <b>animazioni Lottie</b> per transizioni e celebrazioni (quiz superato, esperimento completato)")
    dot(s, "Progettare <b>card illustrate</b> per ogni esperimento (l'equivalente della copertina di un capitolo)")
    dot(s, "Creare un <b>design system coerente</b>: palette, tipografia, spacing, iconografia — documentato e riusabile")
    dot(s, "Illustrazioni per il <b>sito pubblico</b> e materiale promozionale (brochure PDF per open day scolastici)")

    nota(s, "Un buon design visivo comunica professionalita'. Le scuole comprano prima con gli occhi, poi con la testa.")

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 6. CONTENUTI EDUCATIVI
    # ═══════════════════════════════════════════
    s.append(Paragraph("Contenuti Educativi", styles['Sec']))

    s.append(Paragraph("Esperimenti, quiz e percorsi didattici", styles['Sub']))
    s.append(Paragraph(
        "Ci sono 69 esperimenti su 3 volumi, 138 quiz e 53 sfide. "
        "Ma nessun pedagogista li ha validati, e i contenuti possibili sono molti di piu'.",
        styles['AreaIntro']
    ))

    dot(s, "Scrivere un <b>Volume 4</b>: elettronica digitale, porte logiche, flip-flop, contatori — la naturale continuazione")
    dot(s, "Creare <b>esperimenti a tema</b>: il semaforo intelligente, la stazione meteo, il robot che evita ostacoli, la serra automatica")
    dot(s, "Progettare <b>quiz interattivi</b>: non solo domande a risposta multipla, ma drag-and-drop di componenti, circuiti da completare, errori da trovare")
    dot(s, "Creare <b>sfide a difficolta' crescente</b>: \"costruisci un circuito che...\" con vincoli (usa massimo 3 componenti, non usare resistori)")
    dot(s, "Scrivere le <b>spiegazioni di Galileo</b> per ogni esperimento: tono amichevole, metafore concrete, italiano semplice")
    dot(s, "Creare una <b>modalita' sandbox guidata</b>: il bambino costruisce liberamente ma Galileo suggerisce cosa provare dopo")
    dot(s, "Aggiungere <b>mini-storie</b> per ogni esperimento: \"Il tuo amico Marco ha un problema: la sua camera e' troppo buia di notte...\"")
    dot(s, "Creare <b>schede stampabili</b> per il laboratorio (schema circuito, tabella componenti, spazio per appunti)")

    nota(s, "69 esperimenti coprono ~1 anno scolastico. 200 coprirebbero 3 anni — un curriculum completo per le medie.")

    s.append(Spacer(1, 0.3*cm))

    s.append(Paragraph("Validazione pedagogica", styles['Sub']))
    s.append(Paragraph(
        "Il buco piu' grande del progetto: nessun bambino reale l'ha mai usato in modo strutturato.",
        styles['AreaIntro']
    ))

    dot(s, "<b>Testare con classi reali</b>: 2-3 lezioni da 45 minuti, osservare dove i bambini si bloccano, cosa li diverte, cosa li annoia")
    dot(s, "Verificare la <b>progressione didattica</b>: i concetti sono introdotti nell'ordine giusto? Ci sono salti troppo bruschi?")
    dot(s, "Valutare le <b>spiegazioni di Galileo</b>: un bambino di 10 anni capisce quello che dice? Usa parole che conosce?")
    dot(s, "Progettare <b>percorsi differenziati</b>: 8-10 anni (piu' visuale, piu' gioco) vs 11-14 anni (piu' testo, piu' codice)")
    dot(s, "Creare <b>guide per docenti</b>: come preparare la lezione, obiettivi per sessione, come valutare l'apprendimento")
    dot(s, "Identificare le <b>misconcezioni comuni</b>: i bambini pensano che la corrente \"si consuma\" nel circuito — come correggere?")
    dot(s, "Allineare gli esperimenti ai <b>programmi ministeriali STEM</b> (indicazioni nazionali per il primo ciclo)")
    dot(s, "Misurare l'<b>apprendimento reale</b>: pre-test e post-test per verificare che i bambini imparino davvero qualcosa")

    nota(s, "Senza validazione con utenti reali, tutto il resto e' teoria. Questo e' il punto piu' critico dell'intero progetto.")

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 7. TESTING / QUALITA'
    # ═══════════════════════════════════════════
    s.append(Paragraph("Testing e Qualita'", styles['Sec']))

    s.append(Paragraph("Cosa testare e dove guardare", styles['Sub']))
    s.append(Paragraph(
        "Il progetto ha test automatici (68/69 esperimenti passano) ma manca testing manuale strutturato "
        "e testing su dispositivi reali — quelli che le scuole hanno davvero.",
        styles['AreaIntro']
    ))

    dot(s, "Testare tutti i 69 esperimenti su <b>Chrome, Safari, Firefox, Edge</b> — oggi e' testato principalmente su Chrome")
    dot(s, "Testare su <b>dispositivi scolastici reali</b>: iPad 7a gen (2019), Chromebook economici, PC Windows con 4GB RAM")
    dot(s, "Provare <b>input reali di bambini</b> con Galileo: grammatica imperfetta, abbreviazioni (\"nn\", \"cmq\"), dialetti, domande fuori tema")
    dot(s, "Testare l'<b>accessibilita'</b>: screen reader (VoiceOver, NVDA), navigazione solo tastiera, daltonismo (filtri colore)")
    dot(s, "Trovare <b>edge case nel simulatore</b>: cortocircuiti, circuiti impossibili, 50 componenti sulla stessa breadboard")
    dot(s, "Testare le <b>performance sotto stress</b>: 30 studenti connessi, circuiti complessi, codice Arduino lungo")
    dot(s, "Creare una <b>suite di test di regressione</b> manuale: checklist per ogni release")
    dot(s, "Testare il <b>flusso completo</b>: dalla registrazione al primo esperimento completato — quanto tempo ci vuole? Dove si perde l'utente?")

    nota(s, "Un bug trovato in laboratorio costa la credibilita'. Un bug trovato prima del rilascio costa 10 minuti.")

    s.append(Spacer(1, 0.5*cm))

    # ═══════════════════════════════════════════
    # 8. TRADUZIONI
    # ═══════════════════════════════════════════
    s.append(Paragraph("Traduzioni e localizzazione", styles['Sub']))
    s.append(Paragraph(
        "ELAB supporta 4 lingue (IT, EN, DE, ES) ma le traduzioni sono parziali e non revisionate da madrelingua.",
        styles['AreaIntro']
    ))

    dot(s, "Revisionare e completare la <b>traduzione inglese</b> di tutti i 69 esperimenti e le spiegazioni di Galileo")
    dot(s, "Revisionare la <b>traduzione tedesca</b> (attualmente automatica, non revisionata)")
    dot(s, "Revisionare la <b>traduzione spagnola</b> (attualmente automatica, non revisionata)")
    dot(s, "Adattare i <b>prompt di Galileo</b> per ogni lingua (non tradurre — riscrivere nel tono giusto per bambini di quella cultura)")
    dot(s, "Aggiungere <b>nuove lingue</b>: francese, portoghese, arabo (mercati educativi enormi)")

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # CHIUSURA
    # ═══════════════════════════════════════════
    s.append(Paragraph("In sintesi", styles['Sec']))

    s.append(Paragraph(
        "Questo elenco non e' un piano — e' una mappa di possibilita'. Nessuno deve fare tutto. "
        "Ogni punto, fatto bene, migliora il progetto in modo concreto.",
        styles['Body']
    ))

    s.append(Paragraph(
        "Le cose che avrebbero piu' impatto, se dovessi sceglierne cinque:",
        styles['Body']
    ))

    dot(s, "<b>Testare con bambini veri</b> — perche' senza questo, tutto il resto e' un'ipotesi")
    dot(s, "<b>Migliorare l'esperienza tablet</b> — perche' meta' degli studenti usa un iPad")
    dot(s, "<b>Completare lo stack AI locale</b> — perche' elimina costi, privacy e latenza")
    dot(s, "<b>Ridisegnare l'onboarding</b> — perche' il primo minuto decide se il bambino resta")
    dot(s, "<b>Scrivere nuovi esperimenti</b> — perche' piu' contenuti = piu' valore = piu' scuole")

    s.append(Spacer(1, 0.8*cm))
    s.append(Paragraph(
        "Il progetto ha il merito di esistere: 69 esperimenti, 22 componenti, un emulatore Arduino, "
        "un tutor AI, 86,000 esempi di training, tutto costruito da una persona. "
        "Quello che manca e' semplice: altre persone.",
        styles['Visione']
    ))

    s.append(Spacer(1, 1.5*cm))
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
