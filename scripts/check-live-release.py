"""Read-only HTTP release verification. Does not render or exercise a browser."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from urllib.parse import urlsplit

origin = sys.argv[1].rstrip('/')
if urlsplit(origin).scheme != 'https' or urlsplit(origin).path:
    raise SystemExit('Pass an HTTPS origin without a path.')
root = Path(__file__).resolve().parents[1] / 'dist'
manifest = json.loads((root / 'release.json').read_text())
paths = ['/release.json']
paths += [f'/releases/{manifest["id"]}/{name}' for name in manifest['files']]
paths += ['/' + p.relative_to(root).as_posix().removesuffix('index.html') for p in root.rglob('*.html') if 'releases' not in p.parts]
paths += ['/app.js', '/demo-exhibit.css', '/parent-tour.css', '/assets/pip/book.json', '/assets/discoveries.json', '/assets/pip/seed.m4a']

def check(path):
    with tempfile.TemporaryDirectory(prefix='tj-http-') as directory:
        body, headers = Path(directory) / 'body', Path(directory) / 'headers'
        result = subprocess.run(['curl', '-sS', '-L', '--max-time', '25', '-D', str(headers), '-o', str(body), '-w', '%{http_code}', origin + path], capture_output=True, text=True)
        allowed_status = {'200', '404'} if path == '/404.html' else {'200'}
        if result.returncode or result.stdout not in allowed_status:
            return {'path': path, 'error': result.stderr or 'HTTP ' + result.stdout}
        values = {}
        for line in headers.read_text().splitlines():
            if line.startswith('HTTP/'):
                values = {}
            elif ':' in line:
                key, value = line.split(':', 1)
                values[key.lower()] = value.strip()
        local = root / path.lstrip('/')
        if local.is_dir():
            local /= 'index.html'
        if body.read_bytes() != local.read_bytes():
            return {'path': path, 'error': 'Delivered bytes differ from the tested export'}
        expected_type = {'.css': 'text/css', '.js': 'javascript', '.mjs': 'javascript', '.json': 'application/json', '.html': 'text/html', '.m4a': 'audio/'}[local.suffix]
        if expected_type not in values.get('content-type', ''):
            return {'path': path, 'error': 'Wrong content type: ' + values.get('content-type', '')}
        cache = values.get('cache-control', '')
        if path.startswith('/releases/'):
            if 'immutable' not in cache or 'max-age=31536000' not in cache:
                return {'path': path, 'error': 'Release cache header missing: ' + cache}
        elif not path.startswith('/assets/') and 'no-cache' not in cache:
            return {'path': path, 'error': 'Mutable entry point does not revalidate: ' + cache}
        return {'path': path, 'bytes': local.stat().st_size, 'sha256': hashlib.sha256(body.read_bytes()).hexdigest(), 'cache': cache}

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(check, paths))
errors = [item for item in results if 'error' in item]
print(json.dumps({'origin': origin, 'release': manifest['id'], 'checked': len(results), 'errors': errors, 'scope': 'HTTP bytes, MIME and cache headers; not browser rendering'}, indent=2))
raise SystemExit(bool(errors))
