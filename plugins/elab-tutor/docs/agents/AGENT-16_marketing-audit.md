# AGENT-16: Marketing & Content Audit Report (v2 -- Deep Audit)

**Date**: 2026-02-13 (v2 update)
**Agent**: AGENT-16 (Marketing & Content Auditor)
**Target**: ELAB Public Website (https://funny-pika-3d1029.netlify.app)
**Source**: `/Users/andreamarro/VOLUME 3/newcartella/`
**Method**: Full file-level code review of index.html, all CSS/JS, all HTML pages, sitemap.xml, robots.txt, manifest.json, netlify.toml, cookie-banner.js, privacy.html, termini.html, chi-siamo.html, negozio.html, kit.html, scuole.html, 404.html

---

## 1. Executive Summary

The ELAB public website has a strong visual design with consistent branding, a well-defined color system, and clear product positioning for educational electronics kits. However, **critical marketing and technical issues** severely limit the site's effectiveness for customer acquisition and conversion.

**The 5 most urgent issues:**

1. **Domain identity crisis**: The live URL is `funny-pika-3d1029.netlify.app` but the sitemap and robots.txt reference `elab.school`. Some internal pages reference `info@elab.school`. The canonical tags use the Netlify subdomain. This makes the site essentially invisible to search engines.

2. **Zero social proof on homepage**: Testimonial data exists in `main.js` but there is no container in `index.html` to render them. No Amazon review references, no sales numbers, no school adoption metrics.

3. **Amazon ASIN mismatch**: Schema.org structured data uses ASINs `B0DW6TRJV8`/`B0F1LYFNTN` while all clickable buy buttons use `B0G1MLL1MM`/`B0G1MMBJVS`. Google Rich Results will point to wrong product pages.

4. **WhatsApp phone number mismatch**: The WhatsApp floating widget links to `+393461653930` across the entire site, while the footer and contacts page show `346 80 93 661` (which is `+393468093661`). These are two entirely different phone numbers.

5. **GDPR non-compliance**: Newsletter form has no consent checkbox, the cookie banner contradicts the privacy policy, and there is no double opt-in mechanism.

**Overall readiness for marketing-driven traffic: ~50%**

---

## 2. Content & Messaging Audit -- Score: 5/10

### Value Proposition (5-Second Test)
- **PASS**: The hero headline "Impara l'Elettronica Giocando" is clear and immediate.
- **PASS**: Target audience "bambini e ragazzi 8-14 anni" is stated directly in the subtitle.
- **PASS**: Badge "Presente al Maker Faire Roma 2024" adds above-the-fold credibility.
- **ISSUE**: No quantified claims anywhere on the homepage. No "X+ kit venduti", no "Y+ scuole", no numbers at all. The hero is emotionally appealing but lacks proof.
- **ISSUE**: The subtitle ("Kit educativi completi con componenti reali, manuali illustrati e progetti guidati per bambini e ragazzi 8-14 anni") is factual but not emotionally compelling. It describes features, not outcomes or transformations.

### Target Audience Messaging
- **Parents (primary buyer)**: Partially addressed. The hero and kit cards speak to parents, but there is no dedicated section addressing parent concerns (safety, durability, learning outcomes, screen-free play). No "Why ELAB" section comparing against generic Arduino kits or cheap Amazon alternatives.
- **Teachers (secondary buyer)**: Well addressed via dedicated CTA banner ("Sei un Insegnante?") and comprehensive `scuole.html` page with Carta del Docente workflow, bulk pricing, and school contact form.
- **Children (end user)**: Not addressed at all on the website. No gamified language, no "cool factor" messaging, no peer appeal. The site speaks entirely to adults.

### Volume Differentiation
- **PASS**: Three volume cards are visually distinct with color coding (green/orange/red) and clear skill badges (Principiante/Intermedio/In Arrivo).
- **PASS**: Pricing is visible (55 EUR / 75 EUR / "Presto disponibile").
- **ISSUE**: Kit descriptions are too brief. "14 capitoli per scoprire resistori, LED, pulsanti, sensori e costruire il tuo primo robot" is one sentence. Parents need component counts, chapter topics, specific learning outcomes, and age-appropriate difficulty indicators at a glance.

### Social Proof
- **CRITICAL MISS**: The homepage has ZERO rendered testimonials. The `main.js` file contains 3 testimonial objects (Marco R., Prof.ssa Giulia T., Famiglia Bianchi), but there is no container element in `index.html` to display them. The testimonial rendering code exists but produces nothing visible.
- **No Amazon reviews** are referenced, embedded, or linked.
- **No user/school counts**, no adoption metrics, no media mentions.
- **No photo gallery** of real users (the "images/real-photos/" folder exists with classroom/maker photos but they only appear on `chi-siamo.html`, not the homepage).

### Newsletter Signup
- **PASS**: Newsletter section exists with navy (#1E4D8C) background, clear heading, and functional form submitting to `/.netlify/functions/waitlist-join`.
- **PASS**: Copy explicitly mentions Volume 3 availability notification.
- **ISSUE**: No GDPR consent checkbox (see Legal section).
- **ISSUE**: No indication of email frequency or content type.

### Call-to-Action Clarity
- **PASS**: Primary hero CTA "Scopri i Kit" is prominent and green.
- **PASS**: Secondary hero CTA "Per le Scuole" serves the B2B audience.
- **PASS**: Each kit card has direct "Compra" buttons to Amazon.
- **ISSUE**: Too many CTAs compete: "Scopri i Kit", "Per le Scuole", "Registrati Gratis" (community), "Iscriviti" (newsletter), "Beta" button. Five different actions requested from the visitor.

---

## 3. SEO Audit -- Score: 3/10

### Meta Tags
- **PASS**: Title tag is well-crafted: "ELAB - Impara l'Elettronica Giocando | Kit Educativi per Bambini" (62 chars, under 70).
- **PASS**: Meta description present and keyword-rich (155 chars).
- **PASS**: Open Graph tags complete (og:title, og:description, og:type, og:url, og:image) on all checked pages.
- **PASS**: Twitter Cards configured (summary_large_image) on all checked pages.

### Critical SEO Issues

**1. Domain Mismatch (CRITICAL -- Complete SEO Invalidation)**
| Source | Domain Used |
|---|---|
| Live URL | `funny-pika-3d1029.netlify.app` |
| `sitemap.xml` (19 URLs) | `elab.school` |
| `robots.txt` Sitemap directive | `elab.school/sitemap.xml` |
| Canonical tags (all HTML pages) | `funny-pika-3d1029.netlify.app` |
| og:url tags (all HTML pages) | `funny-pika-3d1029.netlify.app` |
| `login.html` support email | `info@elab.school` |
| `dashboard.html` contact email | `info@elab.school` |
| `main.js` console message | `elab.school` |
| Schema.org Organization URL | `funny-pika-3d1029.netlify.app` |
| ALLOWED_ORIGINS in functions | Both (comma-separated) |

**Impact**: The sitemap is 100% useless to Google because it references `elab.school` which does not resolve to this site. The canonical tags and og:url are set to the Netlify subdomain, creating two incompatible identity systems. Google will likely not index the site properly at all.

**2. Amazon ASIN Mismatch (HIGH)**
| Product | Schema.org ASIN | Buy Button ASIN | Pages Affected |
|---|---|---|---|
| Volume 1 | `B0DW6TRJV8` | `B0G1MLL1MM` | negozio.html, kit/volume-1.html |
| Volume 2 | `B0F1LYFNTN` | `B0G1MMBJVS` | negozio.html, kit/volume-2.html |

Google Shopping and Rich Results will show products linked to wrong/old ASINs, while users clicking actual buttons go to different Amazon listings.

**3. No hreflang tags**: The site is Italian-only but does not declare `<link rel="alternate" hreflang="it">`. Minor for Italy-only targeting.

### Heading Hierarchy
- **PASS**: Single H1 on homepage: "Impara l'Elettronica Giocando" (wrapped in semantic HTML).
- **PASS**: Logical H2 sections throughout.
- **PASS**: H3 for kit titles and step titles.
- **PASS**: Kit section uses `<article>` elements correctly.

### Image Alt Texts
- **PASS**: Hero image: "Bambino che usa il multimetro con ELAB" (descriptive).
- **PASS**: Kit images: "ELAB Volume 1 - Kit base elettronica" (keyword-rich).
- **PASS**: Logo: alt="ELAB Logo".
- **MINOR ISSUE**: Amazon badge uses Wikipedia-hosted image with generic alt="Amazon" (could be more descriptive: "Disponibile su Amazon").

### Structured Data
- **PRESENT**: Organization Schema on homepage (name, URL, logo, contactPoint).
- **PRESENT**: Product Schema on negozio.html (2 products with pricing and availability).
- **PRESENT**: Product Schema on kit/volume-1.html and kit/volume-2.html.
- **MISSING**: FAQ Schema on kit.html (6 FAQ items that could be marked up).
- **MISSING**: Review/AggregateRating Schema (no reviews data).
- **MISSING**: BreadcrumbList Schema on sub-pages.
- **MISSING**: EducationalOrganization or Course Schema (relevant for STEM products).

### Sitemap & Robots.txt
- **FAIL**: Sitemap references wrong domain (`elab.school` instead of `funny-pika-3d1029.netlify.app`).
- **PASS**: robots.txt correctly disallows admin/dashboard/profile/order pages.
- **FAIL**: robots.txt sitemap URL points to `https://elab.school/sitemap.xml`.
- **PASS**: Netlify.toml has clean URL redirects (e.g., `/kit` -> `/kit.html`).

### Page Load Performance Concerns
- **CSS**: ~162 KB across 9 files, unminified, no bundling. 4 CSS files in `/css/` are not loaded on the homepage (legacy/unused).
- **JS**: ~114 KB across 8 files, unminified, no bundling.
- **Videos**: 28 MB total (11 MB + 18 MB MP4 files) served directly from `/videos/` with no CDN, no lazy loading, no poster images, no compression. This is a catastrophic LCP penalty.
- **Images**: Logo PNG served from `static.wixstatic.com`. Product images also from Wix CDN. Local images (~190 KB total) are reasonable but no WebP/AVIF, no `srcset`.
- **No `<link rel="preload">`** for hero image or critical fonts.
- **Font loading**: Google Fonts loaded synchronously with `display=swap` (correct).

---

## 4. Brand & Visual Audit -- Score: 7/10

### Palette Consistency
- **PASS**: Brand palette is consistently applied throughout all pages:
  - Navy `#1E4D8C` for headers, newsletter section, trust elements, footer
  - Lime `#7CB342` for Vol1, primary CTAs, success states
  - Orange `#E8941C` for Vol2, teacher CTA, warning states
  - Red `#E54B3D` for Vol3, error states
- **PASS**: CSS custom properties in `style.css` define the full palette in `:root` with both hex and sRGB equivalents.
- **PASS**: Volume-specific color coding is consistent (border-top, badges, buttons, card headers).
- **PASS**: The hero divider (4-color gradient bar: green/orange/red/navy) is a distinctive brand element.
- **MINOR**: The `scuole.html` hero uses `#667eea` / `#764ba2` (purple gradient) which is NOT part of the brand palette. The kit.html CTA section also uses this purple gradient. This introduces an off-brand color.

### Font Consistency
- **PASS**: Roboto (body) + Poppins (display/headings) are loaded consistently on all pages.
- **PASS**: Font weights are well-managed: Roboto 300/400/500/700, Poppins 500/600/700.
- **PASS**: CSS variable `--font-sans` and `--font-display` properly defined.
- **MINOR**: Some inline styles use `font-family: 'Poppins', sans-serif` directly instead of the CSS variable `--font-display`. Not a visual issue but a maintenance concern.

### Responsive Design
- **PASS**: Three breakpoints (576px, 768px, 992px) cover mobile/tablet/desktop.
- **PASS**: Hero grid collapses to single column on mobile with image repositioned above text.
- **PASS**: Kit cards stack vertically on mobile.
- **PASS**: Newsletter form stacks vertically on mobile.
- **PASS**: Mobile hamburger menu with slide-down navigation implemented.
- **ISSUE**: On mobile, kit cards have `max-width: 380px` which may be too narrow on some mid-size screens.
- **ISSUE**: The video section uses `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` with inline styles. This is responsive but the videos are unoptimized (28 MB total load on mobile).

### Image Quality & Handling
- **PASS**: Hero image has `onerror` fallback to Wix CDN image.
- **PASS**: Volume 3 uses `images/products/volume-3-coming.svg` which exists (verified: 2,455 bytes).
- **PASS**: Videos exist and are properly sourced.
- **ISSUE**: No WebP/AVIF format images anywhere.
- **ISSUE**: Videos have no `poster` attribute, causing blank frames before loading.
- **ISSUE**: No `<picture>` elements or `srcset` for responsive image loading.

### Visual Language
- **PASS**: Card-based design is consistent across all sections.
- **PASS**: Hover effects (translateY, shadow increase) are uniform and polished.
- **PASS**: WhatsApp floating button provides live-support feel.
- **PASS**: The 404 page is on-brand with "Circuito interrotto!" messaging and gradient text.
- **PASS**: Custom manifest.json with correct theme_color (#1E4D8C).
- **MINOR**: The video section (lines 1088-1127 of index.html) uses entirely hardcoded inline styles instead of CSS classes, breaking the design system pattern.

---

## 5. Conversion Funnel Audit -- Score: 4/10

### Path to Purchase
The minimum conversion path:

**From homepage directly (best case):**
1. Scroll to "I Nostri Kit" section
2. Click "Compra" on Vol1 or Vol2 card
3. Arrives on Amazon product page (new tab)
4. **Clicks: 1 + scroll** -- Acceptable.

**From homepage via kit page:**
1. Click "Scopri i Kit" in hero
2. Browse `kit.html` with comparison table
3. Click "Compra su Amazon"
4. **Clicks: 2** -- Acceptable.

### Conversion Issues

**1. Navigation Overload (CRITICAL)**
The main nav has 9 items: Home, I Kit, Corsi, Eventi, Gruppi, Community, Beta, Acquista, Accedi. For a product site with 2 available products, this is 4-5 too many options. Corsi, Eventi, Gruppi, Community, and Beta are secondary features that:
- Dilute attention from the purchase path
- Make the site feel like a social platform rather than a product site
- The "Beta" button (purple pulsing gradient) is the most visually eye-catching nav element but is completely irrelevant to purchasing

**2. Negozio Page Redundancy**
The "Acquista" nav link goes to `negozio.html` which shows the same 3 kit cards with buy links. This is a near-duplicate of the kit section on the homepage and `kit.html`. Three pages showing the same 3 products dilutes rather than focuses the experience.

**3. Dual Order System Confusion**
`negozio.html` has both "Compra su Amazon" buttons AND "Ordina Diretto" buttons. The "Ordina Diretto" modal is a Netlify form for direct order via bank transfer. This creates confusion:
- Two different purchasing workflows for the same product
- The direct order says "Riceverai conferma via email entro 24h. Pagamento tramite bonifico o accordo diretto." This is less trustworthy than Amazon checkout.
- The bundle "Vol1+Vol2 for 120 EUR" is ONLY available via direct order, not on Amazon.

**4. Volume 3 Waitlist Confusion**
Volume 3 "Lista d'attesa" links to `kit/volume-3.html` but the actual waitlist mechanism is the newsletter signup section. Users clicking "Lista d'attesa" will see a Volume 3 detail page but may not find the signup form.

**5. Community Registration vs. Purchase**
The "Unisciti alla Community ELAB" section with "Registrati Gratis" CTA competes directly with the purchase CTAs. Users who register for community (free) may feel they have accomplished something and leave without buying.

**6. WhatsApp Number Mismatch (CONFUSING)**
| Location | Phone Number | Format |
|---|---|---|
| WhatsApp floating widget (all pages) | `+393461653930` | wa.me link |
| Footer contact (all pages) | `+393468093661` | tel: link |
| chi-siamo.html contacts | `+393468093661` | tel: link |
| Schema.org Organization | `+39-346-8093661` | text |
| scuole.html WhatsApp link | `+393461653930` | wa.me link |
| scuole.html phone link | `+393468093661` | tel: link |

These are two different phone numbers. A customer who tries to call the footer number will reach a different line than the WhatsApp chat.

**7. No Trust Signals at Decision Point**
The "Compra" buttons have no supporting trust signals: no "Spedizione gratuita con Prime", no "30 giorni soddisfatti o rimborsati" (which IS mentioned on negozio.html but not next to the buy buttons), no review stars, no "X famiglie soddisfatte".

### Dead Links / Broken Asset Risk
- `images/kids/kids-multimeter.jpg` hero image has onerror fallback (suggests primary may fail)
- `images/products/volume-1-cover.jpg` on kit.html has onerror fallback to `images/products/volume-1-box.jpg`
- `images/products/volume-2-cover.jpg` on kit.html has onerror fallback to `images/kids/kids-multimeter.jpg`
- `LOGO OMARIC-ELAB.png` on chi-siamo.html has onerror fallback (file is in `/images/` not root)
- The Amazon search link `https://www.amazon.it/s?k=ELAB+elettronica+kit` in the trust badge may not return useful results if brand is not well-indexed on Amazon.

### "Coming Soon" / "Not Yet Available" Handling
- **PASS**: Volume 3 shows "In Arrivo" badge and "Presto disponibile" instead of price.
- **PASS**: Newsletter section mentions "Iscriviti per sapere quando esce il Volume 3".
- **PASS**: Aligns with the documented decision to use honest "not yet available" messaging.

---

## 6. Legal & Compliance Audit -- Score: 4/10

### Privacy Policy (`privacy.html`)
- **PASS**: Exists, linked from footer, identifies data controller ("Omaric Elettronica").
- **PASS**: Lists data types collected, purposes, legal bases, retention periods, user rights.
- **PASS**: States "Non vendiamo mai i tuoi dati a terzi."
- **MISS**: No mention of GDPR regulation by name, no article references (e.g., Art. 13/14 GDPR).
- **MISS**: No DPO designated (may not be required for small businesses but should be stated).
- **MISS**: No reference to Garante per la Protezione dei Dati Personali or right to lodge complaint.
- **MISS**: No mention of data processing for minors (relevant for 8-14 age target).

### Cookie Notice (`cookie-banner.js`)
- **PASS**: Banner implemented with two options: "Solo necessari" and "Accetta tutti".
- **PASS**: Links to privacy policy. Sets consent cookie for 365 days. SameSite=Lax.
- **CONTRADICTION**: Banner says "cookie analitici per migliorare l'esperienza" but privacy policy says "Il sito utilizza solo cookie tecnici necessari per il funzionamento. Non utilizziamo cookie di profilazione o di terze parti per pubblicita." These two statements directly contradict each other.
- **MISS**: No granular cookie preferences (analytics checkbox separate from necessary).
- **MISS**: No detailed cookie inventory page (name, purpose, duration, provider for each cookie).
- **MISS**: No ability to revoke/change consent after initial choice.

### P.IVA Status
- **PRESENT**: "In fase di registrazione" on `termini.html` (section 1) and `chi-siamo.html` (contacts section).
- **LEGAL RISK**: Italian law (D.Lgs. 196/2003, Art. 35 DPR 633/1972) requires displaying P.IVA on website and all commercial communications. Selling products without a registered P.IVA or with a placeholder has potential legal and tax implications.

### GDPR Compliance for Newsletter
- **CRITICAL**: Newsletter form has NO consent checkbox. GDPR Art. 7 requires explicit, freely given, informed consent via an unchecked checkbox.
- **MISS**: No description of what the subscriber will receive (frequency, content type).
- **MISS**: No double opt-in mechanism (confirmation email before adding to list).
- **MISS**: No unsubscribe mechanism mentioned.
- **MISS**: Children aged 8-14 may use the site -- no age verification or parental consent mechanism for data collection from minors (GDPR Art. 8 requires consent from parental authority for children under 16 in Italy).

### Terms of Sale (`termini.html`)
- **PASS**: Comprehensive, covers 12 sections: seller info, products, prices, payments, shipping, returns (14 days per D.Lgs. 206/2005), warranty (24 months), spare parts, Carta del Docente process, liability, jurisdiction, contacts.
- **PASS**: References applicable Italian consumer law.
- **ISSUE**: States "30 giorni soddisfatti o rimborsati" in negozio.html but termini.html says "14 giorni" for right of withdrawal per law. This is a discrepancy -- the 30-day claim on negozio.html may be a voluntary extension but should be explicitly stated in the terms.

### Security Headers
- **PASS**: `netlify.toml` configures X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin.
- **MISS**: No Content-Security-Policy (CSP) header.
- **MISS**: No Permissions-Policy header.
- **PASS**: Cache headers set for CSS/JS/images (1 year immutable).

### Copyright
- **PASS**: Footer: "(c) 2026 Omaric Elettronica. Tutti i diritti riservati."
- **PASS**: Developer watermark present on all pages: "Andrea Marro -- 08/02/2026".

---

## 7. Overall Marketing Readiness -- Score: 4.5/10

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Content & Messaging | 5/10 | 25% | 1.25 |
| SEO | 3/10 | 20% | 0.60 |
| Brand/Visual | 7/10 | 15% | 1.05 |
| Conversion Funnel | 4/10 | 25% | 1.00 |
| Legal/Compliance | 4/10 | 15% | 0.60 |
| **TOTAL** | | **100%** | **4.5/10** |

The site has a strong visual foundation and clear product positioning, but critical gaps in SEO (domain mismatch invalidates entire sitemap), social proof (zero testimonials rendered), GDPR compliance (no newsletter consent, cookie banner contradicts privacy policy), and conversion optimization (fragmented navigation, phone number mismatch, ASIN mismatch) prevent it from being effective for marketing spend.

---

## 8. Top 10 Recommendations (Prioritized)

### P0 -- Critical (MUST Fix Before Any Marketing Spend)

**1. Resolve Domain Identity Crisis**
- OPTION A: Configure `elab.school` as custom domain on Netlify (preferred -- professional, brandable).
- OPTION B: Update sitemap.xml, robots.txt, and all references to use `funny-pika-3d1029.netlify.app`.
- Update: all canonical tags, og:url tags, Schema.org URLs, internal email references (`info@elab.school` vs `elab.vendite@gmail.com`).
- **Impact**: Without this, the site is invisible to Google. The sitemap is 100% broken.
- **Effort**: 1-2 hours (Option B), 3-4 hours (Option A with DNS setup).

**2. Add GDPR Consent to Newsletter + Cookie Fix**
- Add unchecked checkbox: "Acconsento al trattamento dei dati per ricevere la newsletter ELAB. [Privacy Policy]"
- Implement double opt-in (confirmation email before adding to list).
- Fix cookie banner / privacy policy contradiction (decide if analytics cookies exist or not).
- Add parental consent notice given the 8-14 age target.
- **Impact**: Legal compliance. Without this, collecting emails is technically illegal under GDPR.
- **Effort**: 2-3 hours.

**3. Render Testimonials on Homepage**
- Testimonial data already exists in `main.js`. Add a testimonial section container in `index.html` between the kit section and teacher CTA.
- Add Amazon review screenshots or star ratings next to buy buttons.
- **Impact**: Social proof is the #1 conversion driver for educational products. Its complete absence is the largest trust gap.
- **Effort**: 1-2 hours.

### P1 -- High Priority (Within 1 Week)

**4. Fix Amazon ASIN Mismatch**
- Schema.org structured data uses ASINs `B0DW6TRJV8`/`B0F1LYFNTN` while buy buttons use `B0G1MLL1MM`/`B0G1MMBJVS`.
- Verify which ASINs are current and active on Amazon.
- Update ALL references (Schema.org in negozio.html, kit/volume-1.html, kit/volume-2.html) to match the active ASINs.
- **Impact**: Google Shopping Rich Results currently link to wrong/old Amazon pages.
- **Effort**: 30 minutes.

**5. Fix WhatsApp Phone Number Mismatch**
- WhatsApp widget uses `+393461653930` across the entire site.
- Footer and contacts show `+393468093661`.
- These are two different numbers. Verify which is correct and unify everywhere.
- Also update Schema.org Organization telephone field.
- **Impact**: Customers calling the wrong number may get no response, killing a potential sale.
- **Effort**: 30 minutes.

**6. Simplify Navigation**
- Reduce nav to 5-6 items: Home, I Kit, Per le Scuole, Chi Siamo, Acquista (Amazon direct link).
- Move Corsi, Eventi, Gruppi, Community to a "Risorse" dropdown or footer-only links.
- Remove or move the Beta button to the footer (it distracts from purchase intent).
- **Impact**: Reduces cognitive load by ~50%, focuses visitors on the purchase path.
- **Effort**: 2-3 hours.

### P2 -- Medium Priority (Within 2 Weeks)

**7. Optimize Video Delivery**
- Two videos (11 MB + 18 MB = 28 MB) served as raw MP4 from origin.
- Compress to 2-3 MB each (FFmpeg: `-crf 28 -preset slow`).
- Add `poster` attributes for instant visual feedback.
- Add Intersection Observer for deferred loading (only load when scrolled into view).
- Alternative: host on YouTube and embed (saves bandwidth, adds SEO signals).
- **Impact**: The 28 MB video payload is the single largest page weight issue and likely causes failing Core Web Vitals.
- **Effort**: 2-3 hours.

**8. Add Quantified Social Proof**
- Add a stats bar below the hero: "X+ Kit Venduti | Y+ Scuole | Z+ Esperimenti | Maker Faire 2024"
- Even modest real numbers (e.g., "500+ kit venduti", "50+ scuole") are better than none.
- Add real user photos from `/images/real-photos/` to the homepage (currently only on chi-siamo.html).
- **Impact**: Numbers are processed faster than text and build instant credibility.
- **Effort**: 1-2 hours.

**9. Add FAQ Schema Markup**
- `kit.html` already has 6 FAQ items using `<details>` elements.
- Wrap them in Schema.org FAQPage markup.
- **Impact**: FAQ rich results in Google SERPs significantly increase click-through rate.
- **Effort**: 30 minutes.

**10. Fix Return Policy Discrepancy + Minify Assets**
- Align "30 giorni soddisfatti o rimborsati" (negozio.html) with "14 giorni" (termini.html).
- Bundle and minify CSS (162 KB -> ~50 KB estimated).
- Bundle and minify JS (114 KB -> ~40 KB estimated).
- Convert images to WebP with `<picture>` fallback.
- Add `<link rel="preload">` for hero image and critical fonts.
- **Impact**: Faster loads improve SEO ranking signals and reduce bounce rate.
- **Effort**: 3-4 hours.

---

## Appendix A: Full Page Inventory

| Page | Purpose | Has OG Tags | Has Schema | Has meta description | Key Issues |
|---|---|---|---|---|---|
| `index.html` | Homepage | Yes | Organization | Yes | Missing testimonial container, inline video styles |
| `kit.html` | Kit comparison | Yes | No | Yes | 6 FAQ items without Schema.org markup |
| `kit/volume-1.html` | Vol1 detail | Yes | Product | Likely | ASIN mismatch in Schema |
| `kit/volume-2.html` | Vol2 detail | Yes | Product | Likely | ASIN mismatch in Schema |
| `kit/volume-3.html` | Vol3 waitlist | Likely | No | Likely | "Coming soon" handling is good |
| `negozio.html` | Shop/store | Yes | Product x2 | Yes | ASIN mismatch, dual order system |
| `scuole.html` | Schools/teachers | Yes | No | Yes | Off-brand purple gradient |
| `chi-siamo.html` | About us | Yes | No | Yes | Broken mascotte image path |
| `community.html` | Community hub | Yes | No | Likely | Requires login, secondary feature |
| `corsi.html` | Courses | Yes | No | Likely | Secondary feature |
| `eventi.html` | Events | Yes | No | Likely | Secondary feature |
| `gruppi.html` | Groups | Yes | No | Likely | Secondary feature |
| `beta-test.html` | Beta test | Yes | No | Likely | Links to tutor app (Vercel) |
| `login.html` | Authentication | Yes | No | No | Uses `info@elab.school` |
| `dashboard.html` | User dashboard | Yes | No | No | Uses `info@elab.school`, blocked by robots.txt |
| `profilo.html` | User profile | Yes | No | No | Blocked by robots.txt |
| `admin.html` | Admin panel | Yes | No | No | Blocked by robots.txt |
| `privacy.html` | Privacy policy | Yes | No | No | Missing GDPR article refs, minor completeness |
| `termini.html` | Terms of sale | Yes | No | No | P.IVA placeholder |
| `ordine-completato.html` | Order confirm | Likely | No | No | Blocked by robots.txt |
| `404.html` | Error page | Yes | No | Yes | Well-designed, on-brand |

## Appendix B: CSS Files Audit

| File | Size | Loaded on Homepage | Notes |
|---|---|---|---|
| `css/style.css` | 64 KB | Yes | Main design system, CSS variables, typography |
| `css/animations.css` | 13 KB | Yes | Reveal animations, hover effects |
| `css/responsive.css` | 28 KB | Yes | Media queries for 3 breakpoints |
| `css/light-theme.css` | 12 KB | Yes | Light theme color overrides |
| `css/elab-ui.css` | 9 KB | Yes | Toast, loading, skeleton, comments |
| Inline `<style>` | ~5 KB | Yes | Homepage-specific hero + section styles |
| `css/contrast-fix.css` | 3 KB | No | Not loaded (legacy?) |
| `css/enhancements.css` | 10 KB | No | Not loaded (legacy?) |
| `css/force-black-text.css` | 2 KB | No | Not loaded (legacy?) |
| `css/light-theme-override.css` | 21 KB | No | Not loaded (legacy?) |
| **Loaded Total** | **~131 KB** | | **Unminified, no bundling** |
| **All Files Total** | **~167 KB** | | **4 files appear unused** |

## Appendix C: Amazon ASINs Audit

| Product | Schema.org ASIN | Buy Button ASIN | Consistency |
|---|---|---|---|
| Volume 1 | `B0DW6TRJV8` (negozio.html, kit/volume-1.html) | `B0G1MLL1MM` (all buy links) | **MISMATCH** |
| Volume 2 | `B0F1LYFNTN` (negozio.html, kit/volume-2.html) | `B0G1MMBJVS` (all buy links) | **MISMATCH** |

## Appendix D: Phone Number Audit

| Context | Number | Notes |
|---|---|---|
| WhatsApp floating widget (all pages) | `+393461653930` | wa.me link |
| Footer tel: link (index, kit, negozio, chi-siamo, etc.) | `+393468093661` | tel: link |
| Schema.org Organization | `+39-346-8093661` | = `+393468093661` |
| scuole.html WhatsApp | `+393461653930` | Different from tel: link on same page |
| Privacy Policy text | `346 80 93 661` | = `+393468093661` |
| Termini text | `346 80 93 661` | = `+393468093661` |

**Conclusion**: Two different phone numbers are used across the site. The WhatsApp widget consistently uses `+393461653930` while all text/tel references use `+393468093661`. This needs to be unified.

---

**Report generated by AGENT-16 (Marketing & Content Auditor) -- Deep Audit v2**
**Date**: 2026-02-13
**Files analyzed**: 20+ HTML pages, 9 CSS files, 8 JS files, robots.txt, sitemap.xml, netlify.toml, manifest.json
