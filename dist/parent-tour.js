import {parentChapters,parentScreen,initialParentState} from './parent-ui.mjs';
import {mountSwipe} from './swipe.js';
import {drawSpotlight} from './spotlight.js';

// All chapters share one fixed stage. Only the phone's internal content changes.
export function mountParentTour(root,{win=window}={}) {
  if(!root)return;
  const stage=root.querySelector('.parent-stage'),device=root.querySelector('.parent-device'),screen=root.querySelector('[data-parent-screen]');
  const panels=[...root.querySelectorAll('[data-parent-panel]')],picker=root.querySelector('[data-parent-picker]'),prev=root.querySelector('[data-parent-prev]'),next=root.querySelector('[data-parent-next]'),status=root.querySelector('[data-parent-status]');
  let selected=0,state=initialParentState(),frame=0,player=null,audioIntent=0;
  device.removeAttribute('role');device.setAttribute('role','group');device.setAttribute('aria-label','Interactive Parent Dock sample');device.setAttribute('data-device-interactive','');
  screen.removeAttribute('aria-hidden');screen.setAttribute('tabindex','-1');
  const connector=root.querySelector('.parent-connector');connector.classList.add('hud-connector');
  root.querySelector('[data-parent-line]').setAttribute('data-hud-line','');root.querySelector('[data-parent-dot]').setAttribute('data-hud-dot','');
  const box=document.createElement('div');box.className='hud-box';box.setAttribute('data-hud-box','');box.setAttribute('aria-hidden','true');box.hidden=true;stage.append(box);
  function connect(){frame=0;drawSpotlight(stage,screen.querySelector('[data-parent-target="'+parentChapters[selected].id+'"]'),panels[selected]);}
  function schedule(){if(!frame)frame=win.requestAnimationFrame(connect);}
  function stopAudio(){audioIntent++;if(player){player.pause();player.removeAttribute('src');player.load();}}
  function render({preserveScroll=false}={}){
    const scrollTop=preserveScroll?(screen.querySelector('.ios-scroll')?.scrollTop||0):0;
    screen.innerHTML=parentScreen(parentChapters[selected].id,state);
    const scroll=screen.querySelector('.ios-scroll'),target=screen.querySelector('[data-parent-target="'+parentChapters[selected].id+'"]');
    if(preserveScroll)scroll.scrollTop=scrollTop;
    else if(selected===1&&target)scroll.scrollTop=Math.max(0,target.offsetTop-20);
    schedule();
  }
  function navigate(index,announce=true){
    selected=Math.max(0,Math.min(parentChapters.length-1,index));stopAudio();state.notice='';state.confirm=false;
    root.dataset.parentChapter=parentChapters[selected].id;
    panels.forEach((panel,i)=>{panel.hidden=i!==selected;if(i===selected)panel.scrollTop=0;});
    picker.value=String(selected);prev.disabled=selected===0;next.disabled=selected===parentChapters.length-1;
    render();if(announce)status.textContent=parentChapters[selected].label+'. '+parentChapters[selected].summary;
  }
  function notify(text){status.textContent=text;}
  picker.disabled=false;picker.addEventListener('change',()=>navigate(Number(picker.value)));
  prev.addEventListener('click',()=>navigate(selected-1));next.addEventListener('click',()=>navigate(selected+1));
  mountSwipe(stage,direction=>navigate(selected+direction));
  screen.addEventListener('click',event=>{
    const button=event.target.closest('[data-parent-action]');if(!button)return;
    const action=button.dataset.parentAction;
    const chapter=parentChapters.findIndex(x=>x.id===action);
    if(chapter>=0){navigate(chapter);screen.querySelector('[data-parent-action="'+action+'"]')?.focus({preventScroll:true});return;}
    if(action==='detail'){state.detail=true;navigate(2);screen.focus({preventScroll:true});return;}
    if(action==='child'){state.child=1-state.child;state.detail=false;state.confirm=false;state.deleted=false;}
    if(action==='range')state.range=1-state.range;
    if(action==='moment')state.moment=!state.moment;
    if(action==='back')state.detail=false;
    if(action==='confirmDelete')state.confirm=true;
    if(action==='cancelDelete')state.confirm=false;
    if(action==='delete'){state.deleted=true;state.detail=false;state.confirm=false;notify('Sample activity removed from this preview only.');}
    if(action==='restore')state.deleted=false;
    if(action.startsWith('topic-')){const key=Number(action.slice(6));const fallback=key===1?1:key===4||key===6?2:0;state.topics[key]=((state.topics[key]??fallback)+1)%3;notify('Sample topic preference changed. Essential protections are unchanged.');}
    if(action.startsWith('speed-')){state.speed=Number(action.slice(6));if(player)player.playbackRate=[.75,.85,1][state.speed];}
    if(action==='style')state.style=(state.style+1)%3;
    if(action==='save'){state.notice='Saved here.';notify('Saved in this web preview only. No account or Watch was changed.');}
    if(action==='prepare'){state.prepared=true;notify('Preview connection prepared. No real device connection is created.');}
    if(action==='send'){state.notice='Waiting for the paired Watch.';notify('This is a connection example. This website sends nothing to a Watch.');}
    if(action==='sample'){
      if(!player){player=new Audio();player.preload='auto';}
      if(!player.paused){audioIntent++;player.pause();notify('Reading sample paused.');return;}
      player.src='/assets/pip/seed.m4a';player.playbackRate=[.75,.85,1][state.speed];
      const intent=++audioIntent;
      player.play().then(()=>{if(intent===audioIntent)notify('Playing the prepared reading sample.');}).catch(()=>{if(intent!==audioIntent)return;state.notice='Sample unavailable. Try again.';render({preserveScroll:true});notify(state.notice);});return;
    }
    render({preserveScroll:true});
    const replacement=screen.querySelector('[data-parent-action="'+action+'"]')||screen;replacement.focus({preventScroll:true});
  });
  stage.addEventListener('scroll',schedule,true);win.addEventListener('resize',schedule,{passive:true});
  win.addEventListener('pagehide',()=>{stopAudio();if(frame)win.cancelAnimationFrame(frame);frame=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
  win.addEventListener('pageshow',schedule);
  root.dataset.parentReady='true';root.dataset.parentMode='docked';panels.forEach(panel=>panel.setAttribute('tabindex','0'));navigate(0,false);
  return {navigate,connect,state};
}
mountParentTour(document.querySelector('[data-parent-tour]'));
