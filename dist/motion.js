import { createMotionController, readingProgress } from './motion-core.mjs';

const policy = window.TJMotionPolicy;
const allowed = () => policy?.enabled() ?? !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = createMotionController({ enabled: allowed });
const fade = [{ opacity: 0.65 }, { opacity: 1 }];

function syncSwitch() {
  document.querySelectorAll('[data-motion-toggle]').forEach(button => {
    const reduced = policy?.systemReduced();
    button.disabled = !policy || Boolean(reduced);
    button.setAttribute('aria-pressed', String(allowed()));
    button.textContent = reduced ? 'Reduced motion · device setting' : allowed() ? 'Motion on' : 'Motion off';
    button.setAttribute('aria-label', reduced ? 'Reduced motion is enabled by your device' : allowed() ? 'Turn motion off' : 'Turn motion on');
  });
}
policy?.subscribe(() => { motion.cancelAll(); syncSwitch(); });
document.querySelectorAll('[data-motion-toggle]').forEach(button => button.addEventListener('click', () => policy?.setManualOff(allowed())));
syncSwitch();

window.TrustinMotion = {
  behavior: () => allowed() ? 'smooth' : 'auto',
  reader(container) {
    // Buttons and their hit areas never move with the page-turn animation.
    motion.run(container.querySelector('.reader-art'), [
      { opacity: 0.65, transform: 'translateX(4px)' }, { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 220 });
    motion.run(container.querySelector('.reader-text'), fade, { duration: 220 });
    motion.run(container.querySelector('.ending'), fade, { duration: 220 });
  },
  feedback(node) { motion.run(node, [{ backgroundColor: '#e4eadc' }, { backgroundColor: 'transparent' }], { duration: 240 }); },
  boundary() { motion.run(document.querySelector('.policy-preview'), [{ backgroundColor: '#d1dfc9' }, { backgroundColor: '#edf0e7' }], { duration: 240 }); }
};

motion.run(document.querySelector('.hero-copy'), fade, { duration: 220 });
motion.run(document.querySelector('.hero-portrait'), fade, { duration: 220 });
motion.run(document.querySelector('.paper-art'), fade, { duration: 220 });

if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.nav a')].filter(link => link.pathname === window.location.pathname && link.hash);
  const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  const locations = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  sections.forEach(node => locations.observe(node));
}
document.querySelectorAll('.nav a').forEach(link => {
  if (!link.hash && link.pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
});

const article = document.querySelector('[data-reading-article]');
const meter = document.querySelector('[data-reading-progress]');
if (article && meter) {
  const percent = document.querySelector('[data-reading-percent]');
  const toc = [...document.querySelectorAll('.paper-nav a')];
  const headings = toc.map(link => document.getElementById(link.hash.slice(1)));
  let queued = false;
  function update() {
    queued = false;
    const bounds = article.getBoundingClientRect();
    const value = readingProgress(bounds.top, bounds.height, window.innerHeight);
    meter.value = value;
    if (percent) percent.textContent = Math.round(value * 100) + '%';
    let current = 0;
    headings.forEach((heading, index) => { if (heading && heading.getBoundingClientRect().top <= window.innerHeight * 0.3) current = index; });
    toc.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  const schedule = () => { if (!queued) { queued = true; window.requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive:true });
  window.addEventListener('resize', schedule, { passive:true });
  window.addEventListener('pageshow', schedule);
  update();
}
window.addEventListener('pagehide', () => motion.cancelAll());
