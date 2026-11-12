// Horizontal intent only. Vertical scrolling and in-device interactions stay native.
export function mountSwipe(surface, onSwipe, {exclude='input,select,textarea,a,summary,[data-device-interactive]'}={}) {
  if (!surface) return () => {};
  let start=null, suppressUntil=0;
  const down=e=>{
    if(e.isPrimary===false || !['touch','pen'].includes(e.pointerType) || e.target.closest?.(exclude)) {start=null;return;}
    start={id:e.pointerId,x:e.clientX,y:e.clientY};
  };
  const move=e=>{
    if(!start || e.pointerId!==start.id) return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;
    if(Math.abs(dy)>18 && Math.abs(dy)>Math.abs(dx)) start=null;
  };
  const up=e=>{
    if(!start || e.pointerId!==start.id) return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;
    if(Math.abs(dx)<42 || Math.abs(dx)<Math.abs(dy)*1.5) return;
    suppressUntil=Date.now()+450;onSwipe(dx<0?1:-1);
  };
  const cancel=()=>{start=null;};
  const click=e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopPropagation();}};
  surface.addEventListener('pointerdown',down,{passive:true});
  surface.addEventListener('pointermove',move,{passive:true});
  surface.addEventListener('pointerup',up,{passive:true});
  surface.addEventListener('pointercancel',cancel,{passive:true});
  surface.addEventListener('click',click,true);
  return ()=>{surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointercancel',cancel);surface.removeEventListener('click',click,true);};
}
