// ============================================
// ELAB Tutor — Vetrina Simulatore (utenti senza licenza)
// Landing page di conversione: mostra cosa offre il simulatore
// Numeri verificati dal codebase (70 exp, 21 comp, 53 sfide, 3 vol)
// Andrea Marro — 24/02/2026
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import vcss from './VetrinaSimulatore.module.css';
const AMAZON_URL = 'https://www.amazon.it/s?k=ELAB+elettronica';

// ── Verified numbers from codebase ──
const STATS = [
    { value: 70, label: 'Esperimenti', icon: '\u26A1' },
    { value: 21, label: 'Componenti',  icon: '\uD83D\uDD27' },
    { value: 53, label: 'Sfide',       icon: '\uD83C\uDFAF' },
    { value:  3, label: 'Volumi',      icon: '\uD83D\uDCDA' },
];

const VOLUMES = [
    {
        num: 1, color: 'var(--elab-lime)', gradient: 'linear-gradient(135deg, var(--elab-lime) 0%, #9CCC65 100%)',
        title: 'Basi', experiments: 38,
        desc: 'LED, resistori, condensatori, pulsanti — dal primo circuito alle basi solide',
        chapters: '9 capitoli',
    },
    {
        num: 2, color: 'var(--elab-orange)', textColor: '#996600', gradient: 'linear-gradient(135deg, var(--elab-orange) 0%, #FFB74D 100%)',
        title: 'Intermedio', experiments: 18,
        desc: 'Sensori, motori, display LCD, servo — progetti via via pi\u00F9 complessi',
        chapters: '9 capitoli',
    },
    {
        num: 3, color: 'var(--elab-red)', textColor: '#C62828', gradient: 'linear-gradient(135deg, var(--elab-red) 0%, #EF5350 100%)',
        title: 'Avanzato', experiments: 14,
        desc: 'Arduino Nano, MOSFET, comunicazione seriale — programmazione e robotica',
        chapters: '6 capitoli',
    },
];

const FEATURES = [
    { icon: '\uD83D\uDCBB', title: 'Circuiti Interattivi', desc: 'Costruisci circuiti reali su breadboard con 21 componenti elettronici', accent: 'var(--elab-lime)' },
    { icon: '\u26A1', title: 'Simulazione Tempo-Reale', desc: 'Vedi correnti, tensioni e LED accendersi davvero', accent: 'var(--elab-orange)' },
    { icon: '\uD83D\uDE80', title: 'Compilatore Arduino', desc: 'Scrivi codice C++ e flashalo sul simulatore ATmega328p', accent: 'var(--elab-navy)' },
    { icon: '\uD83D\uDC63', title: '"Passo Passo" Guidato', desc: 'Assemblaggio step-by-step identico alle illustrazioni del libro', accent: 'var(--elab-lime)' },
    { icon: '\uD83E\uDD16', title: 'UNLIM AI Tutor', desc: 'Assistente AI che spiega i concetti in modo semplice e chiaro', accent: 'var(--elab-red)' },
    { icon: '\uD83C\uDFC6', title: '53 Sfide Interattive', desc: 'Trova il guasto, prevedi il risultato, decodifica circuiti', accent: 'var(--elab-orange)' },
];

const SHOWCASE = [
    { src: '/assets/showcase/01-simulatore-rgb.png', title: 'Simulatore Circuiti', desc: 'Breadboard interattiva con componenti reali', tag: 'Simulatore' },
    { src: '/assets/showcase/05-galileo-chat.png', title: 'UNLIM AI Tutor', desc: 'L\'assistente AI che guida passo passo', tag: 'AI' },
];

const COMPONENTS_LIST = [
    'LED', 'RGB LED', 'Resistore', 'Condensatore', 'Diodo', 'MOSFET-N',
    'Pulsante', 'Potenziometro', 'Fotoresistore', 'Fototransistore',
    'Reed Switch', 'Buzzer Piezo', 'Motore DC', 'Servo',
    'Display LCD 16x2', 'Multimetro', 'Batteria 9V',
    'Arduino Nano R4', 'Breadboard', 'Fili', 'Half Breadboard',
];

// ── Inject CSS animations (runs once) ──
const ANIM_CSS = `
@keyframes vetrina-fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes vetrina-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
@keyframes vetrina-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes vetrina-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes vetrina-progress { from { width: 0%; } to { width: 100%; } }
.vetrina-showcaseImg { transition: opacity 0.5s ease-in-out; }
.vetrina-featureCard:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(30,77,140,0.15) !important; }
.vetrina-volumeCard:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(0,0,0,0.12) !important; }
.vetrina-amazonBtn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(255,153,0,0.4) !important; }
.vetrina-schoolsBtn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(30,77,140,0.3) !important; }
.vetrina-activateBtn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(124,179,66,0.4) !important; }
.vetrina-thumb { transition: all 0.2s ease; }
.vetrina-thumb:hover { transform: scale(1.05); }
.vetrina-waFloat:hover { transform: scale(1.1) !important; box-shadow: 0 6px 20px rgba(37,211,102,0.5) !important; }
.vetrina-waFloat:hover .vetrina-waTip { opacity: 1 !important; }
.vetrina-waTip strong { color: var(--elab-hex-075e54); font-size: 14px; }
.vetrina-waTip > div:not(:first-child) span { color: var(--elab-hex-25d366); font-weight: 600; }
@media(max-width:480px) { .vetrina-waTip { display: none !important; } .vetrina-waFloat { bottom: 16px !important; right: 16px !important; width: 54px !important; height: 54px !important; } }
`;

let animInjected = false;
function injectAnimCSS() {
    if (animInjected) return;
    animInjected = true;
    const el = document.createElement('style');
    el.textContent = ANIM_CSS;
    document.head.appendChild(el);
}

// ── Animated counter with easing ──
function AnimatedNumber({ target, duration = 1400 }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        const startAnimation = () => {
            started.current = true;
            const t0 = performance.now();
            const animate = (now) => {
                const elapsed = now - t0;
                const progress = Math.min(elapsed / duration, 1);
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                setVal(Math.round(eased * target));
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        };
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                startAnimation();
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        if (ref.current) {
            observer.observe(ref.current);
            // Fallback: if already visible on mount, start immediately
            const rect = ref.current.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight) {
                startAnimation();
                observer.disconnect();
            }
        }
        return () => observer.disconnect();
    }, [target, duration]);
    return <span ref={ref}>{val}</span>;
}

// ── Main component ──
export default function VetrinaSimulatore({ onNavigate }) {
    const { activateLicense, user } = useAuth();
    const [licenseCode, setLicenseCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeShowcase, setActiveShowcase] = useState(0);
    const [showcaseProgress, setShowcaseProgress] = useState(0);
    const [showComponents, setShowComponents] = useState(false);
    const progressRef = useRef(null);

    useEffect(() => { injectAnimCSS(); }, []);

    // Auto-advance showcase with progress bar
    useEffect(() => {
        const INTERVAL = 6000;
        let start = Date.now();
        const progressTimer = setInterval(() => {
            const elapsed = Date.now() - start;
            setShowcaseProgress(Math.min((elapsed / INTERVAL) * 100, 100));
        }, 50);
        const advanceTimer = setInterval(() => {
            setActiveShowcase(prev => (prev + 1) % SHOWCASE.length);
            start = Date.now();
            setShowcaseProgress(0);
        }, INTERVAL);
        return () => { clearInterval(progressTimer); clearInterval(advanceTimer); };
    }, []);

    const selectShowcase = useCallback((idx) => {
        setActiveShowcase(idx);
        setShowcaseProgress(0);
    }, []);

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!licenseCode.trim()) return;
        setError('');
        setLoading(true);
        const result = await activateLicense(licenseCode.trim());
        if (result.success) {
            setSuccess(true);
            setTimeout(() => onNavigate?.('tutor'), 1500);
        } else {
            setError(result.error || 'Codice non valido');
        }
        setLoading(false);
    };

    const current = SHOWCASE[activeShowcase];

    return (
        <div className={vcss.container}>

            {/* ══════════════════ HERO ══════════════════ */}
            <div className={vcss.hero}>
                {/* Decorative orbs */}
                <div className={vcss.heroOrb1} />
                <div className={vcss.heroOrb2} />
                <div className={vcss.heroContent}>
                    <div className={vcss.heroBadge}>Simulatore di Elettronica</div>
                    <h1 className={vcss.heroTitle}>
                        <span className={vcss.heroTitleAccent}>ELAB</span> Tutor
                    </h1>
                    <p className={vcss.heroSubtitle}>
                        Il laboratorio completo per imparare l'elettronica.<br />
                        Costruisci circuiti, programma Arduino, supera sfide interattive.
                    </p>

                    {/* Stats */}
                    <div className={vcss.statsRow}>
                        {STATS.map((s, i) => (
                            <div key={i} className={vcss.statCard}>
                                <span className={vcss.statIcon}>{s.icon}</span>
                                <span className={vcss.statValue}>
                                    <AnimatedNumber target={s.value} />
                                </span>
                                <span className={vcss.statLabel}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Hero — Principio Zero: 1 click to magic */}
                    <button
                        onClick={() => onNavigate?.('prova')}
                        style={{
                            marginTop: '28px',
                            padding: '18px 48px',
                            background: 'linear-gradient(135deg, var(--elab-lime) 0%, #6B9B3A 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            fontSize: '20px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontFamily: "'Oswald', 'Open Sans', sans-serif",
                            boxShadow: '0 6px 24px rgba(74,122,37,0.35)',
                            minHeight: '56px',
                            minWidth: '280px',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 8px 32px rgba(74,122,37,0.45)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 6px 24px rgba(74,122,37,0.35)'; }}
                        aria-label="Accedi al simulatore di elettronica"
                    >
                        Accedi al Simulatore
                    </button>
                    <p style={{ marginTop: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Open Sans', sans-serif" }}>
                        Nessun login richiesto — inizia subito con il Volume 1
                    </p>
                </div>
            </div>
{/* (c) Andrea Marro — 24/02/2026 — ELAB Tutor — Tutti i diritti riservati */}

            {/* ══════════════════ SHOWCASE ══════════════════ */}
            <div className={vcss.sectionWide}>
                <div className={vcss.sectionHeader}>
                    <span className={vcss.sectionTag}>IL SIMULATORE</span>
                    <h2 className={vcss.sectionTitle}>Il simulatore in azione</h2>
                </div>
                <div className={vcss.showcaseWrap}>
                    {/* Featured image */}
                    <div className={vcss.showcaseFeatured}>
                        <img
                            key={activeShowcase}
                            src={current.src}
                            alt={current.title}
                            className={vcss.showcaseFeaturedImg}
                        />
                        {/* Progress bar */}
                        <div className={vcss.showcaseProgressBar}>
                            <div className={vcss.showcaseProgressFill} style={{ width: `${showcaseProgress}%` }} />
                        </div>
                        {/* Overlay */}
                        <div className={vcss.showcaseOverlay}>
                            <span className={vcss.showcaseTag}>{current.tag}</span>
                            <h3 className={vcss.showcaseOvTitle}>{current.title}</h3>
                            <p className={vcss.showcaseOvDesc}>{current.desc}</p>
                        </div>
                    </div>
                    {/* Thumbnails */}
                    <div className={vcss.thumbRow}>
                        {SHOWCASE.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => selectShowcase(i)}
                                className={`${vcss.thumb} ${i === activeShowcase ? vcss.thumbActive : ''}`}
                            >
                                <img src={s.src} alt={s.title} className={vcss.thumbImg} />
                                <div className={vcss.thumbInfo}>
                                    <span className={vcss.thumbTag}>{s.tag}</span>
                                    <span className={vcss.thumbLabel}>{s.title}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════ FEATURES ══════════════════ */}
            <div className={vcss.sectionAlt}>
                <div className={vcss.sectionInner}>
                    <div className={vcss.sectionHeader}>
                        <span className={vcss.sectionTag}>FUNZIONALIT\u00C0</span>
                        <h2 className={vcss.sectionTitle}>Tutto ci\u00F2 che include</h2>
                    </div>
                    <div className={vcss.featuresGrid}>
                        {FEATURES.map((f, i) => (
                            <div key={i} className={vcss.featureCard}>
                                <div className={vcss.featureIconWrap} style={{ background: f.accent + '18' }}>
                                    <span className={vcss.featureIcon}>{f.icon}</span>
                                </div>
                                <h3 className={vcss.featureTitle}>{f.title}</h3>
                                <p className={vcss.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════ VOLUMES ══════════════════ */}
            <div className={vcss.sectionInner}>
                <div className={vcss.sectionHeader}>
                    <span className={vcss.sectionTag}>PERCORSO</span>
                    <h2 className={vcss.sectionTitle}>3 Volumi Progressivi</h2>
                    <p className={vcss.sectionSubtitle}>Ogni volume amplia le competenze del precedente</p>
                </div>
                <div className={vcss.volumeRow}>
                    {VOLUMES.map(v => (
                        <div key={v.num} className={vcss.volumeCard}>
                            {/* Top accent bar */}
                            <div className={vcss.volumeAccent} style={{ background: v.gradient }} />
                            <div className={vcss.volumeBody}>
                                <div className={vcss.volumeTop}>
                                    <span className={vcss.volNum} style={{ color: v.textColor || v.color }}>
                                        {v.num}
                                    </span>
                                    <div>
                                        <span className={vcss.volBadge} style={{ background: v.gradient }}>
                                            Volume {v.num}
                                        </span>
                                        <h3 className={vcss.volTitle}>{v.title}</h3>
                                    </div>
                                </div>
                                <p className={vcss.volDesc}>{v.desc}</p>
                                <div className={vcss.volFooter}>
                                    <div className={vcss.volStat}>
                                        <span className={vcss.volStatNum} style={{ color: v.textColor || v.color }}>{v.experiments}</span>
                                        <span className={vcss.volStatLabel}>esperimenti</span>
                                    </div>
                                    <span className={vcss.volChapters}>{v.chapters}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════ COMPONENTS ══════════════════ */}
            <div className={vcss.sectionInner}>
                <button
                    onClick={() => setShowComponents(p => !p)}
                    className={vcss.expandBtn}
                >
                    <span className={vcss.expandIcon}>{showComponents ? '\u25BE' : '\u25B8'}</span>
                    <span className={vcss.expandText}>21 Componenti Elettronici Simulati</span>
                    <span className={vcss.expandHint}>{showComponents ? 'Chiudi' : 'Mostra'}</span>
                </button>
                {showComponents && (
                    <div className={vcss.chipGrid}>
                        {COMPONENTS_LIST.map((c, i) => (
                            <span key={i} className={vcss.chip}>{c}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════ LICENSE ACTIVATION ══════════════════ */}
            <div className={vcss.sectionInner}>
                <div className={vcss.activationCard}>
                    {/* Decorative gradient top */}
                    <div className={vcss.activationGradientTop} />
                    <div className={vcss.activationContent}>
                        <div className={vcss.activationIconWrap}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h2 className={vcss.activationTitle}>
                            {success ? '\u2705 Licenza attivata!' : 'Hai un codice licenza?'}
                        </h2>

                        {success ? (
                            <p className={vcss.successText}>Reindirizzamento al simulatore...</p>
                        ) : (
                            <>
                                <p className={vcss.activationDesc}>
                                    Inserisci il codice incluso nel tuo kit ELAB per sbloccare tutti gli esperimenti
                                </p>
                                <form onSubmit={handleActivate} className={vcss.form}>
                                    <input
                                        type="text"
                                        placeholder="Es: ELAB-XXXX-XXXX"
                                        value={licenseCode}
                                        onChange={(e) => setLicenseCode(e.target.value)}
                                        className={vcss.input}
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        className={vcss.activateBtn}
                                        style={{ opacity: loading || !licenseCode.trim() ? 0.5 : 1 }}
                                        disabled={loading || !licenseCode.trim()}
                                    >
                                        {loading ? 'Verifica...' : 'Attiva Licenza'}
                                    </button>
                                </form>
                                {error && <p className={vcss.errorText}>{error}</p>}

                                <div className={vcss.divider}>
                                    <div className={vcss.dividerLine} />
                                    <span className={vcss.dividerText}>oppure</span>
                                    <div className={vcss.dividerLine} />
                                </div>

                                <a
                                    href={AMAZON_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={vcss.amazonBtn}
                                >
                                    {'\uD83D\uDED2'} Acquista il Kit ELAB su Amazon
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════ SCHOOLS CTA ══════════════════ */}
            <div className={vcss.sectionInner}>
                <div className={vcss.schoolsCard}>
{/* (c) Andrea Marro — 24/02/2026 — ELAB Tutor — Tutti i diritti riservati */}
                    <a
                        href="https://funny-pika-3d1029.netlify.app/scuole.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={vcss.schoolsBtn}
                        style={{ fontSize: '16px', display: 'inline-block', textAlign: 'center', margin: '0 auto' }}
                    >
                        Scopri le soluzioni per le scuole {'\u2192'}
                    </a>
                </div>
            </div>

            {/* ══════════════════ WHATSAPP FLOATING BUTTON ══════════════════ */}
            <a
                href="https://wa.me/393461653930?text=Ciao!%20Vorrei%20maggiori%20informazioni%20su%20ELAB."
                target="_blank"
                rel="noopener noreferrer"
                className={vcss.waFloat}
                title="Contattaci su WhatsApp"
            >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <div className={vcss.waTip}>
                    <div className={vcss.waTipHeader}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--elab-hex-25d366)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        <span>Scrivici su WhatsApp</span>
                    </div>
                    <div className={vcss.waTipContact}><strong>ANDREA</strong><span>346 165 3930</span></div>
                    <div className={vcss.waTipContact}><strong>Omaric SRL</strong><span>346 809 3661</span></div>
                </div>
            </a>

            {/* ══════════════════ FOOTER ══════════════════ */}
            <div className={vcss.footer}>
                <button onClick={() => onNavigate?.('tutor')} className={vcss.backLink}>
                    {'\u2190'} Torna alla home
                </button>
            </div>
        </div>
    );
}

// (c) Andrea Marro — 24/02/2026
