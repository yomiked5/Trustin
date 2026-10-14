// Event-contract tests with deliberately small DOM/Audio doubles.
// These execute the shipped app.js, but do not replace real browser or accessibility QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as model from '../dist/demo-model.mjs';

const root = new URL('../dist/', import.meta.url);
const markup = readFileSync(new URL('demo/index.html', root), 'utf8');
const source = readFileSync(new URL('app.js', root), 'utf8').replace(/^import[^\n]+\n/, '');
const discoveries = JSON.parse(readFileSync(new URL('assets/discoveries.json', root)));
const book = JSON.parse(readFileSync(new URL('assets/story/book.json', root)));
const iconIds = new Set([...readFileSync(new URL('assets/icons.svg', root), 'utf8').matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const settle = () => new Promise(resolve => setImmediate(resolve));

function matches(node, selector) {
  if (selector.startsWith('#')) return node.attrs.id === selector.slice(1);
  const attr = selector.match(/^\[([^=\]]+)(?:="([^"]+)")?\]$/);
  if (attr) return attr[1] in node.attrs && (attr[2] === undefined || node.attrs[attr[1]] === attr[2]);
  return node.tag === selector;
}
function parse(html, document) {
  const nodes = [];
  for (const match of html.matchAll(/<([a-z][a-z0-9-]*)(\s[^>]*|)>/gi)) {
    const node = new Element(match[1], document);
    for (const attr of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      node.attrs[attr[1]] = attr[2] ?? '';
      if (attr[1].startsWith('data-')) node.dataset[attr[1].slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = attr[2] ?? '';
    }
    node.disabled = 'disabled' in node.attrs;
    if (node.tag === 'use' && node.attrs.href?.startsWith('/assets/icons.svg#')) {
      assert.ok(iconIds.has(node.attrs.href.split('#')[1]), 'Missing rendered icon: ' + node.attrs.href);
    }
    const after = html.slice(match.index + match[0].length);
    node.textContent = after.slice(0, after.indexOf('</' + node.tag + '>')).replace(/<[^>]+>/g, '').trim();
    nodes.push(node);
  }
  return nodes;
}
class Element {
  constructor(tag, document) {
    this.tag = tag; this.document = document; this.attrs = {};
    // DOMStringMap reflects data attributes used by the actual page controls.
    const attribute = key => 'data-' + key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
    this.dataset = new Proxy({}, {
      get: (_, key) => this.attrs[attribute(key)],
      set: (_, key, value) => { this.attrs[attribute(key)] = String(value); return true; }
    });
    this.listeners = {}; this.children = []; this.textContent = ''; this.value = ''; this.hidden = false; this.disabled = false;
  }
  set innerHTML(value) { this.html = value; this.children = parse(value, this.document); }
  get innerHTML() { return this.html || ''; }
  setAttribute(key, value) { this.attrs[key] = value; }
  getAttribute(key) { return this.attrs[key] ?? null; }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  querySelector(selector) { return this.children.find(node => matches(node, selector)) || null; }
  closest(selector) { return selector === 'button' ? (this.tag === 'button' ? this : null) : this.document.side; }
  focus() { this.document.activeElement = this; }
  scrollIntoView() { this.scrolled = true; }
  async emit(type, event = {}) {
    for (const fn of this.listeners[type] || []) await fn({ target:this, preventDefault(){}, ...event });
  }
}
class DocumentDouble {
  constructor() {
    this.nodes = parse(markup, this); this.listeners = {}; this.side = new Element('div', this);
    this.content = this.nodes.find(node => node.attrs.id === 'watch-content'); this.hidden = false;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selectors) {
    return [...this.nodes, ...this.content.children].filter(node => selectors.split(',').some(selector => matches(node, selector.trim())));
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
}
class AudioDouble {
  constructor() {
    this.attrs = {}; this.listeners = {}; this.currentTime = 0; this.duration = 20; this.ended = false;
    this.playCalls = 0; this.pauseCalls = 0; this.paused = true; this.fail = false;
  }
  set src(value) { this.attrs.src = value; this.currentTime = 0; this.ended = false; }
  get src() { return this.attrs.src; }
  getAttribute(key) { return this.attrs[key] ?? null; }
  removeAttribute(key) { delete this.attrs[key]; }
  load() { this.currentTime = 0; this.ended = false; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  emit(type) { for (const fn of this.listeners[type] || []) fn(); }
  play() {
    this.playCalls++;
    if (this.fail) return Promise.reject(Object.assign(new Error('Not available'), {name:'NotAllowedError'}));
    if (this.deferred) return new Promise((resolve, reject) => { this.pendingResolve = resolve; this.pendingReject = reject; });
    this.paused = false; this.emit('play'); return Promise.resolve();
  }
  pause() { this.pauseCalls++; this.paused = true; this.emit('pause'); }
}
async function setup({ failsToLoad = false, search = '' } = {}) {
  const document = new DocumentDouble();
  let audio;
  const controls = { failsToLoad };
  const context = vm.createContext({
    ...model, document, URLSearchParams, navigator:{clipboard:{writeText:async()=>{}}},
    window:{location:{search},addEventListener(){},matchMedia(){return {matches:false};},print(){}},
    Audio:class extends AudioDouble { constructor(){ super(); audio = this; } },
    fetch:async path => ({ ok:!controls.failsToLoad, json:async()=>structuredClone(path.includes('discoveries') ? discoveries : book) })
  });
  vm.runInContext(source, context);
  await settle();
  const query = selector => document.querySelector(selector);
  const click = async selector => {
    const node = query(selector);
    assert.ok(node, 'Missing control: ' + selector);
    if (node.disabled) throw Error('Disabled control: ' + selector);
    if (document.content.children.includes(node)) await document.content.emit('click', {target:node});
    else await node.emit('click');
    await settle();
  };
  const policy = async value => { const select = query('#topic-policy'); select.value = value; await select.emit('change'); await settle(); };
  const pace = async (value, label) => {
    const select = query('#narration-pace'); select.value = String(value); select.selectedOptions = [{textContent:label}];
    await select.emit('change'); await settle();
  };
  return { document, audio, controls, context, query, click, policy, pace, state:()=>vm.runInContext('state', context) };
}

test('runtime opens a prepared Moon answer without autoplay or a real account', async () => {
  const app = await setup();
  assert.equal(app.state().topic, 'moon'); assert.equal(app.state().view, 'discovery');
  assert.equal(app.audio.playCalls, 0); assert.ok(app.query('[data-action="listen"]'));
  assert.equal(app.query('#watch-content').attrs['aria-busy'], 'false');
  assert.equal(app.query('#topic-policy').disabled, false);
});

test('homepage activity links open the matching full demo without autoplay', async () => {
  for (const [activity, view] of [['moon','discovery'], ['seed','discovery'], ['butterfly','discovery'], ['story','story'], ['math','mathIntro']]) {
    const app = await setup({search:'?activity=' + activity});
    assert.equal(app.state().view, view);
    if (view === 'discovery') assert.equal(app.state().topic, activity);
    else assert.equal(app.state().mode, activity);
    assert.equal(app.audio.playCalls, 0);
    assert.equal(app.state().moonPolicy, 'explore');
  }
});

test('unknown demo links fall back to Moon and cannot set a family preference', async () => {
  const app = await setup({search:'?activity=%3Cscript%3E&moonPolicy=together'});
  assert.equal(app.state().topic, 'moon');
  assert.equal(app.state().moonPolicy, 'explore');
  assert.equal(app.audio.playCalls, 0);
});

test('runtime playback has pause, resume, replay, and progress feedback', async () => {
  const app = await setup();
  await app.click('[data-action="listen"]');
  assert.match(app.query('[data-action="listen"]').innerHTML, /Pause/);
  app.audio.currentTime = 8; app.audio.emit('timeupdate');
  assert.equal(app.query('#audio-progress').value, 0.4);
  await app.click('[data-action="listen"]');
  assert.match(app.query('[data-action="listen"]').innerHTML, /Resume/);
  await app.click('[data-action="listen"]');
  app.audio.ended = true; app.audio.currentTime = 20; app.audio.emit('ended');
  assert.match(app.query('[data-action="listen"]').innerHTML, /Replay/);
  await app.click('[data-action="listen"]');
  assert.equal(app.audio.currentTime, 0);
});

test('runtime Moon changes stop affected narration and visibly explain the boundary', async () => {
  const app = await setup(); await app.click('[data-action="listen"]');
  const pauses = app.audio.pauseCalls;
  await app.policy('together');
  assert.equal(app.state().view, 'boundary');
  assert.ok(app.audio.pauseCalls > pauses); assert.equal(app.audio.src, undefined);
  assert.match(app.query('#policy-result').textContent, /grown-up/);
  assert.match(app.query('#watch-content').innerHTML, /Let’s ask your grown-up/);
  await app.click('[data-inspect-moon]');
  assert.equal(app.state().view, 'boundary'); assert.equal(app.audio.playCalls, 1);
});

test('primary preview action focuses the single demo without starting narration', async () => {
  const app = await setup();
  await app.click('[data-mode="story"]');
  await app.click('[data-start="moon"]');
  assert.equal(app.state().topic, 'moon');
  assert.equal(app.state().view, 'discovery');
  assert.equal(app.audio.playCalls, 0);
  assert.equal(app.document.activeElement.tag, 'h3');
  assert.equal(app.document.side.scrolled, true);
});

test('runtime unrelated parent changes leave story narration and progress alone', async () => {
  const app = await setup(); await app.click('[data-mode="story"]');
  await app.click('[data-action="next"]'); await app.click('[data-action="listen"]');
  const src = app.audio.src, pauses = app.audio.pauseCalls;
  await app.policy('together');
  assert.equal(app.state().view, 'story'); assert.equal(app.state().storyPage, 1);
  assert.equal(app.audio.src, src); assert.equal(app.audio.pauseCalls, pauses);
  await app.click('[data-mode="ask"]'); assert.equal(app.state().view, 'boundary');
  await app.click('[data-mode="story"]'); assert.equal(app.state().storyPage, 1);
});

test('runtime math feedback retains deliberate keyboard focus', async () => {
  const app = await setup(); await app.click('[data-mode="math"]'); await app.click('[data-action="startMath"]');
  await app.click('[data-number="3"]');
  assert.equal(app.document.activeElement.dataset.number, '3');
  assert.match(app.query('#demo-status').textContent, /Count each seed/);
  await app.click('[data-number="4"]');
  assert.equal(app.document.activeElement.dataset.action, 'nextMath');
  assert.match(app.query('#demo-status').textContent, /You found it/);
});

test('runtime completed story can restart without resetting family preferences or its honest log', async () => {
  const app = await setup(); await app.policy('together'); await app.click('[data-mode="story"]');
  for (let i=0; i<book.nodes.length; i++) await app.click('[data-action="next"]');
  assert.equal(app.state().view, 'done'); assert.equal(app.state().log.length, 1);
  assert.equal(app.query('#demo-next').hidden, false);
  await app.click('[data-action="restart"]');
  assert.equal(app.state().storyPage, 0); assert.equal(app.state().view, 'story');
  assert.equal(app.state().moonPolicy, 'together'); assert.equal(app.state().log.length, 1);
});

test('runtime audio failures are visible and recoverable, not just screen-reader announcements', async () => {
  const app = await setup(); app.audio.fail = true;
  await app.click('[data-action="listen"]');
  assert.match(app.query('#audio-note').textContent, /could not play/);
  assert.match(app.query('[data-action="listen"]').innerHTML, /Retry/);
  app.audio.fail = false; await app.click('[data-action="listen"]');
  assert.match(app.query('[data-action="listen"]').innerHTML, /Pause/);
  assert.equal(app.query('#audio-note').attrs['data-error'], 'false');
});

test('runtime canceled audio promises do not report stale errors after navigation', async () => {
  const app = await setup(); app.audio.deferred = true;
  await app.click('[data-action="listen"]');
  await app.click('[data-mode="story"]');
  const announcement = app.query('#demo-status').textContent;
  app.audio.pendingReject(new Error('Canceled old audio')); await settle();
  assert.equal(app.query('#demo-status').textContent, announcement);
  assert.doesNotMatch(app.query('#audio-note').textContent, /could not/);
});

test('runtime content failure offers a retry and reset clears the sample session', async () => {
  const app = await setup({failsToLoad:true});
  assert.ok(app.query('[data-action="retry"]')); assert.equal(app.query('#watch-content').attrs['aria-busy'], 'false');
  app.controls.failsToLoad = false; await app.click('[data-action="retry"]');
  assert.equal(app.query('#topic-policy').disabled, false);
  await app.policy('together'); await app.click('#reset-demo');
  assert.equal(app.state().moonPolicy, 'explore'); assert.equal(app.state().log.length, 0);
  assert.equal(app.state().view, 'discovery'); assert.equal(app.state().topic, 'moon');
});

test('all three discoveries remain selectable and play their own recording', async () => {
  const app = await setup();
  for (const topic of ['seed', 'butterfly', 'moon']) {
    await app.click('[data-action="questions"]');
    await app.click(`[data-topic="${topic}"]`);
    const discovery = discoveries.find(item => item.illustration === topic);
    const calls = app.audio.playCalls;
    assert.equal(app.state().topic, topic);
    assert.equal(app.state().view, 'discovery');
    assert.ok(app.query('#watch-content').innerHTML.includes(discovery.question));
    await app.click('[data-action="listen"]');
    assert.equal(app.audio.src, `/assets/audio/${discovery.id}.v${discovery.version}-answer.m4a`);
    assert.equal(app.audio.playCalls, calls + 1);
    assert.equal(app.state().moonPolicy, 'explore');
  }
});

test('Dock choice synchronizes the child response and restores the answer without autoplay', async () => {
  const app = await setup();
  await app.click('[data-action="listen"]');
  await app.policy('together');
  assert.equal(app.state().view, 'boundary');
  assert.equal(app.query('#topic-policy').value, 'together');
  assert.match(app.query('#watch-content').innerHTML, /Let’s ask your grown-up/);
  assert.match(app.query('#policy-result').textContent, /grown-up/);
  assert.equal(app.audio.src, undefined);
  assert.equal(app.audio.playCalls, 1, 'Changing a preference must not start narration');
  await app.policy('explore');
  assert.equal(app.state().view, 'discovery');
  assert.equal(app.query('#topic-policy').value, 'explore');
  assert.match(app.query('#policy-result').textContent, /available/);
  assert.equal(app.audio.playCalls, 1);
  await app.click('[data-action="listen"]');
  assert.match(app.audio.src, /discover-moon.*answer\.m4a$/);
});

test('parent choice preserves unrelated story audio and its conversation prompt', async () => {
  const app = await setup();
  await app.click('[data-mode="story"]');
  await app.click('[data-action="next"]');
  await app.click('[data-action="listen"]');
  const src = app.audio.src, pauses = app.audio.pauseCalls;
  const prompt = app.query('#parent-prompt').textContent;
  await app.policy('together');
  assert.equal(app.state().mode, 'story');
  assert.equal(app.state().storyPage, 1);
  assert.equal(app.audio.src, src);
  assert.equal(app.audio.pauseCalls, pauses);
  assert.equal(app.query('#parent-prompt').textContent, prompt);
  assert.equal(app.query('#topic-policy').value, 'together');
});

test('conversation starters follow each discovery, story and Math activity', async () => {
  const app = await setup();
  assert.match(app.query('#parent-prompt').textContent, /Moon/);
  await app.click('[data-action="questions"]');
  await app.click('[data-topic="butterfly"]');
  assert.match(app.query('#parent-prompt').textContent, /butterfly/);
  await app.click('[data-action="questions"]');
  await app.click('[data-topic="seed"]');
  assert.match(app.query('#parent-prompt').textContent, /seed.*growing/);
  await app.click('[data-mode="story"]');
  assert.match(app.query('#parent-prompt').textContent, /Trustin notice.*plant/);
  await app.click('[data-mode="math"]');
  assert.match(app.query('#parent-prompt').textContent, /four objects.*two groups/);
  await app.click('[data-mode="ask"]');
  assert.match(app.query('#parent-prompt').textContent, /seed.*growing/);
  assert.equal(app.state().log.length, 0, 'Conversation starters are not invented child activity');
});

test('narration pace changes current playback and carries into another narrated activity', async () => {
  const app = await setup();
  await app.click('[data-action="listen"]');
  const src = app.audio.src, calls = app.audio.playCalls, pauses = app.audio.pauseCalls;
  await app.pace(1.1, 'A little quicker');
  assert.equal(app.audio.playbackRate, 1.1);
  assert.equal(app.state().pace, 1.1);
  assert.equal(app.audio.src, src);
  assert.equal(app.audio.playCalls, calls);
  assert.equal(app.audio.pauseCalls, pauses);
  assert.match(app.query('#demo-status').textContent, /A little quicker/);
  await app.click('[data-mode="story"]');
  await app.click('[data-action="listen"]');
  assert.equal(app.audio.playbackRate, 1.1);
  await app.pace(0.85, 'Calm');
  assert.equal(app.audio.playbackRate, 0.85);
  assert.match(app.query('#demo-status').textContent, /Calm/);
});

test('full reset clears progress and restores the Moon, parent prompt and narration defaults', async () => {
  const app = await setup();
  await app.click('[data-mode="story"]');
  for (let page = 0; page < book.nodes.length; page++) await app.click('[data-action="next"]');
  await app.policy('together');
  await app.click('[data-mode="ask"]');
  await app.click('[data-action="home"]');
  await app.click('[data-topic="seed"]');
  await app.click('[data-action="listen"]');
  await app.pace(1.1, 'A little quicker');
  await app.click('#reset-demo');
  assert.equal(app.state().view, 'discovery');
  assert.equal(app.state().topic, 'moon');
  assert.equal(app.state().moonPolicy, 'explore');
  assert.equal(app.state().pace, 0.85);
  assert.equal(app.state().log.length, 0);
  assert.equal(Object.keys(app.state().saved).length, 0);
  assert.match(app.query('#watch-content').innerHTML, /Moon stays round/);
  assert.match(app.query('#parent-prompt').textContent, /Moon/);
  assert.equal(app.query('#narration-pace').value, '0.85');
  assert.equal(app.query('#demo-next').hidden, true);
  assert.equal(app.audio.src, undefined);
  await app.click('[data-action="listen"]');
  assert.equal(app.audio.playbackRate, 0.85);
});
