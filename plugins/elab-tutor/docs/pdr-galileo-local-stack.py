#!/usr/bin/env python3
"""Genera il PDR (Piano di Sviluppo / Report) del progetto Galileo Local Stack."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib import colors
from datetime import datetime

# === COLORS ===
BLUE = HexColor("#1a73e8")
DARK = HexColor("#202124")
GRAY = HexColor("#5f6368")
LIGHT_GRAY = HexColor("#f8f9fa")
GREEN = HexColor("#0d904f")
RED = HexColor("#d93025")
ORANGE = HexColor("#e37400")
LIGHT_BLUE = HexColor("#e8f0fe")

# === STYLES ===
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    'DocTitle', parent=styles['Title'],
    fontSize=24, leading=30, textColor=DARK,
    spaceAfter=6, alignment=TA_LEFT
))
styles.add(ParagraphStyle(
    'DocSubtitle', parent=styles['Normal'],
    fontSize=12, leading=16, textColor=GRAY,
    spaceAfter=20, alignment=TA_LEFT
))
styles.add(ParagraphStyle(
    'SectionTitle', parent=styles['Heading1'],
    fontSize=16, leading=20, textColor=BLUE,
    spaceBefore=20, spaceAfter=10,
    borderWidth=0, borderPadding=0
))
styles.add(ParagraphStyle(
    'SubSection', parent=styles['Heading2'],
    fontSize=13, leading=16, textColor=DARK,
    spaceBefore=14, spaceAfter=6
))
styles.add(ParagraphStyle(
    'Body', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=DARK,
    alignment=TA_JUSTIFY, spaceAfter=8
))
styles.add(ParagraphStyle(
    'BodyBold', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=DARK,
    alignment=TA_LEFT, spaceAfter=4
))
styles.add(ParagraphStyle(
    'Honest', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=RED,
    alignment=TA_JUSTIFY, spaceAfter=8,
    leftIndent=12, borderLeftWidth=3,
    borderLeftColor=RED, borderPadding=8
))
styles.add(ParagraphStyle(
    'Positive', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=GREEN,
    alignment=TA_JUSTIFY, spaceAfter=8,
    leftIndent=12, borderLeftWidth=3,
    borderLeftColor=GREEN, borderPadding=8
))
styles.add(ParagraphStyle(
    'Warning', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=ORANGE,
    alignment=TA_JUSTIFY, spaceAfter=8,
    leftIndent=12, borderLeftWidth=3,
    borderLeftColor=ORANGE, borderPadding=8
))
styles.add(ParagraphStyle(
    'SmallGray', parent=styles['Normal'],
    fontSize=8, leading=10, textColor=GRAY,
    alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'TableCell', parent=styles['Normal'],
    fontSize=9, leading=12, textColor=DARK
))
styles.add(ParagraphStyle(
    'TableHeader', parent=styles['Normal'],
    fontSize=9, leading=12, textColor=white,
    alignment=TA_CENTER
))

def make_table(headers, rows, col_widths=None):
    """Crea tabella formattata."""
    header_cells = [Paragraph(f"<b>{h}</b>", styles['TableHeader']) for h in headers]
    data = [header_cells]
    for row in rows:
        data.append([Paragraph(str(c), styles['TableCell']) for c in row])

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#dadce0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
    ]))
    return t

def build_pdf():
    output_path = "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/PDR-Galileo-Local-Stack-2026-03-18.pdf"

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2*cm
    )

    story = []
    W = doc.width

    # ══════════════════════════════════════════
    # COPERTINA
    # ══════════════════════════════════════════
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("GALILEO LOCAL STACK", styles['DocTitle']))
    story.append(Paragraph("Piano di Sviluppo e Report di Progetto (PDR)", styles['DocSubtitle']))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 1*cm))

    meta = [
        ["Progetto", "ELAB Tutor — Galileo AI 100% Locale"],
        ["Autore", "Andrea Marro"],
        ["Data", "18 Marzo 2026"],
        ["Versione", "v7 (Brain dataset v7, 85,966 esempi)"],
        ["Target HW", "MacBook M1 8GB RAM"],
        ["Obiettivo", "Zero cloud, zero costi, zero dipendenze, privacy totale"],
    ]
    t = Table(meta, colWidths=[4*cm, W - 4*cm])
    t.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), GRAY),
        ('TEXTCOLOR', (1, 0), (1, -1), DARK),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, HexColor("#e0e0e0")),
    ]))
    story.append(t)

    story.append(Spacer(1, 1.5*cm))
    story.append(Paragraph(
        "<b>NOTA:</b> Questo documento e' scritto con massima onesta'. "
        "I rischi, le incognite e i limiti sono documentati esplicitamente. "
        "Nulla e' edulcorato.",
        styles['Warning']
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 1. STATO ATTUALE
    # ══════════════════════════════════════════
    story.append(Paragraph("1. Stato Attuale del Progetto", styles['SectionTitle']))

    story.append(Paragraph("1.1 Cosa esiste oggi", styles['SubSection']))
    story.append(make_table(
        ["Componente", "Stato", "Completezza"],
        [
            ["Dataset v7 (galileo-brain-v7.jsonl)", "PRONTO", "85,966 esempi, 133 MB, 11 strati, verificato"],
            ["Dataset eval v7", "PRONTO", "196 esempi bilanciati, verificato"],
            ["Notebook Colab v7 (11 celle)", "PRONTO", "Auto-detect Qwen3.5/Qwen3-4B fallback"],
            ["Documenti architettura", "PRONTI", "Stack 5 modelli, budget RAM, latenza"],
            ["Piano implementazione", "PRONTO", "4 fasi, 9 task, comandi esatti"],
            ["Test suite (test-brain-complete.py)", "PRONTA", "120 eval + 80 stress test"],
            ["Frontend ELAB Tutor", "ESISTENTE", "React, gia' funzionante con cloud"],
            ["Backend cloud (nanobot)", "ESISTENTE", "Render + DeepSeek/Groq/Gemini"],
        ],
        col_widths=[5.5*cm, 2.5*cm, W - 8*cm]
    ))

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("1.2 Cosa NON esiste ancora", styles['SubSection']))
    story.append(make_table(
        ["Componente", "Stato", "Dipende da"],
        [
            ["Modello Brain fine-tuned", "IN TRAINING", "Training Colab in corso (18/03/2026 notte)"],
            ["GGUF per Ollama", "NON ESISTE", "Completamento training + export"],
            ["nanobot-local/server.py", "NON ESISTE", "Deploy GGUF su Ollama"],
            ["Integrazione frontend locale", "NON ESISTE", "nanobot-local funzionante"],
            ["TTS Kokoro integrato", "NON ESISTE", "nanobot-local funzionante"],
            ["STT (Whisper o Web Speech)", "NON ESISTE", "nanobot-local funzionante"],
            ["Setup script one-click", "NON ESISTE", "Tutto il resto funzionante"],
        ],
        col_widths=[5.5*cm, 3*cm, W - 8.5*cm]
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 2. TRAINING — STATO REALE
    # ══════════════════════════════════════════
    story.append(Paragraph("2. Training del Brain — Stato Reale", styles['SectionTitle']))

    story.append(Paragraph(
        "Il training e' stato avviato la sera del 18/03/2026 su Google Colab con GPU A100 40GB. "
        "Il modello scelto e' <b>Qwen3.5-2B</b> con bf16 LoRA (NON QLoRA). "
        "La cella di training include auto-save su Google Drive e grafico loss in tempo reale.",
        styles['Body']
    ))

    story.append(Paragraph("2.1 Problemi incontrati durante il setup", styles['SubSection']))
    story.append(make_table(
        ["Problema", "Causa", "Soluzione"],
        [
            ["list_supported_models() non esiste",
             "Unsloth 2026.3.7 ha rimosso il metodo",
             "Try/except: prova Qwen3.5, fallback Qwen3-4B"],
            ["Qwen3.5 richiede transformers>=5.2.0",
             "Cell 1 pinnava transformers==4.56.2",
             "Upgrade a transformers 5.3.0, riavvio runtime"],
            ["SFTTrainer: 'messages' not in forward signature",
             "Dataset aveva colonna 'messages' residua",
             "Rimossa colonna dopo il mapping"],
            ["SFTTrainer: 'text' column removed as unused",
             "remove_unused_columns=True di default",
             "Aggiunto remove_unused_columns=False"],
            ["Tokenizer VL interpreta testo come immagine",
             "Qwen3.5 carica processore VL, non tokenizer puro",
             "Estratto text_tok = tokenizer.tokenizer"],
            ["pad_token mancante su text_tok",
             "Pad token settato solo sul processore VL",
             "text_tok.pad_token = text_tok.eos_token"],
        ],
        col_widths=[4.5*cm, 4.5*cm, W - 9*cm]
    ))

    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(
        "<b>Onesta':</b> Ci sono voluti 6 tentativi per far partire il training. "
        "L'incompatibilita' tra Unsloth 2026.3.7, transformers 5.3.0 e trl 0.22.2 "
        "non era documentata. Il notebook originale v7 (11 celle) NON funzionava cosi' com'era — "
        "ha richiesto fix significativi in tempo reale. Senza troubleshooting interattivo, "
        "il training non sarebbe partito.",
        styles['Honest']
    ))

    story.append(Paragraph("2.2 Configurazione finale del training", styles['SubSection']))
    story.append(make_table(
        ["Parametro", "Valore", "Motivazione"],
        [
            ["Modello base", "unsloth/Qwen3.5-2B", "Intelligence Index 16, architettura ibrida GatedDeltaNet+MoE"],
            ["Quantizzazione training", "bf16 LoRA (NON QLoRA)", "Unsloth docs: QLoRA degrada MoE routing su Qwen3.5"],
            ["LoRA rank (r)", "64", "Alto per task di classificazione JSON preciso"],
            ["LoRA alpha", "64", "Rapporto alpha/r = 1 (standard)"],
            ["Batch size", "4 (effective 16)", "Piccolo per convergere su intent rari (vision 2.9%)"],
            ["Epoche", "3", "86K esempi x 3 = consolidamento pattern minoritari"],
            ["Learning rate", "2e-4 + cosine", "bf16 tollera lr piu' alto; cosine decay protegge"],
            ["Warmup", "100 steps", "Stabilizza primi gradient updates"],
            ["Eval", "Ogni 500 steps", "load_best_model_at_end protegge da overfitting"],
            ["Save", "Ogni 500 steps su locale", "Risultato finale copiato su Google Drive"],
            ["Steps totali stimati", "~16,000", "~5,372 steps/epoca x 3 epoche"],
            ["Tempo stimato", "3-4 ore su A100", "VRAM usata: ~4.3 GB su 40 GB disponibili"],
            ["Packing", "OFF", "Necessario per compatibilita' con pre-tokenizzazione"],
        ],
        col_widths=[4*cm, 4*cm, W - 8*cm]
    ))

    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(
        "<b>Onesta':</b> Il packing e' disabilitato per un bug di compatibilita' trl/transformers. "
        "Con packing ON il training sarebbe ~30% piu' veloce. Inoltre, non sappiamo ancora "
        "se Qwen3.5-2B fine-tuned raggiungera' il target del 95% accuracy — e' la prima volta "
        "che questo modello viene usato per un task di routing JSON in italiano. "
        "Il fallback (Qwen3-4B con QLoRA) e' gia' testato e funzionante dalla v6.",
        styles['Honest']
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 3. ARCHITETTURA
    # ══════════════════════════════════════════
    story.append(Paragraph("3. Architettura Multi-Modello", styles['SectionTitle']))

    story.append(Paragraph(
        "Lo stack prevede 5 modelli AI orchestrati da un server FastAPI locale. "
        "Il design e' ottimizzato per M1 8GB con mutua esclusione dei modelli on-demand.",
        styles['Body']
    ))

    story.append(make_table(
        ["#", "Modello", "Ruolo", "RAM", "Persistenza", "Stato"],
        [
            ["1", "Qwen3.5-2B (fine-tuned)", "Brain router: intent + JSON", "1.5 GB", "SEMPRE (-1)", "IN TRAINING"],
            ["2", "Qwen3.5-4B", "Text LLM educativo italiano", "2.5 GB", "On-demand (5 min)", "Disponibile su Ollama"],
            ["3", "Qwen3-VL 4B Thinking", "Vision analisi circuiti", "2.8 GB", "On-demand (1 min)", "Disponibile su Ollama"],
            ["4", "Whisper-Large-V3-Distil-IT", "STT italiano (bambini)", "0.5 GB", "On-demand", "Da installare"],
            ["5", "Kokoro 82M", "TTS voce italiana", "0.2 GB", "SEMPRE", "Da installare"],
        ],
        col_widths=[0.8*cm, 3.5*cm, 3.5*cm, 1.5*cm, 2.8*cm, W - 12.1*cm]
    ))

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("3.1 Budget RAM — Scenari reali", styles['SubSection']))
    story.append(make_table(
        ["Scenario", "Frequenza", "RAM totale", "Margine", "Latenza attesa"],
        [
            ["A: Azione diretta (Brain only)", "~70%", "4.2 GB", "4.0 GB liberi", "100-170ms"],
            ["B: Spiegazione educativa (Brain + Text)", "~25%", "6.7 GB", "1.5 GB liberi", "3-6s (streaming)"],
            ["C: Analisi foto (Brain + Vision)", "~4%", "7.0 GB", "1.2 GB liberi", "5-12s"],
            ["D: Voce input (Brain + Whisper)", "~1%", "4.7 GB", "3.5 GB liberi", "1-2s"],
            ["E: Foto + spiegazione (sequenziale)", "raro", "7.0 GB picco", "1.2 GB min", "12-18s totali"],
        ],
        col_widths=[4.5*cm, 1.8*cm, 2.2*cm, 2.5*cm, W - 11*cm]
    ))

    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(
        "<b>Onesta':</b> I numeri di RAM sono teorici, basati sulle specifiche dei modelli. "
        "Non sono mai stati testati insieme su M1 8GB reale. Lo scenario E (7.0 GB) lascia "
        "solo 1.2 GB per macOS + browser — potrebbe causare swap su M1 con molte tab aperte. "
        "La mutua esclusione Text/Vision dipende da Ollama che scarichi un modello prima di caricare l'altro — "
        "se Ollama non lo fa abbastanza veloce, potremmo avere un picco di RAM temporaneo.",
        styles['Honest']
    ))

    story.append(Paragraph(
        "<b>Punto positivo:</b> Lo scenario A (70% dei messaggi) usa solo 4.2 GB con latenza 100-170ms — "
        "questo e' 5-10x piu' veloce del backend cloud attuale (0.8-2s + cold start Render). "
        "Per la maggior parte delle interazioni, l'esperienza utente sara' drasticamente migliore.",
        styles['Positive']
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 4. DATASET
    # ══════════════════════════════════════════
    story.append(Paragraph("4. Dataset v7 — Analisi", styles['SectionTitle']))

    story.append(make_table(
        ["Metrica", "Valore"],
        [
            ["File", "datasets/galileo-brain-v7.jsonl"],
            ["Esempi totali", "85,966"],
            ["Dimensione", "133 MB"],
            ["Eval set", "196 esempi bilanciati"],
            ["Strati", "11 (replay, action, context, tutor, adversarial, multi-action, implicit, experiments, long-confused, dialect, augmented)"],
            ["Intents", "6: action (32.5%), circuit (24.7%), tutor (24.6%), navigation (11.2%), code (4.1%), vision (2.9%)"],
            ["Formato", "ChatML con JSON 6 campi + system prompt allineato al test"],
            ["Augmentation", "5 dialetti IT, 13 categorie sinonimi verbi, 12 categorie sinonimi nomi, 30+ pattern riformulazione, typo engine"],
        ],
        col_widths=[3.5*cm, W - 3.5*cm]
    ))

    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph("4.1 Distribuzione intent", styles['SubSection']))
    story.append(make_table(
        ["Intent", "Esempi", "Percentuale", "Valutazione"],
        [
            ["action", "27,943", "32.5%", "OK — intent piu' frequente, azioni dirette"],
            ["circuit", "21,268", "24.7%", "OK — montaggio/smontaggio componenti"],
            ["tutor", "21,151", "24.6%", "OK — spiegazioni educative (needs_llm=true)"],
            ["navigation", "9,645", "11.2%", "OK — caricamento esperimenti, manuale"],
            ["code", "3,500", "4.1%", "ATTENZIONE — pochi esempi, rischio confusione con tutor"],
            ["vision", "2,459", "2.9%", "ATTENZIONE — pochissimi, rischio underfit"],
        ],
        col_widths=[2.5*cm, 2*cm, 2*cm, W - 6.5*cm]
    ))

    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(
        "<b>Onesta':</b> La distribuzione e' sbilanciata. 'vision' ha solo 2,459 esempi (2.9%) — "
        "potrebbe non essere sufficiente per un intent routing affidabile. 'code' con 3,500 (4.1%) "
        "e' al limite. In v6, 'code' e 'tutor' venivano a volte confusi. "
        "L'augmentation con dialetti e typos aiuta la robustezza ma non risolve lo sbilanciamento di fondo. "
        "Se il training v7 mostra accuracy bassa su vision/code, potrebbe servire un dataset v8 "
        "con oversampling mirato.",
        styles['Honest']
    ))

    story.append(Paragraph(
        "<b>Punto positivo:</b> Il dataset e' 4.3x piu' grande del v6 (20K -> 86K). "
        "Gli 11 strati di augmentation coprono dialetti regionali, typos, messaggi lunghi e confusi, "
        "e input avversariali. Il system prompt e' identico tra training e test (verificato carattere per carattere).",
        styles['Positive']
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 5. RISCHI E INCOGNITE
    # ══════════════════════════════════════════
    story.append(Paragraph("5. Rischi e Incognite", styles['SectionTitle']))

    story.append(make_table(
        ["Rischio", "Probabilita'", "Impatto", "Mitigazione"],
        [
            ["Training non raggiunge 95% accuracy",
             "MEDIA",
             "ALTO — serve retraining o fallback a Qwen3-4B",
             "load_best_model_at_end; fallback Qwen3-4B gia' testato"],
            ["Qwen3.5-2B GGUF troppo grande per M1 8GB",
             "BASSA",
             "MEDIO — usa piu' RAM del previsto",
             "Alternativa q3_k_m (piu' compresso, meno accurato)"],
            ["Swap RAM su M1 con Vision + macOS",
             "MEDIA",
             "MEDIO — rallentamento 2-5x",
             "Ridurre keep_alive Vision a 30s; chiudere tab browser"],
            ["Incompatibilita' Ollama con GGUF custom",
             "BASSA",
             "ALTO — non si carica il modello",
             "Modelfile testato; Ollama 0.13.5 supporta GGUF standard"],
            ["Kokoro TTS non supporta italiano bene",
             "BASSA",
             "BASSO — voce meno naturale",
             "Fallback: Web Speech API (voce di sistema)"],
            ["Whisper-Distil-IT non riconosce bambini",
             "MEDIA",
             "BASSO — input voce meno accurato",
             "Fallback: Web Speech API (Siri/Google STT)"],
            ["Colab disconnette durante il training notturno",
             "MEDIA",
             "MEDIO — perde progresso",
             "Checkpoint ogni 500 steps; auto-save finale su Drive"],
            ["Latenza Text LLM troppo alta per UX",
             "BASSA",
             "MEDIO — attese lunghe per spiegazioni",
             "Streaming (prime parole in 0.5s); max_tokens limitato"],
        ],
        col_widths=[4*cm, 2.2*cm, 2*cm, W - 8.2*cm]
    ))

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(
        "<b>Rischio non mitigabile:</b> Nessuno dei 5 modelli e' mai stato testato insieme "
        "su M1 8GB reale. L'architettura e' teorica, basata su specifiche dei modelli. "
        "L'unico modo di verificare e' provare — e potrebbe richiedere aggiustamenti "
        "significativi ai parametri keep_alive e alle strategie di caricamento/scaricamento.",
        styles['Honest']
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 6. PIANO FASI
    # ══════════════════════════════════════════
    story.append(Paragraph("6. Piano di Implementazione", styles['SectionTitle']))

    story.append(make_table(
        ["Fase", "Task", "Stato", "Stima", "Dipende da"],
        [
            ["FASE 0", "Training Brain v7 su Colab", "IN CORSO (notte 18/03)", "3-4h", "—"],
            ["FASE 0", "Export GGUF + deploy Ollama", "DA FARE", "30 min", "Training completato"],
            ["FASE 0", "Test locale (>=95% accuracy)", "DA FARE", "1h", "Deploy Ollama"],
            ["FASE 1", "nanobot-local/server.py", "DA FARE", "2-3h", "Brain su Ollama"],
            ["FASE 1", "Test nanobot (health, chat, vision)", "DA FARE", "1h", "server.py"],
            ["FASE 2", "api.js local flag", "DA FARE", "30 min", "nanobot testato"],
            ["FASE 2", "TTS Kokoro integration", "DA FARE", "2h", "nanobot testato"],
            ["FASE 2", "STT Web Speech / Whisper", "DA FARE", "2h", "nanobot testato"],
            ["FASE 3", "Setup script one-click", "DA FARE", "1h", "Tutto funzionante"],
            ["FASE 3", "Documentazione finale", "DA FARE", "1h", "Tutto funzionante"],
        ],
        col_widths=[1.8*cm, 4.5*cm, 3.5*cm, 1.5*cm, W - 11.3*cm]
    ))

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("6.1 Stima tempo totale", styles['SubSection']))
    story.append(Paragraph(
        "<b>Caso ottimistico:</b> 2 giorni (training va bene al primo colpo, tutto si integra senza problemi).<br/>"
        "<b>Caso realistico:</b> 4-5 giorni (serve qualche iterazione, fix di compatibilita', tuning RAM).<br/>"
        "<b>Caso pessimistico:</b> 1-2 settimane (training fallisce, serve dataset v8, problemi RAM M1).",
        styles['Body']
    ))

    story.append(Paragraph(
        "<b>Onesta':</b> Le stime di tempo per le singole task sono ottimistiche. "
        "La FASE 0 da sola (incluso il setup Colab con tutti i fix) ha richiesto gia' ~3 ore "
        "di troubleshooting interattivo prima ancora che il training partisse. "
        "E' ragionevole aspettarsi problemi simili in ogni fase.",
        styles['Honest']
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 7. CONFRONTO CLOUD vs LOCALE
    # ══════════════════════════════════════════
    story.append(Paragraph("7. Confronto Cloud vs Locale — Onesto", styles['SectionTitle']))

    story.append(make_table(
        ["Aspetto", "Cloud (attuale)", "Locale (obiettivo)", "Verdetto"],
        [
            ["Costo", "~15-30 EUR/mese (API + Render)", "0 EUR", "LOCALE vince nettamente"],
            ["Privacy", "Dati transitano su server esterni", "100% locale", "LOCALE vince nettamente"],
            ["Cold start", "5-30s (Render free tier)", "0s (sempre in RAM)", "LOCALE vince nettamente"],
            ["Azioni dirette (70%)", "0.8-2s", "100-170ms", "LOCALE 5-10x piu' veloce"],
            ["Spiegazioni (25%)", "2-5s", "3-6s", "CLOUD leggermente piu' veloce"],
            ["Vision (4%)", "3-8s", "5-12s", "CLOUD piu' veloce"],
            ["Qualita' testo", "GPT/Gemini livello", "Qwen3.5-4B", "CLOUD migliore (modelli piu' grandi)"],
            ["Qualita' vision", "Gemini Pro Vision", "Qwen3-VL 4B", "CLOUD migliore"],
            ["Affidabilita'", "99.9% (dipende da internet)", "100% (offline)", "LOCALE vince (no dipendenze)"],
            ["Manutenzione", "Zero (SaaS)", "Aggiornamenti manuali modelli", "CLOUD piu' facile"],
            ["Scalabilita'", "Multi-utente nativo", "Solo 1 utente (M1)", "CLOUD vince"],
        ],
        col_widths=[3*cm, 3.5*cm, 3.5*cm, W - 10*cm]
    ))

    story.append(Spacer(1, 0.4*cm))
    story.append(Paragraph(
        "<b>Onesta':</b> Lo stack locale NON e' migliore del cloud in tutto. "
        "La qualita' delle risposte testuali (Qwen3.5-4B vs GPT-4o/Gemini Pro) sara' inferiore, "
        "specialmente per spiegazioni scientifiche complesse. La vision locale (Qwen3-VL 4B) "
        "sara' significativamente peggiore di Gemini Pro Vision per analisi dettagliate di circuiti. "
        "I vantaggi reali sono: costo zero, privacy totale, nessun cold start, e latenza azioni "
        "dirette drammaticamente migliore. Per un tutor educativo per bambini 10-14 anni, "
        "questi trade-off sono probabilmente accettabili.",
        styles['Honest']
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # 8. CONCLUSIONI
    # ══════════════════════════════════════════
    story.append(Paragraph("8. Conclusioni", styles['SectionTitle']))

    story.append(Paragraph(
        "Il progetto Galileo Local Stack e' ambizioso: 5 modelli AI su un MacBook M1 8GB, "
        "con fine-tuning custom, orchestrazione FastAPI, e integrazione voce. "
        "La preparazione e' stata meticolosa (dataset 86K, architettura documentata, "
        "budget RAM calcolato), ma la vera verifica avverra' solo con l'integrazione reale.",
        styles['Body']
    ))

    story.append(Paragraph("8.1 Cosa va bene", styles['SubSection']))
    story.append(Paragraph(
        "Il dataset v7 e' solido (85,966 esempi, 11 strati, 6 intent, nessun 'teacher'). "
        "Il notebook Colab e' stato debuggato e funziona su A100 con Qwen3.5-2B bf16 LoRA. "
        "L'architettura e' ben documentata con fonti verificate. "
        "I fallback sono previsti a ogni livello (Qwen3-4B, Web Speech API, q3_k_m). "
        "Ollama 0.13.5 e' gia' installato sul Mac.",
        styles['Positive']
    ))

    story.append(Paragraph("8.2 Cosa e' incerto", styles['SubSection']))
    story.append(Paragraph(
        "Non sappiamo se Qwen3.5-2B raggiungera' 95% accuracy su routing JSON italiano. "
        "Non abbiamo mai testato 5 modelli insieme su M1 8GB reale. "
        "Non sappiamo se Kokoro TTS suona bene in italiano per frasi educative lunghe. "
        "Non sappiamo se la mutua esclusione RAM funzionera' senza swap visibile all'utente. "
        "Le stime di tempo sono ottimistiche basate sull'esperienza con v6 (che era piu' semplice).",
        styles['Warning']
    ))

    story.append(Paragraph("8.3 Prossimo passo critico", styles['SubSection']))
    story.append(Paragraph(
        "Domani mattina (19/03/2026): verificare il risultato del training su Google Drive. "
        "Se la loss finale e' < 0.1 e il GGUF e' stato esportato, scaricare e testare su Ollama. "
        "Se il training e' fallito o Colab si e' disconnesso, ricaricare dall'ultimo checkpoint "
        "salvato e riprendere. Il primo vero gate e': "
        "<b>Brain v7 su Ollama locale con >=95% accuracy sul test completo.</b>",
        styles['Body']
    ))

    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(
        f"Documento generato il {datetime.now().strftime('%d/%m/%Y alle %H:%M')} — "
        "PDR Galileo Local Stack v7 — Andrea Marro",
        styles['SmallGray']
    ))

    # BUILD
    doc.build(story)
    print(f"PDF generato: {output_path}")
    return output_path

if __name__ == "__main__":
    build_pdf()
