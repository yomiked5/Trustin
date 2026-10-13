from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json,re
root=Path(__file__).resolve().parents[1]/'dist'
errors=[]
class Doc(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.links=[];self.h1=0;self.title=False;self.description=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:
   if a['id'] in self.ids:errors.append('Duplicate id '+a['id'])
   self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='title':self.title=True
  if tag=='meta' and a.get('name')=='description':self.description=True
  if tag=='img' and not all(x in a for x in ['alt','width','height']):errors.append('Image lacks alt or reserved dimensions')
  for k in ['href','src']:
   if k in a:self.links.append(a[k])
docs={}
for p in root.rglob('*.html'):
 d=Doc();d.feed(p.read_text());docs[p]=d
 if d.h1!=1 or not d.title or not d.description:errors.append(str(p)+' invalid title/heading/description')
for p,d in docs.items():
 for link in d.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  dest=root/u.path.lstrip('/') if u.path.startswith('/') else p.parent/u.path
  if not u.path:dest=p
  if dest.is_dir():dest=dest/'index.html'
  if not dest.exists():errors.append('Missing local link: '+str(p)+' -> '+link)
  elif u.fragment and dest.suffix=='.html' and u.fragment not in docs[dest].ids:errors.append('Missing anchor '+link)
book=json.loads((root/'assets/story/book.json').read_text())
for n in book['nodes']:
 for f in [n['audio'],n['cues'],n['art']+'.jpg']:
  if not (root/'assets/story'/f).exists():errors.append('Missing story asset '+f)
for d in json.loads((root/'assets/discoveries.json').read_text()):
 for part in ['answer','more']:
  p=root/'assets/audio'/f"{d['id']}.v{d['version']}-{part}.m4a"
  if not p.exists():errors.append('Missing discovery recording '+str(p))
js=(root/'app.js').read_text()
for forbidden in ['getUserMedia','localStorage','sessionStorage','speechSynthesis','api.openai.com']:
 if forbidden in js:errors.append('Unexpected privacy or narration API '+forbidden)
css=(root/'styles.css').read_text()
palette=dict(re.findall(r'--([a-z]+):\s*(#[0-9a-fA-F]{6})',css))
def luminance(color):
 rgb=[int(color[i:i+2],16)/255 for i in (1,3,5)]
 rgb=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in rgb]
 return sum(v*w for v,w in zip(rgb,[0.2126,0.7152,0.0722]))
contrast_pairs=[('ink','cream'),('ink','paper'),('muted','cream'),('muted','sage'),('teal','cream'),('teal','sage'),('ink','lavender'),('ink','peach'),('clay','cream')]
for fg,bg in contrast_pairs:
 light,dark=sorted([luminance(palette[fg]),luminance(palette[bg])],reverse=True)
 ratio=(light+0.05)/(dark+0.05)
 if ratio<4.5:errors.append(f'Text palette contrast {fg}/{bg}: {ratio:.2f}')
assert not errors,'\n'.join(errors)
print(f'Passed: {len(docs)} pages; internal links, anchors, image dimensions, content/audio references, and demo privacy API checks.')
print(f'Passed: {len(contrast_pairs)} core text color pairings exceed 4.5:1 (not a rendered accessibility audit).')
