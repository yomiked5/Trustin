import {connectorPath} from './curiosity-tour-core.mjs';
// Measure the real target after layout; overlays never intercept product touches.
export function drawSpotlight(stage,target,panel,{vertical=false}={}) {
  const path=stage.querySelector('[data-hud-line]'),dot=stage.querySelector('[data-hud-dot]'),box=stage.querySelector('[data-hud-box]');
  if(!path||!dot||!box)return;
  if(!target||!panel){path.setAttribute('d','');dot.setAttribute('r','0');box.hidden=true;return;}
  const base=stage.getBoundingClientRect(),a=target.getBoundingClientRect(),b=panel.getBoundingClientRect();
  const screen=target.closest('[data-device-interactive]')?.getBoundingClientRect();
  const left=Math.max(a.left,screen?.left??a.left),right=Math.min(a.right,screen?.right??a.right);
  const top=Math.max(a.top,screen?.top??a.top),bottom=Math.min(a.bottom,screen?.bottom??a.bottom);
  if(right<=left||bottom<=top){path.setAttribute('d','');dot.setAttribute('r','0');box.hidden=true;return;}
  Object.assign(box.style,{left:left-base.left-3+'px',top:top-base.top-3+'px',width:right-left+6+'px',height:bottom-top+6+'px'});box.hidden=false;
  const start={x:(vertical?(left+right)/2:right+4)-base.left,y:(vertical?bottom+4:(top+bottom)/2)-base.top};
  const end={x:(vertical?b.left+b.width/2:b.left)-base.left,y:(vertical?b.top:b.top+Math.min(70,b.height/2))-base.top};
  path.setAttribute('d',connectorPath(start,end,vertical));dot.setAttribute('cx',start.x);dot.setAttribute('cy',start.y);dot.setAttribute('r','3');
}
