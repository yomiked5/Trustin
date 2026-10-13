# Research and design decisions

October 13, 2026 · Mission-led revision 1.2. Sources inform decisions; they do not endorse TrustinJr or demonstrate its effectiveness. Independent specialist reviews were source-based, not customer research or a rendered-browser audit.

## Current evidence

| Source and scope | Decision and limit |
|---|---|
| [AAP 2026 digital media guidance](https://www.healthychildren.org/English/news/Pages/creating-a-child-friendly-digital-world-AAP-releases-new-media-recommendations.aspx), published Jan 20; distinguishes early childhood 0–5 and replaces prior media statements | Natural endings, user-started sound, no autoplay chain, caregiver participation and no attention-maximizing incentives. Guidance is not approval of this app. |
| [AAP co-viewing guidance](https://downloads.aap.org/AAP/PDF/COE_Co-viewing-screens-with-young-children_tipsheet.pdf) and [transitions guidance](https://downloads.aap.org/AAP/PDF/COE_Help-your-young-child-transition-away-from-screens.pdf), practical early-childhood resources | Put a conversation starter next to the parent's choice and offer one real-world observation at completion. A dashboard alone is not participation. |
| [UNICEF Guidance on AI and Children 3.0](https://www.unicef.org/innocenti/reports/policy-guidance-ai-children), December 2025, and [checklist](https://www.unicef.org/innocenti/media/11996/file/UNICEF-Innocenti-Guidance-on-AI-and-Children-3-Checklist-2025.pdf) | Explicit AI/category disclosure; separate family preferences from mandatory safeguards; transparent uncertainty, privacy and accountability. Friendly art must not imply a human relationship. This is child-rights guidance, not a preschool outcome study. |
| [Common Sense Census: Zero to Eight, 2025](https://www.commonsensemedia.org/sites/default/files/research/report/2025-common-sense-census-web-2.pdf): probability survey of 1,578 U.S. parents; fielded Aug 5–29, 2024 | Supports taking both opportunity and concern seriously. Parent reports and age bands 2–4 / 5–8 are not a distinct age-4–5 study or objective learning results. No AI-use statistic is used as a conversion claim. |
| [Common Sense Generation AI, March 2026](https://www.commonsensemedia.org/sites/default/files/research/report/commonsensemedia_generationai.pdf): November 2025 parent/youth attitude surveys; youth ages 12–17, broad parent sample | Reviewed for context and excluded as preschool proof. Teen findings cannot support preschool demand or efficacy claims. |
| [Skene et al., 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9545698/): guided-play review, 39 studies, 17 meta-analyzed, ages 1–8; computer-guided studies excluded | Use agency/support as design questions. Do not transfer reported effects to AI-guided learning. Retain actual Math retries and a written scaffolding example. |
| [Google Search Central: people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | One practical original parent guide, descriptive routes/metadata and meaningful internal links. No mass keyword pages, fabricated reviewers or ranking guarantees. |
| [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing) | Preserve private access plus preview noindex controls. Robots disallow is not privacy and may prevent a crawler from seeing noindex; authentication is the access boundary. Public-domain indexing is a separate authorized launch step. |
| [WAI target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Native controls and generous 44px adult/64px child targets, persistent labels, keyboard focus, no moving hit areas. Project target sizes exceed the WCAG minimum; implementation does not certify conformance. |
| [FTC current COPPA plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business) | Precise website notice; no badge. Native public launch requires its own verified data, consent, retention, provider and deletion work. This site redesign does not establish legal compliance. |

Existing foundational learning references and comparable-product observations are retained in the website bible and whitepaper. The current review refreshed required AAP/UNICEF/Common Sense material; it did not repeat a full competitive visual audit.

## Ten perspectives, reconciled

| Perspective | Independent finding | Implemented decision |
|---|---|---|
| Brand/storytelling | Previous category understated the AI mission; parent role was too narrow | Explicit AI discovery category, approved emotional lines, aspiration-first promise order |
| Parent-audience research | Interest and concern coexist; preschool context matters | Show opportunity then inspectable guidance; no fear, guilt or race to adopt AI |
| Conversion/growth | The correct conversion is informed evaluation during testing | Preview first; clear availability next; no fake signup/download |
| Information architecture/UX | Product should precede manifesto; parent choice needs immediate consequence | Early paired demo, inline result in Dock, deeper pages later |
| Visual/art direction | Original tactile art/cream/serif are assets; small text and crowded tablet columns weaken usability | Preserve art, refine editorial promise row/section rhythm, raise microcopy, stack demo at 850px |
| Motion/interaction | Existing one-shot enhancement is appropriate; paper rotation snapped | Preserve static fallback, reduced/manual motion and native transitions; repair transform; keep controls stationary |
| Early-childhood learning | Answer delivery alone is not scaffolding or measured understanding | Math attempt/hint retained; parent conversation starters and real-world endings; clear outcome limits |
| Privacy/safety/transparency | Sample controls cannot prove native enforcement; activity visibility is incomplete | Explicit current-state table, mandatory vs family-choice distinction, website/native privacy separation |
| Technical SEO/content | Clear search intent needs one useful resource and honest sharing metadata | Original parent guide, exact canonical/sitemap routes, branded social image, noindex retained |
| Engineering/accessibility/quality | Existing unfinished hero had a blocking JS syntax error; new motion lacked coverage | Repair syntax, test shipped JS, expand interaction/motion/static gates; disclose browser limits |

## Tradeoffs resolved

- **Wonder and clarity:** the hero is interactive, but no automatic carousel or narration competes with reading.
- **Parental confidence and truth:** show a real scripted preference effect; put native status on availability rather than imply comprehensive controls have shipped.
- **Craft and cost:** retain static architecture, local fonts, original assets and recordings. No new AI calls, paid infrastructure, database or analytics.
- **SEO and privacy:** build semantic useful content now; preserve private access/noindex and defer public acquisition measurement.
- **Brevity and evidence:** homepage introduces the product; parent guide offers practical questions; whitepaper holds deeper principles and source limitations.

The post-implementation critique and material fixes are in [INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md). Executed checks and unresolved acceptance work are in [VALIDATION.md](VALIDATION.md).
