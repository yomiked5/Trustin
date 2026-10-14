export const mathQuestions = [
  { prompt: 'Three seeds are ready. Add one more. How many seeds?', count: 4, options: [3, 4, 5], answer: 4, hint: 'Count each seed once: one, two, three…', idea: '3 + 1 = 4' },
  { prompt: 'Five seeds are ready. Plant two. How many are left?', count: 3, options: [2, 4, 3], answer: 3, hint: 'Start with five. Take away one, then one more.', idea: '5 − 2 = 3' },
  { prompt: 'Two seeds here. Two seeds there. How many altogether?', count: 4, options: [4, 3, 5], answer: 4, hint: 'Try counting all the seeds together.', idea: '2 + 2 = 4' }
];

const modes = ['ask', 'story', 'math'];
const progressKeys = ['view', 'topic', 'page', 'storyPage', 'mathPage', 'mathSolved', 'mathFeedback', 'finished'];
const freshProgress = mode => ({
  view: mode === 'ask' ? 'home' : mode === 'story' ? 'story' : 'mathIntro',
  topic: null, page: 0, storyPage: 0, mathPage: 0,
  mathSolved: false, mathFeedback: '', finished: false
});

export function initialState() {
  return { mode: 'ask', ...freshProgress('ask'), moonPolicy: 'explore', pace: 0.85, log: [], saved: {} };
}

export function record(state, label) {
  if (!state.log.includes(label)) state.log.unshift(label);
  state.log = state.log.slice(0, 6);
}

export function chooseMode(state, mode) {
  if (!modes.includes(mode) || (mode === state.mode && state.view !== 'launcher')) return;
  if(state.view !== 'launcher') state.saved[state.mode] = Object.fromEntries(progressKeys.map(key => [key, state[key]]));
  Object.assign(state, state.saved[mode] || freshProgress(mode));
  state.mode = mode;
}

export function openHome(state) {
  if(state.view !== 'launcher') state.saved[state.mode] = Object.fromEntries(progressKeys.map(key => [key, state[key]]));
  state.view = 'launcher';
}

export function chooseTopic(state, topic) {
  if (!['moon', 'seed', 'butterfly'].includes(topic)) return;
  chooseMode(state, 'ask');
  Object.assign(state, { topic, page: 0, finished: false,
    view: topic === 'moon' && state.moonPolicy === 'together' ? 'boundary' : 'discovery' });
}

export function restartMode(state) {
  Object.assign(state, freshProgress(state.mode));
}

function applyMoonPolicy(progress, policy) {
  if (progress?.topic !== 'moon' || !['discovery', 'boundary', 'done'].includes(progress.view)) return false;
  Object.assign(progress, { view: policy === 'together' ? 'boundary' : 'discovery', page: 0, finished: false });
  return true;
}

// Return whether the visible child activity changed. Unrelated audio must keep playing.
export function changePolicy(state, policy) {
  const next = policy === 'together' ? 'together' : 'explore';
  if (next === state.moonPolicy) return false;
  state.moonPolicy = next;
  if (state.mode === 'ask') return applyMoonPolicy(state, next);
  applyMoonPolicy(state.saved.ask, next);
  return false;
}

export function solveMath(state, value) {
  if (state.mode !== 'math' || state.view !== 'math' || state.mathSolved) return false;
  const q = mathQuestions[state.mathPage];
  if (Number(value) !== q.answer) { state.mathFeedback = q.hint; return false; }
  state.mathSolved = true;
  state.mathFeedback = `You found it. ${q.idea}.`;
  return true;
}

export function nextMath(state) {
  if (state.mode !== 'math' || state.view !== 'math' || !state.mathSolved) return;
  if (state.mathPage === mathQuestions.length - 1) {
    state.view = 'done'; state.finished = true;
    record(state, 'Completed the garden math sample');
  } else { state.mathPage++; state.mathSolved = false; state.mathFeedback = ''; }
}

export function playbackLabel({ playing = false, ended = false, time = 0 } = {}) {
  return playing ? 'Pause' : ended ? 'Replay' : time > 0 ? 'Resume' : 'Listen';
}
