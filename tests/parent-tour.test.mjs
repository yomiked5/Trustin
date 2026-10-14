// Execute the actual parent scene with bounded DOM doubles. No rendered QA claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parentChapters,parentScreen} from '../dist/parent-ui.mjs';
import {connectorPath,tourProgress} from '../dist/curiosity-tour-core.mjs';
const source=readFileSync(new URL('../dist/parent-tour.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replaceAll('export function','function');
const home=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const demo=readFileSync(new URL('../dist/demo/index.html',import.meta.url),'utf8');
function node(rect={left:0,top:0,width:100,height:100}) {
  return {dataset:{},attrs:{},events:{},disabled:true,hidden:false,clientWidth:1200,offsetHeight:500,offsetTop:100,
    style:{values:{},setProperty(k,v){this.values[k]=v;},removeProperty(k){delete this.values[k];}},
    setAttribute(k,v){this.attrs[k]=String(v);},removeAttribute(k){delete this.attrs[k];},hasAttribute(k){return k in this.attrs;},
    addEventListener(k,fn){this.events[k]=fn;},getBoundingClientRect(){return {...rect,right:rect.left+rect.width,bottom:rect.top+rect.height};}};
}
function setup({reduced=false,small=false,short=false,staticDemo=false}={}) {
  const bounds={left:0,top:72,width:1200,height:5760};
  const root=node(bounds),stage=node({left:0,top:72,width:1200,height:728}),device=node({left:160,top:120,width:260,height:500});
  if(staticDemo)root.attrs['data-parent-static']='';
  const scroller=node(),target=node({left:185,top:230,width:200,height:150});
  const screen=node();screen.querySelector=s=>s==='.ios-scroll'?scroller:target;
  const panels=parentChapters.map(c=>{const p=node({left:680,top:200,width:430,height:300});p.dataset.parentPanel=c.id;p.detail=node();p.querySelector=()=>p.detail;return p;});
  const picker=node(),prev=node(),next=node(),path=node(),dot=node(),status=node();
  const items={'.parent-stage':stage,'.parent-device':device,'[data-parent-screen]':screen,'[data-parent-picker]':picker,'[data-parent-prev]':prev,'[data-parent-next]':next,'[data-parent-line]':path,'[data-parent-dot]':dot,'[data-parent-status]':status};
  root.querySelector=s=>items[s];root.querySelectorAll=()=>panels;
  let enabled=!reduced,subscriber;const events={},frames=[],scrolls=[];
  const policy={enabled:()=>enabled,subscribe:fn=>{subscriber=fn;}};
  const win={TJMotionPolicy:policy,scrollY:0,getComputedStyle:()=>({top:'72px'}),matchMedia:q=>({matches:q.includes('width')?small:q.includes('height')?short:!enabled}),requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},cancelAnimationFrame:id=>{frames[id-1]=null;},addEventListener:(name,fn)=>{events[name]=fn;},scrollTo:o=>scrolls.push(o)};
  const context=vm.createContext({window:win,document:{querySelector:()=>root},parentChapters,parentScreen,connectorPath,tourProgress});
  vm.runInContext(source,context);
  return {root,screen,device,panels,picker,prev,next,path,dot,status,events,frames,scrolls,context,
    progress(p){bounds.top=72-p*(5760-728);events.scroll();frames.splice(0).forEach(fn=>fn?.());},
    choose(i){picker.value=String(i);picker.events.change();},off(){enabled=false;subscriber();},on(){enabled=true;subscriber();}};
}
test('parent arrival shows only the current iOS product; shrink precedes annotations',()=>{
  const a=setup();assert.equal(a.root.dataset.parentChapter,'overview');assert.ok(a.panels.every(p=>p.hidden));assert.match(a.screen.innerHTML,/A moment together/);assert.doesNotMatch(a.screen.innerHTML,/Website|Sample|holograph|tooltips/i);
  a.progress(.14);assert.ok(a.panels.every(p=>p.hidden));assert.ok(Number(a.device.style.values['--phone-scale'])<1);
});
test('every scroll chapter selects one feature, matching screen and connector in both directions',()=>{
  const a=setup();
  for(const i of [0,1,2,3,4,5,6,5,2,0]){
    a.progress(vm.runInContext(`parentStop(${i})`,a.context));
    assert.equal(a.root.dataset.parentChapter,parentChapters[i].id);assert.equal(a.panels.filter(p=>!p.hidden).length,1);assert.equal(a.panels[i].hidden,false);assert.equal(a.picker.value,String(i));assert.match(a.screen.innerHTML,new RegExp(`data-parent-target="${parentChapters[i].id}"`));assert.match(a.path.attrs.d,/^M/);
  }
  a.progress(0);assert.ok(a.panels.every(p=>p.hidden));assert.equal(a.path.attrs.d,'');assert.equal(a.prev.disabled,true);
});
test('reduction, short screens and demo mode retain all chapters through manual controls',()=>{
  for(const options of [{reduced:true},{short:true},{staticDemo:true}]){
    const a=setup(options);assert.equal(a.root.dataset.parentMode,'manual');
    for(let i=0;i<parentChapters.length;i++){a.choose(i);assert.equal(a.panels[i].hidden,false);assert.equal(a.panels.filter(p=>!p.hidden).length,1);}
    assert.equal(a.next.disabled,true);assert.equal(a.scrolls.length,0);assert.match(a.status.textContent,/Watch setup/);a.prev.events.click();assert.equal(a.picker.value,'5');
  }
});
test('manual motion off clears transforms, connectors and open stale explanations',()=>{
  const a=setup();a.progress(.45);a.panels[2].detail.attrs.open='';a.off();assert.equal(a.root.dataset.parentMode,'manual');assert.equal(a.device.style.values['--phone-scale'],undefined);assert.equal(a.path.attrs.d,'');assert.equal(a.panels[2].detail.hasAttribute('open'),false);a.choose(3);assert.equal(a.panels[3].hidden,false);a.on();assert.equal(a.root.dataset.parentMode,'scroll');
});
test('native chapter navigation is bounded and no wheel or touch interception is installed',()=>{
  const a=setup();a.next.events.click();assert.equal(a.scrolls[0].behavior,'smooth');a.choose(6);assert.ok(a.scrolls[1].top>a.scrolls[0].top);assert.doesNotMatch(source,/preventDefault|setInterval|setTimeout|new Audio|fetch\(/);
  assert.equal(vm.runInContext('parentFrame(NaN).chapter',a.context),-1);assert.equal(vm.runInContext('parentFrame(2).chapter',a.context),6);
});
test('mobile layout lifts the phone and coalesces scroll updates; pagehide cancels pending work',()=>{
  const a=setup({small:true});a.progress(.3);assert.equal(a.device.style.values['--phone-x'],'0px');assert.ok(Number.parseFloat(a.device.style.values['--phone-y'])<0);assert.ok(Number(a.device.style.values['--phone-scale'])<=.68);a.events.scroll();a.events.scroll();assert.equal(a.frames.length,1);a.events.pagehide();assert.equal(a.frames[0],null);a.events.pageshow();assert.equal(a.root.dataset.parentMode,'scroll');
});
test('source-based screens keep native speed choices, four tabs, and no fabricated connected Watch',()=>{
  assert.match(parentScreen('reading'),/>Slower<.*>Calm<.*>Natural</);assert.doesNotMatch(parentScreen('reading'),/Brisk|quicker/);assert.match(parentScreen('setup'),/No Watch connected yet/);assert.match(parentScreen('topics'),/Always protected/);
  for(const c of parentChapters){const html=parentScreen(c.id);for(const tab of ['Today','Activity','Safeguards','Watch setup'])assert.ok(html.includes(tab));assert.doesNotMatch(html,/<button|<a |<select/);}
});
test('homepage and demo separate website annotations from product rendering and expose no-JS copy',()=>{
  for(const html of [home,demo])for(const c of parentChapters){assert.ok(html.includes(`data-parent-panel="${c.id}"`));assert.ok(html.includes(c.why));}
  assert.match(home,/Their wonder\.<br><span>Your guidance\./);assert.doesNotMatch(home,/id="watch-content"|src="\/app.js"/);assert.match(demo,/data-parent-static/);assert.match(demo,/Moon preference is a website illustration, not a native topic category/);
});
test('demo explanation picker reveals one selected website pane without changing product state',()=>{
  const picker=node();picker.value='experience';const panels=['experience','guidance','pace','together','activity'].map(id=>({dataset:{previewPanel:id}}));
  vm.runInNewContext(readFileSync(new URL('../dist/demo-exhibit.js',import.meta.url),'utf8'),{document:{querySelector:()=>picker,querySelectorAll:()=>panels}});
  assert.equal(panels.filter(p=>!p.hidden).length,1);for(const panel of panels){picker.value=panel.dataset.previewPanel;picker.events.change();assert.equal(panels.filter(p=>!p.hidden).length,1);assert.equal(panel.hidden,false);}assert.equal(picker.disabled,false);
});
