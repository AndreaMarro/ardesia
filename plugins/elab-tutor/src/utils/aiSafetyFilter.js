// ============================================
// ELAB Tutor - AI Safety Filter
// Filtro contenuti per output AI UNLIM
// Protezione base per piattaforma educativa minori
// © Andrea Marro — 16/02/2026
// ============================================

// Categorie di contenuto inappropriato per minori
// Queste wordlist sono volutamente ampie: è meglio un falso positivo
// che lasciar passare contenuto inappropriato.
const BLOCKED_PATTERNS = {
    // Contenuti sessuali/violenti
    // NOTA: \b iniziale mantiene word boundary, ma il finale usa \w* per catturare
    // suffissi italiani (pornografia, ammazzare, uccidere, torturare, etc.)
    explicit: [
        /\b(porn|sesso|sessual|nud[oi]|erotic|masturb|orgasm|genitali)\w*/i,
        /\b(droga|cocaina|eroina|marijuana|cannabis|stupefacent)\w*/i,
        /\b(suicid|ammazzar|uccider|tortura|decapita)\w*/i,
    ],

    // Istruzioni pericolose per elettronica
    // NOTA: NON bloccare termini educativi (alta tensione, corrente alternata, ecc.)
    // usati per SPIEGARE la sicurezza. Bloccare solo istruzioni operative pericolose.
    dangerous: [
        /\b(collega(?:re|ti?|lo)?\s+(?:alla?|alla?)\s*(?:rete|presa)\s*(?:elettrica|di\s*casa|220|230)?)\b/i,
        /\b(inserir[eio]\s+(?:nella?|in)\s*(?:presa|rete)\s*(?:elettrica|di\s*casa)?)\b/i,
        /\b(tocca(?:re)?\s+(?:i\s+)?(?:fili|cavi)\s+(?:della?\s+)?(?:rete|corrente|220|230|presa))\b/i,
        /\b(cortocircuit(?:o|a)(?:re)?\s+(?:la|il|una?)?\s*(?:rete|presa|casa|220|230))\b/i,
        /\b(esplosiv|detonat|bomba|incendi(?:o|are))\w*/i,
        /\b(hackerare|craccare|virus|malware|ransomware)\w*/i,
    ],

    // Link/URL sospetti
    suspiciousLinks: [
        /https?:\/\/(?!(?:www\.)?(?:arduino\.cc|wokwi\.com|elab\.school|github\.com|wikipedia\.org|youtube\.com|youtu\.be|notion\.so|netlify\.app))[^\s"'>]+/i,
    ],

    // Prompt injection attempts
    promptInjection: [
        /\b(ignora\s+(?:le|tutte\s+le|ogni)\s+(?:istruzioni|regole|limitazioni))\b/i,
        /\b(ignore\s+(?:all|your|previous|the)\s+(?:instructions|rules|constraints))\b/i,
        /\b(system\s*prompt|jailbreak|DAN\s*mode)\b/i,
        /\b(pretend\s+(?:you\s+are|to\s+be)|fai\s+finta\s+di)\b/i,
    ],
};

// Messaggio di fallback quando il contenuto viene filtrato
const FILTERED_MESSAGES = {
    explicit: 'UNLIM non può rispondere a questa domanda. Sono qui per aiutarti con l\'elettronica e la programmazione Arduino!',
    dangerous: 'Per motivi di sicurezza, non posso fornire istruzioni su questo argomento. Se hai dubbi su un circuito, chiedi aiuto a un adulto esperto.',
    suspiciousLinks: 'Ho rimosso un link esterno dalla risposta. Per la tua sicurezza, uso solo risorse verificate.',
    promptInjection: 'Non posso eseguire questa richiesta. Chiedimi qualcosa sull\'elettronica!',
};

/**
 * Filtra l'output dell'AI per contenuti inappropriati
 * @param {string} text - Testo da filtrare (risposta dell'AI)
 * @returns {{ safe: boolean, filtered: string, reason?: string }}
 */
export function filterAIResponse(text) {
    if (!text || typeof text !== 'string') {
        return { safe: true, filtered: text || '' };
    }

    // Controlla ogni categoria di pattern
    for (const [category, patterns] of Object.entries(BLOCKED_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(text)) {
                // Per link sospetti, rimuoviamo il link ma manteniamo il resto
                if (category === 'suspiciousLinks') {
                    const cleaned = text.replace(pattern, '[link rimosso]');
                    return {
                        safe: false,
                        filtered: cleaned,
                        reason: category
                    };
                }

                // Per altre categorie, sostituiamo l'intera risposta
                return {
                    safe: false,
                    filtered: FILTERED_MESSAGES[category],
                    reason: category
                };
            }
        }
    }

    return { safe: true, filtered: text };
}

/**
 * Filtra l'input dell'utente per prompt injection
 * @param {string} userInput - Input dell'utente da controllare
 * @returns {{ safe: boolean, reason?: string }}
 */
export function checkUserInput(userInput) {
    if (!userInput || typeof userInput !== 'string') {
        return { safe: true };
    }

    for (const pattern of BLOCKED_PATTERNS.promptInjection) {
        if (pattern.test(userInput)) {
            return { safe: false, reason: 'promptInjection' };
        }
    }

    return { safe: true };
}
