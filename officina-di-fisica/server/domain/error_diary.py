"""Observable evidence after a wrong answer. Inputs are ordered by time and ledger sequence."""

DAY = 86400
TRANSFER_INTERVAL = 3 * DAY

CATEGORIES = {
    "concetto": "Concetto fisico",
    "modello": "Procedimento e scelta del modello",
    "algebra": "Passaggio algebrico",
    "calcolo": "Calcolo numerico",
    "unità": "Dimensioni e unità",
    "testo": "Interpretazione della consegna",
}


def follow_up(error, skill_history):
    """Only a later, unaided answer in a different family constitutes a transfer observation."""
    transfer = delayed = None
    assisted = 0
    for attempt in skill_history:
        if (attempt["stamp"], attempt["seq"]) <= (error["stamp"], error["seq"]):
            continue
        if attempt["aided"]:
            assisted += 1
        elif attempt["correct"] and attempt["family"] != error["family"]:
            if transfer is None:
                transfer = attempt
            elif (delayed is None and attempt["family"] != transfer["family"]
                  and attempt["stamp"] >= transfer["stamp"] + TRANSFER_INTERVAL):
                delayed = attempt
    due = transfer["stamp"] + TRANSFER_INTERVAL if transfer else error["stamp"] + DAY
    reviewed = next((a["stamp"] for a in skill_history if a["stamp"] >= due and a["correct"]), None)
    return {"assistedAfter": assisted, "transferAt": transfer["stamp"] if transfer else None,
            "reviewedAt": reviewed, "delayedAt": delayed["stamp"] if delayed else None, "due": due}


def choose_retest(original, questions, seen_ids, tried_families):
    # Prefer fresh material, then a new family and an adjacent level of difficulty.
    candidates = (q for q in questions if not q.get("exam") and q["family"] != original["family"]
                  and q["id"] != original["id"])
    level = original.get("difficulty", 1)
    return min(candidates, key=lambda q: (q["id"] in seen_ids, q["family"] in tried_families,
                                         abs(q.get("difficulty", 1) - level), q.get("order", 0), q["id"]),
               default=None)


def recommendation(observed, repetitions, weak_prerequisite, minutes, now, assisted=False):
    if observed["delayedAt"] is not None:
        return {"step": "representation", "reason": "Hai risolto anche un'altra famiglia a distanza di giorni. Confronta il risultato con una rappresentazione."}
    if observed["reviewedAt"] is not None:
        return {"step": "representation", "reason": "Hai ripreso la competenza a distanza. Usa il modello per spiegare che cosa cambierebbe modificando un dato."}
    if observed["transferAt"] is not None:
        if now >= observed["due"]:
            return {"step": "retry", "reason": "È arrivato il giorno del richiamo. Prova a ricostruire il procedimento senza aprire gli aiuti."}
        return {"step": "review", "reason": "Hai già risposto da solo su una famiglia diversa. Il diario conserva la data per un nuovo richiamo."}
    if weak_prerequisite:
        return {"step": "prerequisite", "reason": "Anche il prerequisito ha più errori autonomi. Riparti da quella spiegazione."}
    if repetitions > 1:
        return {"step": "representation", "reason": "Il passaggio è ricomparso in questa competenza. Confronta una previsione con il laboratorio."}
    if assisted or observed["assistedAfter"]:
        if minutes == 5:
            return {"step": "explanation", "reason": "Hai già usato un supporto. Rileggi la spiegazione, poi coprila e ricostruisci a voce il primo passaggio."}
        return {"step": "retry", "reason": "Hai già usato un supporto. Nel nuovo problema prova il primo passaggio da solo. Puoi sempre riaprire gli aiuti."}
    if now >= observed["due"]:
        return {"step": "retry", "reason": "È passato almeno un giorno dall’errore. Prova un altro quesito per richiamare il procedimento."}
    if minutes == 5:
        return {"step": "explanation", "reason": "Per la sessione breve, ricostruisci il passaggio indicato e scegli quando provare il nuovo caso."}
    return {"step": "retry", "reason": "Hai scelto 15 minuti. Applica lo stesso principio a un problema diverso."}
