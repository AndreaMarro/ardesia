import { useState } from "react";

/*
 * ELAB Tutor — Volume 3 · Proposta fix overflow minuti nei tile esperimento
 *
 * Problema osservato su elabtutor.school (#lavagna, modal "SCEGLI ESPERIMENTO",
 * tab Volume 3 · Arduino): sui tile disposti su una griglia a 4 colonne il testo
 * "~X min" della riga meta viene troncato silenziosamente (senza ellissi visibili,
 * sparisce e basta). La causa è che la riga meta di V3 contiene un chip "ARDUINO"
 * ridondante che ruba ~65-70 px di larghezza, mandando fuori dal bordo destro del
 * tile la parte "~X min".
 *
 * Proposta: adottare per i tile di Volume 3 lo stesso schema di riga meta già in
 * uso per Volume 2, che mostra SOLO [stelle difficoltà] · [N pz] · [~X min] senza
 * il chip "ARDUINO". L'informazione "Arduino" è già data dal tab Volume 3 attivo
 * sopra la griglia, quindi il chip è ridondante e la sua rimozione non fa perdere
 * informazione all'utente.
 *
 * Questa pagina mostra due modal affiancati con gli stessi dati di esperimento:
 *   - A SINISTRA (❌ PRIMA): schema V3 attuale con chip ARDUINO → minuti troncati
 *   - A DESTRA  (✅ DOPO):  schema V2 applicato a V3 → tutto entra nel tile
 *
 * Pixel/tipografia/palette replicati dal sito reale per confronto visivo immediato
 * con uno screenshot del modal live di elabtutor.school.
 */

const C = {
  bg: "#F0F4F8",
  white: "#FFFFFF",
  navy: "#1E4D8C",
  dark: "#1A1A2E",
  muted: "#5A5A6B",
  cardBorder: "#E5E5EA",
  divider: "#D1D1D6",
  red: "#DC2626",
  redLight: "#FEE2E2",
  gold: "#F59E0B",
  green: "#15803D",
  v1green: "#4A7A25",
  v2orange: "#D97706",
  v3red: "#DC2626",
};

const font = {
  h: "Oswald, sans-serif",
  b: "'Open Sans', -apple-system, system-ui, 'Segoe UI', sans-serif",
};

// ─── Stelle di difficoltà ────────────────────────────────────────
function Stars({ value, slots }) {
  return (
    <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
      {Array.from({ length: slots }, (_, i) => (
        <span
          key={i}
          style={{
            color: i < value ? C.gold : C.divider,
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Riga meta — schema V2 (proposto per V3) ─────────────────────
//   [stars(3)] · [N pz] · [~X min]
//   Nessun chip materiale. Identico al componente già in uso in V2.
function MetaRowV2Schema({ difficulty, pieces, minutes }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: font.b,
        fontSize: 12,
        color: C.muted,
      }}
    >
      <Stars value={difficulty} slots={3} />
      <span style={{ flexShrink: 0 }}>{pieces} pz</span>
      <span style={{ flexShrink: 0 }}>~{minutes} min</span>
    </div>
  );
}

// ─── Riga meta — schema V3 attuale (rotto) ──────────────────────
//   [chip ARDUINO] · [stars(4)] · [N pz] · [~X min]
//   overflow:hidden + whiteSpace:nowrap riproduce il troncamento silenzioso
//   visibile sul sito reale.
function MetaRowV3Broken({ difficulty, pieces, minutes }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: font.b,
        fontSize: 12,
        color: C.muted,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          background: C.redLight,
          color: C.red,
          fontSize: 9,
          fontWeight: 700,
          padding: "3px 7px",
          borderRadius: 4,
          flexShrink: 0,
          letterSpacing: ".4px",
        }}
      >
        ARDUINO
      </span>
      <Stars value={difficulty} slots={4} />
      <span style={{ flexShrink: 0 }}>{pieces} pz</span>
      <span style={{ flexShrink: 1, minWidth: 0 }}>~{minutes} min</span>
    </div>
  );
}

// ─── Tile esperimento ───────────────────────────────────────────
function Tile({ title, description, difficulty, pieces, minutes, variant }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 10,
        padding: "14px 14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderLeft: `3px solid ${C.v3red}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: font.h,
          fontWeight: 600,
          fontSize: 14,
          color: C.dark,
          lineHeight: 1.25,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: font.b,
          fontSize: 12,
          color: C.muted,
          lineHeight: 1.35,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {description}
      </div>
      {variant === "broken" ? (
        <MetaRowV3Broken
          difficulty={difficulty}
          pieces={pieces}
          minutes={minutes}
        />
      ) : (
        <MetaRowV2Schema
          difficulty={difficulty}
          pieces={pieces}
          minutes={minutes}
        />
      )}
    </div>
  );
}

// ─── Dati degli esperimenti (estratti dallo screenshot del sito) ─
const DATA = [
  {
    chapter: "CAP. 1 — IL NOSTRO PRIMO PROGRAMMA",
    items: [
      {
        title: "Esp. 1 — Blink con LED_BUILTIN",
        description:
          "Il primo programma in Arduino per far lampeggiare il LED integrato sulla board",
        difficulty: 1,
        pieces: 2,
        minutes: 5,
      },
      {
        title: "Esp. 2 — Modifica tempi del Blink",
        description:
          "Cambiamo i tempi del Blink! Prova a modificare le pause tra accensione e spegnimento",
        difficulty: 1,
        pieces: 2,
        minutes: 6,
      },
    ],
  },
  {
    chapter: "CAP. 2 — I PIN DIGITALI (OUTPUT)",
    items: [
      {
        title: "Esp. 1 — Circuito AND/OR con pulsanti",
        description:
          "Costruiamo un circuito logico con due pulsanti e un LED che si accende secondo le regole",
        difficulty: 1,
        pieces: 6,
        minutes: 10,
      },
      {
        title: "Esp. 2 — Colleghiamo la resistenza",
        description:
          "Colleghiamo un LED esterno al pin digitale con la sua resistenza di protezione",
        difficulty: 1,
        pieces: 4,
        minutes: 8,
      },
      {
        title: "SOS in codice Morse",
        description:
          "Modifichiamo il programma Blink per far lampeggiare il LED in codice Morse SOS",
        difficulty: 3,
        pieces: 4,
        minutes: 10,
      },
      {
        title: "Esp. 3 — Cambia il numero di pin",
        description:
          "Spostiamo il LED su un pin diverso e adeguiamo il codice per farlo funzionare",
        difficulty: 1,
        pieces: 4,
        minutes: 6,
      },
    ],
  },
];

// ─── Tab dei volumi ─────────────────────────────────────────────
function VolumeTabs() {
  const tabs = [
    { n: "Volume 1", sub: "Le Basi", color: C.v1green, active: false },
    { n: "Volume 2", sub: "Approfondiamo", color: C.v2orange, active: false },
    { n: "Volume 3", sub: "Arduino", color: C.v3red, active: true },
  ];
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      {tabs.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            border: `2px solid ${v.color}`,
            background: v.active ? v.color : C.white,
            color: v.active ? C.white : v.color,
            borderRadius: 10,
            padding: "10px 4px",
            textAlign: "center",
            fontFamily: font.b,
            boxShadow: v.active ? "0 2px 6px rgba(220,38,38,0.2)" : "none",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13 }}>{v.n}</div>
          <div style={{ fontSize: 11, opacity: 0.9 }}>{v.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Modal "SCEGLI ESPERIMENTO" ─────────────────────────────────
function Modal({ variant }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 14,
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        padding: "22px 22px 18px",
        border: `1px solid ${C.cardBorder}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: font.h,
            fontWeight: 700,
            fontSize: 16,
            color: C.navy,
            letterSpacing: ".5px",
          }}
        >
          SCEGLI ESPERIMENTO
        </div>
        <div
          style={{
            color: C.muted,
            fontSize: 18,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </div>
      </div>

      <VolumeTabs />

      <div
        style={{
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 8,
          padding: "9px 14px",
          fontFamily: font.b,
          fontSize: 13,
          color: "#94A3B8",
          marginBottom: 14,
        }}
      >
        Cerca esperimento...
      </div>

      {DATA.map((ch, ci) => (
        <div key={ci} style={{ marginBottom: 16 }}>
          <div
            style={{
              fontFamily: font.h,
              fontSize: 11,
              fontWeight: 700,
              color: C.v3red,
              marginBottom: 8,
              letterSpacing: ".5px",
            }}
          >
            {ch.chapter}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {ch.items.map((it, ii) => (
              <Tile key={ii} {...it} variant={variant} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pagina principale (confronto side-by-side) ─────────────────
export default function Vol3TileMetaFix() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: 24,
        fontFamily: font.b,
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: font.h,
            color: C.navy,
            margin: "0 0 8px 0",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          Volume 3 · Proposta fix overflow minuti nei tile esperimento
        </h1>
        <p
          style={{
            color: C.muted,
            margin: "0 0 22px 0",
            fontSize: 13,
            maxWidth: 960,
            lineHeight: 1.5,
          }}
        >
          Confronto visivo tra lo schema attuale della riga meta in Volume 3
          (con chip <code>ARDUINO</code> ridondante che causa troncamento
          silenzioso di <code>~X min</code> sui tile stretti) e lo schema
          proposto, identico a quello già in uso in Volume 2 (senza chip).
          Entrambi i modal usano una griglia a 4 colonne — stessa densità del
          sito reale — e gli stessi dati di esperimento.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: font.h,
                color: C.red,
                fontSize: 15,
                margin: "0 0 10px 0",
                letterSpacing: ".3px",
              }}
            >
              ❌ PRIMA — schema V3 attuale (rotto)
            </h2>
            <Modal variant="broken" />
          </div>
          <div>
            <h2
              style={{
                fontFamily: font.h,
                color: C.green,
                fontSize: 15,
                margin: "0 0 10px 0",
                letterSpacing: ".3px",
              }}
            >
              ✅ DOPO — schema V2 applicato a V3 (fix)
            </h2>
            <Modal variant="fixed" />
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 20,
            background: C.white,
            borderRadius: 12,
            border: `1px solid ${C.cardBorder}`,
            fontSize: 13,
            color: C.dark,
            lineHeight: 1.6,
            maxWidth: 960,
          }}
        >
          <div
            style={{
              fontFamily: font.h,
              fontSize: 15,
              fontWeight: 700,
              color: C.navy,
              marginBottom: 12,
              letterSpacing: ".3px",
            }}
          >
            Riassunto del cambiamento
          </div>
          <div style={{ color: C.muted }}>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: C.dark }}>Cosa togliere:</strong> il chip{" "}
              <code>ARDUINO</code> dalla riga meta del tile esperimento nei
              tile di Volume 3. Usare lo stesso componente <code>MetaRow</code>{" "}
              già condiviso con Volume 2.
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: C.dark }}>Perché è sicuro:</strong> il
              chip è ridondante — siamo già dentro al tab "Volume 3 · Arduino",
              l'informazione "Arduino" è già data dal contesto immediatamente
              sopra la griglia. Nessuna perdita di informazione per l'utente.
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: C.dark }}>Risultato:</strong> la riga
              meta rientra sempre nella larghezza del tile, e i minuti non
              vengono più troncati, anche su griglie a 4 colonne.
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: C.dark }}>Scala difficoltà:</strong> V2
              usa 3 slot di stelle (★☆☆), V3 attualmente ne usa 4 (★☆☆☆).
              Questo prototipo allinea V3 a 3 slot per coerenza visiva — se
              vuoi mantenere la scala a 4 slot di V3, è una modifica di una
              riga ({" "}
              <code>&lt;Stars slots={"{3}"} /&gt;</code> →{" "}
              <code>&lt;Stars slots={"{4}"} /&gt;</code>
              ).
            </div>
            <div>
              <strong style={{ color: C.dark }}>Schema di arrivo:</strong>{" "}
              identico al <code>MetaRow</code> già usato da Volume 2. Zero
              nuovi stili, puro riuso di un componente esistente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
