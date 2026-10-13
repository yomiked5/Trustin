// Runs shipped motion code with small platform doubles. This does not establish
// rendered animation quality, browser view-transition support or accessibility.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createMotionController, readingProgress } from '../dist/motion-core.mjs';

const policySource = readFileSync(new URL('../dist/motion-policy.js', import.meta.url), 'utf8');
const motionSource = readFileSync(new URL('../dist/motion.js', import.meta.url), 'utf8').replace(/^import[^\n]+\n/, '');
const flush = () => new Promise(resolve => setImmediate(resolve));

function animatedNode() {
  const runs = [];
  const node = {
    animate(frames, options) {
      let finish;
      const animation = { frames, options, cancellations:0, finished:new Promise(resolve => { finish = resolve; }) };
      animation.cancel = () => { animation.cancellations++; };
      animation.finish = finish;
      runs.push(animation);
      return animation;
    }
  };
  return {node, runs};
}

test('motion is optional when disabled, unsupported or rejected by the platform', () => {
  const {node, runs} = animatedNode();
  assert.equal(createMotionController({enabled:()=>false}).run(node, []), null);
  assert.equal(runs.length, 0);
  const motion = createMotionController();
  assert.equal(motion.run(null, []), null);
  assert.equal(motion.run({}, []), null);
  assert.equal(motion.run({animate(){throw Error('Unavailable');}}, []), null);
  assert.doesNotThrow(() => motion.cancelAll());
});

test('new motion cancels only the replaced target and stale completion cannot forget its successor', async () => {
  const first = animatedNode(), other = animatedNode();
  const motion = createMotionController();
  const old = motion.run(first.node, [{opacity:0.5},{opacity:1}]);
  const unrelated = motion.run(other.node, [{opacity:0.5},{opacity:1}]);
  const next = motion.run(first.node, [{opacity:0.5},{opacity:1}]);
  assert.equal(old.cancellations, 1);
  assert.equal(unrelated.cancellations, 0);
  old.finish(); await flush();
  motion.cancelAll();
  assert.equal(next.cancellations, 1);
  assert.equal(unrelated.cancellations, 1);
  motion.cancelAll();
  assert.equal(next.cancellations, 1, 'Cleanup must be idempotent');
});

test('finished effects release themselves and defaults are finite with no persistent fill', async () => {
  const {node} = animatedNode();
  const motion = createMotionController();
  const effect = motion.run(node, [{opacity:0.5},{opacity:1}]);
  assert.ok(Number.isFinite(effect.options.duration) && effect.options.duration > 0);
  assert.equal(effect.options.iterations, 1);
  assert.equal(effect.options.fill, 'none');
  effect.finish(); await flush();
  motion.cancelAll();
  assert.equal(effect.cancellations, 0);
});

test('reading progress stays bounded for before, within and beyond a short or long article', () => {
  for (const height of [0, 100, 5000]) {
    assert.equal(readingProgress(100, height, 800), 0);
    assert.equal(readingProgress(-10000, height, 800), 1);
    const values = [0, -100, -500, -2000].map(top => readingProgress(top, height, 800));
    assert.ok(values.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
    assert.ok(values.every((value, index) => index === 0 || value >= values[index - 1]));
  }
});

function policyHarness({href='https://preview.example/?ref=parent#demo', reduced=false, historyFails=false} = {}) {
  const events = {document:{}, window:{}, media:{}};
  const media = {matches:reduced, addEventListener(type, callback){ events.media[type] = callback; }};
  const effect = {cancellations:0, cancel(){this.cancellations++;}};
  const document = {
    documentElement:{dataset:{}},
    getAnimations:()=>[effect],
    addEventListener(type, callback){events.document[type] = callback;}
  };
  const historyCalls = [];
  const window = {
    location:{href, origin:new URL(href).origin},
    matchMedia(query){assert.equal(query, '(prefers-reduced-motion: reduce)'); return media;},
    addEventListener(type, callback){events.window[type] = callback;},
    history:{state:{retained:true}, replaceState(state, title, url) {
      if (historyFails) throw Error('History unavailable');
      historyCalls.push({state, title, url:String(url)});
      window.location.href = String(url);
    }}
  };
  let storageReads = 0, networkRequests = 0;
  const context = {document, window, URL, Set, fetch(){ networkRequests++; throw Error('Unexpected network'); }};
  for (const host of [context, window]) {
    for (const name of ['localStorage','sessionStorage']) Object.defineProperty(host, name, {get(){storageReads++; throw Error('Unexpected browser storage');}});
  }
  Object.defineProperty(document, 'cookie', {get(){storageReads++; throw Error('Unexpected cookies');},set(){storageReads++; throw Error('Unexpected cookies');}});
  vm.runInNewContext(policySource, context);
  const click = (href, {download=false} = {}) => {
    const attributes = {href};
    const link = {
      hasAttribute:name => name === 'download' && download,
      getAttribute:name => attributes[name],
      get href(){return attributes.href;}, set href(value){attributes.href = value;}
    };
    let prevented = false;
    events.document.click({target:{closest:()=>link}, ctrlKey:true, preventDefault(){prevented = true;}});
    return {href:link.href, prevented};
  };
  return {window, document, events, media, effect, historyCalls, click, policy:window.TJMotionPolicy,
    changeReduced(value){media.matches = value; events.media.change();},
    usage:()=>({storageReads, networkRequests})};
}

test('system reduced motion wins over manual enabling and responds to device changes', () => {
  const app = policyHarness({reduced:true});
  assert.equal(app.policy.enabled(), false);
  assert.equal(app.document.documentElement.dataset.motion, 'off');
  assert.ok(app.effect.cancellations > 0);
  app.policy.setManualOff(false);
  assert.equal(app.policy.enabled(), false);
  const notifications = [];
  const unsubscribe = app.policy.subscribe(enabled => notifications.push(enabled));
  app.changeReduced(false);
  assert.equal(app.policy.enabled(), true);
  assert.equal(app.document.documentElement.dataset.motion, 'on');
  app.changeReduced(true);
  assert.equal(app.policy.enabled(), false);
  assert.deepEqual(notifications, [true, false]);
  unsubscribe(); app.changeReduced(false);
  assert.deepEqual(notifications, [true, false]);
});

test('manual motion choice uses the URL, preserves other state and follows ordinary internal links', () => {
  const app = policyHarness();
  app.policy.setManualOff(true);
  const current = new URL(app.window.location.href);
  assert.equal(current.searchParams.get('motion'), 'off');
  assert.equal(current.searchParams.get('ref'), 'parent');
  assert.equal(current.hash, '#demo');
  assert.deepEqual(app.historyCalls[0].state, {retained:true});
  const internal = app.click('/philosophy/?from=home#limits');
  const next = new URL(internal.href);
  assert.equal(next.searchParams.get('motion'), 'off');
  assert.equal(next.searchParams.get('from'), 'home');
  assert.equal(next.hash, '#limits');
  assert.equal(internal.prevented, false, 'Navigation must remain native');
  assert.equal(app.click('#demo').href, '#demo');
  assert.equal(app.click('https://example.org/reference').href, 'https://example.org/reference');
  assert.equal(app.click('mailto:hello@trustinjr.com').href, 'mailto:hello@trustinjr.com');
  assert.equal(app.click('/guide.pdf', {download:true}).href, '/guide.pdf');
  const restored = policyHarness({href:internal.href});
  assert.equal(restored.policy.enabled(), false);
  app.policy.setManualOff(false);
  assert.equal(new URL(app.window.location.href).searchParams.has('motion'), false);
  assert.equal(new URL(app.click('/privacy/?motion=off&from=home').href).searchParams.has('motion'), false);
  assert.deepEqual(app.usage(), {storageReads:0, networkRequests:0});
});

test('motion choice still applies without history and skips cross-page animation while off', () => {
  const app = policyHarness({historyFails:true});
  let skipped = 0;
  const transition = {viewTransition:{skipTransition(){skipped++;}}};
  app.events.window.pageswap(transition);
  assert.equal(skipped, 0);
  app.policy.setManualOff(true);
  assert.equal(app.policy.enabled(), false);
  assert.equal(app.document.documentElement.dataset.motion, 'off');
  app.events.window.pageswap(transition);
  app.events.window.pagereveal(transition);
  assert.equal(skipped, 2);
  assert.doesNotThrow(() => app.events.window.pageswap({}));
  assert.deepEqual(app.usage(), {storageReads:0, networkRequests:0});
});

function experienceHarness({enabled=true, platformAnimations=true} = {}) {
  const nodes = new Map(), runs = [];
  const nodeFor = selector => {
    if (!nodes.has(selector)) {
      const entry = animatedNode();
      nodes.set(selector, platformAnimations ? entry.node : {});
      runs.push(entry.runs);
    }
    return nodes.get(selector);
  };
  const listeners = {};
  const document = {
    querySelector:selector => selector.startsWith('[data-reading-') ? null : nodeFor(selector),
    querySelectorAll:()=>[]
  };
  const window = {
    TJMotionPolicy:{enabled:()=>enabled, systemReduced:()=>!enabled, subscribe(){}},
    matchMedia:()=>({matches:!enabled}),
    addEventListener(type, callback){listeners[type] = callback;},
    location:{pathname:'/'}
  };
  vm.runInNewContext(motionSource, {window, document, createMotionController, readingProgress});
  window.TrustinMotion.hero();
  window.TrustinMotion.reader({querySelector:nodeFor});
  window.TrustinMotion.feedback(nodeFor('.math-message'));
  window.TrustinMotion.boundary();
  return {effects:runs.flat(), api:window.TrustinMotion, listeners};
}

test('all shipped decorative interactions are finite and leave no persistent animation fill', () => {
  const app = experienceHarness();
  assert.ok(app.effects.length >= 8, 'Exercise entry, hero, reader, feedback and boundary motion');
  for (const effect of app.effects) {
    assert.ok(Number.isFinite(effect.options.duration) && effect.options.duration > 0 && effect.options.duration <= 1000);
    assert.equal(effect.options.iterations, 1);
    assert.equal(effect.options.fill, 'none');
  }
  app.listeners.pagehide();
  assert.ok(app.effects.every(effect => effect.cancellations >= 1));
});

test('the shipped experience stays functional and static with reduced motion or no animation API', () => {
  const reduced = experienceHarness({enabled:false});
  assert.equal(reduced.effects.length, 0);
  assert.equal(reduced.api.behavior(), 'auto');
  const unsupported = experienceHarness({platformAnimations:false});
  assert.equal(unsupported.effects.length, 0);
  assert.doesNotThrow(() => unsupported.listeners.pagehide());
});
