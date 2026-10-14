# TrustinJr website

Parent-facing marketing website, research-informed philosophy whitepaper, and interactive scripted child/parent demo.

## Open the current preview

https://trustin-jr.yomiked.chatgpt.site — owner-private review site. This is separate from the Family Playground and native application.

## Project

- `dist/`: complete portable static website; deploy this directory.
- `docs/WEBSITE_BIBLE.md`: design/content/product-truth decisions and research.
- `docs/DEPLOYMENT.md`: Cloudflare/Namecheap launch setup and current limits.
- `docs/VALIDATION.md`: completed checks and outstanding browser/device verification.
- `tests/`: meaningful demo transition and static integrity checks.

No build, paid SaaS, API keys, database or runtime dependency is required. Run `npm test` with Node and Python 3. For an ordinary local checkout, serve `dist/` using a static server. Use the supported Sites preview workflow in ChatGPT Work rather than starting a separate server there.

## Demo

Three discoveries (Moon, seeds, butterflies), the original narrated story (*Pip and the Patient Seed*), a three-question garden math sample, and a sample Parent Dock. Topic policy changes affect the sample immediately; narration speed changes recorded playback. State is memory-only. The demo does not record a microphone or call an AI provider. No fabricated analytics, waitlist, pricing or App Store release claims.

Revision 1.7 adds touch swiping to the approved Curiosity feature rail, a prominent red no-advertising commitment, and compact native-layout Watch and Parent Dock previews. The Watch has a real Home screen for Ask Trustin, Math and Stories. Its scripted microphone demonstrates listening, thinking stars and two rounds of three follow-up choices. Story/Math add no simulated waiting time. Parent tabs and key sample settings work locally. Both tours keep the device stationary while separate, swipeable descriptions change within a fixed stage; full rationale stays outside the product.

- `docs/MESSAGING.md`: approved mission, copy/CTA hierarchy and claim rules.
- `docs/RESEARCH_DECISIONS.md`: current evidence, populations/limits and ten specialist perspectives.
- `docs/INDEPENDENT_REVIEW.md`: source-based post-implementation critical review.
- `/parents/ai-and-young-children/`: original five-question parent guide.

Current validation: 61 source/model/event-contract tests, 14 shipped script syntax checks and seven-page static integrity. Actual rendering, mobile Safari, screen-reader and performance measurements for this revision remain unverified. The public domain was already launched; see the deployment record.

Original Trustin art and existing Cedar recordings are reused from the owner's native application, source revision `34557847ad424bd0fdac7419b44563737cb499cf`. Original imported media was checked against native source; the Pip narration also matches all seven native timing-file SHA-256 hashes. The native code and release pipeline are separate and unchanged.

## Deployment boundary

The existing public site uses the owner's Cloudflare Pages project, connected to marketing `main`. The earlier public launch also changed contact to `jrtrustin@gmail.com`, enabled public indexing and fixed header overflow. This redesign preserves those changes in its production-source export; it does not change DNS or hosting settings. The managed review Site remains owner-private with noindex. Real-browser acceptance of **this redesign** remains outstanding. See the current launch record in `docs/DEPLOYMENT.md`; do not treat its older preparation notes as current blockers.

## Ownership

Copyright 2026 TrustinJr. All rights reserved. Repository visibility does not grant a general license to the character, recordings, illustrations or website content. Research sources are credited in the bible and whitepaper; no institutional endorsement is implied.
