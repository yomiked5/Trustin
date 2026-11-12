export const mathQuestions = [
  { prompt: 'Three seeds are ready. Add one more. How many seeds?', count: 4, options: [3, 4, 5], answer: 4, hint: 'Count each seed once: one, two, three…', idea: '3 + 1 = 4' },
  { prompt: 'Five seeds are ready. Plant two. How many are left?', count: 3, options: [2, 4, 3], answer: 3, hint: 'Start with five. Take away one, then one more.', idea: '5 − 2 = 3' },
  { prompt: 'Two seeds here. Two seeds there. How many altogether?', count: 4, options: [4, 3, 5], answer: 4, hint: 'Try counting all the seeds together.', idea: '2 + 2 = 4' },
  { prompt: 'One flower opens. Then two more. How many flowers?', count: 3, options: [2, 3, 4], answer: 3, hint: 'Start with one. Count on two more.', idea: '1 + 2 = 3' },
  { prompt: 'Four pots are ready. Add one. How many pots?', count: 5, options: [5, 4, 6], answer: 5, hint: 'Count the four pots, then count one more.', idea: '4 + 1 = 5' }
];

const modes = ['ask', 'story', 'math'];
const progressKeys = ['view', 'topic', 'page', 'storyPage', 'mathPage', 'mathSolved', 'mathFeedback', 'finished', 'mathStep', 'mathValue', 'mathEntry'];
const freshProgress = mode => ({
  view: mode === 'ask' ? 'home' : mode === 'story' ? 'story' : 'mathIntro',
  topic: null, page: 0, storyPage: 0, mathPage: 0,
  mathSolved: false, mathFeedback: '', finished: false, mathStep:0, mathValue:0, mathEntry:false
});

export function initialState() {
  return { mode: 'ask', ...freshProgress('ask'), moonPolicy: 'explore', pace: 0.85, log: [], saved: {}, nextMathStep:0, stars:18, rewardsEnabled:true, owned:['starter-cap','starter-scarf','starter-bow'], outfit:{hat:'starter-cap'}, rewardView:'home', rewardItem:'cozy-scarf' };
}

export function record(state, label) {
  if (!state.log.includes(label)) state.log.unshift(label);
  state.log = state.log.slice(0, 6);
}

export function chooseMode(state, mode) {
  if (!modes.includes(mode) || (mode === state.mode && !['launcher','rewards'].includes(state.view))) return;
  if(!['launcher','rewards'].includes(state.view)) state.saved[state.mode] = Object.fromEntries(progressKeys.map(key => [key, state[key]]));
  Object.assign(state, state.saved[mode] || freshProgress(mode));
  state.mode = mode;
}

export function openHome(state) {
  if(!['launcher','rewards'].includes(state.view)) state.saved[state.mode] = Object.fromEntries(progressKeys.map(key => [key, state[key]]));
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
  if(state.mode==='math')state.mathStep=state.nextMathStep;
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
  const q = currentMath(state);
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
  } else { state.mathPage++; state.mathSolved = false; state.mathFeedback = ''; state.mathValue=0;state.mathEntry=false; }
}

export function playbackLabel({ playing = false, ended = false, time = 0 } = {}) {
  return playing ? 'Pause' : ended ? 'Replay' : time > 0 ? 'Resume' : 'Listen';
}

// Source: native bccac84 (Nov 11). The website uses finite, prepared examples.
export const mathBands=['First discoveries','Number builders','Number explorers','Place-value planners','Grouping and sharing','Practical problem solvers','Advanced explorers'];
export const mathBandDetails=['Counting, shapes and small adding or taking away.','Number patterns and adding or taking away within ten.','Missing numbers and larger adding and taking away.','Tens and ones, numbers through one hundred and measurement.','Equal groups, multiplication and sharing.','Practical number problems with more than one step.','Larger numbers, fractions and flexible problem solving.'];
export function setMathStartingPoint(state,step){if(Number.isInteger(step)&&step>=0&&step<=20)state.nextMathStep=step;}
export function currentMath(s){
 const base=mathQuestions[s.mathPage];if(s.mathStep<6)return base;
 const band=Math.floor(s.mathStep/3),job=s.mathPage;
 const a=3+job,b=2+job;
 const sample=band===2?{prompt:`${a} seeds and how many more make ${a+b}?`,idea:`${a} + ? = ${a+b}`,answer:b,count:a+b,hint:`Start at ${a} and count on to ${a+b}.`}
 :band===3?{prompt:`Twenty seeds and ${b} more. How many?`,idea:`20 + ${b} = ?`,answer:20+b,count:b,hint:`Two tens and ${b} ones make ${20+b}.`}
 :band===4?{prompt:`${a} rows with two seeds each. How many seeds?`,idea:`${a} × 2 = ?`,answer:a*2,count:a*2,hint:`Count by twos ${a} times.`}
 :band===5?{prompt:`Twelve seeds and ${b} more, then plant five. How many remain?`,idea:`12 + ${b} − 5 = ?`,answer:7+b,count:b,hint:`Twelve plus ${b} is ${12+b}. Take away five.`}
 :{prompt:`Half of ${24+job*2} seeds will go in this bed. How many?`,idea:`${24+job*2} ÷ 2 = ?`,answer:12+job,count:12,hint:`Two equal groups of ${12+job} make ${24+job*2}.`};
 return {...sample,entry:true};
}
export const sampleTreasures=[
 {id:'starter-cap',name:'Little cap',slot:'hat',price:0},
 {id:'starter-scarf',name:'Little scarf',slot:'scarf',price:0},
 {id:'starter-bow',name:'Little bow',slot:'scarf',price:0},
 {id:'explorer-hat',name:'Explorer hat',slot:'hat',price:6},
 {id:'moon-cap',name:'Moon cap',slot:'hat',price:6},
 {id:'cozy-scarf',name:'Cozy scarf',slot:'scarf',price:6},
 {id:'cloud-scarf',name:'Cloud scarf',slot:'scarf',price:6},
 {id:'sage-place',name:'Sage',slot:'background',price:5},
 {id:'sky-place',name:'Sky',slot:'background',price:5}
];
export function purchaseTreasure(s,id){
 const item=sampleTreasures.find(x=>x.id===id);
 if(!s.rewardsEnabled||!item||s.owned.includes(id)||s.stars<item.price)return false;
 s.stars-=item.price;s.owned.push(id);return true;
}
export function wearTreasure(s,id){const item=sampleTreasures.find(x=>x.id===id);if(!s.rewardsEnabled||!item||!s.owned.includes(id))return false;s.outfit[item.slot]=id;return true;}
export const wordHelp={
 one:['w · u · n','One means a single thing.'],tiny:['ty · nee','Very small.'],seed:['s · ee · d','A small part of a plant that can grow into a new plant.'],what:['w · o · t','A word we use to ask about something.'],could:['k · oo · d','Something that might happen.'],it:['i · t','A word for the thing we are talking about.'],become:['bih · kum','To grow or change into something.'],pip:['p · i · p','The child in this story.'],added:['ad · id','Put something with what was already there.'],soil:['s · oy · l','Earth that plants grow in.'],and:['a · n · d','A word that joins things together.'],a:['uh','One of something.'],little:['lit · ul','Small in size or amount.'],water:['waw · ter','The liquid plants need to grow.'],sunlight:['sun · lyt','Light from the Sun.'],warmed:['w · or · m · d','Made something a little warmer.'],the:['thuh','Points to the thing we mean.'],pot:['p · o · t','A container a plant can grow in.'],each:['ee · ch','Every one, one at a time.'],day:['d · ay','The time from one morning to the next.'],wanted:['won · tid','Hoped to have or do something.'],to:['too','A word that can tell where something is going.'],peek:['p · ee · k','Take a quick look.'],she:['sh · ee','A word for Pip in this story.'],waited:['way · tid','Let some time pass.'],green:['g · r · ee · n','The color of many leaves.'],shoot:['sh · oo · t','A new part of a plant growing up from a seed.'],was:['w · u · z','Tells us something happened before now.'],growing:['groh · ing','Getting bigger.'],two:['t · oo','One and one together.'],leaves:['l · ee · v · z','Parts of a plant that use sunlight to help it grow.'],opened:['oh · pund','Spread out instead of staying closed.'],end:['e · n · d','The place where this story finishes.']
};
