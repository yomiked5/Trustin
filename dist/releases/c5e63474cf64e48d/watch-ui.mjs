// Native layouts: WatchSurface, DiscoveryHome, AskReader, LocalStoryScreen,
// ProjectMathScreen at native main 34557847. Samples are authored for this website.
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
export function homeMarkup() {
  return `<div class="wj-home"><button class="wj-ask-card" data-mode="ask">${avatar()}<strong>Ask Trustin</strong><span>Tap to explore a question</span></button><div class="wj-home-tiles"><button data-mode="math">${generalIcon('math')}<span>Math</span></button><button data-mode="story">${generalIcon('book')}<span>Stories</span></button></div></div>`;
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
