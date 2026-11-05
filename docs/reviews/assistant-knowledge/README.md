# Shared RealityNG assistant — implementation review

Depends on backend safety PR #52 and inactive knowledge-service PR #53. No merge, deployment or activation is authorized by this PR.

Both public landing-page widgets obtain answers from the shared deterministic service. Authenticated chat preserves existing owner-scoped history and sends knowledge_only=true, so cached configuration cannot silently fall back to a live provider when knowledge is disabled. An older or disabled backend returns a safe fallback. Public canned keyword answers and verified-property promises are removed.

Sources and knowledge versions are visible. Conversation loads and replies use generation guards so delayed conversation-A responses cannot populate B. Logout/identity changes clear in-memory chat. Escape closes the nonmodal assistant region and restores focus; the message log announces additions. A nonmodal region intentionally does not trap focus on the page. Mobile navigation offsets and the existing reduced-motion CSS are retained. No microphone, audio, avatar integration, dependency, font or unrelated application changes.

Validation:
- Full unit suite passed before the final focused API additions (322 tests); final focused run passed 13 assistant/API tests. Final required CI runs the entire current suite.
- TypeScript, full ESLint and production build passed locally. No font configuration was changed.
- Production dependency audit: 0 high/critical, 5 inherited moderate findings; no dependency changes.
- Public B2C/B2B browser tests passed at 320/390/768/1440, including panel bounds, Escape, restored focus, source citations and scoped axe checks.
- Authenticated fixture browser checks cover knowledge-only requests, mobile navigation clearance, source rendering, Escape and axe at the same widths.

Browser tests intercept APIs using isolated fixtures, never real accounts or production data. Screenshots/reports are uploaded in CI under the existing property-detail-layout evidence artifact alongside the original responsive checks. Run npm run build, then npx playwright test --config=playwright.assistant.config.ts. The existing property layout suite remains enabled.

Knowledge publication and service activation remain separate CTO approval gates. Commercial terms, retention commitments and support SLAs stay unpublished. The female portrait concept is a separate artwork-only PR; this implementation retains the orb.


## Demo/knowledge compatibility correction — 5 November 2026

The existing demo is an independent server capability: enabled=true, provider_mode=demo, demo_enabled=true allows demo replies even when knowledge_enabled=false. Both interfaces explicitly select the advertised mode. Public demo replies use the stateless /assistant/demo/ route and existing server responder; authenticated demo requests send demo_only=true, knowledge_only=false and retain existing owner-scoped demo history. They cannot invoke a paid provider or the new knowledge service. Knowledge-mode requests remain knowledge_only=true and are never retried or silently downgraded after an error. Global disable, expired/revoked native enrollment, property visibility and ownership remain enforced.

No default live-model mode is enabled and no policy/retention change is introduced. Missing/unsupported capabilities still fail closed. Tests include the approved release combination in public B2C/B2B and authenticated browsers, in addition to retained knowledge-enabled cases. The approved release remains paused; no merge, deployment or feature activation is authorized by the correction.
