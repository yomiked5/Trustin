"""Static contract checks, not a rendered accessibility or deployment audit."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json
import hashlib
import re
import struct
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1] / 'dist'
origin = 'https://trustinjr.com'
errors = []


class Doc(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.links = []
        self.h1 = 0
        self.title = ''
        self.in_title = False
        self.meta = {}
        self.canonicals = []
        self.lang = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                errors.append(f'{self.path}: duplicate id {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag == 'html':
            self.lang = attrs.get('lang')
        if tag == 'h1':
            self.h1 += 1
        if tag == 'title':
            self.in_title = True
        if tag == 'meta':
            key = attrs.get('name') or attrs.get('property')
            if key:
                if key in self.meta:
                    errors.append(f'{self.path}: duplicate metadata {key}')
                self.meta[key] = attrs.get('content', '')
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href', ''))
        if tag == 'img':
            if not all(key in attrs for key in ['alt', 'width', 'height']):
                errors.append(f'{self.path}: image lacks alt or reserved dimensions')
            elif not all(str(attrs[key]).isdigit() and int(attrs[key]) > 0 for key in ['width', 'height']):
                errors.append(f'{self.path}: image dimensions are not positive integers')
        for key in ['href', 'src']:
            if key in attrs:
                self.links.append(attrs[key])

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def canonical_for(path):
    relative = path.relative_to(root).as_posix()
    if relative == 'index.html':
        return origin + '/'
    if relative.endswith('/index.html'):
        return origin + '/' + relative[:-10]
    return origin + '/' + relative


def png_dimensions(path):
    header = path.read_bytes()[:24]
    if len(header) < 24 or header[:8] != b'\x89PNG\r\n\x1a\n' or header[12:16] != b'IHDR':
        raise ValueError('Expected a valid PNG share image')
    return struct.unpack('>II', header[16:24])


docs = {}
for path in sorted(root.rglob('*.html')):
    doc = Doc(path.relative_to(root))
    doc.feed(path.read_text())
    docs[path] = doc
    if doc.h1 != 1 or not doc.title.strip() or not doc.meta.get('description', '').strip():
        errors.append(f'{doc.path}: invalid title, primary heading or description')
    if doc.lang != 'en-US' or 'width=device-width' not in doc.meta.get('viewport', ''):
        errors.append(f'{doc.path}: missing language or responsive viewport')
    expected_robots = 'noindex,nofollow' if path.name == '404.html' else 'index,follow'
    if doc.meta.get('robots', '').lower() != expected_robots:
        errors.append(f'{doc.path}: expected robots {expected_robots}')
    expected = canonical_for(path)
    if doc.canonicals != [expected]:
        errors.append(f'{doc.path}: canonical must be {expected}')
    if doc.meta.get('og:url') != expected:
        errors.append(f'{doc.path}: Open Graph URL does not match its canonical route')
    for key in ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:image', 'og:image:alt']:
        if not doc.meta.get(key, '').strip():
            errors.append(f'{doc.path}: missing social metadata {key}')
    if doc.meta.get('twitter:card') != 'summary_large_image':
        errors.append(f'{doc.path}: missing large-image social card')
    image_url = urlsplit(doc.meta.get('og:image', ''))
    if image_url.scheme != 'https' or image_url.netloc != 'trustinjr.com' or image_url.query or image_url.fragment:
        errors.append(f'{doc.path}: share image must use its planned canonical HTTPS host')
    image = root / image_url.path.lstrip('/')
    if not image.is_file():
        errors.append(f'{doc.path}: missing share image {image_url.path}')
    else:
        try:
            dimensions = png_dimensions(image)
            declared = tuple(int(doc.meta.get(key, '0')) for key in ['og:image:width', 'og:image:height'])
            if dimensions != declared:
                errors.append(f'{doc.path}: social dimensions {declared} do not match image {dimensions}')
            if dimensions != (1200, 630):
                errors.append(f'{doc.path}: expected the approved 1200×630 social composition')
        except ValueError as error:
            errors.append(f'{doc.path}: {error}')

for field, values in [
    ('title', [doc.title for doc in docs.values()]),
    ('description', [doc.meta.get('description') for doc in docs.values()])
]:
    if len(values) != len(set(values)):
        errors.append(f'Page {field}s must be specific to each route')

svg_ids = {}
for path in root.rglob('*.svg'):
    try:
        svg_ids[path] = {element.attrib['id'] for element in ET.parse(path).iter() if 'id' in element.attrib}
    except ET.ParseError as error:
        errors.append(f'Invalid SVG {path.relative_to(root)}: {error}')

for path, doc in docs.items():
    for link in doc.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        destination = root / url.path.lstrip('/') if url.path.startswith('/') else path.parent / url.path
        if not url.path:
            destination = path
        if destination.is_dir():
            destination = destination / 'index.html'
        if not destination.exists():
            errors.append(f'{doc.path}: missing local link {link}')
        elif url.fragment:
            if destination.suffix == '.html' and url.fragment not in docs[destination].ids:
                errors.append(f'{doc.path}: missing anchor {link}')
            if destination.suffix == '.svg' and url.fragment not in svg_ids.get(destination, set()):
                errors.append(f'{doc.path}: missing SVG symbol {link}')

headers = (root / '_headers').read_text()
global_headers = headers.split('/assets/*', 1)[0]
if 'X-Robots-Tag' in global_headers:
    errors.append('Public pages must not inherit a global noindex header')
for preview_pattern in ['https://:project.pages.dev/*', 'https://:version.:project.pages.dev/*', '/404.html']:
    if preview_pattern + '\n  X-Robots-Tag: noindex, nofollow' not in headers:
        errors.append(f'Missing preview/404 noindex rule: {preview_pattern}')
robots = (root / 'robots.txt').read_text()
if robots.strip() != 'User-agent: *\nAllow: /\nSitemap: https://trustinjr.com/sitemap.xml':
    errors.append('Public robots.txt must allow crawling and reference the canonical sitemap')

try:
    sitemap = ET.parse(root / 'sitemap.xml')
    locations = [element.text for element in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    expected = {canonical_for(path) for path in docs if path.name != '404.html'}
    if set(locations) != expected or len(locations) != len(set(locations)):
        errors.append('Staged sitemap must contain each planned public content route once, excluding 404')
except ET.ParseError as error:
    errors.append(f'Invalid sitemap XML: {error}')

for collection in ['story', 'pip']:
    folder = root / 'assets' / collection
    book = json.loads((folder / 'book.json').read_text())
    for node in book['nodes']:
        for filename in [node['audio'], node['cues'], node['art'] + '.jpg']:
            if not (folder / filename).exists():
                errors.append(f'Missing {collection} asset {filename}')
        audio, cue_path = folder / node['audio'], folder / node['cues']
        if audio.exists() and cue_path.exists():
            cue = json.loads(cue_path.read_text())
            if cue.get('audioSHA256') and hashlib.sha256(audio.read_bytes()).hexdigest() != cue['audioSHA256']:
                errors.append(f'{collection}/{node["audio"]}: narration does not match its word timings')
            if cue.get('text') != node['text']:
                errors.append(f'{collection}/{node["id"]}: readable text does not match its narration cues')
for discovery in json.loads((root / 'assets/discoveries.json').read_text()):
    for part in ['answer', 'more']:
        path = root / 'assets/audio' / f"{discovery['id']}.v{discovery['version']}-{part}.m4a"
        if not path.exists():
            errors.append('Missing discovery recording ' + str(path))

scripts = sorted(path for path in root.rglob('*') if path.suffix in ['.js', '.mjs'] and 'releases' not in path.relative_to(root).parts)
for path in scripts:
    source = path.read_text()
    for forbidden in ['getUserMedia', 'localStorage', 'sessionStorage', 'speechSynthesis', 'api.openai.com']:
        if forbidden in source:
            errors.append(f'{path.relative_to(root)}: unexpected privacy or narration API {forbidden}')
    for match in re.finditer(r'\bicon\(\s*([\'"])([\w-]+)\1\s*\)', source):
        if match[2] not in svg_ids.get(root / 'assets/icons.svg', set()):
            errors.append(f'{path.relative_to(root)}: missing dynamic SVG symbol {match[2]}')

css = (root / 'styles.css').read_text() + (root / 'showcase.css').read_text()
palette = dict(re.findall(r'--([a-z-]+):\s*(#[0-9a-fA-F]{6})', css))


def luminance(color):
    rgb = [int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    rgb = [value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4 for value in rgb]
    return sum(value * weight for value, weight in zip(rgb, [0.2126, 0.7152, 0.0722]))


contrast_pairs = [('ink', 'cream'), ('ink', 'paper'), ('muted', 'cream'), ('muted', 'sage'), ('teal', 'cream'), ('teal', 'sage'), ('ink', 'lavender'), ('ink', 'peach'), ('clay', 'cream'), ('marketing-ink', 'marketing-bg'), ('marketing-muted', 'marketing-bg'), ('marketing-muted', 'marketing-surface'), ('teal', 'marketing-bg')]
for foreground, background in contrast_pairs:
    light, dark = sorted([luminance(palette[foreground]), luminance(palette[background])], reverse=True)
    ratio = (light + 0.05) / (dark + 0.05)
    if ratio < 4.5:
        errors.append(f'Text palette contrast {foreground}/{background}: {ratio:.2f}')

assert not errors, '\n'.join(errors)
print(f'Passed: {len(docs)} pages; links, anchors, SVG symbols, reserved image dimensions and content/audio references.')
print('Passed: public indexing, preview/404 noindex headers, canonical routes, sitemap and 1200×630 social metadata/image.')
print(f'Passed: narrow privacy/narration API scan across {len(scripts)} source scripts; release copies are byte-verified separately.')
print(f'Passed: {len(contrast_pairs)} core text color pairings exceed 4.5:1 (not a rendered accessibility audit).')
