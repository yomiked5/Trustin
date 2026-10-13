export const mathQuestions = [
  { prompt: 'Three seeds are ready. Add one more. How many seeds?', count: 4, options: [3, 4, 5], answer: 4, hint: 'Count each seed once: one, two, three…', idea: '3 + 1 = 4' },
  { prompt: 'Five seeds are ready. Plant two. How many are left?', count: 3, options: [2, 4, 3], answer: 3, hint: 'Start with five. Take away one, then one more.', idea: '5 − 2 = 3' },
  { prompt: 'Two seeds here. Two seeds there. How many altogether?', count: 4, options: [4, 3, 5], answer: 4, hint: 'Try counting all the seeds together.', idea: '2 + 2 = 4' }
];
export function initialState(){return {mode:'ask',view:'home',topic:null,page:0,storyPage:0,mathPage:0,mathSolved:false,mathFeedback:'',moonPolicy:'explore',pace:0.85,log:[],finished:false};}
export function record(state,label){if(!state.log.includes(label))state.log.unshift(label);state.log=state.log.slice(0,6);}
export function chooseMode(state,mode){if(!['ask','story','math'].includes(mode))return;state.mode=mode;state.view=mode==='ask'?'home':mode==='story'?'story':'mathIntro';state.page=0;state.storyPage=0;state.mathPage=0;state.mathSolved=false;state.mathFeedback='';state.finished=false;}
export function chooseTopic(state,topic){if(!['moon','seed','butterfly'].includes(topic))return;state.mode='ask';state.topic=topic;state.page=0;state.finished=false;state.view=topic==='moon'&&state.moonPolicy==='together'?'boundary':'discovery';}
export function changePolicy(state,policy){state.moonPolicy=policy==='together'?'together':'explore';if(state.topic==='moon'&&['discovery','boundary','done'].includes(state.view)){state.view=state.moonPolicy==='together'?'boundary':'discovery';state.page=0;state.finished=false;}}
export function solveMath(state,value){if(state.view!=='math'||state.mathSolved)return false;const q=mathQuestions[state.mathPage];if(Number(value)!==q.answer){state.mathFeedback=q.hint;return false;}state.mathSolved=true;state.mathFeedback=`You found it. ${q.idea}.`;return true;}
export function nextMath(state){if(!state.mathSolved)return; if(state.mathPage===mathQuestions.length-1){state.view='done';state.finished=true;record(state,'Completed the garden math sample');}else{state.mathPage++;state.mathSolved=false;state.mathFeedback='';}}
