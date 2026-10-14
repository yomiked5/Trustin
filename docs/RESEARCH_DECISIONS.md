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

## October 13 visual-first refinement (revision 1.4)

Owner reference: [Apple iPhone Duo](https://www.apple.com/iphone-duo/), accessed October 14 UTC / October 13 Pacific. Public structure and hero start/end image resources show a terse product introduction, image-led highlights, device-detail sections and deeper optional explanations. Adopt that hierarchy, not Apple's copyrighted assets, copy, code or product claims. No conversion superiority or full rendered animation inspection is established by this research.

Implementation: a large original-art Watch/iPhone composition; three visual activity panels; one parent-choice consequence; sparse no-advertising commitment; full scripted demo moved to `/demo/`. Homepage main-body text drops from 568 to 267 words by same-method source count. Two collapsed FAQs retain release/AI limitations. Detailed whitepaper and parent guide remain available without a form gate.

[W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) informs system/manual reduced motion, content-visible fallback and cancellation. [MDN animation timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline) was reviewed; this build uses guarded IntersectionObserver and passive, requestAnimationFrame-coalesced scroll updates rather than making newer CSS timeline support a dependency. Reversible offsets affect decorative layers, never hit areas or scroll position. Browser acceptance remains pending.

## October 13 perception-led Curiosity tour (revision 1.5)

Research question: how can parents understand the actual Watch interface with less competing text? The owner requests the native Curiosity screen, a continuous shrink, then a diegetic holographic explanation one item at a time. The primary sources below were retrieved October 14 UTC. Their findings inform this implementation; none tests TrustinJr, preschool AI outcomes, website conversion, or this exact scroll choreography.

| Primary evidence | Finding and limit | Applied design inference |
|---|---|---|
| Harp & Mayer (1998), [How Seductive Details Do Their Damage](https://www.researchgate.net/publication/232595492_How_Seductive_Details_Do_Their_Damage_A_Theory_of_Cognitive_Interest_in_Science_Learning), DOI 10.1037/0022-0663.90.3.414 | In four science-reading experiments, interesting but irrelevant additions reduced main-idea recall and transfer. Highlighting did not reliably repair the effect. This does not mean all captions are harmful. | Remove repeated UI explanations and irrelevant spectacle. Keep the actual interface, functional labels and a purposeful feature visual. |
| Moreno & Mayer (1999), [Cognitive Principles of Multimedia Learning: Modality and Contiguity](https://www.researchgate.net/profile/Richard-Mayer-4/publication/228698670_Cognitive_Principles_of_Multimedia_Learning_The_Role_of_Modality_and_Contiguity/links/57799c7608aead7ba0764344/Cognitive-Principles-of-Multimedia-Learning-The-Role-of-Modality-and-Contiguity.pdf), DOI 10.1037/0022-0663.91.2.358 | Relevant verbal and visual material benefited from proximity in college-student science learning. The spatial comparison does not prove a particular website arrangement. | Place the panel near the Watch and connect it to the corresponding control. The parent need not search a distant paragraph for a matching feature. |
| Mayer & Chandler (2001), [When Learning Is Just a Click Away](https://tecfa.unige.ch/tecfa/teaching/methodo/Mayer_Chandler01.pdf), DOI 10.1037/0022-0663.93.2.390 | Learner-controlled segmentation improved transfer, but not retention, against the specified continuous conditions. This is not a study of scrolling. | Make progression parent-controlled and reversible. Each feature has a stable dwell state and direct revisit button. No timed carousel or forced advance. |
| de Koning et al. (2007), [Attention Cueing as a Means to Enhance Learning from an Animation](https://repub.eur.nl/pub/12095/PSY-2007-005.pdf), DOI 10.1002/acp.1346 | Forty psychology undergraduates viewed a cardiovascular animation. Cueing a process improved comprehension and transfer. Small sample and instructional context limit generalization. | One highlighted region, one connector, one visible feature panel. Cues carry a meaningful relation rather than simply adding contrast everywhere. |
| de Koning et al. (2011), [Attention Cueing: The Role of Presentation Speed](https://research-portal.uu.nl/en/publications/attention-cueing-in-an-instructional-animation-the-role-of-presen/), DOI 10.1016/j.chb.2010.05.010 | This later experiment found equivalent comprehension/transfer across cue and speed conditions; slower groups reported greater effort. Attention capture is not understanding. | Do not call the motion scientifically superior. Keep it brief and assess what parents understand, not how long they watch. |
| Franconeri & Simons (2003), [Moving and Looming Stimuli Capture Attention](https://experts.illinois.edu/en/publications/moving-and-looming-stimuli-capture-attention/), DOI 10.3758/BF03194829 | Translating and looming stimuli received attentional priority in visual search; receding stimuli did not show the same result. Task-specific laboratory evidence. | Reserve change for the current explanation. No looping background, drifting ornaments, bouncing CTA or multiple moving panels. The Watch shrink creates room, not a claim about automatic attention. |
| Rensink, O’Regan & Clark (1997), [To See or Not to See](https://www2.psych.ubc.ca/~rensink/flicker/abs.97.3a.html), DOI 10.1111/j.1467-9280.1997.tb00427.x | Brief interruptions made large scene changes hard to detect; relevant verbal cues aided detection. Flicker experiments differ from uninterrupted websites. | Preserve the same Watch and screen through the transition. Do not simultaneously swap app content and introduce an unrelated panel. |
| Heer & Robertson (2007), [Animated Transitions in Statistical Data Graphics](https://idl.uw.edu/papers/animated-transitions), DOI 10.1109/TVCG.2007.70539 | Two controlled experiments showed task-dependent benefits for transitions. Elaborate staging sometimes increased tracking errors. These were graphics tasks, not marketing tests. | Shrink once, reveal, then hold. Avoid rotations, repeated zooms, morphing content and nested motion sequences. |

### Reconciled decisions

The research does not support a blanket “images beat text” or “animation increases conversion” claim. It supports testable hypotheses: relevant visual content, short nearby explanations, visible relationships, user pacing, continuity and restrained motion. The native screenshot/layout source resolves what to show; perception studies inform how to stage it; accessibility requirements constrain the delivery.

The website's holographic treatment is art direction, not a claim of augmented reality or a native feature. SVG artwork echoes the actual pack/control being explained. There is no fake child endorsement: the owner's example “kid-approved” was not adopted without validation evidence. “Prepared subjects” and the actual native pack illustrations convey the intended idea truthfully.

[W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) covers scroll-triggered scaling and position changes. System reduction and the existing manual motion setting replace the sticky tour with a static screen and manual feature selection. Short landscape screens also use that layout. All content is present in ordinary flow without JavaScript. No autoplay audio or scroll interception is added.

### Next useful validation, not a claim of completed research

On actual phones, ask adult participants to identify the product, choose a prepared subject, explain the microphone, and point to Continue. Then ask what the Parent Dock controls and what is available today. Observe mistaken taps, missed features, reading difficulty and loss of context. Compare an unanimated/manual version if motion appears to interfere. Measure comprehension and ability to finish the task; dwell time alone is not success. No child identity or sensitive data is necessary. Neither these usability sessions nor conversion experiments have been conducted for this revision.

Native source and implementation mapping, current motion states and remaining browser limits are recorded in [WEBSITE_BIBLE.md](WEBSITE_BIBLE.md) and [VALIDATION.md](VALIDATION.md).
