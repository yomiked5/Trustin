import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialState,chooseMode,chooseTopic,changePolicy,solveMath,nextMath,mathQuestions,record} from '../dist/demo-model.mjs';

test('a changed parent boundary replaces an active related discovery and reopening cannot bypass it',()=>{
  const s=initialState();chooseTopic(s,'moon');s.page=1;
  changePolicy(s,'together');assert.equal(s.view,'boundary');assert.equal(s.page,0);
  chooseMode(s,'story');chooseTopic(s,'moon');assert.equal(s.view,'boundary');
  chooseTopic(s,'seed');assert.equal(s.view,'discovery');
  chooseTopic(s,'moon');changePolicy(s,'explore');assert.equal(s.view,'discovery');assert.equal(s.page,0);
});
test('wrong answers cannot advance; every correct answer is required for a finite math completion',()=>{
  const s=initialState();chooseMode(s,'math');s.view='math';
  solveMath(s,99);nextMath(s);assert.equal(s.mathPage,0);assert.equal(s.log.length,0);
  for(const q of mathQuestions){assert.equal(solveMath(s,q.answer),true);nextMath(s);}
  assert.equal(s.view,'done');assert.equal(s.log.length,1);
  assert.equal(s.log[0],'Completed the garden math sample');
});
test('mode changes and a fresh session reset unfinished progress; the log does not invent or duplicate activity',()=>{
  const s=initialState();assert.deepEqual(s.log,[]);
  chooseMode(s,'math');s.mathPage=1;chooseMode(s,'story');assert.equal(s.mathPage,0);
  record(s,'Explored seeds');record(s,'Explored seeds');assert.equal(s.log.length,1);
  const clean=initialState();assert.equal(clean.moonPolicy,'explore');assert.deepEqual(clean.log,[]);
});
test('the story is a complete linear book with an explicit introduction and ending',()=>{
  const book=JSON.parse(readFileSync(new URL('../dist/assets/story/book.json',import.meta.url)));
  assert.equal(book.nodes[0].kind,'intro');assert.equal(book.nodes.at(-1).kind,'ending');assert.equal(book.nodes.at(-1).next,null);
  for(let i=0;i<book.nodes.length-1;i++)assert.equal(book.nodes[i].next,book.nodes[i+1].id);
  assert.match(book.nodes.at(-1).text,/The end\./);
});
