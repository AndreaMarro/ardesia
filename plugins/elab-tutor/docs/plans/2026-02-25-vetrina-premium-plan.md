# Vetrina Premium ELAB — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a premium 14-section vetrina page on Netlify (HTML static) that matches scuole.html editorial quality, plus redirect ShowcasePage.jsx to it.

**Architecture:** Self-contained HTML page (`vetrina.html`) with all CSS in `<style>` tag, following the exact patterns of `scuole.html` (CSS vars, .reveal animations, .container layout, .section backgrounds). No external CSS dependencies. Images served from `images/vetrina/` on same Netlify CDN.

**Tech Stack:** HTML5, CSS3 (vars, grid, clamp), Vanilla JS (IntersectionObserver for scroll animations, animated counters), Poppins+Roboto fonts via Google Fonts.

---

## Pre-Implementation: Asset Preparation

### Task 0: Copy & Prepare Image Assets

**Files:**
- Create: `newcartella/images/vetrina/` directory
- Copy from elab-builder: 3 screenshots
- Reference existing: 4 classroom photos already in place

**Step 1: Create directory and copy simulator screenshots**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO"
mkdir -p newcartella/images/vetrina

# Copy the 3 existing showcase screenshots
cp "elab-builder/public/assets/showcase/02-simulatore-running.png" "newcartella/images/vetrina/hero-simulator.png"
cp "elab-builder/public/assets/showcase/01-simulatore-rgb.png" "newcartella/images/vetrina/simulator-rgb.png"
cp "elab-builder/public/assets/showcase/05-galileo-chat.png" "newcartella/images/vetrina/galileo-chat.png"
```

**Step 2: Verify all required images exist**

```bash
# These must exist (from step 1):
ls -la newcartella/images/vetrina/

# These already exist and will be referenced by relative path:
ls -la newcartella/images/real-photos/bambino-circuito-1.jpg
ls -la newcartella/images/scuole/classroom-electronics-02.jpg
ls -la newcartella/images/scuole/classroom-electronics-03.jpg
ls -la newcartella/images/scuole/classroom-electronics-04.jpg
ls -la newcartella/images/stock/classroom-teacher.jpg
```

**Step 3: Create placeholder markers for missing images**

The following images need to be captured or provided later:
- `images/vetrina/editor-arduino.png` — Screenshot of Arduino editor panel
- `images/vetrina/volumi-grid.png` — Screenshot of volume selection grid
- `images/vetrina/teacher-confused.jpg` — Photo of confused teacher (stock)

For now, use `classroom-teacher.jpg` from stock as teacher photo, and take the 2 screenshots in Task 1.

---

### Task 1: Capture 2 New Screenshots (Editor Arduino + Volume Grid)

**Requires:** Dev server running at localhost:5173

**Step 1: Set up Playwright auth bypass and navigate to tutor**

Use Playwright browser:
```js
await page.goto('http://localhost:5173');
await page.evaluate(() => {
  sessionStorage.setItem('elab_dev_screenshot', 'true');
  window.location.hash = '#tutor';
  window.location.reload();
});
// Wait for tutor to load
await page.waitForTimeout(3000);
```

**Step 2: Navigate to an experiment and open the Arduino editor**

- Close onboarding modal if shown
- Navigate: Simulatore → Volume 1 → any chapter → any experiment
- Click "Gia Montato" to assemble
- Click on the Code Editor tab/panel to show the Arduino editor
- Collapse sidebar, hide Galileo
- Take screenshot: `newcartella/images/vetrina/editor-arduino.png`

**Step 3: Navigate to Volume selection grid**

- Go back to experiment picker
- Show the volume selection (Vol 1 / Vol 2 / Vol 3 cards)
- Take screenshot: `newcartella/images/vetrina/volumi-grid.png`

**Step 4: Remove auth bypass from AuthContext.jsx if it was added**

This step is ONLY needed if a dev bypass was re-added. Check first.

---

## Main Implementation: vetrina.html

### Task 2: Create vetrina.html — Head + CSS Variables + Reset

**Files:**
- Create: `newcartella/vetrina.html`

**Step 1: Write the HTML head with meta tags, OG, fonts**

Create `newcartella/vetrina.html` with:
- `<!DOCTYPE html>` + `<html lang="it" data-theme="light">`
- Meta charset, viewport, title: "ELAB Tutor Galileo | Simulatore di Elettronica Interattivo"
- Meta description: educational simulator pitch
- OG tags (og:title, og:description, og:type, og:url, og:image)
- Twitter card tags
- Canonical URL: `https://funny-pika-3d1029.netlify.app/vetrina.html`
- Google Fonts: `Poppins:wght@400;500;600;700;800` + `Roboto:wght@300;400;500;700`
- Favicon (same as scuole.html)

**Step 2: Write the `<style>` block — CSS variables**

Copy EXACT variable block from scuole.html:
```css
:root {
  --navy: #1E4D8C;
  --navy-dark: #163A6A;
  --navy-light: #2B6AB8;
  --lime: #7CB342;
  --lime-dark: #5C8F2A;
  --lime-light: #9ACD5A;
  --orange: #E8941C;
  --red: #E54B3D;
  --text-dark: #111827;
  --text-body: #374151;
  --text-muted: #6B7280;
  --bg-white: #FFFFFF;
  --bg-light: #F9FAFB;
  --bg-alt: #F3F4F6;
  --border: #E5E7EB;
}
```

**Step 3: Write base reset + body + container + typography**

Same patterns as scuole.html:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Roboto', sans-serif; color: var(--text-dark); background: var(--bg-white); -webkit-font-smoothing: antialiased; overflow-x: hidden; line-height: 1.7; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
```

Plus tag, h2, .lead, .section, .section--alt, .section--navy styles.

**Step 4: Verify file renders**

Open `newcartella/vetrina.html` in browser — should show empty white page with no errors.

---

### Task 3: CSS — Nav + Hero + Buttons + Animations

**Files:**
- Modify: `newcartella/vetrina.html` (add to `<style>` block)

**Step 1: Add nav CSS**

Copy `.sc-nav`, `.sc-nav__inner`, `.sc-nav__logo`, `.sc-nav__links`, `.sc-nav__link`, `.sc-nav__cta`, `.sc-nav__menu-btn`, `.sc-mobile-nav` styles from scuole.html VERBATIM.

**Step 2: Add button CSS**

Copy `.btn-primary`, `.btn-secondary`, `.btn-white` from scuole.html.

Add new hero-specific styles:
```css
/* Vetrina Hero — dark gradient background */
.vt-hero {
  padding: 160px 0 80px;
  background: linear-gradient(135deg, #0F2744 0%, #1E4D8C 50%, #2D6DB5 100%);
  color: white;
  text-align: center;
}
.vt-hero__badge {
  display: inline-block;
  background: rgba(124,179,66,0.2);
  color: var(--lime-light);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 18px;
  border-radius: 20px;
  margin-bottom: 24px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.vt-hero__title {
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  line-height: 1.1;
  margin-bottom: 20px;
}
.vt-hero__title .hl { color: var(--lime); }
.vt-hero__sub {
  font-size: 1.15rem;
  color: rgba(255,255,255,0.85);
  line-height: 1.7;
  max-width: 640px;
  margin: 0 auto 36px;
}
.vt-hero__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}
.vt-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  max-width: 640px;
  margin: 0 auto 48px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
}
.vt-hero__stat {
  padding: 20px 16px;
  text-align: center;
}
.vt-hero__stat strong {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.8rem;
  color: white;
  display: block;
}
.vt-hero__stat span {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  margin-top: 4px;
  display: block;
}
.vt-hero__screenshot {
  max-width: 900px;
  margin: 0 auto;
}
.vt-hero__screenshot img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
```

**Step 3: Add animation CSS**

```css
.img-break { width: 100%; overflow: hidden; }
.img-break img { width: 100%; height: 420px; object-fit: cover; display: block; }

.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }

.watermark { position: fixed; bottom: 8px; left: 12px; font-size: 0.65rem; color: rgba(0,0,0,0.25); font-family: 'Roboto', monospace; z-index: 10; pointer-events: none; }
```

---

### Task 4: CSS — Split Layout + Cards + Chat Mockup + Features Navy

**Files:**
- Modify: `newcartella/vetrina.html` (add to `<style>` block)

**Step 1: Add split layout CSS**

```css
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.split--reverse { direction: rtl; }
.split--reverse > * { direction: ltr; }
.split__img img { width: 100%; border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

.callout {
  border-left: 4px solid var(--lime);
  background: rgba(124,179,66,0.06);
  padding: 20px 24px;
  border-radius: 0 8px 8px 0;
  margin-top: 24px;
}
.callout--navy { border-left-color: var(--navy); background: rgba(30,77,140,0.06); }

.check-list { list-style: none; }
.check-list li { padding: 8px 0 8px 28px; position: relative; font-size: 0.95rem; color: var(--text-body); }
.check-list li::before { content: '✓'; position: absolute; left: 0; color: var(--lime); font-weight: 700; }

.badge-pill {
  display: inline-block;
  background: rgba(124,179,66,0.12);
  color: var(--lime-dark);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
}
```

**Step 2: Add zoom grid CSS (section 5)**

```css
.zoom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-top: 48px;
}
.zoom-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}
.zoom-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
.zoom-card img { width: 100%; height: 220px; object-fit: cover; }
.zoom-card__body { padding: 20px 24px; }
.zoom-card__body h3 { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 1.1rem; margin-bottom: 8px; }
.zoom-card__body p { font-size: 0.92rem; color: var(--text-body); }
```

**Step 3: Add chat mockup CSS (section 7)**

```css
.chat-demo {
  max-width: 640px;
  margin: 48px auto 0;
  background: #0F2744;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.chat-msg { margin-bottom: 20px; display: flex; gap: 12px; align-items: flex-start; }
.chat-msg--user { flex-direction: row-reverse; }
.chat-msg__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.chat-msg--user .chat-msg__avatar { background: rgba(255,255,255,0.15); }
.chat-msg--ai .chat-msg__avatar { background: var(--lime); color: white; }
.chat-msg__bubble {
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 0.92rem;
  line-height: 1.6;
  max-width: 420px;
}
.chat-msg--user .chat-msg__bubble { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9); border-radius: 12px 12px 2px 12px; }
.chat-msg--ai .chat-msg__bubble { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); border-radius: 12px 12px 12px 2px; }
.chat-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.chat-actions span {
  background: var(--lime);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
}
```

**Step 4: Add benefit cards CSS (section 8)**

```css
.benefit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 48px; }
.benefit-card {
  background: white;
  border-radius: 12px;
  padding: 32px 28px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}
.benefit-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
.benefit-card--lime { border-top: 4px solid var(--lime); }
.benefit-card--orange { border-top: 4px solid var(--orange); }
.benefit-card--navy { border-top: 4px solid var(--navy); }
.benefit-card h3 { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 1.15rem; margin-bottom: 16px; }
.benefit-card ul { list-style: none; }
.benefit-card li { padding: 6px 0 6px 20px; position: relative; font-size: 0.92rem; color: var(--text-body); }
.benefit-card--lime li::before { content: '•'; position: absolute; left: 0; color: var(--lime); font-weight: 700; }
.benefit-card--orange li::before { content: '•'; position: absolute; left: 0; color: var(--orange); font-weight: 700; }
.benefit-card--navy li::before { content: '•'; position: absolute; left: 0; color: var(--navy); font-weight: 700; }
```

**Step 5: Add features navy section CSS (section 10)**

```css
.feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
.feat-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 28px 24px;
}
.feat-card__icon { font-size: 1.6rem; margin-bottom: 12px; }
.feat-card h3 { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 1rem; color: white; margin-bottom: 8px; }
.feat-card p { font-size: 0.88rem; color: rgba(255,255,255,0.7); line-height: 1.6; }
```

**Step 6: Add quote + CTA + footer CSS**

```css
/* Quote */
.vt-quote { text-align: center; padding: 80px 0; position: relative; }
.vt-quote__mark { font-size: 5rem; color: var(--lime); opacity: 0.15; line-height: 1; margin-bottom: -20px; }
.vt-quote blockquote {
  font-family: 'Poppins', sans-serif;
  font-style: italic;
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  color: var(--navy);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}
.vt-quote cite { display: block; margin-top: 16px; font-size: 0.95rem; color: var(--text-muted); font-style: normal; }

/* CTA Card */
.vt-cta { padding: 100px 0; background: linear-gradient(135deg, #0F2744, #1E4D8C, #2D6DB5); text-align: center; }
.vt-cta__card {
  background: white;
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.vt-cta__logo { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 1.4rem; color: var(--lime); margin-bottom: 16px; }
.vt-cta__card h2 { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 1.8rem; color: var(--text-dark); margin-bottom: 12px; }
.vt-cta__card p { color: var(--text-body); margin-bottom: 28px; }
.vt-cta__actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
.vt-cta__tags { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.vt-cta__tags span {
  font-size: 0.78rem;
  background: var(--bg-alt);
  color: var(--text-muted);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
}

/* Footer — reuse scuole pattern */
.sc-footer { background: #0F2744; color: rgba(255,255,255,0.7); padding: 64px 0 32px; }
.sc-footer__grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; }
.sc-footer__grid h4 { color: white; font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 0.95rem; margin-bottom: 16px; }
.sc-footer__grid p { font-size: 0.88rem; line-height: 1.7; }
.sc-footer__grid a { display: block; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.88rem; padding: 3px 0; transition: color 0.2s; }
.sc-footer__grid a:hover { color: var(--lime); }
.sc-footer__bottom { border-top: 1px solid rgba(255,255,255,0.1); margin-top: 48px; padding-top: 24px; text-align: center; font-size: 0.82rem; }
.sc-footer__bottom a { color: rgba(255,255,255,0.6); text-decoration: none; }
```

---

### Task 5: CSS — Responsive Breakpoints

**Files:**
- Modify: `newcartella/vetrina.html` (add to `<style>` block)

**Step 1: Add tablet breakpoint (max-width 1024px)**

```css
@media (max-width: 1024px) {
  .split { grid-template-columns: 1fr; gap: 40px; }
  .split--reverse { direction: ltr; }
  .vt-hero { padding: 120px 0 60px; }
  .vt-hero__title { font-size: 2.2rem; }
  .zoom-grid { grid-template-columns: 1fr 1fr; }
  .benefit-grid { grid-template-columns: 1fr; }
  .feat-grid { grid-template-columns: 1fr 1fr; }
  .sc-footer__grid { grid-template-columns: 1fr; gap: 32px; }
}
```

**Step 2: Add mobile breakpoint (max-width 768px)**

```css
@media (max-width: 768px) {
  .section { padding: 64px 0; }
  .sc-nav__links { display: none; }
  .sc-nav__menu-btn { display: block; }
  .vt-hero { padding: 100px 0 48px; }
  .vt-hero__stats { grid-template-columns: 1fr 1fr; }
  .zoom-grid { grid-template-columns: 1fr; }
  .feat-grid { grid-template-columns: 1fr; }
  .img-break img { height: 280px; }
  h2 { font-size: 1.5rem !important; }
  .chat-demo { padding: 20px; }
  .vt-cta__card { padding: 32px 20px; }
  .sc-footer__grid { grid-template-columns: 1fr; }
}
```

**Step 3: Add small mobile breakpoint (max-width 380px)**

```css
@media (max-width: 380px) {
  .container { padding: 0 12px; }
  .vt-hero__title { font-size: 1.6rem; }
  .vt-hero__stats { grid-template-columns: 1fr 1fr; }
}
```

---

### Task 6: HTML Body — Nav + Hero + Photo Break 1

**Files:**
- Modify: `newcartella/vetrina.html` (write `<body>` content)

**Step 1: Write nav + mobile nav**

Based on scuole.html pattern but with vetrina-specific links:
- Home (→ index.html)
- Simulatore (#simulatore)
- Galileo AI (#galileo)
- Per le Scuole (#benefici)
- CTA: Accedi (→ https://elab-builder.vercel.app/#login)

**Step 2: Write hero section (section 1)**

```html
<section class="vt-hero">
  <div class="container">
    <span class="vt-hero__badge">Beta Pubblica</span>
    <h1 class="vt-hero__title">
      <span class="hl">ELAB</span> Tutor Galileo
    </h1>
    <p class="vt-hero__sub">
      Il laboratorio di elettronica interattivo per studenti e insegnanti.
      Circuiti reali, AI tutor e sfide interattive &mdash; tutto nel browser.
    </p>
    <div class="vt-hero__actions">
      <a href="https://elab-builder.vercel.app/#login" class="btn-primary">Accedi</a>
      <a href="https://elab-builder.vercel.app/#register" class="btn-white">Registrati Gratis</a>
    </div>
    <div class="vt-hero__stats">
      <div class="vt-hero__stat"><strong>69</strong><span>Esperimenti</span></div>
      <div class="vt-hero__stat"><strong>138</strong><span>Quiz</span></div>
      <div class="vt-hero__stat"><strong>21</strong><span>Componenti</span></div>
      <div class="vt-hero__stat"><strong>&bull;</strong><span>AI Integrata</span></div>
    </div>
    <div class="vt-hero__screenshot">
      <img src="images/vetrina/hero-simulator.png" alt="Simulatore ELAB con circuito MOSFET, multimetro e LED">
    </div>
  </div>
</section>
```

**Step 3: Write photo break 1 (section 2)**

```html
<div class="img-break">
  <img src="images/scuole/classroom-electronics-03.jpg" alt="Mani di studenti che lavorano con componenti elettronici">
</div>
```

---

### Task 7: HTML Body — Empatia Insegnante + Simulatore (Sections 3-4)

**Files:**
- Modify: `newcartella/vetrina.html`

**Step 1: Write empatia insegnante section (section 3)**

Split layout with teacher photo left, text right. Include the exact quote from the brief. Use `classroom-teacher.jpg` as temporary teacher photo.

**Step 2: Write simulatore section (section 4)**

Split reverse layout (text left, screenshot right). 5-point checklist with lime checkmarks. Navy callout: "Nessun software da installare. Apri il browser e inizia."

---

### Task 8: HTML Body — Zoom Grid + Photo Break 2 + Galileo Demo (Sections 5-7)

**Files:**
- Modify: `newcartella/vetrina.html`

**Step 1: Write zoom grid section (section 5)**

4 cards in 2x2 grid:
1. Galileo AI → galileo-chat.png
2. LED RGB → simulator-rgb.png
3. Editor Arduino → editor-arduino.png (or placeholder)
4. 3 Volumi → volumi-grid.png (or placeholder)

Each card: image + title + description.

**Step 2: Write photo break 2 (section 6)**

```html
<div class="img-break">
  <img src="images/real-photos/bambino-circuito-1.jpg" alt="Bambino che costruisce un circuito elettronico">
</div>
```

**Step 3: Write Galileo demo section (section 7)**

HTML-only chat mockup:
- Student asks: "Come funziona un LED? Perche serve una resistenza?"
- Galileo responds with educational explanation about LED + resistor
- Quick action pills: Esperimento, Diagnosi, Altro
- Caption below: "Galileo usa intelligenza artificiale per guidarti..."

---

### Task 9: HTML Body — Benefici + Photo Break 3 + Features Navy (Sections 8-10)

**Files:**
- Modify: `newcartella/vetrina.html`

**Step 1: Write benefici section (section 8)**

3 cards: Studente (lime), Insegnante (orange), Scuola (navy). Each with 4 bullet points.

**Step 2: Write photo break 3 (section 9)**

```html
<div class="img-break">
  <img src="images/scuole/classroom-electronics-04.jpg" alt="Vista completa di un laboratorio di elettronica scolastico">
</div>
```

**Step 3: Write features navy section (section 10)**

Dark gradient background. 6 feature cards in 3x2 grid. NO mention of nanobot, n8n, or specific backend services.

---

### Task 10: HTML Body — Apprendimento + Citazione + CTA + Footer (Sections 11-14)

**Files:**
- Modify: `newcartella/vetrina.html`

**Step 1: Write apprendimento orizzontale section (section 11)**

Split reverse (text left, classroom photo right). Badge "Insieme". Inclusive tone. 3 checkmarks.

**Step 2: Write citazione Franklin section (section 12)**

Centered quote with large decorative quotation marks in lime. Franklin attribution.

**Step 3: Write CTA card section (section 13)**

White card on gradient navy background. ELAB logo text, "Richiedi una Demo", two buttons, tag pills.

**Step 4: Write footer (section 14)**

3-column: ELAB info + Prodotto links + Contatti. Bottom bar with copyright + privacy + termini.

---

### Task 11: JavaScript — Scroll Animations + Counter + Mobile Nav

**Files:**
- Modify: `newcartella/vetrina.html` (add `<script>` before `</body>`)

**Step 1: Add IntersectionObserver for .reveal elements**

Copy from scuole.html:
```js
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
```

**Step 2: Add animated counter for stats**

```js
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  });
}
// Trigger when hero stats enter viewport
const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); statsObs.unobserve(e.target); } });
}, { threshold: 0.3 });
const statsEl = document.querySelector('.vt-hero__stats');
if (statsEl) statsObs.observe(statsEl);
```

**Step 3: Add mobile nav toggle**

Copy from scuole.html:
```js
const menuBtn = document.getElementById('scMenuToggle');
const mobileNav = document.getElementById('scMobileNav');
menuBtn?.addEventListener('click', () => mobileNav.classList.toggle('open'));
document.querySelectorAll('.sc-mobile-nav a').forEach(a => {
  a.addEventListener('click', () => mobileNav.classList.remove('open'));
});
```

**Step 4: Add smooth scroll for anchor links**

```js
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
```

---

## Post-Implementation

### Task 12: Add Vetrina Link to Navigation on Other Pages

**Files:**
- Modify: `newcartella/index.html` — add "Vetrina" link in nav if not present
- Modify: `newcartella/scuole.html` — add "Tutor" link pointing to vetrina.html

**Step 1: Add vetrina link to index.html nav**

Find the nav links section and add: `<a href="vetrina.html">Tutor</a>`

**Step 2: Add vetrina link to scuole.html nav**

Add to `.sc-nav__links`: `<a href="vetrina.html" class="sc-nav__link">Tutor</a>`

---

### Task 13: Modify ShowcasePage.jsx for Redirect

**Files:**
- Modify: `elab-builder/src/components/ShowcasePage.jsx`

**Step 1: Replace entire ShowcasePage with redirect**

```jsx
import { useEffect } from 'react';

export default function ShowcasePage() {
  useEffect(() => {
    window.location.replace('https://funny-pika-3d1029.netlify.app/vetrina.html');
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#374151' }}>
      <p>Reindirizzamento alla vetrina...</p>
    </div>
  );
}
```

**Step 2: Build elab-builder**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
```

Expected: 0 errors, build in ~30s

---

### Task 14: Visual Verification

**Step 1: Open vetrina.html locally and verify all 14 sections render**

Use Playwright or browser to open `file:///Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/vetrina.html`

Check:
- [ ] Nav renders with glass-morphism
- [ ] Hero has gradient, badge, title, stats, screenshot
- [ ] Photo break 1 shows classroom photo (not cropped)
- [ ] Empatia insegnante split layout renders
- [ ] Simulatore split reverse layout with screenshot
- [ ] 4 zoom cards display properly
- [ ] Photo break 2 shows bambino
- [ ] Galileo chat mockup is complete (not truncated)
- [ ] 3 benefit cards with correct colors
- [ ] Photo break 3 shows classroom
- [ ] 6 navy feature cards in grid
- [ ] Apprendimento section with photo
- [ ] Franklin quote centered with decorative marks
- [ ] CTA card on gradient background
- [ ] Footer 3 columns
- [ ] Scroll animations fire on scroll
- [ ] Mobile responsive (resize to 375px)

**Step 2: Verify images are not cut off**

All `.img-break img` should have `object-fit: cover` with `height: 420px` — no distortion.

**Step 3: Check for zero console errors**

---

### Task 15: Deploy

**Step 1: Deploy Netlify (sito pubblico with vetrina.html)**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella" && npx netlify deploy --prod --dir=. --site=864de867-e428-4eed-bd86-c2aef8d9cb13
```

**Step 2: Deploy Vercel (elab-builder with redirect)**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vercel --prod --yes
```

**Step 3: Verify live URLs**

- https://funny-pika-3d1029.netlify.app/vetrina.html — must show all 14 sections
- https://elab-builder.vercel.app/#showcase — must redirect to Netlify vetrina

**Step 4: Commit changes to newcartella git**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella"
git add vetrina.html images/vetrina/
git commit -m "feat: add premium vetrina page (14 sections, editorial quality)"
```

---

## Summary of All Files

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `newcartella/vetrina.html` | Main deliverable — 14-section premium page |
| CREATE | `newcartella/images/vetrina/hero-simulator.png` | Hero screenshot |
| CREATE | `newcartella/images/vetrina/simulator-rgb.png` | Simulator RGB LED |
| CREATE | `newcartella/images/vetrina/galileo-chat.png` | Galileo chat panel |
| CREATE | `newcartella/images/vetrina/editor-arduino.png` | Arduino editor (screenshot) |
| CREATE | `newcartella/images/vetrina/volumi-grid.png` | Volume grid (screenshot) |
| MODIFY | `newcartella/index.html` | Add "Tutor" nav link |
| MODIFY | `newcartella/scuole.html` | Add "Tutor" nav link |
| MODIFY | `elab-builder/src/components/ShowcasePage.jsx` | Replace with redirect |
| REFERENCE | `newcartella/images/scuole/classroom-electronics-*.jpg` | Photo breaks |
| REFERENCE | `newcartella/images/real-photos/bambino-circuito-1.jpg` | Photo break |
| REFERENCE | `newcartella/images/stock/classroom-teacher.jpg` | Teacher section |
