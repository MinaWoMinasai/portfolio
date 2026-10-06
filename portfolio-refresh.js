/* No dependency, network access or telemetry. Text and links work without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  // Accessible, manually activated tabs. Without JS all three descriptions remain visible.
  document.querySelectorAll('[data-loadout]').forEach((group) => {
    const tablist = group.querySelector('[data-loadout-tabs]');
    if (!tablist) return;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    if (tabs.length !== 3 || panels.some(panel => !panel)) return;
    const activate = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, index) => {
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', event => {
        let next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          // Automatic activation is immediate: panels are local text, no download or delay.
          activate(next, true);
        }
      });
    });
    tablist.hidden = false;
    activate(0);
  });

  // Keep navigation anchored below the actual header height, including zoom/reflow.
  const header = document.querySelector('.site-header');
  const navlinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const sections = navlinks.map(link => document.querySelector(link.getAttribute('href')));
  let frame = 0;
  let offset = 118;
  const syncHeader = () => {
    if (header) offset = Math.ceil(header.getBoundingClientRect().height) + 18;
    root.style.scrollPaddingTop = offset + 'px';
  };
  const syncNavigation = () => {
    frame = 0;
    if (!sections.length || sections.some(section => !section)) return;
    let selected = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= offset + 30) selected = index;
    });
    navlinks.forEach((link, index) => {
      if (index === selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(syncNavigation); };
  syncHeader();
  syncNavigation();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { syncHeader(); schedule(); }, { passive: true });
  if (typeof ResizeObserver === 'function' && header) new ResizeObserver(() => { syncHeader(); schedule(); }).observe(header);

  // Optional visitor preference. The approved B theme remains the default.
  const glow = document.querySelector('.glow-toggle');
  if (glow) {
    let calm = false;
    try { calm = localStorage.getItem('portfolio-calm') === 'true'; } catch (_) { /* Storage may be blocked. */ }
    const apply = () => {
      root.dataset.calm = String(calm);
      glow.setAttribute('aria-pressed', String(calm));
      glow.textContent = calm ? '装飾の発光を戻す' : '装飾の発光を控えめに';
    };
    glow.hidden = false;
    apply();
    glow.addEventListener('click', () => {
      calm = !calm;
      apply();
      try { localStorage.setItem('portfolio-calm', String(calm)); } catch (_) {}
    });
  }
})();
