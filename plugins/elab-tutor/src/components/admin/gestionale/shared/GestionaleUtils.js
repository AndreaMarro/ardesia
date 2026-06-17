// © Andrea Marro — 13 Febbraio 2026 — Tutti i diritti riservati.
// ============================================
// ELAB Gestionale - Utilit\u00E0 Condivise
// Funzioni riutilizzabili per tutti i moduli
// ============================================

// ── Formattazione Valuta ───────────────────────
// Formatta un importo numerico in Euro (it-IT)
// Es: 1234.56 => "€ 1.234,56"
export function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return '€ 0,00';
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// ── Formattazione Data ─────────────────────────
// Formatta una stringa ISO in data italiana
// Es: "2026-01-15" => "15/01/2026"
export function formatDate(iso) {
    if (!iso) return '\u2014';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '\u2014';
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '\u2014';
    }
}

// ── Formattazione Data e Ora ───────────────────
// Es: "2026-01-15T14:30:00" => "15/01/2026, 14:30"
export function formatDateTime(iso) {
    if (!iso) return '\u2014';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '\u2014';
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '\u2014';
    }
}

// ── Export JSON ─────────────────────────────────
// Scarica un array/oggetto come file .json
export function exportToJSON(data, filename = 'export') {
    if (!data) return;
    const safeName = filename.replace(/\.json$/i, '');
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ── Export CSV ──────────────────────────────────
// Scarica un array di oggetti come file .csv
// columns: [{key, label}] per definire intestazioni e chiavi
export function exportToCSV(data, columns, filename = 'export') {
    if (!data || !columns || data.length === 0) return;

    const safeName = filename.replace(/\.csv$/i, '');
    const separator = ';'; // Standard italiano (compatibile con Excel IT)

    // BOM UTF-8 per compatibilit\u00E0 con Excel
    const BOM = '\uFEFF';

    // Intestazioni
    const header = columns.map((col) => escapeCsvField(col.label)).join(separator);

    // Righe dati
    const rows = data.map((row) =>
        columns
            .map((col) => {
                const val = row[col.key];
                if (val == null) return '';
                return escapeCsvField(String(val));
            })
            .join(separator)
    );

    const csvContent = BOM + [header, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Escape campo CSV (gestisce virgolette e separatori)
function escapeCsvField(value) {
    if (value == null) return '';
    const str = String(value);
    // Se contiene separatore, virgolette o newline, wrappa tra virgolette
    if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// ── Calcolo IVA ────────────────────────────────
// Calcola IVA e totale da un subtotale e aliquota
// Es: calcIVA(1000, 22) => { iva: 220, totale: 1220 }
export function calcIVA(subtotale, aliquota = 22) {
    const sub = parseFloat(subtotale) || 0;
    const aliq = parseFloat(aliquota) || 0;
    const iva = Math.round((sub * aliq) / 100 * 100) / 100;
    const totale = Math.round((sub + iva) * 100) / 100;
    return { iva, totale };
}

// ── Generazione Numero Documento ───────────────
// Genera un numero progressivo nel formato: PREFIX-ANNO-NUMERO
// Es: generateNumero('FT', 42) => "FT-2026-042"
export function generateNumero(prefix = 'DOC', counter = 1) {
    const anno = new Date().getFullYear();
    const num = String(counter).padStart(3, '0');
    return `${prefix}-${anno}-${num}`;
}

// ── Giorni Mancanti ────────────────────────────
// Calcola i giorni dalla data odierna a una data futura
// Ritorna un numero negativo se la data \u00E8 passata
export function daysUntil(dateString) {
    if (!dateString) return null;
    try {
        const target = new Date(dateString);
        if (isNaN(target.getTime())) return null;
        const today = new Date();
        // Reset ore per calcolo preciso
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffMs = target.getTime() - today.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
}

// ── Verifica Scadenza ──────────────────────────
// Ritorna true se la data \u00E8 nel passato
export function isOverdue(dateString) {
    if (!dateString) return false;
    const days = daysUntil(dateString);
    return days !== null && days < 0;
}

// ── Troncamento Testo ──────────────────────────
// Tronca una stringa alla lunghezza specificata con "..."
export function truncate(str, len = 50) {
    if (!str) return '';
    if (typeof str !== 'string') str = String(str);
    if (str.length <= len) return str;
    return str.substring(0, len).trimEnd() + '\u2026';
}

// ── Dimensione localStorage ────────────────────
// Calcola lo spazio utilizzato da localStorage in MB
export function getStorageSize() {
    try {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            // Calcola dimensione in byte (UTF-16 = 2 byte per carattere)
            totalSize += (key.length + (value ? value.length : 0)) * 2;
        }
        // Converti in MB con 2 decimali
        return Math.round((totalSize / (1024 * 1024)) * 100) / 100;
    } catch {
        return 0;
    }
}
