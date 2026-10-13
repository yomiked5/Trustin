# Validation evidence

Revision 1.1 · 12 October 2026 Pacific / 13 October UTC. This evidence describes the website, not a native app release.

## Passed

- JavaScript syntax checks for `dist/app.js` and `dist/demo-model.mjs`; `git diff --check`.
- **23 automated Node tests:** 13 pure model/content tests and 10 runtime event-contract tests executing the shipped `app.js` with small DOM/Audio doubles. They are not a real browser.
- Model coverage: related boundaries and reopen behavior; cross-mode/stale-Moon regression; unrelated and unchanged policies; independent activity progress; same-mode preservation; guarded finite math completion; per-activity restart; full reset; honest deduplicated logs; invalid actions; playback labels; complete linear story.
- Runtime contract coverage: prepared first answer without autoplay; pause/resume/replay and progress; related-audio cancellation; synchronized hero/Dock boundary; explicit Hear control brought into view; uninterrupted unrelated story audio; preserved story position; deliberate math focus and live feedback; story restart; visible recoverable audio failures; ignored stale audio rejections; failed-content retry; full-session reset.
- Static integrity across five HTML pages: page title/description/single H1, internal links and anchors, image alt text and reserved dimensions, every discovery recording and story text/image/audio reference.
- Nine core CSS text-palette pairings exceed 4.5:1 by luminance calculation. This does not certify every rendered element or WCAG conformance.
- Source check confirms no microphone capture, browser TTS substitution, browser persistence or OpenAI API endpoint in the demo runtime.
- Original avatar, discovery recordings and story assets remain unchanged from the v1 Git-blob-verified copies of native main `34557847ad424bd0fdac7419b44563737cb499cf`.
- Static directory occupies approximately **1.40 MB before hosting compression**, including the existing on-demand audio. This is a payload count, not a measured Core Web Vitals result. No dependency, build step, database, new provider usage or native release pipeline was added.

## Design provisions implemented

- Product category, ages, Watch/iPhone roles and development stage visible in the hero.
- Original character and cream-first role-based palette preserved.
- Visible mobile navigation; adapted readable hero card; responsive 320px+ CSS.
- Parent setting and child-response preview contiguous inside the Dock.
- Complete reader text, without an inner scrolling transcript; explicit activity position.
- Native buttons/selects/details, skip link, visible focus, full text equivalents, user-initiated audio and reduced-motion rules.
- Child-surface primary, answer, topic, question-picker, return and restart controls have at least 64px heights; adult main controls at least 44px. Rendered touch geometry still needs verification.
- Explicit prepared-demo labels, finite endings, activity-not-learning labels, no autoplay chains or fake social proof.
- Whitepaper executive summary and unambiguous family preferences **in addition to** essential protections.

## Not verified in this session

The managed Sites environment has no available `control-browser` skill. Its required browser-preview workflow could not run. No substitute browser automation, screenshots, Lighthouse scores, real audio listening, native app build, or screen-reader certification is claimed. DOM/Audio doubles cannot establish actual media/network timing, CSS layout or assistive-technology behavior.

The visual design and responsive rules are implemented but still need real-browser acceptance, especially narrow tablet columns, 320px mobile, short-viewport audio controls and the desktop hero composition. Actual educational effectiveness and conversion improvement have not been measured.

The owner's Cloudflare account still requires sign-in; no renewed login attempt was made in this revision. `trustinjr.com`, Namecheap DNS, custom-domain HTTPS and `hello@trustinjr.com` delivery remain unverified. No audience, DNS, native-app, backend or TestFlight change was made.

## Real-browser acceptance before domain launch

1. Inspect 320/390/680/688/768/1024px and wide layouts; zoom and reflow; reduced motion; all header/footer links and skip navigation.
2. Hero Hear → visible playback controls; pause, resume, replay; denied/failed media → visible Retry; verify a real retry reloads the recording.
3. Change Moon to Together during Moon narration: audio stops, child response, Dock and hero agree. Other discoveries and story narration remain uninterrupted.
4. Switch activities and return: preserve page/problem state, but do not autoplay. Complete a story/math activity, restart it explicitly, and preserve parent preferences/log.
5. Incorrect math answer → hint and stable focus; correct answer → Next focus; all three correct answers required; no next activity autostarts.
6. Read the complete introduction and all seven story pages; verify correct image, text and recording pairing; check small/short screens without nested transcript scrolling.
7. Test every sample completion, completed-only log, explicit reset and reload. Verify polite announcements and focus with a screen reader.
8. Verify contact email delivery, normal routes/404, apex/www/TLS and public indexing changes only at the actual public launch.
