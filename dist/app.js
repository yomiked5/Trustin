import { initialState, chooseMode, chooseTopic, changePolicy, restartMode, solveMath, nextMath, mathQuestions, record, playbackLabel } from './demo-model.mjs';

const content = document.querySelector('#watch-content');
const status = document.querySelector('#demo-status');
const icon = name => `<svg aria-hidden="true" focusable="false"><use href="/assets/icons.svg#${name}"></use></svg>`;
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = { moon:'Moon', seed:'Seeds', butterfly:'Butterflies' };
const observations = {
  moon:'With a grown-up, notice the Moon on a few evenings. Does the bright part look the same?',
  seed:'With a grown-up, look at a seed and a plant. What do you notice?',
  butterfly:'If you spot a butterfly with a grown-up, watch where it lands. Give it plenty of space.'
};
let state = initialState();
let data, story, playing = false, playIntent = 0, audioError = '';
const player = content ? new Audio() : null;
if (player) player.preload = 'none';

function announce(message) { if (status) status.textContent = message; }
function stopAudio() {
  if (!player) return;
  playIntent++;
  playing = false;
  audioError = '';
  player.pause();
  player.removeAttribute('src');
  player.load();
  updateAudioButton();
}
function audioSource() {
  if (state.mode === 'ask' && state.view === 'discovery') {
    const topic = data.find(item => item.illustration === state.topic);
    return `/assets/audio/${topic.id}.v${topic.version}-${state.page === 0 ? 'answer' : 'more'}.m4a`;
  }
  if (state.mode === 'story' && state.view === 'story') return '/assets/story/' + story.nodes[state.storyPage].audio;
  return null;
}
function clock(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
}
function updateAudioProgress() {
  if (!player) return;
  const progress = document.querySelector('#audio-progress');
  const time = document.querySelector('#audio-time');
  const duration = Number.isFinite(player.duration) ? player.duration : 0;
  if (progress) progress.value = duration > 0 ? Math.min(player.currentTime / duration, 1) : 0;
  if (time) time.textContent = clock(player.currentTime) + ' / ' + clock(duration);
}
function updateAudioButton() {
  if (!player) return;
  const button = document.querySelector('[data-action="listen"]');
  const label = audioError ? 'Retry' : playbackLabel({ playing, ended:player.ended, time:player.currentTime });
  if (button) {
    button.innerHTML = icon(playing ? 'pause' : 'play') + '<span>' + label + '</span>';
    button.setAttribute('aria-label', label + ' recorded Trustin narration');
  }
  const note = document.querySelector('#audio-note');
  if (note) {
    note.textContent = audioError || (playing ? 'Recorded Trustin voice · Read or move on anytime' : 'Sound only when you choose · Complete text above');
    note.setAttribute('data-error', String(Boolean(audioError)));
  }
  updateAudioProgress();
}
async function toggleAudio() {
  const src = audioSource();
  if (!src || !player) return;
  if (playing) {
    playIntent++;
    playing = false;
    player.pause();
    updateAudioButton();
    return;
  }
  const intent = ++playIntent;
  const retrying = Boolean(audioError);
  audioError = '';
  if (retrying || player.getAttribute('src') !== src) player.src = src;
  if (player.ended) player.currentTime = 0;
  player.playbackRate = state.pace;
  playing = true;
  updateAudioButton();
  try { await player.play(); }
  catch (error) {
    if (intent !== playIntent) return;
    playing = false;
    if (error.name !== 'AbortError') audioError = 'Audio could not play. Try Retry, or read the complete text above.';
    updateAudioButton();
    if (error.name !== 'AbortError') announce('Audio could not play here. The complete text is available in the preview.');
  }
}
if (player) {
  player.addEventListener('play', () => { playing = true; updateAudioButton(); });
  player.addEventListener('pause', () => { playing = false; updateAudioButton(); });
  player.addEventListener('ended', () => { playing = false; updateAudioButton(); });
  player.addEventListener('timeupdate', updateAudioProgress);
  player.addEventListener('loadedmetadata', updateAudioProgress);
  player.addEventListener('error', () => {
    if (player.getAttribute('src')) {
      audioError = 'The recording could not load. Try Retry, or keep reading above.';
      announce(audioError);
    }
    playing = false;
    updateAudioButton();
  });
}
function topicButton(topic) {
  return `<button class="topic-button" data-topic="${topic}" aria-label="Explore the ${labels[topic]} sample">${icon(topic)}<span>${labels[topic]}</span></button>`;
}
function progress(current, total, label) {
  return `<div class="reader-progress"><span>${label}</span><span>${current} of ${total}</span></div><div class="page-progress" aria-hidden="true">${Array.from({length:total}, (_, i) => '<span class="' + (i < current ? 'complete' : '') + '"></span>').join('')}</div>`;
}
function controls(back = true, next = 'Next') {
  return `<div class="reader-controls"><button data-action="back" aria-label="Previous page" ${back ? '' : 'disabled'}>${icon('back')}<span>Back</span></button><button data-action="listen" aria-label="Listen to recorded Trustin narration">${icon('play')}<span>Listen</span></button><button data-action="next">${icon('next')}<span>${next}</span></button></div><div class="audio-line"><progress id="audio-progress" value="0" max="1" aria-label="Narration progress"></progress><span id="audio-time" aria-hidden="true">0:00 / 0:00</span></div><p class="reader-foot" id="audio-note">Sound only when you choose · Complete text above</p>`;
}
function renderDock() {
  const log = document.querySelector('#activity-log');
  log.innerHTML = state.log.length
    ? '<ul>' + state.log.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul><p class="footnote">Completed samples, not measured learning.</p>'
    : '<p>Finish a sample to see it here. This is activity, not an assessment of learning.</p>';
  document.querySelector('#activity-count').textContent = state.log.length + ' completed';
  document.querySelector('#topic-policy').value = state.moonPolicy;
  document.querySelector('#narration-pace').value = String(state.pace);
  const result = document.querySelector('#policy-result');
  const message = state.moonPolicy === 'together'
    ? '“Let’s ask your grown-up.” The Moon answer is replaced by a conversation with you.'
    : '“The Moon stays round like a ball.” The prepared answer is available to explore.';
  if (result.textContent !== message) result.textContent = message;
  const together = state.moonPolicy === 'together';
  document.querySelector('#hero-policy').innerHTML = (together ? 'With a grown-up ' : 'Explore ') + icon('check');
  document.querySelector('#hero-answer').innerHTML = together
    ? icon('parents') + '<p>“Let’s ask your grown-up.” You chose to explore this topic together.</p>'
    : icon('moon') + '<p>“The Moon stays round like a ball. Sunlight lights up half of it.”</p>';
  document.querySelector('[data-hear]').innerHTML = icon(together ? 'parents' : 'play') + (together ? ' See parent boundary' : ' Hear this answer');
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
  document.querySelector('#demo-next').hidden = !state.log.length;
}
function render() {
  if (!data || !story || !content) return;
  let html = '';
  if (state.view === 'home') html = `<p class="demo-kicker">Ask Trustin</p><img class="demo-avatar" src="/assets/trustin.png" alt="Trustin, a small teal learning character" width="297" height="349"><h3 class="watch-title">What do you wonder?</h3><div class="topic-shelf">${topicButton('seed')}${topicButton('moon')}${topicButton('butterfly')}</div><button class="mic-button" data-action="questions" aria-label="Choose a prepared question; no microphone recording">${icon('mic')} Choose a question</button><p class="demo-hint">Prepared questions. Nothing is recorded.</p>`;
  if (state.view === 'questions') html = `<p class="demo-kicker">Ask Trustin</p><h3 class="watch-title">Start with a little why.</h3><div class="question-choices">${['moon','seed','butterfly'].map(topic => '<button class="question-choice" data-topic="' + topic + '">' + esc(data.find(item => item.illustration === topic).question) + '</button>').join('')}</div><p class="demo-hint">Choose an example to hear Trustin.</p><button class="reset" data-action="home">Back to topics</button>`;
  if (state.view === 'discovery') {
    const topic = data.find(item => item.illustration === state.topic);
    html = `<button class="watch-home" data-action="questions">Choose another question</button><h3 class="watch-title">${esc(topic.question)}</h3><div class="reader-art topic-art">${icon(state.topic)}</div><div class="reader-text">${esc(state.page === 0 ? topic.explanation : topic.continuation)}</div>${progress(state.page + 1, 2, 'Prepared discovery')}${controls(true, state.page === 1 ? 'Finish' : 'More')}`;
  }
  if (state.view === 'boundary') html = `<p class="demo-kicker">Your parent’s choice</p><div class="done-icon">${icon('parents')}</div><h3 class="watch-title">Let’s ask your grown-up.</h3><p class="ending">Your grown-up has chosen to explore Moon questions together.<small>You can ask them about the Moon, or choose another question here.</small></p><button class="button watch-cta" data-action="home">Explore another topic</button>`;
  if (state.view === 'story') {
    const node = story.nodes[state.storyPage];
    const alt = node.art === 'repot' ? 'Trustin helps a gardener move the plant to a new pot' : node.art === 'later' ? 'Trustin returns to the plant as a new leaf opens' : 'Trustin notices a curled leaf beside a watering can';
    html = `<p class="demo-kicker">Storytime</p><h3 class="watch-title">${state.storyPage === 0 ? 'Trustin and the<br>Curled Leaf' : 'Look. Check. Ask.'}</h3><img class="reader-art" src="/assets/story/${node.art}.jpg" alt="${alt}" width="480" height="320"><div class="reader-text">${esc(node.text)}</div>${progress(state.storyPage + 1, story.nodes.length, state.storyPage === 0 ? 'Story introduction' : 'Story page')}${controls(state.storyPage > 0, state.storyPage === story.nodes.length - 1 ? 'Finish' : 'Next')}`;
  }
  if (state.view === 'mathIntro') html = `<p class="demo-kicker">Little garden math</p><div class="reader-art topic-art">${icon('math')}</div><h3 class="watch-title">A few seeds.<br>A little counting.</h3><p class="ending">Help get the garden ready.<br>Three small counting challenges.<small>Try an answer. If it’s tricky, a hint will help.<br>This sample uses text and pictures.</small></p><button class="button watch-cta" data-action="startMath">Let’s try</button>`;
  if (state.view === 'math') {
    const question = mathQuestions[state.mathPage];
    html = `<p class="demo-kicker">Little garden math</p><h3 class="watch-title">${esc(question.prompt)}</h3><div class="math-display" role="img" aria-label="${question.count} seeds">${Array.from({length:question.count}, () => icon('seedling')).join('')}</div><div class="math-options">${question.options.map(number => '<button data-number="' + number + '" aria-label="' + number + ' seeds" ' + (state.mathSolved ? 'disabled' : '') + ' class="' + (state.mathSolved && number === question.answer ? 'correct' : '') + '">' + number + '</button>').join('')}</div><p class="math-message" id="math-feedback">${esc(state.mathFeedback || 'Take your time. Count the seeds if it helps.')}</p>${progress(state.mathPage + 1, 3, 'Counting challenge')}${state.mathSolved ? '<button class="button watch-cta" data-action="nextMath">' + (state.mathPage === 2 ? 'Finish' : 'Next challenge') + '</button>' : ''}`;
  }
  if (state.view === 'done') {
    const text = state.mode === 'ask' ? observations[state.topic] : state.mode === 'story' ? 'Trustin learned to look, check, and ask. What could you notice together today?' : 'You helped with the garden. With a grown-up, try counting four things around you.';
    html = `<p class="demo-kicker">A good place to pause</p><div class="done-icon">${icon('leaf')}</div><h3 class="watch-title">${state.mode === 'story' ? 'The end.' : 'Now, into the world.'}</h3><p class="ending">${esc(text)}<small>Nothing else starts automatically.<br>There’s a whole world to explore.</small></p><button class="button watch-cta" data-action="home">Back to sample topics</button>${state.mode !== 'ask' ? '<button class="reset" data-action="restart">' + (state.mode === 'story' ? 'Read this story again' : 'Try the math again') + '</button>' : ''}`;
  }
  content.innerHTML = html;
  content.setAttribute('aria-busy', 'false');
  renderDock();
  updateAudioButton();
}
function focusContent(scroll = false) {
  const target = content.querySelector('h3') || content;
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll:scroll });
  if (scroll) content.closest('.child-side').scrollIntoView({ block:'start', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function openSample(value, hear = false) {
  if (!data) return;
  stopAudio();
  if (value === 'story' || value === 'math') chooseMode(state, value);
  else chooseTopic(state, value);
  render();
  focusContent(true);
  announce(state.view === 'boundary' ? 'This topic is set to explore with a grown-up. Change the sample Parent Dock setting to make its answer available.' : 'Sample opened. Use Listen to hear recorded narration where available.');
  if (hear && audioSource()) {
    toggleAudio();
    const listen = content.querySelector('[data-action="listen"]');
    listen.focus({ preventScroll:true });
    listen.scrollIntoView({ block:'center', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
function setPolicy(value) {
  const affected = changePolicy(state, value);
  if (affected) { stopAudio(); render(); }
  else renderDock();
  announce(state.moonPolicy === 'together' ? 'Moon questions now invite a conversation with a grown-up. Other topics are unchanged.' : 'The prepared Moon answer is available again.');
}
content?.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.action === 'retry') { loadDemo(); return; }
  if (button.dataset.action === 'listen') { toggleAudio(); return; }
  if (button.dataset.number !== undefined) {
    const correct = solveMath(state, button.dataset.number);
    const number = button.dataset.number;
    render();
    announce(state.mathFeedback);
    const next = correct ? content.querySelector('[data-action="nextMath"]') : content.querySelector('[data-number="' + number + '"]');
    next?.focus({ preventScroll:true });
    return;
  }
  stopAudio();
  if (button.dataset.topic) chooseTopic(state, button.dataset.topic);
  else {
    switch (button.dataset.action) {
      case 'home': chooseMode(state, 'ask'); state.view = 'home'; state.topic = null; state.page = 0; break;
      case 'questions': state.view = 'questions'; break;
      case 'startMath': state.view = 'math'; break;
      case 'restart': restartMode(state); break;
      case 'nextMath': nextMath(state); break;
      case 'back':
        if (state.view === 'story') state.storyPage = Math.max(0, state.storyPage - 1);
        else if (state.page > 0) state.page--;
        else state.view = 'questions';
        break;
      case 'next':
        if (state.view === 'story') {
          if (state.storyPage < story.nodes.length - 1) state.storyPage++;
          else { state.view = 'done'; state.finished = true; record(state, 'Finished Trustin and the Curled Leaf'); }
        } else if (state.view === 'discovery') {
          if (state.page === 0) state.page++;
          else { state.view = 'done'; state.finished = true; record(state, 'Explored ' + labels[state.topic].toLowerCase()); }
        }
        break;
    }
  }
  render();
  focusContent();
});
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  if (!data || button.dataset.mode === state.mode) return;
  stopAudio();
  chooseMode(state, button.dataset.mode);
  render();
  announce(button.textContent.trim() + ' opened. Your place is kept while this page stays open.');
}));
document.querySelectorAll('[data-start]').forEach(link => link.addEventListener('click', event => {
  if (!data) return;
  event.preventDefault();
  openSample(link.dataset.start);
}));
document.querySelectorAll('[data-hear]').forEach(button => button.addEventListener('click', () => openSample(button.dataset.hear, true)));
document.querySelector('[data-boundary]')?.addEventListener('click', () => {
  if (!data) return;
  stopAudio();
  changePolicy(state, 'together');
  chooseTopic(state, 'moon');
  render();
  focusContent(true);
  announce('Parent boundary applied: Moon questions are now explored with a grown-up. Your Parent Dock shows the same choice.');
});
document.querySelector('[data-inspect-moon]')?.addEventListener('click', () => openSample('moon'));
document.querySelector('#topic-policy')?.addEventListener('change', event => { if (data) setPolicy(event.target.value); });
document.querySelector('#narration-pace')?.addEventListener('change', event => {
  state.pace = Number(event.target.value);
  player.playbackRate = state.pace;
  announce('Narration pace changed to ' + event.target.selectedOptions[0].textContent + '.');
});
document.querySelector('#reset-demo')?.addEventListener('click', () => {
  stopAudio();
  state = initialState();
  chooseTopic(state, 'moon');
  render();
  announce('Preview reset. Sample activity and settings cleared; the Moon answer is ready.');
});
document.addEventListener('visibilitychange', () => { if (document.hidden && player) { playIntent++; playing = false; player.pause(); updateAudioButton(); } });
window.addEventListener('pagehide', () => { if (player) { playIntent++; playing = false; player.pause(); } });

async function loadDemo() {
  content.setAttribute('aria-busy', 'true');
  content.innerHTML = '<p class="ending">Getting the prepared demo ready…</p>';
  try {
    const responses = await Promise.all([fetch('/assets/discoveries.json'), fetch('/assets/story/book.json')]);
    if (responses.some(response => !response.ok)) throw Error('Content unavailable');
    const [discoveries, book] = await Promise.all(responses.map(response => response.json()));
    if (!['moon','seed','butterfly'].every(topic => discoveries.some(item => item.illustration === topic)) || !book.nodes?.length) throw Error('Content incomplete');
    data = discoveries; story = book;
    chooseTopic(state, 'moon');
    render();
    document.querySelectorAll('[data-mode],[data-hear],[data-boundary],[data-inspect-moon],#topic-policy,#narration-pace,#reset-demo').forEach(button => button.disabled = false);
  } catch {
    content.setAttribute('aria-busy', 'false');
    content.innerHTML = '<h3 class="watch-title">Let’s try that again.</h3><p class="ending">The prepared sample could not load. The rest of the website is still available.</p><button class="button watch-cta" data-action="retry">Retry the demo</button>';
    announce('Demo unavailable. Retry the sample, or read the philosophy and product pages.');
  }
}
if (content) loadDemo();
document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('hello@trustinjr.com'); button.textContent = 'Email address copied'; }
  catch { button.textContent = 'hello@trustinjr.com'; }
}));
