// Every page and every transitive module belongs to one content-addressed release.
// Keep earlier release folders so an already-open document can finish loading.
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const digest=value=>createHash('sha256').update(value).digest('hex');
export function releaseSources(root){
  return readdirSync(root).filter(name=>/\.(css|m?js)$/.test(name)).sort().map(name=>({name,bytes:readFileSync(join(root,name))}));
}
export function releaseID(files){return digest(Buffer.concat(files.flatMap(({name,bytes})=>[Buffer.from(name+'\0'),bytes,Buffer.from('\0')]))).slice(0,16);}
function pages(root){
  return readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.name==='releases'?[]:entry.isDirectory()?pages(join(root,entry.name)):/\.html$/.test(entry.name)?[join(root,entry.name)]:[]);
}
export function prepareRelease(root){
  const files=releaseSources(root),id=releaseID(files),folder=join(root,'releases',id);
  mkdirSync(folder,{recursive:true});
  for(const {name,bytes} of files){
    const destination=join(folder,name);
    if(existsSync(destination)&&!readFileSync(destination).equals(bytes))throw Error('Refusing to overwrite immutable release '+destination);
    writeFileSync(destination,bytes);
  }
  for(const path of pages(root)){
    let html=readFileSync(path,'utf8').replace(/\b(src|href)="\/(?:releases\/[a-f0-9]{16}\/)?([\w-]+\.(?:css|m?js))"/g,(_,attribute,name)=>{
      if(!files.some(file=>file.name===name))throw Error('Unknown page asset '+name);
      return attribute+'="/releases/'+id+'/'+name+'"';
    });
    const marker='<meta name="tj-release" content="'+id+'">';
    html=/<meta name="tj-release"[^>]*>/.test(html)?html.replace(/<meta name="tj-release"[^>]*>/,marker):html.replace('</head>',marker+'</head>');
    writeFileSync(path,html);
  }
  writeFileSync(join(root,'release.json'),JSON.stringify({id,files:Object.fromEntries(files.map(({name,bytes})=>[name,digest(bytes)]))},null,2)+'\n');
  return id;
}
export function checkRelease(root){
  const manifest=JSON.parse(readFileSync(join(root,'release.json'),'utf8')),files=releaseSources(root);
  if(manifest.id!==releaseID(files))throw Error('Source changed after release preparation. Run npm run build.');
  for(const {name,bytes} of files){
    const path=join(root,'releases',manifest.id,name);
    if(manifest.files[name]!==digest(bytes)||!readFileSync(path).equals(bytes))throw Error('Release/source mismatch: '+name);
    for(const match of bytes.toString().matchAll(/\b(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){
      const specifier=match[1];
      if(!specifier.startsWith('./')||!files.some(file=>file.name===specifier.slice(2)))throw Error('Module leaves its release: '+name+' -> '+specifier);
    }
  }
  for(const path of pages(root)){
    const html=readFileSync(path,'utf8');
    if(!html.includes('<meta name="tj-release" content="'+manifest.id+'">'))throw Error('Wrong page release: '+path);
    for(const match of html.matchAll(/\b(?:src|href)="([^"?#]+\.(?:css|m?js))"/g)){
      if(!match[1].startsWith('/releases/'+manifest.id+'/')||!existsSync(join(root,match[1])))throw Error('Unversioned/missing page dependency: '+match[1]);
    }
  }
  return {id:manifest.id,files:files.length,pages:pages(root).length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
  if(process.argv.includes('--check'))console.log('Passed: coherent release',checkRelease(root));
  else console.log('Prepared immutable asset release:',prepareRelease(root));
}
