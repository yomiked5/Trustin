import {mountSwipe} from './swipe.js';
import {drawSpotlight} from './spotlight.js';

export function mountWatchExhibit(root,{win=window}={}) {
  if(!root)return;
  const stage=root.querySelector('.exhibit-stage'),panels=[...root.querySelectorAll('[data-watch-panel]')];
  const picker=root.querySelector('[data-watch-picker]'),prev=root.querySelector('[data-watch-prev]'),next=root.querySelector('[data-watch-next]');
  let selected=0,frame=0;
  const command=(action,value)=>win.dispatchEvent(new CustomEvent('tj:watch-command',{detail:{action,value}}));
  function connect(){
    frame=0;
    const keys=['home','packs','ask','reader'];
    const target=root.querySelector('[data-watch-target="'+keys[selected]+'"]') || root.querySelector('[data-watch-target="reader"]') || root.querySelector('[data-watch-target="curiosity"]');
    drawSpotlight(stage,target,panels[selected],{vertical:win.matchMedia('(max-width:700px)').matches});
  }
  function schedule(){if(!frame)frame=win.requestAnimationFrame(connect);}
  function navigate(index){
    selected=Math.max(0,Math.min(panels.length-1,index));
    panels.forEach((panel,i)=>{panel.hidden=i!==selected;if(i===selected)panel.scrollTop=0;});
    picker.value=String(selected);prev.disabled=selected===0;next.disabled=selected===panels.length-1;
    if(selected===1||selected===2)command('curiosity');
    if(selected===3)command('policy',root.querySelector('#topic-policy').value);
    root.querySelector('[data-watch-tour-status]').textContent=picker.selectedOptions[0].textContent;
    schedule();
  }
  picker.disabled=false;picker.addEventListener('change',()=>navigate(Number(picker.value)));
  prev.addEventListener('click',()=>navigate(selected-1));next.addEventListener('click',()=>navigate(selected+1));
  root.querySelector('#topic-policy').addEventListener('change',e=>command('policy',e.target.value));
  mountSwipe(stage,direction=>navigate(selected+direction));
  win.addEventListener('tj:watch',event=>{
    const {view,mode,question}=event.detail;
    const busy=['listening','thinking'].includes(view);
    const caption=busy?'Sample child’s question: “'+question+'”':'Scripted sample. No microphone is recorded.';
    root.querySelector('[data-script-caption]').textContent=caption;
    root.querySelector('[data-sample-caption]').textContent=busy?caption:'Tap inside the Watch. Swipe around it to look closer.';
    const title=root.querySelector('[data-context-title]'),copy=root.querySelector('[data-context-copy]');
    const context=view==='launcher'?['One Home. Three ways to wonder.','Ask a question, open a story, or try a little Math. Everything starts right here.']:mode==='story'?['A story. At their pace.','Turn the pages and hear the original narration. Home is always within reach.']:mode==='math'?['Small steps. Room to try.','Choose an answer. Tap the picture for a hint. A mistake is a place to begin again.']:['A little world. Made for them.','Tap a picture to explore. Try the microphone. The Home icon opens Math and Stories.'];
    title.textContent=context[0];copy.textContent=context[1];schedule();
  });
  stage.addEventListener('scroll',schedule,true);win.addEventListener('resize',schedule,{passive:true});
  win.addEventListener('pagehide',()=>{if(frame)win.cancelAnimationFrame(frame);frame=0;});
  win.addEventListener('pageshow',schedule);navigate(0);
  return {navigate,connect};
}
mountWatchExhibit(document.querySelector('[data-watch-exhibit]'));
