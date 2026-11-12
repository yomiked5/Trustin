// Deep links and print retain the full document behind progressive disclosure.
function revealAnchor() {
  let id;
  try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if(!id)return;
  const target=document.getElementById(id);
  const detail=target?.closest('details');
  if(detail)detail.open=true;
}
let previouslyOpen=[];
window.addEventListener('beforeprint',()=>{
  const details=[...document.querySelectorAll('details')];
  previouslyOpen=details.filter(detail=>detail.open);
  details.forEach(detail=>{detail.open=true;});
});
window.addEventListener('afterprint',()=>{
  document.querySelectorAll('details').forEach(detail=>{detail.open=previouslyOpen.includes(detail);});
});
window.addEventListener('hashchange',revealAnchor);
revealAnchor();
