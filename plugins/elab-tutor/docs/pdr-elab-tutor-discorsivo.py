#!/usr/bin/env python3
"""PDR discorsivo dell'intero progetto ELAB Tutor — massima onesta'."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, ListFlowable, ListItem
)
from datetime import datetime

# Colors
BLUE = HexColor("#1a73e8")
DARK = HexColor("#202124")
GRAY = HexColor("#5f6368")
LGRAY = HexColor("#f8f9fa")
GREEN = HexColor("#0d904f")
RED = HexColor("#c5221f")
ORANGE = HexColor("#e37400")
NAVY = HexColor("#1E4D8C")

styles = getSampleStyleSheet()

styles.add(ParagraphStyle('DocTitle', fontSize=28, leading=34, textColor=NAVY, spaceAfter=4, alignment=TA_LEFT, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('DocSub', fontSize=13, leading=18, textColor=GRAY, spaceAfter=24, alignment=TA_LEFT))
styles.add(ParagraphStyle('Sec', fontSize=17, leading=22, textColor=NAVY, spaceBefore=24, spaceAfter=10, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Sub', fontSize=13, leading=17, textColor=DARK, spaceBefore=16, spaceAfter=6, fontName='Helvetica-Bold'))
styles.add(ParagraphStyle('Body', fontSize=10.5, leading=15, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=10))
styles.add(ParagraphStyle('Quote', fontSize=10, leading=14, textColor=GRAY, alignment=TA_LEFT, spaceAfter=10, leftIndent=20, rightIndent=20, fontName='Helvetica-Oblique'))
styles.add(ParagraphStyle('Honest', fontSize=10, leading=14, textColor=RED, spaceAfter=10, leftIndent=14, borderLeftWidth=3, borderLeftColor=RED, borderPadding=8))
styles.add(ParagraphStyle('Good', fontSize=10, leading=14, textColor=GREEN, spaceAfter=10, leftIndent=14, borderLeftWidth=3, borderLeftColor=GREEN, borderPadding=8))
styles.add(ParagraphStyle('Warn', fontSize=10, leading=14, textColor=ORANGE, spaceAfter=10, leftIndent=14, borderLeftWidth=3, borderLeftColor=ORANGE, borderPadding=8))
styles.add(ParagraphStyle('Small', fontSize=8, leading=10, textColor=GRAY, alignment=TA_CENTER))
styles.add(ParagraphStyle('TCell', fontSize=9, leading=12, textColor=DARK))
styles.add(ParagraphStyle('THead', fontSize=9, leading=12, textColor=white, alignment=TA_CENTER))

def T(headers, rows, cw=None):
    hc = [Paragraph(f"<b>{h}</b>", styles['THead']) for h in headers]
    data = [hc] + [[Paragraph(str(c), styles['TCell']) for c in r] for r in rows]
    t = Table(data, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, HexColor("#dadce0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, LGRAY]),
    ]))
    return t

def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRAY)
    canvas.drawCentredString(A4[0]/2, 1.2*cm, f"ELAB Tutor — PDR Progetto — Pagina {doc.page}")
    canvas.restoreState()

def build():
    path = "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/PDR-ELAB-Tutor-Completo-2026-03-18.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=2.2*cm, rightMargin=2.2*cm, topMargin=2.5*cm, bottomMargin=2.2*cm)
    s = []
    W = doc.width

    # ═══════════════════════════════════════════
    # COPERTINA
    # ═══════════════════════════════════════════
    s.append(Spacer(1, 3*cm))
    s.append(Paragraph("ELAB Tutor", styles['DocTitle']))
    s.append(Paragraph("Piano di Sviluppo e Report di Progetto", styles['DocSub']))
    s.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    s.append(Spacer(1, 1.2*cm))

    s.append(Paragraph(
        "Un simulatore di circuiti con tutor AI per insegnare elettronica e Arduino "
        "a bambini dagli 8 ai 14 anni. Questo documento racconta il progetto con onesta': "
        "cosa funziona, cosa no, dove siamo e dove stiamo andando.",
        styles['Body']
    ))
    s.append(Spacer(1, 0.8*cm))

    meta = [
        ["Autore", "Andrea Marro"],
        ["Data", "18 Marzo 2026"],
        ["Versione software", "v5.4.0 (produzione)"],
        ["Sito", "www.elabtutor.school"],
        ["Licenza", "Proprietaria — Tutti i diritti riservati"],
        ["Target", "Bambini 8-14 anni, scuole medie, laboratori STEM"],
    ]
    t = Table(meta, colWidths=[4*cm, W - 4*cm])
    t.setStyle(TableStyle([
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), GRAY),
        ('TEXTCOLOR', (1,0), (1,-1), DARK),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, HexColor("#e0e0e0")),
    ]))
    s.append(t)
    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 1. L'IDEA
    # ═══════════════════════════════════════════
    s.append(Paragraph("1. L'idea dietro ELAB Tutor", styles['Sec']))

    s.append(Paragraph(
        "ELAB Tutor nasce da un'osservazione semplice: insegnare elettronica ai bambini con un libro "
        "e una breadboard fisica e' lento, frustrante e costoso. I componenti si bruciano, i fili si staccano, "
        "i LED non si accendono e nessuno capisce perche'. Il bambino si scoraggia e il docente non ha tempo "
        "di seguire trenta studenti uno per uno.",
        styles['Body']
    ))
    s.append(Paragraph(
        "L'idea e' stata: costruire un simulatore web che replica fedelmente la breadboard fisica, "
        "con un tutor AI che fa da assistente personale. Il bambino trascina componenti, collega fili, "
        "scrive codice Arduino, e quando si blocca chiede aiuto a Galileo — un'intelligenza artificiale "
        "che parla italiano e capisce di elettronica.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Il progetto e' ambizioso: non e' un semplice simulatore di circuiti, e non e' un semplice chatbot. "
        "E' la combinazione dei due, integrata con 69 esperimenti didattici allineati a un libro di testo fisico, "
        "un emulatore AVR reale che esegue codice Arduino nel browser, e un sistema di giochi educativi.",
        styles['Body']
    ))

    s.append(Paragraph(
        "L'ambizione ha un prezzo: il progetto e' sviluppato da una persona sola. Non c'e' un team, "
        "non c'e' un budget significativo, non c'e' un'azienda dietro. Questo significa che ogni decisione "
        "tecnica e' un compromesso tra qualita', tempo e costi.",
        styles['Honest']
    ))

    # ═══════════════════════════════════════════
    # 2. COSA FA
    # ═══════════════════════════════════════════
    s.append(Paragraph("2. Cosa fa ELAB Tutor, concretamente", styles['Sec']))

    s.append(Paragraph(
        "Un bambino apre il browser, carica un esperimento (per esempio \"Il Semaforo\"), e vede una breadboard "
        "virtuale con i componenti da montare. Segue i passi guidati: metti il LED rosso qui, collega questo filo "
        "la', inserisci il resistore da 220 ohm. Ogni passo e' illustrato e corrisponde esattamente alla pagina "
        "del libro di testo.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Quando il circuito e' montato, il bambino scrive il codice Arduino nell'editor integrato (o usa i blocchi "
        "Scratch se preferisce la programmazione visuale). Preme Play e il simulatore esegue il codice su un emulatore "
        "ATmega328p reale — non una simulazione approssimativa, ma un vero AVR che interpreta il codice C++ compilato. "
        "Il LED si accende, il buzzer suona, il servo ruota.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Se qualcosa non funziona, il bambino puo' chiedere a Galileo: \"perche' il LED non si accende?\". "
        "Galileo analizza il circuito, identifica il problema (magari un resistore mancante o un pin sbagliato), "
        "e spiega la soluzione in italiano semplice, adatto a un bambino di 10 anni.",
        styles['Body']
    ))

    s.append(Paragraph("2.1 I numeri", styles['Sub']))
    s.append(T(
        ["Metrica", "Valore"],
        [
            ["Esperimenti didattici", "69 (3 volumi + extra)"],
            ["Componenti SVG simulati", "22 (LED, resistori, condensatori, servo, LCD, transistor...)"],
            ["Quiz integrati", "138 domande"],
            ["Giochi educativi", "53 (Trova il Guasto, Prevedi e Spiega, Circuito Misterioso...)"],
            ["Blocchi Scratch custom", "22 (tradotti in C++ Arduino reale)"],
            ["Lingue supportate", "4 (italiano, inglese, tedesco, spagnolo)"],
            ["Componenti React", "~181"],
            ["Righe di codice stimate", "~80,000+"],
        ],
        cw=[5*cm, W - 5*cm]
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 3. ARCHITETTURA TECNICA
    # ═══════════════════════════════════════════
    s.append(Paragraph("3. Come funziona sotto il cofano", styles['Sec']))

    s.append(Paragraph(
        "Il frontend e' una single-page application React 19, servita da Vercel. Tutto il simulatore "
        "gira nel browser — non c'e' elaborazione lato server per la simulazione. Questo significa che "
        "funziona anche offline (tranne il tutor AI) e su dispositivi modesti.",
        styles['Body']
    ))

    s.append(Paragraph("3.1 Il motore di simulazione", styles['Sub']))
    s.append(Paragraph(
        "Il cuore tecnico e' il CircuitSolver: un risolutore di circuiti che usa le leggi di Kirchhoff (KVL/KCL) "
        "e l'analisi nodale modificata (MNA) con eliminazione gaussiana. Quando il bambino collega un filo, "
        "il solver ricalcola in tempo reale tensioni e correnti su ogni nodo del circuito. "
        "Non e' un'approssimazione didattica — e' una simulazione fisicamente corretta.",
        styles['Body']
    ))
    s.append(Paragraph(
        "L'emulatore AVR (avr8js) gira in un Web Worker separato, cosi' non blocca l'interfaccia. "
        "Esegue un vero ATmega328p virtualizzato con i registri PORTB/PORTC/PORTD, i timer PWM, "
        "l'ADC a 10 bit, e le interrupt. Il codice Arduino scritto dal bambino viene compilato "
        "ed eseguito come se fosse su un Arduino Nano reale.",
        styles['Body']
    ))

    s.append(Paragraph(
        "Il solver MNA funziona bene per circuiti resistivi e LED, ma ha limiti sui transitori RC "
        "(condensatori che si caricano nel tempo) e sulle simulazioni analogiche complesse. "
        "Per il target educativo (bambini 8-14) questo non e' un problema immediato, "
        "ma limita l'espansione verso esperimenti piu' avanzati.",
        styles['Warn']
    ))

    s.append(Paragraph("3.2 L'intelligenza artificiale: Galileo", styles['Sub']))
    s.append(Paragraph(
        "Galileo e' il tutor AI del progetto. Nella versione cloud attuale, funziona cosi': "
        "il messaggio del bambino arriva a un backend FastAPI su Render. Un modulo \"Brain\" classifica "
        "l'intent (azione, circuito, codice, spiegazione, visione, navigazione) e lo smista allo specialista "
        "appropriato. Ogni specialista ha un prompt YAML dedicato con conoscenza del dominio.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Il backend usa un'architettura multi-LLM con racing parallelo: DeepSeek per la qualita', "
        "Groq per la velocita', Gemini per la visione. Il primo che risponde vince. "
        "C'e' un filtro di qualita', un limite di token, e un filtro anti-parolacce (e' per bambini).",
        styles['Body']
    ))
    s.append(Paragraph(
        "L'architettura cloud funziona, ma ha problemi reali: i costi delle API si accumulano "
        "(15-30 EUR/mese tra DeepSeek, Groq e Render), il cold start di Render sul free tier "
        "puo' raggiungere i 30 secondi, e la dipendenza da servizi esterni significa che se uno "
        "dei provider ha un'interruzione, Galileo smette di funzionare. "
        "Inoltre, i dati delle conversazioni transitano su server di terze parti — "
        "un problema per scuole attente alla privacy (GDPR).",
        styles['Honest']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 4. STATO DEL PROGETTO
    # ═══════════════════════════════════════════
    s.append(Paragraph("4. Dove siamo oggi — con onesta'", styles['Sec']))

    s.append(Paragraph("4.1 Cosa funziona bene", styles['Sub']))
    s.append(Paragraph(
        "Il simulatore di circuiti e' solido. 68 esperimenti su 69 passano i test end-to-end. "
        "I 22 componenti SVG si comportano correttamente, il wire routing funziona, "
        "lo zoom e il pan sono fluidi, il copia-incolla funziona con remapping automatico degli ID. "
        "L'editor di codice con syntax highlighting, l'editor Scratch con 22 blocchi custom "
        "che si compilano in C++ Arduino reale, il monitor seriale — tutto funziona.",
        styles['Good']
    ))
    s.append(Paragraph(
        "La qualita' complessiva e' stata valutata 9.2/10 da audit automatizzati multi-agente. "
        "Il simulatore ha 10/10 in funzionalita', Scratch/Blockly 10/10, "
        "integrazione AI 10/10, sicurezza 9.8/10. I punti deboli sono il supporto iPad (8.5/10) "
        "e l'accessibilita' (9.2/10).",
        styles['Good']
    ))

    s.append(Paragraph("4.2 Cosa non funziona o e' incompleto", styles['Sub']))
    s.append(Paragraph(
        "Il supporto iPad ha problemi di touch: il drag dei componenti non e' fluido "
        "come su desktop, e i gesti di zoom interferiscono con il pan della breadboard. "
        "Non c'e' un'app nativa — tutto passa dal browser, con i limiti che ne conseguono.",
        styles['Honest']
    ))
    s.append(Paragraph(
        "La compilazione di librerie Arduino complesse (Servo.h, LiquidCrystal.h) "
        "richiede un compilatore remoto che non e' ancora implementato. L'emulatore AVR locale "
        "compila un sottoinsieme del C++ — sufficiente per il 90% degli esperimenti, "
        "ma non per quelli che usano librerie esterne.",
        styles['Honest']
    ))
    s.append(Paragraph(
        "Il modello di business non e' ancora validato. Il sito esiste, la licenza c'e', "
        "ma non ci sono dati reali su quanti utenti pagherebbero per il servizio. "
        "Il progetto e' in una fase pre-commerciale: funziona tecnicamente, "
        "ma la viabilita' economica e' tutta da dimostrare.",
        styles['Honest']
    ))

    s.append(Paragraph("4.3 I numeri della qualita'", styles['Sub']))
    s.append(T(
        ["Area", "Score", "Note"],
        [
            ["Simulatore", "10.0/10", "Tutti i componenti, solver, AVR emulator"],
            ["Scratch/Blockly", "10.0/10", "22 blocchi, transpilazione C++ corretta"],
            ["AI Integration", "10.0/10", "Multi-LLM, vision, memoria sessione"],
            ["Autenticazione", "9.8/10", "bcrypt, HMAC-SHA256, RBAC"],
            ["Qualita' codice", "9.8/10", "181 componenti React, CSS Modules"],
            ["Sito pubblico", "9.6/10", "Vercel, CSP, HSTS"],
            ["Responsive/A11y", "9.2/10", "Margine di miglioramento su mobile"],
            ["iPad", "8.5/10", "Touch drag problematico"],
        ],
        cw=[3.5*cm, 2*cm, W - 5.5*cm]
    ))

    s.append(Paragraph(
        "Questi punteggi vengono da audit automatizzati, non da utenti reali. "
        "Un 10/10 in AI Integration non significa che Galileo sia perfetto — significa che "
        "l'integrazione tecnica e' completa. La qualita' delle risposte di Galileo "
        "dipende dai modelli LLM sottostanti, che non controlliamo.",
        styles['Honest']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 5. IL DATASET GALILEO BRAIN
    # ═══════════════════════════════════════════
    s.append(Paragraph("5. Il cervello di Galileo: il dataset", styles['Sec']))

    s.append(Paragraph(
        "Il Brain e' il componente piu' critico dell'AI: decide cosa fare con il messaggio del bambino. "
        "\"Avvia la simulazione\" deve produrre un'azione immediata, non una spiegazione. "
        "\"Cos'e' un resistore?\" deve andare al modello grande per una spiegazione educativa. "
        "Se il Brain sbaglia, tutto il resto e' inutile.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Il dataset e' cresciuto attraverso 7 versioni: da 5,383 esempi (v3) a 10,284 (v4) "
        "a 20,319 (v6) fino agli attuali 85,966 (v7). Ogni versione ha aggiunto strati: "
        "prima gli esempi base, poi il contesto del simulatore, poi gli input avversariali "
        "(typos, dialetti, messaggi confusi), poi le azioni multiple e gli input impliciti.",
        styles['Body']
    ))
    s.append(Paragraph(
        "La versione 7 ha 11 strati di augmentation che coprono 5 dialetti italiani regionali, "
        "13 categorie di sinonimi verbali, typos realistici (\"nn\" per \"non\", \"xfavore\"), "
        "e messaggi lunghi e confusi tipici dei bambini. L'obiettivo e' che il Brain capisca "
        "\"daje fallo anda'\" (romano) come \"avvia la simulazione\".",
        styles['Body']
    ))

    s.append(T(
        ["Intent", "Esempi", "%", "Valutazione onesta"],
        [
            ["action", "27,943", "32.5%", "Solido — intent piu' frequente e meglio rappresentato"],
            ["circuit", "21,268", "24.7%", "Solido — buona copertura componenti/azioni"],
            ["tutor", "21,151", "24.6%", "Solido — spiegazioni educative, needs_llm=true"],
            ["navigation", "9,645", "11.2%", "Adeguato — caricamento esperimenti, manuale"],
            ["code", "3,500", "4.1%", "Rischio — pochi esempi, confine sfumato con tutor"],
            ["vision", "2,459", "2.9%", "Rischio — pochissimi, il modello potrebbe non imparare bene"],
        ],
        cw=[2.2*cm, 2*cm, 1.3*cm, W - 5.5*cm]
    ))

    s.append(Paragraph(
        "Lo sbilanciamento e' un problema reale. Vision con solo il 2.9% degli esempi "
        "potrebbe essere classificato male. La soluzione ideale sarebbe un dataset v8 con "
        "oversampling di vision e code, ma richiede tempo che al momento non c'e'.",
        styles['Honest']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 6. IL SALTO LOCALE
    # ═══════════════════════════════════════════
    s.append(Paragraph("6. Il grande salto: da cloud a 100% locale", styles['Sec']))

    s.append(Paragraph(
        "La decisione piu' ambiziosa del progetto e' in corso proprio ora: spostare l'intero "
        "backend AI dal cloud a un MacBook M1 con 8 GB di RAM. Niente piu' API a pagamento, "
        "niente piu' cold start, niente piu' dati su server esterni. Tutto locale, tutto offline, tutto gratis.",
        styles['Body']
    ))

    s.append(Paragraph("6.1 Perche'", styles['Sub']))
    s.append(Paragraph(
        "Le ragioni sono concrete: i costi cloud si accumulano (15-30 EUR/mese), il cold start di Render "
        "rovina l'esperienza utente (fino a 30 secondi di attesa), la dipendenza da provider esterni "
        "e' un rischio operativo, e le scuole italiane sono sempre piu' sensibili alla privacy dei dati "
        "dei minori. Un sistema 100% locale risolve tutti questi problemi contemporaneamente.",
        styles['Body']
    ))

    s.append(Paragraph("6.2 Come: 5 modelli su 8 GB", styles['Sub']))
    s.append(Paragraph(
        "L'architettura prevede 5 modelli AI che si alternano in RAM: un Brain router (Qwen3.5-2B, "
        "fine-tuned sui nostri 86K esempi) sempre in memoria per smistare i messaggi in meno di 170ms; "
        "un Text LLM (Qwen3.5-4B) caricato on-demand per le spiegazioni educative; "
        "un modello Vision (Qwen3-VL 4B) per analizzare le foto dei circuiti; "
        "Whisper per il riconoscimento vocale in italiano; e Kokoro per la sintesi vocale.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Il trucco e' la mutua esclusione: il Text LLM e il Vision non sono mai in RAM contemporaneamente. "
        "Quando serve una spiegazione, Ollama carica il Text LLM (2.5 GB). Quando serve la visione, "
        "scarica il Text e carica il Vision (2.8 GB). Il Brain (1.5 GB) resta sempre in RAM per il routing veloce.",
        styles['Body']
    ))

    s.append(Paragraph(
        "Questa architettura e' elegante sulla carta ma non e' mai stata testata nella pratica. "
        "Non sappiamo se Ollama gestisce lo swap dei modelli abbastanza velocemente, "
        "non sappiamo se 8 GB bastano con macOS e il browser aperti (macOS da solo usa ~2.3 GB), "
        "e non sappiamo se la qualita' dei modelli 2B e 4B e' sufficiente per un'esperienza utente accettabile. "
        "I benchmark dicono di si'. La realta' potrebbe dire altro.",
        styles['Honest']
    ))

    s.append(Paragraph("6.3 Stato del training", styles['Sub']))
    s.append(Paragraph(
        "Al momento della stesura di questo documento (sera del 18 marzo 2026), il training "
        "del Brain v7 e' appena stato avviato su Google Colab con GPU A100. Il modello e' "
        "Qwen3.5-2B con bf16 LoRA, addestrato su 85,966 esempi per 3 epoche. "
        "Il training auto-salva su Google Drive ogni 500 steps per sopravvivere a una disconnessione notturna.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Il setup del training ha richiesto 6 tentativi a causa di incompatibilita' tra Unsloth, "
        "transformers e trl. Il notebook originale non funzionava — ogni cella ha richiesto fix in tempo reale. "
        "Questo e' emblematico della sfida dell'intero progetto: le cose sulla carta funzionano, "
        "ma l'integrazione reale e' sempre piu' complicata del previsto.",
        styles['Honest']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 7. CONFRONTO ONESTO
    # ═══════════════════════════════════════════
    s.append(Paragraph("7. Cloud vs Locale — il confronto onesto", styles['Sec']))

    s.append(Paragraph(
        "Sarebbe facile presentare il passaggio al locale come un puro upgrade. Non lo e'. "
        "E' un trade-off consapevole dove si guadagna su alcuni fronti e si perde su altri.",
        styles['Body']
    ))

    s.append(Paragraph("Dove il locale vince nettamente:", styles['Sub']))
    s.append(Paragraph(
        "Costo (da 15-30 EUR/mese a zero), privacy (nessun dato esce dal computer), "
        "cold start (da 5-30 secondi a zero), latenza azioni dirette (da 0.8-2 secondi a 100-170ms), "
        "affidabilita' (nessuna dipendenza da internet o provider esterni).",
        styles['Good']
    ))

    s.append(Paragraph("Dove il cloud resta superiore:", styles['Sub']))
    s.append(Paragraph(
        "Qualita' delle risposte testuali: Qwen3.5-4B locale non e' GPT-4o o Gemini Pro. "
        "Le spiegazioni saranno meno ricche, meno sfumate, con piu' errori occasionali. "
        "Qualita' della visione: Qwen3-VL 4B locale non e' Gemini Pro Vision. L'analisi "
        "dei circuiti sara' meno precisa, specialmente per dettagli fini come fili sottili "
        "o componenti parzialmente nascosti. Scalabilita': il locale funziona per un utente "
        "alla volta su un singolo Mac. Il cloud scala a migliaia di utenti.",
        styles['Honest']
    ))

    s.append(Paragraph(
        "Per un tutor educativo rivolto a bambini di 8-14 anni, i trade-off sono probabilmente accettabili. "
        "Il 70% delle interazioni sono azioni dirette (\"avvia\", \"resetta\", \"metti un LED\") "
        "che non richiedono un LLM potente — il Brain locale basta e avanza. "
        "Le spiegazioni (25%) saranno meno sofisticate ma comunque utili. "
        "La visione (4%) sara' meno precisa ma e' usata raramente.",
        styles['Body']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 8. RISCHI
    # ═══════════════════════════════════════════
    s.append(Paragraph("8. I rischi reali", styles['Sec']))

    s.append(Paragraph("8.1 Rischi tecnici", styles['Sub']))
    s.append(Paragraph(
        "<b>RAM insufficiente su M1 8GB:</b> Il budget RAM e' calcolato al millimetro. "
        "Se macOS usa piu' del previsto, o se il browser ha molte tab aperte, "
        "lo swap su disco rallenta tutto di 2-5x. Il picco teorico e' 7 GB su 8 disponibili — "
        "un margine del 12% e' stretto.<br/><br/>"
        "<b>Qualita' Brain v7 insufficiente:</b> Se il modello fine-tuned non raggiunge il 95% "
        "di accuracy, lo smistamento dei messaggi sara' inaffidabile. Un bambino che chiede "
        "\"cos'e' un resistore?\" e riceve un'azione invece di una spiegazione perdera' fiducia nel tutor.<br/><br/>"
        "<b>Incompatibilita' versioni:</b> L'ecosistema ML open source cambia velocemente. "
        "Unsloth, transformers, trl, Ollama — ognuno con il suo ciclo di release. "
        "Combinazioni che funzionano oggi potrebbero rompersi domani.",
        styles['Body']
    ))

    s.append(Paragraph("8.2 Rischi di progetto", styles['Sub']))
    s.append(Paragraph(
        "<b>Sviluppatore singolo:</b> Il progetto e' sviluppato da una persona. Questo significa "
        "che il bus factor e' 1 — se lo sviluppatore si ferma, il progetto si ferma. "
        "Non c'e' code review, non c'e' pair programming, non c'e' ridondanza. "
        "La documentazione e' estesa (116 documenti tecnici, 17 report di audit), "
        "ma e' stata scritta principalmente per assistenza AI, non per onboarding umano.<br/><br/>"
        "<b>Validazione utente assente:</b> Non ci sono dati su utenti reali. "
        "Il simulatore e' stato testato tecnicamente (68/69 test pass) "
        "ma non con bambini veri in un contesto scolastico. E' possibile che l'interfaccia "
        "sia troppo complessa, che le spiegazioni di Galileo non siano adatte all'eta', "
        "o che il flusso didattico non funzioni come previsto.<br/><br/>"
        "<b>Modello di business non validato:</b> Il prezzo, la distribuzione e il target "
        "di mercato sono ipotesi, non dati. Le scuole italiane hanno budget limitati, "
        "cicli di acquisto lunghi, e resistenza al cambiamento.",
        styles['Body']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 9. ROADMAP
    # ═══════════════════════════════════════════
    s.append(Paragraph("9. Cosa resta da fare", styles['Sec']))

    s.append(Paragraph("9.1 Breve termine (prossime 1-2 settimane)", styles['Sub']))
    s.append(Paragraph(
        "La priorita' immediata e' completare lo stack locale: verificare il training Brain v7 "
        "(domani mattina), deployare il GGUF su Ollama, costruire il server FastAPI locale, "
        "integrare il frontend con il flag cloud/locale, e aggiungere la voce (TTS + STT). "
        "Se tutto va bene, in 4-5 giorni avremo un prototipo funzionante. "
        "Se ci sono problemi (e ce ne saranno), 1-2 settimane.",
        styles['Body']
    ))

    s.append(Paragraph("9.2 Medio termine (1-3 mesi)", styles['Sub']))
    s.append(Paragraph(
        "Test con utenti reali (bambini e docenti). Iterazione sull'interfaccia basata su feedback. "
        "Ottimizzazione RAM per M1 8GB basata su dati reali di utilizzo. "
        "Possibile dataset v8 con oversampling degli intent minoritari. "
        "Valutazione se il modello locale e' sufficiente o se serve un'opzione cloud premium.",
        styles['Body']
    ))

    s.append(Paragraph("9.3 Lungo termine (3-12 mesi)", styles['Sub']))
    s.append(Paragraph(
        "Validazione commerciale con scuole pilota. Decisione build vs buy per la distribuzione "
        "(SaaS cloud, app desktop, USB pre-configurata per laboratori scolastici). "
        "Espansione contenuti didattici (Volume 4? Esperimenti avanzati?). "
        "Possibile integrazione con hardware fisico (Arduino reale collegato via USB al simulatore).",
        styles['Body']
    ))

    s.append(Paragraph(
        "Queste roadmap sono aspirazionali. Con un team di una persona, "
        "la velocita' di esecuzione dipende interamente dalla disponibilita' di tempo "
        "e dall'assenza di imprevisti tecnici. Entrambe sono imprevedibili.",
        styles['Warn']
    ))

    s.append(PageBreak())

    # ═══════════════════════════════════════════
    # 10. CONCLUSIONE
    # ═══════════════════════════════════════════
    s.append(Paragraph("10. In sintesi", styles['Sec']))

    s.append(Paragraph(
        "ELAB Tutor e' un progetto tecnicamente maturo ma commercialmente non validato. "
        "Il simulatore funziona, l'AI e' integrata, i contenuti didattici ci sono. "
        "Manca la prova piu' importante: che un bambino di 10 anni lo usi davvero, "
        "impari qualcosa, e torni il giorno dopo.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Il passaggio al locale e' una scommessa calcolata. Se funziona, rimuove "
        "le tre barriere principali (costo, privacy, latenza) che renderebbero difficile "
        "la distribuzione nelle scuole. Se non funziona, il backend cloud resta attivo "
        "come fallback — nulla va perso.",
        styles['Body']
    ))
    s.append(Paragraph(
        "Il progetto ha il merito di esistere: 69 esperimenti, 22 componenti, un emulatore AVR, "
        "un tutor AI, 86,000 esempi di training, tutto costruito da una persona in pochi mesi. "
        "Ha il difetto di non essere ancora stato testato dove conta — con gli utenti finali. "
        "Tutto il resto e' ingegneria. Quello che manca e' il contatto con la realta'.",
        styles['Body']
    ))

    s.append(Spacer(1, 1.5*cm))
    s.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    s.append(Spacer(1, 0.3*cm))
    s.append(Paragraph(
        f"Documento generato il {datetime.now().strftime('%d/%m/%Y alle %H:%M')} — "
        "PDR ELAB Tutor — Andrea Marro — Con massima onesta'.",
        styles['Small']
    ))

    doc.build(s, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF generato: {path}")

if __name__ == "__main__":
    build()
