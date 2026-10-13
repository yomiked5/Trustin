# Validation evidence

Revision 1.2 · October 13, 2026. These results concern the marketing website and scripted browser demonstration, not a native app release.

## Executed and passed

- `npm test`: syntax validation of all **5 shipped JS/MJS files**, **38 Node tests**, and static integrity across **6 HTML pages**. No skipped or failing tests at the final integration checkpoint.
- **13 model tests:** family preference behavior, affected/unrelated activities, independent progress, finite Math completion, required correct answers, per-activity restart, full reset, honest deduplicated logs, invalid actions, playback labels and complete linear story.
- **16 runtime event-contract tests:** execute shipped `app.js` with small DOM/Audio doubles. Cover prepared initial answer without autoplay; narration pause/resume/replay/retry/progress; affected audio cancellation; hero/Dock/child synchronization; explicit Hear focus; unrelated story audio; retained story position; Math hints/focus; story restart; stale audio rejections; failed-content retry; hero topic-to-recording routing; hero choice toggle; context-specific parent prompts; pace changes and full reset.
- **9 motion tests:** unsupported/disabled/static behavior; replacement and cancellation; stale-animation completion; finite effects/no persistent fill; bounded reading progress; device reduced-motion changes; manual choice through URL and internal links; no storage/network use by policy; navigation transition suppression and history failure fallback.
- Static checks: every page title/description/single H1, unique IDs, local links/anchors, SVG symbols, reserved image dimensions, discovery/story text/image/audio references, exact canonical/OG URLs, preview meta/header/robots noindex, sitemap route set and social image presence/1200×630 metadata.
- All shipped scripts scanned for a narrow set of microphone, live-AI, browser-storage, browser-TTS and cookie APIs. No advertising/analytics/third-party font code is introduced. This is a source check, not network observation of the hosting/authentication platform.
- **9 core text-palette pairs** exceed 4.5:1 by luminance calculation. This is not a rendered contrast or full WCAG audit.
- **28 original asset/content files** match their existing GitHub blob hashes exactly. The source-native provenance remains `34557847ad424bd0fdac7419b44563737cb499cf`. No original artwork, story text or recordings were regenerated.
- **13 audio files decoded successfully** with FFmpeg, without decode errors; aggregate duration approximately 113.8 seconds. This verifies file integrity, not listening quality, real browser playback or Safari gesture handling.
- `git diff --check` passed. Independent source/automated review passed for continued private-preview evaluation; [full review](INDEPENDENT_REVIEW.md) identifies the boundary.
- The new 1200×630 social graphic was visually inspected as an image. That is not a website screenshot review.

## Defects found and fixed

1. The unfinished hero code contained an extra closing parenthesis, preventing `app.js` from parsing and all runtime tests from running. Repaired before integration; the syntax gate now checks every shipped script.
2. The guide's reused absolute artwork risked overlapping its longer title. Removed from guide markup; original artwork remains in the philosophy and demonstration.
3. Family Setup wording differed across pages. Standardized to unresolved/unverified onboarding; no universal compatibility claim.
4. Paper-art entrance animation discarded the base rotation, risking a snap on completion. Both keyframes retain its rotation.
5. The demo retained two columns at narrow tablet widths and phone selects used small text. Source now stacks at 850px, increases explanatory microcopy and uses 16px phone select values. Rendered acceptance remains outstanding.

## Implemented accessibility and performance provisions

Semantic navigation, skip link, real buttons/selects/details, descriptive labels, visible focus, persistent status regions, complete narration transcripts, user-started audio, finite activities, static content fallback and system/manual reduced motion. Adult primary controls target at least 44px and child demo controls 64px. No moving hit areas, autoplay carousel, endless feed or motion required for task completion.

The site remains buildless HTML/CSS/JavaScript, with no runtime dependency, AI request, database or new paid infrastructure. System fonts create no third-party request. Original media loads on demand; audio preload is none. Static payload at the checked source was approximately **1.59 MB**, including all audio and the share image. Summed gzip size of homepage HTML/CSS/JS/JSON was approximately **33 KB**, excluding images/headers/hosting behavior. These are local payload calculations, not measured browser transfer or Core Web Vitals.

## Not verified here

The managed Sites environment did not expose the required `control-browser` capability. Per its workflow, no substitute browser, server or automation was used. **No rendered website screenshots, responsive browser matrix, real iPhone/mobile Safari session, real audio listening, keyboard walkthrough, screen-reader session, live header enforcement, Lighthouse or Core Web Vitals result is claimed.** DOM/Audio doubles do not emulate layout, native focus, accessibility trees or media/network timing.

Also unverified: target-domain availability/TLS/redirects, owner Cloudflare/DNS state, `hello@trustinjr.com` delivery, social-crawler access to the target-domain graphic, actual visitor comprehension/conversion and product learning outcomes. Source metadata pointing to trustinjr.com is launch configuration, not proof that domain is serving this revision.

## Before public launch

1. Inspect desktop and 320/390/680/768/850/1024px layouts, long guide title, tables, text zoom, anchors and sticky header. Confirm no horizontal overflow and visible focus.
2. On actual iPhone Safari, play/pause/resume/replay/retry narration; change pace; choose all hero topics; change related/unrelated preferences; background/resume; complete all samples and reset.
3. Run keyboard and assistive-technology checks of names, states, announcements, Math feedback, disclosure controls and reduced-motion changes during an active effect.
4. Have an unfamiliar adult identify category/age/device/testing status, hear an answer, change a sample preference and explain what is available today. No child identity collection is needed.
5. Verify authorized Cloudflare setup, custom-domain HTTPS/apex/www/404/redirects, preserved mail records, contact delivery and live headers. Check social preview fetching.
6. Complete app-specific privacy/consent/retention/provider/deletion and compatibility gates before a public child-facing release. These are not completed by this website work.
7. Only after explicit public-launch authorization, revise meta/X-Robots-Tag/robots controls together, verify the public canonical and submit the correct sitemap/Search Console property. Keep the owner-private preview private.

Deployment success and GitHub revision are recorded separately in the project handoff/Master Library; publishing a private review version does not clear these public-launch gates.
