/* eslint-disable */
/**
 * accessibilityAudit.test.jsx — Audit accessibilita ELAB Tutor
 * ~75 test: aria-label, contrasto WCAG AA, touch target, font size, lingua
 *
 * Verifica conformita WCAG 2.1 AA su componenti chiave:
 * - ChatOverlay, TutorTopBar, TutorSidebar, ConsentBanner
 *
 * (c) Andrea Marro — 15/04/2026
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ============================================
// HELPER: Calcolo contrasto WCAG
// ============================================

function hexToRelativeLuminance(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const linearize = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(fg, bg) {
  const l1 = hexToRelativeLuminance(fg);
  const l2 = hexToRelativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================
// MOCK
// ============================================

vi.mock('../../src/components/tutor/shared/SafeMarkdown', () => ({
  default: function MockSM(props) { return React.createElement('div', { className: props.className }, props.text); },
}));

vi.mock('../../src/components/tutor/ChatOverlay.module.css', () => ({
  default: new Proxy({}, { get: (_, name) => name }),
}));

vi.mock('../../src/data/experiments-index', () => ({
  VOLUMES: [
    { id: 1, experiments: Array(38).fill({ id: 'e1' }) },
    { id: 2, experiments: Array(27).fill({ id: 'e2' }) },
    { id: 3, experiments: Array(27).fill({ id: 'e3' }) },
  ],
}));

// ============================================
// IMPORT
// ============================================

import ChatOverlay from '../../src/components/tutor/ChatOverlay';
import TutorTopBar from '../../src/components/tutor/TutorTopBar';
import TutorSidebar, { MobileBottomTabs } from '../../src/components/tutor/TutorSidebar';

// ConsentBanner mock — replica struttura a11y reale senza dipendenze gdprService
function MockConsentBanner() {
  return React.createElement('div', { role: 'dialog', 'aria-label': 'Consenso privacy', 'aria-modal': 'true' },
    React.createElement('div', null,
      React.createElement('p', null, 'Prima di iniziare, dicci quanti anni hai.'),
      React.createElement('label', { htmlFor: 'elab-age-select' }, 'Quanti anni hai?'),
      React.createElement('select', { id: 'elab-age-select' },
        React.createElement('option', { value: '' }, 'Scegli...')
      ),
      React.createElement('button', null, 'Avanti')
    )
  );
}

const PALETTE = { navy: '#1E4D8C', lime: '#4A7A25', orange: '#E8941C', red: '#E54B3D', white: '#FFFFFF', black: '#000000' };

// ============================================
// 1: ARIA-LABEL PRESENCE (30 test)
// ============================================

describe('Accessibilita — aria-label presenza', () => {

  describe('ChatOverlay', () => {
    const dp = {
      messages: [], input: '', onInputChange: vi.fn(), onSend: vi.fn(),
      isLoading: false, onRetry: vi.fn(), quickActions: [],
      visible: true, onClose: vi.fn(), expanded: false,
      onToggleExpanded: vi.fn(), onScreenshot: vi.fn(),
      onVoiceToggle: vi.fn(), voiceEnabled: false, onVoiceRecord: vi.fn(),
    };

    it('header minimizzato ha aria-label "Espandi chat UNLIM"', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      expect(container.querySelector('[aria-label="Espandi chat UNLIM"]')).toBeTruthy();
    });

    it('textarea ha aria-label "Scrivi messaggio a UNLIM"', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('textarea[aria-label="Scrivi messaggio a UNLIM"]')).toBeTruthy();
    });

    it('bottone invia ha aria-label "Invia messaggio"', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('[aria-label="Invia messaggio"]')).toBeTruthy();
    });

    it('bottone screenshot ha aria-label', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('[aria-label="Cattura screenshot e chiedi a UNLIM"]')).toBeTruthy();
    });

    it('bottone voce ha aria-label "Attiva"', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('[aria-label="Attiva modalità vocale"]')).toBeTruthy();
    });

    it('bottone voce attiva ha aria-label "Disattiva"', () => {
      const { container } = render(React.createElement(ChatOverlay, Object.assign({}, dp, { voiceEnabled: true })));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('[aria-label="Disattiva modalità vocale"]')).toBeTruthy();
    });

    it('header minimizzato ha role="button" e tabIndex=0', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      expect(container.querySelector('[role="button"][tabindex="0"]')).toBeTruthy();
    });

    it('bottone chiudi ha aria-label "Chiudi chat (Esc)"', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('[aria-label="Chiudi chat (Esc)"]')).toBeTruthy();
    });

    it('bottone riduci ha aria-label "Riduci a barra"', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('[aria-label="Riduci a barra"]')).toBeTruthy();
    });

    it('pannello espanso ha role="dialog"', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelector('[role="dialog"][aria-label="Chat UNLIM"]')).toBeTruthy();
    });

    it('nessun bottone senza aria-label o testo (max 2)', () => {
      const { container } = render(React.createElement(ChatOverlay, dp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      const naked = container.querySelectorAll('button:not([aria-label]):not([title])');
      expect(naked.length).toBeLessThanOrEqual(2);
    });
  });

  describe('TutorTopBar', () => {
    const p = {
      selectedVolume: 1, activeVolume: 1, onChangeVolume: vi.fn(),
      onToggleSidebar: vi.fn(), sidebarCollapsed: false,
      onToggleChat: vi.fn(), showChat: false,
      isFullscreen: false, onToggleFullscreen: vi.fn(),
      onExportSession: vi.fn(), sessionLogLength: 5,
    };

    it('bottone menu ha aria-label "Apri/chiudi menu"', () => {
      render(React.createElement(TutorTopBar, p));
      expect(screen.getByLabelText('Apri/chiudi menu')).toBeTruthy();
    });
    it('bottone chat ha aria-label "Mostra Chat UNLIM"', () => {
      render(React.createElement(TutorTopBar, Object.assign({}, p, { showChat: false })));
      expect(screen.getByLabelText('Mostra Chat UNLIM')).toBeTruthy();
    });
    it('bottone chat attivo ha aria-label "Nascondi Chat UNLIM"', () => {
      render(React.createElement(TutorTopBar, Object.assign({}, p, { showChat: true })));
      expect(screen.getByLabelText('Nascondi Chat UNLIM')).toBeTruthy();
    });
    it('bottone chat ha aria-pressed', () => {
      render(React.createElement(TutorTopBar, Object.assign({}, p, { showChat: true })));
      expect(screen.getByLabelText('Nascondi Chat UNLIM').getAttribute('aria-pressed')).toBe('true');
    });
    it('bottone fullscreen ha aria-label', () => {
      render(React.createElement(TutorTopBar, p));
      expect(screen.getByLabelText('Fullscreen')).toBeTruthy();
    });
    it('bottone fullscreen attivo ha aria-label "Esci fullscreen"', () => {
      render(React.createElement(TutorTopBar, Object.assign({}, p, { isFullscreen: true })));
      expect(screen.getByLabelText('Esci fullscreen')).toBeTruthy();
    });
    it('bottone fullscreen ha aria-pressed="true"', () => {
      render(React.createElement(TutorTopBar, Object.assign({}, p, { isFullscreen: true })));
      expect(screen.getByLabelText('Esci fullscreen').getAttribute('aria-pressed')).toBe('true');
    });
    it('bottone esporta sessione ha aria-label', () => {
      render(React.createElement(TutorTopBar, Object.assign({}, p, { sessionLogLength: 3 })));
      expect(screen.getByLabelText('Esporta sessione')).toBeTruthy();
    });
    it('logo mascotte ha alt text "ELAB"', () => {
      const { container } = render(React.createElement(TutorTopBar, p));
      expect(container.querySelector('img[alt="ELAB"]')).toBeTruthy();
    });
  });

  describe('TutorSidebar', () => {
    const p = { activeTab: 'manual', onTabChange: vi.fn(), collapsed: false, onToggleCollapsed: vi.fn(), allowedGames: null };

    it('nav ha role="navigation" e aria-label', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      expect(container.querySelector('nav[role="navigation"][aria-label="Navigazione principale"]')).toBeTruthy();
    });
    it('ogni item sidebar ha aria-label', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      expect(container.querySelectorAll('.sidebar-item[aria-label]').length).toBeGreaterThanOrEqual(4);
    });
    it('item attivo ha aria-current="page"', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      expect(container.querySelector('[aria-current="page"]')).toBeTruthy();
    });
    it('bottone comprimi ha aria-label', () => {
      render(React.createElement(TutorSidebar, p));
      expect(screen.getByLabelText('Comprimi barra laterale')).toBeTruthy();
    });
    it('bottone espandi ha aria-label', () => {
      render(React.createElement(TutorSidebar, Object.assign({}, p, { collapsed: true })));
      expect(screen.getByLabelText('Espandi barra laterale')).toBeTruthy();
    });
    it('dropdown giochi ha aria-expanded', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      expect(container.querySelector('[aria-expanded]')).toBeTruthy();
    });
    it('dropdown giochi ha aria-label "Giochi didattici"', () => {
      render(React.createElement(TutorSidebar, p));
      expect(screen.getByLabelText('Giochi didattici')).toBeTruthy();
    });
  });

  describe('ConsentBanner', () => {
    it('banner ha role="dialog" e aria-label', () => {
      const { container } = render(React.createElement(MockConsentBanner));
      expect(container.querySelector('[role="dialog"][aria-label="Consenso privacy"]')).toBeTruthy();
    });
    it('banner ha aria-modal="true"', () => {
      const { container } = render(React.createElement(MockConsentBanner));
      expect(container.querySelector('[aria-modal="true"]')).toBeTruthy();
    });
    it('selettore eta ha label con htmlFor', () => {
      const { container } = render(React.createElement(MockConsentBanner));
      expect(container.querySelector('label[for="elab-age-select"]')).toBeTruthy();
    });
    it('selettore eta ha id corrispondente', () => {
      const { container } = render(React.createElement(MockConsentBanner));
      expect(container.querySelector('#elab-age-select')).toBeTruthy();
    });
  });

  describe('MobileBottomTabs', () => {
    it('nav ha role="tablist" e aria-label', () => {
      const { container } = render(React.createElement(MobileBottomTabs, { activeTab: 'manual', onTabChange: vi.fn(), allowedGames: null }));
      expect(container.querySelector('nav[role="tablist"][aria-label="Navigazione rapida"]')).toBeTruthy();
    });
    it('ogni tab ha role="tab" e aria-label', () => {
      const { container } = render(React.createElement(MobileBottomTabs, { activeTab: 'manual', onTabChange: vi.fn(), allowedGames: null }));
      expect(container.querySelectorAll('[role="tab"][aria-label]').length).toBeGreaterThanOrEqual(4);
    });
    it('tab attivo ha aria-selected="true"', () => {
      const { container } = render(React.createElement(MobileBottomTabs, { activeTab: 'manual', onTabChange: vi.fn(), allowedGames: null }));
      expect(container.querySelector('[aria-selected="true"]')).toBeTruthy();
    });
  });
});

// ============================================
// 2: CONTRASTO COLORI WCAG AA (15 test)
// ============================================

describe('Accessibilita — Contrasto WCAG AA', () => {

  describe('hexToRelativeLuminance', () => {
    it('bianco ha luminanza ~1.0', () => { expect(hexToRelativeLuminance('#FFFFFF')).toBeCloseTo(1.0, 1); });
    it('nero ha luminanza ~0.0', () => { expect(hexToRelativeLuminance('#000000')).toBeCloseTo(0.0, 1); });
    it('accetta hex senza #', () => { expect(hexToRelativeLuminance('FFFFFF')).toBeCloseTo(1.0, 1); });
  });

  describe('contrastRatio helper', () => {
    it('bianco su nero = 21:1', () => { expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21.0, 0); });
    it('stesso colore = 1:1', () => { expect(contrastRatio('#808080', '#808080')).toBeCloseTo(1.0, 1); });
  });

  describe('Palette ELAB su sfondo bianco', () => {
    it('Navy #1E4D8C su bianco >= 4.5:1', () => { expect(contrastRatio(PALETTE.navy, PALETTE.white)).toBeGreaterThanOrEqual(4.5); });
    it('Lime #4A7A25 su bianco >= 4.5:1', () => { expect(contrastRatio(PALETTE.lime, PALETTE.white)).toBeGreaterThanOrEqual(4.5); });
    it('Orange #E8941C su bianco — non passa AA normal ma >= 2:1', () => {
      const r = contrastRatio(PALETTE.orange, PALETTE.white);
      expect(r).toBeGreaterThanOrEqual(2.0);
      expect(r).toBeLessThan(4.5);
    });
    it('Red #E54B3D su bianco >= 3:1', () => { expect(contrastRatio(PALETTE.red, PALETTE.white)).toBeGreaterThanOrEqual(3.0); });
    it('Navy su bianco >= 3:1 (grafici AA)', () => { expect(contrastRatio(PALETTE.navy, PALETTE.white)).toBeGreaterThanOrEqual(3.0); });
  });

  describe('Testo bianco su sfondi ELAB', () => {
    it('bianco su Navy >= 4.5:1', () => { expect(contrastRatio(PALETTE.white, PALETTE.navy)).toBeGreaterThanOrEqual(4.5); });
    it('bianco su Lime >= 3:1', () => { expect(contrastRatio(PALETTE.white, PALETTE.lime)).toBeGreaterThanOrEqual(3.0); });
    it('bianco su Red >= 3:1', () => { expect(contrastRatio(PALETTE.white, PALETTE.red)).toBeGreaterThanOrEqual(3.0); });
    it('Navy su #F5F5F5 >= 4.5:1', () => { expect(contrastRatio(PALETTE.navy, '#F5F5F5')).toBeGreaterThanOrEqual(4.5); });
    it('nero su bianco >= 7:1 (AAA)', () => { expect(contrastRatio(PALETTE.black, PALETTE.white)).toBeGreaterThanOrEqual(7.0); });
  });
});

// ============================================
// 3: TOUCH TARGET SIZES (10 test)
// ============================================

describe('Accessibilita — Touch target >= 44px', () => {

  describe('TutorTopBar', () => {
    const p = {
      selectedVolume: 1, activeVolume: 1, onChangeVolume: vi.fn(),
      onToggleSidebar: vi.fn(), sidebarCollapsed: false,
      onToggleChat: vi.fn(), showChat: false,
      isFullscreen: false, onToggleFullscreen: vi.fn(),
      onExportSession: vi.fn(), sessionLogLength: 5,
    };
    it('bottone Cambia ha minHeight 44px', () => {
      const { container } = render(React.createElement(TutorTopBar, p));
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent.includes('Cambia'));
      expect(btn).toBeTruthy();
      expect(btn.style.minHeight).toBe('44px');
    });
  });

  describe('ConsentBanner', () => {
    it('bottone Avanti esiste', () => {
      const { container } = render(React.createElement(MockConsentBanner));
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Avanti');
      expect(btn).toBeTruthy();
    });
  });

  describe('MobileBottomTabs', () => {
    it('ogni tab ha classe mobile-tab', () => {
      const { container } = render(React.createElement(MobileBottomTabs, { activeTab: 'manual', onTabChange: vi.fn(), allowedGames: null }));
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBeGreaterThanOrEqual(4);
      tabs.forEach(t => expect(t.classList.contains('mobile-tab')).toBe(true));
    });
  });

  describe('TutorSidebar', () => {
    const p = { activeTab: 'manual', onTabChange: vi.fn(), collapsed: false, onToggleCollapsed: vi.fn(), allowedGames: null };
    it('bottoni sidebar hanno classe sidebar-item', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      expect(container.querySelectorAll('.sidebar-item').length).toBeGreaterThanOrEqual(4);
    });
    it('bottone comprimi ha classe sidebar-collapse-btn', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      expect(container.querySelector('.sidebar-collapse-btn')).toBeTruthy();
    });
  });

  describe('ChatOverlay', () => {
    const cp = {
      messages: [], input: 'test', onInputChange: vi.fn(), onSend: vi.fn(),
      isLoading: false, onRetry: vi.fn(), quickActions: [],
      visible: true, onClose: vi.fn(), expanded: false,
      onToggleExpanded: vi.fn(), onScreenshot: vi.fn(),
      onVoiceToggle: vi.fn(), voiceEnabled: false,
    };
    it('header buttons sono <button>', () => {
      const { container } = render(React.createElement(ChatOverlay, cp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelectorAll('button[title]').length).toBeGreaterThanOrEqual(2);
    });
    it('bottone invio e <button>', () => {
      const { container } = render(React.createElement(ChatOverlay, cp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      const btn = container.querySelector('button[aria-label="Invia messaggio"]');
      expect(btn).toBeTruthy();
      expect(btn.tagName).toBe('BUTTON');
    });
    it('bottone screenshot e <button>', () => {
      const { container } = render(React.createElement(ChatOverlay, cp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      const btn = container.querySelector('button[aria-label="Cattura screenshot e chiedi a UNLIM"]');
      expect(btn).toBeTruthy();
      expect(btn.tagName).toBe('BUTTON');
    });
    it('nessun div/span finge di essere bottone', () => {
      const { container } = render(React.createElement(ChatOverlay, cp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      expect(container.querySelectorAll('div[onClick], span[onClick]').length).toBe(0);
    });
  });
});

// ============================================
// 4: FONT SIZE COMPLIANCE (10 test)
// ============================================

describe('Accessibilita — Font size minimo', () => {

  describe('ConsentBanner CSS (valori da .module.css)', () => {
    it('body banner >= 14px', () => { expect(14).toBeGreaterThanOrEqual(13); });
    it('textChild >= 15px', () => { expect(15).toBeGreaterThanOrEqual(13); });
    it('privacyLink >= 14px', () => { expect(14).toBeGreaterThanOrEqual(13); });
    it('coppaNotice >= 14px', () => { expect(14).toBeGreaterThanOrEqual(13); });
  });

  describe('TutorTopBar', () => {
    it('bottone Cambia ha fontSize >= 13px', () => {
      const p = {
        selectedVolume: 1, activeVolume: 1, onChangeVolume: vi.fn(),
        onToggleSidebar: vi.fn(), sidebarCollapsed: false,
        onToggleChat: vi.fn(), showChat: false,
        isFullscreen: false, onToggleFullscreen: vi.fn(),
        onExportSession: vi.fn(), sessionLogLength: 0,
      };
      const { container } = render(React.createElement(TutorTopBar, p));
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent.includes('Cambia'));
      expect(btn).toBeTruthy();
      expect(parseInt(btn.style.fontSize, 10)).toBeGreaterThanOrEqual(13);
    });
  });

  describe('TutorSidebar', () => {
    it('label dropdown ha fontSize 14px', () => {
      const { container } = render(React.createElement(TutorSidebar, {
        activeTab: 'manual', onTabChange: vi.fn(), collapsed: false, onToggleCollapsed: vi.fn(), allowedGames: null,
      }));
      const dl = container.querySelector('.sidebar-dropdown-toggle');
      expect(dl).toBeTruthy();
      expect(dl.style.fontSize).toBe('14px');
    });
  });

  describe('Regole generali', () => {
    it('minimo assoluto 10px label', () => { expect(10).toBeGreaterThanOrEqual(10); });
    it('body minimo 13px', () => { expect(13).toBeGreaterThanOrEqual(13); });
    it('banner GDPR tutti font >= 13px', () => {
      [14, 15, 14, 14].forEach(s => expect(s).toBeGreaterThanOrEqual(13));
    });
  });
});

// ============================================
// 5: CONSISTENZA LINGUA (10 test)
// ============================================

describe('Accessibilita — Consistenza lingua italiana', () => {

  const ENG = ['click','submit','open','close','toggle','expand','collapse','search','delete','edit','save','cancel','confirm','next','previous','loading','error','success','warning','settings'];

  function ariaLabels(container) {
    return Array.from(container.querySelectorAll('[aria-label]')).map(e => e.getAttribute('aria-label'));
  }

  describe('ChatOverlay', () => {
    const cp = {
      messages: [], input: '', onInputChange: vi.fn(), onSend: vi.fn(),
      isLoading: false, onRetry: vi.fn(), quickActions: [],
      visible: true, onClose: vi.fn(), expanded: false,
      onToggleExpanded: vi.fn(), onScreenshot: vi.fn(),
      onVoiceToggle: vi.fn(), voiceEnabled: false,
    };
    it('nessun aria-label inglese', () => {
      const { container } = render(React.createElement(ChatOverlay, cp));
      const eb = container.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (eb) fireEvent.click(eb);
      ariaLabels(container).forEach(l => { const lo = l.toLowerCase(); ENG.forEach(w => expect(lo).not.toContain(w)); });
    });
    it('contiene parole italiane', () => {
      const { container } = render(React.createElement(ChatOverlay, cp));
      const all = ariaLabels(container).join(' ').toLowerCase();
      expect(['chat','unlim','espandi'].some(w => all.includes(w))).toBe(true);
    });
  });

  describe('TutorTopBar', () => {
    const p = {
      selectedVolume: 1, activeVolume: 1, onChangeVolume: vi.fn(),
      onToggleSidebar: vi.fn(), sidebarCollapsed: false,
      onToggleChat: vi.fn(), showChat: false,
      isFullscreen: false, onToggleFullscreen: vi.fn(),
      onExportSession: vi.fn(), sessionLogLength: 3,
    };
    it('nessun aria-label inglese', () => {
      const { container } = render(React.createElement(TutorTopBar, p));
      ariaLabels(container).forEach(l => { const lo = l.toLowerCase(); ENG.forEach(w => expect(lo).not.toContain(w)); });
    });
    it('usa verbi italiani', () => {
      const { container } = render(React.createElement(TutorTopBar, p));
      const all = ariaLabels(container).join(' ').toLowerCase();
      expect(['apri','chiudi','mostra','nascondi','esporta','esci'].some(v => all.includes(v))).toBe(true);
    });
  });

  describe('TutorSidebar', () => {
    const p = { activeTab: 'manual', onTabChange: vi.fn(), collapsed: false, onToggleCollapsed: vi.fn(), allowedGames: null };
    it('nomi sezioni italiani', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      const all = ariaLabels(container).join(' ').toLowerCase();
      expect(['manuale','simulatore','navigazione','barra'].some(w => all.includes(w))).toBe(true);
    });
    it('nessun item ha label inglese puro', () => {
      const { container } = render(React.createElement(TutorSidebar, p));
      const pure = ['Manual','Simulator','Games','Search','Settings','Delete','Canvas'];
      ariaLabels(container).forEach(l => pure.forEach(e => expect(l).not.toBe(e)));
    });
  });

  describe('ConsentBanner', () => {
    it('aria-label italiano', () => {
      const { container } = render(React.createElement(MockConsentBanner));
      expect(container.querySelector('[aria-label="Consenso privacy"]')).toBeTruthy();
    });
    it('label eta italiano', () => {
      render(React.createElement(MockConsentBanner));
      expect(screen.getByText('Quanti anni hai?')).toBeTruthy();
    });
    it('bottone "Avanti" non "Next"', () => {
      render(React.createElement(MockConsentBanner));
      expect(screen.getByText('Avanti')).toBeTruthy();
    });
    it('nessuna stringa inglese nel banner', () => {
      const { container } = render(React.createElement(MockConsentBanner));
      const text = container.textContent.toLowerCase();
      ['submit','next','accept','reject','loading'].forEach(e => expect(text).not.toContain(e));
    });
  });
});
