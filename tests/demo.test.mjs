import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialState, chooseMode, chooseTopic, changePolicy, restartMode, solveMath, nextMath, mathQuestions, record, playbackLabel } from '../dist/demo-model.mjs';

test('a parent boundary replaces an active Moon discovery and cannot be bypassed by reopening', () => {
  const s = initialState(); chooseTopic(s, 'moon'); s.page = 1;
  assert.equal(changePolicy(s, 'together'), true);
  assert.equal(s.view, 'boundary'); assert.equal(s.page, 0);
  chooseMode(s, 'story'); chooseTopic(s, 'moon'); assert.equal(s.view, 'boundary');
  chooseTopic(s, 'seed'); assert.equal(s.view, 'discovery');
  chooseTopic(s, 'moon'); changePolicy(s, 'explore'); assert.equal(s.view, 'discovery');
});

test('Moon policy cannot hijack story or math completion with a stale topic', () => {
  for (const mode of ['story', 'math']) {
    const s = initialState(); chooseTopic(s, 'moon'); chooseMode(s, mode); s.view = 'done';
    assert.equal(s.topic, null);
    assert.equal(changePolicy(s, 'together'), false);
    assert.equal(s.mode, mode); assert.equal(s.view, 'done');
    chooseMode(s, 'ask'); assert.equal(s.view, 'boundary'); assert.equal(s.topic, 'moon');
  }
});

test('unrelated topic preferences report no visible change and preserve seed content', () => {
  const s = initialState(); chooseTopic(s, 'seed'); s.page = 1;
  assert.equal(changePolicy(s, 'together'), false);
  assert.equal(s.topic, 'seed'); assert.equal(s.page, 1); assert.equal(s.view, 'discovery');
  chooseTopic(s, 'moon'); assert.equal(s.view, 'boundary');
});

test('an unchanged policy does not restart a related discovery', () => {
  const s = initialState(); chooseTopic(s, 'moon'); s.page = 1;
  assert.equal(changePolicy(s, 'explore'), false); assert.equal(s.page, 1);
});

test('activity switching preserves each activity independently', () => {
  const s = initialState();
  chooseTopic(s, 'seed'); s.page = 1;
  chooseMode(s, 'story'); s.storyPage = 4;
  chooseMode(s, 'math'); s.view = 'math'; s.mathPage = 1; solveMath(s, 99);
  chooseMode(s, 'story'); assert.equal(s.storyPage, 4); assert.equal(s.view, 'story');
  chooseMode(s, 'ask'); assert.equal(s.topic, 'seed'); assert.equal(s.page, 1);
  chooseMode(s, 'math'); assert.equal(s.mathPage, 1); assert.equal(s.mathFeedback, mathQuestions[1].hint);
});

test('choosing the same activity does not reset its place', () => {
  const s = initialState(); chooseMode(s, 'story'); s.storyPage = 3;
  chooseMode(s, 'story'); assert.equal(s.storyPage, 3);
});

test('math needs all three correct answers and cannot advance after completion', () => {
  const s = initialState(); chooseMode(s, 'math'); s.view = 'math';
  solveMath(s, 99); nextMath(s); assert.equal(s.mathPage, 0); assert.equal(s.log.length, 0);
  for (const q of mathQuestions) { assert.equal(solveMath(s, q.answer), true); nextMath(s); }
  assert.equal(s.view, 'done'); assert.equal(s.log.length, 1);
  nextMath(s); assert.equal(s.log.length, 1); assert.equal(s.view, 'done');
  assert.equal(solveMath(s, 4), false);
});

test('math actions are guarded outside the math activity', () => {
  const s = initialState(); s.mathSolved = true; s.mathPage = 2;
  nextMath(s); assert.equal(s.view, 'home'); assert.equal(s.log.length, 0);
  assert.equal(solveMath(s, 4), false);
});

test('explicit activity restart preserves family settings, log, and other activities', () => {
  const s = initialState(); chooseTopic(s, 'seed'); s.page = 1;
  chooseMode(s, 'story'); s.storyPage = 7; s.view = 'done'; s.pace = 1;
  changePolicy(s, 'together'); record(s, 'Finished story'); restartMode(s);
  assert.equal(s.storyPage, 0); assert.equal(s.view, 'story'); assert.equal(s.pace, 1);
  assert.equal(s.moonPolicy, 'together'); assert.equal(s.log.length, 1);
  chooseMode(s, 'ask'); assert.equal(s.topic, 'seed'); assert.equal(s.page, 1);
});

test('fresh state clears preferences and progress; activity logs are never invented or duplicated', () => {
  const s = initialState(); assert.deepEqual(s.log, []);
  record(s, 'Explored seeds'); record(s, 'Explored seeds'); assert.equal(s.log.length, 1);
  changePolicy(s, 'together');
  const clean = initialState(); assert.equal(clean.moonPolicy, 'explore'); assert.deepEqual(clean.saved, {}); assert.deepEqual(clean.log, []);
});

test('invalid activity and topic choices leave the state alone', () => {
  const s = initialState(); const before = structuredClone(s);
  chooseMode(s, 'unknown'); chooseTopic(s, 'unknown'); assert.deepEqual(s, before);
});

test('playback labels distinguish Listen, Pause, Resume and Replay', () => {
  assert.equal(playbackLabel(), 'Listen');
  assert.equal(playbackLabel({playing:true,time:3}), 'Pause');
  assert.equal(playbackLabel({time:3}), 'Resume');
  assert.equal(playbackLabel({ended:true,time:30}), 'Replay');
});

test('the story has an explicit introduction, a complete linear path, and an ending', () => {
  const book = JSON.parse(readFileSync(new URL('../dist/assets/story/book.json', import.meta.url)));
  assert.equal(book.nodes[0].kind, 'intro'); assert.equal(book.nodes.at(-1).kind, 'ending'); assert.equal(book.nodes.at(-1).next, null);
  for (let i=0; i<book.nodes.length-1; i++) assert.equal(book.nodes[i].next, book.nodes[i+1].id);
  assert.match(book.nodes.at(-1).text, /The end\./);
});
