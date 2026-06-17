// ============================================
// ELAB Gestionale - Servizio ERP via Notion
// Tutte le operazioni CRUD passano per il backend → Notion
// © Andrea Marro — 08/02/2026
// ============================================

import {
    fattureService as _fattureNotion,
    contiService as _contiNotion,
    dipendentiService as _dipendentiNotion,
    magazzinoService as _magazzinoNotion,
    documentiService as _documentiNotion,
    campagneService as _campagneNotion,
    ordiniService as _ordiniNotion,
    utentiService as _utentiNotion,
} from '../../../services/notionService';
import logger from '../../../utils/logger';

// ============================================
// HELPER: Wrappa le chiamate Notion con error handling
// ============================================
async function safeCall(fn, fallback = null) {
    try {
        return await fn();
    } catch (error) {
        logger.error('[GestionaleService]', error.message);
        if (fallback !== null) return fallback;
        throw error;
    }
}

// ============================================
// FATTURE SERVICE
// ============================================
const fattureService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _fattureNotion.getAll(filters), { items: [] });
        let fatture = result.items || [];
        // Client-side filtering for complex filters
        if (filters.stato) fatture = fatture.filter(f => f.stato === filters.stato);
        if (filters.clienteId) fatture = fatture.filter(f => f.clienteId === filters.clienteId);
        if (filters.tipo) fatture = fatture.filter(f => f.tipo === filters.tipo);
        fatture.sort((a, b) => new Date(b.dataEmissione || b.dataCreazione || 0) - new Date(a.dataEmissione || a.dataCreazione || 0));
        return fatture;
    },

    async getById(id) {
        return safeCall(() => _fattureNotion.getById(id), null);
    },

    async create(data) {
        const nuova = {
            numero: data.numero || `FT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
            tipo: data.tipo || 'vendita',
            clienteId: data.clienteId || '',
            clienteNome: data.clienteNome || '',
            dataEmissione: data.dataEmissione || new Date().toISOString(),
            dataScadenza: data.dataScadenza || '',
            stato: 'bozza',
            righe: JSON.stringify(data.righe || []),
            imponibile: data.imponibile || 0,
            iva: data.iva || 0,
            totale: data.totale || 0,
            aliquotaIva: data.aliquotaIva ?? 22,
            note: data.note || '',
            metodoPagamento: data.metodoPagamento || '',
        };
        return safeCall(() => _fattureNotion.create(nuova));
    },

    async update(id, data) {
        delete data.id;
        if (data.righe && typeof data.righe !== 'string') {
            data.righe = JSON.stringify(data.righe);
        }
        data.dataModifica = new Date().toISOString();
        return safeCall(() => _fattureNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _fattureNotion.delete(id));
    },

    async changeStato(id, newStato) {
        const updates = { stato: newStato, dataModifica: new Date().toISOString() };
        if (newStato === 'pagata') updates.dataPagamento = new Date().toISOString();
        return safeCall(() => _fattureNotion.update(id, updates));
    },

    async getStats() {
        const fatture = await this.getAll();
        const oggi = new Date().toISOString().slice(0, 10);
        const meseCorrente = oggi.slice(0, 7);
        const nonPagate = fatture.filter(f => ['emessa', 'inviata', 'scaduta'].includes(f.stato));
        const fattureMese = fatture.filter(f => f.dataEmissione && f.dataEmissione.slice(0, 7) === meseCorrente);
        return {
            totale: fatture.length,
            perStato: {
                bozza: fatture.filter(f => f.stato === 'bozza').length,
                emessa: fatture.filter(f => f.stato === 'emessa').length,
                inviata: fatture.filter(f => f.stato === 'inviata').length,
                pagata: fatture.filter(f => f.stato === 'pagata').length,
                scaduta: fatture.filter(f => f.stato === 'scaduta').length,
                annullata: fatture.filter(f => f.stato === 'annullata').length,
            },
            importoNonPagato: nonPagate.reduce((s, f) => s + (f.totale || 0), 0),
            fatturatoMese: fattureMese.filter(f => f.stato === 'pagata').reduce((s, f) => s + (f.totale || 0), 0),
            fatturatoPagato: fatture.filter(f => f.stato === 'pagata').reduce((s, f) => s + (f.totale || 0), 0),
        };
    },
};

// ============================================
// ORDINI SERVICE (Gestionale - ordini interni)
// ============================================
const ordiniService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _ordiniNotion.getAll(filters), { items: [] });
        let ordini = result.items || [];
        if (filters.stato) ordini = ordini.filter(o => o.stato === filters.stato);
        if (filters.tipo) ordini = ordini.filter(o => o.tipo === filters.tipo);
        ordini.sort((a, b) => new Date(b.dataOrdine || b.dataCreazione || 0) - new Date(a.dataOrdine || a.dataCreazione || 0));
        return ordini;
    },

    async getById(id) {
        return safeCall(() => _ordiniNotion.getById(id), null);
    },

    async create(data) {
        const nuovo = {
            numero: data.numero || `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
            tipo: data.tipo || 'vendita',
            clienteId: data.clienteId || '',
            clienteNome: data.clienteNome || '',
            fornitoreId: data.fornitoreId || '',
            fornitoreNome: data.fornitoreNome || '',
            dataOrdine: data.dataOrdine || new Date().toISOString(),
            dataConsegna: data.dataConsegna || '',
            stato: data.stato || 'nuovo',
            righe: JSON.stringify(data.righe || []),
            imponibile: data.imponibile || 0,
            iva: data.iva || 0,
            totale: data.totale || 0,
            note: data.note || '',
            priorita: data.priorita || 'normale',
        };
        return safeCall(() => _ordiniNotion.create(nuovo));
    },

    async update(id, data) {
        delete data.id;
        if (data.righe && typeof data.righe !== 'string') {
            data.righe = JSON.stringify(data.righe);
        }
        data.dataModifica = new Date().toISOString();
        return safeCall(() => _ordiniNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _ordiniNotion.delete(id));
    },

    async changeStato(id, newStato) {
        return safeCall(() => _ordiniNotion.update(id, { stato: newStato, dataModifica: new Date().toISOString() }));
    },

    async getStats() {
        const ordini = await this.getAll();
        return {
            totale: ordini.length,
            perStato: {
                nuovo: ordini.filter(o => o.stato === 'nuovo').length,
                confermato: ordini.filter(o => o.stato === 'confermato').length,
                in_lavorazione: ordini.filter(o => o.stato === 'in_lavorazione').length,
                spedito: ordini.filter(o => o.stato === 'spedito').length,
                consegnato: ordini.filter(o => o.stato === 'consegnato').length,
                annullato: ordini.filter(o => o.stato === 'annullato').length,
            },
            importoTotale: ordini.reduce((s, o) => s + (o.totale || 0), 0),
        };
    },
};

// ============================================
// CLIENTI SERVICE (uses utenti Notion DB for now)
// ============================================
const clientiService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _utentiNotion.getAll({ ...filters, tipo: 'cliente' }), { items: [] });
        let clienti = result.items || [];
        if (filters.search) {
            const q = filters.search.toLowerCase();
            clienti = clienti.filter(c =>
                (c.nome || '').toLowerCase().includes(q) ||
                (c.email || '').toLowerCase().includes(q)
            );
        }
        return clienti;
    },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati

    async getById(id) {
        return safeCall(() => _utentiNotion.getById(id), null);
    },

    async create(data) {
        return safeCall(() => _utentiNotion.create({ ...data, tipo: 'cliente' }));
    },

    async update(id, data) {
        return safeCall(() => _utentiNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _utentiNotion.delete(id));
    },
};

// ============================================
// FORNITORI SERVICE (uses utenti Notion DB)
// ============================================
const fornitoriService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _utentiNotion.getAll({ ...filters, tipo: 'fornitore' }), { items: [] });
        let fornitori = result.items || [];
        if (filters.search) {
            const q = filters.search.toLowerCase();
            fornitori = fornitori.filter(f =>
                (f.nome || '').toLowerCase().includes(q) ||
                (f.ragioneSociale || '').toLowerCase().includes(q)
            );
        }
        return fornitori;
    },

    async getById(id) {
        return safeCall(() => _utentiNotion.getById(id), null);
    },

    async create(data) {
        return safeCall(() => _utentiNotion.create({ ...data, tipo: 'fornitore' }));
    },

    async update(id, data) {
        return safeCall(() => _utentiNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _utentiNotion.delete(id));
    },
};

// ============================================
// PRODOTTI SERVICE
// ============================================
const prodottiService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _magazzinoNotion.getAll({ ...filters, entity_type: 'prodotto' }), { items: [] });
        let prodotti = result.items || [];
        if (filters.categoria) prodotti = prodotti.filter(p => p.categoria === filters.categoria);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            prodotti = prodotti.filter(p =>
                (p.nome || '').toLowerCase().includes(q) ||
                (p.codice || '').toLowerCase().includes(q)
            );
        }
        return prodotti;
    },

    async getById(id) {
        return safeCall(() => _magazzinoNotion.getById(id), null);
    },

    async create(data) {
        return safeCall(() => _magazzinoNotion.create({
            ...data,
            entity_type: 'prodotto',
            codice: data.codice || `PRD-${String(Date.now()).slice(-5)}`,
        }));
    },

    async update(id, data) {
        return safeCall(() => _magazzinoNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _magazzinoNotion.delete(id));
    },

    async getStats() {
        const prodotti = await this.getAll();
        return {
            totale: prodotti.length,
            attivi: prodotti.filter(p => p.attivo !== false).length,
            valoreGiacenza: prodotti.reduce((s, p) => s + ((p.giacenza || 0) * (p.prezzoAcquisto || 0)), 0),
        };
    },
};

// ============================================
// MAGAZZINO SERVICE (movimenti di magazzino)
// ============================================
const magazzinoService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _magazzinoNotion.getAll({ ...filters, entity_type: 'movimento' }), { items: [] });
        let movimenti = result.items || [];
        if (filters.tipo) movimenti = movimenti.filter(m => m.tipo === filters.tipo);
        if (filters.prodottoId) movimenti = movimenti.filter(m => m.prodottoId === filters.prodottoId);
        movimenti.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
        return movimenti;
    },

    async getById(id) {
        return safeCall(() => _magazzinoNotion.getById(id), null);
    },

    async create(data) {
        return safeCall(() => _magazzinoNotion.create({ ...data, entity_type: 'movimento' }));
    },

    async update(id, data) {
        return safeCall(() => _magazzinoNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _magazzinoNotion.delete(id));
    },

    async getStats() {
        const prodotti = await prodottiService.getAll();
        const lowStock = prodotti.filter(p => (p.giacenza || 0) <= (p.scorta_minima || 0) && p.attivo !== false);
        return {
            totaleProdotti: prodotti.length,
            valoreGiacenza: prodotti.reduce((s, p) => s + ((p.giacenza || 0) * (p.prezzoAcquisto || 0)), 0),
            sottoscortaCount: lowStock.length,
            sottoscortaProdotti: lowStock,
        };
    },
};

// ============================================
// DIPENDENTI SERVICE
// ============================================
const dipendentiService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _dipendentiNotion.getAll(filters), { items: [] });
        let dipendenti = result.items || [];
        if (filters.reparto) dipendenti = dipendenti.filter(d => d.reparto === filters.reparto);
        if (filters.stato) dipendenti = dipendenti.filter(d => d.stato === filters.stato);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            dipendenti = dipendenti.filter(d =>
                (d.nome || '').toLowerCase().includes(q) ||
                (d.cognome || '').toLowerCase().includes(q) ||
                (d.email || '').toLowerCase().includes(q)
            );
        }
        return dipendenti;
    },

    async getById(id) {
        return safeCall(() => _dipendentiNotion.getById(id), null);
    },

    async create(data) {
        return safeCall(() => _dipendentiNotion.create({
            ...data,
            matricola: data.matricola || `DIP-${String(Date.now()).slice(-4)}`,
            dataAssunzione: data.dataAssunzione || new Date().toISOString(),
            stato: data.stato || 'attivo',
        }));
    },

    async update(id, data) {
        return safeCall(() => _dipendentiNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _dipendentiNotion.delete(id));
    },

    async getStats() {
        const dip = await this.getAll();
        return {
            totale: dip.length,
            attivi: dip.filter(d => d.stato === 'attivo').length,
            reparti: [...new Set(dip.map(d => d.reparto).filter(Boolean))],
            costoMensile: dip.filter(d => d.stato === 'attivo').reduce((s, d) => s + ((d.ral || 0) / 12), 0),
        };
    },
};

// ============================================
// BUSTE PAGA SERVICE (within dipendenti DB)
// ============================================
const bustePagaService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _dipendentiNotion.getAll({ ...filters, entity_type: 'busta_paga' }), { items: [] });
        let buste = result.items || [];
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        if (filters.dipendenteId) buste = buste.filter(b => b.dipendenteId === filters.dipendenteId);
        if (filters.mese) buste = buste.filter(b => b.mese === filters.mese);
        buste.sort((a, b) => new Date(b.mese || 0) - new Date(a.mese || 0));
        return buste;
    },

    async getByDipendente(dipendenteId) {
        return this.getAll({ dipendenteId });
    },

    async create(data) {
        return safeCall(() => _dipendentiNotion.create({
            ...data,
            entity_type: 'busta_paga',
        }));
    },

    async update(id, data) {
        return safeCall(() => _dipendentiNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _dipendentiNotion.delete(id));
    },
};

// ============================================
// FINANCE SERVICE (Conti + Movimenti)
// ============================================
const financeService = {
    async getConti() {
        const result = await safeCall(() => _contiNotion.getAll({ entity_type: 'conto' }), { items: [] });
        return (result.items || []).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    },

    async createConto(data) {
        return safeCall(() => _contiNotion.create({
            ...data,
            entity_type: 'conto',
            attivo: true,
            saldo: data.saldo || 0,
        }));
    },

    async updateConto(id, data) {
        return safeCall(() => _contiNotion.update(id, data));
    },

    async deleteConto(id) {
        // Check for linked movements first
        const movimenti = await this.getMovimenti({ contoId: id });
        if (movimenti.length > 0) {
            return { success: false, error: `Impossibile eliminare: ${movimenti.length} movimenti collegati` };
        }
        return safeCall(() => _contiNotion.delete(id));
    },

    async getMovimenti(filters = {}) {
        const result = await safeCall(() => _contiNotion.getAll({ ...filters, entity_type: 'movimento' }), { items: [] });
        let movimenti = result.items || [];
        if (filters.contoId) movimenti = movimenti.filter(m => m.contoId === filters.contoId);
        if (filters.tipo) movimenti = movimenti.filter(m => m.tipo === filters.tipo);
        if (filters.categoria) movimenti = movimenti.filter(m => m.categoria === filters.categoria);
        movimenti.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
        return movimenti;
    },

    async addMovimento(data) {
        if (!data.contoId) return { success: false, error: 'Conto obbligatorio' };
        const nuovo = {
            ...data,
            entity_type: 'movimento',
            data: data.data || new Date().toISOString(),
        };
        const result = await safeCall(() => _contiNotion.create(nuovo));
        return { success: true, movimento: result };
    },

    async deleteMovimento(id) {
        return safeCall(() => _contiNotion.delete(id));
    },

    async getStats(dateRange = {}) {
        const movimenti = await this.getMovimenti(dateRange);
        const conti = await this.getConti();

        const entrate = movimenti.filter(m => m.tipo === 'entrata');
        const uscite = movimenti.filter(m => m.tipo === 'uscita');

        return {
            totaleEntrate: entrate.reduce((s, m) => s + (m.importo || 0), 0),
            totaleUscite: uscite.reduce((s, m) => s + (m.importo || 0), 0),
            saldoTotale: conti.reduce((s, c) => s + (c.saldo || 0), 0),
            numMovimenti: movimenti.length,
            perCategoria: movimenti.reduce((acc, m) => {
                const cat = m.categoria || 'Altro';
                if (!acc[cat]) acc[cat] = { entrate: 0, uscite: 0 };
                if (m.tipo === 'entrata') acc[cat].entrate += m.importo || 0;
                else acc[cat].uscite += m.importo || 0;
                return acc;
            }, {}),
        };
    },

    async getCashFlow(mesi = 6) {
        const movimenti = await this.getMovimenti();
        const risultato = [];
        const oggi = new Date();
        for (let i = mesi - 1; i >= 0; i--) {
            const d = new Date(oggi.getFullYear(), oggi.getMonth() - i, 1);
            const chiave = d.toISOString().slice(0, 7);
            const mese = movimenti.filter(m => m.data && m.data.slice(0, 7) === chiave);
            risultato.push({
                mese: chiave,
                entrate: mese.filter(m => m.tipo === 'entrata').reduce((s, m) => s + (m.importo || 0), 0),
                uscite: mese.filter(m => m.tipo === 'uscita').reduce((s, m) => s + (m.importo || 0), 0),
            });
        }
        return risultato;
    },
};

// ============================================
// DOCUMENTI SERVICE
// ============================================
const documentiService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _documentiNotion.getAll({ ...filters, entity_type: 'documento' }), { items: [] });
        let documenti = result.items || [];
        if (filters.tipo) documenti = documenti.filter(d => d.tipo === filters.tipo);
        if (filters.categoria) documenti = documenti.filter(d => d.categoria === filters.categoria);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            documenti = documenti.filter(d =>
                (d.titolo || '').toLowerCase().includes(q) ||
                (d.descrizione || '').toLowerCase().includes(q)
            );
        }
        documenti.sort((a, b) => new Date(b.dataCreazione || 0) - new Date(a.dataCreazione || 0));
        return documenti;
    },

    async getById(id) {
        return safeCall(() => _documentiNotion.getById(id), null);
    },

    async create(data) {
        return safeCall(() => _documentiNotion.create({ ...data, entity_type: 'documento' }));
    },

    async update(id, data) {
        return safeCall(() => _documentiNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _documentiNotion.delete(id));
    },

    // Scadenze sub-entity
    async getScadenze(filters = {}) {
        const result = await safeCall(() => _documentiNotion.getAll({ ...filters, entity_type: 'scadenza' }), { items: [] });
        let scadenze = result.items || [];
        if (filters.stato) scadenze = scadenze.filter(s => s.stato === filters.stato);
        scadenze.sort((a, b) => new Date(a.dataScadenza || 0) - new Date(b.dataScadenza || 0));
        return scadenze;
    },

    async createScadenza(data) {
        return safeCall(() => _documentiNotion.create({ ...data, entity_type: 'scadenza' }));
    },

    async updateScadenza(id, data) {
        return safeCall(() => _documentiNotion.update(id, data));
    },

    async deleteScadenza(id) {
        return safeCall(() => _documentiNotion.delete(id));
    },

    async getScadenzeImminenti(giorni = 30) {
        const scadenze = await this.getScadenze();
        const limite = new Date();
        limite.setDate(limite.getDate() + giorni);
        return scadenze.filter(s =>
            s.stato !== 'completata' &&
            new Date(s.dataScadenza) <= limite
        );
    },
};

// ============================================
// CAMPAGNE MARKETING SERVICE
// ============================================
const campagneService = {
    async getAll(filters = {}) {
        const result = await safeCall(() => _campagneNotion.getAll(filters), { items: [] });
        let campagne = result.items || [];
        if (filters.stato) campagne = campagne.filter(c => c.stato === filters.stato);
        if (filters.canale) campagne = campagne.filter(c => c.canale === filters.canale);
        campagne.sort((a, b) => new Date(b.dataInizio || b.dataCreazione || 0) - new Date(a.dataInizio || a.dataCreazione || 0));
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        return campagne;
    },

    async getById(id) {
        return safeCall(() => _campagneNotion.getById(id), null);
    },

    async create(data) {
        return safeCall(() => _campagneNotion.create({
            ...data,
            stato: data.stato || 'bozza',
        }));
    },

    async update(id, data) {
        return safeCall(() => _campagneNotion.update(id, data));
    },

    async delete(id) {
        return safeCall(() => _campagneNotion.delete(id));
    },

    async getStats() {
        const campagne = await this.getAll();
        return {
            totale: campagne.length,
            attive: campagne.filter(c => c.stato === 'attiva').length,
            budgetTotale: campagne.reduce((s, c) => s + (c.budget || 0), 0),
            budgetSpeso: campagne.reduce((s, c) => s + (c.speso || 0), 0),
        };
    },
};

// ============================================
// ADMIN GESTIONALE (impostazioni, export, log)
// ============================================
const gestionaleAdmin = {
    async exportAll() {
        const results = {};
        const services = { fattureService, ordiniService, prodottiService, dipendentiService, documentiService, campagneService };
        for (const [name, svc] of Object.entries(services)) {
            try {
                results[name] = await svc.getAll();
            } catch {
                results[name] = [];
            }
        }
        try {
            results.conti = await financeService.getConti();
            results.movimenti = await financeService.getMovimenti();
        } catch {
            results.conti = [];
            results.movimenti = [];
        }
        return JSON.stringify(results, null, 2);
    },

    async importAll(jsonString) {
        try {
            const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
            const report = { imported: {}, errors: [] };

            const serviceMap = {
                fattureService: fattureService,
                ordiniService: ordiniService,
                prodottiService: prodottiService,
                dipendentiService: dipendentiService,
                documentiService: documentiService,
                campagneService: campagneService,
            };

            for (const [key, service] of Object.entries(serviceMap)) {
                if (data[key] && Array.isArray(data[key])) {
                    let count = 0;
                    for (const item of data[key]) {
                        try {
                            const cleanItem = { ...item };
                            delete cleanItem.id; // Remove ID to create new records
                            await service.create(cleanItem);
                            count++;
                        } catch (err) {
                            report.errors.push(`${key}: ${err.message || 'errore'}`);
                        }
                    }
                    report.imported[key] = count;
                }
            }

            // Import conti (finanze)
            if (data.conti && Array.isArray(data.conti)) {
                let count = 0;
                for (const item of data.conti) {
                    try {
                        const cleanItem = { ...item };
                        delete cleanItem.id;
                        await financeService.createConto(cleanItem);
                        count++;
                    } catch (err) {
                        report.errors.push(`conti: ${err.message || 'errore'}`);
                    }
                }
                report.imported.conti = count;
            }

            // Import movimenti (finanze)
            if (data.movimenti && Array.isArray(data.movimenti)) {
                let count = 0;
                for (const item of data.movimenti) {
                    try {
                        const cleanItem = { ...item };
                        delete cleanItem.id;
                        await financeService.addMovimento(cleanItem);
                        count++;
                    } catch (err) {
                        report.errors.push(`movimenti: ${err.message || 'errore'}`);
                    }
                }
                report.imported.movimenti = count;
            }

            // Import impostazioni if present
            if (data.impostazioni) {
                this.updateImpostazioni(data.impostazioni);
                report.imported.impostazioni = 1;
            }

            return {
                success: true,
                message: `Import completato: ${Object.entries(report.imported).map(([k, v]) => `${v} ${k.replace('Service', '')}`).join(', ')}`,
                report
            };
        } catch (err) {
            return { success: false, error: 'Errore parsing JSON: ' + (err.message || 'file non valido') };
        }
    },

    async resetAll() {
        try {
            const services = {
                fatture: fattureService,
                ordini: ordiniService,
                prodotti: prodottiService,
                dipendenti: dipendentiService,
                documenti: documentiService,
                campagne: campagneService,
            };

            const report = {};

            for (const [name, service] of Object.entries(services)) {
                try {
                    const items = await service.getAll();
                    let deleted = 0;
                    for (const item of items) {
                        try {
                            await service.delete(item.id);
                            deleted++;
                        } catch { /* skip */ }
                    }
                    report[name] = deleted;
                } catch {
                    report[name] = 0;
                }
            }

            // Clear local storage gestionale data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('elab_gest')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // Clear log
            localStorage.setItem('elab_gest_log', JSON.stringify([]));

            return {
                success: true,
                message: `Reset completato: ${Object.entries(report).map(([k, v]) => `${v} ${k}`).join(', ')} eliminati`,
                report
            };
        } catch (err) {
            return { success: false, error: 'Errore durante il reset: ' + (err.message || '') };
        }
    },

    async getImpostazioni() {
        // Impostazioni salvate localmente (non necessitano Notion)
        try {
            const data = localStorage.getItem('elab_gest_impostazioni');
            return data ? JSON.parse(data) : {
                ragioneSociale: 'ELAB STEM S.r.l.',
                partitaIva: '', codiceFiscale: '', indirizzo: '',
                citta: '', cap: '', provincia: '', telefono: '',
                email: '', pec: '', iban: '', valuta: 'EUR',
                aliquotaIvaDefault: 22,
            };
        } catch {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
            return { ragioneSociale: 'ELAB STEM S.r.l.', valuta: 'EUR', aliquotaIvaDefault: 22 };
        }
    },

    async updateImpostazioni(data) {
        const current = await this.getImpostazioni();
        const updated = { ...current, ...data };
        localStorage.setItem('elab_gest_impostazioni', JSON.stringify(updated));
        return updated;
    },

    async getStats() {
        const [fatStats, ordStats, magStats, dipStats, campStats] = await Promise.all([
            fattureService.getStats().catch(() => ({ totale: 0, fatturatoPagato: 0 })),
            ordiniService.getStats().catch(() => ({ totale: 0 })),
            magazzinoService.getStats().catch(() => ({ totaleProdotti: 0 })),
            dipendentiService.getStats().catch(() => ({ totale: 0 })),
            campagneService.getStats().catch(() => ({ totale: 0 })),
        ]);
        return {
            fatture: fatStats,
            ordini: ordStats,
            magazzino: magStats,
            dipendenti: dipStats,
            campagne: campStats,
        };
    },

    getLog() {
        try {
            return JSON.parse(localStorage.getItem('elab_gest_log') || '[]');
        } catch { return []; }
    },

    addLog(action, details) {
        try {
            const log = this.getLog();
            log.unshift({
                id: Date.now().toString(36),
                action,
                details,
                timestamp: new Date().toISOString(),
            });
            localStorage.setItem('elab_gest_log', JSON.stringify(log.slice(0, 500)));
        } catch { /* silent */ }
    },
};

// ============================================
// Backward compatibility
// ============================================
const GEST_KEYS = {
    impostazioni: 'elab_gest_impostazioni',
    log: 'elab_gest_log',
};

function initGestionale() {
    // No-op: Notion databases are already initialized
    // Only local settings need init
    const imp = localStorage.getItem(GEST_KEYS.impostazioni);
    if (!imp) {
        gestionaleAdmin.updateImpostazioni({});
    }
}

initGestionale();

export {
    GEST_KEYS,
    initGestionale,
    fattureService,
    ordiniService,
    clientiService,
    fornitoriService,
    prodottiService,
    magazzinoService,
    dipendentiService,
    bustePagaService,
    financeService,
    documentiService,
    campagneService,
    gestionaleAdmin,
};
