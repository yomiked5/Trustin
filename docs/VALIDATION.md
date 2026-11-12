# Validation evidence

Revision 1.10 · November 11, 2026 (Pacific), verification continued November 12 UTC. Owner-private review, subsequently approved for public publication on November 11.

## Current revision

- Native reference: `bccac84beb343a9f410af376669a9b316652aaae`; source and simulator screenshots inspected. See [Native demo parity](NATIVE_DEMO_PARITY.md).
- `npm test`: 73 automated tests, 14 source scripts, 22 coherent release dependencies, seven-page integrity and privacy API scan pass.
- New functional coverage: five-job beginner Math, pending starting-point changes, number entry/keypad, in-page word help/return, duplicate and unaffordable Star purchases, try-on versus explicit spend/wear, child-isolated parent settings, draft/save and optional rewards.
- Rendered in the supported Chromium preview at desktop and 390×780 mobile viewport frames. Observed working Home navigation, original Curiosity, compact word help/meaning, Stars try-on/confirmation/wearing, Parent search/story detail, and a fixed Parent device before/after chapter changes and disclosure expansion.
- Mobile Parent device bounds remained exactly `{x:16,y:262.75,width:132.390625,height:286.5}` during the verified switch/disclosure. The Watch uses `overflow:clip` at its shell: a browser focus scroll cannot move the clock. The meaning body fit its measured viewport after this fix.
- Screenshots in `docs/evidence/2026-11-11/` are actual browser captures of this web preview. The mobile capture uses viewport-sized iframes, not a physical iPhone or Safari.
- Physical iPhone/Safari touch feel, VoiceOver and device audio listening remain owner acceptance. Pointer intent and inside/outside isolation have automated contracts; browser checks are not a claim of hardware testing.
- Native app/backend/release are unchanged. The owner subsequently approved this reviewed version for `trustinjr.com` with “Looks great, publish.” This export retains the public indexing profile; live delivery evidence is recorded separately from browser QA.

## Historical October 14 evidence

The following records describe the earlier revision and its then-current verification boundary, not the current native source or review status.

## Observed regression

The owner’s two 23:59 screenshots show v1.7 markup with legacy styles and the legacy “Let’s try that again” runtime error. Live HTTP inspection returned current script/style bytes with `Cache-Control: public, max-age=14400, must-revalidate`; HTML used `max-age=0`. This strongly supports a returning-visitor mixed-version cache failure. The old source tests did not exercise that delivery path. V1.7 was not visually accepted.

## Executed checks

- `npm test`: **65 Node tests**, syntax validation of **14 source JS/MJS files**, byte validation of **22 release dependencies**, static integrity across **7 HTML routes**.
- The first two approved homepage sections’ HTML remains unchanged. Curiosity’s rail and full explanation card share touch swiping and selected-state feedback; its source artwork and composition are preserved. The existing controller test covers both surfaces, backward/forward navigation, boundary clamping, manual mode and normal scroll-driven selection.
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

## Privacy copy revision

The red-shield section adds three short commitments and native HTML disclosures for scaffolding and privacy standards. The privacy page now separates native-app commitments and verification gaps from actual website behavior; philosophy, parent guide, availability, parent-tour context and all footer links are aligned. No device geometry, gesture controller, live microphone, account or analytics implementation changes.

Claims were checked against the native privacy evidence worksheet and Watch manifest at `34557847ad424bd0fdac7419b44563737cb499cf`, and current official OpenAI/FTC/California guidance. The source does not establish zero audio retention or full compliance; neither is claimed. Existing release and static checks are reused for the stylesheet/HTML update. No additional implementation-mirroring tests were added for this copy change. Browser/device acceptance remains subject to the verification boundary above.
