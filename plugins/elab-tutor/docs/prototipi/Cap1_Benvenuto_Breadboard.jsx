import { useState } from "react";

/*
 * ELAB Tutor — Volume 1 · Capitolo 1 "Benvenuto nella Breadboard"
 *
 * Prototipo pixel-perfect estratto da elabtutor.school.
 * 3 esperimenti che insieme presentano TUTTI i componenti del Volume 1:
 *
 *   Esp 1 — "La Breadboard e la Batteria 9V"
 *       → breadboard-half, battery9v
 *   Esp 2 — "Il LED e il Resistore"
 *       → + resistor (470Ω), led (verde)
 *   Esp 3 — "Tour dei Sensori e Attuatori"
 *       → + push-button, potentiometer, ldr, buzzer-piezo, reed-switch
 *
 * Schema identico al bundle experiments-vol1 del sito reale:
 *   id / title / chapter / difficulty / icon / simulationMode
 *   components[] · buildSteps[] · quiz{} · observe · concept · unlimPrompt
 *
 * Layout identico al sito:
 *   Nav 44px navy blur · Sidebar 140px · Mode tabs (Già Montato / Passo / Percorso)
 *   Breadboard al centro · Floating StepPanel (top:14 right:14 w:290 radius:14)
 *   Toolbar float · StatusBar · PageBar 51px · UnlimBot 48x48 float
 */

const C = {
  navBg: "rgba(30, 77, 140, 0.85)",
  navy: "#1E4D8C",
  dark: "#1A1A2E",
  green: "#4A7A25",
  greenAlpha: "rgba(74, 122, 37, 0.3)",
  greenBgLight: "rgba(74, 122, 37, 0.1)",
  bg: "#F0F4F8",
  white: "#FFFFFF",
  whiteAlpha88: "rgba(255, 255, 255, 0.88)",
  whiteAlpha95: "rgba(255, 255, 255, 0.95)",
  cardBg: "#F8FAFB",
  gray: "#64748B",
  muted: "#5A5A6B",
  border: "#D1D1D6",
  borderBlue: "rgba(30, 77, 140, 0.12)",
  borderLight: "#E5E5EA",
  red: "#DC2626",
  redLight: "#FEE2E2",
  blue: "#2563EB",
  blueLight: "#DBEAFE",
  gold: "#F59E0B",
  goldLight: "#FEF3C7",
};

const font = {
  h: "Oswald, sans-serif",
  b: "'Open Sans', -apple-system, system-ui, 'Segoe UI', sans-serif",
};

// ─── Breadboard SVG (replica del breadboardSnap del sito) ───
function Breadboard({ highlights = [], wires = [], children }) {
  const w = 440, h = 310, hr = 3, g = 12, ox = 28, oy = 26, cols = 30;
  const rows = (letters, startY) => letters.map((l, ri) => {
    const y = startY + ri * g;
    return [
      <text key={`r${l}`} x="14" y={y + 3} textAnchor="middle" fontSize="6" fill="#B0A89A" fontFamily={font.b}>{l}</text>,
      ...Array.from({ length: cols }, (_, ci) => {
        const id = `${l}${ci + 1}`, hl = highlights.find(x => x.id === id), cx = ox + ci * g;
        return (
          <circle key={id} cx={cx} cy={y} r={hr}
            fill={hl ? hl.color : "#555"} stroke={hl ? hl.color : "#777"}
            strokeWidth={hl ? 1.5 : 0.3} opacity={hl ? 1 : 0.4}>
            {hl?.pulse && <animate attributeName="r" values={`${hr};${hr + 2};${hr}`} dur="1.5s" repeatCount="indefinite" />}
          </circle>
        );
      })
    ];
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: 500, display: "block", filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.08))" }}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE5D3" /><stop offset="100%" stopColor="#DDD3BD" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width={w - 4} height={h - 4} rx="8" fill="url(#bg)" stroke="#C4B49A" strokeWidth="1.2" />
      {/* Power rails top */}
      <rect x="10" y={oy - 10} width={w - 20} height={g} rx="2" fill="#FFE0E0" opacity=".35" />
      <text x="16" y={oy - 1} fontSize="7" fill={C.red} fontWeight="bold" fontFamily={font.b}>+</text>
      <rect x="10" y={oy + g - 8} width={w - 20} height={g} rx="2" fill="#DEE8FF" opacity=".35" />
      <text x="16" y={oy + g + 1} fontSize="7" fill={C.blue} fontWeight="bold" fontFamily={font.b}>−</text>
      {/* Col labels */}
      {Array.from({ length: cols }, (_, i) => (
        <text key={`c${i}`} x={ox + i * g} y={oy + g * 2 + 4} textAnchor="middle" fontSize="5" fill="#B0A89A" fontFamily={font.b}>{i + 1}</text>
      ))}
      {/* Rows a-e */}
      {rows(["a", "b", "c", "d", "e"], oy + g * 2.8)}
      {/* Center groove */}
      <rect x="10" y={oy + g * 2.8 + g * 4.6} width={w - 20} height={g * 1.4} rx="3" fill="#D4C7AB" />
      <line x1="10" y1={oy + g * 2.8 + g * 5.3} x2={w - 10} y2={oy + g * 2.8 + g * 5.3} stroke="#C4B49A" strokeWidth=".5" />
      {/* Rows f-j */}
      {rows(["f", "g", "h", "i", "j"], oy + g * 2.8 + g * 6.5)}
      {/* Power rails bottom */}
      <rect x="10" y={h - oy - g + 2} width={w - 20} height={g} rx="2" fill="#FFE0E0" opacity=".35" />
      <text x="16" y={h - oy + 3} fontSize="7" fill={C.red} fontWeight="bold" fontFamily={font.b}>+</text>
      <rect x="10" y={h - oy + 3} width={w - 20} height={g} rx="2" fill="#DEE8FF" opacity=".35" />
      <text x="16" y={h - oy + g + 2} fontSize="7" fill={C.blue} fontWeight="bold" fontFamily={font.b}>−</text>
      {/* Wires */}
      {wires.map((wire, i) => (
        <line key={`w${i}`} x1={wire.x1} y1={wire.y1} x2={wire.x2} y2={wire.y2}
          stroke={wire.color} strokeWidth="2.8" strokeLinecap="round" opacity=".85" />
      ))}
      {children}
    </svg>
  );
}

// ─── Component Sprites (overlays che appaiono sulla/accanto alla breadboard) ───
function SpriteBattery9V({ x = -88, y = 140, label = true }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="52" height="34" rx="4" fill="#1A1A2E" stroke="#000" strokeWidth=".5" />
      <rect x="52" y="5" width="12" height="24" rx="2" fill="#C4833A" stroke="#8B5A2B" strokeWidth=".5" />
      <text x="26" y="22" textAnchor="middle" fontSize="13" fontWeight="700" fill="#FFF" fontFamily={font.b}>9V</text>
      <circle cx="56" cy="11" r="1.8" fill="#FF6B6B" />
      <circle cx="56" cy="24" r="1.8" fill="#4ECDC4" />
      {label && <text x="26" y="46" textAnchor="middle" fontSize="7" fill={C.navy} fontWeight="700" fontFamily={font.b}>Batteria 9V</text>}
    </g>
  );
}

function SpriteResistor({ x, y, bands = ["#E9B52E", "#6B4FD1", "#7A4A2B", "#C9A45E"] }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="-14" y1="5" x2="0" y2="5" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="34" y1="5" x2="48" y2="5" stroke="#C0C0C0" strokeWidth="1.5" />
      <rect x="0" y="0" width="34" height="10" rx="4" fill="#E6C9A3" stroke="#8B6A3E" strokeWidth=".5" />
      {bands.map((c, i) => (
        <rect key={i} x={5 + i * 6} y="0" width="3" height="10" fill={c} />
      ))}
    </g>
  );
}

function SpriteLED({ x, y, color = "#3CE074", on = false }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="4" y1="12" x2="4" y2="24" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="12" y1="12" x2="12" y2="22" stroke="#C0C0C0" strokeWidth="1.5" />
      <ellipse cx="8" cy="8" rx="8" ry="9" fill={color} stroke="#2A7A45" strokeWidth=".6" opacity={on ? 1 : .85} />
      <ellipse cx="5" cy="5" rx="2" ry="2.5" fill="#FFF" opacity=".5" />
      {on && (
        <circle cx="8" cy="8" r="14" fill={color} opacity=".35">
          <animate attributeName="opacity" values=".15;.45;.15" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

function SpritePushButton({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width="26" height="26" rx="3" fill="#E8E8EC" stroke="#666" strokeWidth=".7" />
      <circle cx="13" cy="13" r="7" fill="#1A1A2E" stroke="#000" strokeWidth=".5" />
      <circle cx="13" cy="13" r="5" fill="#4A4A5E" />
      <line x1="-3" y1="5" x2="0" y2="5" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="-3" y1="21" x2="0" y2="21" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="26" y1="5" x2="29" y2="5" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="26" y1="21" x2="29" y2="21" stroke="#C0C0C0" strokeWidth="1.5" />
    </g>
  );
}

function SpritePotentiometer({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="4" width="28" height="22" rx="2" fill="#2A60BA" stroke="#1A3A6F" strokeWidth=".5" />
      <circle cx="14" cy="14" r="10" fill="#4A80DA" stroke="#1A3A6F" strokeWidth=".5" />
      <line x1="14" y1="14" x2="14" y2="5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="30" x2="4" y2="34" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="14" y1="30" x2="14" y2="34" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="24" y1="30" x2="24" y2="34" stroke="#C0C0C0" strokeWidth="1.5" />
    </g>
  );
}

function SpriteLDR({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="12" cy="12" r="11" fill="#F8E8A8" stroke="#8B6A3E" strokeWidth=".8" />
      <path d="M 3 12 L 7 8 L 9 14 L 13 8 L 15 14 L 19 8 L 21 12" fill="none" stroke="#1A1A2E" strokeWidth="1.3" />
      <line x1="4" y1="22" x2="4" y2="28" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="20" y1="22" x2="20" y2="28" stroke="#C0C0C0" strokeWidth="1.5" />
      <text x="28" y="9" fontSize="8" fill={C.gold}>☀</text>
    </g>
  );
}

function SpriteBuzzer({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="14" cy="14" r="13" fill="#1A1A1A" stroke="#000" strokeWidth=".6" />
      <circle cx="14" cy="14" r="9" fill="#2A2A2A" />
      <circle cx="14" cy="14" r="1.5" fill="#888" />
      <text x="20" y="12" fontSize="7" fill="#AAA" fontWeight="700">+</text>
      <line x1="8" y1="26" x2="8" y2="32" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="20" y1="26" x2="20" y2="32" stroke="#C0C0C0" strokeWidth="1.5" />
    </g>
  );
}

function SpriteReedSwitch({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="22" cy="8" rx="22" ry="6" fill="#E8F0F8" stroke="#9BB5CC" strokeWidth=".6" opacity=".85" />
      <line x1="4" y1="8" x2="18" y2="8" stroke="#AAA" strokeWidth="1" />
      <line x1="26" y1="8" x2="40" y2="8" stroke="#AAA" strokeWidth="1.2" />
      <line x1="-6" y1="8" x2="4" y2="8" stroke="#C0C0C0" strokeWidth="1.5" />
      <line x1="40" y1="8" x2="50" y2="8" stroke="#C0C0C0" strokeWidth="1.5" />
    </g>
  );
}

// ─── UNLIM Chat Bubble ───
function Unlim({ message }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "8px 10px", background: C.cardBg, borderRadius: 10, border: `1px solid ${C.borderLight}` }}>
      <div style={{
        width: 30, height: 30, borderRadius: 10, background: C.navy, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        border: `1.5px solid ${C.greenAlpha}`,
      }}>🤖</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.navy, fontFamily: font.h, textTransform: "uppercase", letterSpacing: .8 }}>UNLIM dice:</div>
        <div style={{ fontSize: 12, color: C.dark, fontFamily: font.b, lineHeight: 1.5, marginTop: 2 }}>{message}</div>
      </div>
    </div>
  );
}

// ─── Hint Box ───
function HintBox({ icon, title, children, v = "info" }) {
  const map = {
    info: { bg: C.blueLight, bd: "#93C5FD", c: C.navy },
    success: { bg: C.greenBgLight, bd: C.greenAlpha, c: C.green },
    warning: { bg: C.goldLight, bd: "#FCD34D", c: "#92400E" },
    error: { bg: C.redLight, bd: "#FCA5A5", c: C.red },
  };
  const s = map[v];
  return (
    <div style={{ padding: "8px 10px", borderRadius: 8, background: s.bg, border: `1px solid ${s.bd}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: s.c, fontFamily: font.b, marginBottom: 2 }}>{icon} {title}</div>
      <div style={{ fontSize: 11, color: C.dark, fontFamily: font.b, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

// ─── Badge ───
function Badge({ emoji, label, on }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      padding: "10px 6px", borderRadius: 10, width: 84, textAlign: "center",
      background: on ? C.greenBgLight : "#F1F5F9",
      border: `2px solid ${on ? C.green : C.borderLight}`,
      opacity: on ? 1 : .4, transition: "all .5s",
    }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{ fontSize: 9, fontWeight: 600, color: on ? C.green : C.gray, fontFamily: font.b }}>{label}</span>
    </div>
  );
}

// ─── Buttons (exact from site) ───
function BtnAvanti({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#9CA3AF" : C.navy, color: C.white,
      border: `1px solid ${disabled ? "#9CA3AF" : C.navy}`,
      borderRadius: 8, padding: "0 24px", height: 48, fontSize: 15, fontWeight: 700,
      fontFamily: font.b, cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
    }}>
      {children} <span style={{ fontSize: 15 }}>→</span>
    </button>
  );
}

function BtnIndietro({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: C.white, color: "#555", border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "0 16px", height: 48, fontSize: 15, fontWeight: 400,
      fontFamily: font.b, cursor: "pointer", display: "inline-flex",
      alignItems: "center", gap: 6, whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 14 }}>←</span> {children}
    </button>
  );
}

function BtnGreen({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: C.green, color: C.white, border: "none", borderRadius: 10,
      padding: "12px 32px", fontSize: 15, fontWeight: 700, fontFamily: font.b,
      cursor: "pointer", boxShadow: "0 4px 14px rgba(74,122,37,.3)",
    }}>
      {children}
    </button>
  );
}

// ─── Nav Bar (replica esatta del sito) ───
function Nav({ title }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", height: 44, padding: "0 12px",
      background: C.navBg, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,.1)", fontFamily: font.b, flexShrink: 0,
    }}>
      <span style={{ fontSize: 18, marginRight: 4 }}>🤖</span>
      <span style={{ fontFamily: font.h, fontSize: 16, fontWeight: 600, color: C.white, letterSpacing: 1 }}>ELAB</span>
      {["Lavagna", "Classe", "Progressi"].map((t, i) => (
        <span key={t} style={{
          color: i === 0 ? "white" : "rgba(255,255,255,.78)",
          fontSize: 12, fontWeight: 600, marginLeft: i === 0 ? 20 : 16, cursor: "pointer",
        }}>{t}</span>
      ))}
      <div style={{ flex: 1, textAlign: "center" }}>
        <span style={{ color: "rgba(255,255,255,.85)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{title}</span>
      </div>
      <span style={{ color: "rgba(255,255,255,.78)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📄 Manuale</span>
      <span style={{ color: "rgba(255,255,255,.78)", fontSize: 12, fontWeight: 600, marginLeft: 10, cursor: "pointer" }}>▶ Video</span>
    </div>
  );
}

// ─── Sidebar (palette componenti Vol 1 — evidenzia quelli attivi nell'esperimento) ───
function Sidebar({ activeComponents = [] }) {
  const items = [
    { id: "led", name: "LED", icon: "🟢" },
    { id: "resistor", name: "Resistore", icon: "🟫" },
    { id: "button", name: "Pulsante", icon: "🔘" },
    { id: "battery", name: "Batteria 9V", icon: "🔋" },
    { id: "pot", name: "Potenziom...", icon: "🎚️" },
    { id: "buzzer", name: "Buzzer", icon: "⚫" },
    { id: "ldr", name: "LDR", icon: "🟡" },
    { id: "reed", name: "Reed Switch", icon: "⏺" },
  ];
  return (
    <div style={{ width: 140, background: C.white, flexShrink: 0, padding: "10px 6px", overflowY: "auto" }}>
      <div style={{ fontFamily: font.h, fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 1, padding: "2px 4px 8px" }}>
        COMPONENTI
      </div>
      {items.map((it, i) => {
        const on = activeComponents.includes(it.id);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8, height: 48,
            padding: "4px 6px", borderRadius: 8,
            background: on ? C.greenBgLight : C.white,
            border: `${on ? 2 : 1}px solid ${on ? C.green : C.borderBlue}`,
            marginBottom: 4, cursor: "pointer",
            fontSize: 13, color: on ? C.green : C.navy,
            fontWeight: on ? 700 : 500, fontFamily: font.b,
            transition: "all .3s",
          }}>
            <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{it.icon}</span>
            {it.name}
          </div>
        );
      })}
    </div>
  );
}

// ─── Mode Tabs (Già Montato / Passo Passo / Percorso) ───
function Tabs({ active, onChange }) {
  const tabs = [
    { id: "montato", icon: "🔧", label: "Già Montato" },
    { id: "passo", icon: "👣", label: "Passo Passo" },
    { id: "percorso", icon: "🎨", label: "Percorso" },
  ];
  return (
    <div style={{
      display: "inline-flex", background: C.white, borderRadius: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: `1px solid ${C.borderLight}`,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        return (
          <div key={t.id} onClick={() => onChange && onChange(t.id)} style={{
            padding: "8px 24px", fontSize: 15, fontWeight: on ? 700 : 500,
            fontFamily: font.b, cursor: "pointer",
            color: on ? C.white : C.muted,
            background: on ? C.green : "transparent",
            borderRadius: on ? 10 : 0,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
          </div>
        );
      })}
    </div>
  );
}

// ─── Floating Toolbar ───
function Toolbar() {
  return (
    <div style={{
      position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
      background: C.whiteAlpha88, borderRadius: 12,
      boxShadow: "rgba(0,0,0,.1) 0 4px 20px",
    }}>
      <span style={{ fontSize: 12, color: C.muted, fontFamily: font.b, padding: "4px 10px", border: `1px solid ${C.borderLight}`, borderRadius: 6 }}>Filo</span>
      <span style={{ fontSize: 13, color: C.muted, padding: "4px 8px", border: `1px solid ${C.borderLight}`, borderRadius: 6, cursor: "pointer" }}>+</span>
      <span style={{ fontSize: 12, color: C.muted, fontFamily: font.b, padding: "2px 4px", minWidth: 34, textAlign: "center" }}>100%</span>
      <span style={{ fontSize: 13, color: C.muted, padding: "4px 8px", border: `1px solid ${C.borderLight}`, borderRadius: 6, cursor: "pointer" }}>−</span>
      <div style={{ width: 8 }} />
      <div style={{
        width: 36, height: 36, borderRadius: "50%", background: C.green,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: "0 2px 6px rgba(74,122,37,.3)",
      }}>
        <span style={{ color: C.white, fontSize: 13, marginLeft: 2 }}>▶</span>
      </div>
      <div style={{ width: 8 }} />
      {["↗", "🗑", "↩", "↪", "✏️"].map((ic, i) => (
        <div key={i} style={{ width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted, fontSize: 14 }}>
          {ic}
        </div>
      ))}
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{
      position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)",
      fontSize: 11, color: C.gray, fontFamily: font.b, whiteSpace: "nowrap",
    }}>
      bb1 — ↻ ruota · × elimina · Esc deseleziona · click = toggle
    </div>
  );
}

function PageBar({ current, total }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "3px 8px", height: 51, background: C.whiteAlpha95, flexShrink: 0,
    }}>
      <span style={{ fontSize: 18, color: C.gray, cursor: "pointer", padding: "0 8px" }}>‹</span>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", background: C.navy,
        color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
      }}>{current}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18, color: C.gray, cursor: "pointer" }}>›</span>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", border: `1.5px dashed ${C.borderBlue}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.navy, fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>+</div>
        <span style={{ fontSize: 12, color: C.gray, fontFamily: font.b }}>{current} / {total}</span>
      </div>
    </div>
  );
}

function UnlimBot() {
  return (
    <div style={{
      position: "absolute", bottom: 68, right: 12,
      width: 48, height: 48, borderRadius: 16,
      background: C.whiteAlpha95, border: `2px solid ${C.greenAlpha}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "rgba(30,77,140,.15) 0 4px 20px, rgba(74,122,37,.15) 0 2px 8px",
      cursor: "pointer", fontSize: 24, zIndex: 5,
    }}>
      🤖
    </div>
  );
}

function StepPanel({ children }) {
  return (
    <div style={{
      position: "absolute", top: 14, right: 14, width: 290,
      bottom: 108, background: C.white, borderRadius: 14,
      boxShadow: "rgba(0,0,0,.07) 0 10px 20px, rgb(229,229,234) 0 0 0 1px",
      padding: "12px 14px", overflowY: "auto",
      display: "flex", flexDirection: "column", gap: 10,
      zIndex: 10,
    }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// EXPERIMENTS — 3 esperimenti che insieme presentano tutti i componenti
//               del Volume 1. Schema identico a experiments-vol1.
// ══════════════════════════════════════════════════════════════════════
const EXPERIMENTS = [
  // ─────────── ESP 1 ───────────
  {
    id: "v1-cap1-esp1",
    num: 1,
    icon: "🔌",
    title: "La Breadboard e la Batteria",
    subtitle: "Benvenuto nella tua base di lavoro",
    difficulty: 1,
    duration: "~8 min",
    pieces: 2,
    components: ["breadboard-half", "battery9v"],
    activeComponents: ["battery"],
    introText: "Scopri la breadboard: righe, colonne, canale centrale e bus di alimentazione. Poi collega la tua prima batteria 9V.",
    steps: [
      { text: "Osserva la breadboard al centro del piano di lavoro. Ha 30 colonne numerate e due blocchi di righe: a-e in alto e f-j in basso.", hint: "Ogni foro è un punto di collegamento. Non serve saldare nulla!" },
      { text: "Guarda le strisce ROSSE in alto e in basso: sono i BUS + (positivo). Tutti i fori lungo una striscia sono collegati tra loro.", hint: "Il bus + è la tua 'autostrada' per portare l'energia ovunque sulla breadboard." },
      { text: "Guarda le strisce BLU: sono i BUS − (negativo). Anche questi sono collegati per tutta la lunghezza.", hint: "Il bus − chiude il circuito riportando la corrente alla batteria." },
      { text: "Ogni colonna di 5 fori è internamente collegata: A5, B5, C5, D5 ed E5 sono lo stesso punto elettrico. Il canale centrale divide a-e da f-j.", hint: "È come se ogni colonna avesse un cavo nascosto sotto che unisce i 5 fori." },
      { text: "Prendi la BATTERIA 9V dalla palette a sinistra e posizionala accanto alla breadboard. Collega un filo ROSSO dal + al bus + (col 1) e un filo NERO dal − al bus − (col 1).", hint: "Rosso = positivo, nero = negativo: è la convenzione universale dell'elettronica." },
    ],
    unlimMessages: [
      "Benvenuto! Sono UNLIM, il tuo tutor AI. Prima di costruire qualsiasi circuito dobbiamo conoscere la breadboard: è la protagonista del Volume 1!",
      "Le strisce + e − corrono lungo tutta la breadboard. Le userai SEMPRE per portare l'alimentazione ai componenti.",
      "Perché due strisce − (sopra e sotto)? Per comodità: così puoi collegarti al negativo da entrambi i lati senza fili lunghi.",
      "Il trucco della breadboard: 5 fori in colonna = 1 solo punto elettrico. Ti risparmia tantissimi fili nei circuiti complessi!",
      "Ora la breadboard è alimentata: bus + a 9V, bus − a massa. Sei pronto per il tuo primo circuito nel prossimo esperimento!",
    ],
    quiz: {
      question: "Due fili infilati in B3 e D3: sono collegati tra loro?",
      options: [
        { text: "Sì: stessa colonna (3), stessa sezione (a-e) → stesso punto elettrico", correct: true },
        { text: "No: B e D sono righe diverse, quindi sono punti separati", correct: false },
        { text: "Solo se aggiungo un ponticello tra i due fori", correct: false },
      ],
      explanation: "A3-B3-C3-D3-E3 sono tutti collegati internamente. Ogni colonna di 5 fori (nella stessa sezione) è un unico nodo elettrico.",
      retryHint: "Ricorda: la breadboard collega i 5 fori di ogni colonna nella stessa sezione.",
    },
    quizSuccessMessage: "Bravissimo! Hai capito il principio fondamentale della breadboard. Ora sei pronto per il vero circuito: accendere un LED!",
    montatoDesc: "La batteria 9V è collegata: filo rosso dal + al bus + superiore e filo nero dal − al bus − superiore. La breadboard è sotto tensione.",
    montatoHint: "Nota come il bus + superiore è ora energizzato: qualsiasi foro lungo quella striscia sarà a +9V.",
    montatoUnlim: "Questa modalità ti mostra il circuito già fatto. È come vedere la ricetta del piatto finito. Quando sei pronto, passa a Passo Passo!",
    completeMessage: "Ottimo! Hai collegato la tua prima batteria. Nel prossimo esperimento accenderemo un LED con un resistore di protezione.",
    learned: [
      "Come è fatta una breadboard: colonne, righe, canale centrale",
      "A cosa servono i BUS + e − (alimentazione)",
      "Che i 5 fori di ogni colonna sono collegati tra loro",
      "Come collegare la batteria 9V alla breadboard",
    ],
  },
  // ─────────── ESP 2 ───────────
  {
    id: "v1-cap1-esp2",
    num: 2,
    icon: "💡",
    title: "Il LED e il Resistore",
    subtitle: "Il tuo primo circuito acceso",
    difficulty: 1,
    duration: "~10 min",
    pieces: 4,
    components: ["breadboard-half", "battery9v", "resistor", "led"],
    activeComponents: ["battery", "resistor", "led"],
    introText: "Accendi il tuo PRIMO LED! Imparerai perché serve sempre un resistore di protezione e come riconoscere + e − di un LED.",
    steps: [
      { text: "La breadboard è già alimentata dall'esperimento precedente: bus + a 9V, bus − a massa. Ora aggiungiamo il primo circuito!", hint: "Riparti sempre dai bus + e −: sono la fonte di energia per tutti i componenti." },
      { text: "Prendi il RESISTORE da 470Ω dalla palette. Lo riconosci dalle strisce colorate: giallo-viola-marrone-oro. È il componente più importante del Volume 1!", hint: "Il resistore LIMITA la corrente. Senza di lui il LED si brucia in un istante." },
      { text: "Inserisci il resistore con un capo nel BUS + superiore e l'altro capo in A10. I capi del resistore devono essere in due punti elettrici diversi!", hint: "Il resistore non ha verso: puoi metterlo in entrambi i sensi." },
      { text: "Prendi il LED verde. Ha due zampe: quella LUNGA è l'anodo (+) e quella CORTA è il catodo (−). Il verso è fondamentale!", hint: "Zampa lunga = positivo, zampa corta = negativo. Se lo metti al contrario, non si accende." },
      { text: "Inserisci il LED: anodo (lunga) in E10 (stessa colonna del resistore, quindi collegato) e catodo (corta) in E12.", hint: "Ricorda: A10-B10-C10-D10-E10 sono tutti lo stesso nodo, quindi il LED è già collegato al resistore." },
      { text: "Collega un filo NERO da E12 al bus − inferiore. Clicca ▶ in basso: il LED si accende verde! Hai costruito il tuo primo circuito acceso 🎉", hint: "Il circuito è: + batteria → resistore → LED → − batteria. Chiuso = corrente scorre = LED acceso!" },
    ],
    unlimMessages: [
      "Torniamo in pista! La breadboard è già alimentata e ora useremo quei bus + e − per far accendere qualcosa.",
      "Il resistore è il 'bodyguard' del LED: senza di lui la corrente sarebbe troppo alta e il LED brucerebbe in pochi secondi.",
      "Infilando il resistore tra bus + e colonna 10 stai creando un 'ponte' tra la sorgente di energia e il punto dove arriverà il LED.",
      "Il LED è un DIODO: lascia passare la corrente solo in un verso. Per questo il lato lungo (+) deve andare verso il positivo.",
      "Perfetto, ora il LED è 'in serie' con il resistore: la corrente passa PRIMA nel resistore e POI nel LED. Quasi fatto!",
      "Il LED è acceso! Hai appena costruito il circuito più classico dell'elettronica: una resistenza in serie con un LED. Bravo!",
    ],
    quiz: {
      question: "Perché dobbiamo SEMPRE mettere un resistore in serie con un LED?",
      options: [
        { text: "Per limitare la corrente e proteggere il LED dal bruciarsi", correct: true },
        { text: "Per rendere il LED più luminoso", correct: false },
        { text: "Perché altrimenti il LED non si accende affatto", correct: false },
      ],
      explanation: "Il LED è un diodo: collegato direttamente a 9V assorbe troppa corrente e si brucia. Il resistore da 470Ω limita la corrente a ~18 mA, un valore sicuro.",
      retryHint: "Pensa a cosa succede se passa TROPPA corrente in un componente piccolo e delicato.",
    },
    quizSuccessMessage: "Esatto! La regola d'oro: LED → sempre con resistore. Questo principio tornerà in quasi tutti i circuiti del Volume 1.",
    montatoDesc: "Circuito completo: bus + → resistore 470Ω → LED verde → bus −. Il LED è acceso e la corrente circola a circa 18 mA.",
    montatoHint: "Il LED verde richiede circa 2V: il resistore assorbe i restanti 7V (= 9V − 2V) e limita la corrente.",
    montatoUnlim: "Questo è il 'Ciao mondo' dell'elettronica. Ogni circuito con LED che vedrai avrà questa stessa struttura di base.",
    completeMessage: "Il tuo primo LED è acceso! Nel prossimo esperimento faremo un tour dei sensori e degli attuatori: pulsante, potenziometro, LDR, buzzer e reed switch.",
    learned: [
      "Cos'è un resistore e come riconoscerlo dalle strisce",
      "Perché il LED ha bisogno di un resistore in serie",
      "Come distinguere anodo (+) e catodo (−) di un LED",
      "Come si chiude un circuito: + → componenti → −",
    ],
  },
  // ─────────── ESP 3 ───────────
  {
    id: "v1-cap1-esp3",
    num: 3,
    icon: "🎛️",
    title: "Tour dei Sensori e Attuatori",
    subtitle: "Conosci tutti i componenti del Volume 1",
    difficulty: 1,
    duration: "~12 min",
    pieces: 5,
    components: ["push-button", "potentiometer", "photo-resistor", "buzzer-piezo", "reed-switch"],
    activeComponents: ["button", "pot", "ldr", "buzzer", "reed"],
    introText: "Un tour guidato dei 5 componenti rimanenti del Volume 1: pulsante, potenziometro, LDR, buzzer e reed switch. Impari cosa sono e a cosa servono.",
    steps: [
      { text: "Il PULSANTE (push-button) è un interruttore momentaneo: si chiude solo mentre lo tieni premuto. Ha 4 zampe, collegate a due a due.", hint: "Si usa per 'dire' al circuito QUANDO accendere qualcosa: pulsante premuto → LED acceso." },
      { text: "Il POTENZIOMETRO è una resistenza VARIABILE: ruoti la manopola e la resistenza cambia da 0 a 10kΩ. Ha 3 zampe: due estremi + 1 centrale (cursore).", hint: "Perfetto per regolare volume, luminosità o velocità in modo graduale." },
      { text: "La LDR (Light Dependent Resistor) è una resistenza sensibile alla LUCE: al buio ~200kΩ, in piena luce ~2kΩ. È un fotoresistore.", hint: "Con la LDR puoi costruire un lampione automatico: si accende solo quando fa buio!" },
      { text: "Il BUZZER PIEZO produce un SUONO quando gli arriva corrente. Ha 2 zampe (+ e −): rispetta la polarità come con il LED.", hint: "Lo userai per allarmi, melodie e feedback sonori. È 'l'altoparlante' del Volume 1." },
      { text: "Il REED SWITCH è un interruttore MAGNETICO: due lamelle dentro un tubo di vetro che si chiudono quando avvicini un magnete. 2 zampe.", hint: "Perfetto per sensori antifurto su porte e finestre: magnete sulla porta, reed sul telaio." },
    ],
    unlimMessages: [
      "Ora facciamo un tour dei componenti di INPUT: quelli che ricevono un comando dall'utente o dall'ambiente. Cominciamo dal pulsante!",
      "Il potenziometro è un tuo grande amico: è il modo più semplice per aggiungere un 'regolatore' a un circuito. Lo vedrai tantissime volte.",
      "La LDR è un sensore 'passivo': non ha bisogno di corrente per funzionare, cambia semplicemente la sua resistenza in base alla luce.",
      "Il buzzer piezo è il nostro componente di OUTPUT sonoro. Insieme al LED (output luminoso) può dare feedback completi al bambino.",
      "Il reed switch è l'ultimo componente del Volume 1! Con questi 8 componenti puoi costruire tutti i 38 circuiti de Le Basi.",
    ],
    quiz: {
      question: "Vuoi costruire un antifurto che rileva quando una porta viene aperta. Quale componente scegli?",
      options: [
        { text: "Reed switch con un magnete attaccato alla porta", correct: true },
        { text: "Potenziometro da 10 kΩ montato sul telaio", correct: false },
        { text: "LDR puntata verso la porta", correct: false },
      ],
      explanation: "Il reed switch è un sensore magnetico: attacchi il magnete alla porta e il reed al telaio. Quando la porta è chiusa i due sono vicini e il reed conduce; quando si apre i due si allontanano e il circuito si apre → allarme!",
      retryHint: "Pensa a quale componente si attiva quando gli avvicini un magnete.",
    },
    quizSuccessMessage: "Perfetto! Ora conosci tutti i componenti del Volume 1. Nei prossimi capitoli li userai uno alla volta per costruire circuiti sempre più interessanti.",
    montatoDesc: "I 5 componenti del tour sono disposti sopra la breadboard: pulsante, potenziometro, LDR, buzzer e reed switch. Ognuno con la sua funzione specifica.",
    montatoHint: "Input (pulsante, potenziometro, LDR, reed) → decidono QUANDO accendere qualcosa. Output (buzzer, LED) → fanno succedere qualcosa.",
    montatoUnlim: "Osserva bene: ogni componente ha una forma diversa, che ti aiuterà a riconoscerlo al volo. Memorizzali, tornano nei prossimi capitoli!",
    completeMessage: "Hai completato il tour! Ora conosci tutti gli 8 componenti del Volume 1 e sei pronto per i circuiti veri del Capitolo 2.",
    learned: [
      "Cos'è un pulsante e quando si 'chiude'",
      "Come funziona un potenziometro (resistenza variabile)",
      "Come la LDR reagisce alla luce",
      "Come il buzzer piezo produce suoni",
      "Come il reed switch si attiva con un magnete",
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════
// BREADBOARD OVERLAY RENDERER — mostra il contesto visivo corretto in
// base a (esperimento, step, modalità, fase)
// ══════════════════════════════════════════════════════════════════════
function renderExpOverlay(expIdx, stepIdx, mode, phase) {
  // ─── ESP 1 · Breadboard + Batteria ───
  if (expIdx === 0) {
    if (mode === "montato") {
      return (
        <Breadboard
          highlights={[{ id: "a1", color: C.red, pulse: true }]}
          wires={[
            { x1: 74, y1: 140, x2: 40, y2: 18, color: C.red },
            { x1: 74, y1: 153, x2: 40, y2: 292, color: "#333" },
          ]}
        >
          <SpriteBattery9V x={-90} y={138} />
        </Breadboard>
      );
    }
    if (mode === "percorso") return <Breadboard />;
    if (phase === "quiz") {
      return (
        <Breadboard highlights={[
          { id: "b3", color: C.gold, pulse: true },
          { id: "d3", color: C.gold, pulse: true },
        ]} />
      );
    }
    switch (stepIdx) {
      case 0: return <Breadboard />;
      case 1:
        return (
          <Breadboard>
            <rect x="10" y="14" width="420" height="14" rx="2" fill={C.red} opacity=".22">
              <animate attributeName="opacity" values=".1;.35;.1" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="10" y="277" width="420" height="14" rx="2" fill={C.red} opacity=".22">
              <animate attributeName="opacity" values=".1;.35;.1" dur="2s" repeatCount="indefinite" />
            </rect>
          </Breadboard>
        );
      case 2:
        return (
          <Breadboard>
            <rect x="10" y="28" width="420" height="14" rx="2" fill={C.blue} opacity=".22">
              <animate attributeName="opacity" values=".1;.35;.1" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="10" y="291" width="420" height="14" rx="2" fill={C.blue} opacity=".22">
              <animate attributeName="opacity" values=".1;.35;.1" dur="2s" repeatCount="indefinite" />
            </rect>
          </Breadboard>
        );
      case 3:
        return (
          <Breadboard highlights={[
            { id: "a5", color: C.green, pulse: true },
            { id: "b5", color: C.green, pulse: true },
            { id: "c5", color: C.green, pulse: true },
            { id: "d5", color: C.green, pulse: true },
            { id: "e5", color: C.green, pulse: true },
          ]}>
            <rect x={28 + 4 * 12 - 5} y="66" width="10" height="62" rx="3" fill={C.green} opacity=".18" />
          </Breadboard>
        );
      case 4:
        return (
          <Breadboard
            highlights={[{ id: "a1", color: C.red, pulse: true }]}
            wires={[
              { x1: 74, y1: 140, x2: 40, y2: 18, color: C.red },
              { x1: 74, y1: 153, x2: 40, y2: 292, color: "#333" },
            ]}
          >
            <SpriteBattery9V x={-90} y={138} />
          </Breadboard>
        );
      default: return <Breadboard />;
    }
  }

  // ─── ESP 2 · LED + Resistore ───
  if (expIdx === 1) {
    const finalCircuit = (
      <Breadboard
        highlights={[
          { id: "a10", color: C.red, pulse: false },
          { id: "e10", color: C.red, pulse: false },
          { id: "e12", color: "#333", pulse: false },
        ]}
        wires={[
          { x1: 74, y1: 140, x2: 40, y2: 18, color: C.red },
          { x1: 170, y1: 153, x2: 40, y2: 292, color: "#333" },
        ]}
      >
        <SpriteBattery9V x={-90} y={138} />
        <SpriteResistor x={120} y={14} />
        <SpriteLED x={155} y={76} color="#3CE074" on={true} />
      </Breadboard>
    );

    if (mode === "montato") return finalCircuit;
    if (mode === "percorso") return <Breadboard />;
    if (phase === "quiz") {
      return (
        <Breadboard>
          <SpriteResistor x={120} y={14} />
          <SpriteLED x={155} y={76} color="#3CE074" on={true} />
        </Breadboard>
      );
    }

    switch (stepIdx) {
      case 0:
        return (
          <Breadboard
            highlights={[{ id: "a1", color: C.red }]}
            wires={[
              { x1: 74, y1: 140, x2: 40, y2: 18, color: C.red },
              { x1: 74, y1: 153, x2: 40, y2: 292, color: "#333" },
            ]}
          >
            <SpriteBattery9V x={-90} y={138} />
          </Breadboard>
        );
      case 1:
        return (
          <Breadboard>
            <SpriteBattery9V x={-90} y={138} />
            <SpriteResistor x={180} y={150} />
            <circle cx="200" cy="155" r="18" fill={C.gold} opacity=".25">
              <animate attributeName="opacity" values=".15;.45;.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </Breadboard>
        );
      case 2:
        return (
          <Breadboard
            highlights={[
              { id: "a10", color: C.red, pulse: true },
              { id: "e10", color: C.green, pulse: true },
            ]}
            wires={[
              { x1: 74, y1: 140, x2: 40, y2: 18, color: C.red },
              { x1: 74, y1: 153, x2: 40, y2: 292, color: "#333" },
            ]}
          >
            <SpriteBattery9V x={-90} y={138} />
            <SpriteResistor x={120} y={14} />
          </Breadboard>
        );
      case 3:
        return (
          <Breadboard>
            <SpriteBattery9V x={-90} y={138} />
            <SpriteResistor x={120} y={14} />
            <SpriteLED x={260} y={140} color="#3CE074" on={false} />
            <circle cx="268" cy="148" r="20" fill={C.gold} opacity=".3">
              <animate attributeName="opacity" values=".15;.45;.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </Breadboard>
        );
      case 4:
        return (
          <Breadboard
            highlights={[
              { id: "e10", color: C.red, pulse: true },
              { id: "e12", color: "#333", pulse: true },
            ]}
            wires={[
              { x1: 74, y1: 140, x2: 40, y2: 18, color: C.red },
            ]}
          >
            <SpriteBattery9V x={-90} y={138} />
            <SpriteResistor x={120} y={14} />
            <SpriteLED x={155} y={76} color="#3CE074" on={false} />
          </Breadboard>
        );
      case 5:
        return finalCircuit;
      default: return <Breadboard />;
    }
  }

  // ─── ESP 3 · Tour dei sensori ───
  if (expIdx === 2) {
    const tourAll = (
      <Breadboard>
        <SpritePushButton x={20} y={-6} />
        <SpritePotentiometer x={70} y={-10} />
        <SpriteLDR x={130} y={-6} />
        <SpriteBuzzer x={180} y={-10} />
        <SpriteReedSwitch x={240} y={-2} />
      </Breadboard>
    );

    if (mode === "montato") return tourAll;
    if (mode === "percorso") return <Breadboard />;
    if (phase === "quiz") {
      return (
        <Breadboard>
          <SpriteReedSwitch x={180} y={140} />
          <g transform="translate(160,160)">
            <rect x="0" y="0" width="18" height="26" rx="2" fill="#C62828" stroke="#8E1A1A" strokeWidth=".5" />
            <text x="9" y="17" textAnchor="middle" fontSize="9" fontWeight="700" fill="#FFF" fontFamily={font.b}>N</text>
          </g>
        </Breadboard>
      );
    }

    switch (stepIdx) {
      case 0:
        return (
          <Breadboard>
            <SpritePushButton x={180} y={140} />
            <circle cx="193" cy="153" r="24" fill={C.gold} opacity=".3">
              <animate attributeName="opacity" values=".15;.45;.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </Breadboard>
        );
      case 1:
        return (
          <Breadboard>
            <SpritePotentiometer x={180} y={135} />
            <circle cx="194" cy="150" r="26" fill={C.gold} opacity=".3">
              <animate attributeName="opacity" values=".15;.45;.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </Breadboard>
        );
      case 2:
        return (
          <Breadboard>
            <SpriteLDR x={180} y={140} />
            <circle cx="192" cy="152" r="24" fill={C.gold} opacity=".3">
              <animate attributeName="opacity" values=".15;.45;.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </Breadboard>
        );
      case 3:
        return (
          <Breadboard>
            <SpriteBuzzer x={180} y={135} />
            <circle cx="194" cy="150" r="26" fill={C.gold} opacity=".3">
              <animate attributeName="opacity" values=".15;.45;.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </Breadboard>
        );
      case 4:
        return (
          <Breadboard>
            <SpriteReedSwitch x={165} y={150} />
            <circle cx="195" cy="158" r="30" fill={C.gold} opacity=".3">
              <animate attributeName="opacity" values=".15;.45;.15" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </Breadboard>
        );
      default: return tourAll;
    }
  }

  return <Breadboard />;
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Cap. 1 "Benvenuto nella Breadboard" · 3 esperimenti
// ══════════════════════════════════════════════════════════════════════
export default function Cap1() {
  const [expIdx, setExpIdx] = useState(0);
  const [mode, setMode] = useState("passo");
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState("intro");       // intro | build | quiz | complete | final
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizCorrect, setQuizCorrect] = useState(false);

  const exp = EXPERIMENTS[expIdx];
  const totalSteps = exp.steps.length;
  const totalExps = EXPERIMENTS.length;

  const resetExp = () => {
    setStepIdx(0);
    setPhase("intro");
    setQuizAnswer(null);
    setQuizCorrect(false);
    setMode("passo");
  };
  const nextExp = () => {
    if (expIdx < totalExps - 1) {
      setExpIdx(expIdx + 1);
      setStepIdx(0);
      setPhase("intro");
      setQuizAnswer(null);
      setQuizCorrect(false);
      setMode("passo");
    } else {
      setPhase("final");
    }
  };
  const prevExp = () => {
    if (expIdx > 0) {
      setExpIdx(expIdx - 1);
      setStepIdx(0);
      setPhase("intro");
      setQuizAnswer(null);
      setQuizCorrect(false);
      setMode("passo");
    }
  };

  // ─── INTRO screen ───
  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: `linear-gradient(135deg, ${C.dark} 0%, ${C.navy} 60%, #2A6BB5 100%)`, fontFamily: font.b }}>
        <Nav title="" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>{exp.icon}</div>
            <div style={{ fontFamily: font.h, fontSize: 34, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
              Capitolo 1 · Esp. {exp.num}
            </div>
            <div style={{ fontFamily: font.h, fontSize: 26, color: C.white, fontWeight: 700, marginBottom: 6 }}>
              {exp.title}
            </div>
            <div style={{ fontFamily: font.h, fontSize: 16, color: "rgba(255,255,255,.8)", fontWeight: 400, marginBottom: 14 }}>
              {exp.subtitle}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.7, marginBottom: 22, padding: "0 10px" }}>
              {exp.introText}
            </div>
            <div style={{ display: "inline-flex", gap: 14, marginBottom: 26, color: "rgba(255,255,255,.65)", fontSize: 13, background: "rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 20px" }}>
              <span>★☆☆ Facile</span><span>·</span><span>{exp.duration}</span><span>·</span><span>{exp.pieces} pezzi</span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {expIdx > 0 && <BtnIndietro onClick={prevExp}>Esp precedente</BtnIndietro>}
              <BtnGreen onClick={() => setPhase("build")}>Iniziamo! 🚀</BtnGreen>
            </div>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 6 }}>
              {EXPERIMENTS.map((_, i) => (
                <div key={i} style={{
                  width: i === expIdx ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === expIdx ? C.white : "rgba(255,255,255,.35)",
                  transition: "all .3s",
                }} />
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,.55)", fontFamily: font.b }}>
              Esperimento {expIdx + 1} di {totalExps}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FINAL screen (tutti gli esperimenti completati) ───
  if (phase === "final") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font.b }}>
        <Nav title="Capitolo 1 Completato" />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🏆</div>
          <div style={{ fontFamily: font.h, fontSize: 28, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            Capitolo 1 completato!
          </div>
          <div style={{ fontSize: 14, color: C.gray, marginBottom: 24 }}>
            Hai conosciuto tutti i componenti che userai nel Volume 1.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <Badge emoji="🔌" label="Breadboard" on={true} />
            <Badge emoji="💡" label="LED + R" on={true} />
            <Badge emoji="🎛️" label="Sensori" on={true} />
          </div>
          <div style={{ background: C.greenBgLight, border: `2px solid ${C.greenAlpha}`, borderRadius: 10, padding: 14, textAlign: "left", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: font.h, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>
              Componenti sbloccati:
            </div>
            {["Breadboard · Batteria 9V", "LED verde · Resistore 470Ω", "Pulsante · Potenziometro · LDR", "Buzzer piezo · Reed Switch"].map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: C.dark, fontFamily: font.b, padding: "2px 0" }}>✅ {t}</div>
            ))}
          </div>
          <Unlim message="Fantastico! Ora conosci tutti e 8 i componenti del Volume 1. Sei pronto per il Capitolo 2, dove useremo il pulsante per accendere un LED a comando." />
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
            <BtnIndietro onClick={() => { setExpIdx(0); resetExp(); }}>Rivedi Cap. 1</BtnIndietro>
            <button style={{
              background: `linear-gradient(90deg, ${C.green}, ${C.navy})`, color: C.white, border: "none", borderRadius: 10,
              padding: "12px 28px", fontSize: 15, fontWeight: 700, fontFamily: font.b,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(30,77,140,.25)",
            }}>
              Vai al Cap. 2 · Il Pulsante →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── COMPLETE screen (fine singolo esperimento) ───
  if (phase === "complete") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font.b }}>
        <Nav title={`Cap. 1 Esp. ${exp.num} — ${exp.title}`} />
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "32px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
          <div style={{ fontFamily: font.h, fontSize: 24, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            Esperimento {exp.num} completato!
          </div>
          <div style={{ fontSize: 13, color: C.gray, marginBottom: 20 }}>
            {expIdx < totalExps - 1 ? `Passiamo all'esperimento ${expIdx + 2} di ${totalExps}.` : "Hai completato tutti gli esperimenti del capitolo!"}
          </div>
          <div style={{ background: C.greenBgLight, border: `2px solid ${C.greenAlpha}`, borderRadius: 10, padding: 14, textAlign: "left", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: font.h, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>
              Cosa hai imparato:
            </div>
            {exp.learned.map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: C.dark, fontFamily: font.b, padding: "2px 0" }}>✅ {t}</div>
            ))}
          </div>
          <Unlim message={exp.completeMessage} />
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
            <BtnIndietro onClick={resetExp}>Rivedi esp</BtnIndietro>
            <BtnGreen onClick={nextExp}>
              {expIdx < totalExps - 1 ? `Esp. ${expIdx + 2} →` : "Completa Cap. 1 🏆"}
            </BtnGreen>
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 6 }}>
            {EXPERIMENTS.map((_, i) => (
              <div key={i} style={{
                width: i === expIdx ? 24 : 8, height: 8, borderRadius: 4,
                background: i <= expIdx ? C.green : "rgba(0,0,0,.15)",
                transition: "all .3s",
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── BUILD / QUIZ layout ───
  const step = exp.steps[stepIdx];
  const goNextStep = () => {
    if (stepIdx < totalSteps - 1) setStepIdx(stepIdx + 1);
    else setPhase("quiz");
  };
  const goPrevStep = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };
  const currentQuiz = exp.quiz;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font.b, display: "flex", flexDirection: "column" }}>
      <Nav title={`Cap. 1 Esp. ${exp.num} — ${exp.title}`} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar activeComponents={exp.activeComponents} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
            <Tabs active={mode} onChange={setMode} />
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
            {renderExpOverlay(expIdx, stepIdx, mode, phase)}
          </div>

          <Toolbar />
          <StatusBar />
          <UnlimBot />
          <PageBar current={expIdx + 1} total={totalExps} />

          <StepPanel>
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 8, borderBottom: `1px solid ${C.borderLight}` }}>
              <span style={{ fontSize: 13 }}>{mode === "passo" ? "👣" : mode === "montato" ? "🔧" : "🎨"}</span>
              <span style={{ fontFamily: font.h, fontSize: 15, fontWeight: 700, color: C.dark, textTransform: "uppercase", letterSpacing: .8 }}>
                {mode === "passo" ? "Passo Passo" : mode === "montato" ? "Già Montato" : "Percorso"}
              </span>
              <div style={{ flex: 1 }} />
              {mode === "passo" && phase === "build" && (
                <span style={{ fontSize: 12, color: C.muted, fontFamily: font.b, fontWeight: 600 }}>
                  {stepIdx + 1}/{totalSteps}
                </span>
              )}
            </div>

            {/* ─── GIÀ MONTATO ─── */}
            {mode === "montato" && (<>
              <div style={{ fontFamily: font.h, fontSize: 16, fontWeight: 700, color: C.navy, textTransform: "uppercase" }}>
                Il circuito è pronto 🔧
              </div>
              <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, fontWeight: 500 }}>
                {exp.montatoDesc}
              </div>
              <HintBox icon="👀" title="Cosa osservare" v="info">
                {exp.montatoHint}
              </HintBox>
              <Unlim message={exp.montatoUnlim} />
              <BtnAvanti onClick={() => setMode("passo")}>Passa al Passo Passo</BtnAvanti>
            </>)}

            {/* ─── PERCORSO ─── */}
            {mode === "percorso" && (<>
              <div style={{ fontFamily: font.h, fontSize: 16, fontWeight: 700, color: C.navy, textTransform: "uppercase" }}>
                Modalità Percorso 🎨
              </div>
              <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, fontWeight: 500 }}>
                In questa modalità costruisci il circuito a modo tuo: trascina i componenti dalla palette e collega i fili liberamente.
              </div>
              <HintBox icon="💡" title="Suggerimento" v="warning">
                Ricorda le regole della breadboard: colonne collegate, canale centrale, bus + e −!
              </HintBox>
              <Unlim message="Questa è la tua 'tela bianca'. Prova a ricreare il circuito che vedi in Già Montato, oppure sperimenta come vuoi. Non c'è un modo sbagliato di giocare!" />
              <BtnAvanti onClick={() => setMode("passo")}>Torna al Passo Passo</BtnAvanti>
            </>)}

            {/* ─── PASSO PASSO · BUILD ─── */}
            {mode === "passo" && phase === "build" && (<>
              <div>
                <div style={{ height: 3, borderRadius: 2, background: C.borderLight }}>
                  <div style={{
                    height: 3, borderRadius: 2,
                    width: `${((stepIdx + 1) / totalSteps) * 100}%`,
                    background: C.green, transition: "width .5s",
                  }} />
                </div>
                <div style={{ fontSize: 10, color: C.gray, fontFamily: font.b, marginTop: 3 }}>
                  Passo {stepIdx + 1} di {totalSteps}
                </div>
              </div>

              <div style={{ fontFamily: font.h, fontSize: 16, fontWeight: 700, color: "#B45309", textTransform: "uppercase" }}>
                👣 Passo {stepIdx + 1}
              </div>

              <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, fontWeight: 500 }}>
                {step.text}
              </div>

              <HintBox icon="💡" title="Suggerimento" v="warning">
                {step.hint}
              </HintBox>

              <Unlim message={exp.unlimMessages[stepIdx] || exp.unlimMessages[exp.unlimMessages.length - 1]} />

              <div style={{ display: "flex", justifyContent: stepIdx === 0 ? "flex-end" : "space-between", marginTop: 4, gap: 8 }}>
                {stepIdx > 0 && <BtnIndietro onClick={goPrevStep}>Indietro</BtnIndietro>}
                <BtnAvanti onClick={goNextStep}>
                  {stepIdx === totalSteps - 1 ? "Quiz! 🧠" : "Avanti"}
                </BtnAvanti>
              </div>
            </>)}

            {/* ─── QUIZ ─── */}
            {mode === "passo" && phase === "quiz" && (<>
              <div style={{ fontFamily: font.h, fontSize: 16, fontWeight: 700, color: C.navy, textTransform: "uppercase" }}>
                🧠 Quiz veloce!
              </div>
              <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, fontWeight: 500 }}>
                {currentQuiz.question}
              </div>
              {currentQuiz.options.map((opt, i) => {
                const sel = quizAnswer === i;
                let bg = C.cardBg, bd = C.borderLight;
                if (sel && opt.correct) { bg = C.greenBgLight; bd = C.greenAlpha; }
                if (sel && !opt.correct) { bg = C.redLight; bd = C.red; }
                return (
                  <button key={i}
                    onClick={() => { setQuizAnswer(i); if (opt.correct) setQuizCorrect(true); }}
                    disabled={quizAnswer !== null && quizCorrect}
                    style={{
                      width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8,
                      background: bg, border: `1.5px solid ${bd}`,
                      fontSize: 12, color: C.dark, fontFamily: font.b,
                      cursor: quizCorrect ? "default" : "pointer", transition: "all .2s",
                    }}>
                    {sel && (opt.correct ? "✅ " : "❌ ")}{opt.text}
                  </button>
                );
              })}
              {quizAnswer !== null && !quizCorrect && (
                <HintBox icon="💡" title="Quasi!" v="error">
                  {currentQuiz.retryHint}
                  <span onClick={() => setQuizAnswer(null)} style={{ marginLeft: 4, textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}> Riprova</span>
                </HintBox>
              )}
              {quizCorrect && (<>
                <HintBox icon="✅" title="Perfetto!" v="success">
                  {currentQuiz.explanation}
                </HintBox>
                <Unlim message={exp.quizSuccessMessage} />
                <BtnAvanti onClick={() => setPhase("complete")}>
                  {expIdx < totalExps - 1 ? "Vai al prossimo esp! 🎉" : "Completa il capitolo! 🏆"}
                </BtnAvanti>
              </>)}
              {!quizCorrect && quizAnswer !== null && (
                <div style={{ marginTop: 2 }}>
                  <BtnIndietro onClick={() => { setPhase("build"); setStepIdx(totalSteps - 1); }}>
                    Rivedi l'ultimo passo
                  </BtnIndietro>
                </div>
              )}
            </>)}
          </StepPanel>
        </div>
      </div>
    </div>
  );
}
