# Deployment and domain handoff

Updated 13 October 2026 · mission-led revision 1.2. Production target: `https://trustinjr.com`.

## Current state

The original marketing Site is retained at `https://trustin-jr.yomiked.chatgpt.site`, with its owner-private audience. The independent static website lives in `dist/`. The prior July scaffold is preserved in Git history. The native app and Family Playground remain separate.

Cloudflare dashboard was reached in the current session and requires sign-in. No Cloudflare account configuration, Namecheap nameserver changes or DNS writes have been performed. `trustinjr.com` ownership is owner-reported; current zone and email records have not been audited. Do not claim the public custom domain is connected.

The existing starter-only `yomiked5/Trustin` repository is used as the independent public marketing source, avoiding a native-app deployment dependency. Do not add secrets to this repository. The private preview's `.openai` identity is excluded from the GitHub export.

## Cloudflare Pages configuration

1. In the owner's Cloudflare account, create a Pages project connected to GitHub `yomiked5/Trustin`. Restrict the Cloudflare GitHub app to this repository rather than all private repositories.
2. Production branch: `main`. Framework preset: None. Build command: blank (or `exit 0` if the interface requires one). Build output directory: `dist`. Repository root: `/`. No environment variables or secrets are required. Do not add a GitHub Actions deployment workflow.
3. Deploy the exact source commit and record the actual returned `pages.dev` URL. Check the home page, `/philosophy/`, `/privacy/`, `/availability/`, `/404.html`, audio files and custom 404 behavior.
4. Add `trustinjr.com` in Pages → Custom domains. Use the exact zone instructions and DNS values returned by Cloudflare; never guess a Pages target or nameservers.
5. If moving apex nameservers from Namecheap to Cloudflare, inventory all existing records first: A/AAAA/CNAME, MX, SPF, DKIM, DMARC, verification TXT, CAA and relevant subdomains. Recreate them in Cloudflare, then change only the authoritative nameservers at Namecheap. Keep registrar renewal/ownership at Namecheap. Do not lose `hello@trustinjr.com` email routing.
6. Add `www.trustinjr.com` and choose one canonical origin. Configure `www` → apex and `pages.dev` → canonical redirects only after the canonical origin serves successfully; do not create redirect loops.
7. Verify issued TLS, apex and www behavior, all static routes, recordings and email delivery. Confirm parent inquiry email reaches the owner; the current CTA intentionally opens an email client rather than faking a form submission.

## Public-launch source changes

- Replace `<meta name="robots" content="noindex,nofollow">` on normal pages with `index,follow`. Keep the 404 page noindex.
- Replace `robots.txt` with `User-agent: *`, `Allow: /`, and `Sitemap: https://trustinjr.com/sitemap.xml`.
- Canonical/OG URLs already point to the intended domain. Do not advertise that domain as live until it is verified. The OG artwork reuses the existing story cover.
- Verify legal/operator contact details and website privacy wording against the selected host and operational practice. The native app needs its own separate privacy and release work.
- Run mobile Safari and desktop keyboard acceptance, including a 320px viewport and reduced motion. Verify pause/replay, full story ending, every Math retry, immediate topic-boundary behavior, and reset.

## Updates and rollback

Edit `dist/` and relevant docs, run `npm test`, commit/push to GitHub, and let Pages deploy the branch. No install or framework build is needed. Roll back to a known-good Pages deployment or revert the Git commit. Reconcile the private review Site only when a preview update is useful; do not operate two competing production sources.

## Cost and privacy

Static delivery, local demo state and existing narration avoid per-visitor AI cost. There is no database, email SaaS subscription, analytics pixel or third-party font. Hosting usage and plan limits still apply; this is not an unlimited-free-service promise. Logs are handled by the hosting provider, so do not claim zero data processing.

Official setup references: [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).


## Revision 1.2 handoff

This revision retains the existing owner-private review Site. Source includes six pages, the improved scripted child/parent demonstration, original media, a parent guide and a dedicated 1200×630 social card. GitHub PR delivery does not change DNS, production Cloudflare, the native application or public indexing.

Before public launch, change **all three** preview controls deliberately: HTML robots metadata, `_headers` X-Robots-Tag and `robots.txt`. Test live behavior after deployment; source files alone do not prove header enforcement. Private authentication/access policy is the privacy boundary, not noindex. `trustinjr.com` canonical and social URLs remain target-domain configuration until domain verification.

Review [validation](VALIDATION.md), [independent critique](INDEPENDENT_REVIEW.md), [research decisions](RESEARCH_DECISIONS.md) and [messaging rules](MESSAGING.md). Actual browser/Safari and contact-delivery acceptance are still required. For rollback, retain the prior successful private deployment/source `77c93af0447832dd37ca7c130f9f05090318ef58` and GitHub main `64593cd541add1ddcb476c03df7056056eb660fe`; do not use a rollback to change the audience.
