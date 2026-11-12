// Runs before first paint; no storage, remote requests, or navigation interception.
(() => {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualOff = new URL(window.location.href).searchParams.get('motion') === 'off';
  const listeners = new Set();
  const enabled = () => !manualOff && !media.matches;
  function apply() {
    root.dataset.motion = enabled() ? 'on' : 'off';
    if (!enabled()) document.getAnimations?.().forEach(animation => animation.cancel());
    listeners.forEach(listener => listener(enabled()));
  }
  window.TJMotionPolicy = {
    enabled,
    systemReduced: () => media.matches,
    setManualOff(value) {
      manualOff = Boolean(value);
      try {
        const url = new URL(window.location.href);
        if (manualOff) url.searchParams.set('motion', 'off');
        else url.searchParams.delete('motion');
        window.history.replaceState(window.history.state, '', url);
      } catch { /* Motion still changes if history is unavailable. */ }
      apply();
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  };
  media.addEventListener?.('change', apply);
  for (const event of ['pageswap', 'pagereveal']) {
    window.addEventListener(event, event => {
      if (!enabled()) event.viewTransition?.skipTransition();
    });
  }
  // Carry an explicit choice on ordinary same-origin links; leave navigation native.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    try {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (manualOff) url.searchParams.set('motion', 'off');
      else url.searchParams.delete('motion');
      link.href = url.href;
    } catch { /* Invalid and external links keep their original behavior. */ }
  });
  apply();
})();
