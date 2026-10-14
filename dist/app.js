import { initialState, chooseMode, openHome, chooseTopic, changePolicy, restartMode, solveMath, nextMath, mathQuestions, record, playbackLabel } from './demo-model.mjs';
import { escapeHTML as esc, nativeIcon as ni, generalIcon as icon, avatar, action, sampleQuestion, branches, curiosityMarkup, homeMarkup, listeningMarkup, askMarkup, choicesMarkup } from './watch-ui.mjs';

const content=document.querySelector('#watch-content'), status=document.querySelector('#demo-status');
let state=initialState(),data,story,cues={},lastWord=-1,playing=false,playIntent=0,audioError='',timers=[],scripted=false,round=0,reply=null,resume='seed';
const player=content?new Audio():null;
if(player)player.preload='auto';
const announce=text=>{if(status)status.textContent=text;};
const signal=()=>window.dispatchEvent(new CustomEvent('tj:watch',{detail:{view:state.view,mode:state.mode,topic:state.topic,question:sampleQuestion}}));
function cancelSequence(){timers.forEach(clearTimeout);timers=[];}
function stopAudio(){if(!player)return;playIntent++;playing=false;audioError='';player.pause();player.removeAttribute('src');player.load();updateAudio();}
function stop(){cancelSequence();stopAudio();}
function audioSource(){
  if(state.view==='discovery'&&!reply){const item=data.find(x=>x.illustration===state.topic);return '/assets/audio/'+item.id+'.v'+item.version+'-'+(state.page?'more':'answer')+'.m4a';}
  if(state.view==='story')return '/assets/pip/'+story.nodes[state.storyPage].audio;
  return null;
}
function updateAudio(){
  if(!player)return;
  const button=content.querySelector('[data-action="listen"]');
  if(button){const label=audioError?'Retry':playbackLabel({playing,ended:player.ended,time:player.currentTime});button.innerHTML=ni(playing?'pause':state.view==='discovery'?'repeat':'play')+'<span class="sr-only">'+label+'</span>';button.setAttribute('aria-label',label+' recorded narration');button.disabled=!audioSource();}
  const note=content.querySelector('#audio-note');if(note){note.textContent=audioError;note.hidden=!audioError;}
  content.dataset.playing=String(playing);
}
async function toggleAudio(){
  const src=audioSource();if(!src||!player)return;
  if(playing){playIntent++;playing=false;player.pause();updateAudio();return;}
  const intent=++playIntent,retry=!!audioError;audioError='';
  if(retry||player.getAttribute('src')!==src)player.src=src;
  if(player.ended)player.currentTime=0;
  player.playbackRate=state.pace;playing=true;updateAudio();
  try{await player.play();}catch(error){if(intent!==playIntent)return;playing=false;if(error.name!=='AbortError'){audioError='Recording unavailable. Retry, or read the answer.';announce(audioError);}updateAudio();}
}
if(player){
  for(const event of ['play','pause','ended'])player.addEventListener(event,()=>{playing=event==='play';updateAudio();});
  player.addEventListener('error',()=>{playing=false;if(player.getAttribute('src')){audioError='Recording unavailable. Retry, or read the answer.';announce(audioError);}updateAudio();});
  player.addEventListener('timeupdate',()=>{
    if(state.view!=='story')return;
    const words=cues[story.nodes[state.storyPage].id]?.words;if(!words)return;
    const index=words.findIndex(word=>player.currentTime>=word.start&&player.currentTime<=word.end);
    if(index===lastWord)return;lastWord=index;
    document.querySelectorAll('[data-story-word]').forEach(word=>word.setAttribute('data-current',String(Number(word.dataset.storyWord)===index)));
    const word=content.querySelector('[data-story-word="'+index+'"]'),pane=content.querySelector('.wj-story-text');
    if(word&&pane&&(word.offsetTop<pane.scrollTop||word.offsetTop+word.offsetHeight>pane.scrollTop+pane.clientHeight))pane.scrollTop=Math.max(0,word.offsetTop-pane.clientHeight/2);
  });
}
function resetAsk(){scripted=false;round=0;reply=null;}
function curiosity(){stop();resetAsk();chooseMode(state,'ask');state.view='home';state.topic=null;state.page=0;render();}
function openTopic(topic){stop();resetAsk();chooseTopic(state,topic);resume=topic;render();}
function launch(mode){stop();resetAsk();chooseMode(state,mode);if(mode==='ask'){state.view='home';state.topic=null;}else if(mode==='story'&&state.storyPage===0)state.view='storyEntry';render();}
function beginSample(){
  stop();resetAsk();chooseMode(state,'ask');scripted=true;resume='moon';state.topic='moon';state.view='listening';render();
  announce('Scripted question: '+sampleQuestion+' No microphone is recorded.');
  const motion=window.TJMotionPolicy?.enabled()!==false;
  timers.push(setTimeout(()=>{state.view='thinking';render();},motion?1500:200));
  timers.push(setTimeout(()=>{chooseTopic(state,'moon');state.page=0;render();announce('The sample answer is ready. Explore the three follow-up questions.');},motion?2350:450));
}
function focusContent(){const target=content.querySelector('h3')||content;target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
function render(){
  if(!data||!story||!content)return;
  const label=document.querySelector('#demo-activity-label'),screen=content.closest('[data-device-interactive]');
  const title=state.view==='launcher'?'Trustin Jr.':state.mode==='ask'?'Curiosity':state.mode==='story'?'Storytime':'Garden math';
  if(label)label.textContent=title;
  if(screen){screen.dataset.mode=state.view==='launcher'?'home':state.mode;screen.dataset.view=state.view;}
  const context=document.querySelector('[data-watch-context]');
  if(context){context.innerHTML=state.view==='launcher'?ni('gear'):state.mode==='ask'?ni('bulb'):icon(state.mode==='math'?'math':'book');context.setAttribute('aria-label',state.view==='launcher'?'See the Parent Dock':state.mode==='story'?'Story library':'Return to Curiosity');}
  lastWord=-1;let html='';
  if(state.view==='launcher')html=homeMarkup();
  if(state.view==='home')html=curiosityMarkup(resume);
  if(['listening','thinking'].includes(state.view))html=listeningMarkup(state.view==='thinking');
  if(state.view==='discovery'){
    const item=data.find(x=>x.illustration===state.topic);
    html=askMarkup({text:reply?.answer||(state.page?item.continuation:item.explanation),page:state.page,more:(scripted||(state.topic==='moon'&&state.page===1))&&!(reply&&round===1),final:(!!reply&&round===1)||(!scripted&&state.page===1&&state.topic!=='moon'),scripted});
    if(reply)html=html.replace(/<button class="wj-control wj-repeat"[\s\S]*?<\/button>/,'<span></span>');
  }
  if(state.view==='choices')html=choicesMarkup(round);
  if(state.view==='boundary')html='<div class="wj-boundary" data-watch-target="reader">'+avatar()+'<h3>Let’s ask your grown-up.</h3><p>Your grown-up has chosen to explore this together.</p>'+action('curiosity','next','Return to Curiosity','wj-forward')+'</div>';
  if(state.view==='storyEntry')html='<div class="wj-story-entry"><img src="/assets/pip/cover.jpg" width="480" height="320" alt="Pip beside a small plant"><button data-action="resumeStory" class="wj-native-wide">'+ni('play')+' Continue</button><button data-action="storyShelf" class="wj-native-wide wj-lavender">'+icon('book')+' New story</button></div>';
  if(state.view==='storyShelf')html='<div class="wj-story-entry"><button class="wj-book-cover" data-action="startStory"><img src="/assets/pip/cover.jpg" width="480" height="320" alt=""><strong>Pip and the Patient Seed</strong></button></div>';
  if(state.view==='storyCover')html='<div class="wj-story-cover"><img src="/assets/pip/cover.jpg" width="480" height="320" alt="Pip and the Patient Seed"><div class="wj-cover-controls">'+action('storyShelf','back','Back to the story library','wj-repeat')+'<strong>Pip and the<br>Patient Seed</strong>'+action('resumeStory','next','Start the story','wj-forward')+'</div></div>';
  if(state.view==='story'){
    const node=story.nodes[state.storyPage];
    html='<div class="wj-story-reader" data-watch-target="reader"><img class="wj-story-art" src="/assets/pip/'+node.art+'.jpg" width="480" height="320" alt="Illustration from Pip and the Patient Seed"><div class="wj-story-text" tabindex="0">'+node.text.split(/\s+/).map((word,i)=>'<span data-story-word="'+i+'">'+esc(word)+'</span>').join(' ')+'</div><div class="wj-controls">'+action('back','back','Previous story page','wj-repeat')+action('listen','play','Listen to story narration','wj-play')+action('next','next',state.storyPage===story.nodes.length-1?'Finish story':'Next story page','wj-forward')+'</div><p id="audio-note" class="wj-audio-note" role="status"></p></div>';
  }
  if(state.view==='mathIntro')html='<div class="wj-math-intro">'+icon('seed')+'<div class="wj-reading" tabindex="0">Help Trustin get the garden ready. Three little counting jobs.</div><button class="wj-native-wide" data-action="startMath" aria-label="Start the math project">'+ni('next')+'</button></div>';
  if(state.view==='math'){
    const q=mathQuestions[state.mathPage];
    html='<div class="wj-math" data-watch-target="reader"><button class="wj-count-art" data-action="mathHint" aria-label="See a counting hint">'+Array.from({length:q.count},()=>'<i></i>').join('')+'</button><div class="wj-math-text" tabindex="0">'+esc(state.mathFeedback||q.prompt)+'</div><div class="wj-math-options">'+(state.mathSolved?'<span class="wj-correct">'+icon('check')+'</span><button data-action="nextMath" aria-label="Next counting job">'+ni('next')+'</button>':q.options.map((n,i)=>'<button data-number="'+n+'" class="wj-option-'+i+'" aria-label="'+n+' seeds">'+n+'</button>').join(''))+'</div><div class="wj-job-dots" aria-label="Job '+(state.mathPage+1)+' of 3">'+[0,1,2].map(i=>'<i class="'+(i<=state.mathPage?'wj-dot-active':'')+'"></i>').join('')+'</div></div>';
  }
  if(state.view==='done')html='<div class="wj-ending">'+icon(state.mode==='story'?'leaf':'check')+'<h3>'+(state.mode==='story'?'The end.':'We did it!')+'</h3><button class="wj-native-wide" data-action="restart">'+ni('repeat')+' '+(state.mode==='story'?'Read again':'Try again')+'</button></div>';
  content.innerHTML=html;content.setAttribute('aria-busy','false');updateAudio();signal();
}
content?.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.action==='retry'){loadDemo();return;}
  if(button.dataset.action==='listen'){toggleAudio();return;}
  if(button.dataset.action==='microphone'){beginSample();return;}
  if(button.dataset.mode){launch(button.dataset.mode);focusContent();return;}
  if(button.dataset.topic){openTopic(button.dataset.topic);focusContent();return;}
  stop();
  if(button.dataset.branch!==undefined){reply=branches[round][Number(button.dataset.branch)];state.view='discovery';render();focusContent();return;}
  if(button.dataset.number!==undefined){solveMath(state,button.dataset.number);render();announce(state.mathFeedback);content.querySelector(state.mathSolved?'[data-action="nextMath"]':'[data-number="'+button.dataset.number+'"]')?.focus({preventScroll:true});return;}
  switch(button.dataset.action){
    case 'curiosity':if(scripted)record(state,'Explored the Moon sample');else if(state.view==='discovery'&&state.page===1)record(state,'Explored '+state.topic);curiosity();return;
    case 'choices':if(reply&&round===0)round=1;state.view='choices';break;
    case 'answer':state.view='discovery';break;
    case 'startStory':state.storyPage=0;state.view='storyCover';break;
    case 'resumeStory':state.storyPage=Math.max(1,state.storyPage);state.view='story';break;
    case 'storyShelf':state.view='storyShelf';break;
    case 'startMath':state.view='math';break;
    case 'mathHint':state.mathFeedback=mathQuestions[state.mathPage].hint;break;
    case 'nextMath':nextMath(state);break;
    case 'restart':restartMode(state);if(state.mode==='story')state.view='storyEntry';break;
    case 'back':if(state.storyPage>1)state.storyPage--;else state.view='storyCover';break;
    case 'next':
      if(state.view==='story'){if(state.storyPage<story.nodes.length-1)state.storyPage++;else{state.view='done';record(state,'Finished Pip and the Patient Seed');}}
      else if(state.view==='discovery'){if(state.page===0)state.page=1;else{scripted=true;round=0;state.view='choices';}}
      break;
  }
  render();focusContent();
});
document.querySelector('[data-shell-home]')?.addEventListener('click',()=>{if(!data)return;stop();resetAsk();openHome(state);render();focusContent();announce('Home. Choose Ask Trustin, Math, or Stories.');});
document.querySelector('[data-watch-context]')?.addEventListener('click',()=>{if(!data)return;if(state.view==='launcher'){document.querySelector('#parent-dock')?.scrollIntoView({behavior:window.TJMotionPolicy?.enabled()===false?'auto':'smooth'});}else if(state.mode==='story'){stop();state.view='storyShelf';render();}else curiosity();});
document.querySelector('#reset-demo')?.addEventListener('click',()=>{stop();state=initialState();resume='seed';resetAsk();render();announce('The preview has been reset.');});
function setPolicy(value){const changed=changePolicy(state,value);if(changed){stop();reply=null;render();}announce(value==='together'?'The Moon sample now invites a grown-up conversation.':'The Moon sample is available again.');}
window.addEventListener('tj:watch-command',event=>{
  if(!data)return;const {action:command,value}=event.detail;
  if(command==='curiosity')curiosity();
  if(command==='policy'){setPolicy(value);openTopic('moon');}
  if(command==='pace'){state.pace=Number(value);if(player)player.playbackRate=state.pace;}
});
function suspend(){cancelSequence();if(['listening','thinking'].includes(state.view)){state.view='home';render();}if(player){playIntent++;playing=false;player.pause();}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});window.addEventListener('pagehide',suspend);
async function loadDemo(){
  content.setAttribute('aria-busy','true');
  try{
    const responses=await Promise.all([fetch('/assets/discoveries.json'),fetch('/assets/pip/book.json')]);
    if(responses.some(r=>!r.ok))throw Error('Content unavailable');
    [data,story]=await Promise.all(responses.map(r=>r.json()));
    if(!['moon','seed','butterfly'].every(t=>data.some(i=>i.illustration===t))||!story.nodes?.length)throw Error('Incomplete sample');
    // Timing files are an optional enhancement; they never hold up a page or audio.
    Promise.all(story.nodes.map(async node=>{try{const response=await fetch('/assets/pip/'+node.cues);if(response.ok)cues[node.id]=await response.json();}catch{}}));
    const entry=new URLSearchParams(window.location.search).get('activity');
    if(['story','math'].includes(entry)){chooseMode(state,entry);if(entry==='story')state.view='storyEntry';}
    else if(['moon','seed','butterfly'].includes(entry))chooseTopic(state,entry);
    render();document.querySelectorAll('[data-shell-home],[data-watch-context],#reset-demo').forEach(b=>b.disabled=false);
  }catch{content.setAttribute('aria-busy','false');content.innerHTML='<div class="wj-ending"><h3>Let’s try again.</h3><p>The sample could not load.</p><button data-action="retry" class="wj-native-wide">Retry</button></div>';announce('The prepared sample could not load. Retry is available.');}
}
if(content)loadDemo();
document.querySelectorAll('[data-print]').forEach(button=>button.addEventListener('click',()=>window.print()));
document.querySelectorAll('[data-copy-email]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('jrtrustin@gmail.com');button.textContent='Email address copied';}catch{button.textContent='jrtrustin@gmail.com';}}));
