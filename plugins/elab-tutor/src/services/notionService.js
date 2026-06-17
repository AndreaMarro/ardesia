// ============================================
// ELAB - Notion Service (ponte Frontend → Backend → Notion)
// Servizio CRUD per tutti i database Notion
// © Andrea Marro — 08/02/2026
// ============================================

// SECURITY FIX 13/02/2026: Hardcoded fallback URL removed from client bundle.
// Set VITE_ADMIN_WEBHOOK (or VITE_ADMIN_WEBHOOK_URL) as environment variable on Vercel.
const ADMIN_WEBHOOK_URL = import.meta.env.VITE_ADMIN_WEBHOOK || import.meta.env.VITE_ADMIN_WEBHOOK_URL || '';
const REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// ============================================
// COLLECTION IDs dei Database Notion
// Questi ID vengono passati al backend per sapere
// quale database Notion interrogare
// ============================================
const NOTION_DBS = {
    // --- DB esistenti (Admin / Sito) ---
    utenti:         '7e2c3df4-dfb8-4978-adb3-ad83d6d3846b',
    orders:         '70deebe9-b8bb-4f0b-b37c-71a3600077b8',
    waitlist:       '70aef09d-be42-4574-8e69-dfeb942fa795',
    eventi:         'a9fe4ef2-8705-4baf-a6c8-a1e745b65989',
    corsi:          'fde954a0-256e-4400-bc19-8abc1bc7c5da',

    // --- DB Gestionale (creati 06/02/2026) ---
    fatture:        '4a5e516f-2523-46ad-b8c4-dece2b4ec768',
    conti:          '7959f2b3-0242-48b0-b37d-64eb78d4946f',
    dipendenti:     'dd5c048b-faac-43ae-971f-708877039a0e',
    magazzino:      '6d0cbb5a-63ac-43c6-b946-21bb50507f5d',
    documenti:      '77d6388b-1335-4e1b-8fe5-8fc34fbe8f84',
    campagne:       'a4db1e9a-e548-4de1-80eb-10f36953d01f',
};

// ============================================
// CACHE in-memory (TTL breve per ridurre chiamate)
// ============================================
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minuto

function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function cacheSet(key, data, ttl = CACHE_TTL) {
    cache.set(key, { data, expiry: Date.now() + ttl });
}

function cacheInvalidate(prefix) {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
}

// ============================================
// FETCH WRAPPER con timeout e error handling
// ============================================
async function notionFetch(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(ADMIN_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify(payload),
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const text = await response.text();
        if (!text || text.trim() === '') {
            throw new Error('Risposta vuota dal server');
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            // Il backend a volte restituisce array wrapping
            throw new Error('Risposta non JSON dal server');
        }

        // Il backend wrappa spesso in array
        if (Array.isArray(data) && data.length === 1) {
            data = data[0];
        }

        return data;

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Timeout: il server non ha risposto in tempo');
        }

        // Errore di rete (backend non raggiungibile)
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
            throw new Error('OFFLINE: Impossibile raggiungere il server. Verifica la connessione o lo stato del backend.');
        }

        throw error;
    }
}

// ============================================
// FACTORY: Crea un service CRUD per ogni entity
// ============================================
function createEntityService(entityName, dbId) {
    return {
        _entity: entityName,
        _dbId: dbId,

        // LIST con filtri opzionali e paginazione
        async getAll(filters = {}, { useCache = true, page = 1, pageSize = 100 } = {}) {
            const cacheKey = `${entityName}:list:${JSON.stringify(filters)}:${page}:${pageSize}`;
            if (useCache) {
                const cached = cacheGet(cacheKey);
                if (cached) return cached;
            }

            const result = await notionFetch({
                entity: entityName,
                dbId,
                action: 'list',
                filters,
                page,
                pageSize,
            });

            const normalized = {
                items: result.items || result.data || result.results || (Array.isArray(result) ? result : []),
                total: result.total || result.count || 0,
                page,
                pageSize,
            };

            cacheSet(cacheKey, normalized);
            return normalized;
        },

        // GET singolo per ID
        async getById(id) {
            const cacheKey = `${entityName}:item:${id}`;
            const cached = cacheGet(cacheKey);
            if (cached) return cached;

            const result = await notionFetch({
                entity: entityName,
                dbId,
                action: 'get',
                id,
            });

            const item = result.item || result.data || result;
            cacheSet(cacheKey, item);
            return item;
        },

        // CREATE
        async create(data) {
            const result = await notionFetch({
                entity: entityName,
                dbId,
                action: 'create',
                data,
            });

            cacheInvalidate(`${entityName}:`);
            return result.item || result.data || result;
        },

        // UPDATE
        async update(id, data) {
            const result = await notionFetch({
                entity: entityName,
                dbId,
                action: 'update',
                id,
                data,
            });

            cacheInvalidate(`${entityName}:`);
            return result.item || result.data || result;
        },

        // DELETE
        async delete(id) {
            const result = await notionFetch({
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
                entity: entityName,
                dbId,
                action: 'delete',
                id,
            });

            cacheInvalidate(`${entityName}:`);
            return result;
        },

        // SEARCH testuale
        async search(query, filters = {}) {
            return notionFetch({
                entity: entityName,
                dbId,
                action: 'search',
                query,
                filters,
            });
        },

        // AGGREGATE (count, sum, avg per dashboard)
        async aggregate(operation, field, filters = {}) {
            return notionFetch({
                entity: entityName,
                dbId,
                action: 'aggregate',
                operation, // 'count' | 'sum' | 'avg'
                field,
                filters,
            });
        },

        // Invalida cache manualmente
        clearCache() {
            cacheInvalidate(`${entityName}:`);
        },
    };
}

// ============================================
// SERVICES ESPORTATI
// ============================================

// --- Admin / Sito ---
export const utentiService     = createEntityService('utenti', NOTION_DBS.utenti);
export const ordiniService     = createEntityService('orders', NOTION_DBS.orders);
export const waitlistService   = createEntityService('waitlist', NOTION_DBS.waitlist);
export const eventiService     = createEntityService('eventi', NOTION_DBS.eventi);
export const corsiService      = createEntityService('corsi', NOTION_DBS.corsi);

// --- Gestionale ERP ---
export const fattureService    = createEntityService('fatture', NOTION_DBS.fatture);
export const contiService      = createEntityService('conti', NOTION_DBS.conti);
export const dipendentiService = createEntityService('dipendenti', NOTION_DBS.dipendenti);
export const magazzinoService  = createEntityService('magazzino', NOTION_DBS.magazzino);
export const documentiService  = createEntityService('documenti', NOTION_DBS.documenti);
export const campagneService   = createEntityService('campagne', NOTION_DBS.campagne);

// STRIPE SERVICE — rimosso (dormiente, vendita via Amazon)

// ============================================
// DASHBOARD SERVICE (aggregazioni cross-entity)
// ============================================
export const dashboardService = {
    // KPI generali per l'admin dashboard
    async getAdminKPIs() {
        const cacheKey = 'dashboard:admin_kpis';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        const result = await notionFetch({
            entity: 'dashboard',
            action: 'admin_kpis',
        });

        cacheSet(cacheKey, result, 2 * 60 * 1000); // 2 min
        return result;
    },

    // KPI gestionale ERP
    async getGestionaleKPIs() {
        const cacheKey = 'dashboard:gestionale_kpis';
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        const result = await notionFetch({
            entity: 'dashboard',
            action: 'gestionale_kpis',
        });

        cacheSet(cacheKey, result, 2 * 60 * 1000);
        return result;
    },

    // Activity feed (ultime azioni)
    async getActivityFeed(limit = 20) {
        return notionFetch({
            entity: 'dashboard',
            action: 'activity_feed',
            limit,
        });
    },
};

// ============================================
// UTILITY: Test connessione al backend
// ============================================
export async function testConnection() {
    try {
        const result = await notionFetch({
            entity: 'system',
            action: 'ping',
        });
        return { connected: true, server: result };
    } catch (error) {
        return { connected: false, error: error.message };
    }
}

// ============================================
// UTILITY: Invalida tutta la cache
// ============================================
function clearAllCache() {
    cache.clear();
}

// ============================================
// UTILITY: Info debug
// ============================================
function getServiceInfo() {
    return {
        webhookUrl: ADMIN_WEBHOOK_URL,
        timeout: REQUEST_TIMEOUT,
        databases: NOTION_DBS,
        cacheSize: cache.size,
        cacheTTL: CACHE_TTL,
    };
}
