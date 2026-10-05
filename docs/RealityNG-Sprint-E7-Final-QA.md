# RealityNG Sprint E7 — final cross-role QA

Date: 5 October 2026 (Africa/Lagos).

Status: pre-merge QA passed; release and closure require protected PR checks, merged Vercel deployment, and production regression.

## Scope and environment

The E7 worktree is based on frontend main `e92c4350ca69226568042675ee6a719dca51ca24`. QA uses a clean backend worktree at `bf9a509`, with frontend/backend on loopback ports 3007/58007 and PostgreSQL/Redis/MinIO on 55432/56379/59000. The final backend runtime is one task-scoped Linux Docker container mounting that clean source read-only, with Django 5.2.17 and Pillow 12.3.0. Fixtures are seeded inside that container and supplied through the existing synthetic-only seed-file guard. No production customer data is changed.

The production frontend server is `.next/standalone/server.js`. `scripts/start-e2e-standalone.mjs` builds, copies public/static assets into the standalone directory, and starts it bound to loopback; `--build-only` prepares assets separately. Subsequent browser runs reuse that completed build via `REALITYNG_E2E_FRONTEND_COMMAND='node .next/standalone/server.js'`. The ten-minute managed startup budget includes the build; a completed standalone server started in 801ms. Backend worktree, Python, Daphne command, and ports are selectable. All permission and smoke probes honor the selected backend port.

The incomplete dependency install was preserved outside the worktree at `C:\Dev\realityng-e7-node_modules-incomplete`. Generated Playwright assets are excluded from lint. Unrelated primary-checkout files, guided-search/phone stash, remote WIP branch, and backend user changes are preserved.

## Fixes

- Hide the decorative property-card arrow from assistive technology; the existing link supplies its accessible name.
- Replace low-contrast gold application/request labels and unread badges with existing dark green brand tokens. Loaded Buyer dashboard axe scans exposed this contrast defect.
- Raise the buyer assistant above mobile navigation.
- Let the property-form progress grid shrink on narrow screens.
- Constrain the populated message list to one shrinkable grid column, eliminating 13px of whole-page overflow at 360px.
- Constrain the account-settings grid and sidebar so its horizontal navigation scrolls within the page at 360px.
- Align provider/inspector navigation expectations with the 360px mobile breakpoint and compliance QA with the existing two-step signup flow.
- Align realtime QA with the current connection label and named notification control; wait for the expected denial rather than inspecting its asynchronous console event immediately.
- Scope realtime delivery and reconnect deduplication to message articles, excluding the matching sidebar preview.
- Fetch buyer inspection reports only after the request is completed (the backend approval transition), showing the pending-report state beforehand. Assert that active requests never probe the unpublished report endpoint.
- Wait for network requests and protected-route loading to settle before overflow checks, axe scans, and evidence captures. Split the long buyer/owner batch into independently managed fixtures while retaining the 120-second test limit.
- Exercise the newly assigned Inspector's empty draft-report state with an explicit 404 expectation for its report URL and a visible create-draft control; unexpected errors still fail QA.
- Preserve the existing App Router hook typing corrections needed by the production build.

## Coverage

| Persona | Representative routes and states |
| --- | --- |
| Public | Home, professional entry, property list/detail, service directory/provider detail, sign-in/signup, disclosures and registration consent |
| Buyer | Dashboard, saved properties, inbox/thread, notifications, profile/preferences, applications/viewings, transactions/escrow, financing |
| Landlord | Dashboard, inventory, create/edit form, leads, messages, notifications, verification, profile |
| Agent | Dashboard, assigned inventory, leads/detail, messages, notifications, verification, profile; revoked assignment boundaries |
| Provider | Artisan dashboard, profile, portfolio, quote requests, reviews, complaints/appeals, shared messages/settings |
| Inspector | Dashboard, assignments, active detail/private evidence, stale/reassigned detail denial, shared messages/settings |
| Admin | Overview, verification, inspections/requests/walkthroughs/reports, service moderation, payments/escrow, financing, construction |

Chrome 154.0.8037.95 covers 1440, 1366, 1280, 1024, 768, 390, 375, and 360px. Edge 154.0.4258.53 covers representative 1440, 390, and 360px using its actual executable. Edge uses the existing logical project names; the executable distinguishes the browser. Safari/iOS and manual screen-reader testing remain gaps.

Axe scans use WCAG 2 A/AA and 2.1 A/AA tags, blocking serious/critical violations. Public and expanded persona scans run at representative 1440/390px; overflow and role navigation cover the full Chrome width matrix. Keyboard checks cover mobile menu Escape/focus return, public assistant input focus, buyer assistant keyboard open/close and focus return, and reduced-motion content/animation behavior. Unit coverage also exercises dialog focus trapping, forms, pending/error/empty states, and motion preferences.

Permission coverage includes anonymous protected-route denial, revoked manager authority, stale Inspector assignment denial, private signed-document access for authorized users and denial for nonparticipants, and WebSocket authentication/nonparticipant boundaries.

The property-detail network guard expects exactly three data requests: detail, public walkthroughs, and one similar-inventory list. The separate global `/users/me/` authentication probe is excluded from this page-data contract. Existing unit coverage also asserts one similar-inventory request.

## Results

- Complete Linux-backed Chrome run: 288 scheduled; 134 passed, 145 intentional viewport/persona skips, nine failures (eight unpublished-report probes and one ambiguous realtime selector).
- After correcting those two causes, all nine failed checks passed: responsive inspections at all eight widths and realtime delivery, notifications, reconnect/recovery, deduplication, token subprotocols, and nonparticipant denial. The targeted rerun had seven intentional non-desktop realtime skips. Combined matrix evidence: all 143 executable checks passed; this is a complete run plus a targeted correction rerun, not a fresh single clean run.
- Typecheck and lint: passed.
- Unit tests: 67 files, 239 tests passed.
- Production dependency audit: zero vulnerabilities.
- Standalone production build: passed and served the focused browser rerun.
- Representative Edge run: 61 passed, 17 intentional skips, zero failures (11 minutes).

Local logs and traces are retained under ignored `test-artifacts/`, `test-results/`, and `playwright-report/`. Interrupted runs and earlier failures are not closure evidence.

Concurrent Chrome/Edge runs produced notification handshake failures and delayed Daphne shutdown warnings on the local Windows stack. The final gate runs browsers sequentially. This is not a production capacity measurement.

The old Windows venv and QA image used Django 5.1.15/Pillow 10.4.0. Production was independently checked and uses Django 5.2.17/Pillow 12.3.0, satisfying the current source requirements. The final QA runtime uses those current versions. A local Docker engine failure during image preparation was recovered without deleting volumes or changing unrelated source files.

## Production checks and remaining debt

Fresh read-only checks returned HTTP 200 for home, properties, sign-in, forgot-password, and API health; public property count remained zero. GitHub recorded successful frontend production deployment `e92c435…`. Production containers were healthy with one Daphne replica. Backup completed successfully at 02:19:56 WAT on 5 October; backup freshness and host monitoring units reported success, with timers active.

Backend release attribution differs: `/app/.deployed-git-sha` reports `bc09a45b067a1ec40fbbbd7fabafc31ac5322b9e`, Sentry release/environment report `ebdedff…`/production with a configured DSN, and legacy `/app/.release-commit` reports `161a741…`. Sentry event receipt/alert routing was not exercised. These observations establish configured monitoring and current host health, not consistent release attribution or a verified end-to-end alert.

Permanent separate staging remains required before controlled beta; the same-host prebeta stack is temporary. Existing product debt includes native verification prompts, unsupported custom admin workflows, financing/escrow/inspector pagination limits, lead pagination/raw assignee IDs, transaction identifiers, and provider/Inspector features absent from current API contracts. Security follow-ups remain tracked in the Sprint C register. No new capacity measurement or production load test was performed; the documented 10-active-user mixed workload and 50-socket assumptions are unchanged.

Backend draft PR #30 remains open and unmerged. Guided search/phone UX, Daphne scaling, and Sprint F are outside this change.

## Release

PR, merge SHA, final deployment, production regression, and Sprint F readiness: pending.
