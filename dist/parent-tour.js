import {parentChapters,parentScreen,initialParentState,switchParentChild} from './parent-ui.mjs';
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
    else if(['learning','reading','rewards'].includes(parentChapters[selected].id)&&target)scroll.scrollTop=Math.max(0,target.offsetTop-20);
    schedule();
  }
  function navigate(index,announce=true){
    selected=Math.max(0,Math.min(parentChapters.length-1,index));stopAudio();state.notice='';state.confirm=false;state.route=null;
    root.dataset.parentChapter=parentChapters[selected].id;
    panels.forEach((panel,i)=>{panel.hidden=i!==selected;if(i===selected)panel.scrollTop=0;});
    picker.value=String(selected);prev.disabled=selected===0;next.disabled=selected===parentChapters.length-1;
    render();if(announce)status.textContent=parentChapters[selected].label+'. '+parentChapters[selected].summary;
  }
  function notify(text){status.textContent=text;}
  const command=(action,value)=>win.dispatchEvent?.(new CustomEvent('tj:watch-command',{detail:{action,value}}));
  const go=id=>navigate(parentChapters.findIndex(x=>x.id===id));
  picker.disabled=false;picker.addEventListener('change',()=>navigate(Number(picker.value)));
  prev.addEventListener('click',()=>navigate(selected-1));next.addEventListener('click',()=>navigate(selected+1));
  mountSwipe(stage,direction=>navigate(selected+direction));
  screen.addEventListener('click',event=>{
    const button=event.target.closest('[data-parent-action]');if(!button)return;
    const action=button.dataset.parentAction;
    const chapter=parentChapters.findIndex(x=>x.id===action);
    if(chapter>=0){navigate(chapter);screen.querySelector('[data-parent-action="'+action+'"]')?.focus({preventScroll:true});return;}
    if(action.startsWith('detail-')){state.detail=action.slice(7);go('activity');screen.focus({preventScroll:true});return;}
    if(action.startsWith('filter-')){state.filter=action.slice(7);state.detail=null;go('activity');return;}
    if(action==='child')switchParentChild(state);
    if(action==='range')state.range=1-state.range;
    if(action==='reportGuide')state.reportGuide=!state.reportGuide;
    if(action==='back'){state.detail=null;state.confirm=false;}
    if(action==='confirmDelete')state.confirm=true;
    if(action==='cancelDelete')state.confirm=false;
    if(action==='delete'){if(!state.deleted.includes(state.detail))state.deleted.push(state.detail);state.detail=null;state.confirm=false;notify('Sample activity removed from this preview only.');}
    if(action==='restore')state.deleted=[];
    if(action==='topicList')state.route='topicList';
    if(action==='safeguards')state.route=null;
    if(action==='protections')state.notice='Essential protections stay on. Harmful instructions, exploitation and commercial persuasion are not permitted.';
    if(action==='dataInfo')state.notice='Learning records support family reports and learning. These fictional examples stay in this browser session.';
    if(action.startsWith('topic-')){const key=Number(action.slice(6));const fallback=key===1?1:key===4||key===6?2:0;state.topics[key]=((state.topics[key]??fallback)+1)%3;notify('Sample topic preference changed. Essential protections are unchanged.');}
    if(action.startsWith('speed-')){state.speed=Number(action.slice(6));if(player)player.playbackRate=[.75,.85,1][state.speed];}
    if(action==='style')state.style=(state.style+1)%4;
    if(action==='save'){state.notice='Saved here.';notify('Saved in this web preview only. No account or Watch was changed.');}
    if(action==='saveMath'){state.appliedBand=state.band;state.appliedStep=state.step;state.notice='Saved. Applies to the next new Math project.';command('mathLevel',state.band*3+state.step);notify('Sample starting point saved. The current unfinished project is kept.');}
    if(action==='saveReading'){state.notice='Saved in this preview.';command('pace',[.75,.85,1][state.speed]);notify('Reading speed changed for the prepared Watch sample.');}
    if(action==='rewardsToggle'){state.rewards=!state.rewards;command('rewardsEnabled',state.rewards);notify(state.rewards?'Stars enabled in this preview.':'Stars disabled. Learning remains available.');}
    if(action==='confirmDisconnect')state.disconnect=true;
    if(action==='cancelDisconnect')state.disconnect=false;
    if(action==='disconnect'){state.connected=false;state.disconnect=false;state.prepared=false;notify('Sample Watch disconnected. No real device was changed.');}
    if(action==='prepare'){state.prepared=true;notify('Preview connection prepared. No real device connection is created.');}
    if(action==='send'){state.connected=true;state.notice='Sample connection complete.';notify('This is a connection example. This website sends nothing to a Watch.');}
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
  screen.addEventListener('change',event=>{
    const key=event.target.dataset.parentSetting;
    if(key==='band'||key==='step'){state[key]=Number(event.target.value);state.notice='Unsaved changes';render({preserveScroll:true});screen.querySelector('[data-parent-setting="'+key+'"]')?.focus({preventScroll:true});}
  });
  screen.addEventListener('input',event=>{
    if(!event.target.hasAttribute('data-parent-search'))return;
    state.search=event.target.value;
    const holder=document.createElement('div');holder.innerHTML=parentScreen('activity',state);
    const results=screen.querySelector('[data-activity-results]');if(results)results.innerHTML=holder.querySelector('[data-activity-results]').innerHTML;
  });
  win.addEventListener('tj:watch',event=>{if(!event.detail.rewards)return;if(state.child!==0){Object.assign(state.profiles[0],event.detail.rewards);return;}Object.assign(state,event.detail.rewards);if(parentChapters[selected].id==='rewards')render({preserveScroll:true});});
  stage.addEventListener('scroll' ,schedule,true);win.addEventListener('resize',schedule,{passive:true});
  win.addEventListener('pagehide',()=>{stopAudio();if(frame)win.cancelAnimationFrame(frame);frame=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio();});
  win.addEventListener('pageshow',schedule);
  root.dataset.parentReady='true';root.dataset.parentMode='docked';panels.forEach(panel=>panel.setAttribute('tabindex','0'));navigate(0,false);
  return {navigate,connect,state};
}
mountParentTour(document.querySelector('[data-parent-tour]'));
