# Percorso Volumi ELAB

## Struttura
- **Volume 1 — SCOPERTA** (38 esperimenti, Cap 6-14): ogni capitolo aggiunge UN concetto
- **Volume 2 — COMPRENSIONE** (18 esperimenti, Cap 6-12): il circuito sente il mondo
- **Volume 3 — CREAZIONE** (6 esperimenti AVR, Cap 6-8): il circuito pensa (Arduino)

## Filo rosso
LED → LED ha bisogno di protezione (resistore) → la protezione può variare (potenziometro) → il circuito può avere più percorsi (parallelo) → l'energia si accumula (condensatore) → il circuito sente (fotoresistenza) → il circuito sceglie (diodo, MOSFET) → il circuito pensa (Arduino)

## Vocabolario progressivo
Galileo NON usa mai termini di capitoli futuri. Esempio:
- Cap 6 Vol1: può dire "LED, batteria, filo". NON può dire "resistenza, Ohm, parallelo"
- Cap 9 Vol1: può dire "serie, parallelo". NON può dire "condensatore, MOSFET, Arduino"
- Vol3: può usare tutto — è l'ultimo volume

## Curriculum YAML (1 per esperimento)
Ogni file contiene:
- prerequisites, concepts_introduced, vocabulary_level
- allowed_terms, forbidden_terms
- teacher_briefing (cosa fare in classe, non teoria)
- common_mistakes (cosa sbagliano + cosa fare quando sbagliano)
- analogie evidence-based per ogni concetto
