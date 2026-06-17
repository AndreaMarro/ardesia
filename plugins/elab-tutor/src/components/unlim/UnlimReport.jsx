/**
 * UnlimReport — FUMETTO ELAB della lezione
 * Report comic-style: pannelli irregolari, balloon con tail SVG, mascotte,
 * scene tipizzate (Scoperta/Oops/Eureka/Domandona), grafici SVG inline.
 * Il docente aggiunge screenshot e foto, poi stampa -> PDF.
 * Usa solo DOM methods sicuri.
 * SECURITY: All user text is escaped via esc() before template insertion.
 * The only non-escaped content is hardcoded SVG icon constants.
 * (c) Andrea Marro — 31/03/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { getSavedSessions, getLastSession } from '../../hooks/useSessionTracker';
import { getLessonPath } from '../../data/lesson-paths';

// ─── Helpers ────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDuration(start, end) {
  if (!start || !end) return '\u2014';
  const min = Math.round((new Date(end) - new Date(start)) / 60000);
  if (min < 1) return '< 1 min';
  return `${min} min`;
}

function esc(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function humanize(id) {
  const m = {
    led_base: 'LED', resistenza_ohm: 'Legge di Ohm', circuito_serie: 'Serie',
    circuito_parallelo: 'Parallelo', condensatore_energia: 'Condensatore',
    carica_scarica_RC: 'RC', controllo_indiretto: 'Controllo indiretto',
    catena_reazione: 'Catena', potenziometro: 'Potenziometro',
    fotoresistore: 'LDR', pwm_duty: 'PWM', servo_angolo: 'Servo',
    digitalRead: 'digitalRead', analogRead: 'analogRead',
    digitalWrite: 'digitalWrite', analogWrite: 'analogWrite/PWM',
    tau_RC: '\u03C4 RC', R_varia_scarica: 'R scarica',
    multimetro_tensione: 'Multimetro V', scarica_esponenziale: 'Scarica exp',
  };
  return m[id] || id.replace(/_/g, ' ');
}

function volumeColor(expId) {
  if (!expId) return 'var(--elab-navy)';
  if (expId.startsWith('v1')) return 'var(--elab-lime)';
  if (expId.startsWith('v2')) return 'var(--elab-orange)';
  if (expId.startsWith('v3')) return 'var(--elab-red)';
  return 'var(--elab-navy)';
}

function volumeNum(expId) {
  if (!expId) return '';
  if (expId.startsWith('v1')) return '1';
  if (expId.startsWith('v2')) return '2';
  if (expId.startsWith('v3')) return '3';
  return '';
}

// ─── SVG Inline Icons (hardcoded constants — not user content) ──────

const SVG_ROBOT = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="14" height="12" rx="2"/><circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/><path d="M12 2v4"/><circle cx="12" cy="2" r="1" fill="currentColor" stroke="none"/><path d="M3 14h2"/><path d="M19 14h2"/></svg>`;

const SVG_LIGHTBULB = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`;

const SVG_WARNING = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

const SVG_TROPHY = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;

const SVG_STAR = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const SVG_BOOK = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>`;

const SVG_QUESTION = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

const SVG_CAMERA = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>`;

const SVG_PRINT = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;

const SVG_SCREENSHOT = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/><path d="M9 13h6"/></svg>`;

const SVG_X = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const SVG_STUDENT = `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/><path d="M18 8h2"/><path d="M20 6v4"/></svg>`;

const SVG_ARROW_UP = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12l5-5 5 5"/><path d="M12 7v10"/></svg>`;

// ─── Scene builder ──────────────────────────────────────────────────

function buildScenes(session, lessonPath) {
  const scenes = [];
  const msgs = session?.messages || [];
  const errs = session?.errors || [];

  if (lessonPath?.title) {
    scenes.push({
      type: 'intro',
      title: lessonPath.title,
      text: lessonPath.objective || 'Scopriamo insieme qualcosa di nuovo!',
    });
  }

  let pairIdx = 0;
  const sceneTypes = [
    { title: 'Si comincia!', mood: 'discovery' },
    { title: 'Andiamo avanti...', mood: 'discovery' },
    { title: 'Approfondiamo!', mood: 'eureka' },
    { title: 'Che curiosit\u00E0!', mood: 'eureka' },
    { title: 'Ancora...', mood: 'discovery' },
    { title: 'Un passo in pi\u00F9', mood: 'discovery' },
    { title: 'Quasi alla fine!', mood: 'eureka' },
    { title: 'Ecco!', mood: 'eureka' },
  ];

  for (let i = 0; i < msgs.length; i++) {
    if (msgs[i].role === 'user') {
      const resp = msgs[i + 1]?.role === 'assistant' ? msgs[i + 1] : null;
      const t0 = msgs[i].timestamp ? new Date(msgs[i].timestamp).getTime() : 0;
      const t1 = resp?.timestamp ? new Date(resp.timestamp).getTime() : t0 + 60000;
      const sceneErrs = (!t0) ? [] : errs.filter(e => {
        if (!e.timestamp) return false;
        const t = new Date(e.timestamp).getTime();
        return t >= t0 - 5000 && t <= t1 + 5000;
      });

      let scene = sceneTypes[pairIdx % sceneTypes.length];
      const q = msgs[i].text.toLowerCase();
      if (sceneErrs.length) scene = { title: 'Oops!', mood: 'oops' };
      else if (q.includes('cos\'') || q.includes('cosa ')) scene = { title: 'Domandona!', mood: 'question' };
      else if (q.includes('perch')) scene = { title: 'Perch\u00E9?', mood: 'question' };
      else if (q.includes('funzion')) scene = { title: 'Come funziona?', mood: 'discovery' };
      else if (q.includes('aiut') || q.includes('help')) scene = { title: 'Aiuto!', mood: 'question' };

      scenes.push({
        type: 'dialog',
        title: scene.title,
        mood: scene.mood,
        question: msgs[i],
        answer: resp,
        errors: sceneErrs,
      });
      if (resp) i++;
      pairIdx++;
    }
  }

  scenes.push({
    type: 'finale',
    concepts: lessonPath?.session_save?.concepts_covered || [],
    nextId: lessonPath?.session_save?.next_suggested || null,
  });

  return scenes;
}

function captureSimulatorScreenshot() {
  const svg = document.querySelector('.simulator-canvas svg, [data-simulator-canvas] svg');
  if (!svg) return null;
  try {
    const clone = svg.cloneNode(true);
    const { width, height } = svg.getBoundingClientRect();
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);
    const data = new XMLSerializer().serializeToString(clone);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
  } catch {
    return null;
  }
}

// ─── Photo slot helper ──────────────────────────────────────────────

function photoSlotHTML(idx) {
  return `
    <div class="photo-slot no-print" data-scene="${idx}">
      <button class="add-photo-btn" onclick="addPhoto(${idx})">${SVG_CAMERA} Aggiungi foto</button>
      <span class="photo-hint">Breadboard, circuito, classe...</span>
    </div>
    <div class="photo-container" id="photos-${idx}"></div>`;
}

// ─── SVG stat bar ───────────────────────────────────────────────────

function statBarSVG(label, value, max, color) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return `<div class="stat-bar-row">
    <span class="stat-bar-label">${esc(label)}</span>
    <div class="stat-bar-track">
      <div class="stat-bar-fill" style="width:${pct}%;background:${color}"></div>
    </div>
    <span class="stat-bar-value">${value}</span>
  </div>`;
}

// ─── Mood config ────────────────────────────────────────────────────

function moodConfig(mood, volCol) {
  const configs = {
    discovery: { bg: 'var(--elab-hex-f0f8ff)', border: volCol, icon: SVG_LIGHTBULB, accent: volCol },
    eureka: { bg: '#FFFEF0', border: 'var(--elab-orange)', icon: SVG_LIGHTBULB, accent: 'var(--elab-orange)' },
    oops: { bg: 'var(--elab-hex-fff5f5)', border: 'var(--elab-hex-d32f2f)', icon: SVG_WARNING, accent: 'var(--elab-hex-d32f2f)' },
    question: { bg: 'var(--elab-hex-f5f0ff)', border: 'var(--elab-hex-7c3aed)', icon: SVG_QUESTION, accent: 'var(--elab-hex-7c3aed)' },
  };
  return configs[mood] || configs.discovery;
}

// ─── Photo JS (safe DOM-only, no user-content in markup) ────────────

function photoScript(volCol, svgX) {
  // NOTE: The svgX variable contains a hardcoded SVG close icon constant.
  // It is NOT user input. The btn.textContent approach won't work for SVG,
  // so we use a safe, pre-sanitized constant via DOM createRange/createContextualFragment.
  return `
function addPhoto(sceneIdx){
  var inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';inp.capture='environment';inp.multiple=true;
  inp.onchange=function(e){
    Array.from(e.target.files).forEach(function(f){
      if(f.size>5*1024*1024)return;
      var r=new FileReader();
      r.onload=function(ev){
        var c=document.getElementById('photos-'+sceneIdx);if(!c)return;
        var img2=new Image();
        img2.onload=function(){
          var maxW=800,maxH=600,w=img2.width,h=img2.height;
          if(w>maxW||h>maxH){var ratio=Math.min(maxW/w,maxH/h);w*=ratio;h*=ratio;}
          var canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
          canvas.getContext('2d').drawImage(img2,0,0,w,h);
          var dataUrl=canvas.toDataURL('image/jpeg',0.7);
          var w2=document.createElement('div');w2.className='photo-wrapper';
          var imgEl=document.createElement('img');imgEl.src=dataUrl;imgEl.alt='Foto';
          w2.appendChild(imgEl);
          var caption=document.createElement('input');caption.className='photo-caption no-print';
          caption.placeholder='Didascalia...';caption.type='text';
          w2.appendChild(caption);
          var btn=document.createElement('button');btn.className='photo-remove no-print';
          btn.textContent='\\u00D7';
          btn.onclick=function(){w2.remove()};w2.appendChild(btn);
          c.appendChild(w2);
        };
        img2.src=ev.target.result;
      };r.readAsDataURL(f);
    });
  };inp.click();
}
function addPhotoGlobal(){
  var slots=document.querySelectorAll('.photo-slot');
  if(slots.length>0){
    var last=slots[slots.length-1];
    addPhoto(Number(last.dataset.scene)||0);
  }
}
function addScreenshot(){
  var inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';
  inp.onchange=function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(ev){
      var grid=document.querySelector('.comic-grid');
      if(!grid)return;
      var div=document.createElement('div');
      div.className='panel panel-screenshot';
      div.style.setProperty('--panel-accent','${volCol}');
      var header=document.createElement('div');header.className='panel-header';
      var titleEl=document.createElement('span');titleEl.className='panel-title';
      titleEl.style.color='${volCol}';titleEl.textContent='Il nostro circuito';
      header.appendChild(titleEl);div.appendChild(header);
      var wrap=document.createElement('div');wrap.className='screenshot-wrap';
      var pw=document.createElement('div');pw.className='photo-wrapper';
      var img=document.createElement('img');img.src=ev.target.result;img.alt='Circuito';img.className='screenshot-img';
      pw.appendChild(img);
      var rm=document.createElement('button');rm.className='photo-remove no-print';
      rm.textContent='\\u00D7';
      rm.onclick=function(){div.remove()};pw.appendChild(rm);
      wrap.appendChild(pw);div.appendChild(wrap);
      grid.insertBefore(div,grid.firstChild);
    };r.readAsDataURL(f);
  };inp.click();
}`;
}

// ─── HTML Builder ───────────────────────────────────────────────────

function buildReportHTML(session, lessonPath, screenshotDataUrl) {
  const title = lessonPath?.title || session?.experimentId || 'Sessione ELAB';
  const date = formatDate(session?.startTime);
  const dur = formatDuration(session?.startTime, session?.endTime);
  const nMsg = session?.messages?.length || 0;
  const nErr = session?.errors?.length || 0;
  const concepts = lessonPath?.session_save?.concepts_covered || [];
  const volCol = volumeColor(session?.experimentId);
  const volN = volumeNum(session?.experimentId);
  const nextPath = lessonPath?.session_save?.next_suggested
    ? getLessonPath(lessonPath.session_save.next_suggested) : null;

  const scenes = buildScenes(session, lessonPath);
  const maxMsgs = Math.max(nMsg, nErr, concepts.length, 1);

  const scenesHTML = scenes.map((sc, idx) => {
    const num = idx + 1;

    if (sc.type === 'intro') {
      return `
      <div class="panel panel-intro" style="--panel-accent:${volCol}">
        <div class="panel-num">${num}</div>
        <div class="panel-body intro-body">
          <div class="mascot-circle" style="border-color:${volCol}">${SVG_ROBOT}</div>
          <div class="intro-content">
            <h2 class="intro-title" style="color:${volCol}">${esc(sc.title)}</h2>
            <p class="intro-text">${esc(sc.text)}</p>
            ${volN ? `<span class="vol-badge" style="background:${volCol}">Volume ${volN}</span>` : ''}
          </div>
        </div>
        ${photoSlotHTML(idx)}
      </div>`;
    }

    if (sc.type === 'dialog') {
      const mc = moodConfig(sc.mood, volCol);
      const qT = formatTime(sc.question.timestamp);

      return `
      <div class="panel panel-dialog" style="--panel-accent:${mc.border};background:${mc.bg}">
        <div class="panel-num" style="background:${mc.border}">${num}</div>
        <div class="panel-header">
          <span class="mood-icon" style="color:${mc.accent}">${mc.icon}</span>
          <span class="panel-title" style="color:${mc.accent}">${esc(sc.title)}</span>
          ${qT ? `<span class="panel-time">${qT}</span>` : ''}
        </div>
        <div class="comic-row">
          <div class="char-col">
            <div class="char-avatar char-student">${SVG_STUDENT}</div>
            <div class="char-name">Classe</div>
          </div>
          <div class="balloon balloon-q">
            <div class="balloon-content">${esc(sc.question.text)}</div>
            <svg class="balloon-tail-svg tail-left-svg" width="16" height="20" viewBox="0 0 16 20">
              <path d="M16 0 C12 6, 2 8, 0 20 C4 14, 10 10, 16 8 Z" fill="var(--elab-hex-d6e4f5)"/>
            </svg>
          </div>
        </div>
        ${sc.errors.map(e => `
        <div class="error-strip">
          <span class="error-icon">${SVG_WARNING}</span>
          <span><strong>Oops!</strong> ${esc(e.detail || e.type)}</span>
        </div>`).join('')}
        ${sc.answer ? `
        <div class="comic-row row-flip">
          <div class="balloon balloon-a">
            <div class="balloon-content">${esc(sc.answer.text)}</div>
            <svg class="balloon-tail-svg tail-right-svg" width="16" height="20" viewBox="0 0 16 20">
              <path d="M0 0 C4 6, 14 8, 16 20 C12 14, 6 10, 0 8 Z" fill="var(--elab-hex-d6f0d6)"/>
            </svg>
          </div>
          <div class="char-col">
            <div class="char-avatar char-robot" style="border-color:${volCol}">${SVG_ROBOT}</div>
            <div class="char-name" style="color:${volCol}">UNLIM</div>
          </div>
        </div>` : ''}
        ${photoSlotHTML(idx)}
      </div>`;
    }

    if (sc.type === 'finale') {
      const pills = sc.concepts.length > 0
        ? sc.concepts.map(c => `<span class="pill" style="--pill-color:${volCol}">${esc(humanize(c))}</span>`).join('')
        : '<span class="pill pill-empty">Sessione libera</span>';

      return `
      <div class="panel panel-finale" style="--panel-accent:${volCol}">
        <div class="panel-num" style="background:${volCol}">${num}</div>
        <div class="panel-body finale-body">
          <div class="trophy-circle" style="color:${volCol}">${SVG_TROPHY}</div>
          <div class="finale-content">
            <h2 class="finale-title" style="color:${volCol}">Missione completata!</h2>
            <div class="stats-mini">
              ${statBarSVG('Domande', nMsg, maxMsgs, volCol)}
              ${statBarSVG('Errori', nErr, maxMsgs, 'var(--elab-hex-d32f2f)')}
              ${statBarSVG('Concetti', concepts.length, maxMsgs, 'var(--elab-lime)')}
            </div>
            <p class="finale-label">Concetti conquistati:</p>
            <div class="pills">${pills}</div>
            ${nErr > 0
              ? `<p class="finale-note">${SVG_ARROW_UP} ${nErr} ${nErr === 1 ? 'errore superato' : 'errori superati'} — sbagliando si impara!</p>`
              : `<p class="finale-note">${SVG_STAR} Zero errori — sessione perfetta!</p>`}
            ${nextPath ? `<div class="next-box" style="border-color:${volCol}40">${SVG_BOOK} <strong>Prossima avventura:</strong> ${esc(nextPath.title)}</div>` : ''}
          </div>
        </div>
        ${photoSlotHTML(idx)}
      </div>`;
    }
    return '';
  }).join('');

  const screenshotHTML = screenshotDataUrl
    ? `<div class="panel panel-screenshot" style="--panel-accent:${volCol}">
        <div class="panel-num" style="background:${volCol}">${SVG_SCREENSHOT}</div>
        <div class="panel-header"><span class="panel-title" style="color:${volCol}">Il nostro circuito</span></div>
        <div class="screenshot-wrap"><img src="${screenshotDataUrl}" alt="Screenshot circuito" class="screenshot-img"></div>
       </div>` : '';

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fumetto ELAB — ${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',system-ui,sans-serif;color:var(--elab-hex-1a1a2e);background:var(--elab-hex-e8e8f0);line-height:1.55}
@media print{body{background:#fff}.no-print{display:none!important}.wrap{box-shadow:none;margin:0;max-width:none;border-radius:0}.cover-page{break-after:page}.panel{break-inside:avoid}.panel-finale{break-before:page}@page{margin:1cm 1.4cm;size:A4}}
.wrap{max-width:840px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 6px 30px rgba(0,0,0,0.1);overflow:hidden}
.toolbar{position:sticky;top:0;z-index:100;background:#fff;padding:12px 20px;display:flex;justify-content:center;gap:10px;border-bottom:1px solid var(--elab-hex-e0e0e0);box-shadow:0 2px 8px rgba(0,0,0,0.05);flex-wrap:wrap}
.tb{padding:10px 24px;font-size:14px;font-weight:700;font-family:'Oswald',sans-serif;letter-spacing:.5px;border:none;border-radius:8px;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:6px}
.tb svg{vertical-align:middle}
.tb-pr{background:var(--elab-navy);color:#fff}.tb-pr:hover{background:#163B6C}
.tb-sc{background:#F0F2F5;color:var(--elab-navy)}.tb-sc:hover{background:#E0E4EA}
.tb-photo{background:${volCol};color:#fff}.tb-photo:hover{filter:brightness(0.9)}
.cover-page{background:linear-gradient(135deg,${volCol} 0%,var(--elab-navy) 100%);color:#fff;padding:56px 36px;text-align:center;position:relative;overflow:hidden}
.cover-page::before{content:'';position:absolute;inset:0;background:radial-gradient(circle 2px at 30px 30px, rgba(255,255,255,0.08) 1px, transparent 2px);background-size:60px 60px;opacity:.6}
.cover-inner{position:relative;z-index:1}
.cover-mascot{width:100px;height:100px;border-radius:24px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff}
.cover-h1{font-family:'Oswald',sans-serif;font-size:32px;font-weight:700;letter-spacing:-.5px;margin-bottom:4px}
.cover-sub{font-family:'Oswald',sans-serif;font-size:20px;font-weight:500;opacity:.9}
.cover-meta{font-size:14px;opacity:.7;margin-top:8px}
.cover-badge{display:inline-block;background:rgba(255,255,255,.18);padding:5px 16px;border-radius:20px;font-size:14px;letter-spacing:.5px;margin-top:8px;font-weight:700}
.stats{display:flex;border-bottom:2px solid var(--elab-hex-f0f0f0)}
.st{flex:1;text-align:center;padding:16px 8px;border-right:1px solid var(--elab-hex-f0f0f0)}.st:last-child{border:none}
.st-v{font-family:'Oswald',sans-serif;font-size:24px;font-weight:700;color:${volCol}}
.st-l{font-size:14px;color:var(--elab-hex-737373);text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
.comic-grid{padding:20px 24px;display:flex;flex-direction:column;gap:22px}
.panel{border:3px solid var(--panel-accent,var(--elab-navy));border-radius:18px 4px 18px 4px;padding:22px 24px;position:relative;background:#FAFBFE}
.panel:nth-child(even){border-radius:4px 18px 4px 18px}
.panel-num{position:absolute;top:-14px;left:18px;width:28px;height:28px;border-radius:50%;background:var(--panel-accent,var(--elab-navy));color:#fff;font-family:'Oswald',sans-serif;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.15)}
.panel-header{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-top:4px}
.mood-icon{display:flex;align-items:center}
.panel-title{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;letter-spacing:.3px;text-transform:uppercase}
.panel-time{font-size:14px;color:var(--elab-hex-737373);margin-left:auto;font-weight:600}
.panel-intro,.panel-finale{background:linear-gradient(135deg,var(--elab-hex-fafffe),var(--elab-hex-f0f8f0))}
.intro-body,.finale-body{display:flex;align-items:center;gap:20px;margin-top:8px}
.mascot-circle{width:80px;height:80px;border-radius:50%;border:3px solid var(--elab-navy);display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#fff;color:var(--elab-navy);box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.intro-content,.finale-content{flex:1}
.intro-title,.finale-title{font-family:'Oswald',sans-serif;font-size:22px}
.intro-text{font-size:15px;color:#444;margin-top:4px}
.vol-badge{display:inline-block;color:#fff;padding:3px 12px;border-radius:12px;font-size:14px;font-weight:700;margin-top:8px}
.trophy-circle{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(135deg,var(--elab-hex-fff8e1),var(--elab-hex-fffde7));box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.stats-mini{margin:12px 0}
.stat-bar-row{display:flex;align-items:center;gap:8px;margin:4px 0}
.stat-bar-label{font-size:14px;font-weight:700;color:var(--elab-hex-737373);text-transform:uppercase;width:70px;text-align:right}
.stat-bar-track{flex:1;height:8px;background:var(--elab-hex-e8e8f0);border-radius:4px;overflow:hidden}
.stat-bar-fill{height:100%;border-radius:4px}
.stat-bar-value{font-family:'Oswald',sans-serif;font-size:16px;font-weight:700;width:30px}
.finale-label{font-size:14px;font-weight:700;color:var(--elab-hex-737373);text-transform:uppercase;letter-spacing:.4px;margin-top:8px}
.pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.pill{padding:5px 12px;border-radius:16px;font-size:14px;font-weight:700;background:color-mix(in srgb, var(--pill-color) 12%, white);color:var(--pill-color);border:1.5px solid color-mix(in srgb, var(--pill-color) 30%, white)}
.pill-empty{background:var(--elab-hex-f5f5f5);color:var(--elab-hex-737373);border-color:var(--elab-hex-e0e0e0)}
.finale-note{font-size:14px;margin-top:10px;color:#444;display:flex;align-items:center;gap:6px}
.finale-note svg{flex-shrink:0}
.next-box{margin-top:12px;padding:12px 16px;border-radius:12px;background:var(--elab-hex-f0fff4);border:1.5px solid;font-size:14px;color:var(--elab-hex-2d5a1a);display:flex;align-items:center;gap:8px}
.comic-row{display:flex;align-items:flex-start;gap:12px;margin:10px 0}
.row-flip{flex-direction:row-reverse}
.char-col{text-align:center;flex-shrink:0;width:56px}
.char-avatar{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.char-student{background:#E3ECFA;border:2px solid #B8CCE8;color:var(--elab-navy)}
.char-robot{background:var(--elab-hex-e3f5e3);border:2px solid var(--elab-hex-b8d8b8);color:var(--elab-hex-2d5a1a)}
.char-name{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:var(--elab-hex-737373);margin-top:3px}
.balloon{flex:1;padding:14px 18px;border-radius:18px;font-size:14px;line-height:1.6;position:relative;word-wrap:break-word}
.balloon-q{background:var(--elab-hex-d6e4f5);border:2px solid var(--elab-hex-b8cce8)}
.balloon-a{background:var(--elab-hex-d6f0d6);border:2px solid var(--elab-hex-b8d8b8)}
.balloon-content{position:relative;z-index:1}
.balloon-tail-svg{position:absolute;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.05))}
.tail-left-svg{left:-14px;top:14px}
.tail-right-svg{right:-14px;top:14px}
.error-strip{display:flex;align-items:center;gap:8px;margin:6px 0 8px 68px;padding:10px 14px;background:var(--elab-hex-fff3e0);border:2px solid var(--elab-hex-ffcc80);border-radius:12px;font-size:14px;color:var(--elab-hex-bf360c)}
.error-icon{flex-shrink:0;color:var(--elab-hex-bf360c)}
.panel-screenshot{text-align:center}
.screenshot-wrap{margin-top:8px}
.screenshot-img{max-width:100%;border-radius:12px;border:2px solid var(--elab-hex-e0e0e0)}
.photo-slot{margin-top:12px;text-align:center}
.add-photo-btn{padding:8px 18px;border:2px dashed var(--elab-hex-b0bec5);border-radius:10px;background:transparent;color:var(--elab-hex-607d8b);font-size:14px;font-family:'Open Sans',sans-serif;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:6px}
.add-photo-btn:hover{border-color:var(--elab-navy);color:var(--elab-navy);background:#F0F4F8}
.add-photo-btn svg{vertical-align:middle}
.photo-hint{display:block;font-size:14px;color:var(--elab-hex-737373);margin-top:2px}
.photo-container{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;justify-content:center}
.photo-container img{max-width:240px;max-height:180px;border-radius:12px;border:2px solid var(--elab-hex-e0e0e0);object-fit:cover}
.photo-wrapper{position:relative;display:inline-block}
.photo-caption{display:block;width:100%;padding:4px 8px;border:1px solid var(--elab-hex-e0e0e0);border-radius:6px;margin-top:4px;font-size:14px;font-family:'Open Sans',sans-serif;text-align:center;outline:none}
.photo-caption:focus{border-color:var(--elab-navy)}
.photo-remove{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;border:2px solid #fff;background:var(--elab-hex-d32f2f);color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.2);padding:0;line-height:1}
.footer{text-align:center;padding:16px 24px;border-top:1px solid var(--elab-hex-e8e8e8);font-size:14px;color:var(--elab-hex-737373)}
.footer a{color:var(--elab-navy);text-decoration:none;font-weight:700}
</style>
</head>
<body>
<div class="toolbar no-print">
  <button class="tb tb-pr" onclick="window.print()">${SVG_PRINT} STAMPA / SALVA PDF</button>
  <button class="tb tb-photo" onclick="addPhotoGlobal()">${SVG_CAMERA} AGGIUNGI FOTO</button>
  <button class="tb tb-sc" onclick="addScreenshot()">${SVG_SCREENSHOT} SCREENSHOT</button>
  <button class="tb tb-sc" onclick="window.close()">${SVG_X} CHIUDI</button>
</div>
<div class="wrap">
  <div class="cover-page">
    <div class="cover-inner">
      <div class="cover-mascot">${SVG_ROBOT}</div>
      <h1 class="cover-h1">${esc(title)}</h1>
      <div class="cover-sub">Il Fumetto della Lezione</div>
      <div class="cover-meta">${date} · ${dur} · ${nMsg} messaggi</div>
      <div class="cover-badge">ELAB Tutor${volN ? ' — Volume ' + volN : ''}</div>
    </div>
  </div>
  <div class="stats">
    <div class="st"><div class="st-v">${dur}</div><div class="st-l">Durata</div></div>
    <div class="st"><div class="st-v">${nMsg}</div><div class="st-l">Domande</div></div>
    <div class="st"><div class="st-v">${nErr}</div><div class="st-l">${nErr === 1 ? 'Errore' : 'Errori'}</div></div>
    <div class="st"><div class="st-v">${concepts.length}</div><div class="st-l">Concetti</div></div>
  </div>
  ${screenshotHTML}
  <div class="comic-grid">
    ${scenesHTML}
  </div>
  <div class="footer">
    <a href="https://elabtutor.school">elabtutor.school</a> &mdash; ELAB Tutor &mdash; ${date}
  </div>
</div>
<script>
${photoScript(volCol, SVG_X)}
<\/script>
</body>
</html>`;
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Open Fumetto report in new window.
 * @returns {'ok'|'downloaded'|'no-session'|'no-content'|'error'}
 *   ok         — popup opened successfully
 *   downloaded — popup blocked, fallback .html download triggered
 *   no-session — localStorage "elab_unlim_sessions" is empty (new user)
 *   no-content — session exists but has 0 messages AND 0 errors (nothing to report)
 *   error      — unexpected runtime error
 */
/**
 * iter 35 P0 — fallback session locale quando Supabase/localStorage vuoti.
 * Andrea iter 34: "il fumetto non viene mai fatto generare". Causa: nuovi
 * docenti senza sessione salvata vedevano solo toast "no-session" e nessun
 * fumetto generato. Adesso costruiamo una sessione minima dal contesto
 * corrente (esperimento attivo + lesson path) così il docente vede SEMPRE
 * un fumetto avviato anche al primo click.
 */
function buildStubSession(experimentId) {
  const expId = experimentId || (typeof window !== 'undefined' ? window.__ELAB_API?.getCurrentExperiment?.()?.id : null) || 'sessione';
  const now = new Date().toISOString();
  return {
    id: `stub-${Date.now()}`,
    experimentId: expId,
    startedAt: now,
    endedAt: now,
    messages: [],
    errors: [],
    summary: { stub: true },
    isStub: true,
  };
}

export function openReportWindow(experimentId) {
  let session;
  let isStub = false;
  if (experimentId) {
    const sessions = getSavedSessions();
    session = [...sessions].reverse().find(s => s.experimentId === experimentId);
  }
  if (!session) session = getLastSession();

  // iter 35 P0: NON ritornare più 'no-session' / 'no-content' senza output —
  // costruisci stub session locale così il fumetto si apre sempre.
  if (!session) {
    session = buildStubSession(experimentId);
    isStub = true;
  } else if (!session.messages?.length && !session.errors?.length) {
    // sessione esiste ma vuota: usala con flag stub-like per messaggio fumetto
    session = { ...session, isStub: true };
    isStub = true;
  }

  try {
    const lessonPath = getLessonPath(session.experimentId);
    const screenshot = captureSimulatorScreenshot();
    const html = buildReportHTML(session, lessonPath, screenshot);

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const popup = window.open(url, '_blank');

    if (!popup) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `fumetto-elab-${session.experimentId || 'sessione'}.html`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return isStub ? 'downloaded-stub' : 'downloaded';
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return isStub ? 'ok-stub' : 'ok';
  } catch {
    return 'error';
  }
}

export function isReportCommand(text) {
  if (!text) return false;
  const l = text.toLowerCase().trim();
  return [
    /^(crea|genera|fai|apri|mostra|stampa)\s+(il\s+)?(report|fumetto)$/,
    /^(report|fumetto)$/,
    /^(report|fumetto)\s+(della\s+)?(sessione|lezione)$/,
  ].some(p => p.test(l));
}
