# Deployment and domain handoff

## Compact interactive exhibits — revision 1.7

Public baseline / rollback source: `6d5bfcc55d69564f7a073bc58fc7708de73f8d47`. The GitHub → Cloudflare Pages route remains unchanged. This revision adds touch swiping, the red no-advertising commitment, native-layout Watch Home and scripted microphone, original Pip media, and functional fixed-geometry Parent Dock chapters. Private review remains owner-only/noindex; production retains public indexing, contact, sitemap and preview/404 rules.

The tested source passes 61 behavior tests, syntax validation for 14 scripts, seven-page integrity and media/timing hashes. Exact source/deployment receipts are recorded in the project handoff. Rendered iPhone/Safari acceptance remains outstanding; publication does not establish it. No DNS, hosting plan, account, native source or release pipeline is changed. Prior records below are historical, with their own evidence boundaries.

## Parent Dock and full-site redesign — revision 1.6

Public baseline: marketing main `83e889c382f2ccbb4861ff55a9197d458a6714aa`. The existing GitHub → Cloudflare Pages deployment remains the production route. Revision 1.6 preserves the first two approved homepage sections, adds the source-based iPhone tour, and redesigns all deeper pages. The private review stays owner-only/noindex; the public export keeps public indexing, sitemap, contact and preview/404 header rules.

No DNS, hosting-account, native-release or paid-infrastructure change is needed. Both export profiles run the same 62 behavior tests and static checks. Exact publication receipts belong to the project handoff. A successful deployment is not a rendered browser/device acceptance result; see `VALIDATION.md`. Older launch and redesign evidence below is historical and does not verify v1.6’s layout.

## Visual-first redesign — revision 1.4

The public baseline was inspected at marketing main `2f33e2bb5253e367e0d3d434659a2f06a3982f2b`. Its contact, desktop-overflow correction, public index/follow metadata, robots and Pages-preview/404 noindex rules are preserved in the redesign's GitHub export. The full demo moves to `/demo/`. No DNS, hosting account, paid plan or sharing settings change.

The managed owner-private review Site keeps all-page noindex and Disallow; the production repository keeps its existing public indexing profile. These are intentional environment-specific differences, not a launch rollback. Source and event-contract tests cover the new design, but earlier Chrome verification below does not verify the new layout/motion. Real-browser and device acceptance remains outstanding for v1.4.

## Current launch record — 13 October 2026

This section supersedes the historical preparation notes below.

- Production: https://trustinjr.com on the owner's Cloudflare Pages **Free** plan, project `trustinjr`, source `yomiked5/Trustin`, branch `main`, no build command, output `dist`, no environment secrets.
- PR #1 was merged as `1526fffc4be5d006a2459fd4c36c78e09978024c`. The approved desktop overflow fix is `58a4d651291a8f576288105035df386701f7dc9a`.
- Namecheap remains the registrar. Authoritative DNS is `courtney.ns.cloudflare.com` and `hunts.ns.cloudflare.com`; the prior pair was `dns1.registrar-servers.com` and `dns2.registrar-servers.com`. DNSSEC was off before cutover.
- The existing MX records were preserved: `smtp.google.com` priority 1 and `alt1.aspmx.l.google.com` priority 5, DNS only. No SPF, DKIM, DMARC, verification TXT or CAA was present in the original provider inventory.
- Apex and www CNAME records point to the actual project target `trustinjr.pages.dev`. The former apex website target was `tj1-env.eba-bwbwbjnj.us-west-2.elasticbeanstalk.com`; Namecheap's old www redirect was replaced.
- Apex HTTPS serves the revised v1.3 website. HTTP upgrades to HTTPS. The Cloudflare rule `TrustinJr www to canonical HTTPS` redirects www to the apex with path and query preserved (301).
- The owner confirmed `hello@trustinjr.com` does not work and supplied **jrtrustin@gmail.com** for the public inquiry address. No mailbox was purchased, no existing MX was changed for this contact update, and no test message was sent.
- PR #2 switches the five public content pages to `index,follow`, enables public robots.txt and its canonical sitemap, and keeps 404 plus both Pages hostname patterns `noindex,nofollow` through `_headers`. The private review Site retains its existing access and noindex settings.
- Validation: all 38 behavior tests, JavaScript syntax and static-site checks passed; the staged GitHub files matched the tested local files. Chrome demo boundaries, all math retries, story ending, narration pause/resume, reset, narrow layouts and desktop overflow were checked. Public apex HTTPS, HTTP upgrades, www path/query redirects and preview `X-Robots-Tag` were verified before the indexing release. Physical-device Safari and screen-reader acceptance remain unverified.
- On Windows, run the Python check with UTF-8 enabled: `python -X utf8 tests/check_site.py`.
- The native app, private Site audience and paid plans were not changed.

For updates, edit this repository and let Pages deploy `main`. For rollback, use a known-good Pages deployment or revert the relevant Git commit. Do not blindly restore the old nameservers after launch: compare current email records first.

## Historical preparation notes (superseded by the launch record)

Updated 13 October 2026 · simplified revision 1.3. Production target: `https://trustinjr.com`.

## Current state

The original marketing Site is retained at `https://trustin-jr.yomiked.chatgpt.site`, with its owner-private audience. The independent static website lives in `dist/`. The prior July scaffold is preserved in Git history. The native app and Family Playground remain separate.

In the earlier setup session, the Cloudflare dashboard required sign-in; authenticated owner access has not yet been established for this launch. No Cloudflare account configuration, Namecheap nameserver changes or DNS writes have been performed. `trustinjr.com` ownership is owner-reported; current zone and email records have not been audited. Do not claim the public custom domain is connected.

`yomiked5/Trustin` is the independent marketing source repository, avoiding a native-app deployment dependency. Do not add secrets to this repository. The private preview's `.openai` identity is excluded from the GitHub export.

## Cloudflare Pages configuration

1. In the owner's Cloudflare account, create a Pages project connected to GitHub `yomiked5/Trustin`. Restrict the Cloudflare GitHub app to this repository rather than all private repositories.
2. Merge the reviewed website PR into `main` first; at the last verified checkpoint main still held v1.1. Production branch: `main`. Framework preset: None. Build command: blank (or `exit 0` if the interface requires one). Build output directory: `dist`. Repository root: `/`. No environment variables or secrets are required. Do not add a GitHub Actions deployment workflow.
3. Deploy the exact source commit and record the actual returned `pages.dev` URL. Check the home page, `/philosophy/`, `/privacy/`, `/availability/`, `/parents/ai-and-young-children/`, `/404.html`, audio files and custom 404 behavior.
4. Add `trustinjr.com` in Pages → Custom domains. Use the exact zone instructions and DNS values returned by Cloudflare; never guess a Pages target or nameservers.
5. For a Pages apex domain, Cloudflare requires the zone and its authoritative nameservers in the same Cloudflare account as Pages. If the current DNS is elsewhere, inventory all existing records first: A/AAAA/CNAME, MX, SPF, DKIM, DMARC, verification TXT, CAA and relevant subdomains. Recreate them in Cloudflare, then change only the authoritative nameservers at Namecheap. Keep registrar renewal/ownership at Namecheap. Do not lose `hello@trustinjr.com` email routing.
6. Add `www.trustinjr.com` and choose one canonical origin. Configure `www` → apex and `pages.dev` → canonical redirects only after the canonical origin serves successfully; do not create redirect loops.
7. Verify issued TLS, apex and www behavior, all static routes, recordings and email delivery. Confirm parent inquiry email reaches the owner; the current CTA intentionally opens an email client rather than faking a form submission.

## Public-launch source changes

- Replace `<meta name="robots" content="noindex,nofollow">` on normal pages with `index,follow`. Keep the 404 page noindex.
- Replace `robots.txt` with `User-agent: *`, `Allow: /`, and `Sitemap: https://trustinjr.com/sitemap.xml`.
- Canonical/OG URLs already point to the intended domain. Do not advertise that domain as live until it is verified. The OG graphic is the dedicated original-character 1200×630 social card.
- Verify legal/operator contact details and website privacy wording against the selected host and operational practice. The native app needs its own separate privacy and release work.
- Run mobile Safari and desktop keyboard acceptance, including a 320px viewport and reduced motion. Verify pause/replay, full story ending, every Math retry, immediate topic-boundary behavior, and reset.

## Updates and rollback

Edit `dist/` and relevant docs, run `npm test`, commit/push to GitHub, and let Pages deploy the branch. No install or framework build is needed. Roll back to a known-good Pages deployment or revert the Git commit. Reconcile the private review Site only when a preview update is useful; do not operate two competing production sources.

## Cost and privacy

Static delivery, local demo state and existing narration avoid per-visitor AI cost. There is no database, email SaaS subscription, analytics pixel or third-party font. Hosting usage and plan limits still apply; this is not an unlimited-free-service promise. Logs are handled by the hosting provider, so do not claim zero data processing.

Official setup references: [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).


## Current handoff

This revision retains the existing owner-private review Site. Source includes six pages, the improved scripted child/parent demonstration, original media, a parent guide and a dedicated 1200×630 social card. GitHub PR delivery does not change DNS, production Cloudflare, the native application or public indexing.

Before public launch, change **all three** preview controls deliberately: HTML robots metadata, `_headers` X-Robots-Tag and `robots.txt`. Test live behavior after deployment; source files alone do not prove header enforcement. Private authentication/access policy is the privacy boundary, not noindex. `trustinjr.com` canonical and social URLs remain target-domain configuration until domain verification.

Review [validation](VALIDATION.md), [independent critique](INDEPENDENT_REVIEW.md), [research decisions](RESEARCH_DECISIONS.md) and [messaging rules](MESSAGING.md). Actual browser/Safari and contact-delivery acceptance are still required. For rollback to v1.2, retain Sites source `4e637df93a1833538cb839ecb6047b0b9a369f8a` and marketing commit `bc738e2d2cc92c1cc0e02e9aafa503605599c636`; do not use a rollback to change the audience.

## October 13 domain clarification

The chosen route remains GitHub → owner Cloudflare Pages → trustinjr.com. Registration/renewal stays at Namecheap; no registrar transfer or application backend is needed for this static website. Account sign-in and authorization to change authoritative DNS are the owner-dependent steps. This follow-up explains the cutover and publishes only the existing private preview; it does not authorize or perform public launch.

Before changing nameservers, inventory and reproduce the actual DNS records, especially email, verification and DNSSEC settings. Coordinate any existing DNSSEC/DS record with the actual providers rather than guessing. Save rollback values. Then attach apex/www in Pages using its returned records, verify TLS and redirects, exercise the demo and contact delivery, and remove public indexing blocks only on explicit launch authorization. Nameserver propagation is not instantaneous; allow for provider/ISP caching.

Verified official references: [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Namecheap nameserver changes](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/). No actual DNS inventory or account state was inferred from these general instructions.
