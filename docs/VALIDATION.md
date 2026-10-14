# Validation evidence

Revision 1.8 · October 14, 2026 (Pacific). Marketing website and scripted demo only.

## Observed regression

The owner’s two 23:59 screenshots show v1.7 markup with legacy styles and the legacy “Let’s try that again” runtime error. Live HTTP inspection returned current script/style bytes with `Cache-Control: public, max-age=14400, must-revalidate`; HTML used `max-age=0`. This strongly supports a returning-visitor mixed-version cache failure. The old source tests did not exercise that delivery path. V1.7 was not visually accepted.

## Executed checks

- `npm test`: **65 Node tests**, syntax validation of **14 source JS/MJS files**, byte validation of **22 release dependencies**, static integrity across **7 HTML routes**.
- The first two approved homepage sections’ HTML remains unchanged. Curiosity’s rail deliberately gains touch swiping and selected-state feedback; its source artwork and composition are preserved.
- New release tests simulate an old browser cache, follow the transitive module URL, verify CSS changes invalidate the complete release, retain old open-document dependencies, reject missing/unversioned imports, and confirm the Parent phone plus first explanation are laid out before JavaScript.
- Gesture tests cover left/right intent, click suppression, vertical scrolling, cancellation, taps, mouse input, and exclusion of device/form interactions. The actual homepage and Parent controllers execute swipe handling with DOM doubles.
- Watch runtime tests execute shipped code for Curiosity, live Home, internal activity selection, the finite microphone/stars sequence, two three-choice rounds and return, cancellation, links, recorded audio retry/pause/resume, stale promises, sample policy, Math retries, Pip completion, reading pace, word timings and reset.
- Seed/butterfly completion returns to Curiosity without unrelated Moon follow-ups.
- Parent controller checks cover the single-panel fixed-stage state, bounded chapter navigation, local native tabs/focus, child/date examples, Together rationale, activity detail/confirmed local deletion, essential-protection separation, topic/style preferences, reading pace/sample and illustrative setup.
- Existing motion, state and editorial checks remain. Seven-page checks validate titles/descriptions, H1s, anchors, local assets, SVGs, image dimensions, social/canonical URLs and sitemap. Private and public indexing profiles are checked separately.
- Both original story collections have complete referenced media. Audio SHA-256 matches timing metadata and readable text matches the cue text; all seven imported Pip recordings match their native hashes.
- The 13 established core text-color pairs exceed 4.5:1 by calculation; this does not audit every rendered composite surface.
- `git diff --check` passes before packaging. No runtime dependency, provider, microphone, account, tracking or persistent browser storage was introduced.

## Native source grounding

Native main remains `34557847ad424bd0fdac7419b44563737cb499cf`. Watch app, Curiosity, Ask reader, story, Math and motion source were read alongside current Parent/setup/reading/Watch-face source. October 8 native screen contact sheets and the retained Parent setup reference were inspected.

The Watch uses compact 184:224 proportions and native layout hierarchy. Its original Pip media is copied unchanged. The Parent phone retains 390:844 proportions, source-based tabs and relevant sample screens. These are functional web recreations with prepared examples, not claims of pixel-identical native runtime, physical-device acceptance, a backend rollout or a release.

## Verification boundary

**Rendered browser/device acceptance remains incomplete.** The supported control-browser capability is absent in the managed environment. No alternate browser automation, preview server, browser installation or substitute screenshot renderer was used.

Source/DOM/Audio/geometry checks do not establish actual Safari fit, sticky behavior, connector alignment, touch feel, accessibility tree, screen-reader use, playback or Core Web Vitals. Earlier visual evidence from older revisions does not validate this revision.

## Next useful visual pass

At 320/390px portrait, short landscape and 1024/1440px desktop: confirm the Watch and its explanation fit together; swipe the surrounding stage without affecting in-device controls; switch all Parent chapters and expand rationale without moving the phone; use skip links and reverse scroll. Check motion-off, 200% text zoom, keyboard and screen reader.

On real iPhone Safari, test microphone simulation, Home, discoveries, Pip and Math endings, guidance, narration, pace, backgrounding and reset. Ask an unfamiliar adult which elements are product UI versus website explanation and what a sample setting actually changes.

`scripts/check-live-release.py` verifies all page/release bytes, MIME types and cache policy directly on production after publication; results belong to the handoff. The first public run correctly rejected Cloudflare’s email rewriting and remaining four-hour root-asset TTL; the immutable Pages origin was unaffected. Header repair adds `no-transform` on HTML and `no-store` on mutable root files. This HTTP check is not rendering or browser interaction.

Publication receipts verify deployment, not visual acceptance. Existing public indexing, contact, hosting and DNS remain unchanged. Native privacy, consent, retention, deletion and device compatibility remain separate release responsibilities.
