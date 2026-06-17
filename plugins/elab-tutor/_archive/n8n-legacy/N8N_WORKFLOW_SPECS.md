# Specifiche Workflow n8n: `elab-admin`

## Endpoint
```
POST https://n8n.srv1022317.hstgr.cloud/webhook/elab-admin
Content-Type: application/json
```

## Payload generico
```json
{
  "entity": "utenti|orders|waitlist|eventi|corsi|community_posts|gruppi|commenti|fatture|conti|dipendenti|magazzino|documenti|campagne|stripe|dashboard|system",
  "dbId": "<collection_id del database Notion>",
  "action": "list|get|create|update|delete|search|aggregate|ping|balance|recent_payments|...",
  "id": "<page_id per get/update/delete>",
  "data": { ... },
  "filters": { ... },
  "page": 1,
  "pageSize": 100
}
```

---

## Mappa Entity → Database Notion

| Entity | Collection ID | Database Name |
|--------|--------------|---------------|
| `utenti` | `7e2c3df4-dfb8-4978-adb3-ad83d6d3846b` | Utenti |
| `orders` | `70deebe9-b8bb-4f0b-b37c-71a3600077b8` | Orders |
| `waitlist` | `70aef09d-be42-4574-8e69-dfeb942fa795` | Waitlist |
| `eventi` | `a9fe4ef2-8705-4baf-a6c8-a1e745b65989` | Eventi |
| `corsi` | `fde954a0-256e-4400-bc19-8abc1bc7c5da` | Courses |
| `community_posts` | `8236d1b3-580f-4e67-9408-d94a0d9b789b` | Community Posts |
| `gruppi` | `d66a52f6-6fe4-420a-9c32-36ad5dd3e2a1` | Gruppi |
| `commenti` | `9cb8b059-051c-40e5-832f-1028c5c95a23` | Commenti |
| `fatture` | `4a5e516f-2523-46ad-b8c4-dece2b4ec768` | Fatture |
| `conti` | `7959f2b3-0242-48b0-b37d-64eb78d4946f` | Conti & Movimenti |
| `dipendenti` | `dd5c048b-faac-43ae-971f-708877039a0e` | Dipendenti |
| `magazzino` | `6d0cbb5a-63ac-43c6-b946-21bb50507f5d` | Magazzino |
| `documenti` | `77d6388b-1335-4e1b-8fe5-8fc34fbe8f84` | Documenti & Scadenze |
| `campagne` | `a4db1e9a-e548-4de1-80eb-10f36953d01f` | Campagne Marketing |

---

## Azioni supportate

### `action: "list"`
Legge tutte le pagine dal database Notion specificato da `dbId`.

**Input:**
```json
{
  "entity": "utenti",
  "dbId": "7e2c3df4-dfb8-4978-adb3-ad83d6d3846b",
  "action": "list",
  "filters": {},
  "page": 1,
  "pageSize": 100
}
```

**Implementazione n8n:**
1. Nodo Notion: Query database con `dbId`
2. Opzionale: applicare filtri Notion se presenti in `filters`
3. Mappare le proprietà Notion in JSON flat

**Output atteso:**
```json
{
  "success": true,
  "items": [
    { "id": "page_id_1", "nome": "...", "email": "...", ... },
    { "id": "page_id_2", ... }
  ],
  "total": 42
}
```

### `action: "get"`
Legge una singola pagina Notion per ID.

**Input:**
```json
{
  "entity": "utenti",
  "dbId": "7e2c3df4-...",
  "action": "get",
  "id": "page_id_xxx"
}
```

**Implementazione n8n:**
1. Nodo Notion: Get page by ID
2. Estrarre proprietà e convertire in JSON flat

**Output atteso:**
```json
{
  "success": true,
  "item": { "id": "page_id_xxx", "nome": "...", "email": "...", ... }
}
```

### `action: "create"`
Crea una nuova pagina nel database Notion.

**Input:**
```json
{
  "entity": "fatture",
  "dbId": "4a5e516f-...",
  "action": "create",
  "data": {
    "numero": "FT-2026-001",
    "clienteNome": "Scuola XYZ",
    "totale": 1500,
    "stato": "bozza"
  }
}
```

**Implementazione n8n:**
1. Nodo Notion: Create page in database `dbId`
2. Mappare `data` fields alle proprietà Notion (title, rich_text, number, select, date, checkbox, url)
3. Restituire la pagina creata

**Output atteso:**
```json
{
  "success": true,
  "item": { "id": "new_page_id", "numero": "FT-2026-001", ... }
}
```

### `action: "update"`
Aggiorna una pagina Notion esistente.

**Input:**
```json
{
  "entity": "fatture",
  "dbId": "4a5e516f-...",
  "action": "update",
  "id": "page_id_xxx",
  "data": {
    "stato": "pagata",
    "dataPagamento": "2026-02-06"
  }
}
```

**Implementazione n8n:**
1. Nodo Notion: Update page `id`
2. Aggiornare solo le proprietà presenti in `data`

**Output atteso:**
```json
{
  "success": true,
  "item": { "id": "page_id_xxx", "stato": "pagata", ... }
}
```

### `action: "delete"`
Archivia (soft delete) una pagina Notion.

**Input:**
```json
{
  "entity": "fatture",
  "action": "delete",
  "id": "page_id_xxx"
}
```

**Implementazione n8n:**
1. Nodo Notion: Archive page `id` (set `archived: true`)

**Output atteso:**
```json
{ "success": true }
```

### `action: "ping"` (entity: "system")
Health check del webhook.

**Output atteso:**
```json
{ "success": true, "timestamp": "2026-02-06T...", "server": "n8n" }
```

---

## Azioni Stripe (entity: "stripe")

### `action: "balance"`
Chiama Stripe API: `GET /v1/balance`

### `action: "recent_payments"`
Chiama Stripe API: `GET /v1/payment_intents?limit={limit}`

### `action: "subscription_status"`
Chiama Stripe API: `GET /v1/subscriptions?customer={customerId}`

### `action: "revenue_stats"`
Calcola MRR, totale revenue, clienti attivi da Stripe.

### `action: "products"`
Chiama Stripe API: `GET /v1/products`

### `action: "customers"`
Chiama Stripe API: `GET /v1/customers?limit={limit}`

---

## Azioni Dashboard (entity: "dashboard")

### `action: "admin_kpis"`
Aggrega dati da tutti i DB Notion + Stripe:
- Totale utenti, utenti attivi
- Totale ordini, revenue
- Corsi attivi, eventi prossimi
- Waitlist iscritti, post community

### `action: "gestionale_kpis"`
Aggrega dati dai DB gestionale:
- Fatture (totale, non pagate, fatturato mese)
- Ordini (totale, in lavorazione)
- Magazzino (prodotti, sottoscorta)
- Dipendenti (totale, costo mensile)

### `action: "activity_feed"`
Ultime N azioni da tutti i database (sort by data, limit).

---

## Mapping Proprietà Notion → JSON

Il workflow n8n deve convertire le proprietà Notion in JSON flat:

| Tipo Notion | Conversione |
|------------|-------------|
| title | `property.title[0].plain_text` |
| rich_text | `property.rich_text[0].plain_text` |
| number | `property.number` |
| select | `property.select.name` |
| multi_select | `property.multi_select.map(s => s.name)` |
| date | `property.date.start` |
| checkbox | `property.checkbox` |
| url | `property.url` |
| email | `property.email` |
| phone_number | `property.phone_number` |
| formula | `property.formula.string || property.formula.number` |

E viceversa per create/update.

---

## Autenticazione

- **Notion:** Integration Token (Bearer) configurato nelle credenziali n8n
- **Stripe:** Secret Key configurata nelle credenziali n8n
- **Webhook:** Nessuna auth aggiuntiva (protetto da URL segreto)

---

## Struttura Workflow n8n consigliata

```
[Webhook Trigger: POST /elab-admin]
    ↓
[Switch: entity]
    ├── "system" → [Respond: ping]
    ├── "stripe" → [Switch: action]
    │       ├── "balance" → [Stripe: Get Balance] → [Respond]
    │       ├── "recent_payments" → [Stripe: List PaymentIntents] → [Respond]
    │       └── ...
    ├── "dashboard" → [Switch: action]
    │       ├── "admin_kpis" → [Notion: Query multiple DBs] → [Aggregate] → [Respond]
    │       └── ...
    └── default (Notion entities) → [Switch: action]
            ├── "list" → [Notion: Query Database dbId] → [Map Properties] → [Respond]
            ├── "get" → [Notion: Get Page id] → [Map Properties] → [Respond]
            ├── "create" → [Notion: Create Page in dbId] → [Respond]
            ├── "update" → [Notion: Update Page id] → [Respond]
            └── "delete" → [Notion: Archive Page id] → [Respond]
```

---

## Variabili d'ambiente frontend

```env
VITE_N8N_ADMIN_URL=https://n8n.srv1022317.hstgr.cloud/webhook/elab-admin
```

## Note

- Il frontend usa cache in-memory (1 min TTL) per ridurre le chiamate
- Se n8n non risponde, il frontend mostra un messaggio informativo
- Le operazioni Stripe sono read-only dal frontend (no pagamenti diretti)
- Import/Export del gestionale funziona via JSON esportato da Notion
