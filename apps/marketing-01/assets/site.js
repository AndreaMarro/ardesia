(() => {
  const choices = [...document.querySelectorAll('.course-choice')];
  const links = [...document.querySelectorAll('.interest-link')];
  function choose(id) {
    const option = choices[0]?.querySelector(`option[value="${CSS.escape(id)}"]`);
    if (!option) return;
    choices.forEach(select => { select.value = id; });
    links.forEach(link => {
      link.href = option.dataset.href;
      link.setAttribute('aria-label', `Mi interessa ${option.textContent} su WhatsApp`);
    });
  }
  choices.forEach(select => select.addEventListener('change', () => choose(select.value)));
  document.querySelectorAll('[data-course]').forEach(link => link.addEventListener('click', () => choose(link.dataset.course)));
  choose(location.hash.slice(1) || choices[0]?.value);
  addEventListener('hashchange', () => choose(location.hash.slice(1)));
  const bar = document.querySelector('.interest-bar');
  const panel = document.querySelector('.interest-panel');
  if (bar && panel) {
    bar.hidden = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { bar.hidden = entry.isIntersecting; }, {threshold: 0}).observe(panel);
    }
  }
})();
