// Event-contract tests with deliberately small DOM/Audio doubles.
// These execute the shipped app.js, but do not replace real browser or accessibility QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as model from '../dist/demo-model.mjs';

const root = new URL('../dist/', import.meta.url);
const markup = readFileSync(new URL('index.html', root), 'utf8');
const source = readFileSync(new URL('app.js', root), 'utf8').replace(/^import[^\n]+\n/, '');
const discoveries = JSON.parse(readFileSync(new URL('assets/discoveries.json', root)));
const book = JSON.parse(readFileSync(new URL('assets/story/book.json', root)));
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
    const after = html.slice(match.index + match[0].length);
    node.textContent = after.slice(0, after.indexOf('</' + node.tag + '>')).replace(/<[^>]+>/g, '').trim();
    nodes.push(node);
  }
  return nodes;
}
class Element {
  constructor(tag, document) {
    this.tag = tag; this.document = document; this.attrs = {}; this.dataset = {};
    this.listeners = {}; this.children = []; this.textContent = ''; this.value = ''; this.hidden = false; this.disabled = false;
  }
  set innerHTML(value) { this.html = value; if (this.attrs.id === 'watch-content') this.children = parse(value, this.document); }
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
async function setup({ failsToLoad = false } = {}) {
  const document = new DocumentDouble();
  let audio;
  const controls = { failsToLoad };
  const context = vm.createContext({
    ...model, document, navigator:{clipboard:{writeText:async()=>{}}},
    window:{addEventListener(){},matchMedia(){return {matches:false};},print(){}},
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
  return { document, audio, controls, context, query, click, policy, state:()=>vm.runInContext('state', context) };
}

test('runtime opens a prepared Moon answer without autoplay or a real account', async () => {
  const app = await setup();
  assert.equal(app.state().topic, 'moon'); assert.equal(app.state().view, 'discovery');
  assert.equal(app.audio.playCalls, 0); assert.ok(app.query('[data-action="listen"]'));
  assert.equal(app.query('#watch-content').attrs['aria-busy'], 'false');
  assert.equal(app.query('#topic-policy').disabled, false);
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
  assert.match(app.query('#hero-policy').innerHTML, /With a grown-up/);
  assert.match(app.query('[data-hear="moon"]').innerHTML, /See parent boundary/);
  assert.match(app.query('#hero-answer').innerHTML, /ask your grown-up/);
  await app.click('[data-hear="moon"]');
  assert.equal(app.state().view, 'boundary'); assert.equal(app.audio.playCalls, 1);
});

test('runtime explicit Hear action keeps playback controls in view', async () => {
  const app = await setup();
  await app.click('[data-hear="moon"]');
  assert.equal(app.audio.playCalls, 1);
  assert.equal(app.document.activeElement.dataset.action, 'listen');
  assert.equal(app.query('[data-action="listen"]').scrolled, true);
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
