import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/editorial.js',import.meta.url),'utf8');
function setup(hash='#limits') {
  const details=[{open:false},{open:true},{open:false}],events={},location={hash};
  vm.runInNewContext(source,{location,window:{addEventListener:(name,fn)=>{events[name]=fn;}},document:{getElementById:id=>id==='limits'?{closest:()=>details[0]}:null,querySelectorAll:()=>details}});
  return {details,events,location};
}
test('a deep link exposes a principle inside a disclosure and malformed hashes are harmless',()=>{
  const a=setup();assert.equal(a.details[0].open,true);const b=setup('#%broken');assert.equal(b.details[0].open,false);b.location.hash='#limits';b.events.hashchange();assert.equal(b.details[0].open,true);
});
test('printing includes every principle and restores the reader’s disclosure choices afterwards',()=>{
  const a=setup('');a.events.beforeprint();assert.ok(a.details.every(detail=>detail.open));a.events.afterprint();assert.deepEqual(a.details.map(detail=>detail.open),[false,true,false]);
});
