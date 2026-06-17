// ELAB Gestionale - Servizio Notifiche
// © Andrea Marro — 18 Febbraio 2026
// Controlla: fatture scadute, ordini in ritardo, prodotti sottoscorta, scadenze prossime
// ============================================================

import logger from '../../../../utils/logger';

const NOTIF_READ_KEY = 'elab_gest_notifications_read';

function getReadIds() {
    try {
        return JSON.parse(localStorage.getItem(NOTIF_READ_KEY) || '[]');
    } catch {
        return [];
    }
}

function markAsRead(notifId) {
    const read = getReadIds();
    if (!read.includes(notifId)) {
        read.push(notifId);
        localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(read));
    }
}

function markAllRead(notifIds) {
    const read = getReadIds();
    const merged = [...new Set([...read, ...notifIds])];
    localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(merged));
}

function isRead(notifId) {
    return getReadIds().includes(notifId);
}

// ── Check Notifiche ────────────────────────────
function checkNotifications({ fatture = [], ordini = [], prodotti = [] }) {
    const notifications = [];
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Fatture scadute (non pagate con dataScadenza passata)
    fatture.forEach(f => {
        if (!f.dataScadenza || f.stato === 'pagata' || f.stato === 'annullata') return;
        const scadenza = new Date(f.dataScadenza);
        if (scadenza < now) {
            notifications.push({
                id: `fat-scaduta-${f.id}`,
                type: 'fattura_scaduta',
                severity: 'danger',
                title: `Fattura ${f.numero || 'N/A'} scaduta`,
                message: `${f.clienteNome || 'Cliente'} — scaduta il ${f.dataScadenza}`,
                timestamp: now.toISOString(),
                read: isRead(`fat-scaduta-${f.id}`),
            });
        } else if (scadenza < in7days) {
            notifications.push({
                id: `fat-prossima-${f.id}`,
                type: 'fattura_prossima',
                severity: 'warning',
                title: `Fattura ${f.numero || 'N/A'} in scadenza`,
                message: `${f.clienteNome || 'Cliente'} — scade il ${f.dataScadenza}`,
                timestamp: now.toISOString(),
                read: isRead(`fat-prossima-${f.id}`),
            });
        }
    });

    // 2. Ordini in ritardo (stato != completato/annullato con data consegna passata)
    ordini.forEach(o => {
        if (!o.dataConsegna || o.stato === 'completato' || o.stato === 'annullato') return;
        const consegna = new Date(o.dataConsegna);
        if (consegna < now) {
            notifications.push({
                id: `ord-ritardo-${o.id}`,
                type: 'ordine_ritardo',
                severity: 'danger',
                title: `Ordine ${o.numero || 'N/A'} in ritardo`,
                message: `Consegna prevista ${o.dataConsegna}`,
                timestamp: now.toISOString(),
                read: isRead(`ord-ritardo-${o.id}`),
            });
        }
    });

    // 3. Prodotti sottoscorta (quantita < 5)
    prodotti.forEach(p => {
        const qty = p.quantita ?? p.giacenza ?? 0;
        if (qty < 5) {
            notifications.push({
                id: `prod-sottoscorta-${p.id}`,
                type: 'sottoscorta',
                severity: qty === 0 ? 'danger' : 'warning',
                title: `${p.nome || 'Prodotto'} sottoscorta`,
                message: `Giacenza: ${qty} unita`,
                timestamp: now.toISOString(),
                read: isRead(`prod-sottoscorta-${p.id}`),
            });
        }
    });

    logger.info(`[Notifiche] ${notifications.length} notifiche generate`);

    // Sort: unread first, then by severity (danger > warning > info)
    const severityOrder = { danger: 0, warning: 1, info: 2 };
    return notifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
    });
}

const NotificationService = {
    checkNotifications,
    markAsRead,
    markAllRead,
    isRead,
    getReadIds,
};

export default NotificationService;
