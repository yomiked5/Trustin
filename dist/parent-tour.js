import { parentChapters, parentScreen } from './parent-ui.mjs';
import { connectorPath, tourProgress } from './curiosity-tour-core.mjs';

export function parentFrame(progress, count = parentChapters.length) {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const t = Math.min(1, p / .13);
  return { shrink:t*t*(3-2*t), chapter:p < .16 ? -1 : Math.min(count-1, Math.floor((p-.16)/.84*count)) };
}
export function parentStop(index, count = parentChapters.length) {
  return index < 0 ? 0 : .16 + (index + .4) / count * .84;
}

export function mountParentTour(root, {win = window, policy = win.TJMotionPolicy} = {}) {
  if (!root) return;
  const stage=root.querySelector('.parent-stage'), device=root.querySelector('.parent-device');
  const screen=root.querySelector('[data-parent-screen]'), panels=[...root.querySelectorAll('[data-parent-panel]')];
  const picker=root.querySelector('[data-parent-picker]'), prev=root.querySelector('[data-parent-prev]'), next=root.querySelector('[data-parent-next]');
  const path=root.querySelector('[data-parent-line]'), dot=root.querySelector('[data-parent-dot]'), status=root.querySelector('[data-parent-status]');
  const compact=win.matchMedia('(max-width:760px)'), short=win.matchMedia('(max-height:700px)');
  let selected=-2, mode='', raf=0, stopped=false;
  const anchor=()=>Number.parseFloat(win.getComputedStyle(stage).top)||0;
  function select(index, announce=false) {
    if (index===selected) return;
    selected=index;
    const id=parentChapters[index]?.id || 'overview';
    root.dataset.parentChapter=id;
    screen.innerHTML=parentScreen(id);
    panels.forEach((panel,i)=>{panel.hidden=i!==index; if(i!==index) panel.querySelector('details')?.removeAttribute('open');});
    picker.value=String(index); prev.disabled=index<0; next.disabled=index>=parentChapters.length-1;
    const scroller=screen.querySelector('.ios-scroll');
    const target=screen.querySelector(`[data-parent-target="${id}"]`);
    if (target && scroller && id==='together') scroller.scrollTop=Math.max(0,target.offsetTop-scroller.offsetTop-38);
    if (announce && status) status.textContent=index<0?'Parent Dock overview':parentChapters[index].label+'. '+parentChapters[index].summary;
  }
  function connect() {
    const target=selected<0?null:screen.querySelector(`[data-parent-target="${parentChapters[selected].id}"]`);
    if (!target || mode!=='scroll') {path.setAttribute('d','');dot.setAttribute('r','0');return;}
    const base=stage.getBoundingClientRect(), a=target.getBoundingClientRect(), b=panels[selected].getBoundingClientRect();
    const phone=device.getBoundingClientRect();
    const vertical=compact.matches;
    const start={x:(vertical?phone.left+phone.width/2:phone.right+3)-base.left,y:(vertical?phone.bottom+3:Math.min(phone.bottom-50,Math.max(phone.top+60,a.top+a.height/2)))-base.top};
    const end={x:(vertical?b.left+b.width/2:b.left)-base.left,y:(vertical?b.top:b.top+b.height/2)-base.top};
    path.setAttribute('d',connectorPath(start,end,vertical));dot.setAttribute('cx',start.x);dot.setAttribute('cy',start.y);dot.setAttribute('r','3');
  }
  function update() {
    raf=0;if(stopped)return;
    if(mode==='scroll') {
      const bounds=root.getBoundingClientRect(), height=stage.getBoundingClientRect().height;
      const frame=parentFrame(tourProgress(bounds.top,bounds.height,height,anchor()));
      const scale=compact.matches?Math.max(.46,Math.min(.68,(height*.5-26)/device.offsetHeight)):.83;
      const x=compact.matches?0:-Math.min(265,stage.clientWidth*.24);
      const y=compact.matches?height*.235-height*.53:-12;
      device.style.setProperty('--phone-x',x*frame.shrink+'px');device.style.setProperty('--phone-y',y*frame.shrink+'px');device.style.setProperty('--phone-scale',String(1-(1-scale)*frame.shrink));
      stage.style.setProperty('--parent-intro',String(1-frame.shrink));select(frame.chapter);
    }
    connect();
  }
  function navigate(index) {
    index=Math.max(-1,Math.min(parentChapters.length-1,index));
    if(mode==='scroll') {
      const bounds=root.getBoundingClientRect(), height=stage.getBoundingClientRect().height;
      win.scrollTo({top:win.scrollY+bounds.top-anchor()+parentStop(index)*(bounds.height-height),behavior:'smooth'});
    } else {select(index,true);connect();}
  }
  function configure() {
    const newMode=!root.hasAttribute('data-parent-static')&&!short.matches&&(policy?.enabled()??!win.matchMedia('(prefers-reduced-motion: reduce)').matches)?'scroll':'manual';
    if(mode!==newMode){mode=newMode;root.dataset.parentMode=mode;['--phone-x','--phone-y','--phone-scale'].forEach(key=>device.style.removeProperty(key));stage.style.removeProperty('--parent-intro');selected=-2;select(-1);}
    update();
  }
  picker.disabled=false;picker.addEventListener('change',()=>navigate(Number(picker.value)));
  prev.addEventListener('click',()=>navigate(selected-1));next.addEventListener('click',()=>navigate(selected+1));
  root.dataset.parentReady='true';
  win.addEventListener('scroll',()=>{if(!raf&&!stopped)raf=win.requestAnimationFrame(update);},{passive:true});
  win.addEventListener('resize',configure,{passive:true});
  win.addEventListener('pagehide',()=>{stopped=true;if(raf)win.cancelAnimationFrame(raf);raf=0;});
  win.addEventListener('pageshow',()=>{stopped=false;configure();});policy?.subscribe(configure);configure();
  return {navigate,update,configure};
}
mountParentTour(document.querySelector('[data-parent-tour]'));
