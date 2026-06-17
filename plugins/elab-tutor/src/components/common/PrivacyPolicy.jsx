// © Andrea Marro — 29/03/2026
/**
 * ELAB — Informativa Privacy Completa (GDPR-K + COPPA)
 *
 * Versione: 3.0 (Dati reali, provider reali, storage reale da analisi codice)
 * 
 * Conformità:
 * - GDPR Regolamento UE 2016/679
 * - GDPR-K (Kids) Art. 8
 * - COPPA (Children's Online Privacy Protection Act) USA
 * - Codice Privacy Italiano (D.Lgs. 196/2003 e D.Lgs. 101/2018)
 * 
 * Target: Bambini 8-14 anni + Genitori/Tutori
 * 
 * DUAL-MODE:
 * - Full page: /privacy route
 * - Modal: onClose prop
 * 
 * SEZIONI:
 * 1. Titolare e DPO
 * 2. Dati raccolti (dettagliato)
 * 3. Base giuridica
 * 4. Finalità
 * 5. Destinatari
 * 6. Trasferimenti internazionali
 * 7. Periodo conservazione
 * 8. Diritti degli interessati (GDPR 15-22)
 * 9. Minori (GDPR Art. 8 + COPPA)
 * 10. Cookie e tecnologie simili
 * 11. Sicurezza
 * 12. Violazioni dati
 * 13. Reclami
 * 14. Modifiche
 */

import React, { useState } from 'react';

const LAST_UPDATED = '29/03/2026';
const VERSION = '3.0';

const DATA_CONTROLLER = {
  name: 'Andrea Marro',
  tradeName: 'ELAB STEM',
  partner: 'Omaric Elettronica S.r.l. (Strambino, TO)',
  email: 'privacy@elab-stem.com',
  pec: 'PEC in fase di attivazione',
};

const DPO = {
  name: 'Andrea Marro',
  email: 'privacy@elab-stem.com',
  note: 'Ai sensi dell\'Art. 37 GDPR, in qualit\u00e0 di piccola impresa il titolare del trattamento funge anche da referente privacy.',
};

export default function PrivacyPolicy({ onClose }) {
  const isFullPage = !onClose;
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const Section = ({ id, title, children, summary }) => (
    <section style={styles.section}>
      <button 
        style={styles.sectionHeader} 
        onClick={() => toggleSection(id)}
        aria-expanded={activeSection === id}
      >
        <h2 style={styles.sectionTitle}>{title}</h2>
        <span style={styles.toggleIcon}>{activeSection === id ? '−' : '+'}</span>
      </button>
      
      {(activeSection === id || isFullPage) && (
        <div style={styles.sectionContent}>
          {summary && <p style={styles.summary}>{summary}</p>}
          {children}
        </div>
      )}
    </section>
  );

  const content = (
    <div style={isFullPage ? pageStyles.wrapper : styles.modal} onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Informativa sulla Privacy</h1>
          <p style={styles.subtitle}>ELAB Tutor — Piattaforma Educativa STEM</p>
          <p style={styles.meta}>Versione {VERSION} — Aggiornata il {LAST_UPDATED}</p>
        </div>
        {!isFullPage && (
          <button style={styles.closeBtn} onClick={onClose} aria-label="Chiudi">
            ×
          </button>
        )}
      </div>

      {/* Quick Links */}
      <div style={styles.quickLinks}>
        <a href="#genitori" style={styles.quickLink}>Per i Genitori</a>
        <a href="#bambini" style={styles.quickLink}>Per i Bambini</a>
        <a href="#diritti" style={styles.quickLink}>I Tuoi Diritti</a>
        <a href="#contatti" style={styles.quickLink}>Contatti</a>
      </div>

      <div style={styles.body}>
        
        {/* Introduzione */}
        <div style={styles.intro}>
          <p style={styles.introText}>
            <strong>ELAB Tutor</strong> è impegnata nella protezione dei dati personali 
            dei propri utenti, in particolare dei bambini e ragazzi che rappresentano 
            la nostra comunità principale.
          </p>
          <p style={styles.introText}>
            Questa informativa è redatta in conformità con il 
            <strong> Regolamento UE 2016/679 (GDPR)</strong>, il 
            <strong> GDPR-K (protezione minori)</strong> e la normativa 
            <strong> COPPA (USA)</strong>.
          </p>
        </div>

        {/* 1. Titolare e DPO */}
        <Section 
          id="titolare" 
          title="1. Titolare del Trattamento e DPO"
          summary="Chi gestisce i tuoi dati e chi contattare per la privacy"
        >
          <div style={styles.infoBox}>
            <h3 style={styles.h3}>Titolare del Trattamento</h3>
            <p style={styles.text}><strong>{DATA_CONTROLLER.name}</strong></p>
            <p style={styles.text}>Nome commerciale: {DATA_CONTROLLER.tradeName}</p>
            <p style={styles.text}>Partner hardware: {DATA_CONTROLLER.partner}</p>
            <p style={styles.text}>Email: <a href={`mailto:${DATA_CONTROLLER.email}`} style={styles.link}>{DATA_CONTROLLER.email}</a></p>
            <p style={styles.text}>PEC: {DATA_CONTROLLER.pec}</p>
          </div>

          <div style={styles.infoBoxHighlight}>
            <h3 style={styles.h3}>Referente Privacy / DPO</h3>
            <p style={styles.text}><strong>{DPO.name}</strong></p>
            <p style={styles.text}>Email: <a href={`mailto:${DPO.email}`} style={styles.link}>{DPO.email}</a></p>
            <p style={styles.textSmall}>
              {DPO.note}
            </p>
            <p style={styles.textSmall}>
              Il referente privacy è contattabile per qualsiasi questione relativa al trattamento
              dei dati personali e per l'esercizio dei diritti previsti dal GDPR.
            </p>
          </div>
        </Section>

        {/* 2. Dati Raccolti */}
        <Section 
          id="dati" 
          title="2. Dati Personali Raccolti"
          summary="Quali informazioni raccogliamo e perché"
        >
          <h3 style={styles.h3}>2.1 Dati Forniti Direttamente dall'Utente</h3>
          <div style={styles.tableWrap}><table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Categoria</th>
                <th style={styles.th}>Dati specifici</th>
                <th style={styles.th}>Base legale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Registrazione account</td>
                <td style={styles.td}>Nome, cognome, email, password (hash server-side con bcrypt), ruolo (studente/docente), tipo utente (famiglia/scuola)</td>
                <td style={styles.td}>Art. 6(1)(b) — Esecuzione contratto</td>
              </tr>
              <tr>
                <td style={styles.td}>Gestione classi</td>
                <td style={styles.td}>Username studente, nome classe, codice classe (6 caratteri)</td>
                <td style={styles.td}>Art. 6(1)(b) — Esecuzione contratto</td>
              </tr>
              <tr>
                <td style={styles.td}>Chat AI (UNLIM)</td>
                <td style={styles.td}>Testo dei messaggi, immagini allegate (base64), ID esperimento corrente, stato del circuito, contesto simulatore</td>
                <td style={styles.td}>Art. 6(1)(a) — Consenso</td>
              </tr>
              <tr>
                <td style={styles.td}>Consenso parentale</td>
                <td style={styles.td}>Email genitore, nome genitore, nome minore, eta, metodo di consenso</td>
                <td style={styles.td}>Art. 8 GDPR + COPPA</td>
              </tr>
              <tr>
                <td style={styles.td}>Licenza e kit</td>
                <td style={styles.td}>Codice licenza, kit attivati, scadenza licenza</td>
                <td style={styles.td}>Art. 6(1)(b) — Esecuzione contratto</td>
              </tr>
            </tbody>
          </table></div>

          <h3 style={styles.h3}>2.2 Dati Raccolti Automaticamente (localStorage/sessionStorage)</h3>
          <div style={styles.tableWrap}><table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Chiave</th>
                <th style={styles.th}>Contenuto</th>
                <th style={styles.th}>Storage</th>
                <th style={styles.th}>Scopo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>elab_device_id</td>
                <td style={styles.td}>UUID dispositivo (crypto.randomUUID)</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Identificazione pseudonimizzata per tracciamento progressi</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_student_name</td>
                <td style={styles.td}>Nome studente (opzionale)</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Visualizzazione nella Teacher Dashboard</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_auth_token</td>
                <td style={styles.td}>Token HMAC autenticazione</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Mantenimento sessione login</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_tutor_session</td>
                <td style={styles.td}>ID sessione tutor AI</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Continuita conversazione AI</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_gdpr_consent</td>
                <td style={styles.td}>Stato consenso, timestamp, eta</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Registro consenso GDPR</td>
              </tr>
              <tr>
                <td style={styles.td}>elab-sim-session</td>
                <td style={styles.td}>ID sessione simulatore</td>
                <td style={styles.td}>sessionStorage</td>
                <td style={styles.td}>Raggruppamento eventi analytics</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_user_age</td>
                <td style={styles.td}>Eta utente dichiarata</td>
                <td style={styles.td}>sessionStorage</td>
                <td style={styles.td}>Determinazione soglia consenso parentale</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_auth_ratelimit</td>
                <td style={styles.td}>Tentativi login, timestamp lockout</td>
                <td style={styles.td}>sessionStorage</td>
                <td style={styles.td}>Protezione brute-force (max 5 tentativi, lockout 15 min)</td>
              </tr>
            </tbody>
          </table></div>

          <h3 style={styles.h3}>2.3 Dati Inviati ai Servizi AI</h3>
          <div style={styles.warningBox}>
            <p style={styles.text}>
              Quando utilizzi il tutor AI UNLIM/UNLIM, i seguenti dati vengono inviati
              ai provider AI (Anthropic Claude o Google Gemini) tramite i nostri server proxy:
            </p>
            <ul style={styles.list}>
              <li>Testo del messaggio digitato</li>
              <li>ID sessione tutor (pseudonimizzato)</li>
              <li>ID esperimento corrente</li>
              <li>Stato del circuito (componenti, connessioni, valori)</li>
              <li>Contesto simulatore (pannello aperto, modalita)</li>
              <li>Immagini allegate (base64, se inviate dall'utente)</li>
            </ul>
            <p style={styles.textSmall}>
              Non vengono mai inviati ai provider AI: nome reale, email, password, dati di registrazione o altri dati identificativi diretti.
            </p>
          </div>

          <h3 style={styles.h3}>2.4 Analytics (solo con consenso)</h3>
          <p style={styles.text}>
            Se accetti gli analytics nel banner di consenso, vengono raccolti 9 tipi di eventi anonimizzati:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>experiment_loaded, simulation_started, simulation_paused, simulation_reset</li>
            <li style={styles.listItem}>component_interacted, code_viewed, serial_used</li>
            <li style={styles.listItem}>volume_selected, simulator_error</li>
          </ul>
          <p style={styles.textSmall}>
            Ogni evento contiene solo: tipo evento, timestamp, session ID (anonimo). Nessun dato identificativo personale.
            Gli analytics sono inviati via fire-and-forget (navigator.sendBeacon) e non bloccano l'interfaccia.
          </p>

          <h3 style={styles.h3}>2.5 Dati NON Raccolti</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>Coordinate bancarie o dati di pagamento</li>
            <li style={styles.listItem}>Geolocalizzazione precisa</li>
            <li style={styles.listItem}>Identificatori persistenti per advertising</li>
            <li style={styles.listItem}>Profilazione comportamentale commerciale</li>
            <li style={styles.listItem}>Dati biometrici</li>
            <li style={styles.listItem}>Dati sanitari</li>
            <li style={styles.listItem}>Cookie di terze parti</li>
          </ul>
        </Section>

        {/* 3. Base Giuridica */}
        <Section 
          id="base" 
          title="3. Base Giuridica del Trattamento"
          summary="Perché possiamo trattare i tuoi dati"
        >
          <p style={styles.text}>
            Il trattamento dei dati personali si basa sulle seguenti basi giuridiche:
          </p>
          <ol style={styles.orderedList}>
            <li style={styles.listItem}>
              <strong>Art. 6(1)(b) GDPR</strong> — Esecuzione di misure precontrattuali
              (registrazione) o contrattuali (fornitura servizio educativo, gestione licenze, gestione classi)
            </li>
            <li style={styles.listItem}>
              <strong>Art. 6(1)(a) GDPR</strong> — Consenso dell'interessato
              (interazione con il tutor AI, analytics anonimizzati, invio immagini)
            </li>
            <li style={styles.listItem}>
              <strong>Art. 6(1)(f) GDPR</strong> — Legittimo interesse
              (sicurezza, rate limiting, prevenzione abusi, pseudonimizzazione)
            </li>
            <li style={styles.listItem}>
              <strong>Art. 8 GDPR</strong> — Per minori di 14 anni (soglia italiana,
              come stabilito dal D.Lgs. 101/2018 art. 2-quinquies), il consenso deve essere
              prestato dal titolare della responsabilita genitoriale
            </li>
            <li style={styles.listItem}>
              <strong>COPPA (USA)</strong> — Per minori di 13 anni, consenso parentale
              verificato con metodo documentabile
            </li>
          </ol>
        </Section>

        {/* 4. Finalità */}
        <Section 
          id="finalita" 
          title="4. Finalità del Trattamento"
          summary="Come usiamo i tuoi dati"
        >
          <div style={styles.tableWrap}><table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Finalità</th>
                <th style={styles.th}>Descrizione</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Autenticazione</td>
                <td style={styles.td}>Accesso sicuro all'account e protezione dati</td>
              </tr>
              <tr>
                <td style={styles.td}>Erogazione servizio</td>
                <td style={styles.td}>Simulatore, esperimenti, tutor AI UNLIM</td>
              </tr>
              <tr>
                <td style={styles.td}>Personalizzazione</td>
                <td style={styles.td}>Adattare difficoltà e suggerimenti al livello</td>
              </tr>
              <tr>
                <td style={styles.td}>Miglioramento</td>
                <td style={styles.td}>Analytics anonime per ottimizzare la piattaforma</td>
              </tr>
              <tr>
                <td style={styles.td}>Sicurezza</td>
                <td style={styles.td}>Prevenzione frodi, abuse detection</td>
              </tr>
              <tr>
                <td style={styles.td}>Compliance</td>
                <td style={styles.td}>Adempimenti legali (GDPR, COPPA)</td>
              </tr>
            </tbody>
          </table></div>

          <div style={styles.highlightBox}>
            <strong>Non effettuiamo:</strong>
            <ul style={styles.list}>
              <li>Profilazione commerciale</li>
              <li>Pubblicità comportamentale verso minori</li>
              <li>Vendita di dati a terzi</li>
              <li>Decisioni automatizzate con effetti giuridici significativi</li>
            </ul>
          </div>
        </Section>

        {/* 5. Destinatari */}
        <Section 
          id="destinatari" 
          title="5. Destinatari dei Dati"
          summary="Chi può accedere ai tuoi dati"
        >
          <p style={styles.text}>I dati personali possono essere comunicati esclusivamente ai seguenti destinatari, ciascuno per le finalita indicate:</p>

          <div style={styles.tableWrap}><table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fornitore</th>
                <th style={styles.th}>Servizio</th>
                <th style={styles.th}>Dati trattati</th>
                <th style={styles.th}>Server</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}><strong>Vercel Inc.</strong></td>
                <td style={styles.td}>Hosting frontend + Web Analytics + Speed Insights</td>
                <td style={styles.td}>File statici, log di accesso, page views anonimizzati (no cookies, no fingerprinting), Core Web Vitals (LCP/FID/CLS/TTFB)</td>
                <td style={styles.td}>EU Frankfurt (region pinned <code>fra1</code>)</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Anthropic PBC</strong></td>
                <td style={styles.td}>AI tutor (Claude) via webhook n8n</td>
                <td style={styles.td}>Testo messaggi, contesto circuito, immagini</td>
                <td style={styles.td}>US (DPA disponibile)</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Google LLC</strong></td>
                <td style={styles.td}>AI tutor (Gemini) via nanobot proxy</td>
                <td style={styles.td}>Testo messaggi, contesto circuito</td>
                <td style={styles.td}>US/EU</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Hostinger International</strong></td>
                <td style={styles.td}>Hosting webhook n8n (analytics, GDPR, chat)</td>
                <td style={styles.td}>Messaggi chat, eventi analytics, richieste GDPR</td>
                <td style={styles.td}>EU (Lituania)</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Render Services Inc.</strong></td>
                <td style={styles.td}>Hosting nanobot server (elab-galileo.onrender.com)</td>
                <td style={styles.td}>Messaggi chat, contesto sessione</td>
                <td style={styles.td}>US</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Arduino S.r.l.</strong></td>
                <td style={styles.td}>Compilazione codice Arduino (arduino-cli remoto)</td>
                <td style={styles.td}>Solo codice sorgente C++ (nessun dato personale)</td>
                <td style={styles.td}>EU</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Ollama (locale)</strong></td>
                <td style={styles.td}>AI locale (quando disponibile)</td>
                <td style={styles.td}>Messaggi chat — processati interamente sul dispositivo</td>
                <td style={styles.td}>Locale (zero dati esterni)</td>
              </tr>
            </tbody>
          </table></div>

          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Personale autorizzato ELAB:</strong> Solo il titolare (Andrea Marro) ha accesso amministrativo
            </li>
            <li style={styles.listItem}>
              <strong>Docenti:</strong> Accesso limitato ai dati dei propri studenti (progressi, nome utente) tramite la Teacher Dashboard
            </li>
            <li style={styles.listItem}>
              <strong>Autorita competenti:</strong> Solo su richiesta legittima documentata
            </li>
          </ul>

          <p style={styles.textSmall}>
            Tutti i fornitori cloud sono stati selezionati per la loro conformita GDPR.
            Non vengono mai ceduti dati personali a terzi per finalita di marketing o profilazione.
          </p>
        </Section>

        {/* 6. Trasferimenti */}
        <Section 
          id="trasferimenti" 
          title="6. Trasferimenti Internazionali"
          summary="Trasferimento dati fuori dall'UE"
        >
          <p style={styles.text}>
            I seguenti fornitori possono trasferire dati verso gli Stati Uniti:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Anthropic (Claude AI)</strong> — Testo messaggi e contesto circuito. Trasferimento basato
              sul EU-US Data Privacy Framework e Standard Contractual Clauses (SCC).
            </li>
            <li style={styles.listItem}>
              <strong>Render</strong> — Server nanobot (elab-galileo.onrender.com). Testo messaggi e session ID.
              Trasferimento protetto da SCC.
            </li>
            <li style={styles.listItem}>
              <strong>Vercel</strong> — Hosting frontend pinnato in regione EU Frankfurt (<code>fra1</code> via
              <code>vercel.json regions: ["fra1"]</code>). Web Analytics + Speed Insights raccolgono dati
              anonimizzati senza cookie ne fingerprinting (page views, Core Web Vitals).
              Nessun trasferimento extra-UE per i dati di runtime studenti.
              Account Vercel protetto da SCC e EU-US Data Privacy Framework per metadati di servizio.
            </li>
            <li style={styles.listItem}>
              <strong>Google (Gemini)</strong> — Testo messaggi via nanobot proxy. Trasferimento basato
              sul EU-US Data Privacy Framework.
            </li>
          </ul>
          <div style={styles.highlightBox}>
            <strong>Principio di minimizzazione:</strong> Ai provider AI vengono inviati esclusivamente
            il testo del messaggio, il contesto del circuito e un session ID pseudonimizzato.
            Non vengono mai trasferiti nome reale, email, password o altri dati identificativi diretti.
          </div>
          <p style={styles.text}>
            Il fornitore <strong>Hostinger</strong> (webhook n8n) opera su server in Unione Europea (Lituania),
            pertanto non si configura trasferimento extra-UE per tali dati.
          </p>
        </Section>

        {/* 7. Periodo Conservazione */}
        <Section 
          id="conservazione" 
          title="7. Periodo di Conservazione"
          summary="Per quanto tempo conserviamo i dati"
        >
          <div style={styles.tableWrap}><table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Categoria dati</th>
                <th style={styles.th}>Periodo conservazione</th>
                <th style={styles.th}>Criterio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>localStorage (device ID, token, consenso, progressi)</td>
                <td style={styles.td}>Fino a cancellazione manuale del browser o richiesta dell'utente</td>
                <td style={styles.td}>Interamente sul dispositivo dell'utente</td>
              </tr>
              <tr>
                <td style={styles.td}>sessionStorage (session ID, rate limiting, eta)</td>
                <td style={styles.td}>Durata sessione browser (cancellato alla chiusura tab)</td>
                <td style={styles.td}>Interamente sul dispositivo dell'utente</td>
              </tr>
              <tr>
                <td style={styles.td}>Dati account server (profilo, classi, licenze)</td>
                <td style={styles.td}>Durata account + 2 anni (maxDays: 730)</td>
                <td style={styles.td}>Esecuzione contratto + obblighi legali</td>
              </tr>
              <tr>
                <td style={styles.td}>Analytics server (eventi anonimizzati)</td>
                <td style={styles.td}>1 anno</td>
                <td style={styles.td}>Miglioramento servizio educativo</td>
              </tr>
              <tr>
                <td style={styles.td}>Sessioni chat AI</td>
                <td style={styles.td}>30 giorni</td>
                <td style={styles.td}>Continuita conversazione tutor</td>
              </tr>
              <tr>
                <td style={styles.td}>Consenso parentale</td>
                <td style={styles.td}>Fino ai 18 anni del minore</td>
                <td style={styles.td}>Obbligo legale Art. 8 GDPR + COPPA</td>
              </tr>
              <tr>
                <td style={styles.td}>Dati post-cancellazione account</td>
                <td style={styles.td}>30 giorni, poi eliminazione definitiva</td>
                <td style={styles.td}>Obblighi legali + periodo di sicurezza</td>
              </tr>
            </tbody>
          </table></div>

          <p style={styles.text}>
            Trascorso il periodo di conservazione, i dati server sono cancellati automaticamente
            tramite policy di retention (isDataExpired). I dati locali (localStorage/sessionStorage) possono essere
            eliminati dall'utente in qualsiasi momento tramite la funzione "Elimina dati" o cancellando
            i dati del browser.
          </p>
        </Section>

        {/* 8. Diritti */}
        <Section 
          id="diritti" 
          title="8. Diritti degli Interessati (GDPR Art. 15-22)"
          summary="I tuoi diritti sulla privacy"
        >
          <p style={styles.text}>
            Ai sensi del GDPR, hai diritto di:
          </p>

          <div style={styles.rightsGrid}>
            <div style={styles.rightCard}>
              <h4 style={styles.rightTitle}>Accesso (Art. 15)</h4>
              <p style={styles.rightText}>
                Richiedere conferma del trattamento, copia dei dati, finalità, 
                periodo conservazione, destinatari.
              </p>
            </div>

            <div style={styles.rightCard}>
              <h4 style={styles.rightTitle}>Rettifica (Art. 16)</h4>
              <p style={styles.rightText}>
                Ottenere la rettifica di dati inesatti o l'integrazione di dati incompleti.
              </p>
            </div>

            <div style={styles.rightCard}>
              <h4 style={styles.rightTitle}>Cancellazione (Art. 17)</h4>
              <p style={styles.rightText}>
                "Diritto all'oblio": richiedere la cancellazione dei dati quando
                non sono più necessari o revochi il consenso.
                {' '}<a href="/data-deletion" style={{ color: 'var(--elab-navy)' }}>Richiedi eliminazione dati</a>
              </p>
            </div>

            <div style={styles.rightCard}>
              <h4 style={styles.rightTitle}>Limitazione (Art. 18)</h4>
              <p style={styles.rightText}>
                Richiedere la limitazione del trattamento in caso di contestazione 
                dell'esattezza dei dati.
              </p>
            </div>

            <div style={styles.rightCard}>
              <h4 style={styles.rightTitle}>Portabilità (Art. 20)</h4>
              <p style={styles.rightText}>
                Ricevere i dati in formato strutturato, leggibile (JSON) e trasmetterli 
                a un altro titolare.
              </p>
            </div>

            <div style={styles.rightCard}>
              <h4 style={styles.rightTitle}>Opposizione (Art. 21)</h4>
              <p style={styles.rightText}>
                Opporti in qualsiasi momento al trattamento basato su legittimo interesse 
                o profilazione.
              </p>
            </div>
          </div>

          <div style={styles.howToBox}>
            <h4 style={styles.h3}>Come esercitare i diritti</h4>
            <p style={styles.text}>
              Invia una richiesta a <a href={`mailto:${DPO.email}`} style={styles.link}>{DPO.email}</a> con:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Oggetto: "Richiesta GDPR — [Nome Cognome]"</li>
              <li style={styles.listItem}>Email associata all'account</li>
              <li style={styles.listItem}>Diritto che vuoi esercitare</li>
              <li style={styles.listItem}>Documento di identità (per verifica)</li>
            </ul>
            <p style={styles.textSmall}>
              Risponderemo entro <strong>30 giorni</strong> dalla ricezione. 
              In caso di complessità, potremo prorogare di 60 giorni con motivazione.
            </p>
          </div>

          <div style={styles.rightsNote}>
            <strong>Nota per genitori/tutori:</strong> Per minori di 16 anni, 
            i diritti possono essere esercitati dai titolari della responsabilità genitoriale.
          </div>
        </Section>

        {/* 9. Minori */}
        <Section 
          id="minori" 
          title="9. Protezione dei Minori"
          summary="GDPR-K e COPPA compliance"
        >
          <a name="genitori" />
          <a name="bambini" />
          
          <div style={styles.childSection}>
            <h3 style={styles.childTitle}>Per i Genitori e Tutori</h3>
            
            <div style={styles.infoBox}>
              <h4 style={styles.h3}>Verifica Eta e Consenso</h4>
              <p style={styles.textSmall}>
                L'Italia ha fissato a 14 anni la soglia per il consenso autonomo al trattamento dei dati
                personali (D.Lgs. 101/2018, art. 2-quinquies). ELAB Tutor applica questa soglia.
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  <strong>14-17 anni:</strong> Consenso autonomo dello studente
                </li>
                <li style={styles.listItem}>
                  <strong>8-13 anni:</strong> Richiesto consenso parentale verificato (conforme Art. 8 GDPR e COPPA per utenti USA)
                </li>
                <li style={styles.listItem}>
                  <strong>Sotto gli 8 anni:</strong> Registrazione non consentita
                </li>
              </ul>
            </div>

            <h4 style={styles.h3}>Gestione Consenso Parentale</h4>
            <p style={styles.text}>
              Come genitore/tutore, puoi:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Verificare il consenso via email</li>
              <li style={styles.listItem}>Accedere ai dati di tuo figlio in qualsiasi momento</li>
              <li style={styles.listItem}>Revocare il consenso (con conseguente cancellazione dati)</li>
              <li style={styles.listItem}>Richiedere export dati</li>
              <li style={styles.listItem}>Richiedere cancellazione immediata</li>
            </ul>

            <div style={styles.parentDashboard}>
              <h4 style={styles.h3}>Area Genitori</h4>
              <p style={styles.text}>
                Accedi all'area genitori per gestire il consenso e monitorare l'attività:
              </p>
              <a href="/parent-dashboard" style={styles.button}>Accedi all'Area Genitori</a>
            </div>
          </div>

          <div style={styles.childSection}>
            <h3 style={styles.childTitle}>Per i Bambini e Ragazzi</h3>
            
            <div style={styles.kidsBox}>
              <h4 style={styles.h3}>La tua Privacy è Importante!</h4>
              <p style={styles.text}>
                Su ELAB Tutor proteggiamo i tuoi dati come se fossero tesori
              </p>
              
              <h5 style={styles.h4}>Cosa facciamo per proteggerti:</h5>
              <ul style={styles.list}>
                <li style={styles.listItem}>I tuoi dati sono cifrati (come in una cassaforte)</li>
                <li style={styles.listItem}>Non vendiamo i tuoi dati a nessuno</li>
                <li style={styles.listItem}>Non ci sono pubblicità che ti seguono</li>
                <li style={styles.listItem}>Solo tu e i tuoi genitori potete vedere i tuoi progressi</li>
                <li style={styles.listItem}>Puoi cancellare tutto in qualsiasi momento</li>
              </ul>

              <h5 style={styles.h4}>Cosa chiediamo a te:</h5>
              <ul style={styles.list}>
                <li style={styles.listItem}>Chiedi sempre aiuto a un genitore per registrarti</li>
                <li style={styles.listItem}>Non condividere la tua password</li>
                <li style={styles.listItem}>Se qualcosa ti sembra strano, dillo a un adulto</li>
              </ul>

              <div style={styles.kidsContact}>
                <p style={styles.text}>
                  <strong>Hai domande?</strong> Chiedi a un genitore di scriverci a{' '}
                  <a href={`mailto:${DPO.email}`} style={styles.link}>{DPO.email}</a>
                </p>
              </div>
            </div>
          </div>

          <div style={styles.coppaSection}>
            <h3 style={styles.h3}>COPPA Compliance (USA)</h3>
            <p style={styles.text}>
              Per utenti negli Stati Uniti, ELAB Tutor è conforme al Children's Online 
              Privacy Protection Act (COPPA):
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>✓ Consenso parentale verificato per minori di 13 anni</li>
              <li style={styles.listItem}>✓ Dati minimi raccolti (solo necessari al servizio)</li>
              <li style={styles.listItem}>✓ No geolocalizzazione precisa</li>
              <li style={styles.listItem}>✓ No foto/video senza consenso esplicito</li>
              <li style={styles.listItem}>✓ Conservazione documentazione consenso</li>
            </ul>
            <p style={styles.textSmall}>
              Per domande COPPA: <a href={`mailto:${DPO.email}`} style={styles.link}>{DPO.email}</a>
            </p>
          </div>
        </Section>

        {/* 10. Cookie */}
        <Section 
          id="cookie" 
          title="10. Cookie e Tecnologie Simili"
          summary="Uso dei cookie"
        >
          <div style={styles.infoBox}>
            <p style={styles.text}>
              <strong>Nota tecnica:</strong> ELAB Tutor non utilizza cookie HTTP tradizionali.
              I dati locali sono conservati tramite le API Web Storage del browser (localStorage e sessionStorage),
              che sono soggette a regolamentazione analoga ai cookie ai sensi della Direttiva ePrivacy 2002/58/CE
              (recepita in Italia dal D.Lgs. 69/2012).
            </p>
          </div>

          <h3 style={styles.h3}>10.1 Storage Tecnici (Necessari — nessun consenso richiesto)</h3>
          <div style={styles.tableWrap}><table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Chiave</th>
                <th style={styles.th}>Scopo</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>elab_auth_token</td>
                <td style={styles.td}>Mantenimento sessione login (HMAC token)</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Fino a logout o scadenza token</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_gdpr_consent</td>
                <td style={styles.td}>Registro scelta consenso privacy</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Persistente</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_device_id</td>
                <td style={styles.td}>Identificazione pseudonimizzata dispositivo</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Persistente</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_tutor_session</td>
                <td style={styles.td}>Continuita sessione tutor AI</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Persistente</td>
              </tr>
              <tr>
                <td style={styles.td}>elab_auth_ratelimit</td>
                <td style={styles.td}>Protezione brute-force login</td>
                <td style={styles.td}>sessionStorage</td>
                <td style={styles.td}>Sessione browser</td>
              </tr>
            </tbody>
          </table></div>

          <h3 style={styles.h3}>10.2 Storage Analitici (solo con consenso esplicito)</h3>
          <p style={styles.text}>
            Attivati solo dopo consenso esplicito nel banner:
          </p>
          <div style={styles.tableWrap}><table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Chiave</th>
                <th style={styles.th}>Scopo</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>elab_consent_v2</td>
                <td style={styles.td}>Stato consenso analytics (accepted/rejected)</td>
                <td style={styles.td}>localStorage</td>
                <td style={styles.td}>Persistente</td>
              </tr>
              <tr>
                <td style={styles.td}>elab-sim-session</td>
                <td style={styles.td}>Session ID per raggruppamento eventi analytics</td>
                <td style={styles.td}>sessionStorage</td>
                <td style={styles.td}>Sessione browser</td>
              </tr>
            </tbody>
          </table></div>

          <div style={styles.highlightBox}>
            <strong>Cosa NON utilizziamo:</strong>
            <ul style={styles.list}>
              <li>Cookie HTTP di profilazione pubblicitaria</li>
              <li>Cookie o tracker di terze parti (Google Analytics, Facebook Pixel, ecc.)</li>
              <li>Cookie social media</li>
              <li>Fingerprinting del browser</li>
            </ul>
          </div>

          <h3 style={styles.h3}>10.3 Gestione Storage</h3>
          <p style={styles.text}>
            Puoi eliminare tutti i dati locali di ELAB in qualsiasi momento dalla pagina
            {' '}<a href="/data-deletion" style={styles.link}>Eliminazione Dati</a>{' '}
            oppure cancellando i dati del sito nelle impostazioni del browser.
          </p>
        </Section>

        {/* 11. Sicurezza */}
        <Section 
          id="sicurezza" 
          title="11. Misure di Sicurezza"
          summary="Come proteggiamo i tuoi dati"
        >
          <p style={styles.text}>
            Adottiamo misure tecniche e organizzative per proteggere i dati:
          </p>
          
          <div style={styles.securityGrid}>
            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>{'\u2022'}</span>
              <h4 style={styles.h4}>HTTPS obbligatorio</h4>
              <p style={styles.securityText}>Tutte le comunicazioni avvengono su HTTPS/TLS. Nessun dato trasmesso in chiaro.</p>
            </div>

            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>{'\u2022'}</span>
              <h4 style={styles.h4}>Autenticazione HMAC</h4>
              <p style={styles.securityText}>Token HMAC con scadenza, refresh automatico, password hash bcrypt server-side</p>
            </div>

            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>{'\u2022'}</span>
              <h4 style={styles.h4}>Consent Gating</h4>
              <p style={styles.securityText}>Analytics e dati opzionali inviati solo dopo consenso esplicito verificato</p>
            </div>

            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>{'\u2022'}</span>
              <h4 style={styles.h4}>Pseudonimizzazione</h4>
              <p style={styles.securityText}>User ID pseudonimizzati con SHA-256 + salt (irreversibile, troncato a 16 caratteri)</p>
            </div>

            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>{'\u2022'}</span>
              <h4 style={styles.h4}>Rate Limiting</h4>
              <p style={styles.securityText}>Max 5 tentativi login, lockout 15 minuti. Protezione brute-force client e server-side.</p>
            </div>

            <div style={styles.securityItem}>
              <span style={styles.securityIcon}>{'\u2022'}</span>
              <h4 style={styles.h4}>AI Safety Filter</h4>
              <p style={styles.securityText}>Filtro contenuti AI con validazione input/output per protezione minori</p>
            </div>
          </div>

          <div style={styles.certifications}>
            <h4 style={styles.h3}>Conformita normativa</h4>
            <ul style={styles.list}>
              <li style={styles.listItem}>GDPR — Regolamento UE 2016/679</li>
              <li style={styles.listItem}>Codice Privacy Italiano — D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018</li>
              <li style={styles.listItem}>Art. 8 GDPR — Protezione dati minori, soglia italiana 14 anni</li>
              <li style={styles.listItem}>COPPA — Children's Online Privacy Protection Act (15 U.S.C. 6501, per utenti USA)</li>
              <li style={styles.listItem}>Direttiva ePrivacy 2002/58/CE — Tecnologie di tracciamento (localStorage/sessionStorage)</li>
            </ul>
          </div>
        </Section>

        {/* 12. Violazioni */}
        <Section 
          id="violazioni" 
          title="12. Violazioni dei Dati"
          summary="Cosa facciamo in caso di data breach"
        >
          <p style={styles.text}>
            In caso di violazione dei dati personali (data breach):
          </p>
          <ol style={styles.orderedList}>
            <li style={styles.listItem}>
              <strong>Valutazione immediata</strong> — entro 72 ore dalla scoperta
            </li>
            <li style={styles.listItem}>
              <strong>Notifica al Garante</strong> — entro 72 ore se rischio per diritti/libertà
            </li>
            <li style={styles.listItem}>
              <strong>Comunicazione agli interessati</strong> — quando rischio elevato
            </li>
            <li style={styles.listItem}>
              <strong>Documentazione</strong> — registro delle violazioni
            </li>
          </ol>

          <div style={styles.emergencyContact}>
            <h4 style={styles.h3}>Contatto per Data Breach</h4>
            <p style={styles.text}>
              Email: <a href={`mailto:${DPO.email}`} style={styles.link}>{DPO.email}</a><br />
              Oggetto: "URGENTE — Data Breach Notification"
            </p>
          </div>
        </Section>

        {/* 13. Reclami */}
        <Section 
          id="reclami" 
          title="13. Reclami e Contatti"
          summary="Come contattarci e reclami all'Autorità"
        >
          <a name="contatti" />
          
          <div style={styles.contactSection}>
            <h3 style={styles.h3}>Contatti Privacy</h3>
            <div style={styles.contactBox}>
              <p style={styles.contactText}>
                <strong>Referente Privacy — {DPO.name}</strong><br />
                Email: <a href={`mailto:${DPO.email}`} style={styles.link}>{DPO.email}</a><br />
                PEC: {DATA_CONTROLLER.pec}
              </p>
            </div>
          </div>

          <div style={styles.authoritySection}>
            <h3 style={styles.h3}>Reclamo all'Autorità di Controllo</h3>
            <p style={styles.text}>
              Se ritieni che il trattamento dei tuoi dati violi il GDPR, hai diritto 
              di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali:
            </p>
            <div style={styles.authorityBox}>
              <p style={styles.text}>
                <strong>Garante per la Protezione dei Dati Personali</strong><br />
                Piazza Venezia 11, 00187 Roma<br />
                Email: garante@gpdp.it<br />
                Tel: +39 06 696771<br />
                Sito: <a href="https://www.garanteprivacy.it" style={styles.link} target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>
              </p>
            </div>
          </div>
        </Section>

        {/* 14. Modifiche */}
        <Section 
          id="modifiche" 
          title="14. Modifiche all'Informativa"
          summary="Aggiornamenti futuri"
        >
          <p style={styles.text}>
            Ci riserviamo di aggiornare questa informativa per conformità normativa 
            o miglioramenti del servizio. Le modifiche saranno:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Comunicate via email per modifiche sostanziali</li>
            <li style={styles.listItem}>Pubblicate su questa pagina con nuova data</li>
            <li style={styles.listItem}>Notificate nel banner cookie se rilevanti</li>
          </ul>
          <p style={styles.text}>
            <strong>Versione attuale:</strong> {VERSION} — {LAST_UPDATED}
          </p>
          <p style={styles.textSmall}>
            Archivio versioni precedenti disponibile su richiesta a {DPO.email}
          </p>
        </Section>

        {/* Conclusione */}
        <div style={styles.conclusion}>
          <p style={styles.conclusionText}>
            <strong>Grazie per la fiducia!</strong><br />
            La tua privacy è la nostra priorità. Se hai domande, non esitare a contattarci.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        {isFullPage ? (
          <a href="/" style={styles.footerBtn}>
            Torna alla Home
          </a>
        ) : (
          <button style={styles.footerBtn} onClick={onClose}>
            Ho letto e capito
          </button>
        )}
      </div>

      {/* Copyright */}
      {isFullPage && (
        <div style={pageStyles.copyright}>
          © {new Date().getFullYear()} {DATA_CONTROLLER.tradeName} — {DATA_CONTROLLER.name}<br />
          Tutti i diritti riservati — Informativa Privacy v{VERSION}
        </div>
      )}
    </div>
  );

  if (isFullPage) {
    return (
      <div style={pageStyles.page}>
        {content}
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      {content}
    </div>
  );
}

// ============================================
// STYLES
// ============================================

const pageStyles = {
  page: {
    height: '100%',
    overflowY: 'auto',
    background: 'var(--elab-hex-f0f4f8)',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Open Sans', sans-serif",
  },
  wrapper: {
    background: 'var(--elab-hex-ffffff)',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    alignSelf: 'flex-start',
  },
  copyright: {
    textAlign: 'center',
    padding: '24px 32px',
    fontSize: '14px',
    color: '#666',
    borderTop: '1px solid var(--elab-hex-e0e0e0)',
  },
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflow: 'auto',
  },
  modal: {
    background: 'var(--elab-hex-ffffff)',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '32px 40px 16px',
    borderBottom: '1px solid var(--elab-hex-e0e0e0)',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--elab-navy)',
    fontFamily: "'Open Sans', sans-serif",
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '16px',
    color: '#666',
    fontFamily: "'Open Sans', sans-serif",
  },
  meta: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: 'var(--elab-hex-737373)',
    fontFamily: "'Open Sans', sans-serif",
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    color: 'var(--elab-hex-737373)',
    cursor: 'pointer',
    padding: '0 8px',
    lineHeight: 1,
  },
  quickLinks: {
    display: 'flex',
    gap: '12px',
    padding: '16px 40px',
    background: 'var(--elab-hex-f8f9fa)',
    borderBottom: '1px solid var(--elab-hex-e0e0e0)',
    flexWrap: 'wrap',
  },
  quickLink: {
    padding: '8px 16px',
    background: 'var(--elab-hex-ffffff)',
    border: '1px solid var(--elab-hex-e0e0e0)',
    borderRadius: '20px',
    textDecoration: 'none',
    color: 'var(--elab-navy)',
    fontSize: '14px',
    fontWeight: 500,
  },
  body: {
    padding: '24px 40px',
    overflowY: 'auto',
    flex: 1,
  },
  intro: {
    background: 'linear-gradient(135deg, var(--elab-hex-e8f4fd) 0%, var(--elab-hex-f0f7ff) 100%)',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '32px',
    borderLeft: '4px solid var(--elab-navy)',
  },
  introText: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#333',
    margin: '0 0 12px 0',
    fontFamily: "'Open Sans', sans-serif",
  },
  section: {
    marginBottom: '8px',
    borderBottom: '1px solid var(--elab-hex-f0f0f0)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '20px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--elab-navy)',
    margin: 0,
    fontFamily: "'Open Sans', sans-serif",
  },
  toggleIcon: {
    fontSize: '24px',
    color: 'var(--elab-navy)',
    fontWeight: 300,
  },
  sectionContent: {
    padding: '0 0 24px 0',
  },
  summary: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 16px 0',
    fontStyle: 'italic',
  },
  h3: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#333',
    margin: '24px 0 12px 0',
    fontFamily: "'Open Sans', sans-serif",
  },
  h4: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#444',
    margin: '16px 0 8px 0',
    fontFamily: "'Open Sans', sans-serif",
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.7',
    color: '#333',
    margin: '0 0 12px 0',
    fontFamily: "'Open Sans', sans-serif",
  },
  textSmall: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#666',
    margin: '8px 0',
    fontFamily: "'Open Sans', sans-serif",
  },
  link: {
    color: 'var(--elab-navy)',
    textDecoration: 'underline',
  },
  list: {
    margin: '12px 0',
    paddingLeft: '24px',
  },
  listItem: {
    fontSize: '15px',
    lineHeight: '1.7',
    color: '#333',
    marginBottom: '8px',
    fontFamily: "'Open Sans', sans-serif",
  },
  sublist: {
    margin: '8px 0 8px 16px',
    paddingLeft: '16px',
  },
  orderedList: {
    margin: '12px 0',
    paddingLeft: '24px',
  },
  tableWrap: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    margin: '16px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    minWidth: '340px',
  },
  th: {
    background: 'var(--elab-hex-f8f9fa)',
    padding: '10px 8px',
    textAlign: 'left',
    fontWeight: 600,
    borderBottom: '2px solid var(--elab-hex-e0e0e0)',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid var(--elab-hex-e0e0e0)',
    fontFamily: "'Open Sans', sans-serif",
    verticalAlign: 'top',
    fontSize: '14px',
  },
  infoBox: {
    background: 'var(--elab-hex-f8f9fa)',
    padding: '20px',
    borderRadius: '8px',
    margin: '16px 0',
  },
  infoBoxHighlight: {
    background: 'var(--elab-hex-e8f4fd)',
    padding: '20px',
    borderRadius: '8px',
    margin: '16px 0',
    borderLeft: '4px solid var(--elab-navy)',
  },
  warningBox: {
    background: 'var(--elab-hex-fff3cd)',
    padding: '20px',
    borderRadius: '8px',
    margin: '16px 0',
    borderLeft: '4px solid var(--elab-hex-ffc107)',
  },
  highlightBox: {
    background: 'var(--elab-hex-d4edda)',
    padding: '20px',
    borderRadius: '8px',
    margin: '16px 0',
    borderLeft: '4px solid var(--elab-hex-28a745)',
  },
  rightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    margin: '20px 0',
  },
  rightCard: {
    background: 'var(--elab-hex-f8f9fa)',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid var(--elab-hex-e0e0e0)',
  },
  rightTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--elab-navy)',
    margin: '0 0 8px 0',
  },
  rightText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#555',
    margin: 0,
  },
  howToBox: {
    background: 'var(--elab-hex-e8f4fd)',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
  },
  rightsNote: {
    background: 'var(--elab-hex-fff3cd)',
    padding: '16px',
    borderRadius: '8px',
    margin: '20px 0',
    fontSize: '14px',
  },
  childSection: {
    margin: '24px 0',
    padding: '24px',
    background: 'var(--elab-hex-f8f9fa)',
    borderRadius: '12px',
  },
  childTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--elab-navy)',
    margin: '0 0 16px 0',
  },
  kidsBox: {
    background: 'linear-gradient(135deg, var(--elab-hex-e8f4fd) 0%, var(--elab-hex-f0f7ff) 100%)',
    padding: '24px',
    borderRadius: '12px',
    margin: '16px 0',
  },
  kidsContact: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px dashed var(--elab-navy)',
  },
  parentDashboard: {
    background: 'var(--elab-hex-ffffff)',
    padding: '20px',
    borderRadius: '8px',
    margin: '16px 0',
    border: '2px solid var(--elab-navy)',
  },
  button: {
    display: 'inline-block',
    background: 'var(--elab-navy)',
    color: 'var(--elab-hex-ffffff)',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    marginTop: '12px',
  },
  coppaSection: {
    background: 'var(--elab-hex-f0f7ff)',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid var(--elab-navy)',
  },
  securityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    margin: '20px 0',
  },
  securityItem: {
    textAlign: 'center',
    padding: '20px',
    background: 'var(--elab-hex-f8f9fa)',
    borderRadius: '8px',
  },
  securityIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  securityText: {
    fontSize: '14px',
    color: '#555',
    margin: 0,
  },
  certifications: {
    margin: '20px 0',
  },
  emergencyContact: {
    background: 'var(--elab-hex-f8d7da)',
    padding: '16px',
    borderRadius: '8px',
    margin: '20px 0',
  },
  contactSection: {
    margin: '20px 0',
  },
  contactBox: {
    background: 'var(--elab-hex-e8f4fd)',
    padding: '20px',
    borderRadius: '8px',
  },
  contactText: {
    fontSize: '15px',
    lineHeight: '1.7',
    margin: 0,
  },
  authoritySection: {
    margin: '24px 0',
  },
  authorityBox: {
    background: 'var(--elab-hex-f8f9fa)',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  conclusion: {
    background: 'linear-gradient(135deg, var(--elab-hex-d4edda) 0%, var(--elab-hex-e8f4fd) 100%)',
    padding: '32px',
    borderRadius: '12px',
    marginTop: '32px',
    textAlign: 'center',
  },
  conclusionText: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#333',
    margin: 0,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 40px',
    borderTop: '1px solid var(--elab-hex-e0e0e0)',
    flexShrink: 0,
  },
  footerBtn: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--elab-navy)',
    color: 'var(--elab-hex-ffffff)',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Open Sans', sans-serif",
    textDecoration: 'none',
    display: 'inline-block',
  },
};
