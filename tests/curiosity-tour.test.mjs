// Execute the shipped tour with small DOM/viewport doubles. Not rendered browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {chapterStops,tourFrame,tourProgress,connectorPath} from '../dist/curiosity-tour-core.mjs';
import {mountSwipe} from '../dist/swipe.js';

const rootPath = new URL('../dist/', import.meta.url);
const html = readFileSync(new URL('index.html',rootPath),'utf8');
const source = readFileSync(new URL('curiosity-tour.js',rootPath),'utf8').replace(/^import[^\n]+\n/gm,'').replace('export function','function');
function node(dataset={},rect={left:0,top:0,width:100,height:100}) {
  return { dataset, hidden:false, disabled:true, attrs:{}, events:{}, textContent:'Feature', clientWidth:1200, offsetHeight:450,
    style:{values:{},setProperty(k,v){this.values[k]=v;},removeProperty(k){delete this.values[k];}},
    setAttribute(k,v){this.attrs[k]=String(v);}, addEventListener(k,v){this.events[k]=v;},
    getBoundingClientRect(){return {...rect,right:rect.left+rect.width,bottom:rect.top+rect.height};} };
}
function setup({reduced=false,small=false,short=false}={}) {
  const bounds={left:0,top:72,width:1200,height:3200};
  const stage=node({}, {left:0,top:72,width:1200,height:728});
  const device=node();
  const panels=['packs','ask','continue'].map(key=>node({tourPanel:key},{left:700,top:180,width:350,height:380}));
  const controls=[0,1,2,3].map(index=>node({tourTo:String(index)}));
  const line=node(), dot=node(), status=node(), rail=node(), cards=node();
  const root=node({},bounds);
  root.querySelector=selector=>({'.story-stage':stage,'.tour-device':device,'.tour-controls':rail,'.tour-panels':cards,'[data-tour-line]':line,'[data-tour-dot]':dot,'[data-tour-status]':status}[selector] || (selector.startsWith('[data-tour-hotspot') ? node({}, {left:150,top:200,width:90,height:90}) : null));
  root.querySelectorAll=selector=>selector==='[data-tour-panel]' ? panels : controls;
  const events={}, frames=[], scrolls=[];
  let enabled=!reduced, subscriber;
  const policy={enabled:()=>enabled,subscribe:fn=>{subscriber=fn;}};
  const win={ TJMotionPolicy:policy, scrollY:0,
    getComputedStyle:()=>({top:'72px'}),
    matchMedia:q=>({matches:q.includes('width')?small:q.includes('height')?short:!enabled}),
    requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},cancelAnimationFrame:id=>{frames[id-1]=null;},
    addEventListener:(event,fn)=>{events[event]=fn;}, scrollTo:options=>scrolls.push(options)
  };
  vm.runInNewContext(source,{window:win,document:{querySelector:()=>root},chapterStops,tourFrame,tourProgress,connectorPath,mountSwipe});
  return {root,device,panels,controls,rail,cards,line,dot,status,frames,events,scrolls,
    progress(p){bounds.top=72-p*(3200-728);events.scroll();frames.splice(0).forEach(fn=>fn?.());},
    off(){enabled=false;subscriber();}, on(){enabled=true;subscriber();}
  };
}
test('arrival is annotation-free; the same Watch shrinks before any chapter appears',()=>{
  const app=setup();
  assert.equal(app.root.dataset.chapter,'overview');
  assert.ok(app.panels.every(p=>p.hidden));
  assert.ok(app.controls.every(p=>!p.disabled));
  app.progress(.20);
  assert.ok(Number(app.device.style.values['--watch-scale'])<1);
  assert.ok(app.panels.every(p=>p.hidden));
  app.progress(.34);
  assert.equal(app.root.dataset.chapter,'packs');
  assert.equal(app.panels.filter(p=>!p.hidden).length,1);
  assert.ok(app.line.attrs.d.startsWith('M'));
});
test('forward and reverse scroll each expose exactly one correct feature',()=>{
  const app=setup();
  for(const [progress,index] of [[.34,0],[.60,1],[.88,2],[.60,1],[.34,0]]){
    app.progress(progress);
    assert.equal(app.panels.filter(p=>!p.hidden).length,1);
    assert.equal(app.panels[index].hidden,false);
    assert.equal(app.controls[index+1].attrs['aria-pressed'],'true');
  }
  app.progress(0);assert.ok(app.panels.every(p=>p.hidden));assert.equal(app.line.attrs.d,'');
});
test('rapid scroll events coalesce; leaving the page cancels queued work',()=>{
  const app=setup();
  app.events.scroll();app.events.scroll();app.events.scroll();
  assert.equal(app.frames.length,1);
  app.events.pagehide(); assert.equal(app.frames[0],null);
  app.events.scroll();assert.equal(app.frames.length,1);
  app.events.pageshow();assert.equal(app.root.dataset.tourMode,'scroll');
});
test('chapter buttons use native scroll, and reduced motion switches to manual selection',()=>{
  const app=setup();app.controls[2].events.click();
  assert.equal(app.scrolls.length,1);assert.equal(app.scrolls[0].behavior,'smooth');
  app.progress(.6);app.off();
  assert.equal(app.root.dataset.tourMode,'manual');
  assert.equal(app.device.style.values['--watch-scale'],undefined);
  assert.equal(app.line.attrs.d,'');
  app.controls[3].events.click();
  assert.equal(app.scrolls.length,1);
  assert.equal(app.root.dataset.chapter,'continue');
  assert.equal(app.panels.filter(p=>!p.hidden).length,1);
  assert.equal(app.status.textContent,'Feature');
});
test('system/manual reduction and short landscapes are informative without scroll animation',()=>{
  for(const options of [{reduced:true},{short:true}]){
    const app=setup(options);
    assert.equal(app.root.dataset.tourMode,'manual');
    for(let index=1;index<4;index++){
      app.controls[index].events.click();
      assert.equal(app.panels[index-1].hidden,false);
    }
    assert.equal(app.scrolls.length,0);
  }
});
test('small screens reserve room below the Watch and route connectors vertically',()=>{
  const app=setup({small:true});app.progress(.34);
  assert.equal(app.device.style.values['--watch-x'],'0px');
  assert.ok(Number.parseFloat(app.device.style.values['--watch-y'])<0);
  assert.ok(Number(app.device.style.values['--watch-scale'])<=.77);
  assert.match(app.line.attrs.d,/C195,/);
});
test('geometry is clamped and all chapter stops reveal their named state',()=>{
  assert.equal(tourProgress(200,1000,700,72),0);
  assert.equal(tourProgress(-1000,1000,700,72),1);
  assert.equal(tourFrame(NaN).chapter,-1);
  chapterStops.forEach((p,i)=>assert.equal(tourFrame(p).chapter,i-1));
  assert.equal(tourFrame(1).shrink,1);
});
test('the homepage rail and explanation card share swipe navigation and selected-state feedback',()=>{
  const target={closest:()=>null};
  const swipe=(surface,x,end)=>{surface.events.pointerdown({pointerType:'touch',pointerId:1,clientX:x,clientY:10,target});surface.events.pointerup({pointerId:1,clientX:end,clientY:10});};
  const a=setup({reduced:true});
  swipe(a.rail,100,20);assert.equal(a.root.dataset.chapter,'packs');
  swipe(a.cards,100,20);assert.equal(a.root.dataset.chapter,'ask');assert.equal(a.controls[2].attrs['aria-pressed'],'true');
  swipe(a.cards,100,20);assert.equal(a.root.dataset.chapter,'continue');
  swipe(a.cards,100,20);assert.equal(a.root.dataset.chapter,'continue');
  swipe(a.cards,20,100);assert.equal(a.root.dataset.chapter,'ask');
  swipe(a.cards,20,100);assert.equal(a.root.dataset.chapter,'packs');
  swipe(a.cards,20,100);assert.equal(a.root.dataset.chapter,'overview');assert.equal(a.controls[0].attrs['aria-pressed'],'true');
  const b=setup({small:true});b.progress(.88);
  swipe(b.cards,20,100);assert.equal(b.scrolls.length,1);assert.equal(b.scrolls[0].behavior,'smooth');
  b.progress(chapterStops[2]);assert.equal(b.root.dataset.chapter,'ask');assert.equal(b.controls[2].attrs['aria-pressed'],'true');
});
test('unenhanced markup preserves feature copy and uses matching native artwork hotspots',()=>{
  for(const key of ['packs','ask','continue']) {
    assert.ok(html.includes('data-tour-panel="'+key+'"'));
    assert.ok(html.includes('data-tour-hotspot="'+key+'"'));
  }
  assert.doesNotMatch(html,/data-tour-panel="[^"]+"[^>]*\bhidden\b/);
  assert.match(html,/href="#experience" aria-label="Skip the Curiosity tour"/);
  assert.doesNotMatch(source,/setInterval|setTimeout|preventDefault|new Audio|fetch\(/);
});
