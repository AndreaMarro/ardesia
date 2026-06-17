# Deploy ELAB Data Server su Render

## Prerequisiti
- Account Render (render.com)
- Repository GitHub con il codice pushato

## Passi

### 1. Crea il servizio su Render
1. Vai su https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connetti il repository GitHub
4. Configura:
   - **Name**: `elab-data`
   - **Region**: `Frankfurt (EU)` — OBBLIGATORIO per GDPR
   - **Root Directory**: `server-data`
   - **Runtime**: `Docker`
   - **Plan**: `Free`

### 2. Configura le variabili d'ambiente
In "Environment" → "Environment Variables":

| Key | Value | Note |
|-----|-------|------|
| `NODE_ENV` | `production` | |
| `DATA_DIR` | `/app/data` | Directory persistente per SQLite |
| `HMAC_SECRET` | `(stessa chiave delle Netlify Functions)` | **CRITICO**: deve essere la stessa usata per firmare i token |

### 3. Deploy
Click "Create Web Service". Il primo deploy richiede ~3-5 minuti (build Docker).

### 4. Verifica
```bash
# Health check
curl https://elab-data.onrender.com/api/health

# Risposta attesa:
# {"status":"ok","service":"elab-data-server","version":"1.1.0","region":"frankfurt","hmacEnabled":true}
```

### 5. Aggiorna il frontend
In Vercel → Project Settings → Environment Variables:
- Aggiungi: `VITE_DATA_SERVER_URL` = `https://elab-data.onrender.com`
- Rideploy: `npx vercel --prod --yes`

### 6. Verifica CORS
```bash
curl -H "Origin: https://elab-builder.vercel.app" \
     https://elab-data.onrender.com/api/health -v 2>&1 | grep -i "access-control"
```

## Note
- Il piano Free di Render va in sleep dopo 15 min di inattività. Il primo request dopo lo sleep richiede ~30s.
- I dati SQLite su Free tier NON sono persistenti tra deploy. Per produzione serve il piano Starter ($7/mese) con disco persistente.
- Il server ha rate limiting: 30 req/min per IP.
