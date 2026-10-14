// Event-contract tests with deliberately small DOM/Audio doubles.
// These execute the shipped app.js, but do not replace real browser or accessibility QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import * as model from '../dist/demo-model.mjs';
import * as ui from '../dist/watch-ui.mjs';

const root = new URL('../dist/', import.meta.url);
const markup = readFileSync(new URL('demo/index.html', root), 'utf8');
const source = readFileSync(new URL('app.js', root), 'utf8').replace(/^import[^\n]+\n/gm, '');
const discoveries = JSON.parse(readFileSync(new URL('assets/discoveries.json', root)));
const book = JSON.parse(readFileSync(new URL('assets/pip/book.json', root)));
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
  let audio,timerId=0;
  const timers=new Map(),events={};
  const controls = { failsToLoad };
  const context = vm.createContext({
    ...model,...ui,esc:ui.escapeHTML,ni:ui.nativeIcon,icon:ui.generalIcon, document, URLSearchParams, CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}}, setTimeout:(fn,delay)=>{const id=++timerId;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id), navigator:{clipboard:{writeText:async()=>{}}},
    window:{location:{search},addEventListener(type,fn){events[type]=fn;},dispatchEvent(event){events[event.type]?.(event);},matchMedia(){return {matches:false};},print(){}},
    Audio:class extends AudioDouble { constructor(){ super(); audio = this; } },
    fetch:async path => ({ ok:!controls.failsToLoad, json:async()=>JSON.parse(readFileSync(new URL(path.slice(1),root))) })
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
  return {document,audio,controls,context,query,click,timers,events,advance(delay){for(const [id,t] of timers)if(t.delay<=delay){timers.delete(id);t.fn();}},command(action,value){events['tj:watch-command']({detail:{action,value}});},state:()=>vm.runInContext('state',context)};
}


test('preview opens genuine Curiosity controls, silently, with activity selection inside Home',async()=>{
 const a=await setup();assert.equal(a.state().view,'home');assert.equal(a.audio.playCalls,0);assert.ok(a.query('[data-action="microphone"]'));assert.ok(a.query('[data-topic="moon"]'));assert.doesNotMatch(markup,/class="demo-tabs"|<button[^>]*data-mode=/);
 await a.click('[data-shell-home]');assert.equal(a.state().view,'launcher');
 for(const mode of ['ask','story','math'])assert.ok(a.query('[data-mode="'+mode+'"]'));
});
test('Home works from readers and launches Math and Stories immediately without sample waiting timers',async()=>{
 const a=await setup();await a.click('[data-topic="moon"]');await a.click('[data-action="listen"]');await a.click('[data-shell-home]');assert.equal(a.audio.src,undefined);
 await a.click('[data-mode="math"]');assert.equal(a.state().view,'mathIntro');assert.equal(a.timers.size,0);await a.click('[data-action="startMath"]');assert.equal(a.state().view,'math');
 await a.click('[data-shell-home]');await a.click('[data-mode="story"]');assert.equal(a.state().view,'storyEntry');assert.equal(a.timers.size,0);assert.match(a.query('#watch-content').innerHTML,/\/assets\/pip\/cover.jpg/);
});
test('microphone sample shows listening and stars, two rounds of three choices, and returns to Curiosity',async()=>{
 const a=await setup();await a.click('[data-action="microphone"]');assert.equal(a.state().view,'listening');assert.match(a.query('#demo-status').textContent,/No microphone is recorded/);
 a.advance(1500);assert.equal(a.state().view,'thinking');a.advance(2350);assert.equal(a.state().view,'discovery');
 for(let round=0;round<2;round++){await a.click('[data-action="choices"]');assert.equal(a.state().view,'choices');assert.equal(a.document.querySelectorAll('[data-branch]').length,3);await a.click('[data-branch="1"]');assert.equal(a.state().view,'discovery');}
 assert.equal(a.query('[data-action="choices"]'),null);await a.click('[data-action="curiosity"]');assert.equal(a.state().view,'home');assert.equal(a.state().log.length,1);assert.equal(a.timers.size,0);
});
test('Home, reset and pagehide cancel the finite microphone sequence so no stale result replaces a new screen',async()=>{
 for(const leave of ['home','reset','pagehide']){const a=await setup();await a.click('[data-action="microphone"]');if(leave==='home')await a.click('[data-shell-home]');else if(leave==='reset')await a.click('#reset-demo');else a.events.pagehide();assert.equal(a.timers.size,0);a.advance(9999);assert.equal(a.state().view,leave==='home'?'launcher':'home');}
});
test('activity deep links open their sample and unknown links preserve the Curiosity default',async()=>{
 for(const [entry,view] of [['moon','discovery'],['seed','discovery'],['butterfly','discovery'],['story','storyEntry'],['math','mathIntro'],['<script>','home']]){const a=await setup({search:'?activity='+encodeURIComponent(entry)});assert.equal(a.state().view,view);assert.equal(a.audio.playCalls,0);}
});
test('narration retains pause, resume, replay and visible retry after playback rejection',async()=>{
 const a=await setup({search:'?activity=moon'});await a.click('[data-action="listen"]');assert.match(a.query('[data-action="listen"]').attrs['aria-label'],/Pause/);
 a.audio.currentTime=8;await a.click('[data-action="listen"]');assert.match(a.query('[data-action="listen"]').attrs['aria-label'],/Resume/);
 a.audio.ended=true;a.audio.emit('ended');assert.match(a.query('[data-action="listen"]').attrs['aria-label'],/Replay/);await a.click('[data-action="listen"]');assert.equal(a.audio.currentTime,0);
 await a.click('[data-action="listen"]');a.audio.fail=true;await a.click('[data-action="listen"]');assert.match(a.query('#audio-note').textContent,/unavailable/);assert.match(a.query('[data-action="listen"]').attrs['aria-label'],/Retry/);
 a.audio.fail=false;await a.click('[data-action="listen"]');assert.equal(a.query('#audio-note').hidden,true);
});
test('late rejected narration does not overwrite a newer activity',async()=>{
 const a=await setup({search:'?activity=moon'});a.audio.deferred=true;await a.click('[data-action="listen"]');await a.click('[data-shell-home]');await a.click('[data-mode="story"]');const message=a.query('#demo-status').textContent;a.audio.pendingReject(new Error('Old playback'));await settle();assert.equal(a.query('#demo-status').textContent,message);assert.equal(a.state().view,'storyEntry');
});
test('Moon sample control replaces the actual answer, and restoration does not autoplay',async()=>{
 const a=await setup({search:'?activity=moon'});await a.click('[data-action="listen"]');a.command('policy','together');assert.equal(a.state().view,'boundary');assert.match(a.query('#watch-content').innerHTML,/grown-up/);assert.equal(a.audio.src,undefined);a.command('policy','explore');assert.equal(a.state().view,'discovery');assert.equal(a.audio.playCalls,1);
});
test('math feedback helps a wrong choice and focus stays inside the fixed Watch',async()=>{
 const a=await setup({search:'?activity=math'});await a.click('[data-action="startMath"]');await a.click('[data-number="3"]');assert.equal(a.state().mathSolved,false);assert.equal(a.document.activeElement.dataset.number,'3');await a.click('[data-number="4"]');assert.equal(a.state().mathSolved,true);assert.equal(a.document.activeElement.dataset.action,'nextMath');assert.equal(a.document.side.scrolled,undefined);
});
test('the genuine Pip story can finish and restart while keeping other activity progress',async()=>{
 const a=await setup({search:'?activity=story'});await a.click('[data-action="resumeStory"]');await a.click('[data-action="listen"]');assert.match(a.audio.src,/\/assets\/pip\/seed.m4a/);
 for(let i=1;i<book.nodes.length;i++)await a.click('[data-action="next"]');assert.equal(a.state().view,'done');assert.match(a.state().log[0],/Pip/);await a.click('[data-action="restart"]');assert.equal(a.state().view,'storyEntry');
});
test('a content error is recoverable and reset clears local sample state',async()=>{
 const a=await setup({failsToLoad:true});assert.ok(a.query('[data-action="retry"]'));a.controls.failsToLoad=false;await a.click('[data-action="retry"]');assert.equal(a.state().view,'home');a.command('policy','together');await a.click('#reset-demo');assert.equal(a.state().view,'home');assert.equal(a.state().moonPolicy,'explore');assert.equal(a.state().log.length,0);
});
test('seed and butterfly discoveries finish on Curiosity without unrelated Moon follow-ups',async()=>{
 for(const topic of ['seed','butterfly']){const a=await setup({search:'?activity='+topic});await a.click('[data-action="next"]');assert.equal(a.query('[data-action="choices"]'),null);await a.click('[data-action="curiosity"]');assert.equal(a.state().view,'home');assert.equal(a.state().log.length,1);}
});
test('story reading speed changes only playback rate and keeps the prepared source',async()=>{
 const a=await setup({search:'?activity=story'});await a.click('[data-action="resumeStory"]');await a.click('[data-action="listen"]');const src=a.audio.src,calls=a.audio.playCalls;a.command('pace',.75);assert.equal(a.audio.playbackRate,.75);assert.equal(a.audio.src,src);assert.equal(a.audio.playCalls,calls);
});
test('the story follows native word timings without replacing the readable text',async()=>{
 const a=await setup({search:'?activity=story'});await a.click('[data-action="resumeStory"]');await a.click('[data-action="listen"]');a.audio.currentTime=1.1;a.audio.emit('timeupdate');assert.equal(a.query('[data-story-word="2"]').attrs['data-current'],'true');assert.match(a.query('#watch-content').innerHTML,/seed/);
});
