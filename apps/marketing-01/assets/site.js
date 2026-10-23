/* Progressive enhancement only. Direct course contacts and disclosures are native HTML. */
(() => {
  const choices = [...document.querySelectorAll('input[name="course"]')];
  const links = [...document.querySelectorAll('.interest-link')];
  const title = document.querySelector('.selected-course');
  const first = choices[0];
  if (!first) return;
  document.querySelector('.js-choice').hidden = false;

  function choose(id, updateURL = false, hash = null) {
    const choice = choices.find(input => input.value === id);
    if (!choice) return;
    choice.checked = true;
    const name = choice.nextElementSibling.textContent;
    title.textContent = name;
    links.forEach(link => {
      link.href = choice.dataset.href;
      const action = link.closest('.interest-bar') ? 'Scrivi · Chiedi disponibilità su WhatsApp' : 'Chiedi disponibilità su WhatsApp';
      link.setAttribute('aria-label', `${action} per ${name}`);
    });
    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.set('percorso', id);
      if (hash) url.hash = hash;
      history[updateURL === 'replace' ? 'replaceState' : 'pushState'](null, '', url);
    }
  }
  function fromURL() {
    const query = new URL(location.href).searchParams.get('percorso');
    const fragment = location.hash.slice(1);
    const validQuery = choices.some(input => input.value === query);
    const validFragment = choices.some(input => input.value === fragment);
    choose(validQuery ? query : validFragment ? fragment : first.value, !validQuery && validFragment ? 'replace' : false);
  }
  choices.forEach(input => input.addEventListener('change', () => choose(input.value, true, 'contatto')));
  document.querySelectorAll('[data-course]').forEach(link => link.addEventListener('click', () => choose(link.dataset.course, 'replace', link.dataset.course)));
  document.querySelectorAll('.path-index a').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = link.hash.slice(1);
    choose(id, true, id);
    const target = document.getElementById(id);
    target.focus({preventScroll: true});
    target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  }));
  addEventListener('popstate', fromURL);
  addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (choices.some(input => input.value === id)) choose(id, 'replace');
  });
  fromURL();

  // Maven principle: compact programmes on mobile, comparable open programmes on desktop.
  // An explicit user choice always wins over subsequent viewport changes.
  const wide = matchMedia('(min-width: 64rem)');
  const programmes = [...document.querySelectorAll('[data-responsive-disclosure]')];
  const manuallyToggled = new WeakSet();
  programmes.forEach(details => {
    details.querySelector('summary').addEventListener('click', () => manuallyToggled.add(details));
  });
  function adaptProgrammes() {
    programmes.forEach(details => { if (!manuallyToggled.has(details)) details.open = wide.matches; });
  }
  wide.addEventListener('change', adaptProgrammes);
  adaptProgrammes();

  const bar = document.querySelector('.interest-bar');
  const hero = document.querySelector('.hero-copy');
  const contact = document.querySelector('.contact-panel .interest-link');
  const footer = document.querySelector('#footer');
  const short = matchMedia('(max-height: 30rem)');
  const visible = new Map([[hero, true], [contact, false], [footer, false]]);
  let editing = false;
  function updateBar() {
    const keyboard = window.visualViewport && window.visualViewport.height < innerHeight * .7;
    bar.hidden = visible.get(hero) || visible.get(contact) || visible.get(footer) || short.matches || editing || keyboard;
    // Enlarged text must never turn the bar into a full-screen overlay.
    if (!bar.hidden && bar.getBoundingClientRect().height > (window.visualViewport?.height || innerHeight) * .22) bar.hidden = true;
    document.documentElement.style.setProperty('--sticky-space', bar.hidden ? '0px' : `${bar.getBoundingClientRect().height}px`);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target, entry.isIntersecting));
      updateBar();
    });
    visible.forEach((_, node) => observer.observe(node));
    new ResizeObserver(updateBar).observe(bar);
    short.addEventListener('change', updateBar);
    window.visualViewport?.addEventListener('resize', updateBar);
    document.addEventListener('focusin', event => {
      editing = event.target.matches('textarea,input:not([type="radio"]):not([type="checkbox"]),[contenteditable="true"]');
      updateBar();
    });
    document.addEventListener('focusout', () => { editing = false; updateBar(); });
  }
})();
