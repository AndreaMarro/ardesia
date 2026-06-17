# G17 MARATHON — "IL FUMETTO" (Report PDF + Demo End-to-End)

Data: [INSERISCI DATA]. Durata: Sessione lunga. Principio Zero: Il dirigente scolastico riceve un PDF: la mascotte ELAB racconta la lezione. Immagini del circuito, domande dei ragazzi, risposte di UNLIM. Condivisibile, stampabile, archivabile per il PNRR. Questa sessione produce anche la DEMO COMPLETA per Giovanni Fagherazzi.

PREREQUISITI: G12-G16 completate. Sessioni salvate. Mascotte robot. Voce. Messaggi contestuali.

LEGGI OBBLIGATORIAMENTE: 1. CLAUDE.md. 2. automa/STATE.md. 3. Ultimi report verifiche (G16-VERIFICA-FINALE.md). 4. automa/context/UNLIM-VISION-COMPLETE.md sezione "Report Fumetto". 5. automa/PIANO-2-SETTIMANE.md. 6. Questo prompt.

FASE 0: Bootstrap (15 min). Build. Verifica: sessioni salvate funzionano? (apri → chiudi → riapri → contesto). Se sessioni non funzionano → fix prima del report.

FASE 1: Report Fumetto Engine (3-4 ore) ★ CRITICO.

Il report e' una pagina HTML stampabile (CSS @media print) che diventa PDF con "Stampa → Salva PDF". Zero librerie server.

Struttura del report:
1. COPERTINA: Logo ELAB grande + "Lezione: [Titolo]" + data + "Classe [nome se disponibile]"
2. INTRODUZIONE: Mascotte robot dice: "Oggi abbiamo esplorato [concetto]! Ecco cosa e' successo."
3. TIMELINE FUMETTO: Per ogni momento chiave della sessione:
   - Riquadro con mascotte (SVG inline) in postura appropriata (parla/pensa/esulta/indica errore)
   - Fumetto con il messaggio (max 2 righe, troncato se piu' lungo)
   - Se disponibile: miniatura screenshot del circuito in quel momento
   - Se errore: sfondo rosso chiaro, mascotte con occhi sorpresi: "Oops! [errore]"
4. RIEPILOGO: "Cosa abbiamo imparato" — 3-5 punti chiave dal lesson path
5. PROSSIMA LEZIONE: "La prossima volta: [Cap X Esp Y]"
6. FOOTER: "Generato da ELAB Tutor — elabtutor.school — [data]"

Design:
- Palette ELAB: navy intestazioni, lime accenti, bianco sfondo
- Font: Open Sans (gia' caricato), Oswald per titoli
- Mascotte in 4 posture: parla (bocca aperta), pensa (occhi verso l'alto), esulta (braccia alzate), indica (braccio teso)
- Layout: A4 verticale, margini 20mm, max 3-4 pagine

Implementazione:
- Componente `LessonReport.jsx` — riceve sessionData, genera HTML
- Bottone "Crea Report" nella toolbar (o via UNLIM: "crea il report")
- Click → apre nuova finestra con LessonReport → auto-trigger window.print()
- Dati dalla sessione salvata in localStorage (FASE 1 G16)
- Se sessione vuota/corta: "Sessione troppo breve per un report. Fai almeno un esperimento!"

Plugin: /frontend-design per layout stampa, /pdf per best practice CSS print.

FASE 2: Demo End-to-End per Giovanni (2 ore).

Questa e' la simulazione dell'intera esperienza. Documenta con screenshot OGNI passo.

1. Apri elab-builder.vercel.app/#prova → vedi breadboard pulita, 3 bottoni, mascotte robot, barra input ✅/❌
2. UNLIM saluta: "Ciao! Primo esperimento?" (o "Bentornati!" se c'e' storia) ✅/❌
3. Parla: "Monta il circuito del LED" → UNLIM esegue → circuito montato ✅/❌
4. Messaggio contestuale accanto al LED: "Questo e' un LED — un diodo che emette luce!" ✅/❌
5. Passo Passo → step guidati con highlight ✅/❌
6. Play → LED si accende → messaggio: "Funziona! Il LED e' acceso." ✅/❌
7. Parla: "Cos'e' un resistore?" → UNLIM risponde a voce ✅/❌
8. Docente scrive "ANODO = +" sulla breadboard ✅/❌
9. "Crea il report" → PDF fumetto generato ✅/❌
10. Apri Teacher Dashboard → dati reali → Export JSON PNRR ✅/❌

Se un passo FALLISCE → FIX IMMEDIATO. Non rimandare. Documenta il fix.

FASE 3: Video/Screenshot Demo Pack (1 ora). Crea una serie di screenshot che raccontano la demo: 1. Landing page. 2. Simulatore pulito. 3. Circuito montato. 4. Messaggio contestuale. 5. Report PDF. 6. Teacher Dashboard. Salvali in public/assets/demo/ — utilizzabili per presentazione a Giovanni e per il sito.

FASE 4: CoV + Verifica (1-2 ore). Layer 1: Build. Layer 2: Report PDF si genera? E' leggibile? Professionale? Layer 3: Demo 10/10 passi funzionano? Layer 4: 3 agenti CoV. Scrivi: automa/reports/G17-VERIFICA-FINALE.md. Includi: screenshot di ogni passo della demo.

TARGET: Report PDF fumetto funzionante (★★★). Demo 10/10 passi (★★★). Screenshot pack per Giovanni (★★). Score Business 3.5 → 5.5 (★★★). Se Giovanni vede questa demo e dice "wow" — successo.
