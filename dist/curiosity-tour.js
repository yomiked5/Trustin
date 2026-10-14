import { chapterStops, tourFrame, tourProgress, connectorPath } from './curiosity-tour-core.mjs';

export function mountCuriosityTour(root, { win = window, policy = win.TJMotionPolicy } = {}) {
  if (!root) return;
  const stage = root.querySelector('.story-stage');
  const device = root.querySelector('.tour-device');
  const panels = [...root.querySelectorAll('[data-tour-panel]')];
  const controls = [...root.querySelectorAll('[data-tour-to]')];
  const path = root.querySelector('[data-tour-line]');
  const dot = root.querySelector('[data-tour-dot]');
  const status = root.querySelector('[data-tour-status]');
  const compact = win.matchMedia('(max-width: 760px)');
  const short = win.matchMedia('(max-height: 560px)');
  let frame = 0, selected = -1, mode = '', stopped = false;
  const animated = () => !short.matches && (policy?.enabled() ?? !win.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const anchor = () => Number.parseFloat(win.getComputedStyle(stage).top) || 0;
  function select(chapter, announce = false) {
    selected = chapter;
    root.dataset.chapter = chapter < 0 ? 'overview' : panels[chapter].dataset.tourPanel;
    panels.forEach((panel, index) => { panel.hidden = index !== chapter; });
    controls.forEach((button, index) => button.setAttribute('aria-pressed', String(index === chapter + 1)));
    if (announce && status) status.textContent = chapter < 0 ? 'Curiosity overview' : panels[chapter].textContent.trim();
  }
  function drawConnector() {
    if (!path || !dot || selected < 0 || mode !== 'scroll') {
      if (path) path.setAttribute('d', '');
      if (dot) dot.setAttribute('r', '0');
      return;
    }
    const hot = root.querySelector(`[data-tour-hotspot="${panels[selected].dataset.tourPanel}"]`);
    const origin = stage.getBoundingClientRect();
    const a = hot.getBoundingClientRect();
    const b = panels[selected].getBoundingClientRect();
    const vertical = compact.matches;
    const start = { x:(vertical ? a.left + a.width / 2 : a.right + 4) - origin.left, y:(vertical ? a.bottom + 4 : a.top + a.height / 2) - origin.top };
    const end = { x:(vertical ? b.left + b.width / 2 : b.left) - origin.left, y:(vertical ? b.top : b.top + b.height / 2) - origin.top };
    path.setAttribute('d', connectorPath(start, end, vertical));
    dot.setAttribute('cx', start.x); dot.setAttribute('cy', start.y); dot.setAttribute('r', '3');
  }
  function update() {
    frame = 0;
    if (stopped) return;
    if (mode !== 'scroll') { drawConnector(); return; }
    const bounds = root.getBoundingClientRect();
    const height = stage.getBoundingClientRect().height;
    const progress = tourProgress(bounds.top, bounds.height, height, anchor());
    const state = tourFrame(progress);
    const displacement = compact.matches ? 0 : -Math.min(250, stage.clientWidth * .225);
    const targetScale = compact.matches ? Math.max(.45, Math.min(.77, (height * .85 - 234) / device.offsetHeight)) : .84;
    const lift = compact.matches ? (height * .85 - 210) / 2 - height * .505 : -16;
    device.style.setProperty('--watch-x', displacement * state.shrink + 'px');
    device.style.setProperty('--watch-y', lift * state.shrink + 'px');
    device.style.setProperty('--watch-scale', String(1 - (1 - targetScale) * state.shrink));
    stage.style.setProperty('--intro-opacity', String(state.intro));
    stage.style.setProperty('--intro-lift', -18 * (1-state.intro) + 'px');
    if (selected !== state.chapter) select(state.chapter);
    drawConnector();
  }
  function schedule() { if (!frame && !stopped) frame = win.requestAnimationFrame(update); }
  function configure() {
    const next = animated() ? 'scroll' : 'manual';
    if (next !== mode) {
      mode = next;
      root.dataset.tourMode = mode;
      ['--watch-x','--watch-y','--watch-scale'].forEach(key => device.style.removeProperty(key));
      ['--intro-opacity','--intro-lift'].forEach(key => stage.style.removeProperty(key));
      // Overview stays annotation-free when motion is disabled too.
      select(-1);
    }
    update();
  }
  controls.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const index = Number(button.dataset.tourTo);
      if (mode === 'scroll') {
        const bounds = root.getBoundingClientRect();
        const height = stage.getBoundingClientRect().height;
        win.scrollTo({ top:win.scrollY + bounds.top - anchor() + chapterStops[index] * (bounds.height - height), behavior:'smooth' });
      } else {
        select(index - 1, true);
        drawConnector();
      }
    });
  });
  root.dataset.tourReady = 'true';
  win.addEventListener('scroll', schedule, {passive:true});
  win.addEventListener('resize', configure, {passive:true});
  win.addEventListener('pageshow', () => { stopped = false; configure(); });
  win.addEventListener('pagehide', () => { stopped = true; if (frame) win.cancelAnimationFrame(frame); frame = 0; });
  policy?.subscribe(configure);
  configure();
  return { update, configure };
}
mountCuriosityTour(document.querySelector('[data-curiosity-story]'));
