# Privacy claims and release evidence

Reviewed October 14, 2026. Website messaging only; not a completed legal assessment or native-app privacy policy.

## The requested commitment

Children’s transcripts and activity should serve parent reports and useful learning support. No child advertising, sponsored answers, purchase pressure, sale of child information, commercial profiling, or use of learning records for our marketing/business analytics. The intended voice policy is to discard input recordings after transcription. These are owner-directed commitments, not verified claims about every deployed provider.

## What the evidence supports

| Subject | Evidence and permitted message |
| --- | --- |
| Website preview | Scripted examples; no live microphone/AI/child account. Demo state stays in page memory. Website code has no analytics or ad trackers. Hosting can process IP/request/technical information. |
| Transcripts and activity | Native source includes saved learning/activity information. These are data, so never say “we collect no data.” Reports do not cover every offline experience. |
| Other native data | Account/profile/device/service data also exist. Do not describe transcripts and activity as the app’s only data categories. |
| Voice | Watch privacy manifest declares linked audio data for app functionality. Native source sends requests off-device. Discarding audio after transcription is a release goal; provider retention has not been verified. |
| Tracking | Native manifests declare no tracking and no tracking domains. This is not evidence of a complete runtime/provider audit. |
| Compliance | OpenAI under-18 requirements, COPPA and applicable state privacy laws are release standards. No completed compliance assessment, certification or OpenAI endorsement is claimed. |

Native evidence: `yomiked5/trustinjr-native` at `34557847ad424bd0fdac7419b44563737cb499cf`, especially `AppStore/PRIVACY_FACTS.md`, `Apps/Watch/PrivacyInfo.xcprivacy` and `Packages/TrustinCore/Sources/TrustinCore/NativeLearningClient.swift`. The worksheet explicitly leaves consent, providers, retention and deletion unresolved; it is not a published policy. Source presence does not establish deployment or physical-device verification.

## What must be verified before stronger claims

- OpenAI approval and effective Zero Data Retention configuration for the relevant organization/project, endpoints and features before processing children’s personal data where its under-18 guidance requires it. `store:false` or no model training is not evidence of ZDR approval.
- Actual audio capture, transmission, processors, logs, storage, retention and deletion, including provider-side handling.
- Applicable federal/state obligations, required notices and verifiable parental consent; a microphone permission prompt or website demo control is not proof of these.
- Parent review, consent withdrawal and deletion, retention periods, full-account/provider deletion coverage, and service/security records.
- Final app privacy notice and platform declarations consistent with verified practices.

No backend/provider/native changes were made for this website task.

## Official references

- [OpenAI under-18 guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance): additional safeguards and ZDR before specified child personal-data processing.
- [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data): approval/configuration and endpoint/feature limitations; this website task did not inspect account settings.
- [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions): covered-service notice/consent, voice as personal information, parent rights and retention duties; narrow exceptions should not become blanket claims.
- [California Attorney General CCPA guide](https://oag.ca.gov/privacy/ccpa): coverage and child protections depend on applicability. It does not establish TJ’s compliance or address every state.

## Presentation contract

Keep the red shield and short no-advertising statement. Use brief purpose-led commitments, visible development/verification status, and tap/keyboard disclosures. Scaffolding means enough help for the next step, illustrated by the demo’s counting clue and another try. Keep detailed legal/data information on the privacy page. Never hide a material qualifier inside a tooltip or add privacy explanations to the simulated app screen.
