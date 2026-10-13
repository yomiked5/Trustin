// Motion is an enhancement: state, focus and navigation never await an animation.
export function createMotionController({ enabled = () => true } = {}) {
  const active = new Map();
  function cancelAll() {
    for (const animation of active.values()) {
      try { animation.cancel(); } catch { /* Already removed. */ }
    }
    active.clear();
  }
  function run(node, frames, options = {}) {
    if (!node || !enabled() || typeof node.animate !== 'function') return null;
    try {
      active.get(node)?.cancel();
      const animation = node.animate(frames, {
        duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)', iterations: 1, ...options, fill: 'none'
      });
      active.set(node, animation);
      const release = () => { if (active.get(node) === animation) active.delete(node); };
      animation.finished?.then(release, release);
      return animation;
    } catch { return null; }
  }
  return { run, cancelAll };
}

export function readingProgress(top, height, viewport) {
  const range = Math.max(1, height - viewport * 0.65);
  return Math.max(0, Math.min(1, -top / range));
}
