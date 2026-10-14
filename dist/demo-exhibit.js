// Website explanation controls stay outside the child experience.
const picker=document.querySelector('[data-preview-picker]');
const panels=[...document.querySelectorAll('[data-preview-panel]')];
if(picker && panels.length) {
  const show=()=>panels.forEach(panel=>{panel.hidden=panel.dataset.previewPanel!==picker.value;});
  picker.disabled=false;picker.addEventListener('change',show);show();
}
