// Optional authoring utility. Runtime has no dependency on this file or Sharp.
// Use an installed Sharp or CODEX_PRIMARY_RUNTIME_NODE_MODULES to regenerate.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const localRequire = createRequire(import.meta.url);
const runtimeRequire = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/') : localRequire;
let sharp;
try { sharp = localRequire('sharp'); } catch { sharp = runtimeRequire('sharp'); }
const root = new URL('../dist/assets/', import.meta.url);
const portrait = readFileSync(new URL('trustin.png', root)).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#fff8ef"/>
<path d="M60 104H1140M60 552H1140" stroke="#d9d5c9"/>
<text x="62" y="68" fill="#293c38" font-family="DejaVu Sans,sans-serif" font-size="29" font-weight="bold" letter-spacing="-1">trustin<tspan fill="#285c57">jr.</tspan></text>
<text x="1140" y="65" text-anchor="end" fill="#59675e" font-family="DejaVu Sans,sans-serif" font-size="17">PARENT-GUIDED AI DISCOVERY</text>
<text x="58" y="249" fill="#293c38" font-family="DejaVu Serif,serif" font-size="87" letter-spacing="-5">For every</text>
<text x="58" y="350" fill="#293c38" font-family="DejaVu Serif,serif" font-size="87" letter-spacing="-5">little <tspan fill="#285c57" font-style="italic">why.</tspan></text>
<path d="M279 370Q364 354 456 366M292 379Q370 367 443 375" fill="none" stroke="#a44732" stroke-width="3" stroke-linecap="round"/>
<text x="64" y="444" fill="#293c38" font-family="DejaVu Sans,sans-serif" font-size="26" letter-spacing="-.7">A world of wonder. Guided by you.</text>
<path d="M791 488V289a166 166 0 0 1 332 0v199Z" fill="#e4eadc" stroke="#bacbb2"/>
<path d="M769 347C851 461 1031 147 1144 336" fill="none" stroke="#9daf94" stroke-width="2" stroke-dasharray="3 8"/>
<circle cx="1070" cy="195" r="33" fill="#f1df9b"/>
<path d="M774 187v25m-12-12h25" stroke="#a44732" stroke-width="3" stroke-linecap="round"/>
<image href="data:image/png;base64,${portrait}" x="836" y="184" width="247" height="291"/>
<text x="64" y="591" fill="#59675e" font-family="DejaVu Sans,sans-serif" font-size="17">Ages 4–5 · In development &amp; testing</text>
<text x="1140" y="591" text-anchor="end" fill="#285c57" font-family="DejaVu Sans,sans-serif" font-size="19">trustinjr.com</text>
</svg>`;
await sharp(Buffer.from(svg)).png({ compressionLevel:9 }).toFile(new URL('social-preview.png', root).pathname);
console.log('Created assets/social-preview.png (1200 × 630); original portrait unchanged.');
