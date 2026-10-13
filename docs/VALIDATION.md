# Validation evidence

12 October 2026. This evidence describes the website, not a native app release.

## Passed

- JavaScript syntax checks for `dist/app.js` and `dist/demo-model.mjs`.
- Four Node tests covering immediate parent-boundary enforcement and reopen behavior, Math rejection/advancement/completion, resets and honest nonduplicated activity logs, and a complete linear story with introduction and ending.
- Static integrity check across five HTML pages: page title/description/single H1, internal links and anchors, image alt text and reserved dimensions, every discovery recording and story text/image/audio reference.
- Website source check confirms no microphone capture, browser TTS substitution, browser persistence or OpenAI API endpoint in the demo runtime.
- All copied original avatar, discovery recordings and story assets matched the Git blob hash in native main `34557847ad424bd0fdac7419b44563737cb499cf` before copying.
- Complete static site payload is approximately 1.37 MB before hosting compression; audio is loaded on demand. This is a payload count, not a measured Core Web Vitals result.

## Design provisions

Responsive 320px+ layouts, semantic native buttons/selects/details, visible focus, skip link, transcript text, user-initiated audio, reduced-motion CSS, finite demo endings, explicit sample labels, reserved media dimensions and on-demand audio are implemented.

## Not verified in this session

The managed Sites environment has no available `control-browser` skill, so its required browser-preview workflow could not run. No substitute browser automation, browser screenshots or Lighthouse scores are claimed. Mobile Safari, keyboard/screen-reader operation, final visual fit, actual audio listening and real-user performance still require acceptance checks.

The Cloudflare account requires sign-in. The `trustinjr.com` custom domain, Namecheap DNS, HTTPS on that domain and `hello@trustinjr.com` delivery are not verified. The private review deployment is recorded separately when complete. No native app build, backend mutation or TestFlight upload was triggered.

## Acceptance pass at domain launch

Check desktop and 320/390/768px mobile layouts; keyboard order and focus; Ask → sample picker → each discovery → finish; change Moon to Together during its narration and confirm audio stops; story introduction → all pages → explicit finish; every Math incorrect/correct/Next path; pace change and pause/replay; reset and reload; contact email; all four main routes; 404; apex/www/TLS. Confirm platform headers do not prevent intended embedding of the private review surface.
