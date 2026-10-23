#!/usr/bin/env python3
"""Build an independent static interest page from canonical composition + editorial copy."""
import argparse
import hashlib
from html import escape as esc
import json
from pathlib import Path
import re
import shutil
from urllib.parse import quote, urlsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SUPERPROF = 'https://www.superprof.it/problemi-con-circuiti-riuscite-superare-esame-elettrotecnica-contattatemi-pentirete.html'
PHYSICS_REVIEW = 'https://www.superprof.it/problemi-con-fisica-riuscite-superare-gli-esami-fisica-contattatemi-pentirete.html'
MUR = 'https://www.mur.gov.it/it/news/venerdi-19062026/semestre-aperto-aa-2026-2027'

def load_catalog(path=HERE / 'catalog.json'):
    data = json.loads(Path(path).read_text())
    ref = (ROOT / data['composition']).resolve()
    if not ref.is_relative_to(ROOT):
        raise ValueError('composition_outside_repository')
    composition = json.loads(ref.read_text())
    canonical = json.dumps(composition, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)
    paths = composition['paths']
    ids = [p['id'] for p in paths]
    if not ids or len(ids) != len(set(ids)) or set(ids) != set(data['courses']):
        raise ValueError('editorial_copy_must_match_canonical_paths')
    if not re.fullmatch(r'[1-9][0-9]{6,14}', data['contact']['whatsapp']):
        raise ValueError('invalid_contact')
    courses = []
    for p in paths:
        if not re.fullmatch(r'[a-z][a-z0-9-]*', p['id']) or not p['title'].strip() or not p['unitIds']:
            raise ValueError('invalid_course_reference')
        courses.append({**data['courses'][p['id']], **p})
    return data, courses, {'id': composition['id'], 'version': composition['version'],
                           'sha256': hashlib.sha256(canonical.encode()).hexdigest(), 'bankRef': composition['bankRef']}

def contact_url(data, course):
    message = (f"Ciao Andrea, mi interessa il microcorso Ardesia di {data['subject']} «{course['title']}» "
               f"per il semestre filtro {data['academicYear']}. Vorrei ricevere informazioni quando "
               "saranno definiti programma, disponibilità e condizioni. È una manifestazione d’interesse non vincolante.")
    return f"https://wa.me/{data['contact']['whatsapp']}?text={quote(message, safe='')}"

def diagram(kind):
    # Original explanatory line drawings, no third-party assets or scientific simulation.
    bodies = {
      'mechanics': '<path d="M12 100L164 33M12 100H170"/><path d="M65 73l-14-28 29-13 14 28z"/><path d="M74 59L56 18M74 59v47M74 59l41-18"/><text x="49" y="17">N</text><text x="79" y="113">mg</text><text x="116" y="39">F</text>',
      'fluids': '<path d="M20 23v76q0 9 10 9h120q10 0 10-9V23"/><path class="wash" d="M21 54h138v45q0 8-9 8H30q-9 0-9-8z"/><path stroke-dasharray="5 5" d="M20 54h140"/><path d="M101 64v34m-4-28 4-6 4 6m-8 22 4 6 4-6"/><text x="109" y="85">h</text><text x="30" y="35">p = p₀ + ρgh</text>',
      'fields': '<path d="M38 64q52-88 104 0M38 64q52-56 104 0M38 64q52 56 104 0M38 64q52 88 104 0M38 64H142"/><circle cx="38" cy="64" r="13"/><circle cx="142" cy="64" r="13"/><text x="32" y="70">+</text><text x="136" y="70">−</text>',
      'waves': '<path d="M58 10v45m0 18v45M12 38h31M12 64h31M12 90h31M73 47q20 17 0 34M86 34q40 30 0 60M102 20q62 44 0 88M120 10q82 54 0 108"/>'}
    return '<svg class="course-diagram" viewBox="0 0 180 128" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">'+bodies.get(kind, bodies['waves'])+'</svg>'

def render(data, courses, identity, site_url=None):
    count_word = {1: 'Un', 2: 'Due', 3: 'Tre', 4: 'Quattro'}.get(len(courses), str(len(courses)))
    options = ''.join(f'<option value="{esc(c["id"])}" data-href="{esc(contact_url(data,c))}">{esc(c["title"])}</option>' for c in courses)
    def selector(suffix):
        return f'<label for="course-{suffix}">Scegli il percorso</label><select id="course-{suffix}" class="course-choice">{options}</select>'
    cards = []
    for i, c in enumerate(courses, 1):
        topics = ''.join(f'<li>{esc(t)}</li>' for t in c['topics'])
        outcomes = ''.join(f'<li>{esc(t)}</li>' for t in c['outcomes'])
        cards.append(f'''<article class="course-card" id="{esc(c['id'])}" aria-labelledby="title-{esc(c['id'])}">
 <div class="card-top"><span class="course-number">{i:02}</span><span class="unit-label">Unità {esc(' + '.join(u.removeprefix('U') for u in c['unitIds']))}</span></div>
 <h3 id="title-{esc(c['id'])}">{esc(c['title'])}</h3><p class="course-intro">{esc(c['intro'])}</p>
 <div class="card-subject"><ul class="topics">{topics}</ul>{diagram(c.get('symbol'))}</div>
 <details class="outcomes"><summary>Su cosa lavoreremo<span aria-hidden="true">+</span></summary><ul>{outcomes}</ul></details>
 <a class="course-cta" data-course="{esc(c['id'])}" href="{esc(contact_url(data,c))}" target="_blank" rel="noopener noreferrer">Mi interessa <span class="sr-only">{esc(c['title'])} su WhatsApp</span><span aria-hidden="true">↗</span></a></article>''')
    metadata = '<meta name="robots" content="noindex, nofollow">' if not site_url else f'<link rel="canonical" href="{esc(site_url)}"><meta property="og:url" content="{esc(site_url)}">'
    return f'''<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ardesia · Microcorsi di {esc(data['subject'])} {esc(data['academicYear'])}</title><meta name="description" content="{count_word} percorsi tematici per preparare {esc(data['subject'])} nel semestre filtro {esc(data['academicYear'])}. Scopri argomenti e obiettivi e manifesta interesse senza impegno su WhatsApp.">{metadata}
<meta name="theme-color" content="#faf9f6"><meta property="og:title" content="Ardesia · Dalle formule al ragionamento."><meta property="og:description" content="{count_word} microcorsi di {esc(data['subject'])}. Scegli da dove partire, senza impegno."><meta property="og:type" content="website"><meta property="og:locale" content="it_IT">
<link rel="icon" href="./assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="./assets/site.css"><script defer src="./assets/site.js"></script></head>
<body><a class="skip" href="#main">Vai al contenuto</a><header class="header shell"><a class="wordmark" href="./" aria-label="Ardesia, inizio pagina">Ardesia<span class="byline">con Andrea Marro</span></a><nav aria-label="Navigazione principale"><a href="#percorsi">Percorsi</a><a href="#docente">Il docente</a><a href="#domande">Domande</a></nav><span class="header-year">{esc(data['subject'])} · {esc(data['academicYear'])}</span></header>
<main id="main" class="shell">
<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><h1 id="hero-title">Dalle formule<br>al ragionamento.</h1><p class="lead">{count_word} microcorsi di {esc(data['subject'])} per il semestre filtro {esc(data['academicYear'])}. Scegli il tema su cui vuoi lavorare.</p><a class="button" href="#percorsi">Esplora i percorsi <span aria-hidden="true">↓</span></a><p class="hero-status">Proposte in preparazione · Interesse non vincolante</p></div>
<aside class="interest-panel" aria-labelledby="interest-title"><h2 id="interest-title">Da dove vuoi partire?</h2>{selector('hero')}<a class="button interest-link" href="{esc(contact_url(data,courses[0]))}" target="_blank" rel="noopener noreferrer">Mi interessa · WhatsApp <span aria-hidden="true">↗</span></a><p>Interesse non vincolante. Condizioni da definire.</p><p class="fine">Si apre una chat con il percorso scelto. Il messaggio lo invii tu.</p></aside></section>
<section class="courses section" id="percorsi" aria-labelledby="courses-title"><h2 id="courses-title">{count_word} percorsi.<br class="mobile-only"> Il tuo punto di partenza.</h2><p class="section-intro">{esc(data.get('audience', 'Per chi vuole affrontare un tema alla volta, collegando teoria ed esercizi.'))}</p><div class="course-grid">{''.join(cards)}</div><p class="syllabus">Riferimento: <a href="{esc(data.get('reference', {}).get('url', MUR))}" target="_blank" rel="noopener noreferrer">{esc(data.get('reference', {}).get('label', 'Programma di riferimento'))} ↗</a>. I raggruppamenti sono una proposta didattica di Andrea Marro.</p></section>
<section class="method section" aria-labelledby="method-title"><h2 id="method-title">Capire la scelta,<br>non solo il risultato.</h2><div><p>Partire dal problema. Riconoscere le grandezze. Scegliere il modello. Spiegare i passaggi e controllare la risposta.</p><p>Questi sono gli obiettivi proposti dei microcorsi. Il programma dettagliato e le modalità saranno comunicati prima di ogni eventuale adesione.</p><p class="fine">Preparazione indipendente, senza affiliazione al MUR o agli atenei. Nessuna garanzia di superamento della prova.</p></div></section>
<section class="section teacher" id="docente" aria-labelledby="teacher-title"><h2 id="teacher-title">Il docente,<br>prima del corso.</h2><div class="teacher-profile"><img src="./assets/andrea.webp" alt="Andrea Marro" width="160" height="160" loading="lazy"><div><h3>Andrea Marro</h3><p class="role">Insegnante e tutor scientifico</p><p>Lezioni di matematica, fisica, elettrotecnica ed elettronica. Un lavoro sul punto in cui si interrompe il ragionamento, per ricostruirlo un passaggio alla volta.</p><div class="teacher-links"><a href="{SUPERPROF}" target="_blank" rel="noopener noreferrer">Profilo e recensioni su Superprof ↗</a><a href="https://andreamarro.it/esempi" target="_blank" rel="noopener noreferrer">Il mio lavoro ↗</a></div></div></div>
<div class="review-grid"><figure><blockquote>“Spiega gli argomenti in modo semplice e chiaro”</blockquote><figcaption>Maddalena <span>Esperienza generale di lezione</span><a href="{SUPERPROF}" target="_blank" rel="noopener noreferrer">Fonte: Superprof ↗</a></figcaption></figure><figure><blockquote>“È stato preciso, pulito e mi ha dato molto supporto”</blockquote><figcaption>Huascar <span>Preparazione di Fisica per il semestre filtro</span><a href="{PHYSICS_REVIEW}" target="_blank" rel="noopener noreferrer">Fonte: Superprof ↗</a></figcaption></figure></div><p class="fine">Estratti già pubblicati sulle <a href="https://andreamarro.it/recensioni" target="_blank" rel="noopener noreferrer">recensioni delle lezioni</a>, non su questi nuovi microcorsi.</p></section>
<section class="section faq" id="domande" aria-labelledby="faq-title"><h2 id="faq-title">Prima di scrivermi.</h2>
<details open><summary>I corsi sono già confermati?<span aria-hidden="true">+</span></summary><p>Stiamo raccogliendo interesse. L’avvio e le condizioni saranno comunicati prima di ogni adesione. I percorsi sono proposte tematiche, non edizioni già confermate.</p></details>
<details><summary>Scrivere equivale a iscriversi?<span aria-hidden="true">+</span></summary><p>No. Aprire la chat o inviare il messaggio non prenota un posto, non comporta pagamenti e non conclude un’iscrizione. Serve a segnalare quale percorso ti interessa.</p></details>
<details><summary>Date, durata e costi?<span aria-hidden="true">+</span></summary><p>Calendario, durata, formato, numero di partecipanti ed eventuali costi sono ancora da definire. Riceverai le informazioni prima di decidere se aderire.</p></details>
<details><summary>Posso scegliere un solo percorso?<span aria-hidden="true">+</span></summary><p>Sì. Puoi indicare il tema che ti serve, oppure scrivere ad Andrea per confrontarti sul punto di partenza. Non è richiesta adesione a tutti i percorsi.</p></details>
<details><summary>Come si collega alla prova?<span aria-hidden="true">+</span></summary><p>I temi sono organizzati sulle unità del programma di {esc(data['subject'])}. Il lavoro proposto collega comprensione dei fenomeni, impostazione degli esercizi e controllo delle risposte. Per programma e regole ufficiali fai riferimento al MUR e al tuo ateneo.</p></details>
<details><summary>Che cosa succede ai miei dati?<span aria-hidden="true">+</span></summary><p>Questa pagina non contiene moduli di raccolta e non salva richieste in un database. La chat si svolge su WhatsApp: il testo è preparato sul tuo dispositivo e decidi tu se inviarlo. Consulta l’<a href="https://andreamarro.it/privacy" target="_blank" rel="noopener noreferrer">informativa di Andrea</a> e l’<a href="https://www.whatsapp.com/legal/privacy-policy-eea" target="_blank" rel="noopener noreferrer">informativa WhatsApp</a>.</p></details></section>
</main><footer class="shell footer"><div><a class="wordmark" href="./">Ardesia</a><p>Un progetto di Andrea Marro. {count_word} modi per cominciare dalla Fisica.</p><a href="mailto:{esc(data['contact']['email'])}">{esc(data['contact']['email'])}</a></div><div><a href="https://andreamarro.it/privacy" target="_blank" rel="noopener noreferrer">Privacy</a><a href="https://andreamarro.it/note-legali" target="_blank" rel="noopener noreferrer">Note legali</a><p>P. IVA 03934000047 · © 2026 Andrea Marro</p></div></footer>
<aside class="interest-bar" aria-label="Segnala il percorso che ti interessa" hidden><div class="shell bar-inner"><div class="bar-selection">{selector('sticky')}</div><div><a class="button interest-link" href="{esc(contact_url(data,courses[0]))}" target="_blank" rel="noopener noreferrer">Mi interessa <span aria-hidden="true">↗</span></a><p>Su WhatsApp · senza impegno</p></div></div></aside>
</body></html>'''

def build(output=HERE/'dist', site_url=None, catalog=HERE/'catalog.json'):
    if site_url:
        parsed = urlsplit(site_url)
        if parsed.scheme != 'https' or not parsed.netloc or parsed.query or parsed.fragment or parsed.username:
            raise ValueError('site_url_must_be_final_https_address')
        site_url = site_url.rstrip('/')+'/'
    data, courses, identity = load_catalog(catalog)
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    (output/'index.html').write_text(render(data,courses,identity,site_url))
    shutil.copytree(HERE/'assets', output/'assets', dirs_exist_ok=True)
    (output/'404.html').write_text('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Pagina non trovata · Ardesia</title><body style="font:1.2rem system-ui;background:#faf9f6;color:#171725;max-width:42rem;margin:15vh auto;padding:2rem"><h1>Questo percorso non c’è.</h1><p>La pagina richiesta non è disponibile.</p><a href="'+esc(site_url or '/')+'">Torna ai microcorsi di '+esc(data['subject'])+'</a></body></html>')
    (output/'robots.txt').write_text('User-agent: *\nDisallow: /\n' if not site_url else 'User-agent: *\nAllow: /\nSitemap: '+site_url+'sitemap.xml\n')
    if site_url:
        (output/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+esc(site_url)+'</loc></url></urlset>')
    elif (output/'sitemap.xml').exists():
        (output/'sitemap.xml').unlink()
    (output/'source-manifest.json').write_text(json.dumps({'composition':identity,'mode':'production-ready' if site_url else 'preview','courseIds':[c['id'] for c in courses]},indent=2)+'\n')
    return output

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=HERE/'dist');parser.add_argument('--site-url');args=parser.parse_args()
    print(build(args.output,args.site_url))
