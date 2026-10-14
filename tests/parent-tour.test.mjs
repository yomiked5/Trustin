// Execute the shipped Parent Dock controller. DOM doubles are not rendered browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parentChapters,parentScreen,initialParentState} from '../dist/parent-ui.mjs';
import {mountSwipe} from '../dist/swipe.js';
import {drawSpotlight} from '../dist/spotlight.js';
const source=readFileSync(new URL('../dist/parent-tour.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'').replaceAll('export function','function');
function node(rect={left:0,top:0,width:100,height:100}){
 return {dataset:{},attrs:{},events:{},style:{},disabled:false,hidden:false,offsetTop:100,scrollTop:0,innerHTML:'',classList:{add(){}},
 setAttribute(k,v){this.attrs[k]=String(v);},removeAttribute(k){delete this.attrs[k];},focus(){this.focused=true;},addEventListener(k,fn){this.events[k]=fn;},removeEventListener(k){delete this.events[k];},getBoundingClientRect(){return {...rect,right:rect.left+rect.width,bottom:rect.top+rect.height};},closest(){return null;}};
}
function setup(){
 const root=node(),stage=node({left:0,top:66,width:390,height:620}),device=node({left:18,top:180,width:130,height:280}),screen=node(),scroll=node(),target=node({left:30,top:240,width:105,height:95});
 target.closest=()=>device;
 const panels=parentChapters.map(c=>{const p=node({left:170,top:170,width:200,height:370});p.dataset.parentPanel=c.id;return p;});
 const picker=node(),prev=node(),next=node(),path=node(),dot=node(),status=node(),connector=node();let box;
 stage.append=n=>{box=n;};stage.querySelector=s=>({'[data-hud-line]':path,'[data-hud-dot]':dot,'[data-hud-box]':box}[s]);
 const controls=new Map();
 screen.querySelector=s=>{
   if(s==='.ios-scroll')return scroll;
   const action=s.match(/data-parent-action="([^"]+)"/)?.[1];if(action){if(!screen.innerHTML.includes('data-parent-action="'+action+'"'))return null;if(!controls.has(action)){const b=node();b.dataset.parentAction=action;b.closest=()=>b;controls.set(action,b);}return controls.get(action);}
   const key=s.match(/data-parent-target="([^"]+)"/)?.[1];return key&&screen.innerHTML.includes('data-parent-target="'+key+'"')?target:null;
 };
 root.querySelector=s=>({'.parent-stage':stage,'.parent-device':device,'[data-parent-screen]':screen,'[data-parent-picker]':picker,'[data-parent-prev]':prev,'[data-parent-next]':next,'[data-parent-line]':path,'[data-parent-dot]':dot,'[data-parent-status]':status,'.parent-connector':connector}[s]);
 root.querySelectorAll=()=>panels;
 const events={},frames=new Map();let frameID=0,audio;
 const win={requestAnimationFrame(fn){frames.set(++frameID,fn);return frameID;},cancelAnimationFrame(id){frames.delete(id);},addEventListener(k,fn){events[k]=fn;}};
 const doc={querySelector:()=>null,createElement:()=>node(),addEventListener(){}};
 class AudioDouble {constructor(){audio=this;this.paused=true;this.playbackRate=1;}pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}play(){this.paused=false;if(this.defer)return new Promise((resolve,reject)=>{this.reject=reject;});return Promise.resolve();}}
 const context=vm.createContext({window:win,document:doc,Audio:AudioDouble,parentChapters,parentScreen,initialParentState,mountSwipe,drawSpotlight,root});
 vm.runInContext(source,context);const controller=vm.runInContext('mountParentTour(root)',context);
 const flush=()=>{for(const [id,fn] of frames){frames.delete(id);fn();}};
 flush();
 return {root,stage,device,screen,panels,picker,prev,next,status,path,dot,controller,events,flush,get audio(){return audio;},choose:i=>controller.navigate(i),click(action){const button=screen.querySelector('[data-parent-action="'+action+'"]');assert.ok(button,'Missing Parent action '+action);screen.events.click({target:button});flush();}};
}
test('Parent Dock starts with one explanation and a stable, independent phone slot',()=>{
 const a=setup();assert.equal(a.root.dataset.parentMode,'docked');assert.equal(a.root.dataset.parentChapter,'today');assert.equal(a.panels.filter(x=>!x.hidden).length,1);assert.equal(a.device.attrs.role,'group');assert.equal(a.screen.attrs['aria-hidden'],undefined);
 const rect=a.device.getBoundingClientRect();for(const i of [1,6,2,3,4,0]){a.choose(i);a.flush();assert.equal(a.panels.filter(x=>!x.hidden).length,1);assert.equal(a.panels[i].hidden,false);assert.deepEqual(a.device.getBoundingClientRect(),rect);assert.deepEqual(a.device.style,{});assert.match(a.path.attrs.d,/^M/);}
});
test('chapter controls clamp at each end and swiping outside selects the adjacent description',()=>{
 const a=setup();a.choose(-50);assert.equal(a.picker.value,'0');assert.equal(a.prev.disabled,true);a.choose(6);assert.equal(a.next.disabled,true);a.next.events.click();assert.equal(a.picker.value,'6');
 const target={closest:()=>null};a.stage.events.pointerdown({pointerType:'touch',pointerId:1,clientX:20,clientY:10,target});a.stage.events.pointerup({pointerId:1,clientX:100,clientY:12});assert.equal(a.picker.value,'5');
});
test('in-phone tabs select their native page and retain keyboard focus inside the phone',()=>{
 const a=setup();for(const [action,index] of [['activity',2],['topics',3],['setup',6],['today',0]]){a.click(action);assert.equal(a.picker.value,String(index));assert.equal(a.screen.querySelector('[data-parent-action="'+action+'"]').focused,true);}
});
test('child and date controls update illustrative counts; Together explains its source',()=>{
 const a=setup();a.click('child');assert.match(a.screen.innerHTML,/Adventurer/);a.click('range');assert.match(a.screen.innerHTML,/This week/);a.click('moment');assert.match(a.screen.innerHTML,/Inspired by their saved question/);a.choose(4);a.choose(0);assert.match(a.screen.innerHTML,/Adventurer/);
});
test('activity detail and confirmed deletion affect only the local sample',()=>{
 const a=setup();a.click('detail');assert.equal(a.picker.value,'2');assert.match(a.screen.innerHTML,/Trustin’s answer/);a.click('confirmDelete');assert.match(a.screen.innerHTML,/Delete this activity\?/);a.click('cancelDelete');assert.equal(a.controller.state.deleted,false);a.click('confirmDelete');a.click('delete');assert.equal(a.controller.state.deleted,true);assert.match(a.status.textContent,/preview only/);a.click('restore');assert.equal(a.controller.state.deleted,false);
});
test('sample safeguards persist across chapters while essential protections have no editable control',()=>{
 const a=setup();a.choose(3);a.click('topic-0');assert.equal(a.controller.state.topics[0],1);a.click('save');assert.match(a.status.textContent,/No account or Watch was changed/);a.choose(4);a.choose(3);assert.match(a.screen.innerHTML,/Always protected/);assert.equal(a.controller.state.topics[0],1);assert.doesNotMatch(a.screen.innerHTML,/data-parent-action="(?:disable|essential|unprotect)/);
});
test('reading pace uses native speed options and prerecorded sample audio',async()=>{
 const a=setup();a.choose(4);a.click('speed-0');a.click('sample');await Promise.resolve();assert.equal(a.audio.playbackRate,.75);assert.equal(a.audio.src,'/assets/pip/seed.m4a');a.click('speed-2');assert.equal(a.audio.playbackRate,1);a.choose(0);assert.equal(a.audio.paused,true);
});
test('setup is demonstrable without claiming a real connected Watch',()=>{
 const a=setup();a.choose(6);a.click('prepare');assert.match(a.screen.innerHTML,/Ready for the paired Watch/);a.click('send');assert.match(a.status.textContent,/sends nothing/);assert.match(a.screen.innerHTML,/No Watch connected yet/);
});
test('all chapter copy remains outside the phone and full rationale is available in fixed panels',()=>{
 const css=readFileSync(new URL('../dist/parent-tour.css',import.meta.url),'utf8');
 assert.match(css,/\.parent-panel \{ height:100%; overflow-y:auto/);
 for(const path of ['index.html','demo/index.html']){const html=readFileSync(new URL('../dist/'+path,import.meta.url),'utf8');for(const c of parentChapters){assert.ok(html.includes('data-parent-panel="'+c.id+'"'));assert.ok(html.includes(c.why));}assert.match(html,/Changes stay in this preview/);}
 assert.doesNotMatch(source,/scrollTo\(|--phone-scale|--phone-y/);
});
