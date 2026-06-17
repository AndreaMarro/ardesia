# Ricerca: 13 Bottoni iPad <44px — Identificazione e Fix

**Data**: 24/03/2026
**Tipo**: RESEARCH con fix CSS concreti
**Severity**: P1

## I 13 Bottoni Identificati

| # | Elemento | Size attuale | Problema | Dove |
|---|----------|-------------|----------|------|
| 1 | Menu hamburger | 40x42 | H<44 | Vetrina Netlify |
| 2-11 | Nav links (Simulatore, Galileo AI, Dashboard, Quiz, Giochi, Scuole, Privacy, Termini, info@, Sito Web) | 976x32 | **H=32px** | Vetrina Netlify |
| 12 | Footer "Privacy" | 42x15 | W<44, H<44 | Vetrina Netlify |
| 13 | Footer "Termini" | 44x15 | H=15px | Vetrina Netlify |

## Root Cause

I bottoni sono sulla vetrina statica Netlify (`funny-pika-3d1029.netlify.app/vetrina.html`).
Il ShowcasePage.jsx redirige a questa pagina. I fix CSS vanno applicati lì, non nel repo React.

## Fix CSS Proposti

```css
/* Fix 1: Menu Toggle Button */
button#scMenuToggle.sc-nav__menu-btn {
    min-height: 44px;
    min-width: 44px;
}

/* Fix 2: Navigation Menu Links */
nav a {
    min-height: 44px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
}

/* Fix 3: Footer Links */
footer a {
    min-height: 44px;
    padding: 12px;
    display: inline-flex;
    align-items: center;
}
```

## Impatto su Composite

ipad_compliance: formula `max(0.0, 1.0 - small / 10)`
- 13 small → score 0.0 (capped at 10)
- 0 small → score 1.0
- Delta: +0.10 peso × 1.0 = +0.10 composite potenziale

## Task YAML

P1: Applicare fix CSS alla vetrina Netlify per portare 13 bottoni a ≥44px
