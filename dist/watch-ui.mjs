// Native layouts at bccac84 (2026-11-11). Prepared web samples, no live service.
import {sampleTreasures,wordHelp} from './demo-model.mjs';
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const nativeIcon=name=>`<svg aria-hidden="true" focusable="false"><use href="/assets/watch-native-v7.svg#${name}"></use></svg>`;
export const generalIcon=name=>`<svg aria-hidden="true" focusable="false"><use href="/assets/icons.svg#${name}"></use></svg>`;
export const avatar=(className='')=>`<img class="wj-avatar ${className}" src="/assets/trustin.png" width="300" height="353" alt="">`;
export const star=()=>`<svg class="wj-star" viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 3.7 9.5 10.3.7-8 6.6 2.5 10L16 24l-8.5 5.8 2.5-10-8-6.6 10.3-.7Z" fill="#f5e6b3" stroke="#9c805a" stroke-width="2" stroke-linejoin="round"/></svg>`;
export const action=(id,glyph,label,extra='')=>`<button class="wj-control ${extra}" data-action="${id}" aria-label="${label}" title="${label}">${nativeIcon(glyph)}<span class="sr-only">${label}</span></button>`;
export const sampleQuestion='Why does the Moon change shape?';
export const branches=[
  [
    {label:'Changing shapes',question:'Why does it look like a crescent?',answer:'A crescent is the small, curved part of the Moon’s sunlit side that we can see. The rest of the Moon is still there.'},
    {label:'Moonlight',question:'Does the Moon make its own light?',answer:'The Moon does not make its own light like the Sun. Sunlight lands on the Moon and bounces toward our eyes.'},
    {label:'Look outside',question:'Can we see the Moon in the daytime?',answer:'Yes! Sometimes the Moon is above us during the day. Look with a grown-up, and never look directly at the Sun.'}
  ],
  [
    {label:'A little model',question:'Can we make a model?',answer:'With a grown-up, shine a flashlight on a ball in a dim room. Move around the ball. Notice how much of its bright side you can see.'},
    {label:'Still round',question:'Is the whole Moon still round?',answer:'Yes. The Moon stays round like a ball. The bright shape we see changes as the Moon travels around Earth.'},
    {label:'Notice together',question:'What could we notice tonight?',answer:'With a grown-up, look for the Moon. Is its bright part a thin curve or a bigger shape? You can draw what you notice.'}
  ]
];
export function curiosityMarkup(resume='seed') {
  return `<div class="wj-curiosity" data-watch-target="curiosity">${avatar()}<div class="wj-shelf" data-watch-target="packs"><button data-topic="${resume}" class="wj-topic wj-resume" aria-label="Continue the saved discovery">${resume==='seed'?generalIcon('seed'):nativeIcon(resume)}<i>${nativeIcon('next')}</i><span>Continue</span></button><button data-topic="butterfly" class="wj-topic" aria-label="Explore butterflies">${nativeIcon('butterfly')}<span>Butterflies</span></button><button data-topic="moon" class="wj-topic" aria-label="Explore the Moon">${nativeIcon('moon')}<span>Moon</span></button></div><button class="wj-microphone" data-action="microphone" data-watch-target="ask" aria-label="Try a scripted question; no microphone is recorded">${nativeIcon('mic')}</button></div>`;
}
export function homeMarkup(state={outfit:{}}) {
  return `<div class="wj-home" data-place="${state.outfit.background||''}"><button class="wj-ask-card" data-mode="ask">${wardrobeAvatar(state.rewardsEnabled===false?{}:state.outfit)}<strong>Ask Trustin</strong><span>Tap to explore a question</span></button><div class="wj-home-tiles"><button data-mode="math">${generalIcon('math')}<span>Math</span></button><button data-mode="story">${generalIcon('book')}<span>Stories</span></button></div></div>`;
}
export function listeningMarkup(thinking=false) {
  return `<div class="wj-listening">${avatar()}${thinking?`<div class="wj-thinking" role="status" aria-label="Trustin is thinking"><i></i>${star()}<i></i></div>`:`<div class="wj-meter" role="status" aria-label="Playing a sample question">${'<i></i>'.repeat(7)}</div>`}<p>${thinking?'Thinking…':'Listening…'}</p>${action('curiosity','back','Return to Curiosity')}</div>`;
}
export function askMarkup({text,page=0,more=false,final=false,scripted=false}) {
  return `<div class="wj-reader" data-watch-target="reader"><div class="wj-reader-status">${avatar()}${star()}<span>${scripted?'':`${page+1}/2`}</span></div><div class="wj-reading" tabindex="0" aria-label="Trustin’s answer">${escapeHTML(text)}</div><div class="wj-controls">${action('listen','repeat','Listen or repeat','wj-repeat')}${more?action('choices','magnify','Explore three follow-up questions','wj-more'):'<span></span>'}${action(final?'curiosity':scripted?'choices':'next','next',final?'Return to Curiosity':scripted?'Explore three follow-up questions':'Next lesson page','wj-forward')}</div><p id="audio-note" class="wj-audio-note" role="status"></p></div>`;
}
export function choicesMarkup(round) {
  return `<div class="wj-choices" data-watch-target="reader">${branches[round].map((choice,i)=>`<button data-branch="${i}" aria-label="${escapeHTML(choice.question)}"><b>${i+1}</b><span>${choice.label}</span></button>`).join('')}<div class="wj-controls">${action('answer','back','Back to the answer','wj-repeat')}${action('curiosity','magnify','Return to discoveries','wj-more')}${action('microphone','mic','Try the sample question again','wj-speech')}</div></div>`;
}

export function rewardIcon(name){
 const shapes={backpack:'<rect x="9" y="5" width="14" height="23" rx="5" fill="#b3c5c0"/><path d="M12 5V3h8v2M6 12v11m20-11v11M12 18h8v6h-8z"/>',shop:'<rect x="6" y="10" width="20" height="19" rx="3"/><path d="M11 10V7a5 5 0 0 1 10 0v3"/>',shirt:'<path d="m10 4-7 4 3 7 4-2v15h12V13l4 2 3-7-7-4q-6 6-12 0Z"/>',star:'<path fill="#e0b647" stroke="none" d="m16 2 4 9 10 1-8 7 2 11-8-6-9 6 3-11-8-7 10-1Z"/>'};
 return `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round">${shapes[name]||shapes.star}</svg>`;
}
// Paths translated from TrustinWardrobeArtwork; original avatar stays untouched.
export function wardrobeArt(id){
 const drawings={
 'starter-cap':'<path fill="#d36a4c" d="M30 20Q30 7 50 7Q69 7 69 20ZM31 18.5Q66 16 77 20Q80 24 59 24L31 22Z"/><ellipse cx="50" cy="7" rx="2.5" ry="1.5" fill="#7b6a57"/>',
 'explorer-hat':'<path fill="#e0b647" d="m30 19 3-11q3-4 10-2 7 3 15 0 7-2 9 2l3 11Z"/><path fill="#d36a4c" d="M31 14h38v5H31z"/><ellipse cx="50" cy="20" rx="29" ry="3" fill="#e0b647"/>',
 'moon-cap':'<path fill="#7a6199" d="M30 20Q29 5 51 5Q68 5 71 20Z"/><circle cx="60" cy="13" r="3" fill="#f5e6c8"/><circle cx="62" cy="11.5" r="3" fill="#7a6199"/><rect x="28" y="18" width="44" height="5" rx="2.5" fill="#a68fc0"/>',
 'starter-bow':'<path fill="#a68fc0" d="m48 55-14-5q-3 5.5 0 11l14-4Zm4 0 14-5q3 5.5 0 11l-14-4Z"/><rect x="47" y="52.5" width="6" height="7" rx="2" fill="#7a6199"/>',
 };
 let body=drawings[id]||'';
 if(id?.includes('scarf')){const color=id==='cozy-scarf'?'#d36a4c':id==='cloud-scarf'?'#a68fc0':'#e0b647';body=`<path fill="${color}" d="M31 51q19 6 38 0v7q-19 6-38 0Zm26 10 10-2 4 15-10 2Z"/><path stroke="#f5e6c8" stroke-width="2" d="m60 68 9-2m-8 6 9-2"/>`;}
 if(id==='sage-place'||id==='sky-place')body=`<rect x="8" y="8" width="84" height="84" rx="20" fill="${id==='sage-place'?'#c7d9bd':'#d9e9e9'}"/>`;
 return `<svg viewBox="0 0 100 100" aria-hidden="true" class="wj-wardrobe-art">${body}</svg>`;
}
export function wardrobeAvatar(outfit={}){
 return `<div class="wj-dressed">${avatar()}${Object.entries(outfit).filter(([key])=>key!=='background').map(([,id])=>wardrobeArt(id)).join('')}</div>`;
}
export function rewardsMarkup(s){
 const item=sampleTreasures.find(i=>i.id===s.rewardItem),owned=s.owned.includes(item.id);
 if(!s.rewardsEnabled)return `<div class="wj-ending">${avatar()}<h3>Keep exploring.</h3><p>Your grown-up has turned Stars off.</p></div>`;
 if(s.rewardView==='home')return `<div class="wj-rewards-home" data-watch-target="rewards"><div class="wj-wallet">${wardrobeAvatar(s.outfit)}<strong>${rewardIcon('star')} ${s.stars} Stars</strong></div><button class="wj-native-wide wj-sage" data-action="shop">${rewardIcon('shop')} Shop</button><button class="wj-native-wide wj-lavender" data-action="wardrobe">${rewardIcon('shirt')} Dress up</button></div>`;
 if(s.rewardView==='shop'||s.rewardView==='wardrobe'){
  const items=sampleTreasures.filter(i=>s.rewardView==='wardrobe'?s.owned.includes(i.id):i.price>0);
  return `<div class="wj-shop" data-watch-target="rewards">${s.rewardView==='shop'?`<p class="wj-balance">${rewardIcon('star')} ${s.stars} Stars</p>`:''}${items.map(i=>`<button data-treasure="${i.id}"><span class="wj-item-art" data-slot="${i.slot}">${wardrobeArt(i.id)}</span><span>${i.name}<small>${s.owned.includes(i.id)?s.outfit[i.slot]===i.id?'Wearing':'Yours':i.price+' Stars'}</small></span>${nativeIcon('next')}</button>`).join('')}</div>`;
 }
 return `<div class="wj-tryon" data-watch-target="rewards">${wardrobeAvatar({...s.outfit,[item.slot]:item.id})}<strong>${item.name}</strong>${s.rewardView==='confirm'?`<p>Use ${item.price} Stars?<br>${s.stars-item.price} Stars left.</p><div class="wj-buy-actions"><button data-action="cancelBuy">Not yet</button><button data-action="buy">Use Stars</button></div>`:s.rewardView==='owned'?`<p>It’s yours!</p><button class="wj-native-wide" data-action="wear">Wear</button>`:owned?`<button class="wj-native-wide" data-action="wear">${s.outfit[item.slot]===item.id?'Wearing':'Wear'}</button>`:`<p>${item.price} Stars</p><button class="wj-native-wide" data-action="confirmBuy" ${s.stars<item.price?'disabled':''}>${s.stars<item.price?'Keep saving':'Choose this'}</button>`}</div>`;
}
export function wordBubble(text,index,kind='hear'){
 const words=text.split(/\s+/),word=words[index],key=word.toLowerCase().replace(/[^a-z]/g,''),help=wordHelp[key];
 return `<div class="wj-word-layer"><button class="wj-word-dismiss" data-action="closeWord" aria-label="Close word help"></button><section class="wj-word-bubble" role="dialog" aria-label="Word help" aria-modal="true"><button class="wj-word-title" data-action="hearWord">${escapeHTML(word)}</button><div class="wj-word-nav"><button data-action="previousWord" aria-label="Previous word" ${index===0?'disabled':''}>‹</button><span>${index+1} / ${words.length} · Swipe for another word</span><button data-action="nextWord" aria-label="Next word" ${index===words.length-1?'disabled':''}>›</button></div>${kind!=='hear'?`<p class="wj-word-explanation">${escapeHTML(help?.[kind==='sounds'?0:1]||'Hear this word in the story.')}</p>`:''}<div class="wj-word-tools">${[['hear','Hear'],['sounds','Sounds'],['meaning','Meaning']].map(([id,label])=>`<button data-word-kind="${id}" aria-pressed="${kind===id}">${label}</button>`).join('')}</div></section></div>`;
}
