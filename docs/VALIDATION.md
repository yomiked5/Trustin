# Validation evidence

Revision 1.5 · October 13, 2026. These results concern the marketing website and scripted browser demonstration, not a native app release.

## Current revision 1.5 — executed and passed

- `npm test`: **53 Node tests**, syntax checks for **8 shipped JS/MJS files**, static integrity across **7 HTML routes**. The existing 45 tests remain, with two obsolete UI references adapted; eight new tour contracts cover annotation-free arrival, shrink-before-label timing, one visible feature, forward/reverse progression, coalesced scroll, page lifecycle cleanup, manual controls, reduced-motion/short-screen fallback, mobile connector direction and unenhanced content.
- Complete scripted activities, pause/resume/replay/retry, stale audio cancellation, parent preferences, independent progress and honest logs still pass. Removed repetitive captions and duplicate page-progress bars without changing authored scripts or narration assets.
- Newly ported native SVG symbols parse and all their fragment references resolve. Metadata, canonical routes, links, original content/audio references and privacy API scan pass. The existing 13 core text-palette pairs exceed 4.5:1 by calculation; this does not audit every new composite color or rendered pixel.
- Native main `34557847ad424bd0fdac7419b44563737cb499cf` read directly. Actual older native reference images were inspected; current source supplied updated controls/palette. Hero is HTML/CSS with source-derived vector illustrations, not a new native capture.
- `git diff --check` is part of the final packaging gate. Original audio and raster art remain byte-unchanged. No new dependency, provider call, browser data collection or native build.

### Current acceptance limit

Supported `control-browser` is absent in this managed environment. No preview server, alternate browser automation or substitute screenshot renderer was used. **Rendered layout, mobile Safari scrolling/audio, connector alignment, keyboard/screen-reader usability, animation feel and Core Web Vitals remain unverified.** DOM/Audio/geometry doubles test event contracts, not browser rendering. Deployment success is reported separately from visual acceptance.

Priority device pass: 320/390px portrait and short landscape, desktop 1024/1440px, reverse scroll, jump to each chapter, direct deep link, Reduce Motion, motion toggle during the tour, 200% text zoom, keyboard-only use and narrator retry. Confirm the Watch and panel never collide and that the whole first screen is readable in mobile browser chrome.

## Revision 1.4 — historical executed evidence

- `npm test`: **45 Node tests**, all **6 shipped JS/MJS** syntax checks, and static integrity across **7 HTML pages**. Existing 38 tests adapted to the dedicated demo and extended motion timing; seven new tests cover all five activity-entry queries, invalid-entry fallback, bounded scene offsets, scroll event coalescing/motion-off reset/one-shot reveal, homepage preference state/icon/response, missing-enhancement fallback and homepage route/content contracts.
- The 45 tests comprise 13 model tests, 18 shipped-demo runtime contracts, 11 motion tests and 3 homepage interaction/structure contracts. DOM/Audio/geometry doubles are deliberately not browsers.
- **13 text color pairings** exceed 4.5:1 by calculation, including the new marketing foreground/background tokens. This is not a complete rendered contrast audit.
- Seven-page link/anchor/SVG/image dimensions/canonical/social/noindex/sitemap integrity; narrow source privacy scan of every shipped script; `git diff --check`.
- Same-method main-body source count: **568 → 267 words (53% fewer)**; **179 words outside collapsed FAQs**, including illustrative UI labels. The full demo is preserved on `/demo/`, not removed. Counts exclude dynamic activity text.
- The homepage code set (HTML, three CSS files and four JS/MJS files) totals about **90 KB raw / 23.6 KB summed gzip**, excluding images. This is a local file calculation, not measured transfer or Web Vitals. No new raster media or service dependency.
- All original media/content remains unchanged; earlier blob/decode evidence below applies to retained bytes. No new audio listening or rendered image/layout test was performed.
- Motion is optional: a 680ms finite entrance/reveal, bounded scroll offsets on noninteractive device layers, 280ms response-icon fade/scale and retained short reader/state transitions. Policy changes cancel effects and clear offsets; no autoplay or scroll interception.

### Revision 1.4 verification boundary

Supported `control-browser` remains unavailable in the managed Sites environment. No preview server, substitute browser, screenshot renderer or alternate browser automation was used. **Visual layout, breakpoint fit, Safari narration, native keyboard/screen-reader behavior, animation feel and Core Web Vitals remain unverified.** Private deployment success does not close these acceptance gates. Inspect the new homepage, horizontal highlight rail, response-panel reflow and all deep demo links at 320/390/680/850/1024px before public launch.

## Revision 1.3 — historical executed evidence

- `npm test`: syntax validation of all **5 shipped JS/MJS files**, **38 Node tests**, and static integrity across **6 HTML pages**. No skipped or failing tests at the final integration checkpoint.
- **13 model tests:** family preference behavior, affected/unrelated activities, independent progress, finite Math completion, required correct answers, per-activity restart, full reset, honest deduplicated logs, invalid actions, playback labels and complete linear story.
- **16 runtime event-contract tests:** execute shipped `app.js` with small DOM/Audio doubles. Cover prepared initial answer without autoplay; narration pause/resume/replay/retry/progress; affected audio cancellation; Dock/child synchronization; primary preview action focus without autoplay; unrelated story audio; retained story position; Math hints/focus; story restart; stale audio rejections; failed-content retry; all three discovery choices and recording routing; preference restoration; context-specific parent prompts; pace changes and full reset.
- **9 motion tests:** unsupported/disabled/static behavior; replacement and cancellation; stale-animation completion; finite effects/no persistent fill; bounded reading progress; device reduced-motion changes; manual choice through URL and internal links; no storage/network use by policy; navigation transition suppression and history failure fallback.
- Static checks: every page title/description/single H1, unique IDs, local links/anchors, SVG symbols, reserved image dimensions, discovery/story text/image/audio references, exact canonical/OG URLs, preview meta/header/robots noindex, sitemap route set and social image presence/1200×630 metadata.
- All shipped scripts scanned for a narrow set of microphone, live-AI, browser-storage, browser-TTS and cookie APIs. No advertising/analytics/third-party font code is introduced. This is a source check, not network observation of the hosting/authentication platform.
- **9 core text-palette pairs** exceed 4.5:1 by luminance calculation. This is not a rendered contrast or full WCAG audit.
- **28 original asset/content files** match their existing GitHub blob hashes exactly. The source-native provenance remains `34557847ad424bd0fdac7419b44563737cb499cf`. No original artwork, story text or recordings were regenerated.
- **13 audio files decoded successfully** with FFmpeg, without decode errors; aggregate duration approximately 113.8 seconds. This verifies file integrity, not listening quality, real browser playback or Safari gesture handling.
- `git diff --check` passed. The prior independent v1.2 source review is retained in [INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md); the v1.3 reduction received a focused source/diff review, not a new independent browser audit.
- The new 1200×630 social graphic was visually inspected as an image. That is not a website screenshot review.

## Revision 1.3 reduction check

- Full `npm test` rerun: 38/38 passing, five scripts parse, all six pages pass static checks.
- Tests now exercise discovery selection, recordings and parent choices through the single demo; removed hero controls are no longer test targets. Primary hero action opens Moon, focuses the demo and does not autoplay.
- Motion contract verifies shipped effects are at most 240ms, finite and optional. Cross-page CSS fades are 160ms. No scroll-entry effects remain.
- Homepage source changed from 11 sections / 1,315 main-body words to 5 sections / 569 words. Counts exclude dynamically rendered activity text.
- Original assets, model content and the four deeper information pages are unchanged. A focused source review checked retained anchors, navigation, responsive rules, noindex and removed-handler references.
- No new audio-decode or independent visual pass was necessary for untouched media; earlier integrity evidence remains scoped to those unchanged bytes.

## Defects found and fixed

1. The unfinished hero code contained an extra closing parenthesis, preventing `app.js` from parsing and all runtime tests from running. Repaired before integration; the syntax gate now checks every shipped script.
2. The guide's reused absolute artwork risked overlapping its longer title. Removed from guide markup; original artwork remains in the philosophy and demonstration.
3. Family Setup wording differed across pages. Standardized to unresolved/unverified onboarding; no universal compatibility claim.
4. Paper-art entrance animation discarded the base rotation, risking a snap on completion. Both keyframes retain its rotation.
5. The demo retained two columns at narrow tablet widths and phone selects used small text. Source now stacks at 850px, increases explanatory microcopy and uses 16px phone select values. Rendered acceptance remains outstanding.

## Implemented accessibility and performance provisions

Semantic navigation, skip link, real buttons/selects/details, descriptive labels, visible focus, persistent status regions, complete narration transcripts, user-started audio, finite activities, static content fallback and system/manual reduced motion. Adult primary controls target at least 44px and child demo controls 64px. No moving hit areas, autoplay carousel, endless feed or motion required for task completion.

The site remains buildless HTML/CSS/JavaScript, with no runtime dependency, AI request, database or new paid infrastructure. System fonts create no third-party request. Original media loads on demand; audio preload is none. The prior v1.2 payload was approximately **1.59 MB**, including media, with approximately **33 KB** summed gzip for homepage HTML/CSS/JS/JSON. The v1.3 pass reduces markup/styles/runtime source while leaving media bytes intact; no new transfer measurement is claimed. These are local payload calculations, not measured browser transfer or Core Web Vitals.

## Not verified here

The managed Sites environment did not expose the required `control-browser` capability. Per its workflow, no substitute browser, server or automation was used. **No rendered website screenshots, responsive browser matrix, real iPhone/mobile Safari session, real audio listening, keyboard walkthrough, screen-reader session, live header enforcement, Lighthouse or Core Web Vitals result is claimed.** DOM/Audio doubles do not emulate layout, native focus, accessibility trees or media/network timing.

Also unverified: target-domain availability/TLS/redirects, owner Cloudflare/DNS state, `hello@trustinjr.com` delivery, social-crawler access to the target-domain graphic, actual visitor comprehension/conversion and product learning outcomes. Source metadata pointing to trustinjr.com is launch configuration, not proof that domain is serving this revision.

## Before public launch

1. Inspect desktop and 320/390/680/768/850/1024px layouts, long guide title, tables, text zoom, anchors and sticky header. Confirm no horizontal overflow and visible focus.
2. On actual iPhone Safari, play/pause/resume/replay/retry narration; change pace; choose all three discoveries; change related/unrelated preferences; background/resume; complete all samples and reset.
3. Run keyboard and assistive-technology checks of names, states, announcements, Math feedback, disclosure controls and reduced-motion changes during an active effect.
4. Have an unfamiliar adult identify category/age/device/testing status, hear an answer, change a sample preference and explain what is available today. No child identity collection is needed.
5. Verify authorized Cloudflare setup, custom-domain HTTPS/apex/www/404/redirects, preserved mail records, contact delivery and live headers. Check social preview fetching.
6. Complete app-specific privacy/consent/retention/provider/deletion and compatibility gates before a public child-facing release. These are not completed by this website work.
7. Only after explicit public-launch authorization, revise meta/X-Robots-Tag/robots controls together, verify the public canonical and submit the correct sitemap/Search Console property. Keep the owner-private preview private.

Deployment success and GitHub revision are recorded separately in the project handoff/Master Library; publishing a private review version does not clear these public-launch gates.
