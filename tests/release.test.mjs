import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareRelease,checkRelease} from '../scripts/release-assets.mjs';

function fixture(run){
 const root=mkdtempSync(join(tmpdir(),'tj-release-'));
 try{
  mkdirSync(join(root,'demo'));
  writeFileSync(join(root,'index.html'),'<html><head><link rel="stylesheet" href="/styles.css"><script type="module" src="/app.js"></script></head></html>');
  writeFileSync(join(root,'demo/index.html'),readFileSync(join(root,'index.html')));
  writeFileSync(join(root,'app.js'),"import {value} from './model.mjs';\nexport const current=value;\n");
  writeFileSync(join(root,'model.mjs'),'export const value=7;\n');
  writeFileSync(join(root,'styles.css'),'.watch { aspect-ratio:184/224 }\n');
  run(root);
 }finally{rmSync(root,{recursive:true,force:true});}
}
test('new documents cannot combine their markup with the old cached app or styles',()=>fixture(root=>{
 const cache=new Map([['/app.js','old incompatible script'],['/model.mjs','old model'],['/styles.css','old elongated Watch styles']]);
 const id=prepareRelease(root),html=readFileSync(join(root,'demo/index.html'),'utf8');
 const load=url=>cache.has(url)?cache.get(url):readFileSync(join(root,url),'utf8');
 const script=html.match(/src="([^"]+)"/)[1],css=html.match(/href="([^"]+)"/)[1];
 assert.equal(script,'/releases/'+id+'/app.js');
 assert.match(load(css),/184\/224/);
 const imported=load(script).match(/from '([^']+)'/)[1];
 assert.equal(new URL(imported,'https://trustinjr.com'+script).pathname,'/releases/'+id+'/model.mjs');
 assert.match(load(new URL(imported,'https://trustinjr.com'+script).pathname),/value=7/);
 assert.deepEqual(checkRelease(root),{id,files:3,pages:2});
}));
test('a CSS change creates a new coherent release and preserves an open old document’s files',()=>fixture(root=>{
 const first=prepareRelease(root);writeFileSync(join(root,'styles.css'),'.watch { aspect-ratio:184/224; border-radius:20% }\n');
 assert.throws(()=>checkRelease(root),/Source changed/);
 const second=prepareRelease(root);assert.notEqual(second,first);
 assert.ok(existsSync(join(root,'releases',first,'app.js')));
 assert.ok(readFileSync(join(root,'demo/index.html'),'utf8').includes('/releases/'+second+'/styles.css'));
 assert.equal(prepareRelease(root),second);checkRelease(root);
}));
test('release validation rejects a missing imported module and legacy page dependency',()=>fixture(root=>{
 prepareRelease(root);writeFileSync(join(root,'index.html'),readFileSync(join(root,'index.html'),'utf8').replace(/\/releases\/[a-f0-9]+\/styles.css/,'/styles.css'));
 assert.throws(()=>checkRelease(root),/Unversioned/);
 writeFileSync(join(root,'app.js'),"import {x} from './missing.mjs';\n");prepareRelease(root);
 assert.throws(()=>checkRelease(root),/Module leaves its release/);
}));
test('the shipped pages start the Parent Dock in its fixed slot with a visible explanation',()=>{
 for(const file of ['index.html','demo/index.html']){
  const html=readFileSync(new URL('../dist/'+file,import.meta.url),'utf8');
  assert.match(html,/<section[^>]*data-parent-tour[^>]*data-parent-mode="docked"/);
  const panels=[...html.matchAll(/<article[^>]*data-parent-panel="([^"]+)"([^>]*)>/g)];
  assert.equal(panels.length,7);assert.deepEqual(panels.filter(x=>!x[2].includes('hidden')).map(x=>x[1]),['today']);
  assert.match(html,/<noscript><link[^>]*no-script\.css/);
 }
 checkRelease(fileURLToPath(new URL('../dist/',import.meta.url)));
});
