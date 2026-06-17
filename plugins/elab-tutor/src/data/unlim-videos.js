/**
 * UNLIM ONNIPOTENTE — Curated YouTube Video Database
 * (c) Andrea Marro — 28/02/2026 — ELAB Tutor — Tutti i diritti riservati
 *
 * Curated collection of Italian educational electronics videos for children.
 * Used by [AZIONE:youtube:query] to find relevant videos before falling back
 * to YouTube search.
 *
 * Each entry maps keywords to a video with metadata.
 * findVideo(query) does fuzzy keyword matching and returns the best match.
 */

const CURATED_VIDEOS = [
    {
        keywords: ['led', 'diodo', 'luminoso', 'luce'],
        videoId: 'pzVA2TBmYJQ',
        title: 'Come funziona un LED',
        channel: 'Elettronica per tutti',
        topic: 'LED e diodi luminosi',
    },
    {
        keywords: ['resistore', 'resistenza', 'ohm', 'codice colori'],
        videoId: '7w5I-KbJ1Sg',
        title: 'Resistori: cosa sono e come funzionano',
        channel: 'Elettronica per tutti',
        topic: 'Resistori e legge di Ohm',
    },
    {
        keywords: ['legge', 'ohm', 'tensione', 'corrente', 'volt', 'ampere'],
        videoId: 'HsLLq6Rm5tU',
        title: 'La Legge di Ohm spiegata semplice',
        channel: 'Scienza e tecnologia',
        topic: 'Legge di Ohm',
    },
    {
        keywords: ['circuito', 'serie', 'parallelo', 'collegamento'],
        videoId: 'x2EuYs_Fid0',
        title: 'Circuiti in serie e parallelo',
        channel: 'Scienza in classe',
        topic: 'Serie vs parallelo',
    },
    {
        keywords: ['breadboard', 'basetta', 'prototipi', 'montaggio'],
        videoId: 'QrYjGmR30pQ',
        title: 'Come usare una breadboard',
        channel: 'Tutorial elettronica',
        topic: 'Breadboard e prototipi',
    },
    {
        keywords: ['condensatore', 'capacita', 'carica', 'scarica', 'farad'],
        videoId: 'X4EUwTwZ110',
        title: 'Il condensatore spiegato ai bambini',
        channel: 'Scienza per ragazzi',
        topic: 'Condensatori',
    },
    {
        keywords: ['transistor', 'bjt', 'mosfet', 'amplificatore', 'interruttore'],
        videoId: '7ukDKVHnac4',
        title: 'Come funziona un transistor',
        channel: 'Elettronica base',
        topic: 'Transistor',
    },
    {
        keywords: ['arduino', 'nano', 'microcontrollore', 'programmazione', 'codice'],
        videoId: 'nL34zDTPkcs',
        title: 'Arduino per principianti',
        channel: 'Arduino Italia',
        topic: 'Introduzione ad Arduino',
    },
    {
        keywords: ['buzzer', 'piezo', 'suono', 'cicalino', 'melodia'],
        videoId: 'Rq2iYJhFbPI',
        title: 'Buzzer piezoelettrico con Arduino',
        channel: 'Tutorial Arduino',
        topic: 'Buzzer e suoni',
    },
    {
        keywords: ['motore', 'dc', 'elettrico', 'rotazione'],
        videoId: 'CWulQ1ZSE3c',
        title: 'Come funziona un motore elettrico',
        channel: 'Scienza animata',
        topic: 'Motori DC',
    },
    {
        keywords: ['servo', 'servomotore', 'angolo', 'posizione'],
        videoId: 'J8atdMRFV9Q',
        title: 'Servomotori con Arduino',
        channel: 'Arduino Italia',
        topic: 'Servomotori',
    },
    {
        keywords: ['fotoresistore', 'ldr', 'sensore', 'luce', 'luminosita'],
        videoId: 'aEDo0SgHEwM',
        title: 'Sensore di luce LDR',
        channel: 'Elettronica facile',
        topic: 'Fotoresistori',
    },
    {
        keywords: ['potenziometro', 'trimmer', 'variabile', 'regolare'],
        videoId: 'kGGpPh7KUIM',
        title: 'Come funziona un potenziometro',
        channel: 'Elettronica base',
        topic: 'Potenziometri',
    },
    {
        keywords: ['pulsante', 'bottone', 'interruttore', 'switch', 'premere'],
        videoId: 'WGaoiHJSTbU',
        title: 'Pulsanti e interruttori con Arduino',
        channel: 'Tutorial Arduino',
        topic: 'Pulsanti',
    },
    {
        keywords: ['lcd', 'display', 'schermo', 'testo', '16x2'],
        videoId: 'd8_xXNcGYyE',
        title: 'Display LCD 16x2 con Arduino',
        channel: 'Arduino Italia',
        topic: 'Display LCD',
    },
    {
        keywords: ['batteria', 'alimentazione', 'voltaggio', 'pila', '9v'],
        videoId: 'PXNKkcB0pI4',
        title: 'Come funzionano le batterie',
        channel: 'Scienza per tutti',
        topic: 'Batterie e alimentazione',
    },
    {
        keywords: ['cortocircuito', 'corto', 'sicurezza', 'pericolo'],
        videoId: 'mONMVFBVPrs',
        title: 'Cos\'è un cortocircuito',
        channel: 'Scienza animata',
        topic: 'Cortocircuiti e sicurezza',
    },
    {
        keywords: ['diodo', 'raddrizzatore', 'polarita', 'anodo', 'catodo'],
        videoId: 'Coy-WRCfems',
        title: 'Il diodo: come funziona',
        channel: 'Elettronica per tutti',
        topic: 'Diodi',
    },
    {
        keywords: ['rgb', 'colore', 'miscela', 'pwm'],
        videoId: 'sA5gqrLilNI',
        title: 'LED RGB e miscelazione colori',
        channel: 'Tutorial Arduino',
        topic: 'LED RGB e PWM',
    },
    {
        keywords: ['multimetro', 'tester', 'misura', 'voltmetro', 'amperometro'],
        videoId: 'bF3OyQ3HwfU',
        title: 'Come usare il multimetro',
        channel: 'Elettronica pratica',
        topic: 'Multimetro',
    },
    {
        keywords: ['elettricita', 'elettrone', 'carica', 'corrente', 'elettrica'],
        videoId: 'mc979OhitAg',
        title: 'Cos\'è l\'elettricità',
        channel: 'Scienza per ragazzi',
        topic: 'Fondamenti di elettricità',
    },
];

/**
 * Find the best matching curated video for a query
 * @param {string} query - Search query
 * @returns {{ videoId: string, title: string, channel: string, topic: string, url: string } | null}
 */
export function findVideo(query) {
    if (!query) return null;
    const words = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/);

    let bestMatch = null;
    let bestScore = 0;

    for (const video of CURATED_VIDEOS) {
        let score = 0;
        for (const word of words) {
            const normalizedWord = word.replace(/[^a-z0-9]/g, '');
            if (normalizedWord.length < 2) continue;
            for (const keyword of video.keywords) {
                const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (normalizedKeyword.includes(normalizedWord) || normalizedWord.includes(normalizedKeyword)) {
                    score += normalizedKeyword === normalizedWord ? 3 : 1; // exact match = 3x
                }
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = video;
        }
    }

    if (!bestMatch || bestScore < 1) return null;
    return {
        ...bestMatch,
        url: `https://www.youtube.com/watch?v=${bestMatch.videoId}`,
    };
}

/**
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
 * Get a YouTube search URL for fallback
 * @param {string} query
 * @returns {string}
 */
export function getYouTubeSearchUrl(query) {
    const safeQuery = encodeURIComponent((query || '').slice(0, 100));
    return `https://www.youtube.com/results?search_query=${safeQuery}+elettronica+bambini+italiano`;
}

export default { findVideo, getYouTubeSearchUrl, CURATED_VIDEOS };
