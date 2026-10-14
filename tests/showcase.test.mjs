// Homepage interaction contracts, not a browser/layout test.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const root = new URL('../dist/', import.meta.url);
const source = readFileSync(new URL('showcase.js',root),'utf8');
const home = readFileSync(new URL('index.html',root),'utf8');
function setup({missing=false}={}) {
  const choices = ['explore','together'].map((choice,index)=>({
    dataset:{parentChoice:choice}, disabled:true, attrs:{'aria-pressed':String(index===0)},
    setAttribute(key,value){this.attrs[key]=value;}, getAttribute(key){return this.attrs[key];},
    addEventListener(type,fn){this[type]=fn;}
  }));
  const symbol = {setAttribute(key,value){this[key]=value;}};
  const text = {textContent:'Initial answer'};
  const response = {dataset:{}, querySelector:()=>symbol};
  let effects=0;
  const elements={'#sample-response':response,'#sample-response-text':text,'#response-icon use':symbol};
  const document={querySelectorAll:()=>choices,querySelector:selector=>missing?null:elements[selector]};
  vm.runInNewContext(source,{document,window:{TrustinMotion:{preview(){effects++;}}}});
  return {choices,text,symbol,response,effects:()=>effects};
}

test('homepage parent choice updates the visible response, selected state and icon',()=>{
  const app=setup();
  assert.ok(app.choices.every(button=>!button.disabled));
  app.choices[1].click();
  assert.equal(app.choices[1].attrs['aria-pressed'],'true');
  assert.equal(app.choices[0].attrs['aria-pressed'],'false');
  assert.match(app.text.textContent,/grown-up/);
  assert.equal(app.symbol.href,'/assets/icons.svg#parents');
  assert.equal(app.response.dataset.choice,'together');
  assert.equal(app.effects(),1);
  app.choices[1].click(); assert.equal(app.effects(),1);
  app.choices[0].click();
  assert.match(app.text.textContent,/Moon stays round/);
  assert.equal(app.symbol.href,'/assets/icons.svg#moon');
});

test('incomplete homepage enhancement leaves static content alone',()=>{
  const app=setup({missing:true});
  assert.ok(app.choices.every(button=>button.disabled));
  assert.equal(app.effects(),0);
});

test('homepage contains visual product scenes and native demo links, not the full app',()=>{
  assert.match(home,/data-scroll-scene/);
  assert.match(home,/Illustrative app views/);
  assert.match(home,/No ads\. No sponsored answers\. No purchase pressure\./);
  assert.doesNotMatch(home,/id="watch-content"|src="\/app.js"/);
  for (const mode of ['moon','story','math']) assert.ok(home.includes('href="/demo/?activity='+mode+'"'));
  assert.match(home,/aria-controls="sample-response"/);
  assert.match(home,/id="sample-response" role="status" aria-live="polite"/);
  assert.doesNotMatch(source,/fetch\(|new Audio|setInterval/);
});
